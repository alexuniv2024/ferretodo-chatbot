// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const { SessionsClient } = require('@google-cloud/dialogflow');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos - IMPORTANTE para Vercel
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de Dialogflow
let sessionClient;
try {
    sessionClient = new SessionsClient();
    console.log('✅ Cliente de Dialogflow inicializado');
} catch (error) {
    console.error('❌ Error al inicializar Dialogflow:', error.message);
}

// Ruta principal - Sirve el HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para el chatbot
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'El mensaje es requerido'
            });
        }

        const sessionIdFinal = sessionId || uuidv4();
        const sessionPath = sessionClient.projectAgentSessionPath(
            process.env.DIALOGFLOW_PROJECT_ID,
            sessionIdFinal
        );

        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: message,
                    languageCode: 'es',
                },
            },
        };

        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;

        res.json({
            success: true,
            message: result.fulfillmentText || 'Lo siento, no entendí eso.',
            intent: result.intent?.displayName || 'unknown',
            sessionId: sessionIdFinal
        });

    } catch (error) {
        console.error('❌ Error en Dialogflow:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar tu mensaje'
        });
    }
});

// Endpoint de prueba
app.get('/api/test', (req, res) => {
    res.json({
        status: 'ok',
        projectId: process.env.DIALOGFLOW_PROJECT_ID,
        serverTime: new Date().toISOString()
    });
});

// IMPORTANTE: Para Vercel, exportamos la app en lugar de iniciar el servidor
module.exports = app;

// Solo para desarrollo local
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor local en http://localhost:${PORT}`);
    });
}