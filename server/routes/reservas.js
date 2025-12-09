const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');
const authMiddleware = require('../middleware/auth');

// Ruta pública para obtener la configuración de reservas
router.get('/', reservasController.getReservaConfig);

// Ruta protegida para actualizar la configuración de reservas
router.put('/', authMiddleware, reservasController.updateReservaConfig);

module.exports = router;
