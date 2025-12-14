'use client';

import { useEffect, useRef, useState } from 'react';

export default function SprayWall() {
  const canvasRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 🔑 КРИТИЧЕСКИ: отключаем панорамирование для touch + trackpad
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
      dripThreshold: 12,
      dripFactor: 5,
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

    // 🔑 УНИВЕРСАЛЬНЫЙ getCoords: работает для pointer, touch, mouse
    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;

      if (e.touches && e.touches.length > 0) {
        // touch
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.clientX !== undefined) {
        // pointer / mouse
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return { x: 0, y: 0 };
      }

      return {
        x: (clientX - rect.left) * (canvas.width / rect.width) / dpr,
        y: (clientY - rect.top) * (canvas.height / rect.height) / dpr,
      };
    };

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

        // Потребление краски — вместе с рисованием (оптимизировано)
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

    const handleStart = (e) => {
      if (config.paintLeft <= 0) return;
      e.preventDefault(); // ← обязательно при { passive: false }
      const { x, y } = getCoords(e);
      isDrawing = true;
      lastX = x;
      lastY = y;
      sprayAt(x, y);
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
    };

    const handleEnd = () => {
      isDrawing = false;
    };

    // 🔑 Инициализация
    resize();
    window.addEventListener('resize', resize);

    // 🔑 Все touch-события — с { passive: false }
    canvas.addEventListener('pointerdown', handleStart);
    canvas.addEventListener('pointermove', handleMove);
    canvas.addEventListener('pointerup', handleEnd);
    canvas.addEventListener('pointercancel', handleEnd);

    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleEnd, { passive: false });

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', handleStart);
      canvas.removeEventListener('pointermove', handleMove);
      canvas.removeEventListener('pointerup', handleEnd);
      canvas.removeEventListener('pointercancel', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleEnd);
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
          cursor: 'crosshair',
          // 🔑 Дублируем на CSS — для 100% гарантии
          touchAction: 'none',
        }}
      />
    </div>
  );
}
