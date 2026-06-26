const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: Boolean, required: true },
    category: { type: String, default: 'Barça' },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.QuizQuestion ||
  mongoose.model('QuizQuestion', quizQuestionSchema);