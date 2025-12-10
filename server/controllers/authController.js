const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const authController = {
    login: async (req, res) => {
        try {
            console.log('🔐 Intento de login:', req.body.username);
            const { username, password } = req.body;
            
            // Buscar admin
            const admin = await Admin.findOne({ username });
            
            if (!admin) {
                console.log('❌ Usuario no encontrado:', username);
                return res.status(401).json({
                    success: false,
                    error: 'Credenciales incorrectas'
                });
            }
            
            console.log('✅ Usuario encontrado:', admin.username);
            
            // Verificar contraseña
            const isPasswordValid = await bcrypt.compare(password, admin.password);
            console.log('🔑 Contraseña válida:', isPasswordValid);
            
            if (!isPasswordValid) {
                console.log('❌ Contraseña incorrecta');
                return res.status(401).json({
                    success: false,
                    error: 'Credenciales incorrectas'
                });
            }
            
            // Actualizar último login
            admin.lastLogin = new Date();
            await admin.save();
            
            // Generar token
            const token = jwt.sign(
                { _id: admin._id, username: admin.username },
                process.env.JWT_SECRET || 'secreto-temporal-cambiar',
                { expiresIn: '24h' }
            );
            
            console.log('✅ Login exitoso para:', admin.username);
            
            res.json({
                success: true,
                token,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role
                }
            });
            
        } catch (error) {
            console.error('❌ Error en login:', error);
            res.status(500).json({
                success: false,
                error: 'Error del servidor'
            });
        }
    },

    verifyToken: async (req, res) => {
        try {
            res.json({
                success: true,
                admin: {
                    id: req.admin._id,
                    username: req.admin.username,
                    email: req.admin.email,
                    role: req.admin.role
                }
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                error: 'Token inválido'
            });
        }
    },

    changeUsername: async (req, res) => {
        try {
            const { currentPassword, newUsername } = req.body;
            const admin = req.admin;
            
            // Verificar contraseña actual
            const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Contraseña actual incorrecta'
                });
            }
            
            // Verificar si el nuevo username ya existe
            const existingAdmin = await Admin.findOne({ username: newUsername });
            if (existingAdmin && existingAdmin._id.toString() !== admin._id.toString()) {
                return res.status(400).json({
                    success: false,
                    error: 'El nombre de usuario ya está en uso'
                });
            }
            
            // Actualizar username
            admin.username = newUsername;
            await admin.save();
            
            // Generar nuevo token
            const token = jwt.sign(
                { _id: admin._id, username: admin.username },
                process.env.JWT_SECRET || 'secreto-temporal-cambiar',
                { expiresIn: '24h' }
            );
            
            res.json({
                success: true,
                token,
                admin: {
                    id: admin._id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role
                }
            });
            
        } catch (error) {
            console.error('Error cambiando username:', error);
            res.status(500).json({
                success: false,
                error: 'Error del servidor'
            });
        }
    },

    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const admin = req.admin;
            
            // Verificar contraseña actual
            const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Contraseña actual incorrecta'
                });
            }
            
            // Actualizar contraseña (se encriptará automáticamente por el pre-save hook)
            admin.password = newPassword;
            await admin.save();
            
            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });
            
        } catch (error) {
            console.error('Error cambiando password:', error);
            res.status(500).json({
                success: false,
                error: 'Error del servidor'
            });
        }
    }
};

module.exports = authController;
