const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://theoptimeio_db_user:PUdD8CQRBpZ7dqCy@ac-81f8cb9-shard-00-00.ctkcasc.mongodb.net:27017,ac-81f8cb9-shard-00-01.ctkcasc.mongodb.net:27017,ac-81f8cb9-shard-00-02.ctkcasc.mongodb.net:27017/sm_lms_db?ssl=true&replicaSet=atlas-e1xhvz-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  
  const courseDir = 'd:\\SM_NM_Lms_Project\\backend\\courses\\TSMG2026IOT';
  const manifestPath = path.join(courseDir, 'manifest.json');
  
  const courseObj = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  const filesToLoad = [
    { key: 'midQuiz', file: 'midQuiz.json' },
    { key: 'finalQuiz', file: 'finalQuiz.json' },
    { key: 'course_content', file: 'course_content.json' },
    { key: 'course_objective', file: 'course_objective.json' }
  ];
  
  for (const { key, file } of filesToLoad) {
    const filePath = path.join(courseDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (data) {
          courseObj[key] = data;
        }
      } catch (e) {
        console.log('Error reading', file);
      }
    }
  }

  // Populate videos from disk if empty
  const vidsFolder = path.join(courseDir, 'videos');
  if (fs.existsSync(vidsFolder) && (!courseObj.videos || courseObj.videos.length === 0)) {
    const vidFiles = fs.readdirSync(vidsFolder).filter(f => !f.startsWith('.'));
    if (vidFiles.length > 0) {
      courseObj.videos = vidFiles.map(f => `/courses/TSMG2026IOT/videos/${f}`);
    }
  }

  // Update MongoDB
  const res = await db.collection('courses').updateOne(
    { course_unique_code: 'TSMG2026IOT' },
    { $set: courseObj },
    { upsert: true }
  );
  
  console.log('Successfully synced IOT course to live MongoDB:', res.modifiedCount > 0 ? 'Updated' : 'Upserted');
  
  process.exit(0);
}).catch(err => {
  console.log('Error connecting to DB:', err.message);
  process.exit(1);
});
