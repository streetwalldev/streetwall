// apps/jan-2026/app/page.js
'use client';

import { useEffect } from 'react';

export default function January2026Page() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.id = 'wall';
      canvas.width = 45625;
      canvas.height = 1000;
      canvas.style.width = '100%';
      canvas.style.height = '500px';
      
      const container = document.querySelector('#wall-container');
      if (container) {
        container.innerHTML = '';
        container.appendChild(canvas);
      }

      // Здесь — ваша логика spray, параллакса, миникарты (из предыдущих прототипов)
      // Например:
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#8a8a8a';
      ctx.fillRect(0, 0, 45625, 1000);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* Миникарта сверху */}
      <div id="minimap-bar" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '20px',
        background: 'rgba(0,0,0,0.7)',
        zIndex: 100
      }}></div>

      {/* Сцена */}
      <div id="scene" style={{
        position: 'relative',
        height: '100vh'
      }}>
        <div id="sky" style={{
          position: 'absolute',
          top: '20px',
          left: 0,
          width: '100%',
          height: '187px',
          background: 'linear-gradient(to bottom, #1a3a6e, #2c5aa0)'
        }}></div>

        <div id="wall-container" style={{
          position: 'absolute',
          top: '207px',
          left: 0,
          width: '100%',
          height: '625px',
          border: '1px solid #444'
        }}></div>

        <div id="ground" style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '187px',
          background: 'linear-gradient(to top, #2d2d2d, #3a3a3a)'
        }}></div>
      </div>
    </div>
  );
}
