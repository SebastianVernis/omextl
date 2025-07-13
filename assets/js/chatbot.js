// ======================================================================= 
// Script del Chatbot Optimizado para OMEX TL
// =======================================================================

class ChatbotManager {
    constructor() {
        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.closeBtn = document.getElementById('close-btn');
        this.chatHistory = [];
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadPrompt();
    }

    setupEventListeners() {
        // Botón de cerrar
        this.closeBtn?.addEventListener('click', () => {
            parent.postMessage('close-chatbot', '*');
        });

        // Botón de enviar
        this.sendBtn?.addEventListener('click', () => this.handleUserInput());

        // Enter en input
        this.userInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });

        // Auto-resize del textarea si se cambia a textarea
        this.userInput?.addEventListener('input', this.autoResize.bind(this));
    }

    autoResize(event) {
        const element = event.target;
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    }

    async loadPrompt() {
        try {
            const response = await fetch('prompt.txt');
            if (response.ok) {
                const promptText = await response.text();
                this.chatHistory.push({ 
                    role: "user", 
                    parts: [{ text: promptText }] 
                });
                this.chatHistory.push({ 
                    role: "model", 
                    parts: [{ text: "¡Entendido! Seré un asistente de IA útil y amigable." }] 
                });
            }
        } catch (error) {
            console.error('Error al cargar el prompt:', error);
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
            const response = await fetch('chatbot.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.statusText}`);
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
            console.error('Error al comunicarse con la API:', error);
            return 'Lo siento, no pude obtener una respuesta. Intenta de nuevo.';
        }
    }

    appendMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        
        // Sanitizar el mensaje para prevenir XSS
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
        
        // Mostrar mensaje del usuario
        this.appendMessage(message, 'user');
        this.userInput.value = '';
        
        // Mostrar indicador de escritura
        this.showTypingIndicator();

        try {
            // Obtener respuesta del bot
            const botResponse = await this.getBotResponse(message);
            
            // Remover indicador y mostrar respuesta
            this.removeTypingIndicator();
            this.appendMessage(botResponse, 'bot');
        } catch (error) {
            this.removeTypingIndicator();
            this.appendMessage('Error al procesar tu mensaje. Intenta de nuevo.', 'bot');
        } finally {
            this.isLoading = false;
            this.sendBtn.disabled = false;
            this.userInput.focus();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ChatbotManager();
});