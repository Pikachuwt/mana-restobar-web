const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Crear administrador inicial (ejecutar una sola vez)
const createInitialAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ username: 'admin' });
    
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = new Admin({
        username: 'admin',
        password: hashedPassword,
        email: 'admin@manarestobar.com',
        role: 'superadmin'
      });
      
      await admin.save();
      console.log('✅ Administrador inicial creado');
      console.log('👤 Usuario: admin');
      console.log('🔑 Contraseña: admin123');
      console.log('⚠️ Cambia estas credenciales después del primer login');
    }
  } catch (error) {
    console.error('Error creando administrador inicial:', error);
  }
};

// Login
const login = async (req, res) => {
  try {
    console.log('📩 Solicitud de login recibida:', req.body);
    
    const { username, password } = req.body;

    // Validar que vengan los datos
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Usuario y contraseña son requeridos' 
      });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciales incorrectas' 
      });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Credenciales incorrectas' 
      });
    }

    // Actualizar último login
    admin.lastLogin = new Date();
    await admin.save();

    // Crear token
    const token = jwt.sign(
      { 
        id: admin._id, 
        username: admin.username, 
        role: admin.role 
      },
      process.env.JWT_SECRET || 'mana-restobar-secret',
      { expiresIn: '8h' }
    );

    console.log('✅ Login exitoso para usuario:', username);
    
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error en el servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verificar token
const verifyToken = async (req, res) => {
  try {
    res.json({ 
      success: true, 
      valid: true, 
      admin: req.admin 
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Token inválido' 
    });
  }
};

module.exports = {
  createInitialAdmin,
  login,
  verifyToken
};