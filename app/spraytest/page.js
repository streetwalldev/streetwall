'use client';

import { useEffect, useRef, useState } from 'react';

export default function SprayCanvasPage() {
  const canvasRef = useRef(null);
  const [paintLeft, setPaintLeft] = useState(2_000_000);
  const [isDrawing, setIsDrawing] = useState(false);

  // --- Config (как в оригинальном прототипе) ---
  const config = useRef({
    sprayRadius: 30,
    dotsPerTick: 556,
    speedFactor: 7,
    lineScale: 1.0,
    paintMax: 2_000_000,
    currentColor: '#2222ff',
  });

  const lastSprayPos = useRef(null);
  const lastSprayTime = useRef(null);
  const paintedPixels = useRef(new Set());
  const dripMap = useRef({});
  const bgImage = useRef(null);

  // --- Utils ---
  function getRandomInt(a, b) {
    return Math.random() * (b - a) + a;
  }

  function getCanvasCoords(clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  // --- Spray logic (точно как в оригинале) ---
  function sprayAt(x, y, canvas, ctx) {
    const now = performance.now();
    let speed = 0;
    if (lastSprayPos.current && lastSprayTime.current !== null) {
      const dt = now - lastSprayTime.current;
      const dist = Math.hypot(x - lastSprayPos.current.x, y - lastSprayPos.current.y);
      speed = dist / (dt || 1);
      speed = Math.min(1, speed / config.current.speedFactor);
    }

    const scale = config.current.lineScale;
    const minDot = 0.7 * scale;
    const maxDot = 1.1 * scale;
    const dotFromSpeed = maxDot - (maxDot - minDot) * speed;

    const minRadius = config.current.sprayRadius * 0.7 * scale;
    const maxRadius = config.current.sprayRadius * 3 * scale;
    const radiusFromSpeed = minRadius + (maxRadius - minRadius) * speed;

    const minAlpha = 0.15;
    const maxAlpha = 0.55;
    const alphaFromSpeed = maxAlpha - (maxAlpha - minAlpha) * speed;

    for (let i = 0; i < config.current.dotsPerTick; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.random() * radiusFromSpeed;
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;
      const size = getRandomInt(dotFromSpeed * 0.85, dotFromSpeed);

      ctx.globalAlpha = alphaFromSpeed * (0.8 + Math.random() * 0.3);
      ctx.fillStyle = config.current.currentColor;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
      ctx.fill();

      // Подтёки
      const cellX = Math.round(x + dx);
      const cellY = Math.round(y + dy);
      const cellKey = `${cellX}_${cellY}`;
      dripMap.current[cellKey] = (dripMap.current[cellKey] || 0) + 1;
      const drops = dripMap.current[cellKey];

      const threshold = Math.max(10, 14 * scale);
      if (drops > threshold && drops % 3 === 0) {
        const dripLen = Math.min(250 * scale, Math.sqrt(drops - threshold) * 4 * scale + getRandomInt(-1, 2));
        ctx.save();
        ctx.globalAlpha = 0.12 + Math.random() * 0.01;
        ctx.strokeStyle = config.current.currentColor;
        ctx.lineWidth = size * getRandomInt(0.7, 1.5);
        ctx.beginPath();
        ctx.moveTo(cellX + getRandomInt(-1, 1), cellY + size / 2);
        ctx.lineTo(cellX + getRandomInt(-1, 1), cellY + size / 2 + dripLen);
        ctx.stroke();
        ctx.restore();
      }

      // Расход краски
      const px = Math.round(x + dx);
      const py = Math.round(y + dy);
      const key = `${px}_${py}`;
      if (!paintedPixels.current.has(key)) {
        paintedPixels.current.add(key);
        const newLeft = Math.max(0, paintLeft - 1);
        setPaintLeft(newLeft);
        if (newLeft <= 0) {
          setIsDrawing(false);
          alert('Краска закончилась!');
        }
      }
    }

    ctx.globalAlpha = 1.0;
    lastSprayPos.current = { x, y };
    lastSprayTime.current = now;
  }

  // --- Canvas setup (выполняется ТОЛЬКО на клиенте) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Устанавливаем физический размер (1024x1024)
    canvas.width = 1024;
    canvas.height = 1024;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Обработчики мыши (локально, без утечек)
    const handleMouseDown = (e) => {
      if (paintLeft <= 0) return;
      const { x, y } = getCanvasCoords(e.clientX, e.clientY, canvas);
      setIsDrawing(true);
      sprayAt(x, y, canvas, ctx);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing || paintLeft <= 0) return;
      const { x, y } = getCanvasCoords(e.clientX, e.clientY, canvas);
      sprayAt(x, y, canvas, ctx);
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
      lastSprayPos.current = null;
      lastSprayTime.current = null;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);

    // Очистка
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDrawing, paintLeft]);

  // --- Reset handler
  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    paintedPixels.current.clear();
    dripMap.current = {};
    lastSprayPos.current = null;
    lastSprayTime.current = null;
    setPaintLeft(config.current.paintMax);
  };

  // --- Drag & drop фона
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      preventDefaults(e);
      const file = e.dataTransfer.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          bgImage.current = img;
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (canvas && ctx) {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((evt) => {
      document.addEventListener(evt, preventDefaults, false);
    });
    document.addEventListener('drop', handleDrop);

    return () => {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((evt) => {
        document.removeEventListener(evt, preventDefaults, false);
      });
      document.removeEventListener('drop', handleDrop);
    };
  }, []);

  return (
    <div style={{ background: '#222', color: '#eee', fontFamily: 'system-ui, sans-serif', margin: 0, padding: '10px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <h2 style={{ margin: '0 0 10px', textAlign: 'center' }}>Spray Canvas</h2>

      <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ border: '1px solid #555', borderRadius: '4px', overflow: 'hidden' }}>
            <canvas
              ref={canvasRef}
              style={{
                background: '#111',
                cursor: 'crosshair',
                display: 'block',
                width: '100%',
                height: 'auto',
              }}
            />
            {/* Версия в нижнем правом углу */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '12px',
              fontSize: '0.75rem',
              opacity: 0.6,
              pointerEvents: 'none',
              color: '#aaa',
            }}>
              v1.1.20
            </div>
          </div>
        </div>

        <div style={{ width: '280px', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '12px' }}>
          <h3 style={{ margin: '0 0 16px' }}>Controls</h3>

          <div style={{ marginBottom: '16px' }}>
            <label>Цвет: <input type="color" defaultValue="#2222ff" onChange={(e) => config.current.currentColor = e.target.value} /></label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Line Scale: <strong>{config.current.lineScale.toFixed(2)}</strong></label>
            <br />
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              defaultValue="1.0"
              style={{ width: '100%' }}
              onChange={(e) => config.current.lineScale = parseFloat(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Радиус: <strong>{config.current.sprayRadius}</strong> px</label>
            <br />
            <input
              type="range"
              min="10"
              max="100"
              defaultValue="30"
              style={{ width: '100%' }}
              onChange={(e) => config.current.sprayRadius = parseInt(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Плотность: <strong>{config.current.dotsPerTick}</strong></label>
            <br />
            <input
              type="range"
              min="50"
              max="2000"
              defaultValue="556"
              style={{ width: '100%' }}
              onChange={(e) => config.current.dotsPerTick = parseInt(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>Краски осталось: <strong>{paintLeft.toLocaleString()}</strong></label>
            <br />
            <button onClick={resetCanvas} style={{ marginTop: '6px' }}>Очистить</button>
          </div>

          <div>
            <label>Фон: <input type="file" accept="image/*" onChange={(e) => {
              if (e.target.files?.[0]) {
                const reader = new FileReader();
                reader.onload = () => {
                  const img = new Image();
                  img.onload = () => {
                    bgImage.current = img;
                    const canvas = canvasRef.current;
                    const ctx = canvas?.getContext('2d');
                    if (canvas && ctx) {
                      canvas.width = img.width;
                      canvas.height = img.height;
                      ctx.drawImage(img, 0, 0);
                    }
                  };
                  img.src = reader.result;
                };
                reader.readAsDataURL(e.target.files[0]);
              }
            }} /></label>
          </div>
        </div>
      </div>
    </div>
  );
}
