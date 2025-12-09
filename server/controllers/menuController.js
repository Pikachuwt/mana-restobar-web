const Menu = require('../models/Menu');
const fs = require('fs');
const path = require('path');

// Obtener menú actual
const getMenu = async (req, res) => {
  try {
    let menu = await Menu.findOne();
    
    if (!menu) {
      // Crear menú por defecto
      menu = new Menu({
        pdfUrl: '/images/carta-completa.pdf.pdf',
        pdfName: 'carta-completa.pdf.pdf',
        menuEjecutivo: { precio: 15000, descripcion: 'Cambia todos los días' },
        menuEspecial: { precio: 20000, descripcion: 'Cambia todos los días' }
      });
      await menu.save();
    }
    
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el menú' });
  }
};

// Actualizar PDF del menú
const updateMenuPdf = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    let menu = await Menu.findOne();
    if (!menu) {
      menu = new Menu();
    }

    // Eliminar archivo anterior si existe y no es el por defecto
    if (menu.pdfUrl && !menu.pdfUrl.includes('carta-completa.pdf.pdf')) {
      const oldPath = path.join(__dirname, '../uploads/pdf', path.basename(menu.pdfUrl));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Actualizar menú
    menu.pdfUrl = `/uploads/pdf/${req.file.filename}`;
    menu.pdfName = req.file.originalname;
    menu.lastUpdated = Date.now();
    
    await menu.save();
    
    res.json({
      success: true,
      message: 'PDF actualizado correctamente',
      menu
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el PDF' });
  }
};

// Actualizar precios del menú
const updateMenuPrices = async (req, res) => {
  try {
    const { menuEjecutivo, menuEspecial } = req.body;
    
    let menu = await Menu.findOne();
    if (!menu) {
      menu = new Menu();
    }

    if (menuEjecutivo) {
      menu.menuEjecutivo = menuEjecutivo;
    }
    
    if (menuEspecial) {
      menu.menuEspecial = menuEspecial;
    }
    
    menu.lastUpdated = Date.now();
    await menu.save();
    
    res.json({
      success: true,
      message: 'Precios actualizados correctamente',
      menu
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar los precios' });
  }
};

module.exports = {
  getMenu,
  updateMenuPdf,
  updateMenuPrices
};