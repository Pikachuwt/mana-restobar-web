const fs = require('fs');
const path = require('path');

// Listar imágenes de la galería
const listGaleria = async (req, res) => {
    try {
        const imagesDir = path.join(__dirname, '../uploads/images');
        
        // Leer archivos del directorio
        if (!fs.existsSync(imagesDir)) {
            return res.json([]);
        }
        
        const files = fs.readdirSync(imagesDir)
            .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
            .map(file => ({
                name: file,
                url: `/uploads/images/${file}`,
                path: path.join(imagesDir, file)
            }));
        
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar las imágenes' });
    }
};

// Eliminar imagen de la galería
const deleteImage = async (req, res) => {
    try {
        const { filename } = req.params;
        const imagePath = path.join(__dirname, '../uploads/images', filename);
        
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Imagen no encontrada' });
        }
        
        fs.unlinkSync(imagePath);
        
        res.json({
            success: true,
            message: 'Imagen eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la imagen' });
    }
};

module.exports = {
    listGaleria,
    deleteImage
};