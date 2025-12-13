'use client';

import React, { useRef, useState } from 'react';

const CANVAS_W = 800;
const CANVAS_H = 600;
const PAINT_MAX = 2000000;

export default function HomePage() {
  // STATES
  const [color, setColor] = useState('#ff3c00');
  const [radius, setRadius] = useState(30);
  const [density, setDensity] = useState(556);
  const [paintLeft, setPaintLeft] = useState(PAINT_MAX);
  const [bgImageUrl, setBgImageUrl] = useState(null);

  // REFS
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef({ x: null, y: null });
  const paintLeftRef = useRef(PAINT_MAX);

  // UTILS
  function getRandomOffset(r) {
    // равномерно по кругу
    const angle = Math.random() * 2 * Math.PI;
    const dist = r * Math.sqrt(Math.random());
    return {
      x: dist * Math.cos(angle),
      y: dist * Math.sin(angle),
    };
  }

  function spray(ctx, x, y) {
    if (paintLeftRef.current <= 0) return;
    let used = 0;
    for (let i = 0; i < density; i++) {
      if (paintLeftRef.current <= 0) break;
      const offset = getRandomOffset(radius);
      const dotSize = Math.random() * (1.1 - 0.8) + 0.8;
      ctx.beginPath();
      ctx.arc(x + offset.x, y + offset.y, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.25 + Math.random() * 0.3;
      ctx.fill();
      used++;
      paintLeftRef.current--;
    }
    setPaintLeft(paintLeftRef.current);
  }

  // EVENTS
  function getCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.nativeEvent.offsetX ?? e.clientX - rect.left,
      y: e.nativeEvent.offsetY ?? e.clientY - rect.top,
    };
  }

  function handlePointerDown(e) {
    if (paintLeft <= 0) return;
    isDrawingRef.current = true;
    const { x, y } = getCoords(e);
    lastPointRef.current = { x, y };
    spray(canvasRef.current.getContext('2d'), x, y);
  }

  function handlePointerMove(e) {
    if (!isDrawingRef.current || paintLeft <= 0) return;
    const { x, y } = getCoords(e);
    spray(canvasRef.current.getContext('2d'), x, y);
    lastPointRef.current = { x, y };
  }

  function stopDrawing() {
    isDrawingRef.current = false;
    lastPointRef.current = { x: null, y: null };
  }

  function handleClear() {
    paintLeftRef.current = PAINT_MAX;
    setPaintLeft(PAINT_MAX);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (bgImageUrl) drawBgImage(bgImageUrl);
  }

  // BG IMAGE
  function handleBgImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      setBgImageUrl(evt.target.result);
      setTimeout(() => drawBgImage(evt.target.result), 20);
    };
    reader.readAsDataURL(file);
  }

  function drawBgImage(src) {
    const img = new window.Image();
    img.onload = () => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.drawImage(img, 0, 0, CANVAS_W, CANVAS_H);
    };
    img.src = src;
  }

  // Если фон меняется — рисуем его на canvas
  React.useEffect(() => {
    if (bgImageUrl) drawBgImage(bgImageUrl);
    // eslint-disable-next-line
  }, [bgImageUrl]);

  // СТИЛИ
  // (можно вынести в CSS-модуль)
  const styles = {
    root: {
      fontFamily: 'system-ui,sans-serif',
      background: '#222',
      color: '#fff',
      minHeight: '100vh',


padding: '20px',
      boxSizing: 'border-box'
    },
    mainUi: {
      maxWidth: '900px',
      margin: '0 auto 20px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
      background: 'rgba(40,40,40,.9)',
      padding: '16px',
      borderRadius: '8px'
    },
    label: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '8px',
      fontSize: '.95em'
    },
    range: { width: '100px' },
    button: {
      background: '#ff3c00',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    canvasWrap: {
      display: 'block',
      margin: '0 auto',
      width: ${CANVAS_W}px,
      height: ${CANVAS_H}px
    },
    canvas: {
      display: 'block',
      width: ${CANVAS_W}px,
      height: ${CANVAS_H}px,
      border: '2px solid #fff',
      background: '#111',
      touchAction: 'none'
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.mainUi} id="main-ui">
        <label style={styles.label}>
          Цвет:
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
          />
        </label>
        <label style={styles.label}>
          Размер кисти:
          <input
            type="range"
            min={5}
            max={80}
            value={radius}
            style={styles.range}
            onChange={e => setRadius(Number(e.target.value))}
          />
          <span>{radius}</span>
        </label>
        <label style={styles.label}>
          Плотность:
          <input
            type="range"
            min={50}
            max={1200}
            value={density}
            style={styles.range}
            onChange={e => setDensity(Number(e.target.value))}
          />
          <span>{density}</span>
        </label>
        <label style={styles.label}>
          Подложка:
          <input
            type="file"
            accept="image/*"
            onChange={handleBgImage}
          />
        </label>
        <button style={styles.button} onClick={handleClear}>Очистить</button>
        <span>Осталось краски:&nbsp;<span>{paintLeft}</span></span>
      </div>

      <div style={styles.canvasWrap} id="canvas-wrap">
        <canvas
          ref={canvasRef}
          id="canvas"
          width={CANVAS_W}
          height={CANVAS_H}
          style={styles.canvas}
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onMouseMove={handlePointerMove}
          onTouchMove={handlePointerMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchEnd={stopDrawing}
        />
      </div>
    </div>
  );
}
