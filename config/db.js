// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("Connexion à MongoDB...", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI); // ✅ plus simple
        console.log("✅ MongoDB connecté");
    } catch (err) {
        console.error("❌ Erreur MongoDB :", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
