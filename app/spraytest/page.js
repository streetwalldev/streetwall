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

  useEffect(() => {
    redraw();
    // eslint-disable-next-line
  }, [bgImg]);

  function redraw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);
    }
  }

  function getCanvasCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches?.[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.nativeEvent) {
      clientX = e.nativeEvent.offsetX + rect.left;
      clientY = e.nativeEvent.offsetY + rect.top;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
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
      const key = ${px},${py};
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

  function handlePointerDown(e) {
    if (paintLeft <= 0) return;
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    sprayAt(x, y);
  }

  function handlePointerMove(e) {
    if (!isDrawing || paintLeft <= 0) return;
    const { x, y } = getCanvasCoords(e);
    sprayAt(x, y);
  }

  function handlePointerUp() {
    setIsDrawing(false);
  }

  function handleClear() {
    paintedPixelsRef.current.clear();
    setPaintLeft(PAINT_MAX);
    redraw();
  }

  function handleBgChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setBgImg(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  useEffect(() => {
    function upHandler() {
      setIsDrawing(false);
    }
    window.addEventListener('pointerup', upHandler);
    return () => window.removeEventListener('pointerup', upHandler);
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '32px' }}>
      <h2>Спрей-холст 🎨</h2>
      <div style={{ marginBottom: '12px' }}>
        Цвет:{' '}
        <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        {' '}Радиус:{' '}
        <input          
          type="range"
          min={5}
          max={80}
          value={radius}
          onChange={e => setRadius(Number(e.target.value))}
        /> {radius}
        {' '}Плотность:{' '}
        <input
          type="range"
          min={5}
          max={60}
          value={density}
          onChange={e => setDensity(Number(e.target.value))}
        /> {density}
        {' '}
        <button onClick={handleClear}>Очистить</button>
      </div>
      <div style={{ marginBottom: '12px' }}>
        Загрузить фон:
        <input type="file" accept="image/*" onChange={handleBgChange} />
        {bgImg && (
          <button
            style={{ marginLeft: '10px' }}
            onClick={() => setBgImg(null)}
          >
            Убрать фон
          </button>
        )}
      </div>
      <div>
        Осталось краски: <b>{paintLeft}</b> px
        {paintLeft === 0 && (
          <span style={{ color: 'red', marginLeft: '10px' }}>Краска закончилась!</span>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          border: '1px solid #888',
          background: '#fff',
          marginTop: '16px',
          touchAction: 'none',
          cursor: paintLeft > 0 ? 'crosshair' : 'not-allowed'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
}
