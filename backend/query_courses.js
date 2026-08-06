import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from './models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

await mongoose.connect(process.env.MONGODB_URI);
const list = await Course.find({});
console.log('📚 Database Courses:');
list.forEach(c => {
  console.log(`- Unique Code: "${c.course_unique_code}", Name: "${c.course_name}"`);
});
await mongoose.disconnect();
process.exit(0);
