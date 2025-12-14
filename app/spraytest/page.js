// app/page.js
export default function HomePage() {
  return (
    <div style={{ margin: 0, padding: 0, background: '#222', minHeight: '100vh' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* === ГЛОБАЛЬНЫЕ СТИЛИ === */
            body { 
              font-family: system-ui, sans-serif; 
              margin: 0; 
              padding: 0; 
              overflow: hidden; 
            }
            canvas { 
              display: block; 
              background: #111; 
              cursor: crosshair; 
              touch-action: none; 
              -webkit-tap-highlight-color: transparent; 
              user-select: none; 
            }

            /* === БУРГЕР-МЕНЮ + ПОДЛОЖКА ДЛЯ КРЕСТИКА === */
            #burger {
              position: fixed;
              top: 16px;
              left: 16px;
              width: 32px;
              height: 24px;
              z-index: 1001;
              cursor: pointer;
              padding: 8px;
              background: rgba(0,0,0,0.3);
              border-radius: 4px;
            }
            #burger .bar {
              display: block;
              width: 100%;
              height: 3px;
              background: #fff;
              margin: 4px 0;
              transition: 0.3s;
              border-radius: 2px;
            }
            #burger.open .bar:nth-child(1) { 
              transform: rotate(45deg) translate(6px, 6px); 
              background: #ff3366;
            }
            #burger.open .bar:nth-child(2) { 
              opacity: 0; 
            }
            #burger.open .bar:nth-child(3) { 
              transform: rotate(-45deg) translate(6px, -6px); 
              background: #ff3366;
            }

            /* === ПАНЕЛЬ УПРАВЛЕНИЯ (ПОЛНОСТЬЮ СКРЫТА ПО УМОЛЧАНИЮ) === */
            #controls-panel {
              position: fixed;
              top: 0;
              right: -100%;
              width: 100%;
              max-width: 320px;
              height: 100vh;
              background: rgba(30, 30, 30, 0.96);
              border-left: 1px solid #444;
              padding: 20px 16px;
              color: #eee;
              z-index: 1000;
              overflow-y: auto;
              transition: all 0.3s ease;
              opacity: 0;
              visibility: hidden;
            }
            #controls-panel.open {
              right: 0;
              opacity: 1;
              visibility: visible;
            }

            /* === КОНТРОЛЫ — АДАПТИВНЫЕ, НЕ ВЫЛЕЗАЮТ ЗА ЭКРАН === */
            .control-group {
              margin-bottom: 16px;
            }
            label {
              display: block;
              margin-bottom: 6px;
              font-size: 0.95em;
            }
            input[type="range"] {
              width: calc(100% - 16px);
              margin-left: 8px;
            }
            button {
              padding: 8px 16px;
              background: #333;
              color: #fff;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              width: 100%;
              margin-top: 6px;
            }
            button:hover { background: #444; }

            /* === ВЕРСИЯ + КОПИРАЙТ (левый нижний угол) === */
            #version {
              position: fixed;
              bottom: 12px;
              left: 12px;
              font-size: 0.7rem;
              opacity: 0.6;
              color: #888;
              z-index: 100;
              pointer-events: none;
              background: rgba(0,0,0,0.4);
              padding: 2px 6px;
              border-radius: 4px;
            }

            /* === АДАПТИВНОСТЬ === */
            @media (min-width: 768px) {
              #controls-panel {
                width: 320px;
              }
            }
          `,
        }}
      />

      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <canvas id="sprayCanvas" width="1024" height="1024"></canvas>

        {/* БУРГЕР-МЕНЮ */}
        <div id="burger">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* ПАНЕЛЬ УПРАВЛЕНИЯ */}
        <div id="controls-panel">
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>🔧 Street Wall Spray</h3>

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

        {/* ВЕРСИЯ + КОПИРАЙТ */}
        <div id="version">1.2.65.49 © streetwall.art</div>
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
              const burger = document.getElementById('burger');
              const controlsPanel = document.getElementById('controlsPanel') || document.getElementById('controls-panel');

              // === ИНИЦИАЛИЗАЦИЯ CANVAS ===
              const dpr = window.devicePixelRatio || 1;
              canvas.width = window.innerWidth * dpr;
              canvas.height = window.innerHeight * dpr;
              canvas.style.width = '100%';
              canvas.style.height = '100%';
              ctx.scale(dpr, dpr);
              ctx.fillStyle = '#111';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // === ТОЧНОЕ ПОЛУЧЕНИЕ КООРДИНАТ (исправлено) ===
              function getCanvasCoords(e) {
                const rect = canvas.getBoundingClientRect();
                let clientX = e.clientX || (e.touches?.[0]?.clientX || 0);
                let clientY = e.clientY || (e.touches?.[0]?.clientY || 0);
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                return {
                  x: (clientX - rect.left) * scaleX,
                  y: (clientY - rect.top) * scaleY,
                };
              }

              // === РАСХОД КРАСКИ — СИНХРОННО (без таймеров) ===
              function consumePaint() {
                if (config.paintLeft <= 0 && isDrawing) {
                  isDrawing = false;
                  alert('🎨 Краска закончилась!');
                }
                paintLeftEl.textContent = config.paintLeft;
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
                  const size = minDot + Math.random() * (maxDot - minDot);

                  ctx.globalAlpha = alphaFromSpeed * (0.8 + Math.random() * 0.3);
                  ctx.fillStyle = config.currentColor;
                  ctx.beginPath();
                  ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
                  ctx.fill();

                  // Подтёки (упрощённо)
                  const cellX = Math.round(x + dx);
                  const cellY = Math.round(y + dy);
                  const cellKey = \`\${cellX}_\${cellY}\`;
                  dripMap[cellKey] = (dripMap[cellKey] || 0) + 1;

                  // === ТОЧНЫЙ РАСХОД: только уникальные пиксели ===
                  const px = Math.round(x + dx);
                  const py = Math.round(y + dy);
                  const key = \`\${px}_\${py}\`;
                  if (!paintedPixels.has(key)) {
                    paintedPixels.add(key);
                    config.paintLeft--;
                  }
                }

                ctx.globalAlpha = 1;
                lastSprayPos = { x, y };
                lastSprayTime = now;
                consumePaint(); // ← вызов сразу после расхода
              }

              // === ОБРАБОТЧИКИ СОБЫТИЙ ===
              function handleStart(e) {
                e.preventDefault();
                if (config.paintLeft <= 0) return;
                const { x, y } = getCanvasCoords(e);
                isDrawing = true;
                sprayAt(x, y);
              }

              function handleMove(e) {
                if (!isDrawing || config.paintLeft <= 0) return;
                e.preventDefault();
                const { x, y } = getCanvasCoords(e);
                // Интерполяция для плавности
                const dx = x - (lastSprayPos?.x || x);
                const dy = y - (lastSprayPos?.y || y);
                const dist = Math.hypot(dx, dy);
                const steps = Math.max(1, Math.floor(dist / 4));
                for (let i = 1; i <= steps; i++) {
                  const nx = (lastSprayPos?.x || x) + (dx * i) / steps;
                  const ny = (lastSprayPos?.y || y) + (dy * i) / steps;
                  sprayAt(nx, ny);
                }
              }

              function handleEnd() {
                isDrawing = false;
                lastSprayPos = null;
                lastSprayTime = null;
              }

              // Подписки
              canvas.addEventListener('pointerdown', handleStart);
              canvas.addEventListener('pointermove', handleMove);
              canvas.addEventListener('pointerup', handleEnd);
              canvas.addEventListener('pointercancel', handleEnd);
              canvas.addEventListener('touchstart', handleStart, { passive: false });
              canvas.addEventListener('touchmove', handleMove, { passive: false });
              canvas.addEventListener('touchend', handleEnd);

              // UI
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
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
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
                    ctx.drawImage(img, 0, 0);
                  };
                  img.src = reader.result;
                };
                reader.readAsDataURL(file);
              });

              // === БУРГЕР-МЕНЮ ===
              burger.addEventListener('click', () => {
                burger.classList.toggle('open');
                controlsPanel.classList.toggle('open');
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
