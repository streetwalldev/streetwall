'use client';

import { useRef, useEffect } from 'react';

export default function SprayCanvasPage() {
  const canvasRef = useRef(null);
  const paintLeftSpanRef = useRef(null);

  // --- State refs ---
  const configRef = useRef({
    sprayRadius: 30,
    dotsPerTick: 556,
    speedFactor: 7,
    lineScale: 1.0,
    paintMax: 2_000_000,
    paintLeft: 2_000_000,
    currentColor: '#2222ff',
  });

  const drawingRef = useRef(false);
  const lastSprayPosRef = useRef(null);
  const lastSprayTimeRef = useRef(null);
  const dripMapRef = useRef({});
  const mousePosRef = useRef({ x: null, y: null });

  // --- Utils ---
  function getRandomInt(a, b) {
    return Math.random() * (b - a) + a;
  }

  function getCanvasCoords(clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  // --- Spray logic ---
  function sprayAt(x, y, canvas, ctx) {
    if (!canvas || !ctx) return;
    if (configRef.current.paintLeft <= 0) return;

    const now = performance.now();
    let speed = 0;
    if (lastSprayPosRef.current && lastSprayTimeRef.current !== null) {
      const dt = now - lastSprayTimeRef.current;
      const dist = Math.hypot(x - lastSprayPosRef.current.x, y - lastSprayPosRef.current.y);
      speed = dist / (dt || 1);
      speed = Math.min(1, speed / configRef.current.speedFactor);
    }

    const scale = configRef.current.lineScale;
    const minDot = 0.7 * scale;
    const maxDot = 1.1 * scale;
    const dotFromSpeed = maxDot - (maxDot - minDot) * speed;

    const minRadius = configRef.current.sprayRadius * 0.7 * scale;
    const maxRadius = configRef.current.sprayRadius * 3 * scale;
    const radiusFromSpeed = minRadius + (maxRadius - minRadius) * speed;

    const minAlpha = 0.15;
    const maxAlpha = 0.55;
    const alphaFromSpeed = maxAlpha - (maxAlpha - minAlpha) * speed;

    let dotsDrawn = 0;
    for (let i = 0; i < configRef.current.dotsPerTick; i++) {
      if (configRef.current.paintLeft <= 0) break;
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.random() * radiusFromSpeed;
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;
      const size = getRandomInt(dotFromSpeed * 0.85, dotFromSpeed);

      ctx.globalAlpha = alphaFromSpeed * (0.8 + Math.random() * 0.3);
      ctx.fillStyle = configRef.current.currentColor;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
      ctx.fill();

      // Подтёки
      const cellX = Math.round(x + dx);
      const cellY = Math.round(y + dy);
      const cellKey = ${cellX}_${cellY};
      dripMapRef.current[cellKey] = (dripMapRef.current[cellKey] || 0) + 1;
      const drops = dripMapRef.current[cellKey];

      const threshold = Math.max(10, 14 * scale);
      if (drops > threshold && drops % 3 === 0) {
        const dripLen =
          Math.min(
            250 * scale,
            Math.sqrt(drops - threshold) * 4 * scale + getRandomInt(-1, 2)
          );
        ctx.save();
        ctx.globalAlpha = 0.12 + Math.random() * 0.01;
        ctx.strokeStyle = configRef.current.currentColor;
        ctx.lineWidth = size * getRandomInt(0.7, 1.5);
        ctx.beginPath();
        ctx.moveTo(cellX + getRandomInt(-1, 1), cellY + size / 2);
        ctx.lineTo(
          cellX + getRandomInt(-1, 1),


cellY + size / 2 + dripLen
        );
        ctx.stroke();
        ctx.restore();
      }

      dotsDrawn++;
      configRef.current.paintLeft--;
    }

    lastSprayPosRef.current = { x, y };
    lastSprayTimeRef.current = now;

    // Обновляем счетчик краски
    if (paintLeftSpanRef.current) {
      paintLeftSpanRef.current.textContent = configRef.current.paintLeft;
    }
  }

  // --- Drawing loop ---
  useEffect(() => {
    let animationFrameId;

    function tick() {
      if (drawingRef.current && mousePosRef.current.x !== null && mousePosRef.current.y !== null) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        sprayAt(mousePosRef.current.x, mousePosRef.current.y, canvas, ctx);
      }
      animationFrameId = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
    // eslint-disable-next-line
  }, []);

  // --- Mouse/touch event handlers ---
  function handlePointerDown(e) {
    drawingRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let coords;
    if (e.touches && e.touches.length > 0) {
      coords = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY, canvas);
    } else {
      coords = getCanvasCoords(e.clientX, e.clientY, canvas);
    }
    mousePosRef.current = coords;

    lastSprayPosRef.current = coords;
    lastSprayTimeRef.current = performance.now();

    // Для мобильных предотвратить скролл
    if (e.preventDefault) e.preventDefault();
  }

  function handlePointerMove(e) {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let coords;
    if (e.touches && e.touches.length > 0) {
      coords = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY, canvas);
    } else {
      coords = getCanvasCoords(e.clientX, e.clientY, canvas);
    }
    mousePosRef.current = coords;

    // Для мобильных предотвратить скролл
    if (e.preventDefault) e.preventDefault();
  }

  function handlePointerUp() {
    drawingRef.current = false;
    mousePosRef.current = { x: null, y: null };
    lastSprayPosRef.current = null;
    lastSprayTimeRef.current = null;
  }

  // --- Setup initial counter value on mount ---
  useEffect(() => {
    if (paintLeftSpanRef.current)
      paintLeftSpanRef.current.textContent = configRef.current.paintLeft;
  }, []);

  // --- Render ---
  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid #ccc', touchAction: 'none', display: 'block' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
      />
      <div>
        Осталось краски: <span ref={paintLeftSpanRef}></span>
      </div>
    </div>
  );
}
