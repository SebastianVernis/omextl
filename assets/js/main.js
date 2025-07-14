const CONFIG = {
    ANIMATION_THRESHOLD: 1.25,
    DEBOUNCE_DELAY: 100,
    INTERSECTION_THRESHOLD: 0.1
};

const Utils = {
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

    $(selector, context = document) {
        return context.querySelector(selector);
    },

    $$(selector, context = document) {
        return context.querySelectorAll(selector);
    }
};

class ChatbotManager {
    constructor() {
        this.init();
    }

    async injectHTML() {
        if (document.getElementById('chat-bubble')) return;

        const chatbotHTML = `
            <div class="chat-bubble" id="chat-bubble">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></path></svg>
            </div>
            <div class="chatbot-container" id="chatbot-container">
                <iframe src="/chatbot.html" title="Asistente Virtual de OMEXTL" class="chatbot-frame" loading="lazy"></iframe>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    async init() {
        await this.injectHTML();
        this.bubble = Utils.$('#chat-bubble');
        this.container = Utils.$('#chatbot-container');

        if (this.bubble) {
            this.bubble.addEventListener('click', () => this.toggle());
        }
        
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

class ScrollAnimationManager {
    constructor() {
        this.elements = Utils.$$('.animate-on-scroll');
        this.init();
    }

    init() {
        if (!this.elements.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
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

class ComponentLoader {
    constructor() {
        this.cache = new Map();
    }

    async loadComponent(id, url) {
        const element = Utils.$(`#${id}`);
        if (!element) return false;

        if (this.cache.has(url)) {
            const cachedContent = this.cache.get(url);
            element.outerHTML = cachedContent;
            return true;
        }

        try {
            const fetchUrl = window.location.pathname.includes('/blog/') ? `../${url}` : url;
            
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const component = doc.querySelector(id === 'header-placeholder' ? 'header' : 'footer');
            
            if (component) {
                const componentHTML = component.outerHTML;
                this.cache.set(url, componentHTML);
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

class FooterManager {
    static updateYear() {
        const yearSpan = Utils.$('#year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
}

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

class App {
    constructor() {
        this.chatbot = null;
        this.navigation = null;
        this.scrollAnimation = null;
        this.componentLoader = null;
        this.lazyLoad = null;
    }

    async init() {
        this.chatbot = new ChatbotManager();
        this.navigation = new NavigationManager();
        this.scrollAnimation = new ScrollAnimationManager();
        this.lazyLoad = new LazyLoadManager();

        const needsComponents = Utils.$('#header-placeholder') || Utils.$('#footer-placeholder');
        
        if (needsComponents) {
            this.componentLoader = new ComponentLoader();
            await this.componentLoader.loadAllComponents();
            this.navigation = new NavigationManager();
        }

        this.navigation.setActiveLinks();
        FooterManager.updateYear();

        await this.chatbot.init();

        requestAnimationFrame(() => {
            this.scrollAnimation = new ScrollAnimationManager();
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const app = new App();
        await app.init();
    } catch (error) {
        console.error('Error initializing app:', error);
        FooterManager.updateYear();
    }
});