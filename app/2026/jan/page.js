// app/2026/jan/page.js
export default function January2026() {
  return (
    <div style={{ margin: 0, padding: 0, background: '#000' }}>
      {/* UI-панель (React) */}
      <div style={{ padding: '20px', color: '#fff' }}>
        <h1>🎨 January 2026 — StreetWall Art</h1>
        <p>3000 × 1000 px · 45 625 px total by Dec 31</p>
        <a
          href="https://t.me/streetwallart"
          target="_blank"
          style={{ color: '#ff3366' }}
        >
          🔔 Notify Me
        </a>
      </div>

      {/* Canvas (Vanilla JS) */}
      <div style={{ maxWidth: '100vw', overflow: 'hidden' }}>
        <canvas
          id="spray-wall"
          width="3000"
          height="1000"
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            background: '#111',
            touchAction: 'none',
          }}
        ></canvas>
      </div>

      {/* Рабочий JS-код — инлайн */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const canvas = document.getElementById('spray-wall');
              if (!canvas) return;

              const ctx = canvas.getContext('2d');
              const dpr = window.devicePixelRatio || 1;
              
              // Адаптация под retina
              const rect = canvas.getBoundingClientRect();
              canvas.width = rect.width * dpr;
              canvas.height = rect.height * dpr;
              ctx.scale(dpr, dpr);

              // Конфиг
              const config = {
                paintLeft: 10000,
                color: '#ff3366',
                radius: 20,
                density: 30
              };

              let isDrawing = false;
              const painted = new Set();

              function getPos(e) {
                const rect = canvas.getBoundingClientRect();
                const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
                const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;
                return { x: x * dpr, y: y * dpr };
              }

              function spray(x, y) {
                if (config.paintLeft <= 0) return;
                for (let i = 0; i < config.density; i++) {
                  const a = Math.random() * 2 * Math.PI;
                  const r = Math.random() * config.radius;
                  const dx = Math.cos(a) * r;
                  const dy = Math.sin(a) * r;
                  const size = 1 + Math.random() * 2;

                  ctx.fillStyle = config.color;
                  ctx.globalAlpha = 0.2 + Math.random() * 0.3;
                  ctx.beginPath();
                  ctx.arc(x + dx, y + dy, size, 0, Math.PI * 2);
                  ctx.fill();

                  const key = Math.round(x + dx) + ',' + Math.round(y + dy);
                  if (!painted.has(key)) {
                    painted.add(key);
                    config.paintLeft--;
                  }
                }
                ctx.globalAlpha = 1;
              }

              // Events
              canvas.addEventListener('pointerdown', e => {
                e.preventDefault();
                isDrawing = true;
                const { x, y } = getPos(e);
                spray(x, y);
              });

              canvas.addEventListener('pointermove', e => {
                if (!isDrawing) return;
                e.preventDefault();
                const { x, y } = getPos(e);
                spray(x, y);
              });

              canvas.addEventListener('pointerup', () => isDrawing = false);
              canvas.addEventListener('pointercancel', () => isDrawing = false);

              // Touch
              canvas.addEventListener('touchstart', e => {
                e.preventDefault();
                isDrawing = true;
                const { x, y } = getPos(e);
                spray(x, y);
              }, { passive: false });

              canvas.addEventListener('touchmove', e => {
                if (!isDrawing) return;
                e.preventDefault();
                const { x, y } = getPos(e);
                spray(x, y);
              }, { passive: false });

              canvas.addEventListener('touchend', () => isDrawing = false);

              // Init bg
              ctx.fillStyle = '#111';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
            })();
          `,
        }}
      />
    </div>
  );
}
