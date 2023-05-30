const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const twilio = require('twilio');
const path = require('path');
require('dotenv').config();
const app = express();
const server = http.createServer(app);
const io = socketIO(server).listen(server);
const port = '3000';
const authToken = process.env.TWILIO_AUTH_TOKEN
const accountSid = process.env.TWILIO_ACCOUNT_SID

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

const client = new twilio(accountSid, authToken);


// Configuración del servidor para recibir mensajes SMS
app.post('/sms', twilio.webhook({ validate: false, authToken: authToken }), (req, res) => {
  const twilioData = req.body;
  console.log(twilioData);
  // Emitir el mensaje al cliente a través del WebSocket
  io.emit('sms', twilioData);

  client.messages
    .create({
        body: 'Prueba',
        from: '+13156233324',
        to: '+543764740426'
    })
    .then(message => console.log(message.sid))
    .done();

  res.sendStatus(200);
});

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
