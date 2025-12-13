'use client';

import React, { useRef, useState } from 'react';

const COLORS = [
  '#000000', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#ffffff',
];

export default function Home() {
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(15);
  const [drawing, setDrawing] = useState(false);

  // Spray logic
  const sprayInterval = useRef(null);

  function getRandomOffset(radius) {
    // Uniform distribution within a circle
    const angle = Math.random() * 2 * Math.PI;
    const r = radius * Math.sqrt(Math.random());
    return {
      x: r * Math.cos(angle),
      y: r * Math.sin(angle),
    };
  }

  function spray(x, y) {
    const ctx = canvasRef.current.getContext('2d');
    const density = Math.floor(size * 2); // Number of dots per tick

    for (let i = 0; i < density; i++) {
      const offset = getRandomOffset(size);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + offset.x, y + offset.y, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  function handlePointerDown(e) {
    setDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    spray(x, y);

    sprayInterval.current = setInterval(() => {
      const evt = e.touches ? e.touches[0] : e;
      const xx = evt.clientX - rect.left;
      const yy = evt.clientY - rect.top;
      spray(xx, yy);
    }, 50);
  }

  function handlePointerMove(e) {
    if (!drawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    spray(x, y);
  }

  function handlePointerUp() {
    setDrawing(false);
    clearInterval(sprayInterval.current);
  }

  function handleClear() {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: '#f7f7f7',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 40,
    }}>
      <h1 style={{ marginBottom: 20 }}>Spray Paint App</h1>
      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap'
      }}>
        <label>
          Цвет:
          <select
            value={color}
            onChange={e => setColor(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            {COLORS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Размер:
          <input
            type="range"
            min={5}
            max={60}
            value={size}
            onChange={e => setSize(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          />
          <span style={{ marginLeft: 8 }}>{size}px</span>
        </label>
        <button onClick={handleClear} style={{
          padding: '6px 18px',
          borderRadius: 8,
          border: '1px solid #bbb',
          background: '#fff',
          cursor: 'pointer'
        }}>
          Очистить
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          border: '2px solid #333',
          borderRadius: 12,
          background: '#fff',
          touchAction: 'none'
        }}


onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onTouchEnd={handlePointerUp}
        onMouseLeave={handlePointerUp}
      />
      <p style={{marginTop:20, color:'#666'}}>Нажмите и удерживайте мышь или палец для рисования спреем.</p>
    </main>
  );
}
