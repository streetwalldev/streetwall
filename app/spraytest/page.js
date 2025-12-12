);
        ctx.stroke();
        ctx.restore();
      }

      dotsDrawn++;
      paintLeftNow--;
    }

    lastSprayPosRef.current = { x, y };
    lastSprayTimeRef.current = now;

    setPaintLeft(paintLeftNow); // обновить краску
  }

  // --- Цикл рисования ---
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

  // --- Обработчики мыши/тача ---
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

  // --- Сброс/очистка ---
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

  // --- Загрузка фонового изображения ---
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

  // --- Стили ---
  // Можно вынести в отдельный css-модуль
  // Здесь инлайн для простоты.
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
        <h2>Spray Canvas</h2>
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
        <h3>Controls</h3>

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
