// public/js/admin.js
const API_URL = '/api';

// ==================== LOGIN ====================
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            await login(username, password);
        });
    }
    
    // Verificar si ya está logueado
    checkAuth();
});

async function login(username, password) {
    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('adminToken', data.token);
            showAdminPanel();
            loadAdminData();
        } else {
            alert('Error: ' + (data.error || 'Credenciales incorrectas'));
        }
    } catch (error) {
        console.error('Error en login:', error);
        alert('Error de conexión con el servidor');
    }
}

async function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        try {
            const response = await fetch(`${API_URL}/admin/verify`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                showAdminPanel();
                loadAdminData();
            } else {
                localStorage.removeItem('adminToken');
            }
        } catch (error) {
            localStorage.removeItem('adminToken');
        }
    }
}

function showAdminPanel() {
    document.getElementById('loginPanel').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    
    // Inicializar tabs
    initTabs();
}

function logout() {
    localStorage.removeItem('adminToken');
    location.reload();
}

// ==================== TABS ====================
function initTabs() {
    const tabButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover active de todos
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Activar el seleccionado
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// ==================== CARGAR DATOS ====================
async function loadAdminData() {
    try {
        // Cargar historia
        const historiaRes = await fetch(`${API_URL}/historia`);
        if (historiaRes.ok) {
            const historiaData = await historiaRes.json();
            document.getElementById('textoHistoria').value = historiaData.texto || '';
        }
        
        // Cargar menú actual
        const menuRes = await fetch(`${API_URL}/menu/current`);
        // Solo verificar que existe
        
        // Cargar almuerzos
        const almuerzosRes = await fetch(`${API_URL}/almuerzos`);
        if (almuerzosRes.ok) {
            const almuerzos = await almuerzosRes.json();
            renderAlmuerzos(almuerzos);
        }
        
        // Cargar configuración de reservas
        const reservasRes = await fetch(`${API_URL}/reservas`);
        if (reservasRes.ok) {
            const reservas = await reservasRes.json();
            fillReservasForm(reservas);
        }
        
    } catch (error) {
        console.error('Error cargando datos:', error);
    }
}

// ==================== HISTORIA ====================
async function guardarHistoria() {
    const texto = document.getElementById('textoHistoria').value;
    
    try {
        const response = await fetch(`${API_URL}/historia`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ texto })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('✅ Historia actualizada correctamente');
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        alert('❌ Error de conexión');
    }
}

// ==================== MENÚ PDF ====================
function manejarSeleccionPDF() {
    const input = document.getElementById('pdfInput');
    if (input.files.length > 0) {
        document.getElementById('pdfFileInfo').style.display = 'block';
        document.getElementById('pdfFileName').textContent = input.files[0].name;
    }
}

async function subirPDF() {
    const input = document.getElementById('pdfInput');
    if (!input.files[0]) {
        alert('⚠️ Por favor selecciona un archivo PDF');
        return;
    }
    
    const formData = new FormData();
    formData.append('pdf', input.files[0]);
    
    try {
        const response = await fetch(`${API_URL}/menu/pdf`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: formData
        });
        
        const data = await response.json();
        if (data.success) {
            alert('✅ PDF actualizado correctamente');
            input.value = '';
            document.getElementById('pdfFileInfo').style.display = 'none';
        } else {
            alert('❌ Error: ' + data.error);
        }
    } catch (error) {
        alert('❌ Error subiendo archivo');
    }
}

// ==================== ALMUERZOS ====================
function renderAlmuerzos(almuerzos) {
    const container = document.getElementById('listaAlmuerzos');
    
    if (!almuerzos || almuerzos.length === 0) {
        container.innerHTML = '<div class="lunch-item" style="justify-content:center;color:#999;">No hay opciones</div>';
        return;
    }
    
    container.innerHTML = almuerzos.map(item => `
        <div class="lunch-item">
            <div>
                <strong>${item.nombre || item.name}</strong>
                <span style="color:#666; font-size:0.9em;"> - $${(item.precio || item.price || 0).toLocaleString()}</span>
            </div>
            <i class="fas fa-trash-alt btn-delete" onclick="eliminarAlmuerzo('${item._id}')"></i>
        </div>
    `).join('');
}

async function agregarAlmuerzo() {
    const nombre = document.getElementById('nuevoAlmuerzoNombre').value.trim();
    const precio = parseFloat(document.getElementById('nuevoAlmuerzoPrecio').value) || 0;
    
    if (!nombre) {
        alert('⚠️ Ingresa un nombre para el ítem');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/almuerzos`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ 
                nombre, 
                precio,
                categoria: 'acompanamiento',
                disponible: true 
            })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('✅ Ítem agregado');
            document.getElementById('nuevoAlmuerzoNombre').value = '';
            document.getElementById('nuevoAlmuerzoPrecio').value = '';
            loadAdminData(); // Recargar lista
        }
    } catch (error) {
        alert('❌ Error agregando ítem');
    }
}

async function eliminarAlmuerzo(id) {
    if (!confirm('¿Eliminar este ítem?')) return;
    
    try {
        const response = await fetch(`${API_URL}/almuerzos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            alert('✅ Ítem eliminado');
            loadAdminData(); // Recargar lista
        }
    } catch (error) {
        alert('❌ Error eliminando ítem');
    }
}

// ==================== RESERVAS ====================
function fillReservasForm(config) {
    // Solo llenar si existe
    if (!config) return;
    
    document.getElementById('politicaCancelacion').value = config.politicaCancelacion || '';
    document.getElementById('politicaModificacion').value = config.politicaModificacion || '';
    document.getElementById('politicaAbono').value = config.politicaAbono || '';
    document.getElementById('bancoNombre').value = config.bancoNombre || '';
    document.getElementById('cuentaTipo').value = config.cuentaTipo || '';
    document.getElementById('cuentaNumero').value = config.cuentaNumero || '';
    document.getElementById('cuentaNombre').value = config.cuentaNombre || '';
    document.getElementById('nequiNumero').value = config.nequiNumero || '';
}

async function guardarReservas() {
    const config = {
        politicaCancelacion: document.getElementById('politicaCancelacion').value,
        politicaModificacion: document.getElementById('politicaModificacion').value,
        politicaAbono: document.getElementById('politicaAbono').value,
        bancoNombre: document.getElementById('bancoNombre').value,
        cuentaTipo: document.getElementById('cuentaTipo').value,
        cuentaNumero: document.getElementById('cuentaNumero').value,
        cuentaNombre: document.getElementById('cuentaNombre').value,
        nequiNumero: document.getElementById('nequiNumero').value
    };
    
    try {
        const response = await fetch(`${API_URL}/reservas`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify(config)
        });
        
        const data = await response.json();
        if (data.success) {
            alert('✅ Configuración guardada');
        }
    } catch (error) {
        alert('❌ Error guardando configuración');
    }
}

// ==================== CREDENCIALES ====================
async function cambiarUsername() {
    const currentPassword = document.getElementById('currentPasswordForUsername').value;
    const newUsername = document.getElementById('newUsername').value.trim();
    
    if (!currentPassword || !newUsername) {
        alert('⚠️ Completa todos los campos');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/username`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ currentPassword, newUsername })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('✅ Usuario actualizado');
            document.getElementById('currentUsernameDisplay').textContent = newUsername;
        }
    } catch (error) {
        alert('❌ Error actualizando usuario');
    }
}

async function cambiarPassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('⚠️ Las contraseñas no coinciden');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/admin/password`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        if (data.success) {
            alert('✅ Contraseña actualizada');
        }
    } catch (error) {
        alert('❌ Error actualizando contraseña');
    }
}

// Exportar funciones globalmente
window.guardarHistoria = guardarHistoria;
window.manejarSeleccionPDF = manejarSeleccionPDF;
window.subirPDF = subirPDF;
window.agregarAlmuerzo = agregarAlmuerzo;
window.eliminarAlmuerzo = eliminarAlmuerzo;
window.guardarReservas = guardarReservas;
window.cambiarUsername = cambiarUsername;
window.cambiarPassword = cambiarPassword;
window.logout = logout;