'use client';

import { useEffect, useRef } from 'react';

export default function DebugCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('❌ Canvas ref is null');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Failed to get 2D context');
      return;
    }

    // Фон
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const handleStart = (e) => {
      e.preventDefault();
      console.log('✅ pointerdown at', e.clientX, e.clientY);
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Отладочный круг
      ctx.fillStyle = '#ff3366';
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
      
      console.log('✅ Drew debug circle at', x, y);
    };

    canvas.addEventListener('pointerdown', handleStart, { passive: false });
    canvas.addEventListener('touchstart', handleStart, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', handleStart);
      canvas.removeEventListener('touchstart', handleStart);
    };
  }, []);

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden', width: '100vw', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          background: '#000',
          cursor: 'crosshair',
        }}
      />
      <div style={{
        position: 'fixed',
        top: 10,
        left: 10,
        background: 'rgba(0,0,0,0.7)',
        color: '#fff',
        padding: '8px 12px',
        fontFamily: 'monospace',
        zIndex: 1000
      }}>
        🧪 Debug Canvas<br />
        Click to test
      </div>
    </div>
  );
}
