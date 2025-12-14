// app/page.js
export default function HomePage() {
  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden', width: '100vw', height: '100vh' }}>
      {/* Vanilla JS Spray Prototype — embedded */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // === CONFIG ===
              const config = {
                maxPaint: 10000,
                paintLeft: 10000,
                color: '#ff3366',
                sprayRadius: 20,
                dotsPerTick: 30,
                dripThreshold: 12,
                dripFactor: 5,
              };

              // === STATE ===
              let isDrawing = false;
              let lastX = 0;
              let lastY = 0;
              const paintedPixels = new Set();
              const dripMap = {};

              // === CANVAS SETUP ===
              const canvas = document.createElement('canvas');
              canvas.id = 'sprayWall';
              canvas.style.display = 'block';
              canvas.style.width = '100%';
              canvas.style.height = '100%';
              canvas.style.cursor = 'crosshair';
              canvas.style.touchAction = 'none';
              document.body.appendChild(canvas);

              const dpr = window.devicePixelRatio || 1;
              const resize = () => {
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                const ctx = canvas.getContext('2d');
                ctx.scale(dpr, dpr);
                ctx.fillStyle = '#111';
                ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
              };
              resize();
              window.addEventListener('resize', resize);

              const ctx = canvas.getContext('2d');
              if (!ctx) return;

              // === UTILS ===
              const getRandom = (min, max) => Math.random() * (max - min) + min;

              const getCoords = (e) => {
                const rect = canvas.getBoundingClientRect();
                let clientX = e.clientX || (e.touches?.[0]?.clientX || 0);
                let clientY = e.clientY || (e.touches?.[0]?.clientY || 0);
                return {
                  x: (clientX - rect.left) * (canvas.width / rect.width) / dpr,
                  y: (clientY - rect.top) * (canvas.height / rect.height) / dpr,
                };
              };

              // === SPRAY LOGIC ===
              const sprayAt = (x, y) => {
                if (config.paintLeft <= 0) return;

                for (let i = 0; i < config.dotsPerTick; i++) {
                  const angle = Math.random() * 2 * Math.PI;
                  const dist = Math.random() * config.sprayRadius;
                  const dx = Math.cos(angle) * dist;
                  const dy = Math.sin(angle) * dist;
                  const size = getRandom(1.0, 2.2);

                  ctx.globalAlpha = getRandom(0.15, 0.5);
                  ctx.fillStyle = config.color;
                  ctx.beginPath();
                  ctx.arc(x + dx, y + dy, size, 0, Math.PI * 2);
                  ctx.fill();

                  // Подтёки
                  const px = Math.round(x + dx);
                  const py = Math.round(y + dy);
                  const cellKey = \`\${px}_\${py}\`;
                  dripMap[cellKey] = (dripMap[cellKey] || 0) + 1;
                  const drops = dripMap[cellKey];

                  const threshold = Math.max(10, 14 * 1.0);
                  if (drops > threshold && drops % 3 === 0) {
                    const dripLen = Math.min(250, Math.sqrt(drops - threshold) * 4 + getRandom(-1, 2));
                    ctx.save();
                    ctx.globalAlpha = 0.12 + Math.random() * 0.01;
                    ctx.strokeStyle = config.color;
                    ctx.lineWidth = 1 + Math.random() * 2;
                    ctx.beginPath();
                    ctx.moveTo(px + getRandom(-1, 1), py + config.sprayRadius / 2);
                    ctx.lineTo(px + getRandom(-1, 1), py + config.sprayRadius / 2 + dripLen);
                    ctx.stroke();
                    ctx.restore();
                  }

                  // Расход краски
                  const key = \`\${px}_\${py}\`;
                  if (!paintedPixels.has(key)) {
                    paintedPixels.add(key);
                    config.paintLeft--;
                    if (config.paintLeft <= 0) isDrawing = false;
                  }
                }
                ctx.globalAlpha = 1.0;
              };

              // === EVENTS ===
              const handleStart = (e) => {
                if (config.paintLeft <= 0) return;
                e.preventDefault();
                const { x, y } = getCoords(e);
                isDrawing = true;
                lastX = x;
                lastY = y;
                sprayAt(x, y);
                console.log('✅ pointerdown:', x.toFixed(1), y.toFixed(1));
              };

              const handleMove = (e) => {
                if (!isDrawing || config.paintLeft <= 0) return;
                e.preventDefault();
                const { x, y } = getCoords(e);
                const dx = x - lastX;
                const dy = y - lastY;
                const dist = Math.hypot(dx, dy);
                const steps = Math.max(1, Math.floor(dist / 4));
                for (let i = 1; i <= steps; i++) {
                  const nx = lastX + (dx * i) / steps;
                  const ny = lastY + (dy * i) / steps;
                  sprayAt(nx, ny);
                }
                lastX = x;
                lastY = y;
                console.log('🖱️ pointermove:', x.toFixed(1), y.toFixed(1));
              };

              const handleEnd = () => {
                isDrawing = false;
                console.log('⏹️ pointerup');
              };

              // Подписки
              canvas.addEventListener('pointerdown', handleStart);
              canvas.addEventListener('pointermove', handleMove);
              canvas.addEventListener('pointerup', handleEnd);
              canvas.addEventListener('pointercancel', handleEnd);
              canvas.addEventListener('touchstart', handleStart, { passive: false });
              canvas.addEventListener('touchmove', handleMove, { passive: false });
              canvas.addEventListener('touchend', handleEnd);

              // Инициализация фона
              ctx.fillStyle = '#111';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            })();
          `,
        }}
      />
    </div>
  );
}
