const fs = require('fs');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://theoptimeio_db_user:PUdD8CQRBpZ7dqCy@ac-81f8cb9-shard-00-00.ctkcasc.mongodb.net:27017,ac-81f8cb9-shard-00-01.ctkcasc.mongodb.net:27017,ac-81f8cb9-shard-00-02.ctkcasc.mongodb.net:27017/sm_lms_db?ssl=true&replicaSet=atlas-e1xhvz-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  
  // Remove users
  await db.collection('users').deleteMany({
    email: {
      $in: [
        'FxEI1WEjJBYgXNbQ3rsddfEcJTV0v0WQQRIj@nm.student.local',
        'test@test.com@nm.student.local',
        'test@student.com@nm.student.local'
      ]
    }
  });
  console.log('Removed users from MongoDB');

  // Remove Postman course
  const res = await db.collection('courses').deleteMany({
    $or: [
      { course_name: { $regex: /postman/i } },
      { title: { $regex: /postman/i } }
    ]
  });
  console.log('Removed Postman courses from MongoDB. Deleted count:', res.deletedCount);
  
  process.exit(0);
}).catch(err => {
  console.log('Error connecting to DB:', err.message);
  process.exit(1);
});
