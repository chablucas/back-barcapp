const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
  match: {
    homeTeam: String,
    awayTeam: String,
    score: String,
    competition: String,
    events: [String], // Buts, cartons, etc.
  },
  composition: {
    GK: String,
    RB: String,
    CB1: String,
    CB2: String,
    LB: String,
    CM1: String,
    CM2: String,
    RW: String,
    CAM: String,
    LW: String,
    ST: String,
  },
  streak: [String], // max 5 éléments
});

module.exports = mongoose.model('Widget', widgetSchema);
