// server/admin-functions.js
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// En server/admin-functions.js - AGREGAR ESTAS FUNCIONES:

// Función para cambiar nombre de usuario
function cambiarUsername(currentPassword, newUsername) {
    const data = leerDatos();
    
    if (!data.config) data.config = {};
    
    // Verificar contraseña actual
    const currentStoredPassword = data.config.password || 'Patoazul';
    if (currentPassword !== currentStoredPassword) {
        return { success: false, error: 'Contraseña actual incorrecta' };
    }
    
    // Validar nuevo nombre de usuario
    if (!newUsername || newUsername.trim().length < 3) {
        return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres' };
    }
    
    // Guardar nuevo nombre de usuario
    data.config.username = newUsername.trim();
    const guardado = guardarDatos(data);
    
    if (guardado) {
        // Actualizar en server.js
        actualizarUsernameEnServerJS(newUsername.trim());
        return {
            success: true,
            message: '✅ Nombre de usuario cambiado exitosamente'
        };
    } else {
        return {
            success: false,
            error: 'Error guardando el nuevo nombre de usuario'
        };
    }
}

// Función para cambiar contraseña (actualizada)
function cambiarPassword(currentPassword, newPassword) {
    const data = leerDatos();
    
    if (!data.config) data.config = {};
    
    // Verificar contraseña actual
    const currentStoredPassword = data.config.password || 'Patoazul';
    if (currentPassword !== currentStoredPassword) {
        return { success: false, error: 'Contraseña actual incorrecta' };
    }
    
    // Validar nueva contraseña
    if (!newPassword || newPassword.length < 6) {
        return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' };
    }
    
    // Guardar nueva contraseña
    data.config.password = newPassword;
    const guardado = guardarDatos(data);
    
    if (guardado) {
        // Actualizar en server.js
        actualizarPasswordEnServerJS(newPassword);
        return {
            success: true,
            message: '✅ Contraseña cambiada exitosamente'
        };
    } else {
        return {
            success: false,
            error: 'Error guardando la nueva contraseña'
        };
    }
}

// Función para actualizar nombre de usuario en server.js
function actualizarUsernameEnServerJS(newUsername) {
    try {
        const serverFile = path.join(__dirname, 'server.js');
        let serverContent = fs.readFileSync(serverFile, 'utf8');
        
        // Buscar y reemplazar el nombre de usuario en el login
        serverContent = serverContent.replace(
            /if \(username === '.*?' && password === currentPassword\)/,
            `if (username === '${newUsername}' && password === currentPassword)`
        );
        
        fs.writeFileSync(serverFile, serverContent, 'utf8');
        console.log('✅ Nombre de usuario actualizado en server.js');
    } catch (error) {
        console.error('⚠️ No se pudo actualizar el nombre de usuario en server.js:', error.message);
    }
}

// Función para actualizar contraseña en server.js
function actualizarPasswordEnServerJS(newPassword) {
    try {
        const serverFile = path.join(__dirname, 'server.js');
        let serverContent = fs.readFileSync(serverFile, 'utf8');
        
        // Buscar y reemplazar la contraseña en el login
        serverContent = serverContent.replace(
            /if \(username === '.*?' && password === '.*?'\)/,
            `if (username === '${getCurrentUsername()}' && password === '${newPassword}')`
        );
        
        fs.writeFileSync(serverFile, serverContent, 'utf8');
        console.log('✅ Contraseña actualizada en server.js');
    } catch (error) {
        console.error('⚠️ No se pudo actualizar la contraseña en server.js:', error.message);
    }
}

// Función para obtener nombre de usuario actual
function getCurrentUsername() {
    const data = leerDatos();
    return data.config?.username || 'admin';
}

// Función para obtener contraseña actual
function getCurrentPassword() {
    const data = leerDatos();
    return data.config?.password || 'Patoazul';
}

// No olvides exportar las nuevas funciones al final:
module.exports = {
    // ... funciones existentes ...
    cambiarUsername,
    cambiarPassword,
    getCurrentUsername,
    getCurrentPassword,
    actualizarUsernameEnServerJS,
    actualizarPasswordEnServerJS
};



// Función para leer datos con manejo robusto de errores
function leerDatos() {
    // Si el archivo no existe, crear uno con datos por defecto
    if (!fs.existsSync(DATA_FILE)) {
        console.log('📁 Creando data.json con datos por defecto...');
        const datosPorDefecto = {
            historia: "Bienvenidos a Maná Restobar...",
            reservas: {
                politicaCancelacion: "24 horas antes",
                bancoNombre: "Bancolombia"
            },
            almuerzos: [],
            config: {
                password: 'Patoazul'
            }
        };
        guardarDatos(datosPorDefecto);
        return datosPorDefecto;
    }

    try {
        let contenido = fs.readFileSync(DATA_FILE, 'utf8');
        
        // Limpiar posibles BOM (Byte Order Mark) y espacios extra
        contenido = contenido.trim().replace(/^\uFEFF/, '');
        
        // Si el archivo está vacío o casi vacío
        if (!contenido || contenido === '' || contenido === '{}' || contenido === '[]') {
            throw new Error('Archivo JSON vacío o inválido');
        }
        
        // Intentar parsear el JSON
        const datos = JSON.parse(contenido);
        
        // Asegurar que tenga la estructura básica
        if (!datos.historia) datos.historia = "";
        if (!datos.reservas) datos.reservas = {};
        if (!datos.almuerzos) datos.almuerzos = [];
        if (!datos.config) datos.config = { password: 'Patoazul' };
        
        return datos;
        
    } catch (error) {
        console.error('❌ Error leyendo data.json:', error.message);
        console.log('📝 Creando archivo nuevo con datos por defecto...');
        
        // Crear datos por defecto
        const datosPorDefecto = {
            historia: "Bienvenidos a Maná Restobar...",
            reservas: {
                politicaCancelacion: "24 horas antes",
                bancoNombre: "Bancolombia"
            },
            almuerzos: [],
            config: {
                password: 'Patoazul'
            }
        };
        
        // Guardar datos por defecto
        guardarDatos(datosPorDefecto);
        return datosPorDefecto;
    }
}

// Función para guardar datos
function guardarDatos(data) {
    try {
        const contenido = JSON.stringify(data, null, 2);
        fs.writeFileSync(DATA_FILE, contenido, 'utf8');
        console.log('✅ Datos guardados correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error guardando datos:', error);
        return false;
    }
}

// ===== FUNCIONES DEL ADMIN =====

// 1. Guardar historia
function guardarHistoria(texto) {
    const data = leerDatos();
    data.historia = texto;
    const guardado = guardarDatos(data);
    return { success: guardado };
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
    const guardado = guardarDatos(data);
    return {
        success: guardado,
        almuerzos: data.almuerzos
    };
}

// 3. Eliminar almuerzo
function eliminarAlmuerzo(id) {
    const data = leerDatos();
    data.almuerzos = data.almuerzos.filter(item => item.id != id);
    const guardado = guardarDatos(data);
    return {
        success: guardado,
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
    const guardado = guardarDatos(data);
    return { success: guardado };
}

// 5. Cambiar contraseña
function cambiarPassword(currentPassword, newPassword) {
    const data = leerDatos();
    
    // Verificar que exista config
    if (!data.config) data.config = {};
    
    // Usar contraseña actual almacenada o la por defecto
    const currentStoredPassword = data.config.password || 'Patoazul';
    
    if (currentPassword !== currentStoredPassword) {
        return { success: false, error: 'Contraseña actual incorrecta' };
    }
    
    // Actualizar contraseña
    data.config.password = newPassword;
    const guardado = guardarDatos(data);
    
    if (guardado) {
        // También actualizar en server.js (opcional)
        actualizarPasswordEnServerJS(newPassword);
        return {
            success: true,
            message: '✅ Contraseña cambiada exitosamente'
        };
    } else {
        return {
            success: false,
            error: 'Error guardando la nueva contraseña'
        };
    }
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
        console.error('⚠️ No se pudo actualizar la contraseña en server.js:', error.message);
        // No es crítico, la contraseña principal está en data.json
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