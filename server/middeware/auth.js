const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findOne({ _id: decoded._id });
        
        if (!admin) {
            throw new Error();
        }
        
        req.admin = admin;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            error: 'Por favor, autentícate.' 
        });
    }
};

module.exports = authMiddleware;