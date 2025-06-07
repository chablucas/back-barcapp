const express = require('express');
const router = express.Router();
const Widget = require('../models/Widget');
const verifyToken = require('../middleware/auth'); // ✅ AJOUTÉ
const isAdmin = require('../middleware/isAdmin');

// 🔓 Récupérer les données du match en direct
router.get('/match-live', async (req, res) => {
  try {
    const widget = await Widget.findOne();
    if (!widget || !widget.match) return res.status(404).json({ message: "Aucune donnée de match" });
    res.json(widget.match);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔓 Récupérer la composition
router.get('/lineup', async (req, res) => {
  try {
    const widget = await Widget.findOne();
    if (!widget || !widget.composition) return res.status(404).json({ message: "Aucune composition trouvée" });
    const lineup = Object.values(widget.composition);
    res.json({ lineup });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔓 Récupérer la série de victoires
router.get('/streak', async (req, res) => {
  try {
    const widget = await Widget.findOne();
    if (!widget || !widget.streak) return res.status(404).json({ message: "Aucune série trouvée" });
    res.json({ streak: widget.streak });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔓 (facultatif) Récupérer tous les widgets (ex: pour page admin)
router.get('/widgets', async (req, res) => {
  try {
    const widget = await Widget.findOne();
    if (!widget) return res.json({});
    res.json(widget);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔐 ADMIN : Mettre à jour le match en direct
router.patch('/match-live', verifyToken, isAdmin, async (req, res) => {
  try {
    const { homeTeam, awayTeam, score, competition, events } = req.body;
    let widget = await Widget.findOne();
    if (!widget) widget = new Widget();

    widget.match = { homeTeam, awayTeam, score, competition, events };
    await widget.save();

    res.json({ message: "Match mis à jour", match: widget.match });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔐 ADMIN : Mettre à jour la composition
router.patch('/lineup', verifyToken, isAdmin, async (req, res) => {
  try {
    const { composition } = req.body;
    let widget = await Widget.findOne();
    if (!widget) widget = new Widget();

    widget.composition = composition;
    await widget.save();

    res.json({ message: "Composition mise à jour", composition });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// 🔐 ADMIN : Ajouter un match à la série de victoires
router.post('/streak', verifyToken, isAdmin, async (req, res) => {
  try {
    const { match } = req.body;
    let widget = await Widget.findOne();
    if (!widget) widget = new Widget();

    widget.streak.unshift(match);
    if (widget.streak.length > 5) widget.streak = widget.streak.slice(0, 5);

    await widget.save();
    res.json({ message: "Série mise à jour", streak: widget.streak });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
