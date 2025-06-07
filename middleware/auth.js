// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(403).json({ message: 'Token manquant' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupère l'utilisateur complet (avec son rôle)
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    req.user = user; // ✅ on enregistre l'objet complet
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = verifyToken;
