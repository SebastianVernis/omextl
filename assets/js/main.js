/* ======================================================================= */
/* Script Principal Optimizado para OMEX TL                                */
/* ======================================================================= */

// Configuración global optimizada
const CONFIG = {
    ANIMATION_THRESHOLD: 1.25,
    DEBOUNCE_DELAY: 100,
    INTERSECTION_THRESHOLD: 0.1
};

// Utilidades optimizadas
const Utils = {
    // Debounce optimizado
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Selector optimizado con cache
    $(selector, context = document) {
        return context.querySelector(selector);
    },

    $$(selector, context = document) {
        return context.querySelectorAll(selector);
    }
};

// Gestión del chatbot optimizada
class ChatbotManager {
    constructor() {
        this.bubble = Utils.$('#chat-bubble');
        this.container = Utils.$('#chatbot-container');
        this.init();
    }

    init() {
        if (this.bubble) {
            this.bubble.addEventListener('click', () => this.toggle());
        }
        
        // Escuchar mensajes del iframe
        window.addEventListener('message', (event) => {
            if (event.data === 'close-chatbot') {
                this.close();
            }
        });
    }

    toggle() {
        if (this.container) {
            this.container.classList.toggle('visible');
        }
    }

    close() {
        if (this.container) {
            this.container.classList.remove('visible');
        }
    }
}

// Gestión de navegación optimizada
class NavigationManager {
    constructor() {
        this.mobileButton = Utils.$('.mobile-menu-button');
        this.mobileMenu = Utils.$('.mobile-menu');
        this.init();
    }

    init() {
        if (this.mobileButton && this.mobileMenu) {
            this.mobileButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.mobileMenu.classList.toggle('hidden');
            });

            // Cerrar menú al hacer clic fuera
            document.addEventListener('click', (e) => {
                if (!this.mobileMenu.contains(e.target) && !this.mobileButton.contains(e.target)) {
                    this.mobileMenu.classList.add('hidden');
                }
            });
        }
    }

    setActiveLinks() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = Utils.$$('.nav-link');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage && !link.classList.contains('bg-secondary')) {
                link.classList.add('active-link');
            }
        });
    }
}

// Gestión de animaciones de scroll optimizada con Intersection Observer
class ScrollAnimationManager {
    constructor() {
        this.elements = Utils.$$('.animate-on-scroll');
        this.init();
    }

    init() {
        if (!this.elements.length) return;

        // Usar Intersection Observer para mejor rendimiento
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        // Opcional: dejar de observar el elemento una vez animado
                        // observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: CONFIG.INTERSECTION_THRESHOLD,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        this.elements.forEach(el => observer.observe(el));
    }
}

// Gestión de componentes dinámicos optimizada
class ComponentLoader {
    constructor() {
        this.cache = new Map();
    }

    async loadComponent(id, url) {
        const element = Utils.$(`#${id}`);
        if (!element) return false;

        // Verificar cache
        if (this.cache.has(url)) {
            const cachedContent = this.cache.get(url);
            element.outerHTML = cachedContent;
            return true;
        }

        try {
            // Ajustar URL para rutas de blog
            const fetchUrl = window.location.pathname.includes('/blog/') ? `../${url}` : url;
            
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const component = doc.querySelector(id === 'header-placeholder' ? 'header' : 'footer');
            
            if (component) {
                const componentHTML = component.outerHTML;
                this.cache.set(url, componentHTML); // Guardar en cache
                element.outerHTML = componentHTML;
                return true;
            }
        } catch (error) {
            console.error(`Error loading ${id}:`, error);
        }
        return false;
    }

    async loadAllComponents() {
        const promises = [
            this.loadComponent('header-placeholder', 'index.html'),
            this.loadComponent('footer-placeholder', 'index.html')
        ];
        
        await Promise.all(promises);
    }
}

// Gestión del año en el footer
class FooterManager {
    static updateYear() {
        const yearSpan = Utils.$('#year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
}

// Gestión de lazy loading para imágenes
class LazyLoadManager {
    constructor() {
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        imageObserver.unobserve(img);
                    }
                });
            });

            Utils.$$('img[data-src]').forEach(img => imageObserver.observe(img));
        }
    }
}

// Inicialización principal optimizada
class App {
    constructor() {
        this.chatbot = null;
        this.navigation = null;
        this.scrollAnimation = null;
        this.componentLoader = null;
        this.lazyLoad = null;
    }

    async init() {
        // Inicializar componentes principales
        this.chatbot = new ChatbotManager();
        this.navigation = new NavigationManager();
        this.scrollAnimation = new ScrollAnimationManager();
        this.lazyLoad = new LazyLoadManager();

        // Verificar si necesitamos cargar componentes
        const needsComponents = Utils.$('#header-placeholder') || Utils.$('#footer-placeholder');
        
        if (needsComponents) {
            this.componentLoader = new ComponentLoader();
            await this.componentLoader.loadAllComponents();
            
            // Re-inicializar navegación después de cargar componentes
            this.navigation = new NavigationManager();
        }

        // Configurar enlaces activos y año
        this.navigation.setActiveLinks();
        FooterManager.updateYear();

        // Optimización: ejecutar animaciones iniciales solo si es necesario
        requestAnimationFrame(() => {
            this.scrollAnimation = new ScrollAnimationManager();
        });
    }
}

// Inicialización con mejor manejo de errores
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const app = new App();
        await app.init();
    } catch (error) {
        console.error('Error initializing app:', error);
        // Fallback básico
        FooterManager.updateYear();
    }
});

// Optimización para navegadores modernos
if ('serviceWorker' in navigator && 'production' === 'production') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .catch(err => console.log('SW registration failed'));
    });
}