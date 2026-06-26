const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
const QuizQuestion = require('../models/QuizQuestion');
const User = require('../models/User');

const QUESTIONS_PER_DAY = 5;

const getTodayKey = () => {
  return new Date().toISOString().slice(0, 10);
};

// GET /api/quiz/today
router.get('/today', verifyToken, async (req, res) => {
  try {
    const todayKey = getTodayKey();
    const count = await QuizQuestion.countDocuments();

    if (count === 0) {
      return res.status(404).json({ message: 'Aucune question disponible.' });
    }

    const allQuestions = await QuizQuestion.find();

    const dayNumber = Math.floor(
      new Date(todayKey).getTime() / (1000 * 60 * 60 * 24)
    );

    const startIndex = (dayNumber * QUESTIONS_PER_DAY) % count;

    const todayQuestions = [];

    for (let i = 0; i < QUESTIONS_PER_DAY; i++) {
      todayQuestions.push(allQuestions[(startIndex + i) % count]);
    }

    const user = await User.findById(req.user._id).select(
      'quizScore quizStreak lastQuizDate lastQuizCorrect lastQuizResults'
    );

    res.json({
      questions: todayQuestions.map((q) => ({
        _id: q._id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
      })),
      alreadyAnswered: user.lastQuizDate === todayKey,
      quizScore: user.quizScore || 0,
      quizStreak: user.quizStreak || 0,
      lastQuizCorrect: user.lastQuizCorrect,
      lastQuizResults: user.lastQuizResults,
    });
  } catch (err) {
    console.error('Erreur GET /quiz/today:', err);
    res.status(500).json({ message: 'Erreur serveur quiz.' });
  }
});

// POST /api/quiz/answer
router.post('/answer', verifyToken, async (req, res) => {
  try {
    const { answers } = req.body;
    const todayKey = getTodayKey();

    if (!Array.isArray(answers) || answers.length !== QUESTIONS_PER_DAY) {
      return res.status(400).json({
        message: `Tu dois répondre aux ${QUESTIONS_PER_DAY} questions.`,
      });
    }

    const user = await User.findById(req.user._id);

    if (user.lastQuizDate === todayKey) {
      return res.status(400).json({
        message: 'Tu as déjà répondu au quiz du jour.',
      });
    }

    let correctCount = 0;

    for (const item of answers) {
      if (!item.questionId || typeof item.answer !== 'boolean') continue;

      const question = await QuizQuestion.findById(item.questionId);

      if (question && question.answer === item.answer) {
        correctCount += 1;
      }
    }

    let pointsEarned = 0;
    let currentStreak = user.quizStreak || 0;

    if (correctCount === QUESTIONS_PER_DAY) {
      for (let i = 0; i < correctCount; i++) {
        currentStreak += 1;
        pointsEarned += currentStreak >= 3 ? 1.5 : 1;
      }

      user.quizStreak = currentStreak;
    } else {
      for (let i = 0; i < correctCount; i++) {
        pointsEarned += 1;
      }

      user.quizStreak = 0;
    }

    user.quizScore = (user.quizScore || 0) + pointsEarned;
    user.lastQuizDate = todayKey;
    user.lastQuizCorrect = correctCount === QUESTIONS_PER_DAY;
    user.lastQuizResults = {
      correct: correctCount,
      total: QUESTIONS_PER_DAY,
      pointsEarned,
    };

    await user.save();

    res.json({
      correctCount,
      total: QUESTIONS_PER_DAY,
      pointsEarned,
      quizScore: user.quizScore,
      quizStreak: user.quizStreak,
      perfect: correctCount === QUESTIONS_PER_DAY,
      message:
        correctCount === QUESTIONS_PER_DAY
          ? `Parfait ! ${correctCount}/${QUESTIONS_PER_DAY} bonnes réponses.`
          : `${correctCount}/${QUESTIONS_PER_DAY} bonnes réponses. La série repart à 0.`,
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