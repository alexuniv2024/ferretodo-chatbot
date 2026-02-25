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
app.use(express.static(path.join(__dirname, 'public')));

// ===== CONFIGURACIÓN DE DIALOGFLOW =====
let sessionClient;

try {
    // Verificar si estamos en Vercel (con credenciales en variable de entorno)
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
        console.log('🔑 Usando credenciales de variable de entorno Vercel');
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
        sessionClient = new SessionsClient({ credentials });
    } 
    // Verificar si tenemos archivo local (desarrollo)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log('🔑 Usando credenciales de archivo local');
        sessionClient = new SessionsClient();
    }
    else {
        console.log('🔑 Usando credenciales por defecto');
        sessionClient = new SessionsClient();
    }
    console.log('✅ Cliente de Dialogflow inicializado correctamente');
    console.log('📊 Project ID:', process.env.DIALOGFLOW_PROJECT_ID);
} catch (error) {
    console.error('❌ Error al inicializar Dialogflow:', error.message);
    sessionClient = null;
}
// ===== FIN CONFIGURACIÓN =====

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint de diagnóstico
app.get('/api/diagnostico', (req, res) => {
    const diagnostic = {
        status: 'ok',
        projectId: process.env.DIALOGFLOW_PROJECT_ID,
        hasCredentialsJson: !!process.env.GOOGLE_CREDENTIALS_JSON,
        credentialsLength: process.env.GOOGLE_CREDENTIALS_JSON?.length || 0,
        environment: process.env.VERCEL ? 'vercel' : 'local',
        sessionClientReady: !!sessionClient,
        timestamp: new Date().toISOString()
    };
    
    // Intentar parsear el JSON para verificar
    if (process.env.GOOGLE_CREDENTIALS_JSON) {
        try {
            const creds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
            diagnostic.jsonValid = true;
            diagnostic.clientEmail = creds.client_email;
            diagnostic.projectIdFromJson = creds.project_id;
        } catch (e) {
            diagnostic.jsonValid = false;
            diagnostic.jsonError = e.message;
        }
    }
    
    res.json(diagnostic);
});

// Endpoint de prueba simple
app.get('/api/test', (req, res) => {
    res.json({
        status: 'ok',
        message: 'API funcionando correctamente',
        projectId: process.env.DIALOGFLOW_PROJECT_ID,
        time: new Date().toISOString()
    });
});

// Endpoint para el chatbot
app.post('/api/chat', async (req, res) => {
    console.log('📨 Petición recibida en /api/chat');
    
    try {
        const { message, sessionId } = req.body;
        console.log('📝 Mensaje:', message);
        
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'El mensaje es requerido'
            });
        }

        if (!sessionClient) {
            console.error('❌ sessionClient no está inicializado');
            return res.status(500).json({
                success: false,
                message: 'Error de configuración del chatbot'
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

        console.log('📤 Enviando a Dialogflow...');
        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        
        console.log('📥 Respuesta:', result.fulfillmentText);

        res.json({
            success: true,
            message: result.fulfillmentText || 'Lo siento, no entendí eso.',
            intent: result.intent?.displayName || 'unknown',
            sessionId: sessionIdFinal
        });

    } catch (error) {
        console.error('❌ Error:', error);
        
        let errorMessage = 'Error al procesar tu mensaje';
        if (error.code === 7) errorMessage = 'Error de permisos';
        else if (error.code === 5) errorMessage = 'Proyecto no encontrado';
        else if (error.code === 16) errorMessage = 'Error de autenticación';
        
        res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
});

// Iniciar servidor solo si no estamos en Vercel
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor local en http://localhost:${PORT}`);
        console.log(`📝 Test: http://localhost:${PORT}/api/test`);
    });
}

// Exportar para Vercel
module.exports = app;