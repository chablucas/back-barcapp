const Comment = require('../models/Comment');
const User = require('../models/User');

exports.addComment = async (req, res) => {
    try {
        const { content, videoId } = req.body;
        const userId = req.user.id;

        const comment = new Comment({ content, userId, videoId });
        await comment.save();

        res.status(201).json({ message: "Commentaire ajouté", comment });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

exports.getComments = async (req, res) => {
    try {
        const { videoId } = req.params;
        const comments = await Comment.find({ videoId })
            .populate('userId', 'username')
            .sort({ createdAt: -1 });

        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};
