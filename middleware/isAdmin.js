const User = require('../models/User');
const jwt = require('jsonwebtoken');

const isAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Token requis' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔍 On récupère l'utilisateur depuis la DB pour avoir son rôle
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
    }

    req.user = user; // 🔐 Ajoute les infos utiles dans req.user
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = isAdmin;
