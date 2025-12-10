// server/models/Historia.js
const mongoose = require('mongoose');

const historiaSchema = new mongoose.Schema({
    texto: {
        type: String,
        required: true,
        default: ''
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Historia', historiaSchema);