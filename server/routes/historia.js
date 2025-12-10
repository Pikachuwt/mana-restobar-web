const express = require('express');
const router = express.Router();
const Historia = require('../models/Historia');
const authMiddleware = require('../middleware/auth');

// Obtener historia (pública)
router.get('/', async (req, res) => {
    try {
        let historia = await Historia.findOne();
        if (!historia) {
            // Crear una por defecto si no existe
            historia = await Historia.create({
                texto: 'Bienvenidos a Maná Restobar, el corazón gastronómico de Pamplona, Norte de Santander.'
            });
        }
        res.json(historia);
    } catch (error) {
        console.error('Error obteniendo historia:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
});

// Actualizar historia (protegido)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { texto } = req.body;
        
        let historia = await Historia.findOne();
        if (!historia) {
            historia = await Historia.create({ texto });
        } else {
            historia.texto = texto;
            historia.updatedAt = new Date();
            await historia.save();
        }
        
        res.json({ 
            success: true, 
            message: 'Historia actualizada exitosamente',
            historia 
        });
    } catch (error) {
        console.error('Error actualizando historia:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error del servidor' 
        });
    }
});

module.exports = router;