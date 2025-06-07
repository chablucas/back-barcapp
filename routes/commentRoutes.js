const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/auth');

router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.isBlocked) {
            return res.status(403).json({ message: "Vous êtes bloqué et ne pouvez pas commenter." });
        }

        const { content, videoId } = req.body;
        if (!content || !videoId) {
            return res.status(400).json({ message: "Contenu et ID de la vidéo requis." });
        }

        const comment = new Comment({
            content,
            videoId,
            userId: req.user.id
        });

        await comment.save();
        res.status(201).json({ message: "Commentaire ajouté", comment });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
});

module.exports = router;
