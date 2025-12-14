// app/page.js
export default function HomePage() {
  return (
    <div style={{ margin: 0, padding: 0, background: '#222', minHeight: '100vh' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* === ГЛОБАЛЬНЫЕ СТИЛИ ===
             * — Универсальные настройки шрифтов, отступов, цветов
             * — Адаптивность, защита от выделения текста и тап-бликов на iOS
             * — Курсор-бургер для мобильных устройств */
            body { 
              font-family: system-ui, sans-serif; 
              margin: 0; 
              padding: 0; 
              overflow: hidden; /* блокируем скролл при работе с canvas */
            }
            canvas { 
              display: block; 
              background: #111; 
              cursor: crosshair; 
              touch-action: none; /* критично для trackpad/сенсора */
              -webkit-tap-highlight-color: transparent; 
              user-select: none; 
            }

            /* === ВИЗУАЛЬНЫЙ ЭЛЕМЕНТ: БУРГЕР-МЕНЮ ===
             * — Иконка в левом верхнем углу (даже поверх canvas)
             * — Анимация: 3 полоски → крестик при открытии */
            #burger {
              position: fixed;
              top: 16px;
              left: 16px;
              width: 32px;
              height: 24px;
              z-index: 1000;
              cursor: pointer;
              padding: 8px;
            }
            .bar {
              display: block;
              width: 100%;
              height: 3px;
              background: #fff;
              margin: 4px 0;
              transition: 0.3s;
              border-radius: 2px;
            }
            #burger.open .bar:nth-child(1) { transform: rotate(45deg) translate(6px, 6px); }
            #burger.open .bar:nth-child(2) { opacity: 0; }
            #burger.open .bar:nth-child(3) { transform: rotate(-45deg) translate(6px, -6px); }

            /* === ПАНЕЛЬ УПРАВЛЕНИЯ (СВОРАЧИВАЕМАЯ) ===
             * — Появляется поверх canvas при клике на бургер
             * — Полупрозрачный фон, плавное появление/скрытие
             * — Адаптивная ширина: 300px на десктопе, 100% на мобильных */
            #controls-panel {
              position: fixed;
              top: 0;
              right: -320px; /* изначально скрыта за правым краем */
              width: 300px;
              height: 100vh;
              background: rgba(30, 30, 30, 0.95);
              border-left: 1px solid #444;
              padding: 20px;
              color: #eee;
              z-index: 999;
              overflow-y: auto;
              transition: right 0.3s ease;
            }
            #controls-panel.open {
              right: 0; /* выезжает в зону видимости */
            }
            .control-group {
              margin-bottom: 16px;
            }
            label {
              display: block;
              margin-bottom: 6px;
              font-size: 0.95em;
            }
            input[type="range"] {
              width: 100%;
            }
            button {
              padding: 8px 16px;
              background: #333;
              color: #fff;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
            }
            button:hover { background: #444; }

            /* === ВЕРСИЯ ПРОТОТИПА (правый нижний угол) ===
             * — Малозаметная, но доступная для разработчиков и тестеров
             * — Полупрозрачная, не мешает работе */
            #version {
              position: fixed;
              bottom: 10px;
              right: 10px;
              font-size: 0.7rem;
              opacity: 0.5;
              color: #888;
              z-index: 100;
              pointer-events: none;
            }

            /* === АДАПТИВНОСТЬ ===
             * — На узких экранах (<600px) панель управления растягивается на всю ширину */
            @media (max-width: 600px) {
              #controls-panel {
                width: 100%;
                right: -100%;
              }
              #controls-panel.open {
                right: 0;
              }
            }
          `,
        }}
      />

      {/* === КОРНЕВОЙ КОНТЕЙНЕР === 
       * — Занимает всю высоту и ширину окна
       * — Содержит только canvas (никаких обёрток, мешающих full-screen) */}
      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <canvas id="sprayCanvas" width="1024" height="1024"></canvas>

        {/* === ИКОНКА БУРГЕР-МЕНЮ === 
         * — Поверх canvas, фиксированная позиция
         * — Управляет показом/скрытием панели управления */}
        <div id="burger">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* === ПАНЕЛЬ УПРАВЛЕНИЯ (изначально скрыта) === */}
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

        {/* === ВЕРСИЯ ПРОТОТИПА === */}
        <div id="version">v1.2.64.47</div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // === ГЛОБАЛЬНЫЕ НАСТРОЙКИ ПРОТОТИПА ===
              // — Базовые параметры: размер балончика, скорости, цвета
              // — Используются во всех частях логики: spray, drip, расход
              const config = {
                sprayRadius: 30,        // базовый радиус облака спрея (px)
                dotsPerTick: 556,       // плотность: сколько точек за один вызов sprayAte
                speedFactor: 7,         // коэффициент нормализации скорости движения курсора
                lineScale: 1.0,         // масштаб: 1.0 = полный размер, 0.5 = в 2 раза мельче
                paintMax: 2000000,      // максимальный объём краски (px)
                paintLeft: 2000000,     // текущий остаток краски
                currentColor: '#2222ff' // текущий цвет балончика
              };

              // === СОСТОЯНИЕ СИСТЕМЫ ===
              // — Переменные, изменяющиеся во время работы
              // — Не сохраняются при перезагрузке (пока не добавим localStorage)
              let isDrawing = false;
              let lastSprayPos = null;
              let lastSprayTime = null;
              const paintedPixels = new Set(); // уникальные пиксели — для точного учёта расхода
              const dripMap = {};             // счётчики "попаданий" по ячейкам — для подтёков
              let bgImage = null;             // фоновое изображение (опционально)

              // === ИНИЦИАЛИЗАЦИЯ DOM-ЭЛЕМЕНТОВ ===
              // — Кэшируем ссылки на элементы для быстрого доступа
              // — Избегаем повторных вызовов document.getElementById в hot-path
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
              const controlsPanel = document.getElementById('controls-panel');

              // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
              // — Утилиты: генерация случайных чисел, преобразование координат
              function getRandomInt(a, b) {
                return Math.random() * (b - a) + a;
              }

              // УНИВЕРСАЛЬНОЕ ПОЛУЧЕНИЕ КООРДИНАТ
              // — Работает и с мышью, и с тач-событиями
              // — Учитывает масштабирование (devicePixelRatio) и размер canvas'а
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

              // ОТРИСОВКА ФОНА ИЛИ ЧИСТОГО ХОЛСТА
              function redraw() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (bgImage) {
                  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
                }
              }

              // === ОСНОВНАЯ ЛОГИКА РАСПЫЛЕНИЯ ===
              // — Создаёт эффект аэрозольного балончика:
              //   • облако случайных точек вокруг курсора
              //   • зависимость от скорости (быстро = тонко и прозрачно)
              //   • подтёки при многократном попадании в одну зону
              //   • точный учёт расхода краски по уникальным пикселям
              function sprayAt(x, y) {
                if (config.paintLeft <= 0) return;

                // РАСЧЁТ СКОРОСТИ ДВИЖЕНИЯ
                // — Используется для динамической настройки параметров
                const now = performance.now();
                let speed = 0;
                if (lastSprayPos && lastSprayTime !== null) {
                  const dt = now - lastSprayTime;
                  const dist = Math.hypot(x - lastSprayPos.x, y - lastSprayPos.y);
                  speed = dist / (dt || 1);
                  speed = Math.min(1, speed / config.speedFactor);
                }

                // ПАРАМЕТРЫ, ЗАВИСЯЩИЕ ОТ СКОРОСТИ И МАСШТАБА
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

                // ОСНОВНОЙ ЦИКЛ: ОТРИСОВКА ТОЧЕК
                for (let i = 0; i < config.dotsPerTick; i++) {
                  const angle = Math.random() * 2 * Math.PI;
                  const r = Math.random() * radiusFromSpeed;
                  const dx = Math.cos(angle) * r;
                  const dy = Math.sin(angle) * r;
                  const size = getRandomInt(dotFromSpeed * 0.85, dotFromSpeed);

                  // ОТРИСОВКА СЛУЧАЙНОЙ ТОЧКИ
                  ctx.globalAlpha = alphaFromSpeed * (0.8 + Math.random() * 0.3);
                  ctx.fillStyle = config.currentColor;
                  ctx.beginPath();
                  ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
                  ctx.fill();

                  // === ПОДТЁКИ ===
                  // — При многократном "напылении" в одну зону формируется струйка вниз
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

                  // === РАСХОД КРАСКИ ===
                  // — Учитываются ТОЛЬКО уникальные пиксели (чтобы перекрытие не тратило краску повторно)
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

                // СБРОС ГЛОБАЛЬНОЙ ПРОЗРАЧНОСТИ
                ctx.globalAlpha = 1;
                lastSprayPos = { x, y };
                lastSprayTime = now;
              }

              // === ОБРАБОТЧИКИ СОБЫТИЙ ===
              // — Единая логика для мыши и тач-экранов
              // — Обязательно: e.preventDefault() + { passive: false } для touch
              function handleStart(e) {
                if (config.paintLeft <= 0) return;
                e.preventDefault();
                const { x, y } = getCanvasCoords(e);
                isDrawing = true;
                sprayAt(x, y);
              }

              function handleMove(e) {
                if (!isDrawing || config.paintLeft <= 0) return;
                e.preventDefault();
                const { x, y } = getCanvasCoords(e);
                // Интерполяция для плавных линий при быстром движении
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

              // === ПОДПИСКА НА СОБЫТИЯ ===
              // — Все canvas-события с { passive: false } для touch
              canvas.addEventListener('pointerdown', handleStart);
              canvas.addEventListener('pointermove', handleMove);
              canvas.addEventListener('pointerup', handleEnd);
              canvas.addEventListener('pointercancel', handleEnd);

              canvas.addEventListener('touchstart', handleStart, { passive: false });
              canvas.addEventListener('touchmove', handleMove, { passive: false });
              canvas.addEventListener('touchend', handleEnd, { passive: false });

              // === UI-ЛОГИКА ===
              // — Обновление значений при изменении ползунков
              // — Сброс холста
              // — Загрузка фонового изображения
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

              // === УПРАВЛЕНИЕ ПАНЕЛЬЮ (бургер-меню) ===
              burger.addEventListener('click', () => {
                burger.classList.toggle('open');
                controlsPanel.classList.toggle('open');
              });

              // === ИНИЦИАЛИЗАЦИЯ ===
              // — Настройка размера canvas под экран
              // — Очистка фона
              // — Обновление UI-значений
              const dpr = window.devicePixelRatio || 1;
              canvas.width = window.innerWidth * dpr;
              canvas.height = window.innerHeight * dpr;
              canvas.style.width = '100%';
              canvas.style.height = '100%';
              ctx.scale(dpr, dpr);

              ctx.fillStyle = '#111';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

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
