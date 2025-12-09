// public/js/admin.js - Versión simplificada para empezar

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginPanel = document.getElementById('loginPanel');
    const adminPanel = document.getElementById('adminPanel');
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Verificar si ya está logueado
    const token = localStorage.getItem('adminToken');
    if (token) {
        verifyToken(token);
    }
    
    // ===== LOGIN =====
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Guardar token
                localStorage.setItem('adminToken', data.token);
                localStorage.setItem('adminData', JSON.stringify(data.admin));
                
                // Mostrar panel admin
                loginPanel.style.display = 'none';
                adminPanel.style.display = 'block';
                
                alert('✅ Login exitoso');
            } else {
                throw new Error(data.error || 'Credenciales incorrectas');
            }
        } catch (error) {
            alert('❌ Error: ' + error.message);
        }
    });
    
    // ===== VERIFICAR TOKEN =====
    async function verifyToken(token) {
        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                loginPanel.style.display = 'none';
                adminPanel.style.display = 'block';
            } else {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminData');
            }
        } catch (error) {
            console.error('Error verificando token:', error);
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
        }
    }
    
    // ===== LOGOUT =====
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        location.reload();
    });
    
    // ===== NAVEGACIÓN ENTRE TABS =====
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase active de todos los botones
            navBtns.forEach(b => b.classList.remove('active'));
            
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            
            // Ocultar todos los tabs
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Mostrar el tab correspondiente
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // ===== FUNCIONALIDAD BÁSICA DEL PANEL =====
    
    // 1. Menú PDF - Subir archivo
    const pdfUploadBox = document.getElementById('pdfUploadBox');
    const pdfFileInput = document.getElementById('pdfFile');
    
    if (pdfUploadBox && pdfFileInput) {
        pdfUploadBox.addEventListener('click', function() {
            pdfFileInput.click();
        });
        
        pdfFileInput.addEventListener('change', async function(e) {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                const formData = new FormData();
                formData.append('pdf', file);
                
                try {
                    const token = localStorage.getItem('adminToken');
                    const response = await fetch('/api/menu/pdf', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (response.ok) {
                        alert('✅ PDF actualizado correctamente');
                        document.getElementById('currentPdfName').textContent = data.menu.pdfName;
                    } else {
                        throw new Error(data.error || 'Error al subir el PDF');
                    }
                } catch (error) {
                    alert('❌ Error: ' + error.message);
                }
            }
        });
    }
    
    // 2. Reservas - Guardar configuración
    const saveReservasBtn = document.getElementById('saveReservas');
    
    if (saveReservasBtn) {
        // Cargar configuración actual
        loadReservasConfig();
        
        saveReservasBtn.addEventListener('click', async function() {
            const config = {
                politicaCancelacion: document.getElementById('politicaCancelacion').value,
                politicaModificacion: document.getElementById('politicaModificacion').value,
                politicaAbono: document.getElementById('politicaAbono').value,
                bancoNombre: document.getElementById('bancoNombre').value,
                cuentaNumero: document.getElementById('cuentaNumero').value,
                cuentaTipo: document.getElementById('cuentaTipo').value,
                cuentaNombre: document.getElementById('cuentaNombre').value,
                nequiNumero: document.getElementById('nequiNumero').value
            };
            
            try {
                const token = localStorage.getItem('adminToken');
                const response = await fetch('/api/reservas', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(config)
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    alert('✅ Configuración guardada correctamente');
                } else {
                    throw new Error(data.error || 'Error al guardar');
                }
            } catch (error) {
                alert('❌ Error: ' + error.message);
            }
        });
    }
    
    async function loadReservasConfig() {
        try {
            const response = await fetch('/api/reservas');
            const config = await response.json();
            
            if (response.ok) {
                // Llenar formulario
                document.getElementById('politicaCancelacion').value = config.politicaCancelacion;
                document.getElementById('politicaModificacion').value = config.politicaModificacion;
                document.getElementById('politicaAbono').value = config.politicaAbono;
                document.getElementById('bancoNombre').value = config.bancoNombre;
                document.getElementById('cuentaNumero').value = config.cuentaNumero;
                document.getElementById('cuentaTipo').value = config.cuentaTipo;
                document.getElementById('cuentaNombre').value = config.cuentaNombre;
                document.getElementById('nequiNumero').value = config.nequiNumero;
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
        }
    }
    
    // 3. Actualizar última conexión
    function updateLastConnection() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dateString = now.toLocaleDateString('es-ES');
        
        const lastConnectionEl = document.getElementById('lastConnection');
        if (lastConnectionEl) {
            lastConnectionEl.textContent = `${dateString} ${timeString}`;
        }
    }
    
    // Actualizar cada minuto
    updateLastConnection();
    setInterval(updateLastConnection, 60000);
});