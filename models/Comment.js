const mongoose = require('mongoose');
const User = require('../models/User');


const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
