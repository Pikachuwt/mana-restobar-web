const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  pdfUrl: {
    type: String,
    required: true
  },
  pdfName: {
    type: String,
    required: true
  },
  menuEjecutivo: {
    precio: { type: Number, default: 15000 },
    descripcion: { type: String, default: 'Cambia todos los días' }
  },
  menuEspecial: {
    precio: { type: Number, default: 20000 },
    descripcion: { type: String, default: 'Cambia todos los días' }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Menu', menuSchema);