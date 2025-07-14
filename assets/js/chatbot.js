class ChatbotManager {
    constructor {
        this.init(
        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.closeBtn = document.getElementById('close-btn');
        this.leadForm = document.getElementById('lead-form');
        this.chatInputArea = document.getElementById('chat-input-area');

        this.chatHistory = [];
        this.isLoading = false;
        this.leadData = {};

        
        this.init();
    }

constructor() {
     this.chatWindow = document.getElementById('chat-window');
     this.userInput = document.getElementById('user-input');
     this.sendBtn = document.getElementById('send-btn');
     this.closeBtn = document.getElementById('close-btn');
     this.leadForm = document.getElementById('lead-form');
     this.chatInputArea = document.getElementById('chat-input-area');
+    this.chatHistory = [];
+    this.leadData = {};
+    this.isLoading = false;
     
     this.init();
 }


    async init() {
        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.closeBtn = document.getElementById('close-btn');
        this.leadForm = document.getElementById('lead-form');
        this.chatInputArea = document.getElementById('chat-input-area');
    
        this.setupEventListeners();

        this.loadState();
    }

    saveState() {
        const state = {
            chatHistory: this.chatHistory,
            leadData: this.leadData,
            isChatActive: this.leadForm.style.display === 'none'
        };

        try {
            if (typeof(Storage) !== "undefined" && sessionStorage) {
                sessionStorage.setItem('chatbotState', JSON.stringify(state));
            }
        } catch (error) {
            console.warn('Failed to save chatbot state:', error);
        }
    }

    loadState() {
        const savedState = sessionStorage.getItem('chatbotState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                if (state && typeof state === 'object') {
                    this.chatHistory = Array.isArray(state.chatHistory) ? state.chatHistory : [];
                    this.leadData = (state.leadData && typeof state.leadData === 'object') ? state.leadData : {};
                } else {
                    this.chatHistory = [];
                    this.leadData = {};
                }

                if (state.isChatActive && this.leadForm && this.chatWindow && this.chatInputArea) {
                    this.leadForm.style.display = 'none';
                    this.chatWindow.style.display = 'flex';
                    this.chatInputArea.style.display = 'flex';
                    this.repopulateChat();
                }
            } catch (error) {
                console.warn('Failed to parse saved chatbot state:', error);
                this.chatHistory = [];
                this.leadData = {};
              
        sessionStorage.setItem('chatbotState', JSON.stringify(state));
    }

    loadState() {
        const savedState = sessionStorage.getItem('chatbotState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.chatHistory = state.chatHistory || [];
            this.leadData = state.leadData || {};

            if (state.isChatActive) {
                this.leadForm.style.display = 'none';
                this.chatWindow.style.display = 'flex';
                this.chatInputArea.style.display = 'flex';
                this.repopulateChat();

            }
        } else {
            this.chatHistory = [];
            this.leadData = {};
        }
    }

    repopulateChat() {
        this.chatHistory.forEach(item => {

            if (item.role === 'user' && item.parts?.[0]?.text) {
                this.appendMessage(item.parts[0].text, 'user');
            } else if (item.role === 'model' && item.parts?.[0]?.text) {

            if (item.role === 'user') {
                this.appendMessage(item.parts[0].text, 'user');
            } else if (item.role === 'model') {

                this.appendMessage(item.parts[0].text, 'bot');
            }
        });

    }

    setupEventListeners() {
        this.closeBtn?.addEventListener('click', () => {
            parent.postMessage('close-chatbot', '*');
        });

        this.sendBtn?.addEventListener('click', () => this.handleUserInput());

        this.userInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        this.userInput?.addEventListener('input', this.autoResize.bind(this));

        this.leadForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
    }

    autoResize(event) {
        const element = event.target;
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    }

    async handleFormSubmission() {
        const nameInput = document.getElementById('name-input');
        const emailInput = document.getElementById('email-input');
        const phoneInput = document.getElementById('phone-input');

        this.leadData.name = nameInput.value.trim();
        this.leadData.email = emailInput.value.trim();
        this.leadData.phone = phoneInput.value.trim();

        if (this.leadData.name && this.leadData.email && this.leadData.phone) {
            this.leadForm.style.display = 'none';
            this.chatWindow.style.display = 'flex';
            this.chatInputArea.style.display = 'flex';
            await this.startChat();

            this.saveState();
        }
    }

    async startChat() {
        await this.loadInitialContext();
        this.appendMessage('¡Hola! ¿Cómo puedo ayudarte hoy?', 'bot');
    }

    async loadInitialContext() {
        try {
            const initialContext = `Eres OMEX-IA, el asistente virtual experto de OMEX TL. Tu objetivo es ayudar a los usuarios con sus consultas sobre logística y transporte. Los datos del usuario son: Nombre: ${this.leadData.name}, Correo electrónico: ${this.leadData.email}, Número de teléfono: ${this.leadData.phone}.`
        await this.loadPrompt();
        this.appendMessage('¡Hola! ¿Cómo puedo ayudarte hoy?', 'bot');
    }

    async loadPrompt() {
        try {
            const promptText = `"1. Identidad y Personalidad: Eres OMEX-IA, el asistente virtual experto de OMEX TL, una empresa de logística y transporte en México. Tu personalidad es profesional, eficiente y confiable. Tu objetivo principal es ayudar a los visitantes del sitio web a entender los servicios de la empresa, facilitar el contacto y responder preguntas frecuentes. Directrices Fundamentales de Comunicación: Idioma: Te comunicas exclusivamente en español de México. Tono de Voz: Mantén siempre un tono servicial, claro y conciso. Eres un experto que inspira confianza. Eslogan Oficial: Tu lema principal es 'Tu carga segura, nuestro compromiso total.'Estrategia sobre Aliados: Nunca reveles los nombres de los socios o aliados logísticos. En su lugar, refiérete a ellos de forma general como 'nuestra red de aliados estratégicos de confianza' o 'nuestra robusta red logística'. OMEX TL es siempre el único proveedor y punto de contacto para el cliente. Base de Conocimiento (Knowledge Base) Información de la Empresa:Misión: Brindar soluciones logísticas confiables, seguras y adaptadas a las necesidades de cada cliente, impulsando operaciones ágiles y efectivas a través de procesos bien estructurados, tecnología de vanguardia y un equipo comprometido con la excelencia en el servicio. Visión: Consolidarnos como una empresa referente en logística a nivel nacional, reconocida por su capacidad de respuesta, su enfoque en la mejora continua y su firme compromiso con la calidad, la seguridad y la satisfacción total del cliente en cada etapa del proceso. Portafolio de Servicios: Transporte FTL (Full Truckload) y LTL (Less Than Truckload): Ofrecemos soluciones de carga completa y consolidada en caja seca. FTL garantiza exclusividad y rapidez, mientras que LTL permite compartir espacio para reducir costos. Transporte de Carga Refrigerada: Contamos con unidades con control de temperatura para garantizar la cadena de frío de productos perecederos y sensibles. Transporte en Camionetas: Disponemos de unidades dedicadas desde 1.5 hasta 3.5 toneladas, ideales para entregas directas, última milla y servicios flexibles. Custodia de Mercancías: Brindamos servicio a nivel nacional, con opciones de custodia armada o sencilla para proteger cargas de alto valor. Seguros de Mercancía: Gestionamos pólizas con cobertura amplia para unidades, así como para la carga y descarga, protegiendo su inversión. Maniobras Especializadas: Realizamos el servicio de carga y descarga, incluyendo el uso de maquinaria pesada. (Nota: Este servicio está sujeto a disponibilidad y requiere solicitud previa). Logística de Aduanas: Gestionamos el ingreso de mercancía en los principales puertos marítimos del país: Veracruz, Manzanillo y Lázaro Cárdenas. Monitoreo GPS 24/7: Todas nuestras unidades cuentan con seguimiento en tiempo real y funciones de seguridad avanzadas como paro de motor. Flotilla: Urvan / Van Mediana: 5 unidades. Uso: Paquetería de mayor volumen, rutas urbanas. Tornado Van: 1 unidad. Uso: Última milla, recolecciones, paquetería estándar. Attitude / Sedán: 1 unidad. Uso: Mensajería, paquetería pequeña, documentos. Lobo / Pickup: 1 unidad. Uso: Carga pesada, materiales voluminosos. Información de Contacto: Email: contacto@omextl.com Teléfono / WhatsApp: 56 3594 2337 Dirección: Av. Homero 229, Piso 1, Int. 104-A, Polanco V Secc, Miguel Hidalgo, CDMX, 11560. Sitio Web: www.omextl.com Redes Sociales: LinkedIn: https://www.linkedin.com/company/omex-tl/ YouTube: https://www.youtube.com/channel/UC3B2QJgrN48fNgPC4e0e_-Q Instagram: https://www.instagram.com/o.mextl/ Flujos de Conversación (Ejemplos de Comportamiento) Si el usuario quiere cotizar: Responde con entusiasmo: '¡Claro que sí! Con gusto te ayudo. Para darte la cotización más precisa, te invito a contactarnos directamente por correo a contacto@omextl.com o a través de nuestro WhatsApp 56 3594 2337, donde un especialista te atenderá de inmediato.' Si el usuario pide ayuda o tiene una queja: Responde con empatía: 'Entiendo. Lamento que estés experimentando un problema. Para darte la mejor atención, por favor contáctanos por teléfono o WhatsApp al 56 3594 2337 y un miembro de nuestro equipo te ayudará a resolverlo.' Si el usuario pregunta por un servicio específico: Proporciona la descripción del servicio basada en el portafolio de esta Gema de Marca. Finaliza siempre con una invitación a contactar para más detalles: 'Si te gustaría una cotización o más información, no dudes en escribirnos a contacto@omextl.com.'Al finalizar cualquier interacción exitosa: Agradece al usuario y cierra con el eslogan: 'Fue un placer ayudarte. En OMEX TL, tu carga segura es nuestro compromiso total. ¡Que tengas un excelente día!' Procuraras siempre ser breve sin omitir informacion, siempre utilizaras emojis para complementar de manera visual tus respuestas recuerda que tú formato es solo de texto, por lo que evitarás colocar hipervínculos o negritas, trabajaras sobre texto simple y emojis."`;

            this.chatHistory.push({
                role: "user",
                parts: [{ text: initialContext }]
            });
            this.chatHistory.push({
                role: "model",
                parts: [{ text: "¡Entendido! Seré un asistente de IA útil y amigable." }]
            });
        } catch (error) {
            console.error(error);
            this.appendMessage('Error de configuración: No se pudo cargar el prompt inicial. Por favor, contacta al administrador.', 'bot');
            this.sendBtn.disabled = true;
            this.userInput.disabled = true;
        }
    }

    async getBotResponse(message) {
        this.chatHistory.push({ 
            role: "user", 
            parts: [{ text: message }] 
        });

        const payload = {
            history: this.chatHistory,
        };

        try {
            const response = await fetch('./chatbot.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                const errorMessage = errorData?.error || `Error en la API: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            const botMessage = result.candidates?.[0]?.content?.parts?.[0]?.text || 
                             'Lo siento, no pude procesar tu mensaje.';
            
            this.chatHistory.push({ 
                role: "model", 
                parts: [{ text: botMessage }] 
            });
            
            return botMessage;
        } catch (error) {
            console.error('Error al comunicarse con la API:', error.message);
            return `Lo siento, ocurrió un error: ${error.message}. Por favor, intenta de nuevo.`;
        }
    }

    appendMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        messageElement.textContent = message;
        this.chatWindow.appendChild(messageElement);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.chatWindow.scrollTop = this.chatWindow.scrollHeight;
    }

    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.classList.add('message', 'bot-message', 'typing-indicator');
        typingElement.innerHTML = '<span>Escribiendo...</span>';
        typingElement.id = 'typing-indicator';
        this.chatWindow.appendChild(typingElement);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    async handleUserInput() {
        const message = this.userInput.value.trim();
        if (!message || this.isLoading) return;

        this.isLoading = true;
        this.sendBtn.disabled = true;
        
        this.appendMessage(message, 'user');
        this.userInput.value = '';

        this.showTypingIndicator();
        try {
            const botResponse = await this.getBotResponse(message);
            this.removeTypingIndicator();
            this.appendMessage(botResponse, 'bot');
        } catch (error) {
            this.removeTypingIndicator();
            this.appendMessage('Error al procesar tu mensaje. Intenta de nuevo.', 'bot');
        }

        this.isLoading = false;
        this.sendBtn.disabled = false;
        this.userInput.focus();
        this.saveState();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatbotManager();
});