// server/server.js - VERSIÓN SIMPLIFICADA Y ORGANIZADA
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Importar funciones del admin
const adminFunctions = require('./admin-functions');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Configuración de subida de archivos (PDF)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images/'))
    },
    filename: function (req, file, cb) {
        cb(null, 'menu-actual.pdf')
    }
});
const upload = multer({ storage: storage });

// ===== RUTAS API =====

// 1. OBTENER TODOS LOS DATOS
app.get('/api/data', (req, res) => {
    try {
        const data = adminFunctions.obtenerTodosDatos();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error leyendo datos' });
    }
});

// 2. LOGIN SIMPLE
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // Obtener contraseña actual desde data.json
    const data = adminFunctions.leerDatos();
    const currentPassword = data.config?.password || 'Patoazul';
    
    if (username === 'admin' && password === currentPassword) {
        res.json({ 
            success: true, 
            token: 'token-falso-seguro-123', 
            admin: { username: 'Admin' } 
        });
    } else {
        res.status(401).json({ 
            success: false, 
            error: 'Credenciales incorrectas' 
        });
    }
});

// 3. GUARDAR HISTORIA
app.post('/api/historia', (req, res) => {
    try {
        const result = adminFunctions.guardarHistoria(req.body.texto);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error guardando historia' });
    }
});

// 4. SUBIR PDF
app.post('/api/menu/pdf', upload.single('pdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No se subió archivo' });
    }
    res.json({ success: true, url: '/images/menu-actual.pdf' });
});

// 5. GESTIONAR ALMUERZOS
app.post('/api/almuerzos', (req, res) => {
    try {
        const { nombre, precio } = req.body;
        const result = adminFunctions.agregarAlmuerzo(nombre, precio);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error agregando almuerzo' });
    }
});

app.delete('/api/almuerzos/:id', (req, res) => {
    try {
        const result = adminFunctions.eliminarAlmuerzo(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error eliminando almuerzo' });
    }
});

// 6. GUARDAR RESERVAS
app.post('/api/reservas', (req, res) => {
    try {
        const result = adminFunctions.guardarReservas(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error guardando reservas' });
    }
});

// 7. CAMBIAR CONTRASEÑA
app.post('/api/change-password', (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const result = adminFunctions.cambiarPassword(currentPassword, newPassword);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error cambiando contraseña' });
    }
});

// 8. VERIFICAR TOKEN (simplificado)
app.get('/api/auth/verify', (req, res) => {
    res.json({ valid: true });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Panel admin: http://localhost:${PORT}/admin.html`);
    console.log(`🔑 Usuario: admin | Contraseña: ${adminFunctions.leerDatos().config?.password || 'Patoazul'}`);
});