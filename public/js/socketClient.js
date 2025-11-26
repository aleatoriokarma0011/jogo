// Cliente Socket.io compartilhado entre as páginas
window.socket = io();

window.sendEvent = function sendEvent(event, payload) {
  window.socket.emit(event, payload);
};
