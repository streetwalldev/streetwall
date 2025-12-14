// app/page.js
export default function HomePage() {
  return (
    <div style={{ margin: 0, padding: 0, background: '#222', minHeight: '100vh' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body { font-family: system-ui, sans-serif; }
            .header { text-align: center; margin: 20px 0; color: #fff; }
            .container { display: flex; gap: 20px; padding: 0 20px; height: calc(100vh - 120px); }
            .canvas-wrap { flex: 1; min-width: 0; position: relative; }
            canvas { display: block; width: 100%; height: 100%; background: #111; cursor: crosshair; border: 1px solid #555; border-radius: 4px; }
            .controls { width: 280px; padding: 12px; background: rgba(0,0,0,0.4); border-radius: 8px; color: #eee; }
            .control-group { margin-bottom: 16px; }
            label { display: block; margin-bottom: 6px; }
            input[type="range"] { width: 100%; }
            button { padding: 6px 12px; background: #333; color: #fff; border: none; border-radius: 4px; cursor: pointer; }
            button:hover { background: #444; }
          `,
        }}
      />

      <div className="header">
        <h2>🎨 Spray Canvas</h2>
      </div>

      <div className="container">
        <div className="canvas-wrap">
          <canvas id="sprayCanvas" width="1024" height="1024"></canvas>
        </div>

        <div className="controls">
          <h3>🔧 Controls</h3>
          <div className="control-group">
            <label>Цвет: <input type="color" id="colorPicker" value="#2222ff"/></label>
          </div>
          <div className="control-group">
            <label>Line Scale: <span id="scaleVal">1.00</span></label>
            <input type="range" id="scaleRange" min="0.1" max="1.0" step="0.05" value="1.0"/>
          </div>
          <div className="control-group">
            <label>Радиус: <span id="radiusVal">30</span> px</label>
            <input type="range" id="radiusRange" min="10" max="100" value="30"/>
          </div>
          <div className="control-group">
            <label>Плотность: <span id="densityVal">556</span></label>
            <input type="range" id="densityRange" min="50" max="2000" value="556"/>
          </div>
          <div className="control-group">
            <label>Скорость: <span id="speedFactorVal">7.0</span></label>
            <input type="range" id="speedFactor" min="1" max="20" step="0.5" value="7"/>
          </div>
          <div className="control-group">
            <label>Краски: <span id="paintLeft">2000000</span></label>
            <button id="resetBtn">Очистить</button>
          </div>
          <div className="control-group">
            <label>Фон: <input type="file" id="bgImageInput" accept="image/*"/></label>
          </div>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // === CONFIG ===
              const config = {
                sprayRadius: 30,
                dotsPerTick: 556,
                speedFactor: 7,
                lineScale: 1.0,
                paintMax: 2000000,
                paintLeft: 2000000,
                currentColor: '#2222ff'
              };

              // === STATE ===
              let isDrawing = false;
              let lastSprayPos = null;
              let lastSprayTime = null;
              const paintedPixels = new Set();
              const dripMap = {};
              let bgImage = null;

              // === DOM ===
              const canvas = document.getElementById('sprayCanvas');
              const ctx = canvas.getContext('2d');
              const colorPicker = document.getElementById('colorPicker');
              const scaleRange = document.getElementById('scaleRange');
              const radiusRange = document.getElementById('radiusRange');
              const densityRange = document.getElementById('densityRange');
              const speedFactorEl = document.getElementById('speedFactor');
              const scaleVal = document.getElementById('scaleVal');
              const radiusVal = document.getElementById('radiusVal');
              const densityVal = document.getElementById('densityVal');
              const speedFactorVal = document.getElementById('speedFactorVal');
              const paintLeftEl = document.getElementById('paintLeft');
              const resetBtn = document.getElementById('resetBtn');
              const bgImageInput = document.getElementById('bgImageInput');

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

              function redraw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (bgImage) {
                  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
                }
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
                  const cellKey = \`\${cellX}_\${cellY}\`;
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
                  const key = \`\${px}_\${py}\`;
                  if (!paintedPixels.has(key)) {
                    paintedPixels.add(key);
                    config.paintLeft--;
                    paintLeftEl.textContent = Math.max(0, config.paintLeft);
                    if (config.paintLeft <= 0) {
                      isDrawing = false;
                      alert('🎨 Краска закончилась!');
                    }
                  }
                }

                ctx.globalAlpha = 1;
                lastSprayPos = { x, y };
                lastSprayTime = now;
              }

              // === EVENTS ===
              function handleStart(e) {
                if (config.paintLeft <= 0) return;
                e.preventDefault();
                const { x, y } = getCanvasCoords(e.clientX, e.clientY);
                isDrawing = true;
                sprayAt(x, y);
              }

              function handleMove(e) {
                if (!isDrawing || config.paintLeft <= 0) return;
                e.preventDefault();
                const { x, y } = getCanvasCoords(e.clientX, e.clientY);
                sprayAt(x, y);
              }

              function handleEnd() {
                isDrawing = false;
                lastSprayPos = null;
                lastSprayTime = null;
              }

              // Canvas events
              canvas.addEventListener('pointerdown', handleStart);
              canvas.addEventListener('pointermove', handleMove);
              canvas.addEventListener('pointerup', handleEnd);
              canvas.addEventListener('pointercancel', handleEnd);

              // Touch (for mobile/trackpad)
              canvas.addEventListener('touchstart', handleStart, { passive: false });
              canvas.addEventListener('touchmove', handleMove, { passive: false });
              canvas.addEventListener('touchend', handleEnd);

              // UI events
              colorPicker.addEventListener('input', () => config.currentColor = colorPicker.value);
              scaleRange.addEventListener('input', () => {
                config.lineScale = parseFloat(scaleRange.value);
                scaleVal.textContent = config.lineScale.toFixed(2);
              });
              radiusRange.addEventListener('input', () => {
                config.sprayRadius = parseInt(radiusRange.value);
                radiusVal.textContent = config.sprayRadius;
              });
              densityRange.addEventListener('input', () => {
                config.dotsPerTick = parseInt(densityRange.value);
                densityVal.textContent = config.dotsPerTick;
              });
              speedFactorEl.addEventListener('input', () => {
                config.speedFactor = parseFloat(speedFactorEl.value);
                speedFactorVal.textContent = config.speedFactor.toFixed(1);
              });

              resetBtn.addEventListener('click', () => {
                bgImage = null;
                paintedPixels.clear();
                Object.keys(dripMap).forEach(k => delete dripMap[k]);
                lastSprayPos = null;
                lastSprayTime = null;
                config.paintLeft = config.paintMax;
                paintLeftEl.textContent = config.paintLeft;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              });

              bgImageInput.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const img = new Image();
                  img.onload = () => {
                    bgImage = img;
                    canvas.width = img.width;
                    canvas.height = img.height;
                    redraw();
                  };
                  img.src = reader.result;
                };
                reader.readAsDataURL(file);
              });

              // Init UI
              scaleVal.textContent = config.lineScale.toFixed(2);
              radiusVal.textContent = config.sprayRadius;
              densityVal.textContent = config.dotsPerTick;
              speedFactorVal.textContent = config.speedFactor.toFixed(1);
              paintLeftEl.textContent = config.paintLeft;
            })();
          `,
        }}
      />
    </div>
  );
}
