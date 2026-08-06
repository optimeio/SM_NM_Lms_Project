import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Course from './models/Course.js';
import Progress from './models/Progress.js';

// Resolve __dirname first so dotenv loads backend/.env correctly
// regardless of which directory the process is started from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Ensure local persistence directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use('/courses', express.static(path.join(__dirname, 'courses')));

// ----------------------------------------------------
// MONGODB ATLAS CONNECTION SETUP
// ----------------------------------------------------
const primaryURI = process.env.MONGODB_URI;
const fallbackURI = process.env.MONGODB_URI_FALLBACK;

async function syncManifestsToMongoDB() {
  if (mongoose.connection.readyState !== 1) return;
  const coursesDir = path.join(__dirname, 'courses');
  if (!fs.existsSync(coursesDir)) return;
  try {
    const folders = fs.readdirSync(coursesDir);
    let synced = 0;
    for (const folder of folders) {
      const manifestPath = path.join(coursesDir, folder, 'manifest.json');
      if (!fs.existsSync(manifestPath)) continue;
      try {
        const courseObj = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (!courseObj || !courseObj.course_unique_code) continue;

        // Also load midQuiz.json and finalQuiz.json if they exist and are more complete
        const midQuizPath = path.join(coursesDir, folder, 'midQuiz.json');
        const finalQuizPath = path.join(coursesDir, folder, 'finalQuiz.json');
        if (fs.existsSync(midQuizPath)) {
          try {
            const mq = JSON.parse(fs.readFileSync(midQuizPath, 'utf8'));
            if (mq && mq.questions && mq.questions.length > 0) courseObj.midQuiz = mq;
          } catch (e) { /* ignore invalid json */ }
        }
        if (fs.existsSync(finalQuizPath)) {
          try {
            const fq = JSON.parse(fs.readFileSync(finalQuizPath, 'utf8'));
            if (fq && fq.questions && fq.questions.length > 0) courseObj.finalQuiz = fq;
          } catch (e) { /* ignore invalid json */ }
        }

        await Course.findOneAndUpdate(
          { course_unique_code: courseObj.course_unique_code },
          courseObj,
          { upsert: true, new: true }
        );

        // Also update memoryCourses so in-memory is consistent
        const idx = memoryCourses.findIndex(c => c.course_unique_code === courseObj.course_unique_code);
        if (idx >= 0) memoryCourses[idx] = courseObj;
        else memoryCourses.push(courseObj);

        synced++;
      } catch (err) {
        console.warn(`Could not sync manifest for ${folder}:`, err.message);
      }
    }
    if (synced > 0) console.log(`🔄 Synced ${synced} course manifest(s) from disk → MongoDB (quiz/video data updated).`);
  } catch (e) {
    console.warn('Could not sync manifests to MongoDB:', e.message);
  }
}

async function connectDatabase() {
  if (primaryURI && !primaryURI.includes('<db_password>')) {
    try {
      await mongoose.connect(primaryURI);
      console.log('✅ Connected to MongoDB Atlas via Primary SRV Connection');
      // Sync disk manifests → MongoDB so any manual JSON edits take effect
      await syncManifestsToMongoDB();
      return;
    } catch (err) {
      console.warn('⚠️ Primary MongoDB Connection error:', err.message);
    }
  }

  if (fallbackURI && !fallbackURI.includes('<db_password>')) {
    try {
      await mongoose.connect(fallbackURI);
      console.log('✅ Connected to MongoDB Atlas via Seed List Fallback Connection');
      // Sync disk manifests → MongoDB so any manual JSON edits take effect
      await syncManifestsToMongoDB();
      return;
    } catch (err) {
      console.warn('⚠️ Fallback MongoDB Connection error:', err.message);
    }
  }

  console.log('ℹ️ MongoDB credentials contain <db_password> placeholder. Backend server is fully initialized & active on port 5000.');
}

connectDatabase();

// Default Admin User
const DEFAULT_ADMIN = {
  _id: 'admin-1',
  fullName: 'SM Groups Administrator',
  email: 'thesmgroups@gmail.com',
  password: 'TSMGPVT@2026',
  role: 'admin',
  college: 'The SM Groups',
  department: 'Administration'
};

// Global stores (backed by MongoDB and disk files)
let memoryUsers = [DEFAULT_ADMIN];
let memoryCourses = [];
let userProgressStore = {};

// Helper functions for persistent local file sync
function saveUsersToFile() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(memoryUsers, null, 2));
  } catch (err) {
    console.error('Error saving users to disk:', err);
  }
}

function saveProgressToFile() {
  try {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(userProgressStore, null, 2));
  } catch (err) {
    console.error('Error saving progress to disk:', err);
  }
}

function loadPersistentData() {
  // 1. Load users from users.json
  if (fs.existsSync(USERS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        memoryUsers = data;
        if (!memoryUsers.some(u => u.email === DEFAULT_ADMIN.email)) {
          memoryUsers.unshift(DEFAULT_ADMIN);
        }
      }
    } catch (e) {
      console.warn('Could not read users.json:', e.message);
    }
  }

  // 2. Load progress from progress.json
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
      if (data && typeof data === 'object') {
        userProgressStore = data;
      }
    } catch (e) {
      console.warn('Could not read progress.json:', e.message);
    }
  }

  // 3. Scan physical backend/courses directory for published course manifests
  const coursesDir = path.join(__dirname, 'courses');
  if (fs.existsSync(coursesDir)) {
    try {
      const courseFolders = fs.readdirSync(coursesDir);
      for (const folder of courseFolders) {
        const manifestPath = path.join(coursesDir, folder, 'manifest.json');
        if (fs.existsSync(manifestPath)) {
          try {
            const courseObj = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            if (courseObj && courseObj.course_unique_code) {
              const pptsFolder = path.join(coursesDir, folder, 'ppts');
              if (fs.existsSync(pptsFolder) && (!courseObj.ppts || courseObj.ppts.length === 0)) {
                const pptFiles = fs.readdirSync(pptsFolder).filter(f => !f.startsWith('.'));
                courseObj.ppts = pptFiles.map(f => `/courses/${folder}/ppts/${f}`);
              }
              const vidsFolder = path.join(coursesDir, folder, 'videos');
              if (fs.existsSync(vidsFolder) && (!courseObj.videos || courseObj.videos.length === 0)) {
                const vidFiles = fs.readdirSync(vidsFolder).filter(f => !f.startsWith('.'));
                courseObj.videos = vidFiles.map(f => `/courses/${folder}/videos/${f}`);
              }
              const existingIdx = memoryCourses.findIndex(c => c.course_unique_code === courseObj.course_unique_code);
              if (existingIdx >= 0) {
                memoryCourses[existingIdx] = courseObj;
              } else {
                memoryCourses.push(courseObj);
              }
            }
          } catch (err) {
            console.warn(`Could not read manifest in ${folder}:`, err.message);
          }
        }
      }
    } catch (e) {
      console.warn('Could not scan courses directory:', e.message);
    }
  }

  console.log(`📁 Loaded local persistent data: ${memoryUsers.length} Users, ${memoryCourses.length} Courses, ${Object.keys(userProgressStore).length} Student Progress Records.`);
}

loadPersistentData();


// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// 1. Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date()
  });
});

// 2. Auth: Student Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, phone, gender, password, college, department, year, district } = req.body;
    
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Full name, email, and password are required.' });
    }

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const newUser = await User.create({
        fullName,
        email: email.toLowerCase(),
        phone,
        gender,
        password,
        college,
        department,
        year,
        district,
        role: 'student'
      });

      // Keep local memory & persistent backup in sync
      const userObj = newUser.toObject ? newUser.toObject() : newUser;
      memoryUsers.push(userObj);
      saveUsersToFile();

      return res.status(201).json({ success: true, user: newUser });
    } else {
      const existing = memoryUsers.find(u => u.email === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ message: 'User with this email already exists.' });
      }

      const newUser = {
        _id: `user-${Date.now()}`,
        fullName,
        email: email.toLowerCase(),
        phone,
        gender,
        password,
        college,
        department,
        year,
        district,
        role: 'student'
      };
      memoryUsers.push(newUser);
      saveUsersToFile();
      return res.status(201).json({ success: true, user: newUser });
    }
  } catch (err) {
    console.error('Registration API Error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// 3. Auth: Login (Student & Admin)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Email/Register Number and Password are required.' });
    }

    const inputUser = username.trim().toLowerCase();
    const inputPass = password.trim();

    // Admin Credentials Authentication
    if (inputUser === 'thesmgroups@gmail.com' || inputUser === 'admin@smgroups.com') {
      if (inputPass === 'TSMGPVT@2026') {
        const adminObj = {
          _id: 'admin-1',
          fullName: 'SM Groups Administrator',
          email: 'thesmgroups@gmail.com',
          role: 'admin',
          college: 'The SM Groups',
          department: 'Administration'
        };
        return res.json({ success: true, user: adminObj });
      } else {
        return res.status(401).json({ message: 'Invalid Admin Password.' });
      }
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({
        $or: [{ email: inputUser }, { phone: inputUser }]
      });

      if (!user) {
        return res.status(404).json({ message: 'No registered user found with these credentials.' });
      }

      if (user.password !== inputPass) {
        return res.status(401).json({ message: 'Incorrect password.' });
      }

      return res.json({ success: true, user });
    } else {
      const user = memoryUsers.find(u => u.email === inputUser || u.phone === inputUser);
      if (!user) {
        return res.status(404).json({ message: 'No registered user found with these credentials.' });
      }

      if (user.password !== inputPass) {
        return res.status(401).json({ message: 'Incorrect password.' });
      }

      return res.json({ success: true, user });
    }
  } catch (err) {
    console.error('Login API Error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// ----------------------------------------------------
// TOKEN RETRIEVAL & REFRESH ENDPOINTS (/api/v1/lms/client/token/)
// ----------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'sm_nm_lms_secret_key_2026';
const VALID_CLIENT_KEYS = [process.env.CLIENT_KEY, '59e8bb42f89d5ee93ff466be97022427', 'lms_client_key_2026'].filter(Boolean);
const VALID_CLIENT_SECRETS = [process.env.CLIENT_SECRET, 'f7a761767124aef8b904c49b52a555d6', 'lms_client_secret_2026'].filter(Boolean);

app.post(['/lms/client/token/', '/api/lms/client/token/', '/api/v1/lms/client/token/'], (req, res) => {
  const body = req.body || {};
  const client_key = (body.client_key || body.clientKey || '').trim();
  const client_secret = (body.client_secret || body.clientSecret || '').trim();
  
  if (!client_key || !client_secret) {
    return res.status(400).json({ status: false, message: 'client_key and client_secret are required.' });
  }

  const isValidKey = VALID_CLIENT_KEYS.includes(client_key);
  const isValidSecret = VALID_CLIENT_SECRETS.includes(client_secret);

  if (!isValidKey || !isValidSecret) {
    return res.status(401).json({ status: false, message: 'Invalid client credentials.' });
  }

  const access = jwt.sign({ client_key, type: 'access' }, JWT_SECRET, { expiresIn: '1h' });
  const refresh = jwt.sign({ client_key, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({ status: true, access, refresh, expires_in: 3600 });
});

app.post(['/lms/client/token/refresh/', '/api/lms/client/token/refresh/', '/api/v1/lms/client/token/refresh/'], (req, res) => {
  const { refresh } = req.body || {};
  if (!refresh) {
    return res.status(400).json({ status: false, message: 'refresh token is required.' });
  }

  try {
    const decoded = jwt.verify(refresh, JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ status: false, message: 'Invalid token type.' });
    }
    const access = jwt.sign({ client_key: decoded.client_key, type: 'access' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ status: true, access, expires_in: 3600 });
  } catch (err) {
    return res.status(401).json({ status: false, message: 'Invalid or expired refresh token.' });
  }
});

// 3b. User Profile Details Endpoint
app.get('/api/users/profile', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email query parameter is required.' });
    }
    const targetEmail = String(email).trim().toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: targetEmail });
      if (user) {
        return res.json({ success: true, user });
      }
    }

    const user = memoryUsers.find(u => u.email && u.email.toLowerCase() === targetEmail);
    if (user) {
      return res.json({ success: true, user });
    }

    return res.status(404).json({ message: 'User not found.' });
  } catch (err) {
    console.error('Profile API Error:', err);
    res.status(500).json({ message: 'Server error fetching user profile.' });
  }
});

// 4. Admin: Get Registered Users List (Students Only)
app.get('/api/admin/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
      return res.json({ success: true, users });
    } else {
      const studentsOnly = memoryUsers.filter(u => u.role !== 'admin');
      return res.json({ success: true, users: studentsOnly });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// 4b. Admin: Assign Courses to Student
app.post('/api/admin/users/:identifier/assign', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { courses } = req.body || {};
    const assignedCoursesList = Array.isArray(courses) ? courses : [];
    const mainCode = assignedCoursesList.length > 0 ? assignedCoursesList[0] : '';

    const decodedId = decodeURIComponent(identifier).toLowerCase();

    // 1. Update in MongoDB if connected
    let updatedUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const query = mongoose.Types.ObjectId.isValid(decodedId) 
          ? { _id: decodedId }
          : { email: decodedId };

        updatedUser = await User.findOneAndUpdate(
          query,
          { assignedCourses: assignedCoursesList, course_unique_code: mainCode },
          { new: true }
        );
      } catch (err) {
        console.warn('MongoDB assign error:', err.message);
      }
    }

    // 2. Update in memoryUsers array
    const memIdx = memoryUsers.findIndex(u => 
      String(u._id).toLowerCase() === decodedId || (u.email && u.email.toLowerCase() === decodedId)
    );
    if (memIdx >= 0) {
      memoryUsers[memIdx].assignedCourses = assignedCoursesList;
      memoryUsers[memIdx].course_unique_code = mainCode;
    } else if (updatedUser) {
      memoryUsers.push(updatedUser.toObject ? updatedUser.toObject() : updatedUser);
    }
    saveUsersToFile();

    return res.json({
      success: true,
      message: 'Courses assigned successfully.',
      user: updatedUser || (memIdx >= 0 ? memoryUsers[memIdx] : null)
    });
  } catch (err) {
    console.error('Assign Courses Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to assign courses.' });
  }
});

// 4c. Admin: Update Student Details
app.put('/api/admin/users/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const updateData = req.body || {};
    const decodedId = decodeURIComponent(identifier).toLowerCase();

    let updatedUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const query = mongoose.Types.ObjectId.isValid(decodedId) 
          ? { _id: decodedId }
          : { email: decodedId };

        updatedUser = await User.findOneAndUpdate(query, updateData, { new: true });
      } catch (err) {
        console.warn('MongoDB update user error:', err.message);
      }
    }

    const memIdx = memoryUsers.findIndex(u => 
      String(u._id).toLowerCase() === decodedId || (u.email && u.email.toLowerCase() === decodedId)
    );
    if (memIdx >= 0) {
      memoryUsers[memIdx] = { ...memoryUsers[memIdx], ...updateData };
    }
    saveUsersToFile();

    return res.json({
      success: true,
      message: 'Student details updated successfully.',
      user: updatedUser || (memIdx >= 0 ? memoryUsers[memIdx] : null)
    });
  } catch (err) {
    console.error('Update Student Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update student.' });
  }
});

// 4d. Admin: Delete Student
app.delete('/api/admin/users/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const decodedId = decodeURIComponent(identifier).toLowerCase();

    if (mongoose.connection.readyState === 1) {
      try {
        const query = mongoose.Types.ObjectId.isValid(decodedId) 
          ? { _id: decodedId }
          : { email: decodedId };

        await User.findOneAndDelete(query);
      } catch (err) {
        console.warn('MongoDB delete user error:', err.message);
      }
    }

    memoryUsers = memoryUsers.filter(u => 
      String(u._id).toLowerCase() !== decodedId && (u.email && u.email.toLowerCase() !== decodedId)
    );
    saveUsersToFile();

    return res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (err) {
    console.error('Delete Student Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
});

// Helper middleware to authenticate bearer token if provided
const authenticateTokenHeader = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
    try {
      jwt.verify(token, JWT_SECRET);
    } catch {
      // Continue for public reads if invalid token, or enforce if strict
    }
  }
  next();
};


const TNSKILL_BASE = 'https://sandbox-api.skilldevelopment.tn.gov.in';


// Helper to save base64 videos/ppts to physical files on disk
function savePhysicalFiles(course_unique_code, videos, ppts) {
  const safeFolderCode = course_unique_code.replace(/[^a-zA-Z0-9_-]/g, '_');
  const courseDir = path.join(__dirname, 'courses', safeFolderCode);
  const videosDir = path.join(courseDir, 'videos');
  const pptsDir = path.join(courseDir, 'ppts');

  if (!fs.existsSync(courseDir)) fs.mkdirSync(courseDir, { recursive: true });
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
  if (!fs.existsSync(pptsDir)) fs.mkdirSync(pptsDir, { recursive: true });

  const savedVideos = (videos || []).map((vidData, idx) => {
    const vidFileName = `video_${idx + 1}.mp4`;
    const vidFilePath = path.join(videosDir, vidFileName);

    // Save base64 encoded video to disk and return the URL path
    if (typeof vidData === 'string' && vidData.startsWith('data:video')) {
      try {
        const base64Data = vidData.split(';base64,').pop();
        fs.writeFileSync(vidFilePath, base64Data, { encoding: 'base64' });
        return `/courses/${safeFolderCode}/videos/${vidFileName}`;
      } catch (e) {
        console.error(`Error saving ${vidFileName}:`, e);
        return vidData; // Return original data if save fails
      }
    }

    // If it's already a URL path (http/https or /courses/...), keep it as-is
    if (typeof vidData === 'string' && (vidData.startsWith('http') || vidData.startsWith('/courses/'))) {
      return vidData;
    }

    // Empty slot — return empty string (don't generate placeholder paths)
    return '';
  });

  const savedPpts = (ppts || []).map((pptData, idx) => {
    const pptFileName = `presentation_${idx + 1}.pptx`;
    const pptFilePath = path.join(pptsDir, pptFileName);

    // Save base64 encoded PPT/PDF to disk and return the URL path
    if (typeof pptData === 'string' && pptData.startsWith('data:')) {
      try {
        const base64Data = pptData.split(';base64,').pop();
        fs.writeFileSync(pptFilePath, base64Data, { encoding: 'base64' });
        return `/courses/${safeFolderCode}/ppts/${pptFileName}`;
      } catch (e) {
        console.error(`Error saving ${pptFileName}:`, e);
        return pptData; // Return original data if save fails
      }
    }

    // If it's already a URL path (http/https or /courses/...), keep it as-is
    if (typeof pptData === 'string' && (pptData.startsWith('http') || pptData.startsWith('/courses/'))) {
      return pptData;
    }

    // Empty slot — return empty string (don't generate placeholder paths)
    return '';
  });

  return { savedVideos, savedPpts, courseDir, safeFolderCode };
}

// ----------------------------------------------------
// SAVE DRAFT ENDPOINT: POST /lms/client/course/save-draft/
// Saves course with is_active: false (draft, not visible to students)
// ----------------------------------------------------
app.post(['/lms/client/course/save-draft/', '/api/lms/client/course/save-draft/'], authenticateTokenHeader, async (req, res) => {
  try {
    const body = req.body || {};
    const { course_unique_code, course_name } = body;

    if (!course_unique_code || (!course_name && !body.title)) {
      return res.status(400).json({ status: false, message: 'course_unique_code and course_name are required.' });
    }

    // Extract & save physical media files to disk first, converting Base64 to web URLs
    const { savedVideos, savedPpts, courseDir, safeFolderCode } = savePhysicalFiles(course_unique_code, body.videos, body.ppts);

    const courseData = {
      course_unique_code,
      course_name: course_name || body.title,
      course_description: body.course_description || body.content || '',
      course_image_url: body.course_image_url || body.image || '',
      instructor: body.instructor || 'Instructor',
      duration: String(body.duration || '0'),
      number_of_videos: String(body.number_of_videos || (body.videos ? body.videos.length : '12')),
      language: body.language || 'english',
      main_stream: body.main_stream || 'engineering',
      sub_stream: body.sub_stream || 'cse',
      category: body.category || 'General',
      system_requirements: body.system_requirements || '',
      has_subtitles: String(body.has_subtitles ?? true),
      reference_id: body.reference_id || `DRAFT-${Date.now()}`,
      course_type: body.course_type || 'ONLINE',
      location: body.location || '',
      is_active: false,        // DRAFT — hidden from students
      approval_status: false,  // DRAFT — not approved
      videos: savedVideos,     // Clean paths
      ppts: savedPpts,         // Clean paths
      folderPath: courseDir,
      midQuiz: body.midQuiz || { title: 'Mid-Course Quiz (After Video 6)', questions: [] },
      finalQuiz: body.finalQuiz || { title: 'Final Assessment Quiz (After Video 12)', questions: [] }
    };

    // Write complete course payload output files into project directory
    fs.writeFileSync(path.join(courseDir, 'manifest.json'), JSON.stringify(courseData, null, 2));
    fs.writeFileSync(path.join(courseDir, 'course_content.json'), JSON.stringify(body.course_content || [], null, 2));
    fs.writeFileSync(path.join(courseDir, 'course_objective.json'), JSON.stringify(body.course_objective || [], null, 2));
    fs.writeFileSync(path.join(courseDir, 'midQuiz.json'), JSON.stringify(courseData.midQuiz, null, 2));
    fs.writeFileSync(path.join(courseDir, 'finalQuiz.json'), JSON.stringify(courseData.finalQuiz, null, 2));

    // Save to MongoDB
    if (mongoose.connection.readyState === 1) {
      const saved = await Course.findOneAndUpdate(
        { course_unique_code },
        courseData,
        { upsert: true, new: true }
      );
      return res.status(200).json({ status: true, message: 'Course saved as draft.', draft: true, course: saved });
    }

    // Fallback: sync memory store
    const idx = memoryCourses.findIndex(c => c.course_unique_code === course_unique_code);
    if (idx >= 0) memoryCourses[idx] = { ...memoryCourses[idx], ...courseData };
    else memoryCourses.push(courseData);

    return res.status(200).json({ status: true, message: 'Course saved as draft (local).', draft: true, course: courseData });
  } catch (err) {
    console.error('Save Draft Error:', err);
    return res.status(500).json({ status: false, message: 'Server error saving draft.' });
  }
});

// ----------------------------------------------------
// TNSKILL PROXY: POST /api/student/subscribe
// Forwards to: https://sandbox-api.tnskill.tn.gov.in/skilldevelopment/api/course/subscribe/
// ----------------------------------------------------
app.post(['/api/student/subscribe', '/lms/client/course/subscribe/'], async (req, res) => {
  const body = req.body || {};
  const authHeader = req.headers['authorization'] || '';
  try {
    const tnRes = await fetch(`${TNSKILL_BASE}/skilldevelopment/api/course/subscribe/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`
      },
      body: JSON.stringify(body)
    });
    if (tnRes.ok) {
      const tnData = await tnRes.json().catch(() => ({}));
      return res.status(200).json({
        subscription_registration_status: tnData.subscription_registration_status ?? true,
        subscription_reference_id: tnData.subscription_reference_id || `LOCAL-${Date.now()}`,
        source: 'tnskill'
      });
    }
    // Fallback: local subscription success
    return res.status(200).json({
      subscription_registration_status: true,
      subscription_reference_id: `LOCAL-${Date.now()}`,
      source: 'local_fallback'
    });
  } catch {
    return res.status(200).json({
      subscription_registration_status: true,
      subscription_reference_id: `LOCAL-${Date.now()}`,
      source: 'local_fallback'
    });
  }
});

// ----------------------------------------------------
// TNSKILL PROXY: POST /api/student/course-access
// Forwards to: https://sandbox-api.tnskill.tn.gov.in/skilldevelopment/api/course/access/
// ----------------------------------------------------
app.post(['/api/student/course-access', '/lms/client/course/access/'], async (req, res) => {
  const body = req.body || {};
  const authHeader = req.headers['authorization'] || '';
  try {
    const tnRes = await fetch(`${TNSKILL_BASE}/skilldevelopment/api/course/access/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`
      },
      body: JSON.stringify(body)
    });
    if (tnRes.ok) {
      const tnData = await tnRes.json().catch(() => ({}));
      return res.status(200).json({
        access_status: tnData.access_status ?? true,
        access_url: tnData.access_url || null,
        source: 'tnskill'
      });
    }
    return res.status(200).json({ access_status: true, access_url: null, source: 'local_fallback' });
  } catch {
    return res.status(200).json({ access_status: true, access_url: null, source: 'local_fallback' });
  }
});

// ----------------------------------------------------
// TNSKILL PROXY: POST /api/student/progress-info
// Forwards to: https://sandbox-api.tnskill.tn.gov.in/skilldevelopment/api/student/progress
// Also checks local MongoDB progress first
// ----------------------------------------------------
app.post(['/api/student/progress-info', '/lms/client/student/progress/'], async (req, res) => {
  const { user_id, course_id } = req.body || {};
  const authHeader = req.headers['authorization'] || '';

  // 1. Check local MongoDB progress
  let localProgress = null;
  try {
    if (mongoose.connection.readyState === 1) {
      localProgress = await Progress.findOne({ user_unique_id: user_id, course_unique_code: course_id });
    } else {
      const key = `${user_id}_${course_id}`;
      localProgress = userProgressStore[key] || null;
    }
  } catch { /* ignore */ }

  // 2. Try TNSkill for authoritative data
  try {
    const tnRes = await fetch(`${TNSKILL_BASE}/skilldevelopment/api/student/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`
      },
      body: JSON.stringify({ user_id, course_id })
    });
    if (tnRes.ok) {
      const tnData = await tnRes.json().catch(() => null);
      if (tnData) {
        return res.status(200).json({ ...tnData, source: 'tnskill' });
      }
    }
  } catch { /* fallback to local */ }

  // 3. Return local progress as fallback
  if (localProgress) {
    return res.status(200).json({
      progress_percentage: String(localProgress.progress_percentage || '0'),
      certificate_issued: String(localProgress.certificate_issued || 'false'),
      assessment_status: String(localProgress.assessment_status || 'false'),
      course_complete: String(localProgress.course_complete || 'false'),
      source: 'local'
    });
  }

  return res.status(200).json({
    progress_percentage: '0',
    certificate_issued: 'false',
    assessment_status: 'false',
    course_complete: 'false',
    source: 'local_default'
  });
});

// ----------------------------------------------------
// COURSE PUBLISH ENDPOINT: POST /lms/client/course/publish/
// ----------------------------------------------------
app.post(['/lms/client/course/publish/', '/api/lms/client/course/publish/'], authenticateTokenHeader, async (req, res) => {

  try {
    const body = req.body || {};
    const {
      course_unique_code,
      course_name,
      course_description,
      course_image_url,
      instructor,
      duration,
      number_of_videos,
      language,
      main_stream,
      sub_stream,
      category,
      system_requirements,
      has_subtitles,
      reference_id,
      course_type,
      location
    } = body;

    if (!course_unique_code || (!course_name && !body.title)) {
      return res.status(400).json({ status: false, message: 'course_unique_code and course_name are required.' });
    }

    // Extract & save physical media files to disk, converting Base64 to web URLs
    const { savedVideos, savedPpts, courseDir, safeFolderCode } = savePhysicalFiles(course_unique_code, body.videos, body.ppts);

    const courseData = {
      course_unique_code,
      course_name: course_name || body.title,
      course_description: course_description || body.content || '',
      course_image_url: course_image_url || body.image || '',
      instructor: instructor || 'Instructor',
      duration: String(duration || '0'),
      number_of_videos: String(number_of_videos || (body.videos ? body.videos.length : '12')),
      language: language || 'english',
      main_stream: main_stream || 'engineering',
      sub_stream: sub_stream || 'cse',
      category: category || body.category || 'General',
      system_requirements: system_requirements || '',
      has_subtitles: String(has_subtitles ?? true),
      reference_id: reference_id || `REF-${Date.now()}`,
      course_type: course_type || 'ONLINE',
      location: location || '',
      is_active: true,
      approval_status: true,
      videos: savedVideos,
      ppts: savedPpts,
      folderPath: courseDir,
      midQuiz: body.midQuiz || { title: 'Mid-Course Quiz (After Video 6)', questions: [] },
      finalQuiz: body.finalQuiz || { title: 'Final Assessment Quiz (After Video 12)', questions: [] }
    };

    // Write complete course payload output files into project directory
    fs.writeFileSync(path.join(courseDir, 'manifest.json'), JSON.stringify(courseData, null, 2));
    fs.writeFileSync(path.join(courseDir, 'course_content.json'), JSON.stringify(body.course_content || [], null, 2));
    fs.writeFileSync(path.join(courseDir, 'course_objective.json'), JSON.stringify(body.course_objective || [], null, 2));
    fs.writeFileSync(path.join(courseDir, 'midQuiz.json'), JSON.stringify(courseData.midQuiz, null, 2));
    fs.writeFileSync(path.join(courseDir, 'finalQuiz.json'), JSON.stringify(courseData.finalQuiz, null, 2));

    // Sync local memoryCourses store
    const idx = memoryCourses.findIndex(c => c.course_unique_code === course_unique_code);
    if (idx >= 0) {
      memoryCourses[idx] = { ...memoryCourses[idx], ...courseData };
    } else {
      memoryCourses.push(courseData);
    }

    if (mongoose.connection.readyState === 1) {
      const updated = await Course.findOneAndUpdate(
        { course_unique_code },
        courseData,
        { upsert: true, new: true }
      );
      return res.status(200).json({
        status: true,
        message: `Course published successfully. Folder created at: backend/courses/${safeFolderCode}`,
        folder_path: courseDir,
        course: updated
      });
    } else {
      return res.status(200).json({
        status: true,
        message: `Course published successfully. Folder created at: backend/courses/${safeFolderCode}`,
        folder_path: courseDir,
        course: courseData
      });
    }
  } catch (err) {
    console.error('Course Publish Error:', err);
    return res.status(500).json({ status: false, message: 'Server error publishing course.' });
  }
});

// ----------------------------------------------------
// COURSES LIST ENDPOINT: GET /lms/client/courses/ & GET /api/v1/lms/client/courses/
// ----------------------------------------------------
app.get([
  '/lms/client/courses/',
  '/api/v1/lms/client/courses/',
  '/api/lms/client/courses/',
  '/api/courses'
], authenticateTokenHeader, async (req, res) => {
  try {
    const { course_unique_code, is_active, approval_status } = req.query;

    let coursesList = [];

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (course_unique_code) filter.course_unique_code = course_unique_code;
      if (is_active !== undefined) filter.is_active = is_active === 'true';
      if (approval_status !== undefined) filter.approval_status = approval_status === 'true';

      // Get all users and their assigned courses for accurate enrollment count
      const allStudents = await User.find({ role: { $ne: 'admin' } }, { assignedCourses: 1, course_unique_code: 1 }).lean().catch(() => []);
      const dbCourses = await Course.find(filter).sort({ createdAt: -1 });
      coursesList = dbCourses.map(c => {
        const code = c.course_unique_code;
        // Count students who have this course assigned OR have progress records
        const assignedCount = allStudents.filter(u =>
          (Array.isArray(u.assignedCourses) && u.assignedCourses.includes(code)) ||
          u.course_unique_code === code
        ).length;
        const trackedCount = Object.values(userProgressStore).filter(p => p.course_unique_code === code).length;
        const enrolledCount = Math.max(assignedCount, trackedCount, 0);
        return {
          name: c.course_name || c.title,
          course_id: c.course_unique_code,
          course_unique_code: c.course_unique_code,
          reference_id: c.reference_id || '',
          course_status: c.is_active,
          is_active: c.is_active,
          approval_status: c.approval_status,
          title: c.course_name || c.title,
          category: c.category,
          instructor: c.instructor,
          course_image_url: c.course_image_url,
          course_description: c.course_description,
          videos: c.videos || [],
          ppts: c.ppts || [],
          midQuiz: c.midQuiz || { title: 'Mid-Course Quiz (After Video 6)', questions: [] },
          finalQuiz: c.finalQuiz || { title: 'Final Assessment Quiz (After Video 12)', questions: [] },
          studentsEnrolled: enrolledCount,
          rating: 4.8
        };
      });
    } else {
      const totalStudentsCount = memoryUsers.filter(u => u.role !== 'admin').length || 1;
      let filtered = [...memoryCourses];
      if (course_unique_code) {
        filtered = filtered.filter(c => c.course_unique_code === course_unique_code);
      }
      if (is_active !== undefined) {
        const activeBool = is_active === 'true';
        filtered = filtered.filter(c => Boolean(c.is_active) === activeBool);
      }
      if (approval_status !== undefined) {
        const approvedBool = approval_status === 'true';
        filtered = filtered.filter(c => Boolean(c.approval_status) === approvedBool);
      }
      coursesList = filtered.map(c => {
        const code = c.course_unique_code;
        // Count students who have this course assigned OR have progress records
        const assignedCount = memoryUsers.filter(u =>
          u.role !== 'admin' && (
            (Array.isArray(u.assignedCourses) && u.assignedCourses.includes(code)) ||
            u.course_unique_code === code
          )
        ).length;
        const trackedCount = Object.values(userProgressStore).filter(p => p.course_unique_code === code).length;
        const enrolledCount = Math.max(assignedCount, trackedCount, 0);
        return {
          name: c.course_name,
          course_id: c.course_unique_code,
          course_unique_code: c.course_unique_code,
          reference_id: c.reference_id || '',
          course_status: c.is_active,
          is_active: c.is_active,
          approval_status: c.approval_status,
          title: c.course_name,
          category: c.category,
          instructor: c.instructor,
          course_image_url: c.course_image_url,
          course_description: c.course_description,
          videos: c.videos || [],
          ppts: c.ppts || [],
          midQuiz: c.midQuiz || { title: 'Mid-Course Quiz (After Video 6)', questions: [] },
          finalQuiz: c.finalQuiz || { title: 'Final Assessment Quiz (After Video 12)', questions: [] },
          studentsEnrolled: enrolledCount,
          rating: 4.8
        };
      });
    }

    return res.json({
      success: true,
      courses_list: coursesList,
      courses: coursesList,
      page: 0,
      limit: 20,
      total_count: coursesList.length
    });
  } catch (err) {
    console.error('Courses List Error:', err);
    return res.status(500).json({ status: false, message: 'Failed to fetch courses list.' });
  }
});

// ----------------------------------------------------
// DELETE COURSE ENDPOINT: DELETE /api/admin/courses/:id & /lms/client/course/delete/:id
// ----------------------------------------------------
app.delete([
  '/api/admin/courses/:id',
  '/lms/client/course/delete/:id',
  '/api/lms/client/course/delete/:id'
], authenticateTokenHeader, async (req, res) => {
  try {
    const courseId = req.params.id;

    // Find course first to extract course_unique_code for physical path deletion
    let courseDoc = memoryCourses.find(c => c._id?.toString() === courseId || c.course_unique_code === courseId);
    if (!courseDoc && mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(courseId)) {
        courseDoc = await Course.findById(courseId);
      } else {
        courseDoc = await Course.findOne({ course_unique_code: courseId });
      }
    }

    if (courseDoc) {
      const targetUniqueCode = courseDoc.course_unique_code || courseDoc.course_id;
      if (targetUniqueCode) {
        const safeFolderCode = targetUniqueCode.replace(/[^a-zA-Z0-9_-]/g, '_');
        const courseDir = path.join(__dirname, 'courses', safeFolderCode);
        if (fs.existsSync(courseDir)) {
          try {
            fs.rmSync(courseDir, { recursive: true, force: true });
            console.log(`Successfully deleted physical course folder: ${courseDir}`);
          } catch (dirErr) {
            console.error(`Failed to delete physical course folder at ${courseDir}:`, dirErr);
          }
        }
      }
    }

    if (mongoose.connection.readyState === 1) {
      if (mongoose.Types.ObjectId.isValid(courseId)) {
        await Course.findByIdAndDelete(courseId);
      } else {
        await Course.findOneAndDelete({ course_unique_code: courseId });
      }
    }

    memoryCourses = memoryCourses.filter(c => c._id?.toString() !== courseId && c.course_unique_code !== courseId);

    return res.json({ success: true, status: true, message: 'Course deleted successfully!' });
  } catch (err) {
    console.error('Delete Course Error:', err);
    return res.status(500).json({ success: false, status: false, message: 'Failed to delete course.' });
  }
});

// ----------------------------------------------------
// STUDENT PROGRESS TRACKING & PERSISTENCE ENDPOINTS
// ----------------------------------------------------
const USER_TRACKING_PATHS = [
  '/lms/client/course/xf/user-tracking',
  '/api/v1/lms/client/course/xf/user-tracking',
  '/api/lms/client/course/xf/user-tracking',
  '/lms/client/course/xf/',
  '/api/lms/client/course/xf/',
  '/api/v1/lms/client/course/xf/'
];

app.post(USER_TRACKING_PATHS, authenticateTokenHeader, async (req, res) => {
  try {
    const body = req.body || {};
    const {
      user_unique_id,
      course_unique_code,
      progress_percentage,
      completedVideos,
      midQuizPassed,
      midQuizScore,
      finalQuizPassed,
      finalQuizScore,
      certificate_issued,
      certificate_issued_at,
      assessment_status,
      course_complete,
      total_score
    } = body;

    // Reject empty request body or missing user_unique_id / course_unique_code
    if (!user_unique_id || !course_unique_code) {
      return res.status(400).json({
        status: false,
        message: 'user_unique_id and course_unique_code are required. Kindly do not send empty values or missing required keys.'
      });
    }

    const key = `${user_unique_id}_${course_unique_code}`;
    const existing = userProgressStore[key] || {
      user_unique_id,
      course_unique_code,
      progress_percentage: "0.00",
      completedVideos: 0,
      midQuizPassed: false,
      midQuizScore: 0,
      finalQuizPassed: false,
      finalQuizScore: 0,
      certificate_issued: "false",
      certificate_issued_at: null,
      assessment_status: "false",
      course_complete: "false",
      total_score: "",
      updatedAt: new Date().toISOString()
    };

    // Update only provided non-empty fields
    if (progress_percentage !== undefined && progress_percentage !== "") {
      existing.progress_percentage = String(progress_percentage);
    }
    if (completedVideos !== undefined) {
      existing.completedVideos = Number(completedVideos);
    }
    if (midQuizPassed !== undefined) {
      existing.midQuizPassed = Boolean(midQuizPassed);
    }
    if (midQuizScore !== undefined) {
      existing.midQuizScore = Number(midQuizScore);
    }
    if (finalQuizPassed !== undefined) {
      existing.finalQuizPassed = Boolean(finalQuizPassed);
    }
    if (finalQuizScore !== undefined) {
      existing.finalQuizScore = Number(finalQuizScore);
    }
    if (certificate_issued !== undefined && certificate_issued !== "") {
      existing.certificate_issued = String(certificate_issued);
    }
    if (certificate_issued_at !== undefined) {
      existing.certificate_issued_at = certificate_issued_at;
    }
    if (assessment_status !== undefined && assessment_status !== "") {
      existing.assessment_status = String(assessment_status);
    }
    if (course_complete !== undefined && course_complete !== "") {
      existing.course_complete = String(course_complete);
    }
    if (total_score !== undefined && total_score !== "") {
      existing.total_score = String(total_score);
    }
    existing.updatedAt = new Date().toISOString();

    userProgressStore[key] = existing;
    saveProgressToFile();

    // Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await Progress.findOneAndUpdate(
          { user_unique_id: existing.user_unique_id, course_unique_code: existing.course_unique_code },
          existing,
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.warn('MongoDB Progress Save Error:', dbErr.message);
      }
    }

    // Asynchronously forward progress update to Naan Mudhalvan Sandbox API
    (async () => {
      try {
        const payload = {
          user_unique_id: existing.user_unique_id,
          course_unique_code: existing.course_unique_code
        };
        if (existing.progress_percentage !== undefined && existing.progress_percentage !== "") payload.progress_percentage = String(existing.progress_percentage);
        if (existing.certificate_issued !== undefined && existing.certificate_issued !== "") payload.certificate_issued = String(existing.certificate_issued);
        if (existing.assessment_status !== undefined && existing.assessment_status !== "") payload.assessment_status = String(existing.assessment_status);
        if (existing.course_complete !== undefined && existing.course_complete !== "") payload.course_complete = String(existing.course_complete);
        if (existing.total_score !== undefined && existing.total_score !== "") payload.total_score = String(existing.total_score);

        const nmToken = req.headers['authorization'] || 'Bearer mock_nm_token_2026';
        await fetch('https://sandbox-api.skilldevelopment.tn.gov.in/api/v1/lms/client/course/xf/user-tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': nmToken.startsWith('Bearer ') ? nmToken : `Bearer ${nmToken}`
          },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch {
        // Log & ignore sandbox fetch network timeout gracefully
      }
    })();

    return res.status(200).json({
      status: true,
      message: 'Student course progress updated successfully.',
      data: existing
    });
  } catch (err) {
    console.error('Progress Update Error:', err);
    return res.status(500).json({ status: false, message: 'Server error updating progress.' });
  }
});

// GET /api/user/progress or /lms/client/course/user-tracking to fetch saved student progress
app.get([
  '/api/user/progress',
  '/lms/client/course/user-tracking',
  '/api/v1/lms/client/course/user-tracking'
], authenticateTokenHeader, async (req, res) => {
  try {
    const userId = req.query.user_unique_id || req.query.user_id || req.query.email;

    if (mongoose.connection.readyState === 1) {
      try {
        const query = userId ? { user_unique_id: userId } : {};
        const dbProgress = await Progress.find(query).lean();
        if (dbProgress && dbProgress.length > 0) {
          dbProgress.forEach(p => {
            const k = `${p.user_unique_id}_${p.course_unique_code}`;
            userProgressStore[k] = { ...userProgressStore[k], ...p };
          });
          saveProgressToFile();
        }
      } catch (dbErr) {
        console.warn('MongoDB Progress Fetch Error:', dbErr.message);
      }
    }

    if (!userId) {
      return res.json({ success: true, user_progress: Object.values(userProgressStore) });
    }
    const userProgressList = Object.values(userProgressStore).filter(p => p.user_unique_id === userId);
    return res.json({ success: true, user_progress: userProgressList });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user progress.' });
  }
});

// 6. Quizzes List
app.get('/api/quizzes', async (req, res) => {
  res.json({ success: true, quizzes: [] });
});

// 7. Direct PPT File Download Endpoint
app.get(['/api/courses/:courseCode/ppt/:filename', '/courses/:courseCode/ppts/:filename'], (req, res, next) => {
  const { courseCode, filename } = req.params;
  const safeCode = courseCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeFile = path.basename(filename);
  const filePath = path.join(__dirname, 'courses', safeCode, 'ppts', safeFile);
  if (fs.existsSync(filePath)) {
    return res.download(filePath, safeFile, (err) => {
      if (err && !res.headersSent) {
        return next();
      }
    });
  }
  next();
});

// ----------------------------------------------------
// NAAN MUDHALVAN (TN SKILL) KNOWLEDGE PARTNER APIs
// ----------------------------------------------------

// 8. NM Course Subscribe API
app.post('/nm/api/course/subscribe/', authenticateTokenHeader, async (req, res) => {
  try {
    const { user_id, course_id } = req.body || {};
    
    if (!user_id || !course_id) {
      return res.json({ subscription_registration_status: false });
    }

    // Check if user exists, if not, we create a placeholder so they can be tracked
    let existingUser = memoryUsers.find(u => u._id === user_id || String(u._id) === user_id || u.user_unique_id === user_id);
    if (!existingUser && mongoose.connection.readyState === 1) {
      existingUser = await User.findOne({ 
        $or: [{ _id: user_id }, { user_unique_id: user_id }]
      }).catch(() => null);
    }

    if (!existingUser) {
      const newUser = {
        _id: user_id,
        user_unique_id: user_id,
        fullName: req.body.student_name || 'NM Student',
        email: `${user_id}@nm.student.local`,
        password: 'nm_sso_login',
        college: req.body.college_name || req.body.college_code || '',
        department: req.body.branch_name || '',
        district: req.body.district || '',
        university: req.body.university || '',
        role: 'student',
        assignedCourses: [course_id],
        course_unique_code: course_id
      };
      
      memoryUsers.push(newUser);
      saveUsersToFile();

      if (mongoose.connection.readyState === 1) {
        try {
          await User.create(newUser);
        } catch (e) {
          console.warn('MongoDB NM User creation error:', e.message);
        }
      }
    } else {
      // Update assigned courses if they already exist
      if (!existingUser.assignedCourses) existingUser.assignedCourses = [];
      if (!existingUser.assignedCourses.includes(course_id)) {
        existingUser.assignedCourses.push(course_id);
        existingUser.course_unique_code = course_id;
        saveUsersToFile();
        
        if (mongoose.connection.readyState === 1) {
          await User.updateOne({ _id: existingUser._id }, { assignedCourses: existingUser.assignedCourses, course_unique_code: course_id }).catch(() => {});
        }
      }
    }

    return res.json({
      subscription_registration_status: true,
      subscription_reference_id: `SUB-${Date.now()}`
    });
  } catch (err) {
    console.error('NM Subscribe Error:', err);
    return res.json({ subscription_registration_status: false });
  }
});

// 9. NM Course Access URL API
app.post('/nm/api/course/access/', authenticateTokenHeader, async (req, res) => {
  try {
    const { user_id, course_id } = req.body || {};
    
    if (!user_id || !course_id) {
      return res.json({ access_status: false });
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    const access_url = `${FRONTEND_URL}?sso=true&uid=${encodeURIComponent(user_id)}&cid=${encodeURIComponent(course_id)}`;

    return res.json({
      access_status: true,
      access_url: access_url
    });
  } catch (err) {
    console.error('NM Access Error:', err);
    return res.json({ access_status: false });
  }
});

// 10. NM Student Progress API (Retrieval)
app.post('/nm/api/student/progress', authenticateTokenHeader, async (req, res) => {
  try {
    const { user_id, course_id } = req.body || {};
    
    if (!user_id || !course_id) {
      return res.status(400).json({ message: "Please provide valid user_id/ course_id" });
    }

    const key = `${user_id}_${course_id}`;
    const progress = userProgressStore[key];

    if (progress) {
      return res.json({
        progress_percentage: progress.progress_percentage || "0.00",
        certificate_issued: progress.certificate_issued || "false",
        assessment_status: progress.assessment_status || "false",
        course_complete: progress.course_complete || "false"
      });
    }

    // Default if no progress found yet
    return res.json({
      progress_percentage: "0.00",
      certificate_issued: "false",
      assessment_status: "false",
      course_complete: "false"
    });
  } catch (err) {
    console.error('NM Student Progress Error:', err);
    return res.status(500).json({ message: "Server error retrieving progress" });
  }
});

// 11. NM Student Token Check
app.get('/lms/client/course/student/check/', (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({
      detail: "Authentication credentials were not provided.",
      code: "not_authenticated"
    });
  }
  
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  try {
    jwt.verify(token, JWT_SECRET);
    return res.json({ status: true, message: 'Token is valid' });
  } catch (err) {
    return res.status(401).json({
      detail: "Given token not valid for any token type",
      code: "token_not_valid",
      messages: [{
        token_class: "AccessToken",
        token_type: "access",
        message: "Token is invalid or expired"
      }]
    });
  }
});

// Serve static frontend files in production
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // Only serve index.html for non-API routes (frontend routing)
  app.get('*', (req, res) => {
    const isApiRoute = req.path.startsWith('/api/') || req.path.startsWith('/lms/') || req.path.startsWith('/courses/');
    if (isApiRoute) {
      return res.status(404).json({ error: 'API route not found', path: req.path });
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dedicated Backend Server listening on http://localhost:${PORT}`);
});
