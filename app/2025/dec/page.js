// app/2025/dec/page.js
'use client';

export default function January2026Page() {
  return (
    <html lang="ru">
      <head>
        <meta charSet="UTF-8" />
        <title>StreetWall Art — January 2026</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body { background: #222; margin: 0; height: 100vh; overflow: hidden; }
              #ui { position: absolute; top: 20px; left: 20px; z-index: 10; color: #fff; }
              #paintLeft { font-weight: bold; }
              canvas { border: 2px solid #fff; background: #333; cursor: crosshair; display: block; margin: 0 auto; }
            `,
          }}
        />
      </head>
      <body>
        <div id="ui">
          Цвет:
          <input type="color" id="colorPicker" value="#ff3c00" />
          Осталось краски: <span id="paintLeft">5000</span>
          <button onclick="resetCanvas()">Очистить</button>
        </div>
        <canvas id="canvas" width="800" height="600"></canvas>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              const canvas = document.getElementById('canvas');
              const ctx = canvas.getContext('2d');
              const colorPicker = document.getElementById('colorPicker');
              const paintLeftSpan = document.getElementById('paintLeft');

              let sprayRadius = 30;
              let dotSize = [0.8, 1.1];
              let dotsPerTick = 556;
              let paintMax = 2000000;
              let paintLeft = paintMax;

              let currentColor = colorPicker.value;
              let drawing = false;
              let lastSprayPos = null;
              let lastSprayTime = null;
              let paintedPixels = new Set();

              function getRandomInt(a, b) {
                return Math.random() * (b - a) + a;
              }

              function resetCanvas() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                paintLeft = paintMax;
                paintedPixels.clear();
                paintLeftSpan.textContent = paintLeft;
              }

              function stopDrawing() {
                drawing = false;
                lastSprayPos = null;
                lastSprayTime = null;
              }

              colorPicker.addEventListener('input', function() {
                currentColor = this.value;
              });

              function sprayAt(x, y) {
                let now = performance.now();
                let speed = 0;
                if (lastSprayPos && lastSprayTime !== null) {
                  let dt = now - lastSprayTime;
                  let dist = Math.hypot(x - lastSprayPos.x, y - lastSprayPos.y);
                  speed = dist / (dt || 1);
                  speed = Math.min(1, speed / 7);
                }

                let minDot = dotSize[0], maxDot = dotSize[1];
                let dotMin = Math.max(1, minDot * 0.7);
                let dotMax = maxDot;
                let dotFromSpeed = dotMax - (dotMax - dotMin) * speed;

                let minRadius = sprayRadius * 0.7;
                let maxRadius = sprayRadius * 3;
                let radiusFromSpeed = minRadius + (maxRadius - minRadius) * speed;

                let minAlpha = 0.12, maxAlpha = 0.6;
                let alphaFromSpeed = maxAlpha - (maxAlpha - minAlpha) * speed;

                for (let i = 0; i < dotsPerTick; i++) {
                  let angle = Math.random() * 2 * Math.PI;
                  let r = Math.random() * radiusFromSpeed;
                  let dx = Math.cos(angle) * r;
                  let dy = Math.sin(angle) * r;
                  let size = getRandomInt(dotFromSpeed * 0.85, dotFromSpeed);

                  ctx.globalAlpha = alphaFromSpeed * (0.8 + Math.random() * 0.3);
                  ctx.fillStyle = currentColor;
                  ctx.beginPath();
                  ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
                  ctx.fill();

                  // --- Подтеки ---
                  let cellX = Math.round(x + dx);
                  let cellY = Math.round(y + dy);
                  let cellKey = cellX + "_" + cellY;
                  if (!sprayAt.dripMap) sprayAt.dripMap = {};
                  let dripMap = sprayAt.dripMap;
                  dripMap[cellKey] = (dripMap[cellKey] || 0) + 1;

                  let drops = dripMap[cellKey];
                  if (drops > 15 && drops % 3 === 0) {
                    let maxDripLen = 30;
                    let dripLen = Math.min(maxDripLen, Math.sqrt(drops - 14) * 4 + getRandomInt(-1,2));
                    ctx.save();
                    ctx.globalAlpha = 0.13 + Math.random()*0.07;
                    ctx.strokeStyle = currentColor;
                    ctx.lineWidth = size * getRandomInt(0.7,1.5);
                    ctx.beginPath();
                    ctx.moveTo(cellX + getRandomInt(-1,1), cellY + size/2);
                    ctx.lineTo(cellX + getRandomInt(-1,1), cellY + size/2 + dripLen);
                    ctx.stroke();
                    ctx.restore();
                  }

                  let px = Math.round(x + dx);
                  let py = Math.round(y + dy);
                  let key = px + "_" + py;
                  if (!paintedPixels.has(key)) {
                    paintedPixels.add(key);
                    paintLeft--;
                    if (paintLeft <= 0) stopDrawing();
                  }
                }
                ctx.globalAlpha = 1;
                paintLeftSpan.textContent = Math.max(0, paintLeft);
                lastSprayPos = {x, y};
                lastSprayTime = now;
              }

              canvas.addEventListener('mousedown', function(e){
                if (paintLeft <= 0) return;
                drawing = true;
                lastSprayPos = null;
                lastSprayTime = null;
              });
              canvas.addEventListener('mouseup', stopDrawing);
              canvas.addEventListener('mouseleave', stopDrawing);

              canvas.addEventListener('mousemove', function(e){
                if (!drawing || paintLeft <= 0) return;
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                sprayAt(x, y);
              });

              canvas.addEventListener('touchstart', function(e){
                if (paintLeft <= 0) return;
                drawing = true;
                lastSprayPos = null;
                lastSprayTime = null;
              });
              canvas.addEventListener('touchend', stopDrawing);
              canvas.addEventListener('touchcancel', stopDrawing);

              canvas.addEventListener('touchmove', function(e){
                if (!drawing || paintLeft <= 0) return;
                const rect = canvas.getBoundingClientRect();
                const t = e.touches[0];
                const x = t.clientX - rect.left;
                const y = t.clientY - rect.top;
                sprayAt(x, y);
                e.preventDefault();
              }, {passive:false});

              resetCanvas();
            `,
          }}
        />
      </body>
    </html>
  );
}
