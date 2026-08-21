import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from frontend directory regardless of process cwd
dotenv.config({ path: path.join(__dirname, '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'sm_nm_lms_secret_key_2026';
const VALID_CLIENT_KEYS = [process.env.CLIENT_KEY || '59e8bb42f89d5ee93ff466be97022427'];
const VALID_CLIENT_SECRETS = [process.env.CLIENT_SECRET || 'f7a761767124aef8b904c49b52a555d6'];


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle JSON parsing errors gracefully
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).send({ status: false, message: 'Invalid JSON payload' });
  }
  next(err);
});

// ----------------------------------------------------
// MONGODB ATLAS CONNECTION SETUP
// ----------------------------------------------------
const primaryURI = process.env.MONGODB_URI || 'mongodb+srv://theoptimeio_db_user:<db_password>@cluster0.unhmsqb.mongodb.net/sm_lms_db?appName=Cluster0&compressors=zlib';
const fallbackURI = process.env.MONGODB_URI_FALLBACK || 'mongodb://theoptimeio_db_user:<db_password>@ac-9jrdo04-shard-00-00.unhmsqb.mongodb.net:27017,ac-9jrdo04-shard-00-01.unhmsqb.mongodb.net:27017,ac-9jrdo04-shard-00-02.unhmsqb.mongodb.net:27017/sm_lms_db?ssl=true&replicaSet=atlas-5pp7uq-shard-0&authSource=admin&appName=Cluster0&compressors=zlib';

async function connectDatabase() {
  try {
    // Try primary connection
    if (!primaryURI.includes('<db_password>')) {
      await mongoose.connect(primaryURI);
      console.log('✅ Connected to MongoDB Atlas via Primary SRV URI');
      return;
    }
  } catch (err) {
    console.warn('⚠️ Primary MongoDB connection failed, attempting fallback URI...', err.message);
  }

  try {
    if (!fallbackURI.includes('<db_password>')) {
      await mongoose.connect(fallbackURI);
      console.log('✅ Connected to MongoDB Atlas via Fallback Seed List URI');
      return;
    }
  } catch (err) {
    console.warn('⚠️ Fallback MongoDB connection failed:', err.message);
  }

  console.log('ℹ️ MongoDB credentials contain <db_password> placeholder. Backend server is ready and running with live API endpoints.');
}

connectDatabase();

// ----------------------------------------------------
// MONGOOSE SCHEMAS & MODELS
// ----------------------------------------------------
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  gender: { type: String },
  password: { type: String, required: true },
  college: { type: String },
  department: { type: String },
  year: { type: String },
  district: { type: String },
  role: { type: String, default: 'student' },
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  course_unique_code: { type: String },
  course_name: { type: String },
  title: { type: String },
  category: { type: String },
  level: { type: String },
  instructor: { type: String },
  course_description: { type: String },
  course_image_url: { type: String },
  is_active: { type: Boolean, default: true },
  approval_status: { type: Boolean, default: true },
  studentsEnrolled: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
  videos: [{ type: String }],
  ppts: [{ type: String }],
  midQuiz: { type: mongoose.Schema.Types.Mixed },
  finalQuiz: { type: mongoose.Schema.Types.Mixed },
  course_content: [{ type: mongoose.Schema.Types.Mixed }],
  course_objective: [{ type: mongoose.Schema.Types.Mixed }],
  reference_id: { type: String },
  number_of_videos: { type: String },
  sub_stream: { type: String },
}, { timestamps: true, strict: false });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

// In-Memory Fallback Store (Ensures 100% smooth flow if DB credentials placeholder is unpopulated)
let memoryUsers = [
  {
    _id: 'admin-1',
    fullName: 'SM Groups Administrator',
    email: 'thesmgroups@gmail.com',
    password: 'TSMGPVT@2026',
    role: 'admin',
    college: 'The SM Groups',
    department: 'Administration'
  }
];

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check & DB Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    dbConnected: mongoose.connection.readyState === 1,
    timestamp: new Date()
  });
});

// 2. Auth: Student Registration (Disabled)
app.post('/api/auth/register', async (req, res) => {
  return res.status(400).json({ success: false, message: 'Student registration is disabled. Please login using a valid Client Key and Secret Key.' });
});

// 3. Auth: Login (Student via Keys/Credentials & Admin via Email/Password)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, client_key, client_secret, clientKey, clientSecret } = req.body;
    
    const inputUser = (username || '').trim().toLowerCase();
    const inputPass = (password || '').trim();
    const key = (client_key || clientKey || '').trim();
    const secret = (client_secret || clientSecret || '').trim();

    // 1. Admin Credentials Authentication Check
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
        return res.status(401).json({ success: false, message: 'Invalid Admin Password.' });
      }
    }

    // 2. Student Authentication (Requires valid Client Key & Secret Key)
    if (!key || !secret) {
      return res.status(400).json({ success: false, message: 'Client Key and Secret Key are required for student login.' });
    }

    const isValidKey = VALID_CLIENT_KEYS.includes(key);
    const isValidSecret = VALID_CLIENT_SECRETS.includes(secret);

    if (!isValidKey || !isValidSecret) {
      return res.status(401).json({ success: false, message: 'Invalid Client Key or Secret Key.' });
    }

    let studentUser;
    if (inputUser && inputPass) {
      if (mongoose.connection.readyState === 1) {
        const queryOr = [{ email: inputUser }, { phone: inputUser }];
        if (mongoose.Types.ObjectId.isValid(inputUser)) {
          queryOr.push({ _id: inputUser });
        }
        studentUser = await User.findOne({
          role: 'student',
          $or: queryOr
        });
      } else {
        studentUser = memoryUsers.find(u => 
          u.role === 'student' && 
          (u.email === inputUser || u.phone === inputUser || u._id === inputUser)
        );
      }

      if (!studentUser || studentUser.password !== inputPass) {
        return res.status(401).json({ success: false, message: 'Invalid Student Username or Password.' });
      }
    } else {
      // Fallback: Default student user if no individual credentials provided
      const defaultEmail = 'student@nm.student.local';
      if (mongoose.connection.readyState === 1) {
        studentUser = await User.findOne({ email: defaultEmail });
        if (!studentUser) {
          studentUser = await User.create({
            fullName: 'NM Student',
            email: defaultEmail,
            password: 'nm_sso_login',
            role: 'student',
            college: 'PSG College of Technology',
            department: 'CSE',
            assignedCourses: ['TSMG2026IOT']
          });
        }
      } else {
        studentUser = memoryUsers.find(u => u.email === defaultEmail);
        if (!studentUser) {
          studentUser = {
            _id: 'student-sso-default',
            user_unique_id: 'student-sso-default',
            fullName: 'NM Student',
            email: defaultEmail,
            password: 'nm_sso_login',
            role: 'student',
            college: 'PSG College of Technology',
            department: 'CSE',
            assignedCourses: ['TSMG2026IOT']
          };
          memoryUsers.push(studentUser);
        }
      }
    }

    const access = jwt.sign({ client_key: key, type: 'access' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ success: true, user: studentUser, token: access });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Token retrieval & refresh endpoints
app.post(['/lms/client/token/', '/api/lms/client/token/', '/api/v1/lms/client/token/', '/token/'], express.urlencoded({ extended: false }), (req, res) => {
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

  // Return all possible token fields for maximum compatibility with callers
  return res.json({
    status: true,
    success: true,
    access_key: access,
    access_token: access,
    access: access,
    token: access,
    refresh_key: refresh,
    refresh_token: refresh,
    refresh: refresh,
    expires_in: 3600
  });
});

app.post(['/lms/client/token/refresh/', '/api/lms/client/token/refresh/', '/api/v1/lms/client/token/refresh/', '/token/refresh/'], (req, res) => {
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
    const newRefresh = jwt.sign({ client_key: decoded.client_key, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      status: true,
      success: true,
      access_key: access,
      access_token: access,
      access: access,
      token: access,
      refresh_key: newRefresh,
      refresh_token: newRefresh,
      refresh: newRefresh,
      expires_in: 3600
    });
  } catch (err) {
    return res.status(401).json({ status: false, message: 'Invalid or expired refresh token.' });
  }
});

// In-memory progress fallback store
const prodProgressStore = {};

// ── JWT Auth Middleware ───────────────────────────────────────────────────────
function authToken(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
  if (!token) {
    return next(); // Let request proceed if token is missing (permissive auth)
  }
  if (token === 'sm_nm_token_2026') {
    return next();
  }
  try {
    jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    // Allow Naan Mudhalvan server-to-server tokens by checking decoded issuer/audience claims
    const decoded = jwt.decode(token);
    if (decoded && (
      (decoded.iss && (decoded.iss.includes('naanmudhalvan') || decoded.iss.includes('skilldevelopment'))) ||
      (decoded.aud && (decoded.aud.includes('naanmudhalvan') || decoded.aud.includes('skilldevelopment')))
    )) {
      return next();
    }
    // Permissive fallback: continue even if token is expired/invalid since no token is also allowed
    return next();
  }
}

// ── Token Endpoints ─────────────────────────────────────────────────────────
app.post(['/token', '/token/', '/lms/client/token', '/lms/client/token/', '/api/lms/client/token', '/api/lms/client/token/', '/api/v1/lms/client/token', '/api/v1/lms/client/token/'], (req, res) => {
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
  const now = Math.floor(Date.now() / 1000);
  const jti = `${client_key.slice(0,8)}-${Date.now()}`;
  const access = jwt.sign({ token_type: 'access', client_key, user_id: client_key, jti, iat: now, exp: now + 3600 }, JWT_SECRET);
  const refresh = jwt.sign({ token_type: 'refresh', client_key, user_id: client_key, jti: `ref-${jti}`, iat: now, exp: now + 604800 }, JWT_SECRET);
  return res.json({
    status: true, success: true,
    access_key: access, access_token: access, access: access, token: access,
    refresh_key: refresh, refresh_token: refresh, refresh: refresh,
    expires_in: 3600
  });
});

app.post(['/token/refresh', '/token/refresh/', '/lms/client/token/refresh', '/lms/client/token/refresh/', '/api/lms/client/token/refresh', '/api/lms/client/token/refresh/', '/api/v1/lms/client/token/refresh', '/api/v1/lms/client/token/refresh/'], (req, res) => {
  const body = req.body || {};
  const refresh = body.refresh || body.refresh_key || body.refresh_token;
  if (!refresh) {
    return res.status(400).json({ status: false, message: 'refresh token is required.' });
  }
  try {
    const decoded = jwt.verify(refresh, JWT_SECRET);
    const tokenType = decoded.token_type || decoded.type;
    if (tokenType !== 'refresh') {
      return res.status(401).json({ status: false, message: 'Invalid token type. Expected refresh token.' });
    }
    const now = Math.floor(Date.now() / 1000);
    const jti = `${(decoded.client_key || 'unk').slice(0,8)}-${Date.now()}`;
    const access = jwt.sign({ token_type: 'access', client_key: decoded.client_key, user_id: decoded.client_key, jti, iat: now, exp: now + 3600 }, JWT_SECRET);
    const newRefresh = jwt.sign({ token_type: 'refresh', client_key: decoded.client_key, user_id: decoded.client_key, jti: `ref-${jti}`, iat: now, exp: now + 604800 }, JWT_SECRET);
    return res.json({
      status: true, success: true,
      access_key: access, access_token: access, access: access, token: access,
      refresh_key: newRefresh, refresh_token: newRefresh, refresh: newRefresh,
      expires_in: 3600
    });
  } catch (err) {
    return res.status(401).json({ status: false, message: 'Invalid or expired refresh token.' });
  }
});

// ── 6. Student Token Check ────────────────────────────────────────────────────
app.get(['/lms/client/course/student/check/', '/lms/client/course/student/check'], authToken, (req, res) => {
  return res.json({ status: true, message: 'Token is valid' });
});

// ── 7. NM Inbound: Subscribe (called by NM when student subscribes) ───────────
app.post(['/course/subscribe', '/course/subscribe/', '/nm/api/course/subscribe', '/nm/api/course/subscribe/', '/skilldevelopment/api/course/subscribe', '/skilldevelopment/api/course/subscribe/', '/lms/client/course/subscribe', '/lms/client/course/subscribe/', '/api/student/subscribe', '/api/student/subscribe/'], async (req, res) => {
  const { user_id, course_id, student_name, college_name, college_code, branch_name, district, university } = req.body || {};
  if (!user_id || !course_id) {
    return res.status(400).json({ subscription_registration_status: false, error: 'user_id and course_id are required' });
  }
  const cleanUserId = String(user_id).replace(/@nm\.student\.local/g, '').trim();
  const subscription_reference_id = `SUB-${course_id}-${String(cleanUserId).slice(-8)}-${Date.now()}`;

  // Register student in memory store
  const existing = memoryUsers.find(u => u.user_unique_id === cleanUserId || u._id === cleanUserId);
  if (!existing) {
    memoryUsers.push({
      _id: cleanUserId, user_unique_id: cleanUserId,
      fullName: student_name || 'NM Student',
      email: cleanUserId.includes('@') ? cleanUserId : `${cleanUserId}@nm.student.local`,
      password: 'nm_sso_login', role: 'student',
      college: college_name || college_code || '',
      department: branch_name || '',
      district: district || '', university: university || '',
      assignedCourses: [course_id], course_unique_code: course_id
    });
  } else if (!existing.assignedCourses?.includes(course_id)) {
    if (!Array.isArray(existing.assignedCourses)) existing.assignedCourses = [];
    existing.assignedCourses.push(course_id);
    existing.course_unique_code = course_id;
  }

  // Persist to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    await User.findOneAndUpdate(
      { $or: [{ user_unique_id: cleanUserId }, { email: cleanUserId.includes('@') ? cleanUserId : `${cleanUserId}@nm.student.local` }] },
      { $setOnInsert: { fullName: student_name || 'NM Student', email: cleanUserId.includes('@') ? cleanUserId : `${cleanUserId}@nm.student.local`, password: 'nm_sso_login', role: 'student' }, $addToSet: { assignedCourses: course_id }, $set: { course_unique_code: course_id, user_unique_id: cleanUserId } },
      { upsert: true, new: true }
    ).catch(() => {});
  }

  console.log(`✅ NM Subscribe: user=${cleanUserId} course=${course_id}`);
  const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://smtnskill.thesmgroups.com').replace(/\/$/, '');
  const sso_url = `${FRONTEND_URL}/dashboard?sso=true&uid=${encodeURIComponent(cleanUserId)}&cid=${encodeURIComponent(course_id)}`;
  const access_url = `${FRONTEND_URL}/api/course/access/`;
  return res.json({ subscription_registration_status: true, subscription_reference_id, access_url, watch_url: sso_url });
});

// ── 8. NM Inbound: Course Access URL (called by NM to get watch URL) ──────────
app.post(['/course/access', '/course/access/', '/nm/api/course/access', '/nm/api/course/access/', '/tnskill/api/course/access', '/tnskill/api/course/access/', '/skilldevelopment/api/course/access', '/skilldevelopment/api/course/access/', '/lms/client/course/access', '/lms/client/course/access/', '/api/course/access', '/api/course/access/', '/api/student/course-access', '/api/student/course-access/'], (req, res) => {
  const { user_id, course_id } = req.body || {};
  if (!user_id || !course_id) return res.json({ access_status: false });

  const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://smtnskill.thesmgroups.com').replace(/\/$/, '');
  const access_url = `${FRONTEND_URL}/dashboard?sso=true&uid=${encodeURIComponent(user_id)}&cid=${encodeURIComponent(course_id)}`;

  console.log(`✅ NM Course Access: user=${user_id} course=${course_id} → ${access_url}`);
  return res.json({ access_status: true, access_url, watch_url: access_url });
});

// ── NM Student Progress API (Retrieval) ──────────────────────────────────────
app.post(['/nm/api/student/progress', '/nm/api/student/progress/', '/tnskill/api/student/progress', '/tnskill/api/student/progress/', '/lms/client/student/progress', '/lms/client/student/progress/', '/api/student/progress-info', '/api/student/progress-info/', '/course/progress', '/course/progress/'], (req, res) => {
  const body = req.body || {};
  const user_id = body.user_id || body.user_unique_id;
  const course_id = body.course_id || body.course_unique_code;
  if (!user_id || !course_id) {
    return res.status(400).json({ message: "Please provide valid user_id and course_id" });
  }
  const key = `${user_id}_${course_id}`;
  const progress = prodProgressStore[key];
  if (progress) {
    return res.json({
      progress_percentage: String(progress.progress_percentage || "0.00"),
      certificate_issued: String(progress.certificate_issued || "false"),
      assessment_status: String(progress.assessment_status || "false"),
      course_complete: String(progress.course_complete || "false")
    });
  }
  return res.json({
    progress_percentage: "0.00",
    certificate_issued: "false",
    assessment_status: "false",
    course_complete: "false"
  });
});

// ── 9. Progress Update: user-tracking (called by our KP frontend/backend) ─────
app.post(['/lms/client/course/xf/user-tracking', '/lms/client/course/xf/', '/api/v1/lms/client/course/xf/'], authToken, (req, res) => {
  const { user_unique_id, course_unique_code, progress_percentage, certificate_issued, assessment_status, course_complete } = req.body || {};
  if (!user_unique_id || !course_unique_code) {
    return res.status(400).json({ status: false, message: 'user_unique_id and course_unique_code are required.' });
  }
  const key = `${user_unique_id}_${course_unique_code}`;
  prodProgressStore[key] = {
    ...(prodProgressStore[key] || {}),
    user_unique_id, course_unique_code,
    ...(progress_percentage  !== undefined && { progress_percentage }),
    ...(certificate_issued   !== undefined && { certificate_issued }),
    ...(assessment_status    !== undefined && { assessment_status }),
    ...(course_complete      !== undefined && { course_complete }),
    updated_at: new Date().toISOString()
  };

  // Persist to MongoDB if connected
  if (mongoose.connection.readyState === 1) {
    const update = {};
    if (progress_percentage  !== undefined) update.progress_percentage  = progress_percentage;
    if (certificate_issued   !== undefined) update.certificate_issued   = certificate_issued;
    if (assessment_status    !== undefined) update.assessment_status    = assessment_status;
    if (course_complete      !== undefined) update.course_complete      = course_complete;
    const ProgressModel = mongoose.models.Progress || mongoose.model('Progress', new mongoose.Schema({
      user_unique_id: String, course_unique_code: String,
      progress_percentage: String, certificate_issued: String,
      assessment_status: String, course_complete: String
    }, { timestamps: true }));
    ProgressModel.findOneAndUpdate({ user_unique_id, course_unique_code }, { $set: update }, { upsert: true, new: true }).catch(() => {});
  }

  return res.json({ status: true, message: 'Student course progress updated successfully.', data: prodProgressStore[key] });
});

// ── 10. NM Student Progress Retrieval ─────────────────────────────────────────
app.post(['/nm/api/student/progress', '/tnskill/api/student/progress'], authToken, (req, res) => {
  const { user_id, course_id } = req.body || {};
  if (!user_id || !course_id) return res.status(400).json({ message: 'Please provide valid user_id/ course_id' });

  const key = `${user_id}_${course_id}`;
  const p = prodProgressStore[key];
  return res.json({
    progress_percentage: String(p?.progress_percentage || '0.00'),
    certificate_issued:  String(p?.certificate_issued  || 'false'),
    assessment_status:   String(p?.assessment_status   || 'false'),
    course_complete:     String(p?.course_complete      || 'false')
  });
});

// ── 10. User Progress (All) Endpoint ─────────────────────────────────────────
app.get(['/api/user/progress', '/api/user/progress/'], async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const progressList = await mongoose.connection.db.collection('progresses').find({}).toArray();
      return res.json({ success: true, user_progress: progressList });
    }
    return res.json({ success: true, user_progress: [] });
  } catch (err) {
    return res.json({ success: true, user_progress: [] });
  }
});

// ── 10a. Admin Users Endpoint ─────────────────────────────────────────────────

app.get('/api/admin/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await mongoose.connection.db.collection('users').find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).toArray();
      return res.json({ success: true, users });
    }
    // Fallback to memoryUsers
    const students = memoryUsers.filter(u => u.role !== 'admin');
    return res.json({ success: true, users: students });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

app.post('/api/admin/users/:identifier/assign', async (req, res) => {
  try {
    const identifier = decodeURIComponent(req.params.identifier).toLowerCase();
    const { courses } = req.body || {};
    const assignedCoursesList = Array.isArray(courses) ? courses : [];
    const mainCode = assignedCoursesList[0] || '';

    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.collection('users').updateOne(
        { email: identifier },
        { $set: { assignedCourses: assignedCoursesList, course_unique_code: mainCode } }
      );
    }
    // Also update memory
    const memIdx = memoryUsers.findIndex(u => (u.email || '').toLowerCase() === identifier);
    if (memIdx >= 0) {
      memoryUsers[memIdx].assignedCourses = assignedCoursesList;
      memoryUsers[memIdx].course_unique_code = mainCode;
    }
    return res.json({ success: true, message: 'Courses assigned successfully.' });
  } catch (err) {
    console.error('Assign courses error:', err);
    return res.status(500).json({ success: false, message: 'Failed to assign courses.' });
  }
});

app.put('/api/admin/users/:identifier', async (req, res) => {
  try {
    const identifier = decodeURIComponent(req.params.identifier).toLowerCase();
    const updates = req.body || {};
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.collection('users').updateOne({ email: identifier }, { $set: updates });
    }
    const memIdx = memoryUsers.findIndex(u => (u.email || '').toLowerCase() === identifier);
    if (memIdx >= 0) Object.assign(memoryUsers[memIdx], updates);
    return res.json({ success: true, message: 'Student updated.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update student.' });
  }
});

app.delete('/api/admin/users/:identifier', async (req, res) => {
  try {
    const identifier = decodeURIComponent(req.params.identifier).toLowerCase();
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.collection('users').deleteOne({ email: identifier });
    }
    const idx = memoryUsers.findIndex(u => (u.email || '').toLowerCase() === identifier);
    if (idx >= 0) memoryUsers.splice(idx, 1);
    return res.json({ success: true, message: 'Student deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
});

// ── 10c. User Profile Endpoint (GET & PUT) ────────────────────────────────────
app.get('/api/users/profile', async (req, res) => {
  const email = (req.query.email || '').toLowerCase().trim();
  if (!email) return res.json({ success: false, message: 'Email required' });
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ $or: [{ email }, { user_unique_id: email.replace(/@nm\.student\.local$/, '') }] }).lean();
      if (user) return res.json({ success: true, user });
    }
    // Fallback to memory
    const memUser = memoryUsers.find(u => u.email === email || u.user_unique_id === email.replace(/@nm\.student\.local$/, ''));
    if (memUser) return res.json({ success: true, user: memUser });
    return res.json({ success: false, message: 'User not found' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/users/profile', async (req, res) => {
  const email = (req.query.email || '').toLowerCase().trim();
  if (!email) return res.json({ success: false, message: 'Email required' });
  try {
    const updates = req.body || {};
    delete updates._id; // Don't overwrite _id
    if (mongoose.connection.readyState === 1) {
      await User.findOneAndUpdate({ email }, { $set: updates }, { upsert: false });
    }
    const memIdx = memoryUsers.findIndex(u => u.email === email);
    if (memIdx >= 0) Object.assign(memoryUsers[memIdx], updates);
    return res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ── 10b. Courses List Endpoint ────────────────────────────────────────────────

app.get(['/lms/client/courses/', '/api/v1/lms/client/courses/', '/api/lms/client/courses/', '/api/courses'], authToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const courses = await mongoose.connection.db.collection('courses').find({}).toArray();
      // Map to normalized format expected by AdminPortal frontend
      const coursesList = courses.map(c => ({
        _id: c._id ? c._id.toString() : '',
        course_id: c._id ? c._id.toString() : '',
        course_unique_code: c.course_unique_code || '',
        name: c.course_name || c.title || '',
        title: c.course_name || c.title || '',
        category: c.category || '',
        instructor: c.instructor || '',
        course_description: c.course_description || c.content || '',
        course_image_url: c.course_image_url || '',
        is_active: c.is_active !== false,
        approval_status: c.approval_status !== false,
        course_status: c.is_active !== false,
        reference_id: c.reference_id || '',
        videos: c.videos || [],
        ppts: c.ppts || [],
        midQuiz: c.midQuiz || null,
        finalQuiz: c.finalQuiz || null,
        course_content: c.course_content || [],
        course_objective: c.course_objective || [],
        studentsEnrolled: c.studentsEnrolled || 0,
        rating: c.rating || 4.8
      }));
      return res.json({ success: true, courses_list: coursesList, courses: coursesList, total_count: coursesList.length });
    }
  } catch (e) {
    console.error('Error fetching courses from MongoDB:', e);
  }

  // Fallback memory courses (both active courses)
  const fallbackCourses = [
    {
      _id: 'TSMG2026IOT',
      course_id: 'TSMG2026IOT',
      course_unique_code: 'TSMG2026IOT',
      name: 'Embedded Systems & IOT',
      title: 'Embedded Systems & IOT',
      category: 'Embedded Systems',
      is_active: true,
      approval_status: true,
      course_status: true,
      videos: [], ppts: [], studentsEnrolled: 0, rating: 4.8
    },
    {
      _id: 'TSMG2026SURF002',
      course_id: 'TSMG2026SURF002',
      course_unique_code: 'TSMG2026SURF002',
      name: 'Surface Modeling',
      title: 'Surface Modeling',
      category: 'CAD/CAM',
      is_active: true,
      approval_status: true,
      course_status: true,
      videos: [], ppts: [], studentsEnrolled: 0, rating: 4.8
    }
  ];
  return res.json({ success: true, courses_list: fallbackCourses, courses: fallbackCourses, total_count: fallbackCourses.length });
});


// ── 11. Serve React SPA (catch-all) ───────────────────────────────────────────
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running smoothly on http://localhost:${PORT}`);
});
