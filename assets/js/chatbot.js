class ChatbotManager {
    constructor() {
        this.chatWindow = document.getElementById('chat-window');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.closeBtn = document.getElementById('close-btn');
        this.chatHistory = [];
        this.isLoading = false;
        this.leadCollectionState = 'idle'; // idle, askingName, askingEmail, askingService, askingPhone, completed
        this.leadData = {};
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadPrompt();
        this.startLeadCollection();
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
    }

    autoResize(event) {
        const element = event.target;
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    }

    async loadPrompt() {
        try {
            const response = await fetch('prompt.txt');
            if (!response.ok) {
                throw new Error(`Error al cargar el prompt: ${response.statusText}`);
            }
            const promptText = await response.text();
            this.chatHistory.push({
                role: "user",
                parts: [{ text: promptText }]
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
            const response = await fetch('chatbot.php', {
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

    startLeadCollection() {
        this.leadCollectionState = 'askingName';
        this.appendMessage('Para comenzar, ¿podrías proporcionarme tu nombre completo?', 'bot');
    }

    async handleUserInput() {
        const message = this.userInput.value.trim();
        if (!message || this.isLoading) return;

        this.isLoading = true;
        this.sendBtn.disabled = true;
        
        this.appendMessage(message, 'user');
        this.userInput.value = '';

        if (this.leadCollectionState !== 'completed') {
            await this.handleLeadCollection(message);
        } else {
            this.showTypingIndicator();
            try {
                const botResponse = await this.getBotResponse(message);
                this.removeTypingIndicator();
                this.appendMessage(botResponse, 'bot');
            } catch (error) {
                this.removeTypingIndicator();
                this.appendMessage('Error al procesar tu mensaje. Intenta de nuevo.', 'bot');
            }
        }

        this.isLoading = false;
        this.sendBtn.disabled = false;
        this.userInput.focus();
    }

    async handleLeadCollection(message) {
        // A simple check to see if the user is asking a question instead of providing info.
        if (message.includes('?') || message.toLowerCase().includes('que') || message.toLowerCase().includes('cual')) {
            this.appendMessage('Entiendo que tienes una pregunta. Para poder ayudarte mejor, por favor, primero completemos tus datos.', 'bot');
            // Re-ask the current question
            this.reAskCurrentLeadQuestion();
            return;
        }

        switch (this.leadCollectionState) {
            case 'askingName':
                this.leadData.name = message;
                this.leadCollectionState = 'askingEmail';
                this.appendMessage(`Gracias, ${this.leadData.name}. Ahora, ¿cuál es tu correo electrónico?`, 'bot');
                break;
            case 'askingEmail':
                if (!this.isValidEmail(message)) {
                    this.appendMessage('Por favor, introduce un correo electrónico válido.', 'bot');
                    return;
                }
                this.leadData.email = message;
                this.leadCollectionState = 'askingService';
                this.appendMessage('Perfecto. ¿En qué servicio estás interesado?', 'bot');
                break;
            case 'askingService':
                this.leadData.service = message;
                this.leadCollectionState = 'askingPhone';
                this.appendMessage('Gracias. Por último, ¿podrías darme tu número de teléfono?', 'bot');
                break;
            case 'askingPhone':
                this.leadData.phone = message;
                this.leadCollectionState = 'completed';
                this.appendMessage('¡Excelente! Ahora que tengo tus datos de contacto, ¿cómo puedo ayudarte?', 'bot');

                // Send lead data to server
                try {
                    await this.sendLeadData();
                } catch (error) {
                    console.error('Error saving lead data:', error);
                }
                break;
        }
    }

    reAskCurrentLeadQuestion() {
        switch (this.leadCollectionState) {
            case 'askingName':
                this.appendMessage('¿Cuál es tu nombre completo?', 'bot');
                break;
            case 'askingEmail':
                this.appendMessage('¿Me podrías proporcionar tu correo electrónico?', 'bot');
                break;
            case 'askingService':
                this.appendMessage('¿En qué servicio de OMEXTL estás interesado?', 'bot');
                break;
            case 'askingPhone':
                this.appendMessage('Para continuar, por favor, facilítame tu número de teléfono.', 'bot');
                break;
        }
    }

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChatbotManager();
});