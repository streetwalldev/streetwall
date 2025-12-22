// app/page.js
export default function HomePage() {
  return (
    <div style={{ margin: 0, padding: 0, background: '#000', minHeight: '100vh', color: '#fff' }}>
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
              border: 1px dashed rgba(100,100,100,0.2);
              border-radius: 4px;
            }

            /* === АДАПТИВ: БУРГЕР И ПАНЕЛЬ === */
            @media (max-width: 700px) {
              #burger { display: block; }
              #paintCounter { left: 64px !important; }
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
              #desktop-controls { display: none !important; }
            }

            @media (min-width: 701px) {
              #burger { display: none !important; }
              #paintCounter { left: 24px !important; top: 24px !important; }
              #mobile-controls { display: none !important; }
              #desktop-controls {
                position: absolute;
                top: 50%;
                right: 100px;
                transform: translateY(-50%);
                background: rgba(20,20,20,0.8);
                padding: 20px;
                border-radius: 8px;
                max-width: 280px;
                color: #eee;
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

            /* === МОБИЛЬНАЯ ПАНЕЛЬ УПРАВЛЕНИЯ === */
            #controls-panel {
              position: fixed;
              top: 0;
              right: 0;
              width: 100%;
              max-width: 320px;
              height: 100vh;
              background: rgba(15,15,15,0.96);
              border-left: 1px solid #333;
              padding: 24px 16px;
              color: #eee;
              z-index: 1000;
              overflow-y: auto;
              transition: all 0.3s ease;
            }

            /* === ДЕСКТОПНЫЕ КОНТРОЛЫ (справа от canvas) === */
            #desktop-controls h3 {
              margin-top: 0;
              margin-bottom: 20px;
              font-size: 1.1rem;
            }
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

            /* === КУРСОР === */
            #customCursor {
              position: fixed;
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: rgba(255, 51, 102, 0.8);
              pointer-events: none;
              transform: translate(-50%, -50%);
              z-index: 1000;
              display: none;
              box-shadow: 0 0 4px rgba(255, 51, 102, 0.7);
            }
          `,
        }}
      />

      {/* === КОРНЕВОЙ КОНТЕЙНЕР === */}
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        {/* CANVAS */}
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

        {/* БУРГЕР (только мобильный) */}
        <div id="burger">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* СЧЁТЧИК — на месте бургера */}
        <div id="paintCounter">2000000</div>

        {/* КУРСОР */}
        <div id="customCursor"></div>

        {/* МОБИЛЬНОЕ МЕНЮ */}
        <div id="controls-panel">
          <h3>🔧 Spray Controls</h3>
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

        {/* ДЕСКТОПНЫЕ КОНТРОЛЫ (справа от canvas) */}
        <div id="desktop-controls">
          <h3>🎨 Spray</h3>
          <div className="control-group">
            <label>Цвет: <input type="color" id="colorPicker2" value="#ff3366"/></label>
          </div>
          <div className="control-group">
            <label>Line Scale: <span id="scaleVal2">1.00</span></label>
            <input type="range" id="scaleRange2" min="0.1" max="1.0" step="0.05" value="1.0"/>
          </div>
          <div className="control-group">
            <label>Радиус: <span id="radiusVal2">30</span> px</label>
            <input type="range" id="radiusRange2" min="10" max="100" value="30"/>
          </div>
          <div className="control-group">
            <label>Плотность: <span id="densityVal2">556</span></label>
            <input type="range" id="densityRange2" min="50" max="2000" value="556"/>
          </div>
          <div className="control-group">
            <label>Скорость: <span id="speedFactorVal2">7.0</span></label>
            <input type="range" id="speedFactor2" min="1" max="20" step="0.5" value="7"/>
          </div>
          <div className="control-group">
            <label>Краски: <span id="paintLeft2">2000000</span></label>
            <button id="resetBtn2">Очистить</button>
          </div>
          <div className="control-group">
            <label>Фон: <input type="file" id="bgImageInput2" accept="image/*"/></label>
          </div>
        </div>

        {/* ВЕРСИЯ */}
        <div id="version">1.3.83.64 © streetwall.art</div>
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
              ctx.fillStyle = '#000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // DOM elements (mobile + desktop)
              const dom = {
                color: ['#colorPicker', '#colorPicker2'],
                scale: ['#scaleRange', '#scaleRange2'],
                radius: ['#radiusRange', '#radiusRange2'],
                density: ['#densityRange', '#densityRange2'],
                speed: ['#speedFactor', '#speedFactor2'],
                scaleVal: ['#scaleVal', '#scaleVal2'],
                radiusVal: ['#radiusVal', '#radiusVal2'],
                densityVal: ['#densityVal', '#densityVal2'],
                speedVal: ['#speedFactorVal', '#speedFactorVal2'],
                paint: ['#paintLeft', '#paintLeft2'],
                counter: '#paintCounter',
                reset: ['#resetBtn', '#resetBtn2'],
                bg: ['#bgImageInput', '#bgImageInput2'],
                burger: '#burger',
                panel: '#controls-panel'
              };

              function $(sel) { return document.querySelector(sel); }

              // Sync UI ↔ config
              function syncUI() {
                dom.color.forEach(id => $(id).value = config.currentColor);
                dom.scale.forEach(id => $(id).value = config.lineScale);
                dom.radius.forEach(id => $(id).value = config.sprayRadius);
                dom.density.forEach(id => $(id).value = config.dotsPerTick);
                dom.speed.forEach(id => $(id).value = config.speedFactor);
                dom.scaleVal.forEach(el => el.textContent = config.lineScale.toFixed(2));
                dom.radiusVal.forEach(el => el.textContent = config.sprayRadius);
                dom.densityVal.forEach(el => el.textContent = config.dotsPerTick);
                dom.speedVal.forEach(el => el.textContent = config.speedFactor.toFixed(1));
                dom.paint.forEach(el => el.textContent = config.paintLeft);
                $(dom.counter).textContent = config.paintLeft;
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
                if (lastSprayPos && lastSprayTime) {
                  const dt = now - lastSprayTime;
                  const dist = Math.hypot(x - lastSprayPos.x, y - lastSprayPos.y);
                  speed = Math.min(1, dist / (dt || 1) / config.speedFactor);
                }

                const r = config.sprayRadius * (0.7 + 2.3 * speed);
                for (let i = 0; i < config.dotsPerTick; i++) {
                  const a = Math.random() * 2 * Math.PI;
                  const dx = Math.cos(a) * Math.random() * r;
                  const dy = Math.sin(a) * Math.random() * r;
                  const s = 1 + Math.random() * 2;

                  ctx.globalAlpha = 0.12 + Math.random() * 0.48;
                  ctx.fillStyle = config.currentColor;
                  ctx.beginPath();
                  ctx.arc(x + dx, y + dy, s, 0, 2 * Math.PI);
                  ctx.fill();
                }

                const key = Math.round(x) + '_' + Math.round(y);
                if (!paintedPixels.has(key)) {
                  paintedPixels.add(key);
                  config.paintLeft--;
                }
                syncUI();
                if (config.paintLeft <= 0) alert('🎨 Краска закончилась!');

                lastSprayPos = {x, y};
                lastSprayTime = now;
                ctx.globalAlpha = 1;
              }

              function handleStart(e) {
                e.preventDefault();
                if (config.paintLeft <= 0) return;
                const {x, y} = getCanvasCoords(e);
                isDrawing = true;
                sprayAt(x, y);
                updateCursor(e);
              }

              function handleMove(e) {
                if (!isDrawing) return;
                e.preventDefault();
                const {x, y} = getCanvasCoords(e);
                sprayAt(x, y);
                updateCursor(e);
              }

              function handleEnd() {
                isDrawing = false;
                $('$customCursor').style.display = 'none';
              }

              function updateCursor(e) {
                const x = e.clientX || (e.touches?.[0]?.clientX || 0);
                const y = e.clientY || (e.touches?.[0]?.clientY || 0);
                $('$customCursor').style.left = x + 'px';
                $('$customCursor').style.top = y + 'px';
                $('$customCursor').style.display = 'block';
              }

              // Events
              ['touchstart', 'mousedown'].forEach(t => canvas.addEventListener(t, handleStart, {passive: false}));
              ['touchmove', 'mousemove'].forEach(t => canvas.addEventListener(t, handleMove, {passive: false}));
              ['touchend', 'mouseup', 'mouseleave'].forEach(t => canvas.addEventListener(t, handleEnd));

              // UI listeners
              dom.color.forEach(id => $(id).addEventListener('input', e => {
                config.currentColor = e.target.value;
                syncUI();
              }));
              dom.scale.forEach(id => $(id).addEventListener('input', e => {
                config.lineScale = parseFloat(e.target.value);
                syncUI();
              }));
              dom.radius.forEach(id => $(id).addEventListener('input', e => {
                config.sprayRadius = parseInt(e.target.value);
                syncUI();
              }));
              dom.density.forEach(id => $(id).addEventListener('input', e => {
                config.dotsPerTick = parseInt(e.target.value);
                syncUI();
              }));
              dom.speed.forEach(id => $(id).addEventListener('input', e => {
                config.speedFactor = parseFloat(e.target.value);
                syncUI();
              }));

              dom.reset.forEach(id => $(id).addEventListener('click', () => {
                paintedPixels.clear();
                Object.keys(dripMap).forEach(k => delete dripMap[k]);
                config.paintLeft = config.paintMax;
                lastSprayPos = null;
                lastSprayTime = null;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                syncUI();
              }));

              dom.bg.forEach(id => $(id).addEventListener('change', e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                const img = new Image();
                img.onload = () => {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  URL.revokeObjectURL(url);
                };
                img.src = url;
              }));

              $(dom.burger)?.addEventListener('click', () => {
                $(dom.burger).classList.toggle('open');
                $(dom.panel).classList.toggle('open');
              });

              // Init
              syncUI();
            })();
          `,
        }}
      />
    </div>
  );
}
