const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Video = require('../models/Video');

const MONGO_URI = process.env.MONGO_URI; // 
const FILE_PATH = path.join(__dirname, 'videos.json');

const convertCompetitionName = (name, title) => {
  const lower = title.toLowerCase();

  if (/copa del rey|king|cup/i.test(lower)) return 'Coupe du Roi';
  if (/champions|ucl/i.test(lower)) return 'Ligue des Champions';
  if (/supercopa|supercup/i.test(lower)) return 'Supercoupe d’Espagne';
  if (/laliga|liga/i.test(lower)) return 'LaLiga';
  if (/avis|fan|reaction/i.test(lower)) return 'Avis Culers';

  return name || 'Autre';
};

const insertVideos = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB Atlas');

    const rawData = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));

    const data = rawData.map(video => ({
      title: video.title,
      description: video.description,
      competition: convertCompetitionName(video.competition, video.title),
      videoUrl: video.videoUrl,
      isShort: !!video.isShort,
      isPrivate: false,
      publishedAt: video.publishedAt || new Date()
    }));

    // Supprime les vidéos existantes avec la même URL
    for (const video of data) {
      const exists = await Video.findOne({ videoUrl: video.videoUrl });
      if (!exists) {
        await Video.create(video);
      }
    }

    console.log(`✅ ${data.length} vidéos insérées (nouvelles uniquement)`);

    mongoose.disconnect();
  } catch (err) {
    console.error('❌ Erreur insertion MongoDB :', err.message);
  }
};

insertVideos();
