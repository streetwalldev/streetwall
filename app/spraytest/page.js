// app/page.js
export default function HomePage() {
  return (
    <div style={{ margin: 0, padding: 0, background: '#000', minHeight: '100vh', color: '#fff', overflowX: 'auto' }}>
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
              background: #000; 
              cursor: crosshair; 
              touch-action: none; 
              user-select: none; 
              border: 1px dashed #343434; /* ← усилена контрастность */
              border-radius: 4px;
            }

            /* === АДАПТИВ === */
            @media (max-width: 700px) {
              #burger { display: block; }
              #controls-panel {
                right: -100%;
                opacity: 0;
                visibility: hidden;
              }
              #controls-panel.open {
                right: 0;
                opacity: 1;
                visibility: visible;
              }
              #canvas-container {
                width: 1024px;
                height: 1024px;
              }
            }

            @media (min-width: 701px) {
              #burger { display: none !important; }
              #controls-panel {
                right: 0 !important;
                opacity: 1 !important;
                visibility: visible !important;
                border-left: 1px solid #333;
              }
              #canvas-container {
                position: absolute;
                top: 20px;
                left: 20px;
                width: 1024px;
                height: 1024px;
              }
            }

            /* === БУРГЕР-МЕНЮ === */
            #burger {
              position: fixed;
              top: 16px;
              left: 16px;
              width: 32px;
              height: 24px;
              z-index: 1001;
              cursor: pointer;
              padding: 8px;
              background: rgba(0,0,0,0.4);
              border-radius: 4px;
            }
            .bar {
              display: block;
              width: 100%;
              height: 3px;
              background: #aaa;
              margin: 4px 0;
              transition: 0.3s;
              border-radius: 2px;
            }
            #burger.open .bar:nth-child(1) { 
              transform: rotate(45deg) translate(6px, 6px); 
              background: #ff3366;
            }
            #burger.open .bar:nth-child(2) { opacity: 0; }
            #burger.open .bar:nth-child(3) { 
              transform: rotate(-45deg) translate(6px, -6px); 
              background: #ff3366;
            }

            /* === СЧЁТЧИК КРАСКИ === */
            #paintCounter {
              position: fixed;
              top: 25px;
              left: 64px;
              font-size: 0.75rem;
              opacity: 0.9;
              color: #fff;
              z-index: 1000;
              pointer-events: none;
              background: rgba(0,0,0,0.5);
              padding: 4px 10px;
              border-radius: 12px;
              font-weight: bold;
            }

            /* === ПАНЕЛЬ УПРАВЛЕНИЯ === */
            #controls-panel {
              position: fixed;
              top: 0;
              right: 0;
              width: 320px;
              height: 100vh;
              background: rgba(15,15,15,0.96);
              padding: 24px 16px;
              color: #eee;
              z-index: 1000;
              overflow-y: auto;
              transition: all 0.3s ease;
            }

            /* === КОНТРОЛЫ === */
            .control-group { margin-bottom: 16px; }
            label { display: block; margin-bottom: 6px; font-size: 0.95em; color: #ccc; }
            input[type="range"] { width: 100%; margin-top: 4px; }
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

            /* === ВЕРСИЯ === */
            #version {
              position: fixed;
              bottom: 12px;
              left: 12px;
              font-size: 0.7rem;
              opacity: 0.5;
              color: #666;
              z-index: 100;
              pointer-events: none;
              background: rgba(0,0,0,0.3);
              padding: 2px 6px;
              border-radius: 4px;
            }

            /* === КАСТОМНЫЙ КУРСОР — РОЗОВЫЙ КРУГ 16×16 === */
            #customCursor {
              position: fixed;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: #ff3366;
              pointer-events: none;
              transform: translate(-50%, -50%);
              z-index: 1000;
              display: none;
              box-shadow: 0 0 6px rgba(255, 51, 102, 0.6);
            }
          `,
        }}
      />

      <div style={{ position: 'relative', width: 'max-content', minWidth: '100vw', height: '100vh' }}>
        <div id="canvas-container">
          <canvas id="sprayCanvas" width="1024" height="1024"></canvas>
        </div>

        <div id="burger">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        <div id="paintCounter">2000000</div>
        <div id="customCursor"></div>

        <div id="controls-panel">
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>🎨 Spray Controls</h3>
          <div className="control-group">
            <label>Цвет: <input type="color" id="colorPicker" value="#ff3366"/></label>
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

        <div id="version">1.3.83.67 © streetwall.art</div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const config = {
                sprayRadius: 30,
                dotsPerTick: 556,
                speedFactor: 7,
                lineScale: 1.0,
                paintMax: 2000000,
                paintLeft: 2000000,
                currentColor: '#ff3366'
              };

              let isDrawing = false;
              let lastSprayPos = null;
              let lastSprayTime = null;
              const paintedPixels = new Set();
              const dripMap = {};

              const canvas = document.getElementById('sprayCanvas');
              const ctx = canvas.getContext('2d');
              const colorPicker = document.getElementById('colorPicker');
              const scaleRange = document.getElementById('scaleRange');
              const radiusRange = document.getElementById('radiusRange');
              const densityRange = document.getElementById('densityRange');
              const speedFactorInput = document.getElementById('speedFactor');
              const scaleVal = document.getElementById('scaleVal');
              const radiusVal = document.getElementById('radiusVal');
              const densityVal = document.getElementById('densityVal');
              const speedFactorVal = document.getElementById('speedFactorVal');
              const paintLeftEl = document.getElementById('paintLeft');
              const paintCounter = document.getElementById('paintCounter');
              const resetBtn = document.getElementById('resetBtn');
              const bgImageInput = document.getElementById('bgImageInput');
              const burger = document.getElementById('burger');
              const controlsPanel = document.getElementById('controls-panel');
              const customCursor = document.getElementById('customCursor');

              ctx.fillStyle = '#000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              function updateUI() {
                paintLeftEl.textContent = config.paintLeft;
                paintCounter.textContent = config.paintLeft;
                scaleVal.textContent = config.lineScale.toFixed(2);
                radiusVal.textContent = config.sprayRadius;
                densityVal.textContent = config.dotsPerTick;
                speedFactorVal.textContent = config.speedFactor.toFixed(1);
              }

              function getCanvasCoords(e) {
                const rect = canvas.getBoundingClientRect();
                const clientX = e.touches?.[0]?.clientX || e.clientX;
                const clientY = e.touches?.[0]?.clientY || e.clientY;
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                return {
                  x: (clientX - rect.left) * scaleX,
                  y: (clientY - rect.top) * scaleY
                };
              }

              function sprayAt(x, y) {
                if (config.paintLeft <= 0) return;

                const now = performance.now();
                let speed = 0;
                if (lastSprayPos && lastSprayTime !== null) {
                  const dt = now - lastSprayTime;
                  const dist = Math.hypot(x - lastSprayPos.x, y - lastSprayPos.y);
                  speed = Math.min(1, dist / (dt || 1) / config.speedFactor);
                }

                const minRadius = config.sprayRadius * 0.7 * config.lineScale;
                const maxRadius = config.sprayRadius * 3 * config.lineScale;
                const radiusFromSpeed = minRadius + (maxRadius - minRadius) * speed;

                const minDot = 0.7 * config.lineScale;
                const maxDot = 1.1 * config.lineScale;
                const dotFromSpeed = maxDot - (maxDot - minDot) * speed;

                for (let i = 0; i < config.dotsPerTick; i++) {
                  const angle = Math.random() * 2 * Math.PI;
                  const r = Math.random() * radiusFromSpeed;
                  const dx = Math.cos(angle) * r;
                  const dy = Math.sin(angle) * r;
                  const size = minDot + Math.random() * (maxDot - minDot);

                  ctx.globalAlpha = 0.15 + Math.random() * 0.4;
                  ctx.fillStyle = config.currentColor; // ← берётся из config, обновляется мгновенно
                  ctx.beginPath();
                  ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
                  ctx.fill();
                }

                const px = Math.round(x);
                const py = Math.round(y);
                const key = px + '_' + py;
                if (!paintedPixels.has(key)) {
                  paintedPixels.add(key);
                  config.paintLeft--;
                }

                if (config.paintLeft <= 0) {
                  alert('🎨 Краска закончилась!');
                }

                updateUI();
                lastSprayPos = { x, y };
                lastSprayTime = now;
                ctx.globalAlpha = 1;
              }

              function handleStart(e) {
                e.preventDefault();
                if (config.paintLeft <= 0) return;
                const { x, y } = getCanvasCoords(e);
                isDrawing = true;
                sprayAt(x, y);
                updateCursor(e);
              }

              function handleMove(e) {
                if (!isDrawing) return;
                e.preventDefault();
                const { x, y } = getCanvasCoords(e);
                sprayAt(x, y);
                updateCursor(e);
              }

              function handleEnd() {
                isDrawing = false;
                customCursor.style.display = 'none';
              }

              function updateCursor(e) {
                const x = e.clientX || (e.touches?.[0]?.clientX || 0);
                const y = e.clientY || (e.touches?.[0]?.clientY || 0);
                customCursor.style.left = x + 'px';
                customCursor.style.top = y + 'px';
                customCursor.style.display = 'block';
              }

              ['touchstart', 'mousedown'].forEach(type =>
                canvas.addEventListener(type, handleStart, { passive: false })
              );
              ['touchmove', 'mousemove'].forEach(type =>
                canvas.addEventListener(type, handleMove, { passive: false })
              );
              ['touchend', 'mouseup', 'mouseleave'].forEach(type =>
                canvas.addEventListener(type, handleEnd)
              );

              canvas.addEventListener('click', () => {
                if (window.innerWidth <= 700) {
                  burger.classList.remove('open');
                  controlsPanel.classList.remove('open');
                }
              });

              // ✅ Превью цвета теперь обновляется мгновенно
              colorPicker.addEventListener('input', (e) => {
                config.currentColor = e.target.value;
                // Sync native color picker preview (браузер сам делает это, но на всякий)
                colorPicker.value = e.target.value;
              });

              scaleRange.addEventListener('input', (e) => {
                config.lineScale = parseFloat(e.target.value);
              });

              radiusRange.addEventListener('input', (e) => {
                config.sprayRadius = parseInt(e.target.value);
              });

              densityRange.addEventListener('input', (e) => {
                config.dotsPerTick = parseInt(e.target.value);
              });

              speedFactorInput.addEventListener('input', (e) => {
                config.speedFactor = parseFloat(e.target.value);
              });

              resetBtn.addEventListener('click', () => {
                paintedPixels.clear();
                Object.keys(dripMap).forEach(k => delete dripMap[k]);
                config.paintLeft = config.paintMax;
                lastSprayPos = null;
                lastSprayTime = null;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                updateUI();
              });

              bgImageInput.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                const img = new Image();
                img.onload = () => {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  URL.revokeObjectURL(url);
                };
                img.src = url;
              });

              if (burger) {
                burger.addEventListener('click', () => {
                  burger.classList.toggle('open');
                  controlsPanel.classList.toggle('open');
                });
              }

              updateUI();
            })();
          `,
        }}
      />
    </div>
  );
}
