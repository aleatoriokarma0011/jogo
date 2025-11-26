const params = window.location.pathname.split('/');
const roomCode = params[params.length - 1].toUpperCase();

const playersList = document.getElementById('playersList');
const mustDrawSpan = document.getElementById('mustDraw');
const forbiddenList = document.getElementById('forbiddenList');
const roundStatusSpan = document.getElementById('roundStatus');
const roomCodeDisplay = document.getElementById('roomCodeDisplay');
const timerEl = document.getElementById('timer');
const summaryText = document.getElementById('summaryText');
const roundSummary = document.getElementById('roundSummary');
const roundInfo = document.getElementById('roundInfo');
const startRoundBtn = document.getElementById('startRoundBtn');
const finishRoundBtn = document.getElementById('finishRoundBtn');
const nextRoundBtn = document.getElementById('nextRoundBtn');

let currentRoom = null;
let timerInterval = null;

function startTimer(round) {
  clearInterval(timerInterval);
  const end = round.startTime + round.timeLimit * 1000;
  timerInterval = setInterval(() => {
    const remaining = Math.max(0, Math.floor((end - Date.now()) / 1000));
    timerEl.textContent = `${remaining}s`;
    timerEl.classList.toggle('warning', remaining <= 10);
    if (remaining <= 0) {
      clearInterval(timerInterval);
    }
  }, 1000);
}

function renderPlayers(room) {
  playersList.innerHTML = '';
  room.players.forEach((p) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${p.nickname}</strong> - ${p.score} pts ${p.isHost ? '⭐' : ''}`;
    playersList.appendChild(li);
  });
}

function renderRound(room) {
  mustDrawSpan.textContent = room.round.mustDraw || 'Aguardando...';
  roundStatusSpan.textContent = room.round.status;
  forbiddenList.innerHTML = '';
  (room.round.forbiddenRules || []).forEach((rule) => {
    const li = document.createElement('li');
    li.textContent = rule;
    forbiddenList.appendChild(li);
  });

  if (room.round.status === 'drawing') {
    roundInfo.classList.remove('hidden');
    roundSummary.classList.add('hidden');
    startTimer(room.round);
  }
  if (room.round.status === 'ended') {
    timerEl.textContent = '--';
    summaryText.textContent = `Rodada ${room.round.roundNumber} finalizada! Pontue honestamente.`;
    roundSummary.classList.remove('hidden');
  }
}

function updateHostControls(room) {
  const me = room.players.find((p) => p.id === window.socket.id);
  const isHost = me?.isHost;
  startRoundBtn.disabled = !isHost;
  finishRoundBtn.disabled = !isHost;
  nextRoundBtn.disabled = !isHost;
}

function handleRoomUpdate(room) {
  currentRoom = room;
  roomCodeDisplay.textContent = `Sala ${room.code}`;
  renderPlayers(room);
  renderRound(room);
  updateHostControls(room);
}

function emitHonesty(respected) {
  if (!currentRoom) return;
  window.sendEvent('playerHonestResult', { roomCode: currentRoom.code, respected });
}

startRoundBtn.addEventListener('click', () => {
  if (!currentRoom) return;
  window.sendEvent('startRound', { roomCode: currentRoom.code });
});

finishRoundBtn.addEventListener('click', () => {
  if (!currentRoom) return;
  window.sendEvent('finishRound', { roomCode: currentRoom.code });
});

nextRoundBtn.addEventListener('click', () => {
  if (!currentRoom) return;
  window.sendEvent('startRound', { roomCode: currentRoom.code });
  roundSummary.classList.add('hidden');
});

document.getElementById('respectedBtn').addEventListener('click', () => emitHonesty(true));
document.getElementById('brokeBtn').addEventListener('click', () => emitHonesty(false));

window.socket.on('roomUpdate', handleRoomUpdate);

window.socket.on('roundStarted', ({ round }) => {
  roundSummary.classList.add('hidden');
  roundInfo.classList.remove('hidden');
  roundStatusSpan.textContent = round.status;
  mustDrawSpan.textContent = round.mustDraw;
  forbiddenList.innerHTML = '';
  round.forbiddenRules.forEach((rule) => {
    const li = document.createElement('li');
    li.textContent = rule;
    forbiddenList.appendChild(li);
  });
  startTimer(round);
});

window.socket.on('roundEnded', ({ round, players }) => {
  timerEl.textContent = '--';
  timerEl.classList.remove('warning');
  roundSummary.classList.remove('hidden');
  summaryText.textContent = `Rodada ${round.roundNumber} finalizada! Informe se respeitou ou quebrou as regras.`;
  if (currentRoom) {
    currentRoom.round = round;
    currentRoom.players = players;
    renderPlayers(currentRoom);
  }
});

window.socket.on('errorMessage', (msg) => {
  alert(msg);
});

// Entrar na sala automaticamente ao carregar
const storedNickname = localStorage.getItem('ndi_nickname');
if (storedNickname) {
  // Tentativa de entrar com o nickname salvo
  window.sendEvent('joinRoom', { roomCode, nickname: storedNickname });
} else {
  const nickname = prompt('Qual seu nickname?') || 'Jogador';
  localStorage.setItem('ndi_nickname', nickname);
  window.sendEvent('joinRoom', { roomCode, nickname });
}

window.canvasTools.init();

