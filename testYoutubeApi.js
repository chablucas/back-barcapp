const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
require('dotenv').config();

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = 'UC14UlmYlSNiQCBe9Eookf_A'; // Chaîne officielle FC Barcelone

const fetchVideos = async () => {
  const searchQuery = 'FC Barcelona highlights 2024/2025';
  const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet&type=video&maxResults=50&q=${encodeURIComponent(searchQuery)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items) {
    console.warn('⚠️ Aucune vidéo trouvée.');
    return;
  }

  const videos = data.items.map(item => ({
    title: item.snippet.title,
    description: item.snippet.description,
    videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    competition: 'Toutes', // 🏷️ Pour l'affichage dans l’app
    publishedAt: item.snippet.publishedAt,
    isShort: false,
    isPrivate: false
  }));

  fs.writeFileSync('videos.json', JSON.stringify(videos, null, 2));
  console.log(`✅ ${videos.length} vidéos enregistrées dans videos.json`);
};

fetchVideos();
