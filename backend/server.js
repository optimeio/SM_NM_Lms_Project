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

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function connectDatabase() {
  if (primaryURI && !primaryURI.includes('<db_password>')) {
    try {
      await mongoose.connect(primaryURI);
      console.log('✅ Connected to MongoDB Atlas via Primary SRV Connection');
      return;
    } catch (err) {
      console.warn('⚠️ Primary MongoDB Connection error:', err.message);
    }
  }

  if (fallbackURI && !fallbackURI.includes('<db_password>')) {
    try {
      await mongoose.connect(fallbackURI);
      console.log('✅ Connected to MongoDB Atlas via Seed List Fallback Connection');
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
const VALID_CLIENT_KEYS = [process.env.CLIENT_KEY, 'CsVPGXb4PCKVAS0DeDP3t1yTPu8VGQrl', 'lms_client_key_2026'].filter(Boolean);
const VALID_CLIENT_SECRETS = [process.env.CLIENT_SECRET, 'A3srNJgzIz309Sa6FBGDQDP2tyuicvIb', 'lms_client_secret_2026'].filter(Boolean);

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
      videos: body.videos || [],
      ppts: body.ppts || [],
      midQuiz: body.midQuiz || { title: 'Mid-Course Quiz (After Video 6)', questions: [] },
      finalQuiz: body.finalQuiz || { title: 'Final Assessment Quiz (After Video 12)', questions: [] }
    };

    // Automatically create physical course directory structure:
    // backend/courses/<course_code>/
    // ├── videos/ (video_1.mp4, video_2.mp4...)
    // └── ppts/   (presentation_1.pptx...)
    const safeFolderCode = course_unique_code.replace(/[^a-zA-Z0-9_-]/g, '_');
    const courseDir = path.join(__dirname, 'courses', safeFolderCode);
    const videosDir = path.join(courseDir, 'videos');
    const pptsDir = path.join(courseDir, 'ppts');

    if (!fs.existsSync(courseDir)) fs.mkdirSync(courseDir, { recursive: true });
    if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });
    if (!fs.existsSync(pptsDir)) fs.mkdirSync(pptsDir, { recursive: true });

    // Extract & save physical video files
    const savedVideos = (body.videos || []).map((vidData, idx) => {
      const vidFileName = `video_${idx + 1}.mp4`;
      const vidFilePath = path.join(videosDir, vidFileName);
      
      if (typeof vidData === 'string' && vidData.startsWith('data:video')) {
        try {
          const base64Data = vidData.split(';base64,').pop();
          fs.writeFileSync(vidFilePath, base64Data, { encoding: 'base64' });
          return `/courses/${safeFolderCode}/videos/${vidFileName}`;
        } catch (e) {
          console.error(`Error saving ${vidFileName}:`, e);
          return `/courses/${safeFolderCode}/videos/${vidFileName}`;
        }
      }
      return vidData || `/courses/${safeFolderCode}/videos/${vidFileName}`;
    });

    // Extract & save physical PPT files
    const savedPpts = (body.ppts || []).map((pptData, idx) => {
      const pptFileName = `presentation_${idx + 1}.pptx`;
      const pptFilePath = path.join(pptsDir, pptFileName);

      if (typeof pptData === 'string' && pptData.startsWith('data:')) {
        try {
          const base64Data = pptData.split(';base64,').pop();
          fs.writeFileSync(pptFilePath, base64Data, { encoding: 'base64' });
          return `/courses/${safeFolderCode}/ppts/${pptFileName}`;
        } catch (e) {
          console.error(`Error saving ${pptFileName}:`, e);
          return `/courses/${safeFolderCode}/ppts/${pptFileName}`;
        }
      }
      return pptData || `/courses/${safeFolderCode}/ppts/${pptFileName}`;
    });

    courseData.videos = savedVideos;
    courseData.ppts = savedPpts;
    courseData.folderPath = courseDir;

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

      const totalStudentsCount = await User.countDocuments({ role: { $ne: 'admin' } }).catch(() => memoryUsers.filter(u => u.role !== 'admin').length) || 1;
      const dbCourses = await Course.find(filter).sort({ createdAt: -1 });
      coursesList = dbCourses.map(c => {
        const trackedUsers = Object.values(userProgressStore).filter(p => p.course_unique_code === c.course_unique_code);
        const enrolledCount = Math.max(trackedUsers.length, totalStudentsCount, 1);
        return {
          name: c.course_name || c.title,
          course_id: c.course_unique_code,
          course_status: c.is_active,
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
        const trackedUsers = Object.values(userProgressStore).filter(p => p.course_unique_code === c.course_unique_code);
        const enrolledCount = Math.max(trackedUsers.length, totalStudentsCount, 1);
        return {
          name: c.course_name,
          course_id: c.course_unique_code,
          course_status: c.is_active,
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
        await fetch('https://sandbox-api.naanmudhalvan.in/api/v1/lms/client/course/xf/user-tracking', {
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


// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Dedicated Backend Server listening on http://localhost:${PORT}`);
});
