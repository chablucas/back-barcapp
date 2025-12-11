const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/auth');

/**
 * GET /api/comments/:videoId
 * Récupérer tous les commentaires d'une vidéo
 */
router.get('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    const comments = await Comment.find({ videoId })
      .populate('userId', 'username avatar') // on récupère le pseudo + avatar
      .sort({ createdAt: -1 });              // les plus récents en premier

    res.json(comments);
  } catch (err) {
    console.error('Erreur GET /comments/:videoId :', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

/**
 * POST /api/comments
 * Ajouter un commentaire à une vidéo
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    // blocage des utilisateurs bannis
    if (req.user.isBlocked) {
      return res
        .status(403)
        .json({ message: 'Vous êtes bloqué et ne pouvez pas commenter.' });
    }

    const { content, videoId } = req.body;

    if (!content || !videoId) {
      return res
        .status(400)
        .json({ message: 'Contenu et ID de la vidéo requis.' });
    }

    const comment = new Comment({
      content,
      videoId,
      userId: req.user.id,
    });

    await comment.save();

    // on repopulate pour renvoyer username + avatar
    const populatedComment = await comment.populate('userId', 'username avatar');

    res
      .status(201)
      .json({ message: 'Commentaire ajouté', comment: populatedComment });
  } catch (err) {
    console.error('Erreur POST /comments :', err);
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
