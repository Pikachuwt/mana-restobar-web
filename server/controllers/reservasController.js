const ReservaConfig = require('../models/ReservaConfig');

const reservasController = {
    getReservaConfig: async (req, res) => {
        try {
            let config = await ReservaConfig.findOne();
            if (!config) {
                // Crear configuración por defecto si no existe
                config = await ReservaConfig.create({});
            }
            res.json(config);
        } catch (error) {
            console.error('Error obteniendo configuración de reservas:', error);
            res.status(500).json({ error: 'Error del servidor' });
        }
    },
    
    updateReservaConfig: async (req, res) => {
        try {
            const updates = req.body;
            updates.lastUpdated = new Date();
            
            let config = await ReservaConfig.findOne();
            if (!config) {
                config = await ReservaConfig.create(updates);
            } else {
                config = await ReservaConfig.findOneAndUpdate(
                    {},
                    updates,
                    { new: true }
                );
            }
            
            res.json({
                success: true,
                message: 'Configuración de reservas actualizada',
                config
            });
        } catch (error) {
            console.error('Error actualizando configuración de reservas:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error del servidor' 
            });
        }
    }
};

module.exports = reservasController;