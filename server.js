// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      origin === 'https://front-barcapp.vercel.app' ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Non autorisé par CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/user'); 
app.use('/api/users', userRoutes); 

const videoRoutes = require('./routes/videoRoutes');
app.use('/api/videos', videoRoutes);

const commentRoutes = require('./routes/commentRoutes');
app.use('/api/comments', commentRoutes);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const passport = require('passport');
require('./config/passport');
app.use(passport.initialize());

const barcaRoutes = require('./routes/barca');
app.use('/api/barca', barcaRoutes);

app.use('/api/conversations', require('./routes/conversation'));
app.use('/api/quiz', require('./routes/quiz'));

// Test API
app.get('/', (req, res) => {
    res.send('API fonctionnelle !');
});

// Lancement serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
