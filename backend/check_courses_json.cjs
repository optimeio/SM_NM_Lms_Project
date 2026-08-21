const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function checkCourses() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const courses = await db.collection('courses').find({}).toArray();
  console.log('JSON of courses in DB:');
  courses.forEach((c, idx) => {
    console.log(`\n--- Course ${idx + 1} ---`);
    console.log(JSON.stringify(c, null, 2));
  });
  await mongoose.disconnect();
}

checkCourses();
