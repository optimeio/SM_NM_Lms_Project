const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  // Remove the invalid TSMG2026IOT1 and keep only the valid TSMG2026IOT
  const result = await db.collection('users').updateOne(
    { email: '8723467324@nm.student.local' },
    { $set: { assignedCourses: ['TSMG2026IOT'], course_unique_code: 'TSMG2026IOT' } }
  );
  console.log('Updated NM Test user:', result.modifiedCount, 'doc(s) modified');
  
  // Verify
  const user = await db.collection('users').findOne({ email: '8723467324@nm.student.local' });
  console.log('Verified assignedCourses:', JSON.stringify(user.assignedCourses));
  
  process.exit(0);
}
run().catch(console.error);
