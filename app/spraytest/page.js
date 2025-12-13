'use client';

import { useEffect, useRef } from 'react';

export default function SprayPage() {
  const canvasRef = useRef(null);
  const radiusRef = useRef(null);
  const densityRef = useRef(null);
  const paintLeftRef = useRef(null);
  const colorRef = useRef(null);

  useEffect(() => {
    // Настройки спрея
    const config = {
      radius: 15,
      density: 20,
      color: '#000000',
      paintLeft: 1000,
    };

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let isDrawing = false;
    let sprayInterval;

    // UI элементы
    const radiusVal = radiusRef.current;
    const densityVal = densityRef.current;
    const paintLeftEl = paintLeftRef.current;
    const colorInput = colorRef.current;

    // Инициализация UI
    radiusVal.textContent = config.radius;
    densityVal.textContent = config.density;
    paintLeftEl.textContent = config.paintLeft;

    // Функция распыления
    function spray(x, y) {
      if (config.paintLeft <= 0) return;
      for (let i = 0; i < config.density; i++) {
        const angle = Math.random() * 2 * Math.PI;
        const r = config.radius * Math.sqrt(Math.random());
        const offsetX = r * Math.cos(angle);
        const offsetY = r * Math.sin(angle);

        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
      config.paintLeft--;
      paintLeftEl.textContent = config.paintLeft;
    }

    // Координаты мыши/касания относительно canvas
    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      if (e.touches) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
      }
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    function handlePointerDown(e) {
      isDrawing = true;
      const { x, y } = getPos(e);
      spray(x, y);
      sprayInterval = setInterval(() => {
        if (!isDrawing) return;
        const pos = getPos(e);
        spray(pos.x, pos.y);
      }, 50);
    }

    function handlePointerMove(e) {
      if (!isDrawing) return;
      const { x, y } = getPos(e);
      spray(x, y);
    }

    function handlePointerUp() {
      isDrawing = false;
      clearInterval(sprayInterval);
    }

    function handleClear() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      config.paintLeft = 1000;
      paintLeftEl.textContent = config.paintLeft;
    }

    function handleRadiusChange(e) {
      config.radius = Number(e.target.value);
      radiusVal.textContent = config.radius;
    }

    function handleDensityChange(e) {
      config.density = Number(e.target.value);
      densityVal.textContent = config.density;
    }

    function handleColorChange(e) {
      config.color = e.target.value;
    }

    // Навешиваем события
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    colorInput.addEventListener('input', handleColorChange);

    // Чистим за собой при размонтировании
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      colorInput.removeEventListener('input', handleColorChange);
    };
  }, []);

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
          Радиус:&nbsp;
          <input type="range" min="5" max="60" defaultValue="15"
            onInput={e => {
              radiusRef.current.textContent = e.target.value;
            }}
            onChange={e => {
              radiusRef.current.textContent = e.target.value;
            }}
          />
          <span ref={radiusRef} style={{ marginLeft: 8 }}>15</span> px
        </label>
        <label>
          Плотность:&nbsp;
          <input type="range" min="1" max="60" defaultValue="20"
            onInput={e => {
              densityRef.current.textContent = e.target.value;
            }}
            onChange={e => {
              densityRef.current.textContent = e.target.value;
            }}
          />
          <span ref={densityRef} style={{ marginLeft: 8 }}>20</span>
        </label>
        <label>
          Цвет:&nbsp;
          <input type="color" defaultValue="#000000" ref={colorRef} />
        </label>
        <button
          onClick={() => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            paintLeftRef.current.textContent = 1000;
          }}
          style={{
            padding: '6px 18px',
            borderRadius: 8,
            border: '1px solid #bbb',
            background: '#fff',
            cursor: 'pointer'
          }}
        >
          Очистить
        </button>
        <span style={{ marginLeft: 24 }}>
          Осталось краски:&nbsp;<b ref={paintLeftRef}>1000</b>
        </span>
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
      />
      <p style={{ marginTop: 20, color: '#666' }}>
        Нажмите и удерживайте мышь или палец для рисования спреем.<br />
        Можно менять радиус, плотность и цвет.
      </p>
    </main>
  );
}
