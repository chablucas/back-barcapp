const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },

    avatar: { type: String },
    banner: { type: String }, 

    quizScore: { type: Number, default: 0 },
    quizStreak: { type: Number, default: 0 },
    lastQuizDate: { type: String, default: null },
    lastQuizCorrect: { type: Boolean, default: null },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],

    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);