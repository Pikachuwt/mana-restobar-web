const express = require('express');
const router = express.Router();
const galeriaController = require('../controllers/galeriaController');
const authMiddleware = require('../middleware/auth');
const { imageUpload } = require('../middleware/upload');

// Ruta pública para listar imágenes
router.get('/', galeriaController.listGaleria);

// Ruta protegida para subir imágenes
router.post('/upload', authMiddleware, imageUpload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ninguna imagen' });
        }
        
        res.json({
            success: true,
            message: 'Imagen subida correctamente',
            file: {
                name: req.file.filename,
                url: `/uploads/images/${req.file.filename}`,
                originalName: req.file.originalname
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al subir la imagen' });
    }
});

// Ruta protegida para eliminar imágenes
router.delete('/:filename', authMiddleware, galeriaController.deleteImage);

module.exports = router;