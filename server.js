const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conectar a MongoDB y crear admin por defecto
const createDefaultAdmin = async () => {
    try {
        const Admin = require('./server/models/Admin');
        const adminExists = await Admin.findOne({ username: 'admin' });
        
        if (!adminExists) {
            console.log('👤 Creando admin por defecto...');
            const defaultAdmin = new Admin({
                username: 'admin',
                password: 'admin123',
                email: 'admin@manarestobar.com',
                role: 'admin'
            });
            
            await defaultAdmin.save();
            console.log('✅ Admin por defecto creado');
            console.log('   Usuario: admin');
            console.log('   Contraseña: admin123');
        } else {
            console.log('✅ Admin ya existe en la base de datos');
        }
    } catch (error) {
        console.error('❌ Error creando admin:', error.message);
    }
};

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(async () => {
    console.log('✅ Conectado a MongoDB');
    
    // Crear admin por defecto
    await createDefaultAdmin();
})
.catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err);
    process.exit(1);
});

// Importar rutas
const authRoutes = require('./server/routes/auth');
const historiaRoutes = require('./server/routes/historia');
const menuRoutes = require('./server/routes/menu');
const almuerzoRoutes = require('./server/routes/almuerzo');
const reservasRoutes = require('./server/routes/reservas');
const galeriaRoutes = require('./server/routes/galeria');

// Usar rutas
app.use('/api/admin', authRoutes);
app.use('/api/historia', historiaRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/almuerzos', almuerzoRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/galeria', galeriaRoutes);

// Ruta para servir admin.html
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Ruta para servir archivos estáticos del admin
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// Ruta para servir el index.html de React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('🔥 Error en servidor:', err.stack);
    res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});