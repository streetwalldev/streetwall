// app/page.js
export default function HomePage() {
  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      background: '#222',
      color: '#fff',
      minHeight: '100vh',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #main-ui {
              max-width: 900px;
              margin: 0 auto 20px;
              display: flex;
              flex-wrap: wrap;
              gap: 16px;
              align-items: center;
              background: rgba(40, 40, 40, 0.9);
              padding: 16px;
              border-radius: 8px;
            }
            label {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              gap: 8px;
              font-size: 0.95em;
            }
            input[type="range"] {
              width: 100px;
            }
            button {
              background: #ff3c00;
              color: white;
              border: none;
              border-radius: 6px;
              padding: 8px 16px;
              font-weight: bold;
              cursor: pointer;
            }
            button:hover { opacity: 0.9; }
            #canvas-wrap {
              display: block;
              margin: 0 auto;
              width: 800px;
              height: 600px;
            }
            #canvas {
              display: block;
              width: 800px;
              height: 600px;
              border: 2px solid #fff;
              background: #111;
            }
            @media (max-width: 820px) {
              #canvas-wrap,
              #canvas {
                width: 800px !important;
                height: 600px !important;
              }
              body { overflow-x: auto; }
            }
          `,
        }}
      />

      <div id="main-ui">
        <label>
          Цвет:
          <input type="color" id="colorPicker" value="#ff3c00" />
        </label>
        <label>
          Размер кисти:
          <input type="range" id="radiusRange" min="5" max="80" value="30" />
          <span id="radiusVal">30</span>
        </label>
        <label>
          Плотность:
          <input type="range" id="densityRange" min="50" max="1200" value="556" />
          <span id="densityVal">556</span>
        </label>
        <label>
          Подложка:
          <input type="file" id="bgImageInput" accept="image/*" />
        </label>
        <button id="resetBtn">Очистить</button>
        <span>Осталось краски: <span id="paintLeft">2000000</span></span>
      </div>

      <div id="canvas-wrap">
        <canvas id="canvas" width="800" height="600"></canvas>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Настройки
            const config = {
              paintMax: 2000000,
              paintLeft: 2000000,
              radius: 30,
              density: 556,
              color: '#ff3c00',
              dotSize: [0.8, 1.1],
              bgImage: null
            };

            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');
            let isDrawing = false;
            let paintedPixels = new Set();

            // UI
            const colorPicker = document.getElementById('colorPicker');
            const radiusRange = document.getElementById('radiusRange');
            const densityRange = document.getElementById('densityRange');
            const radiusVal = document.getElementById('radiusVal');
            const densityVal = document.getElementById('densityVal');
            const paintLeftEl = document.getElementById('paintLeft');
            const bgImageInput = document.getElementById('bgImageInput');
            const resetBtn = document.getElementById('resetBtn');

            colorPicker.addEventListener('input', e => config.color = e.target.value);
            radiusRange.addEventListener('input', e => {
              config.radius = +e.target.value;
              radiusVal.textContent = config.radius;
            });
            densityRange.addEventListener('input', e => {
              config.density = +e.target.value;
              densityVal.textContent = config.density;
            });

            bgImageInput.addEventListener('change', e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              const img = new Image();
              img.onload = () => {
                config.bgImage = img;
                redraw();
              };
              img.src = url;
            });

            resetBtn.addEventListener('click', () => {
              config.bgImage = null;
              paintedPixels.clear();
              config.paintLeft = config.paintMax;
              paintLeftEl.textContent = config.paintLeft;
              redraw();
            });

            // Перерисовка
            function redraw() {
              ctx.clearRect(0, 0, 800, 600);
              if (config.bgImage) {
                ctx.drawImage(config.bgImage, 0, 0, 800, 600);
              }
            }

            // Spray
            function sprayAt(x, y) {
              if (config.paintLeft <= 0) return;

              for (let i = 0; i < config.density; i++) {
                if (config.paintLeft <= 0) break;

                const angle = Math.random() * 2 * Math.PI;
                const dist = Math.random() * config.radius;
                const dx = Math.cos(angle) * dist;
                const dy = Math.sin(angle) * dist;
                const size = config.dotSize[0] + Math.random() * (config.dotSize[1] - config.dotSize[0]);

                ctx.globalAlpha = Math.random() * (0.6 - 0.12) + 0.12;
                ctx.fillStyle = config.color;
                ctx.beginPath();
                ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
                ctx.fill();

                // Учёт уникальных пикселей
                const px = Math.round(x + dx);
                const py = Math.round(y + dy);
                const key = px + ',' + py;
                if (!paintedPixels.has(key)) {
                  paintedPixels.add(key);
                  config.paintLeft--;
                }
              }

              paintLeftEl.textContent = config.paintLeft;
            }

            // Координаты
            function getCanvasCoords(e) {
              const rect = canvas.getBoundingClientRect();
              let clientX = e.clientX, clientY = e.clientY;
              if (e.touches?.length) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
              }
              return {
                x: clientX - rect.left,
                y: clientY - rect.top
              };
            }

            // Обработчики
            canvas.addEventListener('pointerdown', e => {
              e.preventDefault();
              isDrawing = true;
              const { x, y } = getCanvasCoords(e);
              sprayAt(x, y);
            });

            canvas.addEventListener('pointermove', e => {
              if (!isDrawing) return;
              e.preventDefault();
              const { x, y } = getCanvasCoords(e);
              sprayAt(x, y);
            });

            window.addEventListener('pointerup', () => {
              isDrawing = false;
            });

            // Инициализация
            radiusVal.textContent = config.radius;
            densityVal.textContent = config.density;
            paintLeftEl.textContent = config.paintLeft;
          `,
        }}
      />
    </div>
  );
}
