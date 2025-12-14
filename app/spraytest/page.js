'use client';

import React, { useRef, useEffect, useState } from "react";

const DEFAULT_CONFIG = {
  lineScale: 1,
  sprayRadius: 18,
  dotsPerTick: 30,
  speedFactor: 1.0,
  currentColor: "#2222ff",
  paintLeft: 3000,
};

function getRandomInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

export default function SprayPaintCanvas() {
  // Refs
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: null, y: null });
  const paintedPixelsRef = useRef(new Set());
  const undoStackRef = useRef([]);
  const [config, setConfig] = useState({ ...DEFAULT_CONFIG });
  const [paintLeft, setPaintLeft] = useState(DEFAULT_CONFIG.paintLeft);

  // UI state
  const [lineScale, setLineScale] = useState(DEFAULT_CONFIG.lineScale);
  const [sprayRadius, setSprayRadius] = useState(DEFAULT_CONFIG.sprayRadius);
  const [dotsPerTick, setDotsPerTick] = useState(DEFAULT_CONFIG.dotsPerTick);
  const [speedFactor, setSpeedFactor] = useState(DEFAULT_CONFIG.speedFactor);
  const [currentColor, setCurrentColor] = useState(DEFAULT_CONFIG.currentColor);

  // Resize canvas to fit container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    // Set size to parent size or fallback
    const width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.parentElement?.clientHeight || 600;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctxRef.current = canvas.getContext("2d");
    ctxRef.current.setTransform(1,0,0,1,0,0); // reset any transforms
    ctxRef.current.scale(dpr, dpr);
    // Clear on resize
    ctxRef.current.clearRect(0,0,width,height);
    paintedPixelsRef.current.clear();
    setPaintLeft(config.paintLeft);
    // eslint-disable-next-line
  }, []);

  // Update config when UI changes
  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      lineScale,
      sprayRadius,
      dotsPerTick,
      speedFactor,
      currentColor,
    }));
  }, [lineScale, sprayRadius, dotsPerTick, speedFactor, currentColor]);

  // Spray logic
  function sprayAt(x, y) {
    if (config.paintLeft <= 0) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    let drops = 0;
    for (let i = 0; i < config.dotsPerTick; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * config.sprayRadius;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      // Spray dot
      ctx.save();
      ctx.globalAlpha = 0.22 + Math.random() * 0.18;
      ctx.fillStyle = config.currentColor;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, 1.2 + Math.random() * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Drip effect
      drops++;
      const threshold = Math.max(10, 14 * config.lineScale);
      if (drops > threshold && drops % 3 === 0) {
        const dripLen =
          Math.min(
            250 * config.lineScale,
            Math.sqrt(drops - threshold) * 4 * config.lineScale + getRandomInt(-1, 2)
          );
        ctx.save();
        ctx.globalAlpha = 0.12 + Math.random() * 0.01;
        ctx.strokeStyle = config.currentColor;
        ctx.lineWidth =
          config.sprayRadius * (Math.random() * (1.5 - 0.7) + 0.7);
        ctx.beginPath();
        ctx.moveTo(
          x + dx + getRandomInt(-1, 1),
          y + dy + config.sprayRadius / 2
        );
        ctx.lineTo(
          x + dx + getRandomInt(-1, 1),
          y + dy + config.sprayRadius / 2 + dripLen
        );
        ctx.stroke();
        ctx.restore();
      }

      // Paint consumption per unique pixel
      const px = Math.round(x + dx);
      const py = Math.round(y + dy);
      const key = ${px}_${py};
      if (!paintedPixelsRef.current.has(key)) {
        paintedPixelsRef.current.add(key);
        config.paintLeft--;
        setPaintLeft(config.paintLeft);
        if (config.paintLeft <= 0) {
          drawingRef.current = false;
          alert("🎨 Краска закончилась!");
          break;
        }
      }
    }
  }

  // Mouse/touch events
  function getRelativeCoords(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left),
      y: (clientY - rect.top)
    };
  }

  function handlePointerDown(e) {
    if (config.paintLeft <= 0) return;
    e.preventDefault();
    saveUndo(); // for undo feature
    drawingRef.current = true;
    const { x, y } = getRelativeCoords(e);
    lastPointRef.current = { x, y };
    sprayAt(x, y);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);
  }

  function handlePointerMove(e) {
    if (!drawingRef.current || config.paintLeft <= 0) return;
    e.preventDefault();
    const { x, y } = getRelativeCoords(e);

    // Spray along the path for smoothness
    let { x: lx, y: ly } = lastPointRef.current;
    if (lx == null || ly == null) {
      lx = x; ly = y;
    }
    const dist = Math.hypot(x - lx, y - ly);
    const steps =
      Math.max(1, Math.floor((dist / (2 * config.sprayRadius)) * config.speedFactor));
    for (let i = 1; i <= steps; i++) {
      const nx = lx + ((x - lx) * i) / steps;
      const ny = ly + ((y - ly) * i) / steps;
      sprayAt(nx, ny);
    }
    lastPointRef.current = { x, y };
  }

  function handlePointerUp(e) {
    drawingRef.current = false;
    lastPointRef.current = { x: null, y: null };
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("touchmove", handlePointerMove);
    window.removeEventListener("touchend", handlePointerUp);
  }

  // Undo feature
  function saveUndo() {
    const ctx = ctxRef.current;
    if (!ctx) return;
    try {
      undoStackRef.current.push(
        ctx.getImageData(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        )
      );
      // Limit stack size to avoid memory leak
      if (undoStackRef.current.length > 20)
        undoStackRef.current.shift();
    } catch {}
  }

  function handleUndo() {
    if (!undoStackRef.current.length) return;
    const imageData = undoStackRef.current.pop();
    ctxRef.current.putImageData(imageData, 0, 0);
    paintedPixelsRef.current.clear(); // can't restore painted pixels reliably
    // Optionally restore paintLeft too (not implemented here)
  }

  function handleClear() {
    const canvas = canvasRef.current;
    saveUndo();
    ctxRef.current.clearRect(0,0,canvas.width,canvas.height);
    paintedPixelsRef.current.clear();
    setPaintLeft(DEFAULT_CONFIG.paintLeft);
    setConfig({...config, paintLeft: DEFAULT_CONFIG.paintLeft});
  }
  // Download image
  function handleDownload() {
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "spray-art.png";
    a.click();
  }

  // UI controls handlers
  function handleLineScale(e) { setLineScale(Number(e.target.value)); }
  function handleSprayRadius(e) { setSprayRadius(Number(e.target.value)); }
  function handleDotsPerTick(e) { setDotsPerTick(Number(e.target.value)); }
  function handleSpeedFactor(e) { setSpeedFactor(Number(e.target.value)); }
  function handleColorChange(e) { setCurrentColor(e.target.value); }

  return (
    <div style={{ userSelect: "none", maxWidth: "100vw" }}>
      <div style={{ display: "flex", gap: "1em", alignItems: "center", marginBottom: "8px" }}>
        <label>
          Толщина:
          <input type="range" min="0.5" max="3" step="0.01" value={lineScale} onChange={handleLineScale} />
          <span>{lineScale.toFixed(2)}</span>
        </label>
        <label>
          Радиус:
          <input type="range" min="6" max="40" step="1" value={sprayRadius} onChange={handleSprayRadius} />
          <span>{sprayRadius}</span>
        </label>
        <label>
          Плотность:
          <input type="range" min="10" max="100" step="1" value={dotsPerTick} onChange={handleDotsPerTick} />
          <span>{dotsPerTick}</span>
        </label>
        <label>
          Скорость:
          <input type="range" min="0.5" max="3.5" step="0.1" value={speedFactor} onChange={handleSpeedFactor} />
          <span>{speedFactor.toFixed(1)}</span>
        </label>
        <label>
          Цвет:
          <input type="color" value={currentColor} onChange={handleColorChange} />
        </label>
        <button onClick={handleUndo}>Undo</button>
        <button onClick={handleClear}>Очистить</button>
        <button onClick={handleDownload}>Скачать PNG</button>
        <span>Осталось краски: <b>{paintLeft}</b></span>
      </div>
      <div style={{ border: "1px solid #bbb", background: "#fff", touchAction: "none", position:"relative", width:"100%", height:"70vh" }}>
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            cursor: paintLeft > 0 ? "crosshair" : "not-allowed",
            background:"transparent"
          }}
          onPointerDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        />
        {paintLeft <= 0 && (
          <div style={{
            position:"absolute",
            left:0,right:0,top:0,bottom:0,
            background:"rgba(255,255,255,.7)",
            color:"#222",
            fontSize:"2em",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            pointerEvents:"none"
          }}>
            Краска закончилась!
          </div>
        )}
      </div>
      <div style={{fontSize:"80%", color:"#888", marginTop:"6px"}}>
        Нарисуй граффити! Управляй цветом и параметрами спрея.
      </div>
    </div>
  );
}
