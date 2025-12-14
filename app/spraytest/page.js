'use client';

import { useEffect, useRef, useState } from 'react';

export default function SprayTest() {
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

    // 🔑 КРИТИЧЕСКИ: отключаем панорамирование для trackpad/touch
    canvas.style.touchAction = 'none';

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Размеры
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    // 🔑 Универсальный getCoords
    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = e.clientX;
      let clientY = e.clientY;
      if (e.touches?.[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width) / dpr,
        y: (clientY - rect.top) * (canvas.height / rect.height) / dpr,
      };
    };

    // ——— ЛОГИРОВАНИЕ СОБЫТИЙ ———
    const handlePointerDown = (e) => {
      e.preventDefault();
      const { x, y } = getCoords(e);
      console.log('✅ pointerdown at', x.toFixed(1), y.toFixed(1), 'type:', e.type);
      updateCursor(x, y);
      cursorRef.current?.setAttribute('style', 'display:block');
    };

    const handlePointerMove = (e) => {
      e.preventDefault();
      const { x, y } = getCoords(e);
      console.log('🖱️ pointermove at', x.toFixed(1), y.toFixed(1), 'type:', e.type);
      updateCursor(x, y);
    };

    const handlePointerUp = (e) => {
      console.log('⏹️ pointerup', 'type:', e.type);
      cursorRef.current?.setAttribute('style', 'display:none');
    };

    // ——— ВИЗУАЛЬНЫЙ КУРСОР ———
    const createCursor = () => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" fill="#ff3366" opacity="0.7"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>
      `;
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    };

    const updateCursor = (x, y) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = `${x - 12}px`;
      cursorRef.current.style.top = `${y - 12}px`;
    };

    const cursorImg = createCursor();
    const cursorEl = document.createElement('img');
    cursorEl.src = cursorImg;
    cursorEl.style.position = 'fixed';
    cursorEl.style.pointerEvents = 'none';
    cursorEl.style.zIndex = '10000';
    cursorEl.style.width = '24px';
    cursorEl.style.height = '24px';
    cursorEl.style.display = 'none';
    document.body.appendChild(cursorEl);
    cursorRef.current = cursorEl;

    // ——— ПОДПИСКА НА СОБЫТИЯ ———
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    // Для touch (Mac trackpad + mobile)
    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
    canvas.addEventListener('touchend', handlePointerUp, { passive: false });

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('touchend', handlePointerUp);
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
          background: '#111',
          cursor: 'crosshair',
        }}
      />
    </div>
  );
}
