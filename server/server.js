// server/server.js - VERSIÓN OPTIMIZADA Y ROBUSTA
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

// ===== CONFIGURACIONES =====

// 1. Crear carpeta de imágenes si no existe
const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('✅ Carpeta images creada');
}

// 2. Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// 3. Configuración de subida de archivos (PDF)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, imagesDir);
    },
    filename: function (req, file, cb) {
        // Mantener el nombre original del PDF para referencia
        const originalName = file.originalname.replace(/\s+/g, '-');
        cb(null, 'menu-actual.pdf'); // Siempre el mismo nombre para reemplazar
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB límite
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF'), false);
        }
    }
});

// ===== MIDDLEWARE DE LOGS =====
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// ===== RUTAS API =====

// 1. OBTENER TODOS LOS DATOS
app.get('/api/data', (req, res) => {
    try {
        const data = adminFunctions.obtenerTodosDatos();
        res.json(data);
    } catch (error) {
        console.error('❌ Error en /api/data:', error.message);
        res.status(500).json({ 
            error: 'Error leyendo datos',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 2. LOGIN SIMPLE
app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validaciones básicas
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Usuario y contraseña son requeridos' 
            });
        }
        
        // Obtener contraseña actual desde data.json
        const data = adminFunctions.leerDatos();
        const currentPassword = data.config?.password || 'Patoazul';
        
        if (username === 'admin' && password === currentPassword) {
            console.log(`✅ Login exitoso para usuario: ${username}`);
            
            res.json({ 
                success: true, 
                token: 'token-falso-seguro-123', 
                admin: { 
                    username: 'Admin',
                    lastLogin: new Date().toISOString()
                } 
            });
        } else {
            console.log(`❌ Intento de login fallido para usuario: ${username}`);
            res.status(401).json({ 
                success: false, 
                error: 'Credenciales incorrectas' 
            });
        }
    } catch (error) {
        console.error('❌ Error en /api/auth/login:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error en el servidor' 
        });
    }
});

// 3. GUARDAR HISTORIA
app.post('/api/historia', (req, res) => {
    try {
        const { texto } = req.body;
        
        if (!texto || texto.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                error: 'El texto de la historia es requerido' 
            });
        }
        
        const result = adminFunctions.guardarHistoria(texto.trim());
        console.log('✅ Historia actualizada');
        res.json(result);
    } catch (error) {
        console.error('❌ Error en /api/historia:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error guardando historia' 
        });
    }
});

// 4. SUBIR PDF DEL MENÚ
app.post('/api/menu/pdf', upload.single('pdf'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No se subió ningún archivo' 
            });
        }
        
        console.log(`✅ PDF subido: ${req.file.originalname} (${req.file.size} bytes)`);
        
        res.json({ 
            success: true, 
            url: '/images/menu-actual.pdf',
            filename: req.file.originalname,
            size: req.file.size,
            message: 'Menú PDF actualizado correctamente'
        });
    } catch (error) {
        console.error('❌ Error en /api/menu/pdf:', error.message);
        
        if (error instanceof multer.MulterError) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ 
                    success: false, 
                    error: 'El archivo es muy grande. Máximo 10MB' 
                });
            }
        }
        
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Error subiendo el archivo' 
        });
    }
});

// 5. GESTIONAR ALMUERZOS
app.post('/api/almuerzos', (req, res) => {
    try {
        const { nombre, precio } = req.body;
        
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                error: 'El nombre del almuerzo es requerido' 
            });
        }
        
        // Convertir precio a número o usar 0
        const precioNum = precio ? parseInt(precio) || 0 : 0;
        
        const result = adminFunctions.agregarAlmuerzo(nombre.trim(), precioNum.toString());
        console.log(`✅ Almuerzo agregado: ${nombre}`);
        res.json(result);
    } catch (error) {
        console.error('❌ Error en /api/almuerzos:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error agregando almuerzo' 
        });
    }
});

app.delete('/api/almuerzos/:id', (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ 
                success: false, 
                error: 'ID del almuerzo es requerido' 
            });
        }
        
        const result = adminFunctions.eliminarAlmuerzo(id);
        console.log(`✅ Almuerzo eliminado ID: ${id}`);
        res.json(result);
    } catch (error) {
        console.error('❌ Error en /api/almuerzos/:id:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error eliminando almuerzo' 
        });
    }
});

// 6. GUARDAR CONFIGURACIÓN DE RESERVAS
app.post('/api/reservas', (req, res) => {
    try {
        const result = adminFunctions.guardarReservas(req.body);
        console.log('✅ Configuración de reservas actualizada');
        res.json(result);
    } catch (error) {
        console.error('❌ Error en /api/reservas:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error guardando reservas' 
        });
    }
});

// 7. CAMBIAR CONTRASEÑA
app.post('/api/change-password', (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'La contraseña actual y la nueva son requeridas' 
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                error: 'La nueva contraseña debe tener al menos 6 caracteres' 
            });
        }
        
        const result = adminFunctions.cambiarPassword(currentPassword, newPassword);
        res.json(result);
    } catch (error) {
        console.error('❌ Error en /api/change-password:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error cambiando contraseña' 
        });
    }
});

// 8. VERIFICAR TOKEN (simplificado)
app.get('/api/auth/verify', (req, res) => {
    res.json({ 
        valid: true,
        timestamp: new Date().toISOString()
    });
});

// 9. RUTA DE SALUD
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        server: 'Mana Restobar API',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime()
    });
});

// ===== RUTA PARA SERVIR EL PDF =====
app.get('/api/menu/current', (req, res) => {
    const pdfPath = path.join(imagesDir, 'menu-actual.pdf');
    
    if (fs.existsSync(pdfPath)) {
        res.sendFile(pdfPath);
    } else {
        res.status(404).json({ 
            error: 'No hay menú PDF disponible' 
        });
    }
});

// ===== RUTA PARA DESCARGAR BACKUP =====
app.get('/api/backup', (req, res) => {
    try {
        const data = adminFunctions.obtenerTodosDatos();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename="backup-data.json"');
        res.send(JSON.stringify(data, null, 2));
    } catch (error) {
        res.status(500).json({ error: 'Error generando backup' });
    }
});

// ===== MANEJO DE ERRORES =====

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path,
        method: req.method
    });
});

// Error handler global
app.use((err, req, res, next) => {
    console.error('❌ Error global:', err.stack || err.message);
    
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ===== INICIAR SERVIDOR =====
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`✅ Servidor Maná Restobar iniciado`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📁 Panel admin: http://localhost:${PORT}/admin.html`);
    console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
    console.log(`📄 API Data: http://localhost:${PORT}/api/data`);
    
    // Mostrar credenciales
    try {
        const data = adminFunctions.leerDatos();
        const password = data.config?.password || 'Patoazul';
        console.log(`🔑 Credenciales: admin / ${password}`);
    } catch (error) {
        console.log(`🔑 Credenciales: admin / Patoazul (por defecto)`);
    }
    
    // Mostrar estadísticas
    try {
        const data = adminFunctions.obtenerTodosDatos();
        console.log(`📊 Datos cargados:`);
        console.log(`   - Historia: ${data.historia ? '✅' : '❌'}`);
        console.log(`   - Almuerzos: ${data.almuerzos?.length || 0} opciones`);
        console.log(`   - Configuración: ${data.config ? '✅' : '❌'}`);
    } catch (error) {
        console.log(`⚠️ No se pudieron cargar las estadísticas: ${error.message}`);
    }
    
    console.log('='.repeat(50));
    console.log('🚀 Servidor listo para recibir peticiones...');
});