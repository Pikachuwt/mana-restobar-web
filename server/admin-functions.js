// server/admin-functions.js
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// Función para leer datos
function leerDatos() {
    if (!fs.existsSync(DATA_FILE)) {
        return {
            historia: "Bienvenidos a Maná Restobar...",
            reservas: { 
                politicaCancelacion: "24 horas antes",
                bancoNombre: "Bancolombia" 
            },
            almuerzos: [],
            config: {
                password: 'Patoazul'  // Guardar contraseña aquí
            }
        };
    }
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

// Función para guardar datos
function guardarDatos(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
}

// ===== FUNCIONES DEL ADMIN =====

// 1. Guardar historia
function guardarHistoria(texto) {
    const data = leerDatos();
    data.historia = texto;
    guardarDatos(data);
    return { success: true };
}

// 2. Agregar almuerzo
function agregarAlmuerzo(nombre, precio) {
    const data = leerDatos();
    const nuevoAlmuerzo = {
        id: Date.now(),
        nombre: nombre,
        precio: precio
    };
    data.almuerzos.push(nuevoAlmuerzo);
    guardarDatos(data);
    return { 
        success: true, 
        almuerzos: data.almuerzos 
    };
}

// 3. Eliminar almuerzo
function eliminarAlmuerzo(id) {
    const data = leerDatos();
    data.almuerzos = data.almuerzos.filter(item => item.id != id);
    guardarDatos(data);
    return { 
        success: true, 
        almuerzos: data.almuerzos 
    };
}

// 4. Guardar configuración de reservas
function guardarReservas(config) {
    const data = leerDatos();
    data.reservas = {
        ...data.reservas,
        ...config
    };
    guardarDatos(data);
    return { success: true };
}

// 5. Cambiar contraseña
function cambiarPassword(currentPassword, newPassword) {
    const data = leerDatos();
    
    // Si no existe config, crearla
    if (!data.config) data.config = {};
    
    // Si no hay contraseña guardada, usar la por defecto
    const currentStoredPassword = data.config.password || 'Patoazul';
    
    if (currentPassword !== currentStoredPassword) {
        return { success: false, error: 'Contraseña actual incorrecta' };
    }
    
    // Actualizar en data.json
    data.config.password = newPassword;
    guardarDatos(data);
    
    // También actualizar en server.js (opcional, para mantener consistencia)
    actualizarPasswordEnServerJS(newPassword);
    
    return { 
        success: true, 
        message: '✅ Contraseña cambiada exitosamente' 
    };
}

// 6. Función para actualizar contraseña en server.js
function actualizarPasswordEnServerJS(newPassword) {
    try {
        const serverFile = path.join(__dirname, 'server.js');
        let serverContent = fs.readFileSync(serverFile, 'utf8');
        
        // Buscar y reemplazar la contraseña en el login
        serverContent = serverContent.replace(
            /if \(username === 'admin' && password === '.*?'\)/,
            `if (username === 'admin' && password === '${newPassword}')`
        );
        
        fs.writeFileSync(serverFile, serverContent, 'utf8');
        console.log('✅ Contraseña actualizada en server.js');
    } catch (error) {
        console.error('⚠️ Error actualizando contraseña en server.js:', error);
    }
}

// 7. Obtener todos los datos
function obtenerTodosDatos() {
    return leerDatos();
}

module.exports = {
    leerDatos,
    guardarDatos,
    guardarHistoria,
    agregarAlmuerzo,
    eliminarAlmuerzo,
    guardarReservas,
    cambiarPassword,
    obtenerTodosDatos
};