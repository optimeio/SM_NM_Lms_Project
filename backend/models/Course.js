import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String },
  level: { type: String },
  studentsEnrolled: { type: Number, default: 0 },
  rating: { type: Number, default: 4.8 }
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
