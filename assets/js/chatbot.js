// La lógica del chatbot (las respuestas y el envío de mensajes) se mantiene igual.
// Ahora, la comunicación para cerrar se manejará desde el script principal.
// Validate DOM elements exist
const closeBtn = document.getElementById('close-btn');
const userInput = document.getElementById('user-input');
const chatWindow = document.getElementById('chat-window');
const sendBtn = document.getElementById('send-btn');

if (!closeBtn || !userInput || !chatWindow || !sendBtn) {
    console.error('Required DOM elements not found');
    return;
}

// Cuando se hace clic en el botón de cerrar, enviamos un mensaje a la página padre.
closeBtn.addEventListener('click', () => {
    // "parent" se refiere a la ventana que contiene el iframe (index.html)
    // "postMessage" es la forma segura de comunicar iframes con su página contenedora.
    parent.postMessage('close-chatbot', '*');
});

// Historial de la conversación
let chatHistory = [];
sendBtn.disabled = true;

// Cargar prompt inicial desde un archivo externo
fetch('prompt.txt')
    .then(response => response.text())
    .then(promptText => {
        chatHistory.push({ role: "user", parts: [{ text: promptText }] });
        chatHistory.push({ role: "model", parts: [{ text: "¡Entendido! Seré un asistente de IA útil y amigable." }] });
        sendBtn.disabled = false;
    })
    .catch(error => {
        console.error('Error al cargar el prompt:', error)
        sendBtn.disabled = false;
    });

async function getBotResponse(message) {
    chatHistory.push({ role: "user", parts: [{ text: message }] });

    const apiUrl = 'chatbot.php';

    const payload = {
        history: chatHistory,
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
        
        // Validate API response structure
        if (!result.candidates || !result.candidates[0] || 
            !result.candidates[0].content || !result.candidates[0].content.parts ||
            !result.candidates[0].content.parts[0] || !result.candidates[0].content.parts[0].text) {
            throw new Error('Invalid API response structure');
        }
        
        const botMessage = result.candidates[0].content.parts[0].text;
        chatHistory.push({ role: "model", parts: [{ text: botMessage }] });
        return botMessage;
    } catch (error) {
        console.error('Error al comunicarse con la API de Gemini:', error);
        return 'Lo siento, no pude obtener una respuesta. Intenta de nuevo.';
    }
}

function appendMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function handleUserInput() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    userInput.value = '';

    const botResponse = await getBotResponse(message);
    appendMessage(botResponse, 'bot');
}

sendBtn.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});
