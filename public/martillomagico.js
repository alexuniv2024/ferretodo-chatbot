(function() {
    // ===== CONFIGURACIÓN =====
    const CONFIG = {
        ACTIVAR_AUTOMATICO: true,      // ¿Activar automáticamente al cargar?
        TIEMPO_ACTIVACION: 2000,        // Milisegundos para activación automática
        MOSTRAR_NOTIFICACION: true,      // ¿Mostrar notificación de bienvenida?
        GOLPEAR_CON_CLICK: true,         // ¿Golpear con clic del mouse?
        GOLPEAR_CON_MARTILLO: true,       // ¿También se puede golpear clickeando el martillo?
        SONIDO: false,                    // (Opcional) Activar sonido si quieres después
        EFECTO_CHISPAS: true               // ¿Mostrar chispas al golpear?
    };
    
    // ===== ELEMENTOS =====
    const martillo = document.getElementById('martilloMagico');
    let martilloActivo = false;
    let posX = -100, posY = -100;
    let golpeando = false;
    
    // ===== INICIALIZACIÓN =====
    if (CONFIG.ACTIVAR_AUTOMATICO) {
        setTimeout(() => {
            activarMartillo();
        }, CONFIG.TIEMPO_ACTIVACION);
    }
    
    // ===== FUNCIÓN PARA ACTIVAR MARTILLO =====
    function activarMartillo() {
        if (martilloActivo) return;
        
        martilloActivo = true;
        document.body.classList.add('martillo-activo');
        
        // Posicionar martillo en el centro de la pantalla inicialmente
        posX = window.innerWidth / 2;
        posY = window.innerHeight / 2;
        actualizarPosicionMartillo();
        
        // Mostrar notificación
        if (CONFIG.MOSTRAR_NOTIFICACION) {
            mostrarNotificacion('🔨 ¡Martillo mágico activado! Haz clic en cualquier producto');
        }
    }
    
    // ===== ACTUALIZAR POSICIÓN DEL MARTILLO =====
    function actualizarPosicionMartillo() {
        martillo.style.left = (posX - 30) + 'px';
        martillo.style.top = (posY - 60) + 'px';
    }
    
    // ===== SEGUIMIENTO DEL MOUSE (TOTAL) =====
    document.addEventListener('mousemove', function(e) {
        if (!martilloActivo) return;
        
        posX = e.clientX;
        posY = e.clientY;
        actualizarPosicionMartillo();
    });
    
    // ===== GOLPE CON CLIC DEL MOUSE =====
    if (CONFIG.GOLPEAR_CON_CLICK) {
        document.addEventListener('click', function(e) {
            if (!martilloActivo || golpeando) return;
            
            // Evitar golpear si se hizo clic en el martillo (si está habilitado)
            if (!CONFIG.GOLPEAR_CON_MARTILLO && e.target === martillo) return;
            
            realizarGolpe(e.clientX, e.clientY);
        });
    }
    
    // ===== GOLPE CON CLIC EN EL MARTILLO =====
    if (CONFIG.GOLPEAR_CON_MARTILLO) {
        martillo.addEventListener('click', function(e) {
            if (!martilloActivo || golpeando) return;
            
            e.preventDefault();
            e.stopPropagation();
            realizarGolpe(posX, posY);
        });
    }
    
    // ===== FUNCIÓN PARA REALIZAR GOLPE =====
    function realizarGolpe(x, y) {
        golpeando = true;
        
        // 1. Animar martillo
        martillo.classList.remove('martillo-flotando');
        martillo.classList.add('martillo-golpe');
        
        // 2. Buscar elemento golpeado
        const elementoGolpeado = document.elementFromPoint(x, y);
        
        if (elementoGolpeado) {
            // Buscar si el elemento o alguno de sus padres es un producto
            const producto = encontrarProducto(elementoGolpeado);
            
            if (producto) {
                golpearProducto(producto, x, y);
            } else {
                // Golpe en el aire - solo efectos visuales
                crearChispas(x, y);
            }
        } else {
            crearChispas(x, y);
        }
        
        // 3. Restaurar martillo
        setTimeout(() => {
            martillo.classList.remove('martillo-golpe');
            martillo.classList.add('martillo-flotando');
            golpeando = false;
        }, 200);
    }
    
    // ===== ENCONTRAR PRODUCTO (CARD) =====
    function encontrarProducto(elemento) {
        // Lista de selectores que identifican un producto
        const selectoresProducto = [
            '.card-artículo',
            '.card',
            '[class*="producto"]',
            '.testimonio-card',
            '.service-card',
            '.col-lg-4',      // Columnas de Bootstrap (si tienen contenido)
            'article'
        ];
        
        let actual = elemento;
        while (actual && actual !== document.body) {
            for (let selector of selectoresProducto) {
                try {
                    if (actual.matches && actual.matches(selector)) {
                        return actual;
                    }
                } catch(e) {}
            }
            actual = actual.parentElement;
        }
        return null;
    }
    
    // ===== GOLPEAR PRODUCTO =====
    function golpearProducto(producto, x, y) {
        // Animación del producto
        producto.classList.add('producto-golpeado');
        setTimeout(() => {
            producto.classList.remove('producto-golpeado');
        }, 800);
        
        // Chispas
        crearChispas(x, y);
        
        // Efectos especiales según el tipo de producto
        const titulo = producto.querySelector('h4, h5, .card-title');
        
        if (titulo) {
            const textoOriginal = titulo.textContent;
            
            // Cambiar temporalmente el texto
            titulo.innerHTML = `<span style="color: #ffc107; font-weight: bold;">✨ ¡GOLPEADO! ✨</span>`;
            
            setTimeout(() => {
                titulo.textContent = textoOriginal;
            }, 1500);
        }
        
        // Efecto de "oferta" aleatoria
        const precio = producto.querySelector('.precio, [class*="price"], .text-muted');
        if (precio && Math.random() > 0.5) {
            const precioOriginal = precio.textContent;
            const descuento = Math.floor(Math.random() * 50) + 10;
            precio.innerHTML = `<span style="color: #ffc107; font-weight: bold;">🔥 ${descuento}% OFF 🔥</span>`;
            setTimeout(() => {
                precio.textContent = precioOriginal;
            }, 2000);
        }
        
        // Sonido (opcional - comentado por defecto)
        if (CONFIG.SONIDO) {
            try {
                // Puedes agregar un sonido aquí si quieres
                // new Audio('ruta/sonido.mp3').play();
            } catch(e) {}
        }
    }
    
    // ===== CREAR CHISPAS =====
    function crearChispas(x, y) {
        if (!CONFIG.EFECTO_CHISPAS) return;
        
        const emojis = ['✨', '💥', '⚡', '🔨', '⭐', '💫'];
        const cantidad = Math.floor(Math.random() * 8) + 5;
        
        for (let i = 0; i < cantidad; i++) {
            setTimeout(() => {
                const chispa = document.createElement('div');
                chispa.className = 'chispa';
                chispa.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                
                // Posición aleatoria alrededor del clic
                chispa.style.left = (x + (Math.random() * 100 - 50)) + 'px';
                chispa.style.top = (y + (Math.random() * 100 - 50)) + 'px';
                
                document.body.appendChild(chispa);
                
                setTimeout(() => {
                    chispa.remove();
                }, 800);
            }, i * 50);
        }
    }
    
    // ===== MOSTRAR NOTIFICACIÓN =====
    function mostrarNotificacion(texto) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion-martillo';
        notificacion.innerHTML = texto;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.style.animation = 'notificacionEntrada 0.5s reverse';
            setTimeout(() => notificacion.remove(), 500);
        }, 3000);
    }
    
    // ===== AJUSTAR POSICIÓN AL CAMBIAR TAMAÑO DE VENTANA =====
    window.addEventListener('resize', function() {
        if (!martilloActivo) return;
        
        // Mantener martillo dentro de los límites
        posX = Math.min(window.innerWidth - 50, Math.max(30, posX));
        posY = Math.min(window.innerHeight - 80, Math.max(30, posY));
        actualizarPosicionMartillo();
    });
    
    // ===== BOTÓN DE ACTIVACIÓN MANUAL (OPCIONAL) =====
    // Puedes agregar un botón para activar manualmente si lo deseas
    const btnActivar = document.createElement('button');
    btnActivar.innerHTML = '🔨';
    btnActivar.style.position = 'fixed';
    btnActivar.style.bottom = '100px';
    btnActivar.style.right = '20px';
    btnActivar.style.zIndex = '99998';
    btnActivar.style.fontSize = '2rem';
    btnActivar.style.border = 'none';
    btnActivar.style.background = '#2e7d32';
    btnActivar.style.color = 'white';
    btnActivar.style.borderRadius = '50%';
    btnActivar.style.width = '60px';
    btnActivar.style.height = '60px';
    btnActivar.style.cursor = 'pointer';
    btnActivar.style.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
    btnActivar.style.transition = 'transform 0.3s';
    btnActivar.title = 'Activar martillo mágico';
    
    btnActivar.addEventListener('mouseenter', () => {
        btnActivar.style.transform = 'scale(1.1)';
    });
    
    btnActivar.addEventListener('mouseleave', () => {
        btnActivar.style.transform = 'scale(1)';
    });
    
    btnActivar.addEventListener('click', () => {
        activarMartillo();
        btnActivar.style.display = 'none';
    });
    
    // Solo mostrar botón si no se activa automáticamente
    if (!CONFIG.ACTIVAR_AUTOMATICO) {
        document.body.appendChild(btnActivar);
    }
    
    // ===== INSTRUCCIONES EN CONSOLA =====
    console.log(
        '%c🔨 MARTILLO MÁGICO CARGADO 🔨\n' +
        '• Sigue el mouse en todas direcciones\n' +
        '• Haz CLIC en cualquier producto para golpearlo\n' +
        '• Disfruta los efectos especiales',
        'background: #2e7d32; color: white; font-size: 14px; padding: 5px;'
    );
    
})();