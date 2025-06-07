// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/user'); // ✅ au pluriel côté route
app.use('/api/users', userRoutes); // ✅ cohérent avec /users/me ou /users/favorites

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

// Test API
app.get('/', (req, res) => {
    res.send('API fonctionnelle !');
});

// Lancement serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
