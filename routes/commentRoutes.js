const express = require('express');
const router = express.Router();

const Comment = require('../models/Comment');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// GET /api/comments/:videoId
router.get('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    const comments = await Comment.find({ videoId })
      .populate('userId', 'username avatar')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error('Erreur GET /comments/:videoId :', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/comments
router.post('/', verifyToken, async (req, res) => {
  try {
    const connectedUser = await User.findById(req.user._id);

    if (!connectedUser) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    if (connectedUser.isBlocked === true) {
      return res.status(403).json({
        message: 'Votre compte est limité. Vous ne pouvez pas commenter.',
      });
    }

    const { content, videoId } = req.body;

    if (!content || !content.trim() || !videoId) {
      return res.status(400).json({
        message: 'Contenu et ID de la vidéo requis.',
      });
    }

    const comment = new Comment({
      content: content.trim(),
      videoId,
      userId: connectedUser._id,
    });

    await comment.save();

    const populatedComment = await comment.populate('userId', 'username avatar');

    res.status(201).json({
      message: 'Commentaire ajouté',
      comment: populatedComment,
    });
  } catch (err) {
    console.error('Erreur POST /comments :', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;