const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware de autenticación usando JWT
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Acceso no autorizado. Token requerido.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded._id || decoded.id, username: decoded.username, role: decoded.role };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido.' });
    }
};

module.exports = authMiddleware;