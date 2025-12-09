// server/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer'); // Para subir archivos
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Configuración
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public'))); // Sirve los archivos del frontend

// Configuración de subida de archivos (PDF)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images/'))
    },
    filename: function (req, file, cb) {
        cb(null, 'menu-actual.pdf') // Siempre lo guarda con este nombre para reemplazar el anterior
    }
});
const upload = multer({ storage: storage });

// BASE DE DATOS SIMPLE (Un archivo JSON)
const DATA_FILE = path.join(__dirname, 'data.json');

// Función para leer datos
function leerDatos() {
    if (!fs.existsSync(DATA_FILE)) {
        // Datos por defecto si el archivo no existe
        return {
            historia: "Bienvenidos a Maná Restobar...",
            reservas: { politicaCancelacion: "24 horas antes", bancoNombre: "Bancolombia" },
            almuerzos: [] // Lista de comidas
        };
    }
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

// Función para guardar datos
function guardarDatos(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// --- RUTAS API ---

// 1. LOGIN
// BUSCA ESTE BLOQUE EN TU ARCHIVO Y MODIFÍCALO:

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // USAR ESTAS CREDENCIALES (cambia si quieres otra)
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, token: 'token-falso-seguro-123', admin: { username: 'Admin' } });
    } else {
        res.status(401).json({ success: false, error: 'Credenciales incorrectas' });
    }
});

app.get('/api/auth/verify', (req, res) => {
    res.json({ valid: true }); // Simplificado para este ejemplo
});

// 2. OBTENER TODA LA INFORMACIÓN
app.get('/api/data', (req, res) => {
    const data = leerDatos();
    res.json(data);
});

// 3. GUARDAR HISTORIA
app.post('/api/historia', (req, res) => {
    const data = leerDatos();
    data.historia = req.body.texto;
    guardarDatos(data);
    res.json({ success: true });
});

// 4. SUBIR PDF
app.post('/api/menu/pdf', upload.single('pdf'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No se subió archivo' });
    }
    res.json({ success: true, url: '/images/menu-actual.pdf' });
});

// 5. GESTIONAR ALMUERZOS (Arma tu almuerzo)
app.post('/api/almuerzos', (req, res) => {
    const data = leerDatos();
    const nuevaComida = { id: Date.now(), nombre: req.body.nombre, precio: req.body.precio };
    data.almuerzos.push(nuevaComida);
    guardarDatos(data);
    res.json({ success: true, almuerzos: data.almuerzos });
});

app.delete('/api/almuerzos/:id', (req, res) => {
    const data = leerDatos();
    data.almuerzos = data.almuerzos.filter(item => item.id != req.params.id);
    guardarDatos(data);
    res.json({ success: true, almuerzos: data.almuerzos });
});

// 6. GUARDAR RESERVAS
app.post('/api/reservas', (req, res) => {
    const data = leerDatos();
    data.reservas = req.body; // Guarda todo el objeto de configuración
    guardarDatos(data);
    res.json({ success: true });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});