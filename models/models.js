// models.js
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    encryptedData: String,
    decryptedData: String,
    // Add other fields as needed
});

const Response = mongoose.model('Response', responseSchema);

module.exports = { Response };
