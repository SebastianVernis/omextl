/* ======================================================================= */
/* Script Principal para la Interactividad del Sitio OMEX TL               */
/* =======================================================================*/

document.addEventListener('DOMContentLoaded', function() {
    // 1. Obtener los elementos del DOM
    const chatBubble = document.getElementById('chat-bubble');
    const chatbotContainer = document.getElementById('chatbot-container');

    // Función para alternar la visibilidad del chatbot
    const toggleChatbot = () => {
        if (chatbotContainer) {
            chatbotContainer.classList.toggle('visible');
        }
    };

    // 2. Añadir el evento de clic a la burbuja para abrir/cerrar
    if (chatBubble) {
        chatBubble.addEventListener('click', toggleChatbot);
    }

    // 3. Escuchar mensajes desde el iframe para cerrar el chatbot
    window.addEventListener('message', (event) => {
        // Por seguridad, podrías verificar el origen del mensaje con:
        // if (event.origin !== 'https://tu-dominio.com') return;
        
        if (event.data === 'close-chatbot') {
            toggleChatbot();
        }
    });

    const closeBtn = document.getElementById('close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', toggleChatbot);
    }

    const chatWindow = document.getElementById('chat-window');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    let chatHistory = [];

    // Fallback prompt
    const defaultPrompt = "Eres OMEX-IA, el asistente virtual de OMEX TL. Ayuda a los usuarios con información sobre servicios de logística y transporte.";
    chatHistory.push({ role: "user", parts: [{ text: defaultPrompt }] });
    chatHistory.push({ role: "model", parts: [{ text: "¡Entendido! Seré un asistente de IA útil y amigable." }] });

    async function getBotResponse(message) {
        chatHistory.push({ role: "user", parts: [{ text: message }] });

        const apiKey = ""; // API Key gestionada por el servidor
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

        const payload = {
            contents: chatHistory,
            generationConfig: {
                temperature: 0.7,
                topP: 1,
                topK: 1,
                maxOutputTokens: 2048,
            },
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.statusText}`);
            }

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const botMessage = result.candidates[0].content.parts[0].text;
                chatHistory.push({ role: "model", parts: [{ text: botMessage }] });
                return botMessage;
            } else {
                throw new Error('Respuesta de API inválida');
            }
        } catch (error) {
            console.error('Error al comunicarse con la API de Gemini:', error);
            return 'Lo siento, no pude obtener una respuesta. Intenta de nuevo.';
        }
    }

    function appendMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        messageElement.textContent = message;
        if (chatWindow) {
            chatWindow.appendChild(messageElement);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    }

    async function handleUserInput() {
        const message = userInput.value.trim();
        if (!message) return;

        appendMessage(message, 'user');
        userInput.value = '';

        const botResponse = await getBotResponse(message);
        appendMessage(botResponse, 'bot');
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', handleUserInput);
    }

    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleUserInput();
            }
        });
    }

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
