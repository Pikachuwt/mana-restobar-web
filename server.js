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

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB'))
.catch(err => console.error('❌ Error de conexión a MongoDB:', err));

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

// Ruta para servir el index.html de React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});