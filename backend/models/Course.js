import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  course_unique_code: { type: String, required: true, unique: true },
  course_name: { type: String, required: true },
  course_description: { type: String },
  course_image_url: { type: String },
  instructor: { type: String },
  duration: { type: String },
  number_of_videos: { type: String, default: '12' },
  language: { type: String },
  main_stream: { type: String },
  sub_stream: { type: String },
  category: { type: String },
  system_requirements: { type: String },
  has_subtitles: { type: String },
  reference_id: { type: String },
  course_type: { type: String, default: 'ONLINE' },
  location: { type: String },
  is_active: { type: Boolean, default: true },
  approval_status: { type: Boolean, default: true },
  videos: [{ type: String }],
  ppts: [{ type: String }],
  course_content: [{ content: String }],
  course_objective: [{ objective: String }],
  midQuiz: {
    title: { type: String, default: 'Mid-Course Quiz (After Video 6)' },
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number
    }]
  },
  finalQuiz: {
    title: { type: String, default: 'Final Assessment Quiz (After Video 12)' },
    questions: [{
      question: String,
      options: [String],
      correctAnswer: Number
    }]
  }
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
