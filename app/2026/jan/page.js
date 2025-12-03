// app/2026/jan/page.js
'use client';

export default function January2026() {
  return (
    <div style={{
      fontFamily: 'sans-serif',
      background: '#111',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <div style={{
        padding: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #444'
      }}>
        <h1>🎨 StreetWall Art — January 2026</h1>
        <div>Paint: <span id="paintLeft">10000</span> px</div>
      </div>

      {/* Сцена */}
      <div id="scene" style={{
        position: 'relative',
        height: 'calc(100vh - 70px)',
        overflow: 'hidden'
      }}>
        <div id="sky" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '187px',
          background: 'linear-gradient(to bottom, #1a3a6e, #2c5aa0)'
        }}></div>

        <div id="wall-container" style={{
          position: 'absolute',
          top: '187px',
          left: 0,
          width: '100%',
          height: '626px',
          overflowX: 'auto',
          border: '1px solid #444'
        }}>
          <canvas id="wall" width="45625" height="1000" style={{ background: '#8a8a8a' }}></canvas>
        </div>

        <div id="ground" style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '187px',
          background: 'linear-gradient(to top, #2d2d2d, #3a3a3a)'
        }}></div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Простой spray tool на чистом Canvas (без fabric.js)
            const canvas = document.getElementById('wall');
            const ctx = canvas.getContext('2d');
            const paintLeftEl = document.getElementById('paintLeft');
            let paintLeft = 10000;
            let isDrawing = false;

            canvas.addEventListener('mousedown', () => {
              isDrawing = true;
            });
            canvas.addEventListener('mouseup', () => {
              isDrawing = false;
            });
            canvas.addEventListener('mousemove', (e) => {
              if (!isDrawing || paintLeft <= 0) return;
              
              const rect = canvas.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;

              // Рисуем 10 точек за раз (spray effect)
              for (let i = 0; i < 10; i++) {
                const dx = (Math.random() - 0.5) * 20;
                const dy = (Math.random() - 0.5) * 20;
                const size = 1 + Math.random() * 2;
                
                ctx.fillStyle = '#ff3366';
                ctx.beginPath();
                ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
                ctx.fill();

                paintLeft--;
                if (paintLeft <= 0) {
                  isDrawing = false;
                  alert('🎨 Баллончик закончился!');
                }
              }
              paintLeftEl.textContent = paintLeft;
            });
          `
        }}
      />
    </div>
  );
}
