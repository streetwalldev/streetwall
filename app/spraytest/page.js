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

  // UI state
  const [lineScale, setLineScale] = useState(DEFAULT_CONFIG.lineScale);
  const [sprayRadius, setSprayRadius] = useState(DEFAULT_CONFIG.sprayRadius);
  const [dotsPerTick, setDotsPerTick] = useState(DEFAULT_CONFIG.dotsPerTick);
  const [speedFactor, setSpeedFactor] = useState(DEFAULT_CONFIG.speedFactor);
  const [currentColor, setCurrentColor] = useState(DEFAULT_CONFIG.currentColor);
  const [paintLeft, setPaintLeft] = useState(DEFAULT_CONFIG.paintLeft);

  // Resize canvas to fit container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.parentElement?.clientHeight || 600;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    paintedPixelsRef.current.clear();
    setPaintLeft(DEFAULT_CONFIG.paintLeft);
  }, []);

  // Spray logic
  function sprayAt(x, y) {
    if (paintLeft <= 0) return;

    const ctx = ctxRef.current;
    if (!ctx) return;

    let drops = 0;
    let used = 0;

    for (let i = 0; i < dotsPerTick; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * sprayRadius;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      // Spray dot
      ctx.save();
      ctx.globalAlpha = 0.22 + Math.random() * 0.18;
      ctx.fillStyle = currentColor;
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, 1.2 + Math.random() * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Drip effect
      drops++;
      const threshold = Math.max(10, 14 * lineScale);
      if (drops > threshold && drops % 3 === 0) {
        const dripLen =
          Math.min(
            250 * lineScale,
            Math.sqrt(drops - threshold) * 4 * lineScale + getRandomInt(-1, 2)
          );
        ctx.save();
        ctx.globalAlpha = 0.12 + Math.random() * 0.01;
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath();
        ctx.moveTo(
          x + dx + getRandomInt(-1, 1),
          y + dy + sprayRadius / 2
        );
        ctx.lineTo(
          x + dx + getRandomInt(-1, 1),
          y + dy + sprayRadius / 2 + dripLen
        );
        ctx.stroke();
        ctx.restore();
      }

      // Paint consumption per unique pixel
      const px = Math.round(x + dx);
      const py = Math.round(y + dy);
      const key = `${px}_${py}`; // ✅ ИСПРАВЛЕНО: template literal
      if (!paintedPixelsRef.current.has(key)) {
        paintedPixelsRef.current.add(key);
        used++;
      }
    }

    if (used > 0) {
      const newPaintLeft = paintLeft - used;
      setPaintLeft(newPaintLeft);
      if (newPaintLeft <= 0) {
        drawingRef.current = false;
        alert("🎨 Краска закончилась!");
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
    if (paintLeft <= 0) return;
    e.preventDefault();
    saveUndo();
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
    if (!drawingRef.current || paintLeft <= 0) return;
    e.preventDefault();
    const { x, y } = getRelativeCoords(e);

    let { x: lx, y: ly } = lastPointRef.current;
    if (lx == null || ly == null) {
      lx = x; ly = y;
    }
    const dist = Math.hypot(x - lx, y - ly);
    const steps = Math.max(1, Math.floor(dist / (2 * sprayRadius) * speedFactor));
    for (let i = 1; i <= steps; i++) {
      const nx = lx + ((x - lx) * i) / steps;
      const ny = ly + ((y - ly) * i) / steps;
      sprayAt(nx, ny);
    }
    lastPointRef.current = { x, y };
  }

  function handlePointerUp() {
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
        ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
      );
      if (undoStackRef.current.length > 20) undoStackRef.current.shift();
    } catch {}
  }

  function handleUndo() {
    if (!undoStackRef.current.length) return;
    const imageData = undoStackRef.current.pop();
    ctxRef.current.putImageData(imageData, 0, 0);
    paintedPixelsRef.current.clear(); // reset since we can't track per-pixel history easily
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !canvas) return;
    saveUndo();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paintedPixelsRef.current.clear();
    setPaintLeft(DEFAULT_CONFIG.paintLeft);
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "spray-art.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // UI handlers
  function handleLineScale(e) { setLineScale(Number(e.target.value)); }
  function handleSprayRadius(e) { setSprayRadius(Number(e.target.value)); }
  function handleDotsPerTick(e) { setDotsPerTick(Number(e.target.value)); }
  function handleSpeedFactor(e) { setSpeedFactor(Number(e.target.value)); }
  function handleColorChange(e) { setCurrentColor(e.target.value); }

  return (
    <div style={{ userSelect: "none", maxWidth: "100vw", padding: "10px", fontFamily: "system-ui" }}>
      <div style={{ display: "flex", gap: "1em", alignItems: "center", marginBottom: "8px", flexWrap: "wrap" }}>
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
      <div style={{ 
        border: "1px solid #444", 
        background: "#111", 
        touchAction: "none", 
        position:"relative", 
        width:"100%", 
        height:"70vh",
        borderRadius: "4px"
      }}>
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            cursor: paintLeft > 0 ? "crosshair" : "not-allowed",
          }}
          onPointerDown={handlePointerDown}
          onTouchStart={handlePointerDown}
        />
        {paintLeft <= 0 && (
          <div style={{
            position:"absolute",
            left:0,right:0,top:0,bottom:0,
            background:"rgba(0,0,0,0.7)",
            color:"#fff",
            fontSize:"1.5em",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            pointerEvents:"none"
          }}>
            Краска закончилась!
          </div>
        )}
      </div>
      <div style={{fontSize:"85%", color:"#aaa", marginTop:"8px", maxWidth: "800px"}}>
        Нарисуй граффити! Зажми мышь и води курсором — имитация аэрозольного баллончика с подтёками.
      </div>
    </div>
  );
}
