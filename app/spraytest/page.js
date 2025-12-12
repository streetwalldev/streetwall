'use client';

import { useRef, useEffect, useState } from 'react';

const CANVAS_SIZE = 1024;

export default function SprayPage() {
  const canvasRef = useRef(null);
  const bgImageInputRef = useRef(null);

  const [currentColor, setCurrentColor] = useState('#2222ff');
  const [lineScale, setLineScale] = useState(1.0);
  const [sprayRadius, setSprayRadius] = useState(30);
  const [dotsPerTick, setDotsPerTick] = useState(556);
  const [speedFactor, setSpeedFactor] = useState(7);
  const [paintLeft, setPaintLeft] = useState(2_000_000);

  const drawingRef = useRef(false);
  const lastSprayPosRef = useRef(null);
  const lastSprayTimeRef = useRef(null);
  const dripMapRef = useRef({});
  const bgImageRef = useRef(null);

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
    if (!canvasRef.current) return;
    if (paintLeft <= 0) return;

    const ctx = canvasRef.current.getContext('2d');

    const now = performance.now();
    let speed = 0;
    if (lastSprayPosRef.current && lastSprayTimeRef.current !== null) {
      const dt = now - lastSprayTimeRef.current;
      const dist = Math.hypot(x - lastSprayPosRef.current.x, y - lastSprayPosRef.current.y);
      speed = dist / (dt || 1);
      speed = Math.min(1, speed / speedFactor);
    }

    const scale = lineScale;
    const minDot = 0.7 * scale;
    const maxDot = 1.1 * scale;
    const dotFromSpeed = maxDot - (maxDot - minDot) * speed;

    const minRadius = sprayRadius * 0.7 * scale;
    const maxRadius = sprayRadius * 3 * scale;
    const radiusFromSpeed = minRadius + (maxRadius - minRadius) * speed;

    const minAlpha = 0.15;
    const maxAlpha = 0.55;
    const alphaFromSpeed = maxAlpha - (maxAlpha - minAlpha) * speed;

    let dotsDrawn = 0;
    let paintLeftNow = paintLeft;

    for (let i = 0; i < dotsPerTick; i++) {
      if (paintLeftNow <= 0) break;
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.random() * radiusFromSpeed;
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;
      const size = getRandomInt(dotFromSpeed * 0.85, dotFromSpeed);

      ctx.globalAlpha = alphaFromSpeed * (0.8 + Math.random() * 0.3);
      ctx.fillStyle = currentColor;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
      ctx.fill();

      // Подтёки
      const cellX = Math.round(x + dx);
      const cellY = Math.round(y + dy);
      const cellKey = ${cellX}_${cellY};
      dripMapRef.current[cellKey] = (dripMapRef.current[cellKey] || 0) + 1;
      const drops = dripMapRef.current[cellKey];

      const threshold = Math.max(10, 14 * scale);
      if (drops > threshold && drops % 3 === 0) {
        const dripLen =
          Math.min(
            250 * scale,
            Math.sqrt(drops - threshold) * 4 * scale + getRandomInt(-1, 2)
          );
        ctx.save();
        ctx.globalAlpha = 0.12 + Math.random() * 0.01;
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = size * getRandomInt(0.7, 1.5);
        ctx.beginPath();
        ctx.moveTo(cellX + getRandomInt(-1, 1), cellY + size / 2);
        ctx.lineTo(
          cellX + getRandomInt(-1, 1),
          cellY + size / 2 + dripLen
        );
        ctx.stroke();
        ctx.restore();
      }

      dotsDrawn++;
      paintLeftNow--;
    }

    lastSprayPosRef.current = { x, y };
    lastSprayTimeRef.current = now;

    setPaintLeft(paintLeftNow);
  }

  useEffect(() => {
        let animationFrameId;

    function tick() {
      if (drawingRef.current && lastSprayPosRef.current) {
        sprayAt(lastSprayPosRef.current.x, lastSprayPosRef.current.y);
      }
      animationFrameId = requestAnimationFrame(tick);
    }

    tick();

    return () => cancelAnimationFrame(animationFrameId);
    // eslint-disable-next-line
  }, [currentColor, lineScale, sprayRadius, dotsPerTick, speedFactor]);

  function handlePointerDown(e) {
    drawingRef.current = true;

    let coords;
    if (e.touches && e.touches.length > 0) {
      coords = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
    } else {
      coords = getCanvasCoords(e.clientX, e.clientY);
    }
    lastSprayPosRef.current = coords;
    lastSprayTimeRef.current = performance.now();

    if (e.preventDefault) e.preventDefault();
  }

  function handlePointerMove(e) {
    if (!drawingRef.current) return;

    let coords;
    if (e.touches && e.touches.length > 0) {
      coords = getCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
    } else {
      coords = getCanvasCoords(e.clientX, e.clientY);
    }
    lastSprayPosRef.current = coords;

    if (e.preventDefault) e.preventDefault();
  }

  function handlePointerUp() {
    drawingRef.current = false;
    lastSprayPosRef.current = null;
    lastSprayTimeRef.current = null;
  }

  function handleReset() {
    if (!canvasRef.current) return;
    setPaintLeft(2_000_000);
    dripMapRef.current = {};
    // Очистить канвас и перерисовать фон если есть
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
  }

  function handleBgImageChange(e) {
    if (!canvasRef.current) return;
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new window.Image();
      img.onload = () => {
        bgImageRef.current = img;
        // Нарисовать на канвасе
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.drawImage(img, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  const styles = {
    body: {
      background: '#222',
      color: '#eee',
      fontFamily: 'sans-serif',
      margin: '0',
      padding: '10px',
      display: 'flex',
      minHeight: '100vh',
      boxSizing: 'border-box'
    },
    canvasContainer: {
      flex: '1',
      minWidth: '0'
    },
    controls: {
      width: '280px',
      padding: '10px',
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '8px',
      marginLeft: '20px',
      alignSelf: 'flex-start'
    },
    controlGroup: {
      marginBottom: '16px'
    },
    label: {
      display: 'block',
      fontSize: '0.95em',
      marginBottom: '6px'
    },
    value: {
      fontWeight: 'bold',
      color: '#fff'
    },
    canvas: {
      background: '#111',
      border: '1px solid #555',
      cursor: 'crosshair',
      display: 'block',
      width: '100%',
      height: 'auto'
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.canvasContainer}>
        <h2>🎨 Spray Canvas</h2>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={styles.canvas}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onTouchCancel={handlePointerUp}
        />
      </div>

      <div style={styles.controls}>
        <h3>🔧 Controls</h3>

        <div style={styles.controlGroup}>
          <label style={styles.label}>
            Цвет:{' '}
            <input
              type="color"
              value={currentColor}
              onChange={e => setCurrentColor(e.target.value)}
            />
          </label>
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>
            Line Scale:{' '}
            <span style={styles.value}>{lineScale.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={lineScale}
            onChange={e => setLineScale(parseFloat(e.target.value))}
          />
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>
            Радиус облака:{' '}
            <span style={styles.value}>{sprayRadius}</span> px
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={sprayRadius}
            onChange={e => setSprayRadius(parseInt(e.target.value))}
          />
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>
            Плотность:{' '}
            <span style={styles.value}>{dotsPerTick}</span>
          </label>
          <input
            type="range"
            min="50"
            max="2000"
            value={dotsPerTick}
            onChange={e => setDotsPerTick(parseInt(e.target.value))}
          />
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>
            Скорость реакции:{' '}
            <span style={styles.value}>{speedFactor.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={speedFactor}
            onChange={e => setSpeedFactor(parseFloat(e.target.value))}
          />
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>
            Краски осталось:{' '}
            <span style={styles.value}>{paintLeft}</span>
          </label>
          <button onClick={handleReset}>Очистить</button>
        </div>

        <div style={styles.controlGroup}>
          <label style={styles.label}>
            Фон:{' '}
            <input
              type="file"
              accept="image/*"
              ref={bgImageInputRef}
              onChange={handleBgImageChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
