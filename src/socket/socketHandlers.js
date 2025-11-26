const {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  setHost,
  updateScore,
  startRound,
  endRound,
} = require('../gameLogic/rooms');

function broadcastRoom(io, roomCode) {
  const room = getRoom(roomCode);
  if (room) {
    io.to(roomCode).emit('roomUpdate', room);
  }
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    let currentRoomCode = null;

    socket.on('createRoom', ({ nickname }) => {
      if (!nickname || nickname.trim() === '') {
        socket.emit('errorMessage', 'Escolha um nickname para criar a sala.');
        return;
      }
      const room = createRoom(socket.id, nickname.trim());
      currentRoomCode = room.code;
      socket.join(room.code);
      socket.emit('roomCreated', { roomCode: room.code });
      broadcastRoom(io, room.code);
    });

    socket.on('joinRoom', ({ roomCode, nickname }) => {
      const code = (roomCode || '').toUpperCase();
      if (!nickname || nickname.trim() === '') {
        socket.emit('errorMessage', 'Informe um nickname para entrar.');
        return;
      }
      const room = joinRoom(code, socket.id, nickname.trim());
      if (!room) {
        socket.emit('errorMessage', 'Sala não encontrada.');
        return;
      }
      currentRoomCode = code;
      socket.join(code);
      socket.emit('roomJoined', { roomCode: code, room });
      broadcastRoom(io, code);
    });

    socket.on('startRound', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) {
        socket.emit('errorMessage', 'Sala inexistente.');
        return;
      }
      const host = room.players.find((p) => p.isHost);
      if (!host || host.id !== socket.id) {
        socket.emit('errorMessage', 'Apenas o host pode iniciar a rodada.');
        return;
      }
      const updated = startRound(roomCode);
      if (!updated) return;

      io.to(roomCode).emit('roundStarted', { round: updated.round });
      broadcastRoom(io, roomCode);

      // Finaliza automaticamente ao estourar o tempo
      setTimeout(() => {
        const roomAfter = getRoom(roomCode);
        if (roomAfter && roomAfter.round.status === 'drawing') {
          endRound(roomCode);
          io.to(roomCode).emit('roundEnded', {
            round: roomAfter.round,
            players: roomAfter.players,
          });
          broadcastRoom(io, roomCode);
        }
      }, updated.round.timeLimit * 1000);
    });

    socket.on('finishRound', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room) return;
      const host = room.players.find((p) => p.isHost);
      if (!host || host.id !== socket.id) {
        socket.emit('errorMessage', 'Apenas o host pode finalizar a rodada.');
        return;
      }
      endRound(roomCode);
      io.to(roomCode).emit('roundEnded', { round: room.round, players: room.players });
      broadcastRoom(io, roomCode);
    });

    socket.on('playerHonestResult', ({ roomCode, respected }) => {
      const room = getRoom(roomCode);
      if (!room) return;
      if (room.round.status !== 'drawing' && room.round.status !== 'ended') {
        return;
      }
      // evita múltiplas respostas do mesmo jogador na mesma rodada
      if (!room.round.responses) room.round.responses = [];
      if (room.round.responses.includes(socket.id)) return;
      room.round.responses.push(socket.id);

      const delta = respected ? 3 : 1;
      updateScore(roomCode, socket.id, delta);
      broadcastRoom(io, roomCode);
    });

    socket.on('disconnect', () => {
      if (!currentRoomCode) return;
      const room = leaveRoom(currentRoomCode, socket.id);
      if (room) {
        const host = room.players.find((p) => p.isHost);
        if (host) {
          setHost(room.code, host.id);
        }
        broadcastRoom(io, room.code);
      }
    });
  });
}

module.exports = registerSocketHandlers;
