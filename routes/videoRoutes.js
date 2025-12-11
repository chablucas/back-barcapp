const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// ➕ Ajouter une vidéo
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, description, competition, videoUrl, isShort, publishedAt } = req.body;

    // Sécurité : on vérifie les champs de base
    if (!title || !videoUrl || !competition) {
      return res
        .status(400)
        .json({ message: 'Titre, lien de la vidéo et section (competition) sont obligatoires.' });
    }

    const newVideo = new Video({
      title,
      description,
      competition,
      videoUrl,
      // on force tout public, si le schéma a un isPrivate il prendra false
      isPrivate: false,
      // si le schéma a isShort, sinon il sera ignoré
      isShort: typeof isShort === 'boolean' ? isShort : false,
      // si le schéma a publishedAt, sinon il sera ignoré
      publishedAt: publishedAt ? new Date(publishedAt) : new Date()
    });

    const saved = await newVideo.save();
    return res.status(201).json({ message: 'Vidéo ajoutée avec succès', video: saved });
  } catch (err) {
    console.error('Erreur création vidéo:', err);
    // 👉 on renvoie aussi err.message pour qu’on puisse le lire côté front
    return res
      .status(500)
      .json({ message: 'Erreur serveur lors de la création de la vidéo.', error: err.message });
  }
});

// 📄 Récupérer toutes les vidéos normales (exclure les shorts)
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find({ isShort: false }).sort({ publishedAt: -1 });

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

    return res.json(videosWithExtras);
  } catch (err) {
    console.error('Erreur get vidéos:', err);
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔎 Récupérer les shorts uniquement
router.get('/shorts', async (req, res) => {
  try {
    const shorts = await Video.find({ isShort: true }).sort({ publishedAt: -1 });

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

    return res.json(videosWithExtras);
  } catch (err) {
    console.error('Erreur get shorts:', err);
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔎 Récupérer une vidéo par id
router.get('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Vidéo non trouvée' });
    }

    return res.json(video);
  } catch (err) {
    console.error('Erreur get vidéo:', err);
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🗑 Supprimer une vidéo (admin uniquement)
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Vidéo introuvable' });
    }

    return res.json({ message: 'Vidéo supprimée' });
  } catch (err) {
    console.error('Erreur delete vidéo:', err);
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 👍 Like
router.patch('/:id/like', verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Vidéo introuvable' });
    }

    const userId = req.user.id;

    // on enlève le dislike si présent
    video.dislikes = video.dislikes.filter(id => id.toString() !== userId);

    // toggle du like
    if (video.likes.some(id => id.toString() === userId)) {
      video.likes = video.likes.filter(id => id.toString() !== userId);
    } else {
      video.likes.push(userId);
    }

    await video.save();
    return res.json({
      message: 'Like mis à jour',
      likes: video.likes.length,
      dislikes: video.dislikes.length
    });
  } catch (err) {
    console.error('Erreur like vidéo:', err);
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 👎 Dislike
router.patch('/:id/dislike', verifyToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Vidéo introuvable' });
    }

    const userId = req.user.id;

    // on enlève le like si présent
    video.likes = video.likes.filter(id => id.toString() !== userId);

    // toggle du dislike
    if (video.dislikes.some(id => id.toString() === userId)) {
      video.dislikes = video.dislikes.filter(id => id.toString() !== userId);
    } else {
      video.dislikes.push(userId);
    }

    await video.save();
    return res.json({
      message: 'Dislike mis à jour',
      likes: video.likes.length,
      dislikes: video.dislikes.length
    });
  } catch (err) {
    console.error('Erreur dislike vidéo:', err);
    return res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 📥 Import de vidéos en masse
router.post('/import', async (req, res) => {
  try {
    const videos = req.body;

    for (const video of videos) {
      const exists = await Video.findOne({ videoUrl: video.videoUrl });
      if (!exists) {
        await Video.create(video);
      }
    }

    return res.status(200).json({ message: 'Vidéos importées avec succès' });
  } catch (err) {
    console.error('Erreur import vidéos:', err.message);
    return res.status(500).json({ error: 'Erreur lors de l’import des vidéos' });
  }
});

module.exports = router;
