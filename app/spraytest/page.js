'use client';

import React, { useRef, useState } from 'react';

const CANVAS_W = 800;
const CANVAS_H = 600;
const PAINT_MAX = 8000;

export default function Page() {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#000000');
  const [radius, setRadius] = useState(20);
  const [density, setDensity] = useState(30);
  const [paintLeft, setPaintLeft] = useState(PAINT_MAX);
  const [bgImg, setBgImg] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Set of "painted" pixels to count unique ones
  const paintedPixelsRef = useRef(new Set());

  // For touch/pointer event compatibility
  function getCanvasCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches?.[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  // Redraw bg image (and nothing else)
  function redraw() {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (bgImg) {
      ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);
    }
  }

  // Paint dots in a spray pattern
  function sprayAt(x, y) {
    if (paintLeft <= 0) return;
    const ctx = canvasRef.current.getContext('2d');
    let paintUsed = 0;
    for (let i = 0; i < density; i++) {
      if (paintLeft - paintUsed <= 0) break;

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      // Dot size random from 1.2 to 3.5
      const size = 1.2 + Math.random() * (3.5 - 1.2);

      ctx.globalAlpha = Math.random() * (0.6 - 0.12) + 0.12;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, size, 0, Math.PI * 2);
      ctx.fill();

      // Unique pixel logic
      const px = Math.round(x + dx);
      const py = Math.round(y + dy);
      const key = px + ',' + py;
      if (!paintedPixelsRef.current.has(key)) {
        paintedPixelsRef.current.add(key);
        paintUsed++;
      }
    }
    if (paintUsed > 0) setPaintLeft(p => Math.max(0, p - paintUsed));
    ctx.globalAlpha = 1;
  }

  // --- Event Handlers ---

  function handlePointerDown(e) {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    sprayAt(x, y);
  }
  function handlePointerMove(e) {
    if (!isDrawing) return;
    e.preventDefault?.();
    const { x, y } = getCanvasCoords(e);
    sprayAt(x, y);
  }
  function handlePointerUp() {
    setIsDrawing(false);
  }

  // Touch events need passive: false to allow preventDefault
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Touch events for mobile
    function tstart(e) { handlePointerDown(e); }
    function tmove(e) { handlePointerMove(e); }
    function tend() { handlePointerUp(); }
    canvas.addEventListener('touchstart', tstart, { passive: false });
    canvas.addEventListener('touchmove', tmove, { passive: false });
    canvas.addEventListener('touchend', tend);

    // Redraw background when bgImg changes
    redraw();

    return () => {
      canvas.removeEventListener('touchstart', tstart);
      canvas.removeEventListener('touchmove', tmove);
      canvas.removeEventListener('touchend', tend);
    };
    // eslint-disable-next-line
  }, [bgImg]);


// Desktop pointer events (mouse/pen)
  // Attach via React props for best compatibility

  // Handle bg image upload
  function handleBgChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgUrl(url); // For cleaning up later

    const img = new window.Image();
    img.onload = () => {
      setBgImg(img);
      redraw();
    };
    img.src = url;
  }

  // Reset everything
  function handleReset() {
    setBgImg(null);
    setImgUrl(null);
    paintedPixelsRef.current.clear();
    setPaintLeft(PAINT_MAX);
    redraw();
  }

  // Redraw bg when needed (on mount or bgImg change)
  React.useEffect(() => {
    redraw();
    // eslint-disable-next-line
  }, []);

  // Cleanup image object URL
  React.useEffect(() => {
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
    // eslint-disable-next-line
  }, [imgUrl]);

  return (
    <main style={{ padding: '32px', fontFamily: 'sans-serif' }}>
      <h2>Spray Paint Demo</h2>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <label>
          Цвет:
          <input type="color" value={color}
            onChange={e => setColor(e.target.value)} style={{ marginLeft: '8px' }} />
        </label>
        <label>
          Радиус:
          <input type="range" min={5} max={80} value={radius}
            onChange={e => setRadius(+e.target.value)}
            style={{ marginLeft: '8px' }} />
          <span style={{ marginLeft: '8px' }}>{radius}</span>
        </label>
        <label>
          Плотность:
          <input type="range" min={5} max={100} value={density}
            onChange={e => setDensity(+e.target.value)}
            style={{ marginLeft: '8px' }} />
          <span style={{ marginLeft: '8px' }}>{density}</span>
        </label>
        <label>
          Фон:
          <input type="file" accept="image/*"
            onChange={handleBgChange}
            style={{ marginLeft: '8px' }} />
        </label>
        <button onClick={handleReset}
          style={{
            padding: '4px 16px',
            borderRadius: '6px',
            border: '1px solid #bbb',
            background: '#fff',
            cursor: 'pointer'
          }}>
          Сбросить
        </button>
        <span style={{marginLeft:'20px'}}>Осталось краски: <b>{paintLeft}</b></span>
      </div>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          border: '2px solid #222',
          borderRadius: '10px',
          background: '#fff',
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div style={{marginTop:'12px', color:'#666'}}>Рисуйте мышью или пальцем. Краска ограничена!</div>
    </main>
  );
}
