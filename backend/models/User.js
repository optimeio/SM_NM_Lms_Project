import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  gender: { type: String },
  password: { type: String, required: true },
  college: { type: String },
  department: { type: String },
  year: { type: String },
  district: { type: String },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  assignedCourses: [{ type: String }],
  course_unique_code: { type: String },
  profileImage: { type: String }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);
