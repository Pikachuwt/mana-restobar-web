const mongoose = require('mongoose');

const historiaSchema = new mongoose.Schema({
    texto: {
        type: String,
        required: true,
        default: 'Bienvenidos a Maná Restobar, el corazón gastronómico de Pamplona, Norte de Santander.'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Historia', historiaSchema);