const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.YOUTUBE_API_KEY;
const MAX_RESULTS = 50;
const OUTPUT_FILE = __dirname + '/videos.json';

const COMPETITIONS = [
  { name: 'LaLiga', query: 'barcelona laliga highlights 2024/2025' },
  { name: 'Ligue des Champions', query: 'barcelona champions league highlights 2024/2025' },
  { name: 'Coupe du Roi', query: 'barcelona copa del rey highlights 2024/2025' },
  { name: 'Supercoupe d’Espagne', query: 'barcelona supercopa highlights 2024/2025' }
];

const detectShort = (title, description) => {
  const t = title.toLowerCase();
  const d = description.toLowerCase();
  return t.includes('#short') || t.includes('#shorts') || d.includes('#short') || d.includes('#shorts');
};

const isFeminineTeam = (title, description) => {
  const t = title.toLowerCase();
  const d = description.toLowerCase();

  return (
    t.includes('féminin') || d.includes('féminin') ||
    t.includes('féminine') || d.includes('féminine') ||
    t.includes('femenino') || d.includes('femenino') ||
    t.includes('feminin') || d.includes('feminin') ||
    t.includes('fem') || d.includes('fem') ||
    t.includes('women') || d.includes('women') ||
    t.includes('ladies') || d.includes('ladies') ||
    t.includes('uwcl') || d.includes('uwcl') ||
    t.includes('liga f') || d.includes('liga f') ||
    t.includes('copa de la reina') || d.includes('copa de la reina') ||
    t.includes('supercopa femenina') || d.includes('supercopa femenina')
  );
};

const detectOfficialCompetition = (title, competitionName) => {
  const t = title.toLowerCase();
  switch (competitionName) {
    case 'LaLiga':
      return t.includes('laliga') || t.includes('liga');
    case 'Ligue des Champions':
      return t.includes('champions') || t.includes('ucl');
    case 'Coupe du Roi':
      return t.includes('copa del rey') || t.includes('king') || t.includes('cup');
    case 'Supercoupe d’Espagne':
      return t.includes('supercopa') || t.includes('supercup');
    default:
      return false;
  }
};

const getYouTubeVideos = async (query, competitionName) => {
  let nextPageToken = '';
  let allVideos = [];
  let page = 1;

  do {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${MAX_RESULTS}&q=FC Barcelone ${encodeURIComponent(query)}&key=${API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    console.log(`📡 Page ${page} URL: ${url}`);

    try {
      const res = await axios.get(url);
      const items = res.data.items || [];

      const filtered = items.filter(item => {
        const title = item.snippet.title;
        const description = item.snippet.description;
        const t = title.toLowerCase();

        return (
          (t.includes('barça') || t.includes('barcelona') || t.includes('fc barcelone')) &&
          !isFeminineTeam(title, description)
        );
      });

      const formatted = filtered.map(item => {
        const { title, description, publishedAt } = item.snippet;
        const videoId = item.id.videoId;
        const t = title.toLowerCase();

        const isShort = detectShort(title, description);
        const hasHashtag = t.includes('#') && !isShort;
        const isOfficial = detectOfficialCompetition(title, competitionName);

        let category = 'Avis Culers';

        if (isShort) {
          category = competitionName;
        } else if (hasHashtag) {
          category = 'Avis Culers';
        } else if (isOfficial) {
          category = competitionName;
        }

        return {
          title,
          description,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          competition: category,
          publishedAt,
          isShort
        };
      });

      allVideos.push(...formatted);
      nextPageToken = res.data.nextPageToken || '';
      page++;

    } catch (err) {
      console.error('❌ Erreur:', err.response?.data || err.message);
      break;
    }

  } while (nextPageToken && allVideos.length < 500);

  return allVideos;
};

const fetchAll = async () => {
  let all = [];

  console.log('🔑 Clé API :', API_KEY);

  for (const { name, query } of COMPETITIONS) {
    console.log(`🔍 Recherche pour ${name}...`);
    const videos = await getYouTubeVideos(query, name);
    console.log(`✅ ${videos.length} vidéos traitées pour ${name}`);
    all.push(...videos);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(all, null, 2), 'utf-8');
  console.log(`🎉 ${all.length} vidéos enregistrées dans videos.json`);
};

fetchAll();
