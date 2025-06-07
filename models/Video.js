const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  competition: {
    type: String,
    enum: ['LaLiga', 'Ligue des Champions', 'Coupe du Roi', 'Supercoupe d’Espagne', 'Avis Culers', 'Autre'],
    default: 'Autre'
  },
  videoUrl: { type: String, required: true, unique: true },
  isPrivate: { type: Boolean, default: true },
  isShort: { type: Boolean, default: false },
  publishedAt: { type: Date },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Video', videoSchema);
