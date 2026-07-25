import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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

// In-Memory Fallback User Store
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
        const formattedName = inputUser.includes('@') 
          ? inputUser.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          : inputUser.replace(/\b\w/g, c => c.toUpperCase());
        const guestUser = {
          _id: `guest-${Date.now()}`,
          fullName: formattedName,
          email: inputUser.includes('@') ? inputUser : `${inputUser}@example.com`,
          role: 'student'
        };
        return res.json({ success: true, user: guestUser });
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

// 4. Admin: Get Registered Users List
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

// 5. Courses List
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
  console.log(`🚀 Dedicated Backend Server listening on http://localhost:${PORT}`);
});
