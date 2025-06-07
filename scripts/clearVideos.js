const mongoose = require('mongoose');
const Video = require('../models/Video');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cda-project';

const clearVideos = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    const result = await Video.deleteMany({});
    console.log(`🗑️ ${result.deletedCount} vidéos supprimées.`);

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Erreur suppression :', err.message);
  }
};

clearVideos();
