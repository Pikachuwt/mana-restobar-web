const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Acceso denegado. No hay token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mana-restobar-secret');
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ error: 'Acceso denegado. Usuario no encontrado.' });
    }

    req.admin = admin;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Acceso denegado. Token inválido.' });
  }
};

module.exports = authMiddleware;