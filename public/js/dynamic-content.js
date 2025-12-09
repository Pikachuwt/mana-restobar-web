// public/js/dynamic-content.js
// Script para cargar datos dinámicos desde el servidor a la página principal

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Cargando datos dinámicos...');
    cargarDatosDinamicos();
});

// Función principal para cargar todos los datos
async function cargarDatosDinamicos() {
    try {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('Error del servidor');
        
        const data = await response.json();
        console.log('📦 Datos recibidos:', data);
        
        // 1. Cargar historia
        if (data.historia) {
            cargarHistoria(data.historia);
        }
        
        // 2. Cargar opciones de "Arma tu Almuerzo" (si existen)
        if (data.almuerzos && data.almuerzos.length > 0) {
            cargarOpcionesAlmuerzo(data.almuerzos);
        }
        
        // 3. Cargar políticas de reservas
        if (data.reservas) {
            cargarPoliticasReservas(data.reservas);
        }
        
        // 4. Cargar datos bancarios
        if (data.reservas) {
            cargarDatosBancarios(data.reservas);
        }
        
        console.log('✅ Todos los datos cargados correctamente');
        
    } catch (error) {
        console.error('❌ Error cargando datos dinámicos:', error);
        mostrarError('No se pudieron cargar los datos del menú. Por favor recarga la página.');
    }
}

// 1. Cargar historia dinámica
function cargarHistoria(historiaTexto) {
    const historiaContent = document.querySelector('.historia-content');
    if (historiaContent) {
        historiaContent.innerHTML = `<p>${historiaTexto}</p>`;
        console.log('✅ Historia actualizada');
    }
}

// 2. Cargar opciones de "Arma tu Almuerzo"
function cargarOpcionesAlmuerzo(almuerzos) {
    const container = document.querySelector('.options-grid-simple');
    if (!container) {
        console.warn('⚠️ No se encontró el contenedor de opciones');
        return;
    }
    
    // Mapear emojis según el nombre
    const getEmoji = (nombre) => {
        const lower = nombre.toLowerCase();
        if (lower.includes('arroz')) return '🍚';
        if (lower.includes('papa') || lower.includes('papas')) return '🍟';
        if (lower.includes('carne') || lower.includes('res') || lower.includes('cerdo') || lower.includes('pechuga')) return '🥩';
        if (lower.includes('sopa')) return '🥣';
        if (lower.includes('tajada') || lower.includes('maduro') || lower.includes('patacón')) return '🍌';
        if (lower.includes('maíz')) return '🌽';
        if (lower.includes('tocineta')) return '🥓';
        if (lower.includes('ensalada')) return '🥗';
        if (lower.includes('huevo')) return '🥚';
        if (lower.includes('queso')) return '🧀';
        if (lower.includes('chorizo')) return '🌭';
        if (lower.includes('salchicha')) return '🌭';
        if (lower.includes('grano') || lower.includes('lenteja') || lower.includes('frijol')) return '🫘';
        return '🍽️';
    };
    
    let optionsHTML = '';
    almuerzos.forEach(item => {
        const emoji = getEmoji(item.nombre);
        const precio = item.precio ? parseInt(item.precio) : 0;
        
        optionsHTML += `
        <div class="option-card" data-name="${item.nombre}" data-price="${precio}">
            <div class="option-icon">${emoji}</div>
            <div class="option-details">
                <h3 class="option-title">${item.nombre}</h3>
                ${precio > 0 ? `<p class="option-price">$${precio.toLocaleString()}</p>` : ''}
            </div>
        </div>`;
    });
    
    container.innerHTML = optionsHTML;
    console.log(`✅ ${almuerzos.length} opciones de almuerzo cargadas`);
    
    // Reactivar eventos de clic
    reactivarEventosOpciones();
}

// 3. Cargar políticas de reservas
function cargarPoliticasReservas(reservas) {
    // Política de cancelación
    if (reservas.politicaCancelacion) {
        const elemento = document.querySelector('.politica-item:nth-child(1) p');
        if (elemento) elemento.textContent = reservas.politicaCancelacion;
    }
    
    // Política de modificación
    if (reservas.politicaModificacion) {
        const elemento = document.querySelector('.politica-item:nth-child(2) p');
        if (elemento) elemento.textContent = reservas.politicaModificacion;
    }
    
    // Política de abono
    if (reservas.politicaAbono) {
        const elemento = document.querySelector('.politica-item:nth-child(3) p');
        if (elemento) elemento.textContent = reservas.politicaAbono;
    }
    
    console.log('✅ Políticas de reservas actualizadas');
}

// 4. Cargar datos bancarios
function cargarDatosBancarios(reservas) {
    // Bancolombia
    if (reservas.bancoNombre || reservas.cuentaNumero) {
        const pagoMethods = document.querySelectorAll('.pago-method');
        if (pagoMethods.length >= 1) {
            if (reservas.bancoNombre) {
                pagoMethods[0].querySelector('h4').textContent = reservas.bancoNombre;
            }
            if (reservas.cuentaTipo && reservas.cuentaNumero) {
                pagoMethods[0].querySelector('p strong').textContent = reservas.cuentaTipo + ':';
                pagoMethods[0].querySelector('p').innerHTML = 
                    `<strong>${reservas.cuentaTipo}:</strong> ${reservas.cuentaNumero}`;
            }
            if (reservas.cuentaNombre) {
                pagoMethods[0].querySelector('p:nth-child(3)').textContent = 
                    `A nombre de ${reservas.cuentaNombre}`;
            }
        }
    }
    
    // Nequi/Daviplata
    if (reservas.nequiNumero) {
        const pagoMethods = document.querySelectorAll('.pago-method');
        if (pagoMethods.length >= 2) {
            pagoMethods[1].querySelector('strong').textContent = reservas.nequiNumero;
            if (reservas.cuentaNombre) {
                pagoMethods[1].querySelector('p:nth-child(3)').textContent = 
                    `A nombre de ${reservas.cuentaNombre}`;
            }
        }
    }
    
    console.log('✅ Datos bancarios actualizados');
}

// Reactivar eventos de clic en las opciones
function reactivarEventosOpciones() {
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            
            // Lógica existente para agregar al carrito
            if (typeof agregarAlCarrito === 'function') {
                agregarAlCarrito(name, price);
            } else {
                console.log('Agregar al carrito:', name, price);
                // Aquí iría tu lógica del carrito
            }
        });
    });
}

// Mostrar mensaje de error
function mostrarError(mensaje) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-mensaje';
    errorDiv.innerHTML = `
        <div style="background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 10px 0;">
            ⚠️ ${mensaje}
        </div>
    `;
    
    const content = document.getElementById('content');
    if (content) {
        content.prepend(errorDiv);
    }
}

// Función para actualizar datos en tiempo real (opcional)
function actualizarDatos() {
    console.log('🔄 Actualizando datos...');
    cargarDatosDinamicos();
}

// Exponer funciones globalmente si es necesario
window.cargarDatosDinamicos = cargarDatosDinamicos;
window.actualizarDatos = actualizarDatos;