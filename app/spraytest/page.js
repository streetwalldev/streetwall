// app/page.js
export default function HomePage() {
  return (
    <div style={{ margin: 0, padding: 0, background: '#111', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        /* === АДАПТИВНЫЙ UI === */
        @media (min-width: 720px) {
          #burger { display: none !important; }
          #paintCounter { left: 24px !important; top: 24px !important; }
          #controls-panel {
            right: 0 !important;
            opacity: 1 !important;
            visibility: visible !important;
            border-left: none !important;
            background: transparent !important;
            padding: 0 !important;
            width: auto !important;
            max-width: none !important;
            height: auto !important;
          }
        }

        /* === КРУГИ-РЕЖИМЫ === */
        #distanceModes {
          position: fixed;
          top: 24px;
          left: calc(64px + 24px); /* счётчик 64px + отступ 24px */
          display: flex;
          gap: 12px;
          z-index: 1000;
        }
        .mode-circle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #666;
          cursor: pointer;
          transition: all 0.2s;
        }
        .mode-circle:nth-child(2) { width: 10px; height: 10px; }
        .mode-circle:nth-child(3) { width: 12px; height: 12px; }
        .mode-circle:nth-child(4) { width: 14px; height: 14px; }
        .mode-circle.active {
          background: #ff3366;
          box-shadow: 0 0 4px rgba(255, 51, 102, 0.8);
        }

        /* === ОСТАЛЬНОЕ (как было) */
        body { font-family: system-ui, sans-serif; margin: 0; padding: 0; overflow: hidden; }
        canvas { 
          display: block; 
          background: #111; 
          cursor: crosshair; 
          touch-action: none; 
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 4px;
        }
        #burger { /* ... */ }
        #paintCounter { /* ... */ }
        #controls-panel { /* ... */ }
        #version { position: fixed; bottom: 12px; left: 12px; font-size: 0.7rem; opacity: 0.4; color: #666; }
        #customCursor { /* ... */ }
      ` }} />

      {/* === КОРНЕВОЙ КОНТЕЙНЕР === */}
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <canvas 
          id="sprayCanvas" 
          width="1024" 
          height="1024"
          style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90vw',
            height: '80vh',
            maxWidth: '1024px',
            maxHeight: '1024px'
          }}
        ></canvas>

        {/* Бургер (только мобильный) */}
        <div id="burger">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* Счётчик */}
        <div id="paintCounter">2000000</div>

        {/* Круги-режимы */}
        <div id="distanceModes">
          <div className="mode-circle active" data-mode="0"></div>
          <div className="mode-circle" data-mode="1"></div>
          <div className="mode-circle" data-mode="2"></div>
          <div className="mode-circle" data-mode="3"></div>
        </div>

        {/* Панель (на десктопе — всегда видна справа) */}
        <div id="controls-panel">
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#fff' }}>🎨 Spray</h3>
          <div className="control-group">
            <label style={{ color: '#ccc' }}>Цвет: <input type="color" id="colorPicker" value="#ff3366"/></label>
          </div>
          <div className="control-group">
            <label style={{ color: '#ccc' }}>Фон: <input type="file" id="bgImageInput" accept="image/*"/></label>
          </div>
        </div>

        <div id="version">v1.3.73.56 © streetwall.art</div>
        <div id="customCursor"></div>
      </div>

      {/* Подключаем пресеты */}
      <script src="public/cans.js"></script>

      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          // === КОНФИГ ===
          const config = {
            paintMax: 2000000,
            paintLeft: 2000000,
            currentColor: 'gray',
            currentCan: 'basic',
            currentMode: 0, // 0–3
            dripMap: {},
            paintedPixels: new Set()
          };

          // DOM
          const canvas = document.getElementById('sprayCanvas');
          const ctx = canvas.getContext('2d');
          const colorPicker = document.getElementById('colorPicker');
          const paintCounter = document.getElementById('paintCounter');
          const modeCircles = document.querySelectorAll('.mode-circle');
          const bgImageInput = document.getElementById('bgImageInput');
          const burger = document.getElementById('burger');
          const controlsPanel = document.getElementById('controls-panel');
          const customCursor = document.getElementById('customCursor');

          // Инициализация фона
          ctx.fillStyle = '#111';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // === ПОЛУЧЕНИЕ КООРДИНАТ ===
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

          // === РАСПЫЛЕНИЕ ===
          function sprayAt(x, y) {
            if (config.paintLeft <= 0) return;
            const preset = window.CAN_PRESETS[config.currentCan];
            const mode = preset.modes[config.currentMode].params;
            const now = performance.now();
            
            let speed = 0;
            if (config.lastSprayPos && config.lastSprayTime) {
              const dt = now - config.lastSprayTime;
              const dist = Math.hypot(x - config.lastSprayPos.x, y - config.lastSprayPos.y);
              speed = Math.min(1, dist / (dt || 1) / mode.speedFactor);
            }

            const radiusFromSpeed = mode.radius * (0.7 + 2.3 * speed);
            const densityFromSpeed = mode.density * (1 - 0.5 * speed);

            for (let i = 0; i < Math.floor(densityFromSpeed); i++) {
              const angle = Math.random() * 2 * Math.PI;
              const r = Math.random() * radiusFromSpeed;
              const dx = Math.cos(angle) * r;
              const dy = Math.sin(angle) * r;
              const size = 1 + Math.random() * 2;

              ctx.globalAlpha = 0.12 + Math.random() * 0.48;
              ctx.fillStyle = config.currentColor;
              ctx.beginPath();
              ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
              ctx.fill();
            }

            // === Подтёки ===
            const key = Math.round(x) + '_' + Math.round(y);
            config.dripMap[key] = (config.dripMap[key] || 0) + 1;
            const drops = config.dripMap[key];
            if (drops > mode.dripThreshold && drops % 3 === 0) {
              const len = Math.min(mode.maxDripLength, Math.sqrt(drops - mode.dripThreshold) * mode.dripFactor);
              ctx.save();
              ctx.globalAlpha = 0.1 + Math.random() * 0.1;
              ctx.strokeStyle = config.currentColor;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x, y + len);
              ctx.stroke();
              ctx.restore();
            }

            // === Краска ===
            if (!config.paintedPixels.has(key)) {
              config.paintedPixels.add(key);
              config.paintLeft--;
              paintCounter.textContent = config.paintLeft;
              if (config.paintLeft <= 0) alert('🎨 Краска закончилась!');
            }

            config.lastSprayPos = { x, y };
            config.lastSprayTime = now;
          }

          // === ОБРАБОТЧИКИ ===
          function handleStart(e) {
            e.preventDefault();
            if (config.paintLeft <= 0) return;
            const { x, y } = getCanvasCoords(e);
            sprayAt(x, y);
            updateCursor(e);
            config.isDrawing = true;
          }

          function handleMove(e) {
            if (!config.isDrawing) return;
            e.preventDefault();
            const { x, y } = getCanvasCoords(e);
            sprayAt(x, y);
            updateCursor(e);
          }

          function handleEnd() {
            config.isDrawing = false;
            customCursor.style.display = 'none';
          }

          function updateCursor(e) {
            const x = e.clientX || (e.touches?.[0]?.clientX || 0);
            const y = e.clientY || (e.touches?.[0]?.clientY || 0);
            customCursor.style.left = x + 'px';
            customCursor.style.top = y + 'px';
            customCursor.style.display = 'block';
          }

          // Подписки
          ['mousedown', 'touchstart'].forEach(type => 
            canvas.addEventListener(type, handleStart, { passive: false })
          );
          ['mousemove', 'touchmove'].forEach(type => 
            canvas.addEventListener(type, handleMove, { passive: false })
          );
          ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(type => 
            canvas.addEventListener(type, handleEnd)
          );

          // === UI ===
          colorPicker.addEventListener('input', e => config.currentColor = e.target.value);

          // Круги-режимы
          modeCircles.forEach(circle => {
            circle.addEventListener('click', () => {
              modeCircles.forEach(c => c.classList.remove('active'));
              circle.classList.add('active');
              config.currentMode = parseInt(circle.dataset.mode);
            });
          });

          // Загрузка фона
          bgImageInput.addEventListener('change', e => {
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

          // Бургер (только мобильный)
          burger?.addEventListener('click', () => {
            burger.classList.toggle('open');
            controlsPanel.classList.toggle('open');
          });

          // Инициализация
          paintCounter.textContent = config.paintLeft;
          customCursor.style.width = '6px';
          customCursor.style.height = '6px';
          customCursor.style.background = 'rgba(255, 51, 102, 0.7)';
        })();
      ` }} />
    </div>
  );
}
