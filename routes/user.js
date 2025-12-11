const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Video = require('../models/Video');
const Comment = require('../models/Comment'); // ✅ nécessaire pour les commentaires
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const multer = require('multer');
const path = require('path');

// 🌍 URL publique du backend (utilisée pour générer l'URL des images)
const PUBLIC_BACK_URL = process.env.BACK_PUBLIC_URL || 'https://back-barcapp.onrender.com';

// 🎯 Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}_${file.fieldname}${ext}`);
  }
});
const upload = multer({ storage });


// 🔐 GET /users/me — Profil connecté
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('likes', 'title')
      .populate('favorites', 'title');

    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// 🔧 PATCH /users/me — Modifier pseudo ou avatar par URL
router.patch('/me', verifyToken, async (req, res) => {
  try {
    const updates = {};
    if (req.body.username) updates.username = req.body.username;
    if (req.body.avatar) updates.avatar = req.body.avatar;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
      .select('-password')
      .populate('likes', 'title')
      .populate('favorites', 'title');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});


// 🖼 PATCH /users/me/avatar — Upload avatar image
router.patch('/me/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier envoyé.' });
    }

    const avatarUrl = `${PUBLIC_BACK_URL}/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    )
      .select('-password')
      .populate('likes', 'title')
      .populate('favorites', 'title');

    res.json({ message: 'Avatar mis à jour', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur avatar', error: err.message });
  }
});


// 🌄 PATCH /users/me/banner — Upload bannière
router.patch('/me/banner', verifyToken, upload.single('banner'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier envoyé.' });
    }

    const bannerUrl = `${PUBLIC_BACK_URL}/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { banner: bannerUrl },
      { new: true }
    )
      .select('-password')
      .populate('likes', 'title')
      .populate('favorites', 'title');

    res.json({ message: 'Bannière mise à jour', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur bannière', error: err.message });
  }
});


// 📄 GET /users/:id/likes — Vidéos likées par un user
router.get('/:id/likes', async (req, res) => {
  try {
    const userId = req.params.id;

    const videos = await Video.find({
      likes: userId,
      isPrivate: false
    }).sort({ createdAt: -1 });

    const videosWithCounts = await Promise.all(
      videos.map(async (video) => {
        const commentCount = await Comment.countDocuments({ videoId: video._id });
        return {
          _id: video._id,
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          competition: video.competition,
          createdAt: video.createdAt,
          likesCount: video.likes.length,
          dislikesCount: video.dislikes.length,
          commentCount
        };
      })
    );

    res.json(videosWithCounts);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
