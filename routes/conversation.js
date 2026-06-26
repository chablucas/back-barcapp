const express = require('express');
const router = express.Router();

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// 📋 GET /conversations — conversations de l'utilisateur connecté
router.get('/', verifyToken, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
      .populate('participants', 'username avatar role')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({
      message: 'Erreur récupération conversations',
      error: err.message,
    });
  }
});

// ➕ POST /conversations/start/:userId — créer ou ouvrir une conversation
router.post('/start/:userId', verifyToken, async (req, res) => {
  try {
    const otherUserId = req.params.userId;

    if (otherUserId === req.user.id) {
      return res.status(400).json({ message: 'Impossible de discuter avec soi-même.' });
    }

    const otherUser = await User.findById(otherUserId);

    if (!otherUser || otherUser.isBlocked) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, otherUserId] },
    }).populate('participants', 'username avatar role');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, otherUserId],
      });

      conversation = await conversation.populate('participants', 'username avatar role');
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({
      message: 'Erreur création conversation',
      error: err.message,
    });
  }
});

// 💬 GET /conversations/:id/messages — messages d'une conversation
router.get('/:id/messages', verifyToken, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable.' });
    }

    const messages = await Message.find({
      conversation: req.params.id,
    })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({
      message: 'Erreur récupération messages',
      error: err.message,
    });
  }
});

// ✉️ POST /conversations/:id/messages — envoyer un message
router.post('/:id/messages', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message vide.' });
    }

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      participants: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation introuvable.' });
    }

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user.id,
      content: content.trim(),
    });

    conversation.lastMessage = content.trim();
    await conversation.save();

    const populatedMessage = await message.populate('sender', 'username avatar');

    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(500).json({
      message: 'Erreur envoi message',
      error: err.message,
    });
  }
});

module.exports = router;