// public/chatbot.js - VERSIÓN DE DIAGNÓSTICO
class ChatbotFerretodo {
    constructor() {
        console.log('🚀 Iniciando Chatbot...');
        this.sessionId = this.generateSessionId();
        this.isOpen = false;
        this.init();
    }

    generateSessionId() {
        return 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    init() {
        console.log('📦 Session ID:', this.sessionId);
        this.createChatbotUI();
        this.attachEventListeners();
        this.testConnection();
    }

    async testConnection() {
        console.log('🔍 Probando conexión con el servidor...');
        try {
            const baseUrl = window.location.origin;
            console.log('📍 Base URL:', baseUrl);
            
            // Probar endpoint test
            const testUrl = `${baseUrl}/api/test`;
            console.log('📤 Probando:', testUrl);
            
            const response = await fetch(testUrl);
            console.log('📥 Respuesta status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Conexión exitosa:', data);
            } else {
                console.error('❌ Error en test:', response.status);
            }
        } catch (error) {
            console.error('❌ Error de conexión:', error);
        }
    }

    createChatbotUI() {
        // ... (mantén el mismo CSS de antes) ...
        const styles = `...`; // Tu CSS existente

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);

        const chatbotHTML = `
            <div class="chatbot-container">
                <div class="chatbot-window" id="chatbotWindow">
                    <div class="chatbot-header">
                        <h3><i class="bi bi-tools me-2"></i>Asistente FERRETODO</h3>
                        <button onclick="window.chatbot.toggleChat()">×</button>
                    </div>
                    <div class="chatbot-messages" id="chatbotMessages">
                        <div class="message bot">
                            <div class="message-content">
                                ¡Hola! Soy el asistente virtual de FERRETODO. ¿En qué puedo ayudarte hoy?
                                <div class="quick-replies" id="quickReplies">
                                    <button class="quick-reply-btn" onclick="window.chatbot.sendQuickReply('¿Cuál es el horario?')">🕒 Horario</button>
                                    <button class="quick-reply-btn" onclick="window.chatbot.sendQuickReply('¿Qué productos?')">🔨 Productos</button>
                                    <button class="quick-reply-btn" onclick="window.chatbot.sendQuickReply('¿Dónde están?')">📍 Ubicación</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chatbot-input">
                        <input type="text" id="chatbotInput" placeholder="Escribe tu mensaje...">
                        <button id="sendButton"><i class="bi bi-send"></i></button>
                    </div>
                </div>
                <button class="chatbot-button" onclick="window.chatbot.toggleChat()" id="chatbotButton">
                    <i class="bi bi-chat-dots"></i>
                </button>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    attachEventListeners() {
        this.messagesContainer = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendButton = document.getElementById('sendButton');
        this.window = document.getElementById('chatbotWindow');
        this.button = document.getElementById('chatbotButton');

        if (this.sendButton) {
            this.sendButton.onclick = () => this.sendMessage();
        }
        if (this.input) {
            this.input.onkeypress = (e) => {
                if (e.key === 'Enter') this.sendMessage();
            };
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        if (this.window) {
            this.window.classList.toggle('open', this.isOpen);
            if (this.isOpen && this.input) this.input.focus();
        }
    }

    async sendMessage() {
        if (!this.input) return;
        
        const message = this.input.value.trim();
        if (!message) return;

        console.log('📝 Enviando mensaje:', message);

        // Deshabilitar input
        this.input.disabled = true;
        if (this.sendButton) this.sendButton.disabled = true;

        // Mostrar mensaje del usuario
        this.addMessage(message, 'user');
        this.input.value = '';

        // Mostrar typing indicator
        this.showTypingIndicator();

        try {
            const baseUrl = window.location.origin;
            const apiUrl = `${baseUrl}/api/chat`;
            
            console.log('📤 Fetch URL:', apiUrl);
            console.log('📤 Session ID:', this.sessionId);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });

            console.log('📥 Response status:', response.status);
            console.log('📥 Response headers:', [...response.headers.entries()]);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('📦 Data recibida:', data);

            this.hideTypingIndicator();

            if (data.success) {
                this.addMessage(data.message, 'bot');
            } else {
                this.addMessage('Lo siento, no entendí tu mensaje.', 'bot');
            }

        } catch (error) {
            console.error('❌ ERROR COMPLETO:', error);
            console.error('❌ Error name:', error.name);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);
            
            this.hideTypingIndicator();
            
            let errorMsg = 'Error de conexión. ';
            if (!navigator.onLine) {
                errorMsg += 'No hay internet.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMsg += 'No se pudo conectar al servidor.';
            } else {
                errorMsg += error.message;
            }
            
            this.addMessage(errorMsg, 'bot');
        } finally {
            // Habilitar input
            if (this.input) {
                this.input.disabled = false;
                this.input.focus();
            }
            if (this.sendButton) this.sendButton.disabled = false;
        }
    }

    sendQuickReply(message) {
        if (this.input) {
            this.input.value = message;
            this.sendMessage();
        }
    }

    addMessage(text, sender) {
        if (!this.messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;
        
        messageDiv.appendChild(contentDiv);
        this.messagesContainer.appendChild(messageDiv);
        
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        if (!this.messagesContainer) return;
        
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
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, iniciando chatbot...');
    window.chatbot = new ChatbotFerretodo();
});