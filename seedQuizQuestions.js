const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const QuizQuestion = require('./models/QuizQuestion');

dotenv.config();

const questions = [
  {
    question: "Le FC Barcelone a été fondé en 1899.",
    answer: true,
    category: "Histoire",
    difficulty: "easy",
  },
  {
    question: "Le Camp Nou a été inauguré en 1957.",
    answer: true,
    category: "Stade",
    difficulty: "easy",
  },
  {
    question: "Lionel Messi a remporté 4 Ligues des Champions avec le FC Barcelone.",
    answer: true,
    category: "Joueurs",
    difficulty: "easy",
  },
  {
    question: "Ronaldinho portait le numéro 11 au FC Barcelone.",
    answer: false,
    category: "Joueurs",
    difficulty: "easy",
  },
  {
    question: "Xavi Hernández a été formé à La Masia.",
    answer: true,
    category: "Joueurs",
    difficulty: "easy",
  },
];

const seedQuizQuestions = async () => {
  try {
    await connectDB();

    await QuizQuestion.deleteMany();
    await QuizQuestion.insertMany(questions);

    console.log(`${questions.length} questions ajoutées avec succès !`);

    await mongoose.connection.close();
    process.exit();
  } catch (err) {
    console.error("Erreur seed quiz :", err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedQuizQuestions();