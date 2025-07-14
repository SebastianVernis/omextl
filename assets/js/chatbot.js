class ChatbotManager {
    constructor() {
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
            const initialContext = `Eres OMEX-IA, el asistente virtual experto de OMEX TL. Tu objetivo es ayudar a los usuarios con sus consultas sobre logística y transporte. Los datos del usuario son: Nombre: ${this.leadData.name}, Correo electrónico: ${this.leadData.email}, Número de teléfono: ${this.leadData.phone}.`;
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