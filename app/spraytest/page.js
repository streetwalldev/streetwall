'use client';

import { useEffect, useRef, useState } from 'react';

export default function SprayWall() {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 🔑 Важно: отключаем панорамирование для touch/trackpad
    canvas.style.touchAction = 'none';

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Config
    const config = {
      maxPaint: 10000,
      paintLeft: 10000,
      color: '#ff3366',
      sprayRadius: 20,
      dotsPerTick: 30,
    };

    const paintedPixels = new Set();
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Resize & init
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    };

    const getRandom = (min, max) => Math.random() * (max - min) + min;

    // Универсальный getCoords
    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: (clientX - rect.left) * (canvas.width / rect.width) / dpr,
        y: (clientY - rect.top) * (canvas.height / rect.height) / dpr,
      };
    };

    // Spray logic
    const sprayAt = (x, y) => {
      if (config.paintLeft <= 0) return;

      for (let i = 0; i < config.dotsPerTick; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * config.sprayRadius;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const size = getRandom(1.0, 2.2);

        ctx.globalAlpha = getRandom(0.15, 0.5);
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(x + dx, y + dy, size, 0, Math.PI * 2);
        ctx.fill();

        const px = Math.round(x + dx);
        const py = Math.round(y + dy);
        const key = `${px},${py}`;
        if (!paintedPixels.has(key)) {
          paintedPixels.add(key);
          config.paintLeft--;
          if (config.paintLeft <= 0) isDrawing = false;
        }
      }

      ctx.globalAlpha = 1.0;
    };

    // ——— EVENT HANDLERS ———
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
      console.log('🖱️ pointermove:', x.toFixed(1), y.toFixed(1));

      // Interpolation
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
    };

    const handleEnd = () => {
      isDrawing = false;
      console.log('⏹️ pointerup');
    };

    // ——— CURSOR ———
    const createCursor = () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="12" fill="#ff3366" opacity="0.7"/>
          <path d="M8,16 Q16,8 24,16" stroke="white" stroke-width="2" fill="none"/>
          <circle cx="16" cy="16" r="4" fill="white"/>
        </svg>
      `;
      const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
      return url;
    };

    const updateCursor = (x, y) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = `${x - 16}px`;
      cursorRef.current.style.top = `${y - 16}px`;
    };

    const handleCursorMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      updateCursor(x, y);
    };

    // Init
    resize();
    window.addEventListener('resize', resize);

    // Cursor
    const cursorImg = createCursor();
    const cursorEl = document.createElement('img');
    cursorEl.src = cursorImg;
    cursorEl.style.position = 'fixed';
    cursorEl.style.pointerEvents = 'none';
    cursorEl.style.zIndex = '10000';
    cursorEl.style.width = '32px';
    cursorEl.style.height = '32px';
    cursorEl.style.display = 'none';
    document.body.appendChild(cursorEl);
    cursorRef.current = cursorEl;

    // Events
    canvas.addEventListener('pointermove', handleCursorMove);
    canvas.addEventListener('pointerdown', (e) => {
      cursorEl.style.display = 'block';
      handleStart(e);
    });
    canvas.addEventListener('pointermove', handleMove);
    canvas.addEventListener('pointerup', () => {
      cursorEl.style.display = 'none';
      handleEnd();
    });
    canvas.addEventListener('pointercancel', () => {
      cursorEl.style.display = 'none';
      handleEnd();
    });

    // Touch (passive: false!)
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd, { passive: false });

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointermove', handleCursorMove);
      canvas.removeEventListener('pointerdown', handleStart);
      canvas.removeEventListener('pointermove', handleMove);
      canvas.removeEventListener('pointerup', handleEnd);
      canvas.removeEventListener('pointercancel', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
      if (cursorEl.parentNode) cursorEl.parentNode.removeChild(cursorEl);
    };
  }, [isClient]);

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden', width: '100vw', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          background: '#010101',
          cursor: 'none',
        }}
      />
    </div>
  );
}
