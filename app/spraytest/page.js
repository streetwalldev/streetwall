'use client';

import { useRef, useState } from 'react';

export default function SprayPage() {
  const canvasRef = useRef(null);
  const [paintLeft, setPaintLeft] = useState(2_000_000);
  const [isDrawing, setIsDrawing] = useState(false);
  const [config, setConfig] = useState({
    sprayRadius: 30,
    dotsPerTick: 556,
    speedFactor: 7,
    lineScale: 1.0,
    paintMax: 2_000_000,
    currentColor: '#2222ff',
  });
  const paintedPixels = useRef(new Set());
  const lastSprayPos = useRef(null);
  const lastSprayTime = useRef(null);

  function getRandomInt(a, b) {
    return Math.random() * (b - a) + a;
  }
  function getCanvasCoords(clientX, clientY) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function sprayAt(x, y) {
    const ctx = canvasRef.current.getContext('2d');
    const now = performance.now();
    let speed = 0;
    if (lastSprayPos.current && lastSprayTime.current !== null) {
      const dt = now - lastSprayTime.current;
      const dist = Math.hypot(x - lastSprayPos.current.x, y - lastSprayPos.current.y);
      speed = dist / (dt || 1);
      speed = Math.min(1, speed / config.speedFactor);
    }

    const scale = config.lineScale;
    const minDot = 0.7 * scale;
    const maxDot = 1.1 * scale;
    const dotFromSpeed = maxDot - (maxDot - minDot) * speed;

    const minRadius = config.sprayRadius * 0.7 * scale;
    const maxRadius = config.sprayRadius * 3 * scale;
    const radiusFromSpeed = minRadius + (maxRadius - minRadius) * speed;

    let paintUsed = 0;

    for (let i = 0; i < config.dotsPerTick; i++) {
      if (paintLeft - paintUsed <= 0) break;

      const angle = getRandomInt(0, Math.PI * 2);
      const r = getRandomInt(0, radiusFromSpeed);
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;

      let px = Math.round(x + dx);
      let py = Math.round(y + dy);
      let key = px + "_" + py;

      if (!paintedPixels.current.has(key)) {
        paintedPixels.current.add(key);
        paintUsed++;
        ctx.globalAlpha = getRandomInt(0.15, 0.65);
        ctx.fillStyle = config.currentColor;
        ctx.beginPath();
        ctx.arc(px, py, dotFromSpeed, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (paintUsed > 0) {
      setPaintLeft(prev => {
        let left = prev - paintUsed;
        if (left <= 0) setIsDrawing(false);
        return left > 0 ? left : 0;
      });
    }

    lastSprayPos.current = { x, y };
    lastSprayTime.current = now;
  }

  function handlePointerDown(e) {
    if (paintLeft <= 0) return;
    setIsDrawing(true);
    let pointerX, pointerY;
    if (e.touches && e.touches.length > 0) {
      // Touch event
      ({ x: pointerX, y: pointerY } = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY));
    } else {
      ({ x: pointerX, y: pointerY } = getCanvasCoords(e.clientX, e.clientY));
    }
    sprayAt(pointerX, pointerY);
  }
  function handlePointerMove(e) {
    if (!isDrawing || paintLeft <= 0) return;
    let pointerX, pointerY;
    if (e.touches && e.touches.length > 0) {
      ({ x: pointerX, y: pointerY } = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY));
    } else {
      ({ x: pointerX, y: pointerY } = getCanvasCoords(e.clientX, e.clientY));
    }
    sprayAt(pointerX, pointerY);
  }
  function handlePointerUp() {
    setIsDrawing(false);
  }

  function resetCanvas() {
    paintedPixels.current.clear();
    setPaintLeft(config.paintMax);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);lastSprayPos.current = null;
    lastSprayTime.current = null;
  }

  function handleConfigChange(e) {
    const { name, value } = e.target;
    setConfig(cfg => ({
      ...cfg,
      [name]: name === 'currentColor' ? value : +value,
    }));
  }

  // --- Touch support ---
  // React onTouch* handlers don't fire on desktop browsers but safe for mobile
  // Prevent scrolling while drawing
  function preventScroll(e) {
    if (isDrawing) e.preventDefault();
  }

  return (
    <div style={{padding:'20px'}}>
      <h2>Спрей-краска</h2>
      <div style={{marginBottom:10}}>
        <label>
          Радиус:
          <input type="range" min={5} max={120} value={config.sprayRadius}
            name="sprayRadius" onChange={handleConfigChange} />
          {config.sprayRadius}
        </label>
        {' '}
        <label>
          Плотность:
          <input type="range" min={50} max={2000} value={config.dotsPerTick}
            name="dotsPerTick" onChange={handleConfigChange} />
          {config.dotsPerTick}
        </label>
        {' '}
        <label>
          Масштаб:
          <input type="range" min={0.5} max={2.5} step={0.01} value={config.lineScale}
            name="lineScale" onChange={handleConfigChange} />
          {config.lineScale}
        </label>
        {' '}
        <label>
          Скорость:
          <input type="range" min={1} max={20} step={0.1} value={config.speedFactor}
            name="speedFactor" onChange={handleConfigChange} />
          {config.speedFactor}
        </label>
        {' '}
        <label>
          Цвет:
          <input type="color" value={config.currentColor}
            name="currentColor" onChange={handleConfigChange} />
        </label>
        {' '}
        <button onClick={resetCanvas}>Сбросить</button>
      </div>
      <div style={{marginBottom:10}}>
        Осталось краски: <b>{paintLeft}</b>
        {paintLeft <= 0 && <span style={{color:'red'}}> Краска закончилась!</span>}
      </div>
      <canvas
        ref={canvasRef}
        width={900}
        height={600}
        style={{
          border:'1px solid #888',
          background:'#fff',
          cursor: paintLeft > 0 ? 'crosshair' : 'not-allowed',
          touchAction:'none'
        }}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        onTouchCancel={handlePointerUp}
        onContextMenu={e => e.preventDefault()}
        onPointerDown={preventScroll}
      />
      <div style={{marginTop:'14px', color:'#888'}}>
        Используйте мышь или палец для рисования.<br/>
        После окончания краски нажмите "Сбросить".
      </div>
    </div>
  );
}
