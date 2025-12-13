'use client';

import { useRef, useState, useEffect } from 'react';

const CANVAS_W = 800;
const CANVAS_H = 600;
const PAINT_MAX = 8000;

export default function Page() {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#ff0000');
  const [radius, setRadius] = useState(20);
  const [density, setDensity] = useState(30);
  const [paintLeft, setPaintLeft] = useState(PAINT_MAX);
  const [bgImg, setBgImg] = useState(null);
  const paintedPixelsRef = useRef(new Set());
  const [isDrawing, setIsDrawing] = useState(false);

  // Инициализируем canvas при монтировании
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  function getCanvasCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches?.[0] ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches?.[0] ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function redraw() {
    const ctx = canvasRef.current.getContext('2d');
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);
    }
  }

  function sprayAt(x, y) {
    if (paintLeft <= 0) return;
    const ctx = canvasRef.current.getContext('2d');
    let paintUsed = 0;

    for (let i = 0; i < density; i++) {
      if (paintLeft - paintUsed <= 0) break;

      const angle = Math.random() * 2 * Math.PI;
      const dist = Math.random() * radius;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const size = 1.2 + Math.random() * 2.3;

      ctx.globalAlpha = 0.12 + Math.random() * 0.48;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
      ctx.fill();

      const px = Math.round(x + dx);
      const py = Math.round(y + dy);
      const key = `${px},${py}`;
      if (!paintedPixelsRef.current.has(key)) {
        paintedPixelsRef.current.add(key);
        paintUsed++;
      }
    }
    if (paintUsed > 0) {
      setPaintLeft(prev => Math.max(0, prev - paintUsed));
    }
    ctx.globalAlpha = 1;
  }

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    sprayAt(x, y);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    sprayAt(x, y);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  // Обработка touch (mobile)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('touchstart', handlePointerDown, { passive: false });
    canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
    canvas.addEventListener('touchend', handlePointerUp);

    return () => {
      canvas.removeEventListener('touchstart', handlePointerDown);
      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDrawing]);

  const handleBgChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setBgImg(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleClear = () => {
    paintedPixelsRef.current.clear();
    setPaintLeft(PAINT_MAX);
    redraw();
  };

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui', background: '#000', color: '#fff', minHeight: '100vh' }}>
      <h1>🎨 Spray Test</h1>
      <div style={{ marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <label>
          Цвет: <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <label>
          Радиус: <input type="range" min="5" max="80" value={radius} onChange={(e) => setRadius(Number(e.target.value))} /> {radius}
        </label>
        <label>
          Плотность: <input type="range" min="10" max="100" value={density} onChange={(e) => setDensity(Number(e.target.value))} /> {density}
        </label>
        <label>
          Фон: <input type="file" accept="image/*" onChange={handleBgChange} />
        </label>
        <button onClick={handleClear} style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 4 }}>
          Очистить
        </button>
        <span>Краски: <b>{paintLeft}</b></span>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{ border: '1px solid #444', background: '#111', display: 'block', maxWidth: '100%' }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
      />
      <p style={{ marginTop: 10, fontSize: '0.9em', opacity: 0.7 }}>
        ✅ Работает на десктопе и мобильных. Зажмите мышь/палец и водите. Version: 1.1.35
      </p>
    </div>
  );
}
