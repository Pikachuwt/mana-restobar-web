const AlmuerzoItem = require('../models/AlmuerzoItem');

const almuerzoController = {
    getItems: async (req, res) => {
        try {
            const items = await AlmuerzoItem.find({ disponible: true })
                .sort({ categoria: 1, nombre: 1 });
            res.json(items);
        } catch (error) {
            console.error('Error obteniendo ítems:', error);
            res.status(500).json({ error: 'Error del servidor' });
        }
    },
    
    getAllItems: async (req, res) => {
        try {
            const items = await AlmuerzoItem.find().sort({ categoria: 1, nombre: 1 });
            res.json(items);
        } catch (error) {
            console.error('Error obteniendo todos los ítems:', error);
            res.status(500).json({ error: 'Error del servidor' });
        }
    },
    
    createItem: async (req, res) => {
        try {
            const { nombre, precio, categoria } = req.body;
            
            const nuevoItem = new AlmuerzoItem({
                nombre,
                precio,
                categoria: categoria || 'acompanamiento',
                disponible: true
            });
            
            await nuevoItem.save();
            
            res.json({
                success: true,
                message: 'Ítem creado exitosamente',
                item: nuevoItem
            });
        } catch (error) {
            console.error('Error creando ítem:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error del servidor' 
            });
        }
    },
    
    deleteItem: async (req, res) => {
        try {
            const { id } = req.params;
            
            const item = await AlmuerzoItem.findByIdAndDelete(id);
            
            if (!item) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Ítem no encontrado' 
                });
            }
            
            res.json({
                success: true,
                message: 'Ítem eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando ítem:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error del servidor' 
            });
        }
    }
};

module.exports = almuerzoController;