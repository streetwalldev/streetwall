// app/page.js
'use client';

import { useRef, useEffect } from 'react';

export default function SprayCanvasPage() {
  const canvasRef = useRef(null);
  const bgImageInputRef = useRef(null);
  const colorPickerRef = useRef(null);
  const scaleRangeRef = useRef(null);
  const radiusRangeRef = useRef(null);
  const densityRangeRef = useRef(null);
  const speedFactorRef = useRef(null);
  const resetBtnRef = useRef(null);
  const paintLeftSpanRef = useRef(null);

  const scaleValRef = useRef(null);
  const radiusValRef = useRef(null);
  const densityValRef = useRef(null);
  const speedFactorValRef = useRef(null);

  // --- Настройки (как в оригинальном прототипе) ---
  const config = {
    sprayRadius: 30,
    dotsPerTick: 556,
    speedFactor: 7,
    lineScale: 1.0,
    paintMax: 2_000_000,
    paintLeft: 2_000_000,
    currentColor: '#2222ff',
  };

  const drawingRef = useRef(false);
  const lastSprayPosRef = useRef(null);
  const lastSprayTimeRef = useRef(null);
  const paintedPixelsRef = useRef(new Set());
  const dripMapRef = useRef({});
  const bgImageRef = useRef(null);

  // --- Вспомогательные функции ---
  function getRandomInt(a, b) {
    return Math.random() * (b - a) + a;
  }

  function getCanvasCoords(clientX, clientY) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function redraw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
    }
  }

  function resetCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    config.paintLeft = config.paintMax;
    paintedPixelsRef.current.clear();
    dripMapRef.current = {};
    lastSprayPosRef.current = null;
    lastSprayTimeRef.current = null;
    if (paintLeftSpanRef.current) {
      paintLeftSpanRef.current.textContent = config.paintLeft;
    }
    redraw();
  }

  function sprayAt(x, y) {
    const now = performance.now();
    let speed = 0;
    if (lastSprayPosRef.current && lastSprayTimeRef.current !== null) {
      const dt = now - lastSprayTimeRef.current;
      const dist = Math.hypot(x - lastSprayPosRef.current.x, y - lastSprayPosRef.current.y);
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

    const minAlpha = 0.15;
    const maxAlpha = 0.55;
    const alphaFromSpeed = maxAlpha - (maxAlpha - minAlpha) * speed;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < config.dotsPerTick; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const r = Math.random() * radiusFromSpeed;
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;
      const size = getRandomInt(dotFromSpeed * 0.85, dotFromSpeed);

      ctx.globalAlpha = alphaFromSpeed * (0.8 + Math.random() * 0.3);
      ctx.fillStyle = config.currentColor;
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
        ctx.strokeStyle = config.currentColor;
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
        config.paintLeft--;
        if (config.paintLeft <= 0) {
          drawingRef.current = false;
          if (typeof window !== 'undefined') {
            alert('🎨 Краска закончилась!');
          }
        }
      }
    }

    ctx.globalAlpha = 1;
    if (paintLeftSpanRef.current) {
      paintLeftSpanRef.current.textContent = Math.max(0, config.paintLeft);
    }
    lastSprayPosRef.current = { x, y };
    lastSprayTimeRef.current = now;
  }

  // --- Обработка событий ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function loadBackground(file) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          bgImageRef.current = img;
          canvas.width = img.width;
          canvas.height = img.height;
          redraw();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }

    function handleMouseDown(e) {
      if (config.paintLeft <= 0) return;
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      drawingRef.current = true;
      sprayAt(x, y);
    }

    function handleMouseMove(e) {
      if (!drawingRef.current || config.paintLeft <= 0) return;
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      sprayAt(x, y);
    }

    function handleMouseUp() {
      drawingRef.current = false;
      lastSprayPosRef.current = null;
      lastSprayTimeRef.current = null;
    }

    function handleTouchStart(e) {
      if (e.touches.length === 1 && config.paintLeft > 0) {
        const t = e.touches[0];
        const { x, y } = getCanvasCoords(t.clientX, t.clientY);
        drawingRef.current = true;
        sprayAt(x, y);
        e.preventDefault();
      }
    }

    function handleTouchMove(e) {
      if (e.touches.length === 1 && drawingRef.current && config.paintLeft > 0) {
        const t = e.touches[0];
        const { x, y } = getCanvasCoords(t.clientX, t.clientY);
        sprayAt(x, y);
        e.preventDefault();
      }
    }

    // Подписки
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleMouseUp);
    canvas.addEventListener('touchcancel', handleMouseUp);

    // Drag & Drop
    const preventDefaults = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((evt) => {
      document.addEventListener(evt, preventDefaults, false);
    });

    document.addEventListener('drop', (e) => {
      preventDefaults(e);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        loadBackground(file);
      }
    });

    // Input
    const bgInput = bgImageInputRef.current;
    if (bgInput) {
      bgInput.addEventListener('change', (e) => {
        if (e.target.files?.[0]) {
          loadBackground(e.target.files[0]);
        }
      });
    }

    // UI updates
    const updateUI = () => {
      if (!scaleRangeRef.current) return;
      config.lineScale = parseFloat(scaleRangeRef.current.value);
      config.sprayRadius = parseInt(radiusRangeRef.current.value, 10);
      config.dotsPerTick = parseInt(densityRangeRef.current.value, 10);
      config.speedFactor = parseFloat(speedFactorRef.current.value);
      config.currentColor = colorPickerRef.current?.value || config.currentColor;

      if (scaleValRef.current) scaleValRef.current.textContent = config.lineScale.toFixed(2);
      if (radiusValRef.current) radiusValRef.current.textContent = config.sprayRadius;
      if (densityValRef.current) densityValRef.current.textContent = config.dotsPerTick;
      if (speedFactorValRef.current) speedFactorValRef.current.textContent = config.speedFactor.toFixed(1);
    };

    const inputs = [
      scaleRangeRef.current,
      radiusRangeRef.current,
      densityRangeRef.current,
      speedFactorRef.current,
      colorPickerRef.current,
    ].filter(Boolean);

    inputs.forEach((el) => el.addEventListener('input', updateUI));

    const resetBtn = resetBtnRef.current;
    if (resetBtn) resetBtn.addEventListener('click', resetCanvas);

    // Init
    updateUI();
    resetCanvas();

    // Cleanup
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleMouseUp);
      canvas.removeEventListener('touchcancel', handleMouseUp);

      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((evt) => {
        document.removeEventListener(evt, preventDefaults, false);
      });
      document.removeEventListener('drop', (e) => {});

      inputs.forEach((el) => el.removeEventListener('input', updateUI));
      if (resetBtn) resetBtn.removeEventListener('click', resetCanvas);
    };
  }, []);

  return (
    <div style={{ background: '#222', color: '#eee', fontFamily: 'sans-serif', margin: 0, padding: 10, display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ margin: '0 0 10px' }}>🎨 Spray Canvas</h2>
        <div style={{ position: 'relative', border: '1px solid #555', borderRadius: '4px', overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            width="1024"
            height="1024"
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
