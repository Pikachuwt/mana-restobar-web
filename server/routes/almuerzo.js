const express = require('express');
const router = express.Router();
const almuerzoController = require('../controllers/almuerzoController');
const authMiddleware = require('../middleware/auth');

// Ruta pública
router.get('/', almuerzoController.getItems);

// Rutas protegidas
router.get('/admin/all', authMiddleware, almuerzoController.getAllItems);
router.post('/', authMiddleware, almuerzoController.createItem);
router.put('/:id', authMiddleware, almuerzoController.updateItem);
router.delete('/:id', authMiddleware, almuerzoController.deleteItem);
router.post('/reorder', authMiddleware, almuerzoController.reorderItems);

module.exports = router;