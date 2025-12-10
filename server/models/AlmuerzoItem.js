// server/models/AlmuerzoItem.js
const mongoose = require('mongoose');

const almuerzoItemSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        default: ''
    },
    precio: {
        type: Number,
        required: true,
        min: 0
    },
    categoria: {
        type: String,
        enum: ['base', 'proteina', 'acompanamiento', 'extra', 'plato_fuerte'],
        default: 'acompanamiento'
    },
    disponible: {
        type: Boolean,
        default: true
    },
    orden: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('AlmuerzoItem', almuerzoItemSchema);