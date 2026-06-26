const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
const QuizQuestion = require('../models/QuizQuestion');
const User = require('../models/User');

const getTodayKey = () => {
  const now = new Date();
  return now.toISOString().slice(0, 10); // ex: 2026-06-26
};

// GET /api/quiz/today
router.get('/today', verifyToken, async (req, res) => {
  try {
    const todayKey = getTodayKey();

    const count = await QuizQuestion.countDocuments();

    if (count === 0) {
      return res.status(404).json({
        message: 'Aucune question disponible.',
      });
    }

    // Même question pour tout le monde chaque jour
    const dayNumber = Math.floor(new Date(todayKey).getTime() / (1000 * 60 * 60 * 24));
    const index = dayNumber % count;

    const question = await QuizQuestion.findOne().skip(index);

    const user = await User.findById(req.user._id).select(
      'quizScore quizStreak lastQuizDate lastQuizCorrect'
    );

    const alreadyAnswered = user.lastQuizDate === todayKey;

    res.json({
      question: {
        _id: question._id,
        question: question.question,
        category: question.category,
        difficulty: question.difficulty,
      },
      alreadyAnswered,
      lastQuizCorrect: user.lastQuizCorrect,
      quizScore: user.quizScore || 0,
      quizStreak: user.quizStreak || 0,
    });
  } catch (err) {
    console.error('Erreur GET /quiz/today:', err);
    res.status(500).json({ message: 'Erreur serveur quiz.' });
  }
});

// POST /api/quiz/answer
router.post('/answer', verifyToken, async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    const todayKey = getTodayKey();

    if (!questionId || typeof answer !== 'boolean') {
      return res.status(400).json({
        message: 'questionId et answer sont requis.',
      });
    }

    const user = await User.findById(req.user._id);

    if (user.lastQuizDate === todayKey) {
      return res.status(400).json({
        message: 'Tu as déjà répondu à la question du jour.',
      });
    }

    const question = await QuizQuestion.findById(questionId);

    if (!question) {
      return res.status(404).json({
        message: 'Question introuvable.',
      });
    }

    const isCorrect = question.answer === answer;

    let pointsEarned = 0;

    if (isCorrect) {
      user.quizStreak = (user.quizStreak || 0) + 1;
      pointsEarned = user.quizStreak >= 3 ? 1.5 : 1;
      user.quizScore = (user.quizScore || 0) + pointsEarned;
    } else {
      user.quizStreak = 0;
    }

    user.lastQuizDate = todayKey;
    user.lastQuizCorrect = isCorrect;

    await user.save();

    res.json({
      isCorrect,
      correctAnswer: question.answer,
      pointsEarned,
      quizScore: user.quizScore,
      quizStreak: user.quizStreak,
      message: isCorrect
        ? `Bonne réponse ! +${pointsEarned} point${pointsEarned > 1 ? 's' : ''}`
        : 'Mauvaise réponse. La série repart à 0.',
    });
  } catch (err) {
    console.error('Erreur POST /quiz/answer:', err);
    res.status(500).json({ message: 'Erreur serveur quiz.' });
  }
});

// GET /api/quiz/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({ quizScore: { $gt: 0 } })
      .sort({ quizScore: -1, quizStreak: -1 })
      .limit(3)
      .select('username avatar quizScore quizStreak');

    res.json(topUsers);
  } catch (err) {
    console.error('Erreur GET /quiz/leaderboard:', err);
    res.status(500).json({ message: 'Erreur serveur classement quiz.' });
  }
});

module.exports = router;