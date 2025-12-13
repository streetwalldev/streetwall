'use client';

import React, { useRef, useState } from 'react';

const WIDTH = 2000;
const HEIGHT = 1000;

export default function Page() {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#1e1e1e');
  const [radius, setRadius] = useState(28); // "разброс" баллона
  const [density, setDensity] = useState(40); // сколько точек за один "пшик"

  // Получить координаты относительно canvas
  function getCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
      y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top,
    };
  }

  function spray(x, y) {
    const ctx = canvasRef.current.getContext('2d');
    for (let i = 0; i < density; i++) {
      // По кругу с равномерной плотностью, но случайным углом и радиусом
      const angle = Math.random() * Math.PI * 2;
      // sqrt для более естественного распределения ближе к центру
      const r = Math.sqrt(Math.random()) * radius;
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;
      ctx.globalAlpha = Math.random() * 0.4 + 0.15; // полупрозрачность
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, 1.2 + Math.random() * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function handlePointerDown(e) {
    setDrawing(true);
    const { x, y } = getCoords(e);
    spray(x, y);
  }
  function handlePointerMove(e) {
    if (!drawing) return;
    const { x, y } = getCoords(e);
    spray(x, y);
  }
  function handlePointerUp() {
    setDrawing(false);
  }
  function clearCanvas() {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
  }

  // Для мобильных тачей
  React.useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.addEventListener('touchstart', handlePointerDown, { passive: false });
    c.addEventListener('touchmove', handlePointerMove, { passive: false });
    c.addEventListener('touchend', handlePointerUp);
    return () => {
      c.removeEventListener('touchstart', handlePointerDown);
      c.removeEventListener('touchmove', handlePointerMove);
      c.removeEventListener('touchend', handlePointerUp);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{padding:20}}>
      <div style={{marginBottom:12, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
        <label>
          Цвет:{' '}
          <input type="color" value={color} onChange={e => setColor(e.target.value)} />
        </label>
        <label>
          Радиус:{' '}
          <input
            type="range"
            min={8}
            max={80}
            value={radius}
            onChange={e => setRadius(Number(e.target.value))}
          />{' '}
          {radius}
        </label>
        <label>
          Плотность:{' '}
          <input
            type="range"
            min={10}
            max={100}
            value={density}
            onChange={e => setDensity(Number(e.target.value))}
          />{' '}
          {density}
        </label>
        <button onClick={clearCanvas} style={{padding:'6px 18px', borderRadius:5}}>Очистить</button>
      </div>
      <div style={{border:'2px solid #333', borderRadius:8, overflow:'hidden', background:'#fff'}}>
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{
            width: WIDTH,
            height: HEIGHT,
            touchAction: 'none',
            display:'block',
            cursor: 'crosshair'
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
        />
      </div>


<div style={{fontSize:12, color:'#888', marginTop:8}}>
        Размер холста: {WIDTH} x {HEIGHT} px. Рисуйте мышью или пальцем.
      </div>
    </div>
  );
}
