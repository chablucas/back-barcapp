const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Video = require('../models/Video');

const MONGO_URI = process.env.MONGO_URI;
const FILE_PATH = path.join(__dirname, 'videos.json');

// Convertit le nom de la compétition
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

    // Lecture du JSON
    const rawData = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8'));

    // 1️⃣ Normalisation des données
    const data = rawData.map(video => ({
      title: video.title,
      description: video.description,
      competition: convertCompetitionName(video.competition, video.title),
      videoUrl: video.videoUrl,
      isShort: !!video.isShort,
      isPrivate: false,
      publishedAt: video.publishedAt || new Date()
    }));

    // 2️⃣ Dédoublonnage interne au fichier (même videoUrl dans videos.json)
    const uniqueData = [];
    const seenUrlsInFile = new Set();

    for (const video of data) {
      if (!video.videoUrl) continue; // sécurité
      if (seenUrlsInFile.has(video.videoUrl)) continue;
      seenUrlsInFile.add(video.videoUrl);
      uniqueData.push(video);
    }

    console.log(`ℹ️ ${uniqueData.length} vidéos uniques trouvées dans le fichier (après dédoublonnage interne).`);

    // 3️⃣ Récupérer toutes les URLs déjà présentes en BDD (1 seule requête)
    const existing = await Video.find({}, 'videoUrl');
    const existingUrls = new Set(existing.map(v => v.videoUrl));

    // 4️⃣ Filtrer uniquement les vidéos qui ne sont pas encore en BDD
    const newVideos = uniqueData.filter(video => !existingUrls.has(video.videoUrl));

    if (newVideos.length === 0) {
      console.log('ℹ️ Aucune nouvelle vidéo à insérer (tout est déjà en base).');
      await mongoose.disconnect();
      return;
    }

    // 5️⃣ InsertMany en une fois (sans doublons)
    await Video.insertMany(newVideos);
    console.log(`🎉 ${newVideos.length} nouvelles vidéos insérées !`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Erreur insertion MongoDB :', err.message);
    await mongoose.disconnect();
  }
};

insertVideos();
