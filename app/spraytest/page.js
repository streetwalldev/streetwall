'use client';

import { useEffect, useRef, useState } from 'react';

export default function DebugCanvas() {
  const canvasRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isDown, setIsDown] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 🔑 Ключ: отключаем панорамирование для trackpad/touch
    canvas.style.touchAction = 'none';

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Инициализация холста
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.scale(dpr, dpr);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    };

    resize();
    window.addEventListener('resize', resize);

    // 🔑 Универсальный обработчик координат
    const getCoords = (e) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = e.clientX;
      let clientY = e.clientY;
      if (e.touches && e.touches.length) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width) / dpr,
        y: (clientY - rect.top) * (canvas.height / rect.height) / dpr,
      };
    };

    // 🔑 Обработчики событий
    const handleDown = (e) => {
      e.preventDefault();
      const { x, y } = getCoords(e);
      console.log('✅ pointerdown:', { x: x.toFixed(1), y: y.toFixed(1), type: e.type });
      setCoords({ x, y });
      setIsDown(true);
      setClickCount(c => c + 1);
    };

    const handleMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const { x, y } = getCoords(e);
      console.log('🖱️ pointermove:', { x: x.toFixed(1), y: y.toFixed(1), type: e.type });
      setCoords({ x, y });
    };

    const handleUp = (e) => {
      console.log('⏹️ pointerup', { type: e.type });
      setIsDown(false);
    };

    // 🔑 Подписка на события — ВСЕ с { passive: false } для touch
    canvas.addEventListener('pointerdown', handleDown);
    canvas.addEventListener('pointermove', handleMove);
    canvas.addEventListener('pointerup', handleUp);
    canvas.addEventListener('pointercancel', handleUp);

    canvas.addEventListener('touchstart', handleDown, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchend', handleUp, { passive: false });

    // 🔑 Визуальный курсор
    const cursorEl = document.createElement('div');
    cursorEl.style.position = 'fixed';
    cursorEl.style.width = '16px';
    cursorEl.style.height = '16px';
    cursorEl.style.borderRadius = '50%';
    cursorEl.style.background = 'red';
    cursorEl.style.pointerEvents = 'none';
    cursorEl.style.zIndex = '10000';
    cursorEl.style.display = 'none';
    cursorEl.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(cursorEl);

    const updateCursor = (x, y) => {
      cursorEl.style.left = `${x}px`;
      cursorEl.style.top = `${y}px`;
      cursorEl.style.display = isDown ? 'block' : 'none';
    };

    const handleCursorMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      updateCursor(e.clientX - rect.left, e.clientY - rect.top);
    };

    canvas.addEventListener('pointermove', handleCursorMove);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', handleDown);
      canvas.removeEventListener('pointermove', handleMove);
      canvas.removeEventListener('pointerup', handleUp);
      canvas.removeEventListener('pointercancel', handleUp);
      canvas.removeEventListener('touchstart', handleDown);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchend', handleUp);
      canvas.removeEventListener('pointermove', handleCursorMove);
      if (cursorEl.parentNode) cursorEl.parentNode.removeChild(cursorEl);
    };
  }, [isClient, isDown]);

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden', width: '100vw', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          background: '#000',
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          padding: '10px',
          fontFamily: 'monospace',
          zIndex: 1000,
        }}
      >
        <div>🖱️ <b>X:</b> {coords.x.toFixed(1)}</div>
        <div>🖱️ <b>Y:</b> {coords.y.toFixed(1)}</div>
        <div>🖱️ <b>Down:</b> {isDown ? '✅' : '❌'}</div>
        <div>🖱️ <b>Clicks:</b> {clickCount}</div>
        <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
          ✅ Open DevTools → Console<br />
          ✅ Click & move → see logs
        </div>
      </div>
    </div>
  );
}
