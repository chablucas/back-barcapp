const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ☁️ Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🎯 Stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const folder = file.fieldname === 'banner'
      ? 'barcapp/banners'
      : 'barcapp/avatars';

    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `${req.user.id}_${file.fieldname}_${Date.now()}`,
    };
  },
});

const upload = multer({ storage });

// 🔐 GET /users/me — Profil connecté
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('likes', 'title')
      .populate('favorites', 'title');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

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
    if (req.body.banner) updates.banner = req.body.banner;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true })
      .select('-password')
      .populate('likes', 'title')
      .populate('favorites', 'title');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🖼 PATCH /users/me/avatar — Upload avatar Cloudinary
router.patch('/me/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Aucun fichier envoyé.' });
    }

    const avatarUrl = req.file.path;

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

// 🌄 PATCH /users/me/banner — Upload bannière Cloudinary
router.patch('/me/banner', verifyToken, upload.single('banner'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Aucun fichier envoyé.' });
    }

    const bannerUrl = req.file.path;

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

// 🔎 GET /users/search?q=... — Rechercher des utilisateurs
router.get('/search', verifyToken, async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({ message: 'Recherche trop courte.' });
    }

    const users = await User.find({
      _id: { $ne: req.user.id },
      username: { $regex: query.trim(), $options: 'i' },
      isBlocked: false,
    })
      .select('username avatar role')
      .limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({
      message: 'Erreur recherche utilisateur',
      error: err.message,
    });
  }
});

// 🛡 Middleware admin local
const verifyAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: 'Erreur vérification admin', error: err.message });
  }
};

// 👥 GET /users/admin/all — Liste tous les utilisateurs
router.get('/admin/all', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Erreur récupération utilisateurs', error: err.message });
  }
});

// 🚫 PATCH /users/admin/:id/block — Bloquer / débloquer
router.patch('/admin/:id/block', verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Tu ne peux pas te bloquer toi-même.' });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: user.isBlocked ? 'Utilisateur bloqué.' : 'Utilisateur débloqué.',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur blocage utilisateur', error: err.message });
  }
});

// 👑 PATCH /users/admin/:id/role — Changer rôle user/admin
router.patch('/admin/:id/role', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide.' });
    }

    if (req.params.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ message: 'Tu ne peux pas retirer ton propre rôle admin.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    res.json({
      message: 'Rôle mis à jour.',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur modification rôle', error: err.message });
  }
});

// 📄 GET /users/:id/likes — Vidéos likées par un user
router.get('/:id/likes', async (req, res) => {
  try {
    const userId = req.params.id;

    const videos = await Video.find({
      likes: userId,
      isPrivate: false,
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
          commentCount,
        };
      })
    );

    res.json(videosWithCounts);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 👤 GET /users/:id — Profil public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'username avatar banner'
    );

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: 'Erreur récupération profil public',
      error: err.message,
    });
  }
});

module.exports = router;