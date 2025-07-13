/* ======================================================================= */
/* Script Principal para la Interactividad del Sitio OMEX TL               */
/* ======================================================================= */

document.addEventListener('DOMContentLoaded', function() {
    
    // --- Lógica para Cargar Header y Footer ---
    const loadComponent = (id, url) => {
        const element = document.getElementById(id);
        if (element) {
            let fetchUrl;
            // Ajustar la ruta si estamos dentro del directorio /blog/
            if (window.location.pathname.includes('/blog/')) {
                fetchUrl = `../${url}`;
            } else {
                fetchUrl = url;
            }

            fetch(fetchUrl)
                .then(response => response.text())
                .then(data => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(data, 'text/html');
                    const component = doc.querySelector(id === 'header-placeholder' ? 'header' : 'footer');
                    if (component) {
                        element.outerHTML = component.outerHTML;
                    }
                })
                .then(() => {
                    // Volver a ejecutar las lógicas que dependen del contenido cargado
                    initializeDynamicContent();
                })
                .catch(error => console.error(`Error loading ${id}:`, error));
        }
    };

    loadComponent('header-placeholder', 'index.html');
    loadComponent('footer-placeholder', 'index.html');

    // --- Lógicas que dependen del contenido dinámico ---
    const initializeDynamicContent = () => {
        // --- Lógica para el Menú Móvil ---
        const mobileMenuButton = document.querySelector('.mobile-menu-button');
        const mobileMenu = document.querySelector('.mobile-menu');

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // --- Lógica para Resaltar el Enlace Activo en el Menú ---
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

        // --- Lógica para Actualizar el Año en el Footer ---
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    };

    // --- Lógica para Animaciones al Hacer Scroll ---
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

