<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StreetWall Art — Spray Prototype</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #222;
      color: #eee;
      font-family: system-ui, sans-serif;
      padding: 10px;
      min-height: 100vh;
    }
    .header {
      text-align: center;
      margin-bottom: 16px;
    }
    .container {
      display: flex;
      gap: 20px;
      height: calc(100vh - 80px);
    }
    .canvas-wrap {
      flex: 1;
      min-width: 0;
      position: relative;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
      background: #111;
      cursor: crosshair;
      border: 1px solid #555;
      border-radius: 4px;
    }
    .version {
      position: absolute;
      bottom: 8px;
      right: 12px;
      font-size: 0.75rem;
      opacity: 0.6;
      pointer-events: none;
      color: #aaa;
    }
    .controls {
      width: 280px;
      background: rgba(0,0,0,0.4);
      border-radius: 8px;
      padding: 12px;
    }
    .control-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      margin-bottom: 6px;
    }
    input[type="range"] {
      width: 100%;
    }
    button {
      padding: 6px 12px;
      background: #333;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover { background: #444; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Spray Canvas — StreetWall Art</h2>
  </div>

  <div class="container">
    <div class="canvas-wrap">
      <canvas id="sprayCanvas" width="1024" height="1024"></canvas>
      <div class="version">v1.2.0 — Vanilla JS</div>
    </div>

    <div class="controls">
      <h3>Controls</h3>
      <div class="control-group">
        <label>Цвет: <input type="color" id="colorPicker" value="#2222ff"></label>
      </div>
      <div class="control-group">
        <label>Line Scale: <span id="scaleVal">1.00</span></label>
        <input type="range" id="scaleRange" min="0.1" max="1.0" step="0.05" value="1.0">
      </div>
      <div class="control-group">
        <label>Радиус: <span id="radiusVal">30</span> px</label>
        <input type="range" id="radiusRange" min="10" max="100" value="30">
      </div>
      <div class="control-group">
        <label>Плотность: <span id="densityVal">556</span></label>
        <input type="range" id="densityRange" min="50" max="2000" value="556">
      </div>
      <div class="control-group">
        <label>Краски осталось: <span id="paintLeft">2000000</span></label>
        <button id="resetBtn">Очистить</button>
      </div>
      <div class="control-group">
        <label>Фон: <input type="file" id="bgImageInput" accept="image/*"></label>
      </div>
    </div>
  </div>

  <script>
    // === CONFIG ===
    const config = {
      sprayRadius: 30,
      dotsPerTick: 556,
      speedFactor: 7,
      lineScale: 1.0,
      paintMax: 2_000_000,
      currentColor: '#2222ff',
      paintLeft: 2_000_000
    };

    // === STATE ===
    let isDrawing = false;
    let lastSprayPos = null;
    let lastSprayTime = null;
    const paintedPixels = new Set();
    const dripMap = {};

    // === DOM ===
    const canvas = document.getElementById('sprayCanvas');
    const ctx = canvas.getContext('2d');
    const colorPicker = document.getElementById('colorPicker');
    const scaleRange = document.getElementById('scaleRange');
    const radiusRange = document.getElementById('radiusRange');
    const densityRange = document.getElementById('densityRange');
    const scaleVal = document.getElementById('scaleVal');
    const radiusVal = document.getElementById('radiusVal');
    const densityVal = document.getElementById('densityVal');
    const paintLeftEl = document.getElementById('paintLeft');
    const resetBtn = document.getElementById('resetBtn');
    const bgImageInput = document.getElementById('bgImageInput');

    // === INIT ===
    function initCanvas() {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    initCanvas();

    // === UTILS ===
    function getRandomInt(a, b) {
      return Math.random() * (b - a) + a;
    }

    function getCanvasCoords(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    }

    // === SPRAY LOGIC ===
    function sprayAt(x, y) {
      if (config.paintLeft <= 0) return;

      const now = performance.now();
      let speed = 0;
      if (lastSprayPos && lastSprayTime !== null) {
        const dt = now - lastSprayTime;
        const dist = Math.hypot(x - lastSprayPos.x, y - lastSprayPos.y);
        speed = dist / (dt || 1);
        speed = Math.min(1, speed / config.speedFactor);
      }

      const scale = config.lineScale;
      const minDot = 0.7 * scale;
      const maxDot = 1.1 * scale;
      const dotFromSpeed = maxDot - (maxDot - minDot) * speed;

      const minRadius = config.sprayRadius * 0.7 * scale;
      const maxRadius = config.sprayRadius * 3 * scale;
      const radiusFromSpeed = minRadius + (maxRadius - minRadius) * speed;

      const minAlpha = 0.15;
      const maxAlpha = 0.55;
      const alphaFromSpeed = maxAlpha - (maxAlpha - minAlpha) * speed;

      for (let i = 0; i < config.dotsPerTick; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const r = Math.random() * radiusFromSpeed;
        const dx = Math.cos(angle) * r;
        const dy = Math.sin(angle) * r;
        const size = getRandomInt(dotFromSpeed * 0.85, dotFromSpeed);

        ctx.globalAlpha = alphaFromSpeed * (0.8 + Math.random() * 0.3);
        ctx.fillStyle = config.currentColor;
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
        ctx.fill();

        // Подтёки
        const cellX = Math.round(x + dx);
        const cellY = Math.round(y + dy);
        const cellKey = `${cellX}_${cellY}`;
        dripMap[cellKey] = (dripMap[cellKey] || 0) + 1;
        const drops = dripMap[cellKey];

        const threshold = Math.max(10, 14 * scale);
        if (drops > threshold && drops % 3 === 0) {
          const dripLen = Math.min(250 * scale, Math.sqrt(drops - threshold) * 4 * scale + getRandomInt(-1, 2));
          ctx.save();
          ctx.globalAlpha = 0.12 + Math.random() * 0.01;
          ctx.strokeStyle = config.currentColor;
          ctx.lineWidth = size * getRandomInt(0.7, 1.5);
          ctx.beginPath();
          ctx.moveTo(cellX + getRandomInt(-1, 1), cellY + size / 2);
          ctx.lineTo(cellX + getRandomInt(-1, 1), cellY + size / 2 + dripLen);
          ctx.stroke();
          ctx.restore();
        }

        // Расход краски
        const px = Math.round(x + dx);
        const py = Math.round(y + dy);
        const key = `${px}_${py}`;
        if (!paintedPixels.has(key)) {
          paintedPixels.add(key);
          config.paintLeft--;
          paintLeftEl.textContent = config.paintLeft.toLocaleString();
          if (config.paintLeft <= 0) {
            isDrawing = false;
            alert('🎨 Краска закончилась!');
          }
        }
      }

      ctx.globalAlpha = 1.0;
      lastSprayPos = { x, y };
      lastSprayTime = now;
    }

    // === EVENT HANDLERS ===
    function handleStart(e) {
      if (config.paintLeft <= 0) return;
      e.preventDefault();
      const coords = getCanvasCoords(
        e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0),
        e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)
      );
      isDrawing = true;
      sprayAt(coords.x, coords.y);
    }

    function handleMove(e) {
      if (!isDrawing || config.paintLeft <= 0) return;
      e.preventDefault();
      const coords = getCanvasCoords(
        e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0),
        e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0)
      );
      sprayAt(coords.x, coords.y);
    }

    function handleEnd() {
      isDrawing = false;
      lastSprayPos = null;
      lastSprayTime = null;
    }

    // === LISTENERS ===
    canvas.addEventListener('pointerdown', handleStart);
    canvas.addEventListener('pointermove', handleMove);
    canvas.addEventListener('pointerup', handleEnd);
    canvas.addEventListener('pointercancel', handleEnd);

    // Touch (for mobile/trackpad)
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd);

    // === UI ===
    colorPicker.addEventListener('input', (e) => config.currentColor = e.target.value);
    scaleRange.addEventListener('input', (e) => {
      config.lineScale = parseFloat(e.target.value);
      scaleVal.textContent = config.lineScale.toFixed(2);
    });
    radiusRange.addEventListener('input', (e) => {
      config.sprayRadius = parseInt(e.target.value);
      radiusVal.textContent = config.sprayRadius;
    });
    densityRange.addEventListener('input', (e) => {
      config.dotsPerTick = parseInt(e.target.value);
      densityVal.textContent = config.dotsPerTick;
    });

    resetBtn.addEventListener('click', () => {
      paintedPixels.clear();
      Object.keys(dripMap).forEach(k => delete dripMap[k]);
      lastSprayPos = null;
      lastSprayTime = null;
      config.paintLeft = config.paintMax;
      paintLeftEl.textContent = config.paintLeft.toLocaleString();
      initCanvas();
    });

    bgImageInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    // === INIT UI ===
    scaleVal.textContent = config.lineScale.toFixed(2);
    radiusVal.textContent = config.sprayRadius;
    densityVal.textContent = config.dotsPerTick;
    paintLeftEl.textContent = config.paintLeft.toLocaleString();
  </script>
</body>
</html>
