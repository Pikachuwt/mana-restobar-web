// server/server.js - Servidor principal actualizado
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs').promises;
const fsSync = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configuración
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mana-restobar';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
    useTempFiles: false
}));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Acceso no autorizado. Token requerido.' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

// Conexión a MongoDB
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Conectado a MongoDB');
}).catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    console.log('⚠️ Continuando sin MongoDB...');
});

// Importar modelos
const Menu = require('./models/Menu');
const AlmuerzoItem = require('./models/AlmuerzoItem');
const Admin = require('./models/Admin');
const ReservaConfig = require('./models/ReservaConfig');
const Historia = require('./models/Historia');

// Configurar directorios
const uploadsDir = path.join(__dirname, 'uploads');
if (!fsSync.existsSync(uploadsDir)) {
    fsSync.mkdirSync(uploadsDir, { recursive: true });
}

// ============================
// WEBSOCKETS
// ============================
io.on('connection', (socket) => {
    console.log(`🔗 Cliente conectado: ${socket.id}`);
    
    socket.on('disconnect', () => {
        console.log(`🔌 Cliente desconectado: ${socket.id}`);
    });
});

// ============================
// RUTAS API
// ============================

// 1. HISTORIA
app.get('/api/historia', async (req, res) => {
    try {
        let historia = await Historia.findOne().sort({ updatedAt: -1 });
        
        if (!historia) {
            // Historia por defecto
            historia = new Historia({
                texto: 'Bienvenidos a Maná Restobar, el lugar donde los sabores se encuentran con la tradición...',
                updatedAt: new Date()
            });
            await historia.save();
        }
        
        res.json({ texto: historia.texto, updatedAt: historia.updatedAt });
    } catch (error) {
        console.error('Error obteniendo historia:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            texto: 'Historia no disponible en este momento.'
        });
    }
});

app.post('/api/historia', authMiddleware, async (req, res) => {
    try {
        const { texto } = req.body;
        
        if (!texto || texto.trim() === '') {
            return res.status(400).json({ error: 'El texto de la historia es requerido' });
        }
        
        const historia = await Historia.findOneAndUpdate(
            {},
            { 
                texto: texto.trim(),
                updatedAt: new Date()
            },
            { 
                new: true, 
                upsert: true,
                setDefaultsOnInsert: true 
            }
        );
        
        // Emitir actualización por WebSocket
        io.emit('historia_updated', { historia: historia.texto });
        
        res.json({ 
            success: true, 
            historia,
            message: 'Historia actualizada correctamente'
        });
    } catch (error) {
        console.error('Error actualizando historia:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 2. MENÚ PDF
app.get('/api/menu/current', async (req, res) => {
    try {
        // Ruta al PDF
        const pdfPath = path.join(__dirname, '../public/images/menu-actual.pdf');
        
        if (!fsSync.existsSync(pdfPath)) {
            return res.status(404).json({ error: 'Menú no disponible' });
        }
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        res.sendFile(pdfPath);
    } catch (error) {
        console.error('Error sirviendo PDF:', error);
        res.status(500).json({ error: 'Error cargando el menú' });
    }
});

app.post('/api/menu/pdf', authMiddleware, async (req, res) => {
    try {
        if (!req.files || !req.files.pdf) {
            return res.status(400).json({ error: 'No se subió ningún archivo PDF' });
        }
        
        const pdfFile = req.files.pdf;
        
        // Validar que sea PDF
        if (!pdfFile.mimetype.includes('pdf')) {
            return res.status(400).json({ error: 'El archivo debe ser un PDF' });
        }
        
        // Validar tamaño (máximo 5MB)
        if (pdfFile.size > 5 * 1024 * 1024) {
            return res.status(400).json({ error: 'El PDF no debe superar los 5MB' });
        }
        
        // Ruta donde se guardará
        const pdfPath = path.join(__dirname, '../public/images/menu-actual.pdf');
        
        // Guardar archivo
        await pdfFile.mv(pdfPath);
        
        // Actualizar base de datos
        const menu = await Menu.findOneAndUpdate(
            {},
            { 
                pdfUrl: '/images/menu-actual.pdf',
                pdfName: 'menu-actual.pdf',
                lastUpdated: new Date()
            },
            { 
                new: true, 
                upsert: true 
            }
        );
        
        // Emitir actualización por WebSocket
        io.emit('menu_updated', { 
            pdfUrl: '/api/menu/current',
            timestamp: new Date()
        });
        
        res.json({ 
            success: true, 
            menu,
            message: 'Menú actualizado correctamente'
        });
        
    } catch (error) {
        console.error('Error subiendo PDF:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 3. ALMUERZOS
app.get('/api/almuerzos', async (req, res) => {
    try {
        const almuerzos = await AlmuerzoItem.find({ disponible: true })
            .sort({ order: 1, categoria: 1 });
        
        if (!almuerzos || almuerzos.length === 0) {
            // Datos de ejemplo si la base está vacía
            return res.json([
                { _id: '1', nombre: 'Arroz', precio: 4000, categoria: 'acompanamiento' },
                { _id: '2', nombre: 'Papas a la Francesa', precio: 5200, categoria: 'acompanamiento' },
                { _id: '3', nombre: 'Carnes', precio: 8900, categoria: 'proteina' }
            ]);
        }
        
        res.json(almuerzos);
    } catch (error) {
        console.error('Error obteniendo almuerzos:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            almuerzos: []
        });
    }
});

app.post('/api/almuerzos', authMiddleware, async (req, res) => {
    try {
        const { nombre, descripcion, precio, categoria } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }
        
        const almuerzo = new AlmuerzoItem({
            nombre: nombre.trim(),
            descripcion: descripcion || '',
            precio: precio ? parseFloat(precio) : 0,
            categoria: categoria || 'acompanamiento',
            disponible: true
        });
        
        await almuerzo.save();
        
        // Obtener lista actualizada
        const almuerzos = await AlmuerzoItem.find({ disponible: true })
            .sort({ order: 1, categoria: 1 });
        
        // Emitir actualización por WebSocket
        io.emit('almuerzos_updated', { almuerzos });
        
        res.json({ 
            success: true, 
            almuerzo,
            message: 'Ítem agregado correctamente'
        });
        
    } catch (error) {
        console.error('Error creando ítem de almuerzo:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.delete('/api/almuerzos/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await AlmuerzoItem.findByIdAndDelete(id);
        
        if (!result) {
            return res.status(404).json({ error: 'Ítem no encontrado' });
        }
        
        // Obtener lista actualizada
        const almuerzos = await AlmuerzoItem.find({ disponible: true })
            .sort({ order: 1, categoria: 1 });
        
        io.emit('almuerzos_updated', { almuerzos });
        
        res.json({ 
            success: true, 
            message: 'Ítem eliminado correctamente',
            almuerzos
        });
        
    } catch (error) {
        console.error('Error eliminando ítem:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 4. RESERVAS
app.get('/api/reservas', async (req, res) => {
    try {
        let config = await ReservaConfig.findOne();
        
        if (!config) {
            // Configuración por defecto
            config = new ReservaConfig({
                politicaCancelacion: 'Se puede cancelar sin costo hasta 2 días antes.',
                politicaModificacion: 'Se puede modificar la reserva hasta 8 horas antes.',
                politicaAbono: 'Para eventos especiales se requiere 10% de abono.',
                bancoNombre: 'BANCOLOMBIA',
                cuentaTipo: 'Ahorros',
                cuentaNumero: '47675777558',
                cuentaNombre: 'María Mendoza',
                nequiNumero: '3105539582'
            });
            await config.save();
        }
        
        res.json(config);
    } catch (error) {
        console.error('Error obteniendo configuración de reservas:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor'
        });
    }
});

app.put('/api/reservas', authMiddleware, async (req, res) => {
    try {
        const { 
            politicaCancelacion, 
            politicaModificacion, 
            politicaAbono,
            bancoNombre,
            cuentaTipo,
            cuentaNumero,
            cuentaNombre,
            nequiNumero
        } = req.body;
        
        const config = await ReservaConfig.findOneAndUpdate(
            {},
            { 
                politicaCancelacion: politicaCancelacion || '',
                politicaModificacion: politicaModificacion || '',
                politicaAbono: politicaAbono || '',
                bancoNombre: bancoNombre || '',
                cuentaTipo: cuentaTipo || '',
                cuentaNumero: cuentaNumero || '',
                cuentaNombre: cuentaNombre || '',
                nequiNumero: nequiNumero || '',
                updatedAt: new Date()
            },
            { 
                new: true, 
                upsert: true 
            }
        );
        
        // Emitir actualización por WebSocket
        io.emit('reservas_updated', { config });
        
        res.json({ 
            success: true, 
            config,
            message: 'Configuración actualizada'
        });
        
    } catch (error) {
        console.error('Error actualizando reservas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 5. AUTENTICACIÓN ADMIN
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }
        
        // Buscar admin
        const admin = await Admin.findOne({ username });
        
        if (!admin) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
        
        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }
        
        // Actualizar último login
        admin.lastLogin = new Date();
        await admin.save();
        
        // Generar token JWT
        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username, 
                role: admin.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            success: true, 
            token,
            admin: {
                username: admin.username,
                email: admin.email,
                lastLogin: admin.lastLogin
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/admin/verify', authMiddleware, async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);
        
        if (!admin) {
            return res.status(404).json({ error: 'Admin no encontrado' });
        }
        
        res.json({ 
            success: true,
            admin: {
                username: admin.username,
                email: admin.email,
                lastLogin: admin.lastLogin
            }
        });
    } catch (error) {
        console.error('Error verificando token:', error);
        res.status(401).json({ error: 'Token inválido' });
    }
});

app.put('/api/admin/username', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newUsername } = req.body;
        
        if (!currentPassword || !newUsername) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }
        
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ error: 'Admin no encontrado' });
        }
        
        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }
        
        // Actualizar username
        admin.username = newUsername;
        await admin.save();
        
        // Generar nuevo token
        const newToken = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username, 
                role: admin.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            success: true, 
            token: newToken,
            message: 'Usuario actualizado correctamente'
        });
        
    } catch (error) {
        console.error('Error cambiando username:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.put('/api/admin/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
        }
        
        const admin = await Admin.findById(req.user.id);
        if (!admin) {
            return res.status(404).json({ error: 'Admin no encontrado' });
        }
        
        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }
        
        // Actualizar contraseña
        admin.password = newPassword;
        await admin.save();
        
        res.json({ 
            success: true, 
            message: 'Contraseña actualizada correctamente'
        });
        
    } catch (error) {
        console.error('Error cambiando password:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 6. CREAR ADMIN POR DEFECTO
async function createDefaultAdmin() {
    try {
        const adminExists = await Admin.findOne({ username: 'admin' });
        
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);
            
            const admin = new Admin({
                username: 'admin',
                password: hashedPassword,
                email: 'admin@manarestobar.com',
                role: 'admin'
            });
            
            await admin.save();
            console.log('✅ Admin por defecto creado');
            console.log('👤 Usuario: admin');
            console.log('🔐 Contraseña: admin123');
            console.log('⚠️ ¡Cambia la contraseña después del primer login!');
        } else {
            console.log('✅ Admin ya existe en la base de datos');
        }
    } catch (error) {
        console.error('Error creando admin por defecto:', error);
    }
}

// 7. RUTA DE PRUEBA
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date(),
        services: {
            mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            websockets: io.engine.clientsCount
        }
    });
});

// ============================
// RUTAS DE ADMIN (HTML)
// ============================
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// ============================
// RUTA POR DEFECTO
// ============================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================
// INICIAR SERVIDOR
// ============================
mongoose.connection.once('open', async () => {
    console.log('📊 Base de datos lista');
    await createDefaultAdmin();
    
    server.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📁 Panel admin: http://localhost:${PORT}/admin`);
        console.log(`🔗 WebSockets activos en puerto ${PORT}`);
    });
});

// Manejo de errores
process.on('uncaughtException', (error) => {
    console.error('⚠️ Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('⚠️ Promise rechazada no manejada:', reason);
});