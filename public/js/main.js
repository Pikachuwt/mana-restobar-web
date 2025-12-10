// MANÁ RESTOBAR - JavaScript simplificado y funcional
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Maná Restobar iniciando...');
    
    // Inicializar navegación
    initNavigation();
    
    // Inicializar funcionalidades
    initAlmuerzo();
    initReservas();
    
    // Cargar historia desde API
    loadHistoria();
    
    console.log('✅ Aplicación inicializada');
});

// ============================
// NAVEGACIÓN
// ============================
function initNavigation() {
    console.log('🔧 Inicializando navegación...');
    
    // Seleccionar todos los enlaces de navegación
    const navLinks = document.querySelectorAll('.nav-link, .nav-section-btn');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('data-target');
            console.log(`Clic en: ${targetId}`);
            
            if (!targetId) return;
            
            // Actualizar enlace activo (solo para los enlaces del menú principal)
            if (this.classList.contains('nav-link')) {
                document.querySelectorAll('.nav-link').forEach(navLink => {
                    navLink.classList.remove('active');
                });
                this.classList.add('active');
            }
            
            // Mostrar sección correspondiente
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    console.log(`Mostrando sección: ${targetId}`);
                    
                    // Cargar contenido específico si es necesario
                    if (targetId === 'menu-section') {
                        loadPDF();
                    }
                }
            });
            
            // Scroll suave a la sección
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    console.log(`✅ Navegación inicializada (${navLinks.length} enlaces)`);
}

// ============================
// CARGA DE HISTORIA
// ============================
async function loadHistoria() {
    const historiaDiv = document.getElementById('historia-dinamica');
    if (!historiaDiv) return;
    
    console.log('📖 Cargando historia...');
    
    try {
        // Intentar cargar desde API
        const response = await fetch('/api/historia');
        
        if (response.ok) {
            const data = await response.json();
            
            if (data && data.texto) {
                historiaDiv.innerHTML = `
                    <div class="historia-text">
                        ${data.texto.replace(/\n/g, '<br>')}
                    </div>
                `;
                console.log('✅ Historia cargada desde API');
            } else {
                mostrarHistoriaPorDefecto(historiaDiv);
            }
        } else {
            mostrarHistoriaPorDefecto(historiaDiv);
        }
    } catch (error) {
        console.error('❌ Error cargando historia:', error);
        mostrarHistoriaPorDefecto(historiaDiv);
    }
}

function mostrarHistoriaPorDefecto(historiaDiv) {
    historiaDiv.innerHTML = `
        <div class="historia-text">
            <p>Bienvenidos a <strong>Maná Restobar</strong>, el corazón gastronómico de Pamplona.</p>
            <p>Fundado en el año 2010, nuestro restaurante familiar nació con el sueño de ofrecer a nuestros clientes una experiencia culinaria única, donde la tradición se encuentra con la innovación.</p>
            <p>Ubicados estratégicamente frente al Hospital San Juan de Dios, nos hemos convertido en el lugar preferido tanto para los habitantes de Pamplona como para los visitantes que buscan sabores auténticos en un ambiente acogedor y familiar.</p>
            <p>Nuestro nombre "Maná" hace referencia al alimento divino que según la tradición alimentaba a los pueblos en sus viajes. Para nosotros, cada plato que servimos es una bendición que compartimos con nuestra comunidad.</p>
            <p>Nos especializamos en comida típica colombiana con un toque gourmet, utilizando ingredientes frescos y de la más alta calidad, muchos de ellos provenientes de productores locales de Norte de Santander.</p>
            <p>En Maná Restobar, creemos que una buena comida va más allá de alimentar el cuerpo; alimenta el alma, crea momentos memorables y fortalece los lazos entre las personas.</p>
            <p>Te invitamos a ser parte de nuestra historia y a disfrutar de la cálida hospitalidad que nos caracteriza.</p>
        </div>
    `;
    console.log('📝 Usando historia por defecto');
}

// ============================
// CARGA DE PDF (SI ES NECESARIO)
// ============================
function loadPDF() {
    console.log('📄 Verificando PDF...');
    // El PDF ya está incrustado en el HTML, así que solo verificamos
    const pdfFrame = document.getElementById('pdf-frame');
    if (pdfFrame) {
        // Añadir timestamp para evitar cache
        const src = pdfFrame.getAttribute('src');
        if (src && !src.includes('?')) {
            pdfFrame.src = src + '?t=' + new Date().getTime();
        }
    }
}

// ============================
// ARMA TU ALMUERZO
// ============================
function initAlmuerzo() {
    const optionCards = document.querySelectorAll('.option-card');
    const selectedItemsContainer = document.getElementById('selectedItems');
    const totalAmountElement = document.getElementById('totalAmount');
    const sendOrderBtn = document.getElementById('sendOrderBtn');
    const paraLlevarCheckbox = document.getElementById('paraLlevar');
    
    let selectedItems = [];
    let total = 0;
    
    // Función para actualizar el resumen
    function updateSummary() {
        // Calcular total
        total = selectedItems.reduce((sum, item) => sum + item.price, 0);
        
        // Añadir costo para llevar si está marcado
        if (paraLlevarCheckbox && paraLlevarCheckbox.checked) {
            total += 1000;
        }
        
        // Actualizar el total en la UI
        if (totalAmountElement) {
            totalAmountElement.textContent = `$${total.toLocaleString()}`;
        }
        
        // Actualizar la lista de ítems seleccionados
        if (selectedItems.length === 0) {
            selectedItemsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <p class="empty-text">Selecciona los ítems de tu almuerzo</p>
                </div>
            `;
            return;
        }
        
        let itemsHTML = '';
        selectedItems.forEach((item, index) => {
            itemsHTML += `
                <div class="selected-item-card">
                    <span class="selected-item-name">${item.name}</span>
                    <span class="selected-item-price">$${item.price.toLocaleString()}</span>
                    <button class="remove-item-btn" data-index="${index}" style="
                        background: none;
                        border: none;
                        color: #e74c3c;
                        cursor: pointer;
                        font-size: 16px;
                        margin-left: 10px;
                    ">✕</button>
                </div>
            `;
        });
        
        selectedItemsContainer.innerHTML = itemsHTML;
        
        // Añadir event listeners a los botones de eliminar
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeItem(index);
            });
        });
    }
    
    // Función para añadir un ítem
    function addItem(name, price) {
        selectedItems.push({ name, price });
        updateSummary();
        showNotification(`${name} agregado al pedido`, 'success');
    }
    
    // Función para eliminar un ítem
    function removeItem(index) {
        const removedItem = selectedItems.splice(index, 1)[0];
        updateSummary();
        showNotification(`${removedItem.name} eliminado del pedido`, 'info');
    }
    
    // Eventos para las tarjetas de opciones
    optionCards.forEach(card => {
        card.addEventListener('click', function() {
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            
            // Efecto visual de selección
            this.classList.add('selected');
            setTimeout(() => {
                this.classList.remove('selected');
            }, 300);
            
            // Añadir el ítem
            addItem(name, price);
        });
    });
    
    // Evento para el checkbox de "para llevar"
    if (paraLlevarCheckbox) {
        paraLlevarCheckbox.addEventListener('change', updateSummary);
    }
    
    // Evento para el botón de enviar por WhatsApp
    if (sendOrderBtn) {
        sendOrderBtn.addEventListener('click', function() {
            if (selectedItems.length === 0) {
                showNotification('Por favor, selecciona al menos un ítem para tu almuerzo.', 'error');
                return;
            }
            
            let message = `*PEDIDO - MANÁ RESTOBAR*%0A%0A`;
            message += `*Fecha:* ${new Date().toLocaleDateString()}%0A`;
            message += `*Hora:* ${new Date().toLocaleTimeString()}%0A%0A`;
            message += `*Detalle del pedido:*%0A`;
            
            selectedItems.forEach(item => {
                message += `• ${item.name} - $${item.price.toLocaleString()}%0A`;
            });
            
            if (paraLlevarCheckbox && paraLlevarCheckbox.checked) {
                message += `• Para llevar - $1.000%0A`;
            }
            
            message += `%0A*Total: $${total.toLocaleString()}*%0A%0A`;
            message += `_Por favor, confirmar disponibilidad y tiempo de preparación._`;
            
            const phone = '573150118386'; // Número de WhatsApp del footer
            const whatsappURL = `https://wa.me/${phone}?text=${message}`;
            window.open(whatsappURL, '_blank');
            
            showNotification('Redirigiendo a WhatsApp...', 'info');
            
            // Limpiar pedido después de enviar
            setTimeout(() => {
                selectedItems = [];
                if (paraLlevarCheckbox) paraLlevarCheckbox.checked = false;
                updateSummary();
            }, 2000);
        });
    }
    
    console.log(`✅ Sistema "Arma tu Almuerzo" inicializado (${optionCards.length} opciones)`);
}

// ============================
// RESERVAS
// ============================
function initReservas() {
    const reservaForm = document.getElementById('reservaForm');
    if (!reservaForm) return;
    
    console.log('📅 Inicializando sistema de reservas...');
    
    // Establecer la fecha mínima como hoy
    const fechaInput = document.getElementById('fecha');
    if (fechaInput) {
        const today = new Date().toISOString().split('T')[0];
        fechaInput.min = today;
        fechaInput.value = today;
    }
    
    // Establecer hora por defecto (12:00 PM)
    const horaInput = document.getElementById('hora');
    if (horaInput) {
        horaInput.value = '12:00';
    }
    
    // Evento para enviar el formulario
    reservaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener los valores del formulario
        const personas = document.getElementById('personas').value;
        const hora = document.getElementById('hora').value;
        const fecha = document.getElementById('fecha').value;
        const plato = document.getElementById('plato').value;
        const observaciones = document.getElementById('observaciones').value;
        
        // Validar que los campos obligatorios estén llenos
        if (!personas || !hora || !fecha) {
            showNotification('Por favor, complete los campos obligatorios: Número de personas, Hora y Fecha.', 'error');
            return;
        }
        
        // Formatear la fecha
        const fechaObj = new Date(fecha);
        const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Crear el mensaje para WhatsApp
        let message = `*RESERVA - MANÁ RESTOBAR*%0A%0A`;
        message += `*Número de personas:* ${personas}%0A`;
        message += `*Fecha:* ${fechaFormateada}%0A`;
        message += `*Hora:* ${hora}%0A`;
        
        if (plato) {
            message += `*Plato solicitado:* ${plato}%0A`;
        }
        
        if (observaciones) {
            message += `*Observaciones:* ${observaciones}%0A`;
        }
        
        message += `%0A_Por favor, confirmar disponibilidad._`;
        
        const phone = '573150118386'; // Número de WhatsApp del footer
        const whatsappURL = `https://wa.me/${phone}?text=${message}`;
        window.open(whatsappURL, '_blank');
        
        showNotification('Redirigiendo a WhatsApp para confirmar reserva...', 'success');
        
        // Limpiar formulario después de enviar
        setTimeout(() => {
            reservaForm.reset();
            if (fechaInput) {
                const today = new Date().toISOString().split('T')[0];
                fechaInput.value = today;
            }
            if (horaInput) horaInput.value = '12:00';
        }, 1000);
    });
    
    console.log('✅ Sistema de reservas inicializado');
}

// ============================
// NOTIFICACIONES
// ============================
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) {
        console.warn('No se encontró el contenedor de notificaciones');
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #666;
        ">&times;</button>
    `;
    
    container.appendChild(notification);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fas fa-check-circle';
        case 'error': return 'fas fa-exclamation-circle';
        case 'warning': return 'fas fa-exclamation-triangle';
        case 'info': return 'fas fa-info-circle';
        default: return 'fas fa-bell';
    }
}

// ============================
// FUNCIONES GLOBALES
// ============================
window.loadHistoria = loadHistoria;
window.loadPDF = loadPDF;
window.showNotification = showNotification;

console.log('🎯 Maná Restobar JavaScript cargado correctamente');