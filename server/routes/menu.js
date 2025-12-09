const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/auth');
const { pdfUpload } = require('../middleware/upload');

// Ruta pública
router.get('/', menuController.getMenu);

// Rutas protegidas
router.post('/pdf', authMiddleware, pdfUpload.single('pdf'), menuController.updateMenuPdf);
router.put('/prices', authMiddleware, menuController.updateMenuPrices);

module.exports = router;