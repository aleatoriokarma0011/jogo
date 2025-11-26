(function () {
  const canvas = document.getElementById('drawingCanvas');
  const ctx = canvas.getContext('2d');
  let drawing = false;
  let brushSize = 4;
  let brushColor = '#333333';
  let erasing = false;

  function resizeCanvas() {
    // canvas is responsive via CSS; keep internal size fixed for simplicity
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function startDraw(event) {
    drawing = true;
    draw(event);
  }

  function endDraw() {
    drawing = false;
    ctx.beginPath();
  }

  function draw(event) {
    if (!drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX || event.touches?.[0]?.clientX) - rect.left;
    const y = (event.clientY || event.touches?.[0]?.clientY) - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = erasing ? '#0f172a' : brushColor;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function clearCanvas() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  window.canvasTools = {
    init() {
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      canvas.addEventListener('mousedown', startDraw);
      canvas.addEventListener('touchstart', startDraw);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('touchmove', draw);
      canvas.addEventListener('mouseup', endDraw);
      canvas.addEventListener('mouseleave', endDraw);
      canvas.addEventListener('touchend', endDraw);

      document.getElementById('brushSize').addEventListener('input', (e) => {
        brushSize = Number(e.target.value);
      });
      document.getElementById('brushColor').addEventListener('input', (e) => {
        brushColor = e.target.value;
        erasing = false;
      });
      document.getElementById('eraserBtn').addEventListener('click', () => {
        erasing = true;
      });
      document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    },
  };
})();
