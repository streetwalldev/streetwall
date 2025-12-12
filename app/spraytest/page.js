'use client';

import { useRef, useEffect } from 'react';

export default function SprayCanvasPage() {
  const canvasRef = useRef(null);
  const colorPickerRef = useRef(null);
  const scaleRangeRef = useRef(null);
  const radiusRangeRef = useRef(null);
  const densityRangeRef = useRef(null);
  const speedFactorRef = useRef(null);
  const resetBtnRef = useRef(null);
  const paintLeftSpanRef = useRef(null);
  const bgImageInputRef = useRef(null);

  const scaleValRef = useRef(null);
  const radiusValRef = useRef(null);
  const densityValRef = useRef(null);
  const speedFactorValRef = useRef(null);

  // --- State refs ---
  const configRef = useRef({
    sprayRadius: 30,
    dotsPerTick: 556,
    speedFactor: 7,
    lineScale: 1.0,
    paintMax: 2_000_000,
    paintLeft: 2_000_000,
    currentColor: '#2222ff',
  });

  const drawingRef = useRef(false);
  const lastSprayPosRef = useRef(null);
  const lastSprayTimeRef = useRef(null);
  const paintedPixelsRef = useRef(new Set());
  const dripMapRef = useRef({});
  const bgImageRef = useRef(null);

  // --- Utils ---
  function getRandomInt(a, b) {
    return Math.random() * (b - a) + a;
  }

  // 🔑 Ключевое исправление: точная калибровка под devicePixelRatio и размер холста
  function getCanvasCoords(clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function redraw(canvas, ctx) {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
    }
  }

  function resetCanvas(canvas, ctx) {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    configRef.current.paintLeft = configRef.current.paintMax;
    paintedPixelsRef.current.clear();
    dripMapRef.current = {};
    lastSprayPosRef.current = null;
    lastSprayTimeRef.current = null;
    if (paintLeftSpanRef.current) {
      paintLeftSpanRef.current.textContent = configRef.current.paintLeft;
    }
    redraw(canvas, ctx);
  }

  function sprayAt(x, y, canvas, ctx) {
    if (!canvas || !ctx) return;

    const now = performance.now();
    let speed = 0;
    if (lastSprayPosRef.current && lastSprayTimeRef.current !== null) {
      const dt = now - lastSprayTimeRef.current;
      const dist = Math.hypot(x - lastSprayPosRef.current.x, y - lastSprayPosRef.current.y);
      speed = dist / (dt || 1);
      speed = Math.min(1, speed / configRef.current.speedFactor);
    }

    const scale = configRef.current.lineScale;
    const minDot = 0.7 * scale;
    const maxDot = 1.1 * scale;
    const dotFromSpeed = maxDot - (maxDot - minDot) * speed;

    const minRadius = configRef.current.sprayRadius * 0.7 * scale;
    const maxRadius = configRef.current.sprayRadius * 3 * scale;
    const radiusFromSpeed = minRadius + (maxRadius - minRadius) * speed;

    const minAlpha = 0.15;
    const maxAlpha = 0.55;
    const alphaFromSpeed = maxAlpha - (maxAlpha - minAlpha) * speed;

    for (let i = 0; i < configRef.current.dotsPerTick; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.random() * radiusFromSpeed;
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;
      const size = getRandomInt(dotFromSpeed * 0.85, dotFromSpeed);

      ctx.globalAlpha = alphaFromSpeed * (0.8 + Math.random() * 0.3);
      ctx.fillStyle = configRef.current.currentColor;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
      ctx.fill();

      // --- Подтёки ---
      const cellX = Math.round(x + dx);
      const cellY = Math.round(y + dy);
      const cellKey = `${cellX}_${cellY}`;
      dripMapRef.current[cellKey] = (dripMapRef.current[cellKey] || 0) + 1;
      const drops = dripMapRef.current[cellKey];

      const threshold = Math.max(10, 14 * scale);
      if (drops > threshold && drops % 3 === 0) {
        const dripLen = Math.min(250 * scale, Math.sqrt(drops - threshold) * 4 * scale + getRandomInt(-1, 2));
        ctx.save();
        ctx.globalAlpha = 0.12 + Math.random() * 0.01;
        ctx.strokeStyle = configRef.current.currentColor;
        ctx.lineWidth = size * getRandomInt(0.7, 1.5);
        ctx.beginPath();
        ctx.moveTo(cellX + getRandomInt(-1, 1), cellY + size / 2);
        ctx.lineTo(cellX + getRandomInt(-1, 1), cellY + size / 2 + dripLen);
        ctx.stroke();
        ctx.restore();
      }

      // --- Расход краски ---
      const px = Math.round(x + dx);
      const py = Math.round(y + dy);
      const key = `${px}_${py}`;
      if (!paintedPixelsRef.current.has(key)) {
        paintedPixelsRef.current.add(key);
        configRef.current.paintLeft--;
        if (configRef.current.paintLeft <= 0) {
          drawingRef.current = false;
          alert('🎨 Краска закончилась!');
        }
      }
    }

    ctx.globalAlpha = 1;
    if (paintLeftSpanRef.current) {
      paintLeftSpanRef.current.textContent = Math.max(0, configRef.current.paintLeft);
    }
    lastSprayPosRef.current = { x, y };
    lastSprayTimeRef.current = now;
  }

  // --- Setup на клиенте ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set initial size (1024x1024)
    canvas.width = 1024;
    canvas.height = 1024;

    // Load background handler
    const handleBgImage = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          bgImageRef.current = img;
          // Resize canvas to image
          canvas.width = img.width;
          canvas.height = img.height;
          redraw(canvas, ctx);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    };

    // Mouse handlers
    const handleMouseDown = (e) => {
      if (configRef.current.paintLeft <= 0) return;
      const { x, y } = getCanvasCoords(e.clientX, e.clientY, canvas);
      drawingRef.current = true;
      sprayAt(x, y, canvas, ctx);
    };

    const handleMouseMove = (e) => {
      if (!drawingRef.current || configRef.current.paintLeft <= 0) return;
      const { x, y } = getCanvasCoords(e.clientX, e.clientY, canvas);
      sprayAt(x, y, canvas, ctx);
    };

    const handleMouseUp = () => {
      drawingRef.current = false;
      lastSprayPosRef.current = null;
      lastSprayTimeRef.current = null;
    };

    // Attach listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);

    // Background input
    const bgInput = bgImageInputRef.current;
    if (bgInput) {
      bgInput.addEventListener('change', handleBgImage);
    }

    // UI update
    const updateUI = () => {
      if (scaleRangeRef.current) {
        configRef.current.lineScale = parseFloat(scaleRangeRef.current.value);
        configRef.current.sprayRadius = parseInt(radiusRangeRef.current.value, 10);
        configRef.current.dotsPerTick = parseInt(densityRangeRef.current.value, 10);
        configRef.current.speedFactor = parseFloat(speedFactorRef.current.value);
        configRef.current.currentColor = colorPickerRef.current?.value || '#2222ff';

        if (scaleValRef.current) scaleValRef.current.textContent = configRef.current.lineScale.toFixed(2);
        if (radiusValRef.current) radiusValRef.current.textContent = configRef.current.sprayRadius;
        if (densityValRef.current) densityValRef.current.textContent = configRef.current.dotsPerTick;
        if (speedFactorValRef.current) speedFactorValRef.current.textContent = configRef.current.speedFactor.toFixed(1);
      }
    };

    // Init
    updateUI();
    resetCanvas(canvas, ctx);

    // Cleanup
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
      if (bgInput) bgInput.removeEventListener('change', handleBgImage);
    };
  }, []);

  // Reset handler (outside useEffect — bind via ref)
  useEffect(() => {
    const resetBtn = resetBtnRef.current;
    if (resetBtn) {
      const handler = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) resetCanvas(canvas, ctx);
      };
      resetBtn.addEventListener('click', handler);
      return () => resetBtn.removeEventListener('click', handler);
    }
  }, []);

  return (
    <div style={{ background: '#222', color: '#eee', fontFamily: 'sans-serif', margin: 0, padding: 10, display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ margin: '0 0 10px' }}>🎨 Spray Canvas</h2>
        <div style={{ position: 'relative', border: '1px solid #555', borderRadius: '4px', overflow: 'hidden' }}>
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
        </div>
      </div>

      <div style={{ width: 280, padding: 10, background: 'rgba(0,0,0,0.4)', borderRadius: 8, marginLeft: 20 }}>
        <h3 style={{ margin: '0 0 16px' }}>🔧 Controls</h3>

        <div style={{ marginBottom: 16 }}>
          <label>
            Цвет: <input type="color" ref={colorPickerRef} defaultValue="#2222ff" />
          </label>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Line Scale: <span ref={scaleValRef} style={{ fontWeight: 'bold', color: '#fff' }}>1.00</span>
          </label>
          <br />
          <input
            type="range"
            ref={scaleRangeRef}
            min="0.1"
            max="1.0"
            step="0.05"
            defaultValue="1.0"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Радиус облака: <span ref={radiusValRef} style={{ fontWeight: 'bold', color: '#fff' }}>30</span> px
          </label>
          <br />
          <input
            type="range"
            ref={radiusRangeRef}
            min="10"
            max="100"
            defaultValue="30"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Плотность: <span ref={densityValRef} style={{ fontWeight: 'bold', color: '#fff' }}>556</span>
          </label>
          <br />
          <input
            type="range"
            ref={densityRangeRef}
            min="50"
            max="2000"
            defaultValue="556"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Скорость реакции: <span ref={speedFactorValRef} style={{ fontWeight: 'bold', color: '#fff' }}>7.0</span>
          </label>
          <br />
          <input
            type="range"
            ref={speedFactorRef}
            min="1"
            max="20"
            step="0.5"
            defaultValue="7"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Краски осталось: <span ref={paintLeftSpanRef} style={{ fontWeight: 'bold', color: '#fff' }}>2000000</span>
          </label>
          <br />
          <button ref={resetBtnRef} style={{ marginTop: 6 }}>Очистить</button>
        </div>

        <div>
          <label>
            Фон: <input type="file" ref={bgImageInputRef} accept="image/*" />
          </label>
        </div>
      </div>
    </div>
  );
}
