const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// ➕ Ajouter une vidéo
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, competition, videoUrl, isPrivate, isShort, publishedAt } = req.body;
    const newVideo = new Video({
      title,
      description,
      competition,
      videoUrl,
      isPrivate: isPrivate ?? true,
      isShort: isShort ?? false,
      publishedAt: publishedAt ?? new Date()
    });
    await newVideo.save();
    res.status(201).json({ message: 'Vidéo ajoutée avec succès', video: newVideo });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 📄 Récupérer toutes les vidéos normales (exclure les shorts)
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find({ isPrivate: false, isShort: false }).sort({ publishedAt: -1 });

    const videosWithExtras = await Promise.all(
      videos.map(async (video) => {
        const commentCount = await Comment.countDocuments({ videoId: video._id });

        return {
          _id: video._id,
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          competition: video.competition,
          createdAt: video.createdAt,
          publishedAt: video.publishedAt,
          likesCount: video.likes.length,
          dislikesCount: video.dislikes.length,
          commentCount,
          isShort: video.isShort ?? false
        };
      })
    );

    res.json(videosWithExtras);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔎 Récupérer les shorts uniquement
router.get('/shorts', async (req, res) => {
  try {
    const shorts = await Video.find({ isPrivate: false, isShort: true }).sort({ publishedAt: -1 });

    const videosWithExtras = await Promise.all(
      shorts.map(async (video) => {
        const commentCount = await Comment.countDocuments({ videoId: video._id });

        return {
          _id: video._id,
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          competition: video.competition,
          createdAt: video.createdAt,
          publishedAt: video.publishedAt,
          likesCount: video.likes.length,
          dislikesCount: video.dislikes.length,
          commentCount,
          isShort: true
        };
      })
    );

    res.json(videosWithExtras);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔎 Récupérer une vidéo
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Vidéo non trouvée' });

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🗑 Supprimer une vidéo (admin)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) return res.status(404).json({ message: "Vidéo introuvable" });

    res.json({ message: 'Vidéo supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 👍 Like
router.patch('/:id/like', verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Vidéo introuvable" });

    const userId = req.user.id;
    video.dislikes = video.dislikes.filter(id => id.toString() !== userId);

    if (video.likes.includes(userId)) {
      video.likes = video.likes.filter(id => id.toString() !== userId);
    } else {
      video.likes.push(userId);
    }

    await video.save();
    res.json({ message: 'Like mis à jour', likes: video.likes.length, dislikes: video.dislikes.length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 👎 Dislike
router.patch('/:id/dislike', verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Vidéo introuvable" });

    const userId = req.user.id;
    video.likes = video.likes.filter(id => id.toString() !== userId);

    if (video.dislikes.includes(userId)) {
      video.dislikes = video.dislikes.filter(id => id.toString() !== userId);
    } else {
      video.dislikes.push(userId);
    }

    await video.save();
    res.json({ message: 'Dislike mis à jour', likes: video.likes.length, dislikes: video.dislikes.length });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/videos/import
router.post('/import', async (req, res) => {
  try {
    const videos = req.body;

    for (const video of videos) {
      const exists = await Video.findOne({ videoUrl: video.videoUrl });
      if (!exists) {
        await Video.create(video);
      }
    }

    res.status(200).json({ message: 'Vidéos importées avec succès' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur lors de l’import des vidéos' });
  }
});

module.exports = router;
