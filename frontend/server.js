import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'sm_nm_lms_secret_key_2026';
const VALID_CLIENT_KEYS = [process.env.CLIENT_KEY || '59e8bb42f89d5ee93ff466be97022427'];
const VALID_CLIENT_SECRETS = [process.env.CLIENT_SECRET || 'f7a761767124aef8b904c49b52a555d6'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
  title: { type: String, required: true },
  category: { type: String },
  level: { type: String },
  studentsEnrolled: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 },
}, { timestamps: true });

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

// 3. Auth: Login (Student via Keys & Admin via Email/Password)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password, client_key, client_secret, clientKey, clientSecret } = req.body;
    const key = (client_key || clientKey || '').trim();
    const secret = (client_secret || clientSecret || '').trim();

    // If Client Key and Secret Key are provided, perform key-based student authentication
    if (key || secret) {
      const isValidKey = VALID_CLIENT_KEYS.includes(key);
      const isValidSecret = VALID_CLIENT_SECRETS.includes(secret);

      if (!isValidKey || !isValidSecret) {
        return res.status(401).json({ success: false, message: 'Invalid Client Key or Secret Key.' });
      }

      // Look up default student user or create one
      const defaultEmail = 'student@nm.student.local';
      let studentUser;

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

      const access = jwt.sign({ client_key: key, type: 'access' }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({ success: true, user: studentUser, token: access });
    }

    // Require email/password for Admin login
    if (!username || !password) {
      return res.status(400).json({ message: 'Register Number/Email and Password are required.' });
    }

    const inputUser = username.trim().toLowerCase();
    const inputPass = password.trim();

    // Check Admin
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

    return res.status(401).json({ message: 'Invalid credentials or registration is disabled.' });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Token retrieval & refresh endpoints
app.post(['/lms/client/token/', '/api/lms/client/token/', '/api/v1/lms/client/token/', '/token/'], (req, res) => {
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
    return res.json({ status: true, access, expires_in: 3600 });
  } catch (err) {
    return res.status(401).json({ status: false, message: 'Invalid or expired refresh token.' });
  }
});

// 4. Admin: Get Users
app.get('/api/admin/users', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const users = await User.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, users });
    } else {
      return res.json({ success: true, users: memoryUsers });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// 5. Courses API
app.get('/api/courses', async (req, res) => {
  const sampleCourses = [
    { _id: '1', title: 'Python Programming for Beginners', category: 'Programming', studentsEnrolled: 1450, rating: 4.8 },
    { _id: '2', title: 'PCB Design & Embedded Hardware', category: 'Electronics', studentsEnrolled: 980, rating: 4.9 },
    { _id: '3', title: 'IoT Systems & Sensors Interfacing', category: 'IoT', studentsEnrolled: 1120, rating: 4.7 }
  ];
  try {
    if (mongoose.connection.readyState === 1) {
      let courses = await Course.find({});
      if (!courses.length) {
        courses = await Course.insertMany(sampleCourses);
      }
      return res.json({ success: true, courses });
    }
    return res.json({ success: true, courses: sampleCourses });
  } catch (err) {
    res.json({ success: true, courses: sampleCourses });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Backend Server running smoothly on http://localhost:${PORT}`);
});
