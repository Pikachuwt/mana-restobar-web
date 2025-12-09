// ===== NAVEGACIÓN ENTRE SECCIONES =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Navegación inicializando...');
    
    // Elementos de navegación
    const navLinks = document.querySelectorAll('.nav-link');
    const navSectionBtns = document.querySelectorAll('.nav-section-btn');
    const sections = document.querySelectorAll('.section');
    
    console.log(`Encontrados: ${navLinks.length} enlaces, ${sections.length} secciones`);
    
    // 1. Función para activar una sección
    function activateSection(sectionId) {
        console.log(`Activando sección: ${sectionId}`);
        
        // Ocultar todas las secciones
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        // Mostrar la sección objetivo
        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            
            // Actualizar URL (hash)
            if (sectionId !== 'inicio') {
                window.location.hash = sectionId;
            } else {
                history.replaceState(null, null, ' ');
            }
            
            // Actualizar enlaces activos
            updateActiveLinks(sectionId);
            
            // Scroll suave al inicio
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            console.log(`✅ Sección ${sectionId} activada`);
            return true;
        } else {
            console.error(`❌ Sección ${sectionId}-section no encontrada`);
            return false;
        }
    }
    
    // 2. Función para actualizar enlaces activos
    function updateActiveLinks(activeSection) {
        navLinks.forEach(link => {
            const linkSection = link.getAttribute('data-section');
            if (linkSection === activeSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    // 3. Configurar eventos para enlaces del header
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const sectionId = this.getAttribute('data-section');
            console.log(`🖱️ Clic en enlace: ${sectionId}`);
            
            activateSection(sectionId);
        });
    });
    
    // 4. Configurar eventos para botones del hero
    navSectionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const sectionId = this.getAttribute('data-section');
            console.log(`🖱️ Clic en botón hero: ${sectionId}`);
            
            activateSection(sectionId);
        });
    });
    
    // 5. Cargar sección basada en hash de URL
    function loadFromHash() {
        const hash = window.location.hash.substring(1);
        console.log(`🔗 Hash en URL: "${hash}"`);
        
        if (hash && hash.trim() !== '') {
            if (activateSection(hash)) {
                console.log(`✅ Sección cargada desde hash: ${hash}`);
            } else {
                console.log('⚠️  Hash inválido, cargando inicio...');
                activateSection('inicio');
            }
        } else {
            console.log('✅ Cargando sección por defecto: inicio');
            activateSection('inicio');
        }
    }
    
    // 6. Manejar cambios en el hash (botones atrás/adelante)
    window.addEventListener('hashchange', function() {
        console.log('🔄 Hash cambiado');
        loadFromHash();
    });
    
    // 7. Inicializar navegación
    loadFromHash();
    
    // 8. Mostrar estado en consola para depuración
    setTimeout(() => {
        console.log('🎯 Navegación inicializada correctamente');
        console.log('📌 Prueba estos comandos en la consola (F12):');
        console.log('   - window.debugNavigation()');
        console.log('   - activateSection("menu")');
    }, 100);
    
    // 9. Función de depuración
    window.debugNavigation = function() {
        console.log('=== DEBUG NAVEGACIÓN ===');
        console.log('📌 Secciones:');
        sections.forEach((section, i) => {
            console.log(`   [${i}] ${section.id} - Activa: ${section.classList.contains('active')}`);
        });
        
        console.log('📌 Enlaces:');
        navLinks.forEach((link, i) => {
            console.log(`   [${i}] "${link.textContent.trim()}" - data-section: ${link.getAttribute('data-section')} - Activo: ${link.classList.contains('active')}`);
        });
        
        console.log('📌 Hash actual:', window.location.hash || '(vacío)');
        console.log('=== FIN DEBUG ===');
    };
});

// ===== FUNCIONALIDAD "ARMA TU ALMUERZO" =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍽️  Inicializando "Arma tu Almuerzo"...');
    
    let selectedItems = [];
    let totalAmount = 0;
    const MAX_SELECTIONS = 16;
    
    const optionCards = document.querySelectorAll('.option-card');
    const paraLlevarCheckbox = document.getElementById('paraLlevar');
    const sendOrderBtn = document.getElementById('sendOrderBtn');
    const selectedItemsContainer = document.getElementById('selectedItems');
    const totalAmountElement = document.getElementById('totalAmount');
    
    if (optionCards.length === 0) {
        console.log('⚠️  No se encontraron opciones de almuerzo');
        return;
    }
    
    // Inicializar
    updateOrderSummary();
    
    // Manejar clic en opciones
    optionCards.forEach(card => {
        card.addEventListener('click', function() {
            const itemName = this.getAttribute('data-name');
            const itemPrice = parseInt(this.getAttribute('data-price'));
            
            if (this.classList.contains('selected')) {
                // Deseleccionar
                this.classList.remove('selected');
                removeFromOrder(itemName);
            } else {
                // Verificar límite
                if (selectedItems.length >= MAX_SELECTIONS) {
                    alert(`Solo puedes seleccionar hasta ${MAX_SELECTIONS} ítems`);
                    return;
                }
                
                // Seleccionar
                this.classList.add('selected');
                addToOrder(itemName, itemPrice);
            }
            
            updateOrderSummary();
        });
    });
    
    // Manejar "para llevar"
    if (paraLlevarCheckbox) {
        paraLlevarCheckbox.addEventListener('change', updateOrderSummary);
    }
    
    // Manejar envío a WhatsApp
    if (sendOrderBtn) {
        sendOrderBtn.addEventListener('click', sendOrderToWhatsApp);
    }
    
    // Funciones auxiliares
    function addToOrder(name, price) {
        selectedItems.push({ name, price });
    }
    
    function removeFromOrder(name) {
        selectedItems = selectedItems.filter(item => item.name !== name);
    }
    
    function updateOrderSummary() {
        // Calcular total
        totalAmount = selectedItems.reduce((sum, item) => sum + item.price, 0);
        
        // Agregar para llevar si está seleccionado
        if (paraLlevarCheckbox && paraLlevarCheckbox.checked) {
            totalAmount += 1000;
        }
        
        // Actualizar UI
        updateSelectedItemsList();
        if (totalAmountElement) {
            totalAmountElement.textContent = `$${totalAmount.toLocaleString()}`;
        }
    }
    
    function updateSelectedItemsList() {
        if (!selectedItemsContainer) return;
        
        if (selectedItems.length === 0) {
            selectedItemsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p class="empty-text">Selecciona los ítems de tu almuerzo</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        selectedItems.forEach(item => {
            html += `
                <div class="selected-item-card">
                    <span class="selected-item-name">${item.name}</span>
                    <span class="selected-item-price">$${item.price.toLocaleString()}</span>
                </div>
            `;
        });
        
        // Agregar "para llevar" si está seleccionado
        if (paraLlevarCheckbox && paraLlevarCheckbox.checked) {
            html += `
                <div class="selected-item-card">
                    <span class="selected-item-name">Para llevar</span>
                    <span class="selected-item-price">+ $1.000</span>
                </div>
            `;
        }
        
        selectedItemsContainer.innerHTML = html;
    }
    
    function sendOrderToWhatsApp() {
        if (selectedItems.length === 0) {
            alert('Por favor selecciona al menos un ítem para tu almuerzo');
            return;
        }
        
        const phone = '573150118386';
        
        // Construir mensaje
        let message = '¡Hola Maná Restobar!%0A%0AQuiero ordenar:%0A%0A';
        
        // Agregar items seleccionados
        selectedItems.forEach(item => {
            message += `• ${item.name} - $${item.price.toLocaleString()}%0A`;
        });
        
        // Agregar para llevar si aplica
        if (paraLlevarCheckbox && paraLlevarCheckbox.checked) {
            message += `• Para llevar - $1.000%0A`;
        }
        
        // Agregar total
        message += `%0A*Total: $${totalAmount.toLocaleString()}*%0A%0A`;
        message += '¡Gracias!';
        
        // Abrir WhatsApp
        window.open(`https://api.whatsapp.com/send/?phone=${phone}&text=${message}`, '_blank');
    }
    
    console.log('✅ "Arma tu Almuerzo" inicializado');
});

// ===== FUNCIONALIDAD RESERVAS =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📅 Inicializando sistema de reservas...');
    
    const reservaForm = document.getElementById('reservaForm');
    
    if (!reservaForm) {
        console.log('⚠️  Formulario de reservas no encontrado');
        return;
    }
    
    // Establecer fecha mínima como hoy
    const fechaInput = document.getElementById('fecha');
    const today = new Date().toISOString().split('T')[0];
    if (fechaInput) {
        fechaInput.min = today;
    }
    
    // Establecer valor por defecto para fecha (mañana)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (fechaInput) {
        fechaInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    // Establecer hora por defecto (19:00)
    const horaInput = document.getElementById('hora');
    if (horaInput) {
        horaInput.value = '19:00';
    }
    
    reservaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const personas = document.getElementById('personas')?.value;
        const fecha = document.getElementById('fecha')?.value;
        const hora = document.getElementById('hora')?.value;
        const plato = document.getElementById('plato')?.value;
        const observaciones = document.getElementById('observaciones')?.value;
        
        // Validar número de personas
        if (!personas || personas < 1) {
            alert('Por favor ingresa un número válido de personas');
            return;
        }
        
        // Formatear fecha
        const fechaFormateada = new Date(fecha).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Construir mensaje
        let message = '¡Hola Maná Restobar!%0A%0AQuiero hacer una reserva:%0A%0A';
        message += `*Personas:* ${personas}%0A`;
        message += `*Fecha:* ${fechaFormateada}%0A`;
        message += `*Hora:* ${hora}%0A`;
        
        if (plato) {
            message += `*Plato de interés:* ${plato}%0A`;
        }
        
        if (observaciones) {
            message += `*Observaciones:* ${observaciones}%0A`;
        }
        
        message += `%0A¡Gracias!`;
        
        // Abrir WhatsApp
        const phone = '573150118386';
        window.open(`https://api.whatsapp.com/send/?phone=${phone}&text=${message}`, '_blank');
    });
    
    console.log('✅ Sistema de reservas inicializado');
});

// ===== FUNCIÓN PARA CARGAR DATOS DEL BACKEND =====
async function loadDataFromBackend() {
    console.log('🌐 Cargando datos del backend...');
    
    try {
        // Cargar menú
        const menuResponse = await fetch('/api/menu');
        if (menuResponse.ok) {
            const menuData = await menuResponse.json();
            console.log('✅ Menú cargado:', menuData);
            // Aquí puedes actualizar la UI con los datos del menú
        }
        
        // Cargar ítems de almuerzo
        const almuerzoResponse = await fetch('/api/almuerzo');
        if (almuerzoResponse.ok) {
            const almuerzoItems = await almuerzoResponse.json();
            console.log('✅ Ítems de almuerzo cargados:', almuerzoItems);
            // Aquí puedes actualizar la UI con los ítems de almuerzo
        }
        
    } catch (error) {
        console.error('❌ Error cargando datos del backend:', error);
    }
}

// Cargar datos cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    // Solo cargar datos si el backend está disponible
    setTimeout(loadDataFromBackend, 500);
});

// ===== FUNCIONES ADICIONALES =====
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar año en copyright
    const yearSpan = document.querySelector('.footer-bottom p');
    if (yearSpan) {
        const currentYear = new Date().getFullYear();
        yearSpan.innerHTML = yearSpan.innerHTML.replace('2025', currentYear);
    }
    
    console.log('✅ Funciones adicionales inicializadas');
});