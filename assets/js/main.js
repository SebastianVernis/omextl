/* ======================================================================= */
/* Script Principal para la Interactividad del Sitio OMEX TL               */
/* ======================================================================= */

document.addEventListener('DOMContentLoaded', function() {

    const initializeMobileMenu = () => {
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                mobileMenu.classList.toggle('hidden');
            });
        }
    };

    const initializeActiveNavLinks = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage) {
                if (!link.classList.contains('bg-secondary')) {
                    link.classList.add('active-link');
                }
            }
        });
    };

    const initializeFooterYear = () => {
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    };

    const loadComponent = async (id, url) => {
        const element = document.getElementById(id);
        if (element) {
            let fetchUrl = window.location.pathname.includes('/blog/') ? `../${url}` : url;
            try {
                const response = await fetch(fetchUrl);
                const data = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');
                const component = doc.querySelector(id === 'header-placeholder' ? 'header' : 'footer');
                if (component) {
                    element.outerHTML = component.outerHTML;
                    return true;
                }
            } catch (error) {
                console.error(`Error loading ${id}:`, error);
            }
        }
        return false;
    };

    const loadAllComponents = async () => {
        await Promise.all([
            loadComponent('header-placeholder', 'index.html'),
            loadComponent('footer-placeholder', 'index.html')
        ]);

        // Una vez cargados los componentes, inicializamos la funcionalidad
        initializeMobileMenu();
        initializeActiveNavLinks();
        initializeFooterYear();
    };

    // Si estamos en la página principal, no necesitamos cargar, solo inicializar
    if (document.querySelector('header') && !document.getElementById('header-placeholder')) {
        initializeMobileMenu();
        initializeActiveNavLinks();
        initializeFooterYear();
    } else {
        loadAllComponents();
    }

    // --- Lógica para Animaciones al Hacer Scroll (independiente de la carga de componentes) ---
    const scrollElements = document.querySelectorAll('.animate-on-scroll');

    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
        );
    };

    const displayScrollElement = (element) => {
        element.classList.add('is-visible');
    };

    const hideScrollElement = (element) => {
        element.classList.remove('is-visible');
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.25)) {
                displayScrollElement(el);
            } else {
                // Opcional: descomentar la siguiente línea si quieres que la animación se repita al salir y volver a entrar
                // hideScrollElement(el);
            }
        });
    };

    window.addEventListener('scroll', () => {
        handleScrollAnimation();
    });

    // Ejecutar una vez al cargar la página por si los elementos ya son visibles
    handleScrollAnimation();

});

