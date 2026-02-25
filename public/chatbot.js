// public/chatbot.js
class ChatbotFerretodo {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.isOpen = false;
        this.init();
    }

    generateSessionId() {
        return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        this.createChatbotUI();
        this.attachEventListeners();
    }

    createChatbotUI() {
        // Estilos del chatbot
        const styles = `
            .chatbot-container {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: 'Inter', sans-serif;
            }

            .chatbot-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #2e7d32, #1976d2);
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .chatbot-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0,0,0,0.4);
            }

            .chatbot-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 30px rgba(0,0,0,0.2);
                display: none;
                flex-direction: column;
                overflow: hidden;
            }

            .chatbot-window.open {
                display: flex;
            }

            .chatbot-header {
                background: linear-gradient(135deg, #2e7d32, #1976d2);
                color: white;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chatbot-header h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
            }

            .chatbot-header button {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
            }

            .chatbot-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: #f5f5f5;
            }

            .message {
                margin-bottom: 15px;
                display: flex;
                flex-direction: column;
            }

            .message.user {
                align-items: flex-end;
            }

            .message.bot {
                align-items: flex-start;
            }

            .message-content {
                max-width: 80%;
                padding: 10px 15px;
                border-radius: 15px;
                font-size: 14px;
                line-height: 1.4;
            }

            .message.user .message-content {
                background: linear-gradient(135deg, #2e7d32, #1976d2);
                color: white;
                border-bottom-right-radius: 5px;
            }

            .message.bot .message-content {
                background: white;
                color: #333;
                border-bottom-left-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }

            .chatbot-input {
                padding: 20px;
                background: white;
                border-top: 1px solid #eee;
                display: flex;
                gap: 10px;
            }

            .chatbot-input input {
                flex: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 25px;
                font-size: 14px;
                outline: none;
            }

            .chatbot-input input:focus {
                border-color: #2e7d32;
            }

            .chatbot-input button {
                background: linear-gradient(135deg, #2e7d32, #1976d2);
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
            }

            .chatbot-input button:hover {
                transform: scale(1.1);
            }

            .chatbot-input button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .typing-indicator {
                display: flex;
                gap: 5px;
                padding: 10px 15px;
                background: white;
                border-radius: 15px;
                border-bottom-left-radius: 5px;
                width: fit-content;
            }

            .typing-indicator span {
                width: 8px;
                height: 8px;
                background: #999;
                border-radius: 50%;
                animation: typing 1s infinite ease-in-out;
            }

            .typing-indicator span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-indicator span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }

            .quick-replies {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }

            .quick-reply-btn {
                background: white;
                border: 1px solid #2e7d32;
                color: #2e7d32;
                padding: 8px 15px;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s;
            }

            .quick-reply-btn:hover {
                background: #2e7d32;
                color: white;
            }
        `;

        // Añadir estilos
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        // Crear HTML del chatbot
        const chatbotHTML = `
            <div class="chatbot-container">
                <div class="chatbot-window" id="chatbotWindow">
                    <div class="chatbot-header">
                        <h3><i class="bi bi-tools me-2"></i>Asistente FERRETODO</h3>
                        <button onclick="chatbot.toggleChat()">×</button>
                    </div>
                    <div class="chatbot-messages" id="chatbotMessages">
                        <div class="message bot">
                            <div class="message-content">
                                ¡Hola! Soy el asistente virtual de FERRETODO. ¿En qué puedo ayudarte hoy?
                                <div class="quick-replies" id="quickReplies">
                                    <button class="quick-reply-btn" onclick="chatbot.sendQuickReply('¿Cuál es el horario de atención?')">🕒 Horario</button>
                                    <button class="quick-reply-btn" onclick="chatbot.sendQuickReply('¿Qué productos tienen?')">🔨 Productos</button>
                                    <button class="quick-reply-btn" onclick="chatbot.sendQuickReply('¿Dónde están ubicados?')">📍 Ubicación</button>
                                    <button class="quick-reply-btn" onclick="chatbot.sendQuickReply('Hablar con un asesor')">👤 Asesor</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chatbot-input">
                        <input type="text" id="chatbotInput" placeholder="Escribe tu mensaje..." onkeypress="if(event.key==='Enter') chatbot.sendMessage()">
                        <button id="sendButton" onclick="chatbot.sendMessage()">
                            <i class="bi bi-send"></i>
                        </button>
                    </div>
                </div>
                <button class="chatbot-button" onclick="chatbot.toggleChat()" id="chatbotButton">
                    <i class="bi bi-chat-dots"></i>
                </button>
            </div>
        `;

        // Añadir al final del body
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    attachEventListeners() {
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendButton = document.getElementById('sendButton');
        this.window = document.getElementById('chatbotWindow');
        this.button = document.getElementById('chatbotButton');
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.window.classList.toggle('open', this.isOpen);
        
        if (this.isOpen) {
            this.input.focus();
        }
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        // Deshabilitar input mientras se envía
        this.input.disabled = true;
        this.sendButton.disabled = true;

        // Mostrar mensaje del usuario
        this.addMessage(message, 'user');
        this.input.value = '';

        // Mostrar indicador de escritura
        this.showTypingIndicator();

        try {
            // Enviar al servidor
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });

            const data = await response.json();

            // Quitar indicador de escritura
            this.hideTypingIndicator();

            if (data.success) {
                this.addMessage(data.message, 'bot');
                
                // Si hay respuestas rápidas sugeridas por Dialogflow, mostrarlas
                if (data.allData && data.allData.fulfillmentMessages) {
                    this.showQuickReplies(data.allData.fulfillmentMessages);
                }
            } else {
                this.addMessage('Lo siento, tuve un problema. ¿Puedes intentar de nuevo?', 'bot');
            }

        } catch (error) {
            console.error('Error:', error);
            this.hideTypingIndicator();
            this.addMessage('Error de conexión. Por favor intenta de nuevo.', 'bot');
        }

        // Habilitar input
        this.input.disabled = false;
        this.sendButton.disabled = false;
        this.input.focus();
    }

    sendQuickReply(message) {
        this.input.value = message;
        this.sendMessage();
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(messageDiv);
        
        // Scroll al último mensaje
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        this.typingIndicator = document.createElement('div');
        this.typingIndicator.className = 'message bot';
        this.typingIndicator.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        this.messagesContainer.appendChild(this.typingIndicator);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.remove();
        }
    }

    showQuickReplies(messages) {
        // Aquí puedes procesar si Dialogflow envía sugerencias de respuestas rápidas
        // Por ahora, mantenemos las respuestas rápidas estáticas
    }
}

// Inicializar chatbot cuando la página cargue
document.addEventListener('DOMContentLoaded', () => {
    window.chatbot = new ChatbotFerretodo();
});