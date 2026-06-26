const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const QuizQuestion = require('./models/QuizQuestion');

dotenv.config();

const questions = [
  { question: "Le FC Barcelone a été fondé en 1899.", answer: true, category: "Histoire", difficulty: "easy" },
  { question: "Le fondateur du FC Barcelone est Joan Gamper.", answer: true, category: "Histoire", difficulty: "easy" },
  { question: "Le FC Barcelone a été fondé en 1905.", answer: false, category: "Histoire", difficulty: "easy" },
  { question: "Le Camp Nou a été inauguré en 1957.", answer: true, category: "Stade", difficulty: "easy" },
  { question: "Le Camp Nou est le stade historique du Real Madrid.", answer: false, category: "Stade", difficulty: "easy" },

  { question: "Le FC Barcelone est surnommé le Barça.", answer: true, category: "Culture", difficulty: "easy" },
  { question: "La devise du FC Barcelone est « Més que un club ».", answer: true, category: "Culture", difficulty: "easy" },
  { question: "Le FC Barcelone joue traditionnellement en bleu et grenat.", answer: true, category: "Culture", difficulty: "easy" },
  { question: "Le Real Madrid est le plus grand rival historique du Barça.", answer: true, category: "Rivalité", difficulty: "easy" },
  { question: "Le derby catalan oppose le Barça à l’Espanyol.", answer: true, category: "Rivalité", difficulty: "easy" },

  { question: "Lionel Messi a été formé à La Masia.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Xavi Hernández a été formé à La Masia.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Andrés Iniesta a été formé à La Masia.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Carles Puyol a été formé à La Masia.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Sergio Busquets a été formé à La Masia.", answer: true, category: "Joueurs", difficulty: "easy" },

  { question: "Ronaldinho a porté le numéro 10 au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Ronaldinho a porté le numéro 7 au FC Barcelone.", answer: false, category: "Joueurs", difficulty: "easy" },
  { question: "Lionel Messi a porté le numéro 10 au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Neymar a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Luis Suárez a joué avec Messi et Neymar au Barça.", answer: true, category: "Joueurs", difficulty: "easy" },

  { question: "Le trio Messi, Suárez et Neymar était surnommé la MSN.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "La MSN était composée de Messi, Eto’o et Ronaldinho.", answer: false, category: "Joueurs", difficulty: "easy" },
  { question: "Samuel Eto’o a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Thierry Henry a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Zlatan Ibrahimović a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "medium" },

  { question: "Pep Guardiola a été joueur puis entraîneur du FC Barcelone.", answer: true, category: "Entraîneurs", difficulty: "easy" },
  { question: "Pep Guardiola a entraîné le Barça lors du sextuplé de 2009.", answer: true, category: "Entraîneurs", difficulty: "medium" },
  { question: "Johan Cruyff a été entraîneur du FC Barcelone.", answer: true, category: "Entraîneurs", difficulty: "easy" },
  { question: "Johan Cruyff n’a jamais joué au FC Barcelone.", answer: false, category: "Joueurs", difficulty: "medium" },
  { question: "Luis Enrique a entraîné le FC Barcelone.", answer: true, category: "Entraîneurs", difficulty: "easy" },

  { question: "Le Barça a remporté la Ligue des Champions 2006.", answer: true, category: "Trophées", difficulty: "easy" },
  { question: "Le Barça a remporté la Ligue des Champions 2009.", answer: true, category: "Trophées", difficulty: "easy" },
  { question: "Le Barça a remporté la Ligue des Champions 2011.", answer: true, category: "Trophées", difficulty: "easy" },
  { question: "Le Barça a remporté la Ligue des Champions 2015.", answer: true, category: "Trophées", difficulty: "easy" },
  { question: "Le Barça a remporté la Ligue des Champions 2018.", answer: false, category: "Trophées", difficulty: "easy" },

  { question: "La finale de Ligue des Champions 2009 opposait le Barça à Manchester United.", answer: true, category: "Matchs historiques", difficulty: "medium" },
  { question: "La finale de Ligue des Champions 2011 opposait le Barça à Manchester United.", answer: true, category: "Matchs historiques", difficulty: "medium" },
  { question: "La finale de Ligue des Champions 2015 opposait le Barça à la Juventus.", answer: true, category: "Matchs historiques", difficulty: "medium" },
  { question: "Le Barça a battu Arsenal en finale de Ligue des Champions 2006.", answer: true, category: "Matchs historiques", difficulty: "medium" },
  { question: "Le Barça a gagné la Ligue des Champions 2015 avec Luis Enrique.", answer: true, category: "Trophées", difficulty: "medium" },

  { question: "Le Barça a réalisé un sextuplé en 2009.", answer: true, category: "Trophées", difficulty: "medium" },
  { question: "Le sextuplé du Barça a eu lieu en 2015.", answer: false, category: "Trophées", difficulty: "medium" },
  { question: "Le Barça a remporté un triplé en 2009.", answer: true, category: "Trophées", difficulty: "easy" },
  { question: "Le Barça a remporté un triplé en 2015.", answer: true, category: "Trophées", difficulty: "easy" },
  { question: "Le Barça n’a jamais remporté de triplé.", answer: false, category: "Trophées", difficulty: "easy" },

  { question: "La remontada contre le PSG a eu lieu en 2017.", answer: true, category: "Matchs historiques", difficulty: "easy" },
  { question: "Lors de la remontada, le Barça a battu le PSG 6-1 au retour.", answer: true, category: "Matchs historiques", difficulty: "easy" },
  { question: "La remontada contre le PSG était en finale de Ligue des Champions.", answer: false, category: "Matchs historiques", difficulty: "easy" },
  { question: "Sergi Roberto a marqué le dernier but de la remontada contre le PSG.", answer: true, category: "Matchs historiques", difficulty: "medium" },
  { question: "Neymar a joué un rôle important dans la remontada contre le PSG.", answer: true, category: "Matchs historiques", difficulty: "medium" },

  { question: "La Masia est le centre de formation du FC Barcelone.", answer: true, category: "Formation", difficulty: "easy" },
  { question: "La Masia est le nom du stade du Barça.", answer: false, category: "Formation", difficulty: "easy" },
  { question: "Lamine Yamal est issu de La Masia.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Gavi est issu de La Masia.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Pedri a été formé à La Masia dès l’enfance.", answer: false, category: "Joueurs", difficulty: "medium" },

  { question: "Joan Laporta a été président du FC Barcelone.", answer: true, category: "Présidents", difficulty: "easy" },
  { question: "Josep Maria Bartomeu a été président du FC Barcelone.", answer: true, category: "Présidents", difficulty: "medium" },
  { question: "Sandro Rosell a été président du FC Barcelone.", answer: true, category: "Présidents", difficulty: "medium" },
  { question: "Florentino Pérez a été président du FC Barcelone.", answer: false, category: "Présidents", difficulty: "easy" },
  { question: "Joan Gamper a été président du FC Barcelone.", answer: true, category: "Présidents", difficulty: "medium" },

  { question: "Rivaldo a remporté le Ballon d’Or lorsqu’il jouait au Barça.", answer: true, category: "Joueurs", difficulty: "medium" },
  { question: "Ronaldinho a remporté le Ballon d’Or lorsqu’il jouait au Barça.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Lionel Messi a remporté plusieurs Ballons d’Or avec le Barça.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Xavi a remporté le Ballon d’Or.", answer: false, category: "Joueurs", difficulty: "medium" },
  { question: "Iniesta a remporté le Ballon d’Or.", answer: false, category: "Joueurs", difficulty: "medium" },

  { question: "Ronaldo Nazário a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "medium" },
  { question: "Romário a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "medium" },
  { question: "Diego Maradona a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "medium" },
  { question: "Cristiano Ronaldo a joué au FC Barcelone.", answer: false, category: "Joueurs", difficulty: "easy" },
  { question: "Kylian Mbappé a joué au FC Barcelone.", answer: false, category: "Joueurs", difficulty: "easy" },

  { question: "Gerard Piqué a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Dani Alves a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Jordi Alba a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Marc-André ter Stegen a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Iker Casillas a joué au FC Barcelone.", answer: false, category: "Joueurs", difficulty: "easy" },

  { question: "Le Barça a longtemps eu Unicef sur son maillot.", answer: true, category: "Culture", difficulty: "medium" },
  { question: "Le Barça a toujours eu un sponsor commercial sur son maillot depuis sa création.", answer: false, category: "Culture", difficulty: "medium" },
  { question: "Le Barça est un club catalan.", answer: true, category: "Culture", difficulty: "easy" },
  { question: "Le FC Barcelone est basé à Madrid.", answer: false, category: "Culture", difficulty: "easy" },
  { question: "Le Barça joue ses matchs à domicile à Barcelone.", answer: true, category: "Culture", difficulty: "easy" },

  { question: "Le Barça a remporté la Coupe du Roi plusieurs fois.", answer: true, category: "Trophées", difficulty: "easy" },
  { question: "La Coupe du Roi est une compétition espagnole.", answer: true, category: "Trophées", difficulty: "easy" },
  { question: "La Liga est le championnat d’Espagne.", answer: true, category: "Trophées", difficulty: "easy" },
  { question: "Le Barça n’a jamais gagné la Liga.", answer: false, category: "Trophées", difficulty: "easy" },
  { question: "Le Barça a gagné plus d’une Ligue des Champions.", answer: true, category: "Trophées", difficulty: "easy" },

  { question: "Frank Rijkaard a entraîné le FC Barcelone.", answer: true, category: "Entraîneurs", difficulty: "medium" },
  { question: "Frank Rijkaard était l’entraîneur du Barça lors de la Ligue des Champions 2006.", answer: true, category: "Entraîneurs", difficulty: "medium" },
  { question: "Ernesto Valverde a entraîné le FC Barcelone.", answer: true, category: "Entraîneurs", difficulty: "medium" },
  { question: "Ronald Koeman a entraîné le FC Barcelone.", answer: true, category: "Entraîneurs", difficulty: "medium" },
  { question: "José Mourinho a entraîné l’équipe première du FC Barcelone.", answer: false, category: "Entraîneurs", difficulty: "medium" },

  { question: "Xavi Hernández a entraîné le FC Barcelone.", answer: true, category: "Entraîneurs", difficulty: "easy" },
  { question: "Hansi Flick a été nommé entraîneur du FC Barcelone en 2024.", answer: true, category: "Entraîneurs", difficulty: "medium" },
  { question: "Luis Enrique a remporté la Ligue des Champions 2015 avec le Barça.", answer: true, category: "Entraîneurs", difficulty: "medium" },
  { question: "Pep Guardiola n’a jamais gagné la Ligue des Champions avec le Barça.", answer: false, category: "Entraîneurs", difficulty: "easy" },
  { question: "Johan Cruyff a influencé l’identité de jeu du Barça.", answer: true, category: "Histoire", difficulty: "medium" },

  { question: "Le Barça a remporté sa première Ligue des Champions en 1992.", answer: true, category: "Trophées", difficulty: "medium" },
  { question: "La finale de 1992 a eu lieu à Wembley.", answer: true, category: "Matchs historiques", difficulty: "hard" },
  { question: "Ronald Koeman a marqué le but décisif en finale de Coupe d’Europe 1992.", answer: true, category: "Matchs historiques", difficulty: "hard" },
  { question: "Le Barça a gagné sa première Ligue des Champions contre l’AC Milan en 1992.", answer: false, category: "Matchs historiques", difficulty: "hard" },
  { question: "La Dream Team de Cruyff a marqué l’histoire du Barça.", answer: true, category: "Histoire", difficulty: "medium" },

  { question: "Carles Puyol était défenseur central.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Xavi jouait principalement gardien de but.", answer: false, category: "Joueurs", difficulty: "easy" },
  { question: "Iniesta jouait principalement au milieu de terrain.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Sergio Busquets jouait principalement milieu défensif.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Dani Alves jouait principalement arrière droit.", answer: true, category: "Joueurs", difficulty: "easy" },

  { question: "Ousmane Dembélé a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Antoine Griezmann a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Robert Lewandowski a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Raphinha a joué au FC Barcelone.", answer: true, category: "Joueurs", difficulty: "easy" },
  { question: "Vinícius Júnior a joué au FC Barcelone.", answer: false, category: "Joueurs", difficulty: "easy" }
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
    console.error('Erreur seed quiz :', err);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedQuizQuestions();