import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from './models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

await mongoose.connect(process.env.MONGODB_URI);

// Fetch the updated course from DB
const course = await Course.findOne({ course_unique_code: 'TSMG2026IOT' });
if (!course) { console.log('❌ Not found'); process.exit(1); }

// Update all known local manifests
const possiblePaths = [
  path.join(__dirname, 'courses', 'TSMG2026IOT', 'manifest.json'),
  path.join(__dirname, 'courses', 'NTEDU0001',   'manifest.json')
];

for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    try {
      const data = JSON.parse(fs.readFileSync(p, 'utf8'));
      data.midQuiz = course.midQuiz.toObject ? course.midQuiz.toObject() : course.midQuiz;
      fs.writeFileSync(p, JSON.stringify(data, null, 2));
      console.log(`✅ Updated manifest: ${p}`);
    } catch (e) {
      console.warn(`⚠️  Could not update ${p}:`, e.message);
    }
  }
}

console.log(`\n✅ DB quiz: ${course.midQuiz.questions.length} questions verified.`);
console.log('Q1:', course.midQuiz.questions[0]?.question);
console.log('Q25:', course.midQuiz.questions[24]?.question);
await mongoose.disconnect();
process.exit(0);
