const mongoose = require('mongoose');

const almuerzoItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  icon: {
    type: String,
    default: '🍽️'
  },
  category: {
    type: String,
    enum: ['base', 'proteina', 'acompanamiento', 'extra'],
    default: 'acompanamiento'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AlmuerzoItem', almuerzoItemSchema);