require('mongoose').connect('mongodb://theoptimeio_db_user:PUdD8CQRBpZ7dqCy@ac-81f8cb9-shard-00-00.ctkcasc.mongodb.net:27017,ac-81f8cb9-shard-00-01.ctkcasc.mongodb.net:27017,ac-81f8cb9-shard-00-02.ctkcasc.mongodb.net:27017/sm_lms_db?ssl=true&replicaSet=atlas-e1xhvz-shard-0&authSource=admin&appName=Cluster0').then(async () => {
  const db = require('mongoose').connection.db;
  await db.collection('courses').updateOne({ course_unique_code: 'TSMG2026IOT' }, { $set: { course_image_url: 'https://optio-lms.com/courses/TSMG2026IOT/course_image.png' } });
  console.log('Updated to URL');
  process.exit(0);
});
