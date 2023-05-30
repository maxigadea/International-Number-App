const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const twilio = require('twilio');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3000;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN

// Middleware para analizar el cuerpo de las solicitudes
app.use(express.json());

// Ruta para servir el archivo HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Configuración del servidor WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Escuchar eventos del cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Configuración del servidor para recibir mensajes SMS
app.post('/sms', twilio.webhook({ validate: true, authToken: TWILIO_AUTH_TOKEN }), (req, res) => {
  const twilioData = req.body;
  console.log(twilioData);
  // Emitir el mensaje al cliente a través del WebSocket
  io.emit('sms', twilioData);

  res.sendStatus(200);
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
