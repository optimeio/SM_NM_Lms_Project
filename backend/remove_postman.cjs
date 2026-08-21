const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://theoptimeio_db_user:PUdD8CQRBpZ7dqCy@ac-81f8cb9-shard-00-00.ctkcasc.mongodb.net:27017,ac-81f8cb9-shard-00-01.ctkcasc.mongodb.net:27017,ac-81f8cb9-shard-00-02.ctkcasc.mongodb.net:27017/sm_lms_db?ssl=true&replicaSet=atlas-e1xhvz-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const draft = await db.collection('draft_courses').deleteMany({ course_name: /postman/i });
  console.log('Removed Postman drafts:', draft.deletedCount);
  
  const c = await db.collection('courses').deleteMany({ course_name: /postman/i });
  console.log('Removed Postman courses:', c.deletedCount);
  
  process.exit(0);
});
