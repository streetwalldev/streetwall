// app/2026/jan/page.js
'use client';

export default function January2026Page() {
  return (
    <div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            body { background: #222; margin: 0; min-height: 100vh; font-family: system-ui, sans-serif; }
            #main-ui {
              position: relative;
              width: 100vw;
              max-width: 900px;
              margin: 20px auto;
              z-index: 10;
              color: #fff;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 14px;
            }
            .controls-row {
              display: flex;
              gap: 18px;
              align-items: center;
              flex-wrap: wrap;
              background: rgba(40, 40, 40, 0.93);
              border-radius: 9px;
              padding: 12px 18px;
              margin-bottom: 6px;
              width: 100%;
              box-sizing: border-box;
            }
            label {
              font-size: 1rem;
              margin-right: 5px;
              display: flex;
              align-items: center;
              gap: 6px;
            }
            input[type="range"] {
              width: 100px;
            }
            #paintLeft {
              font-weight: bold;
            }
            #canvas-wrap {
              position: relative;
              width: 100%;
              max-width: 900px;
            }
            #canvas {
              position: relative;
              z-index: 2;
              display: block;
              width: 100%;
              height: auto;
              border-radius: 8px;
              border: 2px solid #fff;
              background: #111;
            }
            @media (max-width: 700px) {
              #main-ui {
                max-width: none;
                padding: 0 16px;
              }
              #canvas-wrap {
                max-width: none;
              }
              .controls-row {
                flex-direction: column;
                align-items: flex-start;
              }
            }
          `,
        }}
      />

      <div id="main-ui">
        <div className="controls-row" id="controls">
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
          <canvas id="canvas"></canvas>
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // ——— Настройки ———
            let config = {
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

            // Адаптивный размер canvas
            function resizeCanvas() {
              const maxWidth = Math.min(window.innerWidth - 32, 900);
              const w = maxWidth;
              const h = Math.max(280, Math.min(window.innerHeight - 140, w * 0.75));
              canvas.width = w;
              canvas.height = h;
            }

            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();

            // ——— UI обновление ———
            const colorPicker = document.getElementById('colorPicker');
            const radiusRange = document.getElementById('radiusRange');
            const densityRange = document.getElementById('densityRange');
            const radiusVal = document.getElementById('radiusVal');
            const densityVal = document.getElementById('densityVal');
            const paintLeftEl = document.getElementById('paintLeft');
            const bgImageInput = document.getElementById('bgImageInput');
            const resetBtn = document.getElementById('resetBtn');

            colorPicker.addEventListener('input', (e) => {
              config.color = e.target.value;
            });
            radiusRange.addEventListener('input', (e) => {
              config.radius = +e.target.value;
              radiusVal.textContent = config.radius;
            });
            densityRange.addEventListener('input', (e) => {
              config.density = +e.target.value;
              densityVal.textContent = config.density;
            });

            // Загрузка фона
            bgImageInput.addEventListener('change', (e) => {
              const file = e.target.files[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              const img = new Image();
              img.onload = () => {
                config.bgImage = img;
                redraw();
              };
              img.src = url;
            });

            // Очистка
            resetBtn.addEventListener('click', () => {
              config.bgImage = null;
              paintedPixels.clear();
              config.paintLeft = config.paintMax;
              paintLeftEl.textContent = config.paintLeft;
              redraw();
            });

            // ——— Отрисовка ———
            function redraw() {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              if (config.bgImage) {
                ctx.drawImage(config.bgImage, 0, 0, canvas.width, canvas.height);
              }
            }

            // ——— Spray ———
            function sprayAt(x, y) {
              if (config.paintLeft <= 0) return;

              for (let i = 0; i < config.density; i++) {
                if (config.paintLeft <= 0) break;

                const angle = Math.random() * 2 * Math.PI;
                const dist = Math.random() * config.radius;
                const dx = Math.cos(angle) * dist;
                const dy = Math.sin(angle) * dist;
                const size =
                  config.dotSize[0] + Math.random() * (config.dotSize[1] - config.dotSize[0]);

                // Рисуем точку
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

            // Координаты курсора
            function getCanvasCoords(e) {
              const rect = canvas.getBoundingClientRect();
              let clientX, clientY;
              if (e.touches && e.touches.length > 0) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
              } else {
                clientX = e.clientX;
                clientY = e.clientY;
              }
              const x = ((clientX - rect.left) / rect.width) * canvas.width;
              const y = ((clientY - rect.top) / rect.height) * canvas.height;
              return { x, y };
            }

            // Обработчики
            canvas.addEventListener('pointerdown', (e) => {
              e.preventDefault();
              isDrawing = true;
              const { x, y } = getCanvasCoords(e);
              sprayAt(x, y);
            });

            canvas.addEventListener('pointermove', (e) => {
              if (!isDrawing) return;
              e.preventDefault();
              const { x, y } = getCanvasCoords(e);
              sprayAt(x, y);
            });

            window.addEventListener('pointerup', () => {
              isDrawing = false;
            });

            // Инициализация UI
            radiusVal.textContent = config.radius;
            densityVal.textContent = config.density;
            paintLeftEl.textContent = config.paintLeft;
          `,
        }}
      />
    </div>
  );
}
