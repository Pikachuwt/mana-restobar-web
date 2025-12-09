const AlmuerzoItem = require('../models/AlmuerzoItem');

// Obtener todos los ítems activos
const getItems = async (req, res) => {
  try {
    const items = await AlmuerzoItem.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los ítems' });
  }
};

// Obtener todos los ítems (incluyendo inactivos - para admin)
const getAllItems = async (req, res) => {
  try {
    const items = await AlmuerzoItem.find()
      .sort({ order: 1, createdAt: 1 });
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los ítems' });
  }
};

// Crear nuevo ítem
const createItem = async (req, res) => {
  try {
    const { name, subtitle, price, icon, category } = req.body;
    
    // Encontrar el último order para poner el nuevo ítem al final
    const lastItem = await AlmuerzoItem.findOne().sort({ order: -1 });
    const order = lastItem ? lastItem.order + 1 : 0;
    
    const item = new AlmuerzoItem({
      name,
      subtitle: subtitle || '',
      price: Number(price),
      icon: icon || '🍽️',
      category: category || 'acompanamiento',
      order,
      isActive: true
    });
    
    await item.save();
    
    res.status(201).json({
      success: true,
      message: 'Ítem creado correctamente',
      item
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el ítem' });
  }
};

// Actualizar ítem
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const item = await AlmuerzoItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Ítem no encontrado' });
    }
    
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        item[key] = updates[key];
      }
    });
    
    await item.save();
    
    res.json({
      success: true,
      message: 'Ítem actualizado correctamente',
      item
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el ítem' });
  }
};

// Eliminar ítem (marcar como inactivo)
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await AlmuerzoItem.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Ítem no encontrado' });
    }
    
    // Marcamos como inactivo en lugar de eliminar
    item.isActive = false;
    await item.save();
    
    res.json({
      success: true,
      message: 'Ítem eliminado correctamente'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el ítem' });
  }
};

// Reordenar ítems
const reorderItems = async (req, res) => {
  try {
    const { items } = req.body; // Array de objetos con id y order
    
    const updatePromises = items.map(item => 
      AlmuerzoItem.findByIdAndUpdate(item.id, { order: item.order })
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Ítems reordenados correctamente'
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al reordenar los ítems' });
  }
};

module.exports = {
  getItems,
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  reorderItems
};