const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const registerSocketHandlers = require('./src/socket/socketHandlers');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

app.use(express.static(PUBLIC_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

app.get('/room/:roomCode', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'room.html'));
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Servidor ouvindo na porta ${PORT}`);
});
