// fixIsShort.js
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/cda-project'); // adapte le nom de ta base

const videoSchema = new mongoose.Schema({}, { strict: false });
const Video = mongoose.model('Video', videoSchema, 'videos'); // collection "videos"

async function run() {
  await Video.updateMany(
    { isShort: { $exists: false } },
    { $set: { isShort: false } }
  );

  await Video.updateMany({ isShort: "true" }, { $set: { isShort: true } });
  await Video.updateMany({ isShort: "false" }, { $set: { isShort: false } });

  console.log('✅ Champs isShort mis à jour');
  mongoose.disconnect();
}

run();
