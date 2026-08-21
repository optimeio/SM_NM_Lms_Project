const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function inspect() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  console.log('=== USERS IN MONGO ===');
  const users = await db.collection('users').find({}).toArray();
  users.forEach((u, i) => {
    console.log(`${i+1}. ID: ${u._id} | Email: "${u.email}" | Name: "${u.fullName || u.name}" | Role: "${u.role}" | Courses: ${JSON.stringify(u.enrolledCourses || u.courses || [])}`);
  });

  console.log('\n=== PROGRESSES IN MONGO ===');
  const progs = await db.collection('progresses').find({}).toArray();
  progs.forEach((p, i) => {
    console.log(`${i+1}. ID: ${p._id} | User: "${p.userId}" | Email: "${p.userEmail}" | Course: "${p.courseId}"`);
  });

  console.log('\n=== COURSES IN MONGO ===');
  const courses = await db.collection('courses').find({}).toArray();
  courses.forEach((c, i) => {
    console.log(`${i+1}. Code: "${c.course_unique_code}" | ID: ${c._id} | Name: "${c.course_name || c.title}" | Active: ${c.is_active} | Category: "${c.category}"`);
  });

  console.log('\n=== LOCAL FILES CHECK ===');
  ['data/users.json', 'data/progress.json', 'courses'].forEach(f => {
    const fp = path.join(__dirname, f);
    if (fs.existsSync(fp)) {
      console.log(`File/Dir exists: ${f} (${fs.statSync(fp).isDirectory() ? 'dir' : fs.statSync(fp).size + ' bytes'})`);
      if (f.endsWith('.json')) {
        console.log(`Content of ${f}:`, fs.readFileSync(fp, 'utf8'));
      }
    } else {
      console.log(`File/Dir NOT exists: ${f}`);
    }
  });

  await mongoose.disconnect();
}

inspect();
