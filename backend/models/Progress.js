import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user_unique_id: { type: String, required: true },
  course_unique_code: { type: String, required: true },
  progress_percentage: { type: String, default: "0.00" },
  completedVideos: { type: Number, default: 0 },
  midQuizPassed: { type: Boolean, default: false },
  midQuizScore: { type: Number, default: 0 },
  finalQuizPassed: { type: Boolean, default: false },
  finalQuizScore: { type: Number, default: 0 },
  certificate_issued: { type: String, default: "false" },
  certificate_issued_at: { type: Date, default: null },
  assessment_status: { type: String, default: "false" },
  course_complete: { type: String, default: "false" },
  total_score: { type: String, default: "" }
}, { timestamps: true });

// Composite index for fast lookups by user and course
progressSchema.index({ user_unique_id: 1, course_unique_code: 1 }, { unique: true });

export default mongoose.models.Progress || mongoose.model('Progress', progressSchema);
