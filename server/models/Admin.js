const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    default: 'admin'
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// NOTA: Quitamos el pre-save hook para manejarlo manualmente en el controlador

// Método para comparar contraseñas
adminSchema.methods.comparePassword = async function(candidatePassword) {
  // Este método ya no se usa, comparamos con bcrypt en el controlador
  return false;
};

module.exports = mongoose.model('Admin', adminSchema);