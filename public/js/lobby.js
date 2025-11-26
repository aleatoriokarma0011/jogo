const nicknameInput = document.getElementById('nickname');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomCodeInput = document.getElementById('roomCode');
const lobbyMessage = document.getElementById('lobbyMessage');

function redirectToRoom(code) {
  window.location.href = `/room/${code}`;
}

createRoomBtn.addEventListener('click', () => {
  const nickname = nicknameInput.value.trim();
  if (!nickname) {
    lobbyMessage.textContent = 'Digite um nickname primeiro.';
    return;
  }
  localStorage.setItem('ndi_nickname', nickname);
  window.sendEvent('createRoom', { nickname });
});

joinRoomBtn.addEventListener('click', () => {
  const nickname = nicknameInput.value.trim();
  const roomCode = roomCodeInput.value.trim().toUpperCase();
  if (!nickname || !roomCode) {
    lobbyMessage.textContent = 'Preencha nickname e código da sala.';
    return;
  }
  localStorage.setItem('ndi_nickname', nickname);
  window.sendEvent('joinRoom', { roomCode, nickname });
});

window.socket.on('roomCreated', ({ roomCode }) => {
  redirectToRoom(roomCode);
});

window.socket.on('roomJoined', ({ roomCode }) => {
  redirectToRoom(roomCode);
});

window.socket.on('errorMessage', (message) => {
  lobbyMessage.textContent = message;
});
