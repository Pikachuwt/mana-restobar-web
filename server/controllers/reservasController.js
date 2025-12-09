const ReservaConfig = require('../models/ReservaConfig');

// Obtener configuración de reservas
const getReservaConfig = async (req, res) => {
    try {
        let config = await ReservaConfig.findOne();
        
        if (!config) {
            // Crear configuración por defecto si no existe
            config = new ReservaConfig();
            await config.save();
        }
        
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la configuración de reservas' });
    }
};

// Actualizar configuración de reservas
const updateReservaConfig = async (req, res) => {
    try {
        const {
            politicaCancelacion,
            politicaModificacion,
            politicaAbono,
            bancoNombre,
            cuentaNumero,
            cuentaTipo,
            cuentaNombre,
            nequiNumero
        } = req.body;
        
        let config = await ReservaConfig.findOne();
        
        if (!config) {
            config = new ReservaConfig();
        }
        
        // Actualizar campos
        if (politicaCancelacion !== undefined) config.politicaCancelacion = politicaCancelacion;
        if (politicaModificacion !== undefined) config.politicaModificacion = politicaModificacion;
        if (politicaAbono !== undefined) config.politicaAbono = politicaAbono;
        if (bancoNombre !== undefined) config.bancoNombre = bancoNombre;
        if (cuentaNumero !== undefined) config.cuentaNumero = cuentaNumero;
        if (cuentaTipo !== undefined) config.cuentaTipo = cuentaTipo;
        if (cuentaNombre !== undefined) config.cuentaNombre = cuentaNombre;
        if (nequiNumero !== undefined) config.nequiNumero = nequiNumero;
        
        config.lastUpdated = Date.now();
        
        await config.save();
        
        res.json({
            success: true,
            message: 'Configuración de reservas actualizada correctamente',
            config
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la configuración de reservas' });
    }
};

module.exports = {
    getReservaConfig,
    updateReservaConfig
};