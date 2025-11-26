const { generateRules } = require('./rules');

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const length = Math.floor(Math.random() * 3) + 4; // 4-6
  let code = '';
  do {
    code = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function createRoom(hostId, nickname) {
  const code = generateRoomCode();
  const player = {
    id: hostId,
    nickname,
    score: 0,
    isHost: true,
  };
  const room = {
    code,
    players: [player],
    round: {
      roundNumber: 0,
      mustDraw: '',
      forbiddenRules: [],
      timeLimit: 0,
      startTime: null,
      status: 'waiting',
      responses: [],
    },
  };
  rooms.set(code, room);
  return room;
}

function getRoom(code) {
  return rooms.get(code);
}

function joinRoom(code, socketId, nickname) {
  const room = rooms.get(code);
  if (!room) return null;
  const exists = room.players.find((p) => p.id === socketId);
  if (exists) return room;
  room.players.push({ id: socketId, nickname, score: 0, isHost: false });
  return room;
}

function leaveRoom(code, socketId) {
  const room = rooms.get(code);
  if (!room) return null;
  room.players = room.players.filter((p) => p.id !== socketId);

  if (room.players.length === 0) {
    rooms.delete(code);
    return null;
  }

  const hasHost = room.players.some((p) => p.isHost);
  if (!hasHost && room.players.length > 0) {
    room.players[0].isHost = true;
  }
  return room;
}

function setHost(code, socketId) {
  const room = rooms.get(code);
  if (!room) return null;
  room.players.forEach((p) => {
    p.isHost = p.id === socketId;
  });
  return room;
}

function updateScore(code, socketId, delta) {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players.find((p) => p.id === socketId);
  if (player) {
    player.score += delta;
  }
  return room;
}

function startRound(code) {
  const room = rooms.get(code);
  if (!room) return null;
  const { mustDraw, forbiddenRules, timeLimit } = generateRules();
  room.round = {
    roundNumber: room.round.roundNumber + 1,
    mustDraw,
    forbiddenRules,
    timeLimit,
    startTime: Date.now(),
    status: 'drawing',
    responses: [],
  };
  return room;
}

function endRound(code) {
  const room = rooms.get(code);
  if (!room) return null;
  room.round.status = 'ended';
  return room;
}

module.exports = {
  createRoom,
  getRoom,
  joinRoom,
  leaveRoom,
  setHost,
  updateScore,
  startRound,
  endRound,
};
