import { useRef, useState, useEffect } from 'react';

export default function Home({ initialPaint }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [paintLeft, setPaintLeft] = useState(initialPaint);

  // Функция для вычисления расстояния между двумя точками
  function getDistance(p1, p2) {
    if (!p1 || !p2) return 0;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Функция для рисования линии на canvas
  function drawLine(ctx, p1, p2) {
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
  }

  // Mouse Events
  function handleMouseDown(e) {
    if (paintLeft <= 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setIsDrawing(true);
    setLastPoint({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  function handleMouseMove(e) {
    if (!isDrawing || paintLeft <= 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    if (lastPoint) {
      const dist = getDistance(lastPoint, newPoint);

      // Если не хватает краски — ограничиваем длину линии
      let drawDist = dist;
      if (paintLeft < dist) {
        drawDist = paintLeft;
        // Вычисляем точку на нужном расстоянии по направлению движения
        const angle = Math.atan2(newPoint.y - lastPoint.y, newPoint.x - lastPoint.x);
        newPoint.x = lastPoint.x + drawDist * Math.cos(angle);
        newPoint.y = lastPoint.y + drawDist * Math.sin(angle);
      }

      const ctx = canvasRef.current.getContext('2d');
      drawLine(ctx, lastPoint, newPoint);

      setPaintLeft((prev) => Math.max(prev - drawDist, 0));
      setLastPoint({ ...newPoint });

      // Если краска кончилась — прекратить рисование
      if (paintLeft - drawDist <= 0) {
        setIsDrawing(false);
        setLastPoint(null);
      }
    }
  }

  function handleMouseUp() {
    setIsDrawing(false);
    setLastPoint(null);
  }

  // Для мобильных устройств (touch)
  function handleTouchStart(e) {
    if (paintLeft <= 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setIsDrawing(true);
    setLastPoint({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  }

  function handleTouchMove(e) {
    if (!isDrawing || paintLeft <= 0) return;
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const newPoint = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
    if (lastPoint) {
      const dist = getDistance(lastPoint, newPoint);

      let drawDist = dist;
      if (paintLeft < dist) {
        drawDist = paintLeft;
        const angle = Math.atan2(newPoint.y - lastPoint.y, newPoint.x - lastPoint.x);
        newPoint.x = lastPoint.x + drawDist * Math.cos(angle);
        newPoint.y = lastPoint.y + drawDist * Math.sin(angle);
      }

      const ctx = canvasRef.current.getContext('2d');
      drawLine(ctx, lastPoint, newPoint);


setPaintLeft((prev) => Math.max(prev - drawDist, 0));
      setLastPoint({ ...newPoint });

      if (paintLeft - drawDist <= 0) {
        setIsDrawing(false);
        setLastPoint(null);
      }
    }
  }

  function handleTouchEnd() {
    setIsDrawing(false);
    setLastPoint(null);
  }

  // Очистить холст и сбросить краску
  function handleClear() {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setPaintLeft(initialPaint);
  }

  // Для SSR: при изменении initialPaint сбрасываем paintLeft
  useEffect(() => {
    setPaintLeft(initialPaint);
  }, [initialPaint]);

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h1>Палитра художника 🎨</h1>
      <p>
        Осталось краски: <b>{Math.round(paintLeft)}</b> px
      </p>
      <button onClick={handleClear} style={{marginBottom: "10px"}}>Очистить холст</button>
      <br />
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{
          border: '1px solid #888',
          cursor: paintLeft > 0 ? 'crosshair' : 'not-allowed',
          background: '#fff',
          touchAction: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      {paintLeft <= 0 && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Краска закончилась!
        </div>
      )}
    </div>
  );
}

// SSR — серверная инициализация лимита краски
export async function getServerSideProps() {
  // Можно брать лимит из куки/БД/сессии если нужно
  return { props: { initialPaint: 1000 } };
}
