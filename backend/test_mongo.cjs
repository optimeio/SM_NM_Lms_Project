const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function test() {
  console.log('Connecting to Mongo...');
  console.log('URI:', process.env.MONGODB_URI);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected successfully!');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`Collection ${col.name}: ${count} documents`);
    }

    // Let's check courses collection
    const courses = await db.collection('courses').find({}).toArray();
    console.log('\n--- Courses in DB ---');
    console.log(`Total courses: ${courses.length}`);
    courses.forEach(c => {
      console.log(`Code: ${c.course_unique_code}, Name: ${c.course_name || c.title}, Active: ${c.is_active}`);
    });

    // Let's check users collection
    const users = await db.collection('users').find({}).toArray();
    console.log('\n--- Users count ---');
    console.log(`Total users: ${users.length}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Mongo Connection Error:', err.message);
  }
}

test();
