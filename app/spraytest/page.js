//app/spraytest/page.js
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function SprayTestPage() {
  // Дефолтные параметры из примера
  const [scaleVal, setScaleVal] = useState(0.65); // Line Scale
  const [radiusVal, setRadiusVal] = useState(45); // Радиус
  const [densityVal, setDensityVal] = useState(5600); // Плотность
  const [speedFactorVal, setSpeedFactorVal] = useState(1.5); // Скорость
  const [paintLeft, setPaintLeft] = useState(1000000); // Лимит краски до 1,000,000
  const [currentColor, setCurrentColor] = useState('#ff3366');
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Состояния для системы баллончика
  const [actualRadius, setActualRadius] = useState(45);
  const [actualDensity, setActualDensity] = useState(5600);
  const [actualSpeed, setActualSpeed] = useState(0.65);
  const [actualSpeedFactor, setActualSpeedFactor] = useState(1.5);
  
  // Текущий активный пресет
  const [activePreset, setActivePreset] = useState('50cm');
  
  // Ref для доступа к DOM элементам
  const scaleValRef = useRef(null);
  const radiusValRef = useRef(null);
  const densityValRef = useRef(null);
  const speedFactorValRef = useRef(null);
  const paintLeftElRef = useRef(null);
  const canLevelRef = useRef(null);
  const colorPickerRef = useRef(null);
  const canIndicatorRef = useRef(null);

  // Обновленные пресеты с улучшенным пресетом 10см
  const presets = {
    '50cm': { 
      name: '50cm',
      scaleVal: 0.65, 
      radiusVal: 45, 
      densityVal: 5600,
      speedFactor: 1.5,
      description: 'Рисунок с расстояния 50 см',
      paintConsumption: 1,
      enableDrips: false,
      // Динамические параметры при уменьшении краски
      minRadius: 45,   // При paintLeft = 1000000
      maxRadius: 65,   // При paintLeft = 100000
      minDensity: 2000, // При paintLeft = 100000
      maxDensity: 5600  // При paintLeft = 1000000
    },
    '25cm': { 
      name: '25cm',
      description: 'Рисунок с расстояния 25 см',
      scaleVal: 0.65, 
      radiusVal: 20, 
      densityVal: 3000,
      speedFactor: 2.0,
      paintConsumption: 2,
      enableDrips: false,
      dripDelay: 0.5,
      // Динамические параметры при уменьшении краски
      minDensity: 1500,  // При paintLeft = 100000
      maxDensity: 3000,  // При paintLeft = 1000000
      minSpeedFactor: 1.5, // При paintLeft = 100000
      maxSpeedFactor: 2.0  // При paintLeft = 1000000
    },
    '10cm': { 
      name: '10cm',
      description: 'Рисунок с расстояния 10 см (очень детализировано)',
      scaleVal: 0.85,   // Увеличил для большего контроля
      radiusVal: 6,     // Чуть меньше радиуса для точности
      densityVal: 12000, // Высокая плотность для детализации
      speedFactor: 4,   // Более чувствительный
      // Динамические параметры при уменьшении краски
      minSpeedFactor: 2.0, // Минимум
      maxSpeedFactor: 6.0, // Максимум
      // Подтёки - более деликатные
      enableDrips: true,
      dripDelay: 0.3,      // Быстрее появляются
      dripLength: 0.8,     // Короче
      dripMaxLength: 3,    // Макс длина
      dripAlpha: 0.4,      // Прозрачнее
      dripChance: 0.08,    // Реже
      dripWidth: 0.5,      // Тоньше
      dripWidthVariation: 0.2,
      // Новые параметры для реализма
      cloudShape: 'elliptical', // Форма облака
      layers: 3,                 // Количество слоёв
      centerBias: 0.7,          // Смещение к центру (0-1)
      edgeFog: true,            // Туманный край
      paintConsumption: 4       // Больше краски для детализации
    },
    'grunt': { 
      name: 'Grunt',
      description: 'Грунтовка валиком',
      scaleVal: 1, 
      radiusVal: 100, // Ширина валика (15px) + размытие
      densityVal: 8000, // Очень высокая плотность для сплошного покрытия
      speedFactor: 5,
      paintConsumption: 5, // Большой расход краски
      enableDrips: true,
      dripDelay: 3,
      dripLength: 15,
      dripMaxLength: 30,
      dripAlpha: 0.08,
      dripChance: 0.1,
      rollerWidth: 100,
      rollerHeight: 30
    }
  };

  // Функция для расчета динамических параметров на основе оставшейся краски
  const calculateDynamicParams = useCallback((paintRemaining, presetKey) => {
    const preset = presets[presetKey];
    if (!preset) return { radius: preset.radiusVal, density: preset.densityVal, speedFactor: preset.speedFactor };
    
    const paintPercentage = paintRemaining / 1000000; // 0.0 - 1.0
    
    if (presetKey === '50cm') {
      // Для 50cm: радиус и плотность меняются от 1000000 до 100000
      if (paintRemaining <= 100000) {
        return {
          radius: preset.maxRadius || 65,
          density: preset.minDensity || 2000,
          speedFactor: preset.speedFactor
        };
      }
      
      const progress = 1 - ((paintRemaining - 100000) / 900000);
      const radius = preset.minRadius + (preset.maxRadius - preset.minRadius) * progress;
      const density = preset.maxDensity - (preset.maxDensity - preset.minDensity) * progress;
      
      return {
        radius: Math.round(radius),
        density: Math.round(density),
        speedFactor: preset.speedFactor
      };
    }
    
    if (presetKey === '25cm') {
      // Для 25cm: плотность и speedFactor меняются
      if (paintRemaining <= 100000) {
        return {
          radius: preset.radiusVal,
          density: preset.minDensity || 1500,
          speedFactor: preset.minSpeedFactor || 1.5
        };
      }
      
      const progress = 1 - ((paintRemaining - 100000) / 900000);
      const density = preset.maxDensity - (preset.maxDensity - preset.minDensity) * progress;
      const speedFactor = preset.maxSpeedFactor - (preset.maxSpeedFactor - preset.minSpeedFactor) * progress;
      
      return {
        radius: preset.radiusVal,
        density: Math.round(density),
        speedFactor: parseFloat(speedFactor.toFixed(1))
      };
    }
    
    if (presetKey === '10cm') {
      // Для 10cm: speedFactor меняется
      if (paintRemaining <= 100000) {
        return {
          radius: preset.radiusVal,
          density: preset.densityVal,
          speedFactor: preset.minSpeedFactor || 2.0
        };
      }
      
      const progress = 1 - ((paintRemaining - 100000) / 900000);
      const speedFactor = preset.minSpeedFactor + (preset.maxSpeedFactor - preset.minSpeedFactor) * progress;
      
      return {
        radius: preset.radiusVal,
        density: preset.densityVal,
        speedFactor: parseFloat(speedFactor.toFixed(1))
      };
    }
    
    // Для grunt - стандартные значения
    return {
      radius: preset.radiusVal,
      density: preset.densityVal,
      speedFactor: preset.speedFactor
    };
  }, [presets]);

  // Функция для применения пресета
  const applyPreset = useCallback((presetKey) => {
    if (!presets[presetKey]) {
      console.error(`Пресет ${presetKey} не найден`);
      return;
    }
    
    const selectedPreset = presets[presetKey];
    const dynamicParams = calculateDynamicParams(paintLeft, presetKey);
    
    // Устанавливаем значения состояния
    setScaleVal(selectedPreset.scaleVal);
    setRadiusVal(dynamicParams.radius);
    setDensityVal(dynamicParams.density);
    setSpeedFactorVal(dynamicParams.speedFactor);
    setActivePreset(presetKey);
    
    // Немедленно обновляем фактические параметры
    setActualRadius(dynamicParams.radius);
    setActualDensity(dynamicParams.density);
    setActualSpeed(selectedPreset.scaleVal);
    setActualSpeedFactor(dynamicParams.speedFactor);
    
    // Обновляем UI
    if (scaleValRef.current) scaleValRef.current.textContent = selectedPreset.scaleVal.toFixed(2);
    if (radiusValRef.current) radiusValRef.current.textContent = dynamicParams.radius;
    if (densityValRef.current) densityValRef.current.textContent = dynamicParams.density;
    if (speedFactorValRef.current) speedFactorValRef.current.textContent = dynamicParams.speedFactor.toFixed(1);
    
    // Обновляем значения в JS части
    if (window.updateSprayParams) {
      window.updateSprayParams(
        dynamicParams.radius,
        dynamicParams.density,
        selectedPreset.scaleVal,
        dynamicParams.speedFactor,
        presetKey,
        selectedPreset.enableDrips || false,
        selectedPreset.paintConsumption || 1,
        selectedPreset
      );
    }
    
    // Обновляем слайдеры
    const scaleRange = document.getElementById('scaleRange');
    const radiusRange = document.getElementById('radiusRange');
    const densityRange = document.getElementById('densityRange');
    const speedFactorInput = document.getElementById('speedFactor');
    
    if (scaleRange) scaleRange.value = selectedPreset.scaleVal;
    if (radiusRange) radiusRange.value = dynamicParams.radius;
    if (densityRange) densityRange.value = dynamicParams.density;
    if (speedFactorInput) speedFactorInput.value = dynamicParams.speedFactor;
    
    console.log(`Применен пресет: ${presetKey}`, { ...selectedPreset, dynamicParams });
  }, [presets, paintLeft, calculateDynamicParams]);

  // Обработчик выбора цвета через клик на баллончик
  const handleCanClick = useCallback(() => {
    setShowColorPicker(true);
    
    // Фокусируем на input color для открытия нативного пикера
    setTimeout(() => {
      if (colorPickerRef.current) {
        colorPickerRef.current.click();
      }
    }, 0);
  }, []);

  // Обработчик изменения цвета при выборе в нативном пикере
  const handleColorChange = useCallback((e) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    
    // Обновляем в JS части
    if (window.updateSprayColor) {
      window.updateSprayColor(newColor);
    }
    
    console.log('Цвет изменен на:', newColor);
  }, []);

  // Обработчик закрытия пикера при клике вне его
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showColorPicker && canIndicatorRef.current && !canIndicatorRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
    };

    // Добавляем обработчик при монтировании
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      // Удаляем обработчики при размонтировании
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showColorPicker]);

  // Обновляем динамические параметры при изменении краски
  useEffect(() => {
    if (activePreset) {
      const dynamicParams = calculateDynamicParams(paintLeft, activePreset);
      
      setRadiusVal(dynamicParams.radius);
      setDensityVal(dynamicParams.density);
      setSpeedFactorVal(dynamicParams.speedFactor);
      
      setActualRadius(dynamicParams.radius);
      setActualDensity(dynamicParams.density);
      setActualSpeedFactor(dynamicParams.speedFactor);
      
      // Обновляем UI
      if (radiusValRef.current) radiusValRef.current.textContent = dynamicParams.radius;
      if (densityValRef.current) densityValRef.current.textContent = dynamicParams.density;
      if (speedFactorValRef.current) speedFactorValRef.current.textContent = dynamicParams.speedFactor.toFixed(1);
      
      // Обновляем слайдеры
      const radiusRange = document.getElementById('radiusRange');
      const densityRange = document.getElementById('densityRange');
      const speedFactorInput = document.getElementById('speedFactor');
      
      if (radiusRange) radiusRange.value = dynamicParams.radius;
      if (densityRange) densityRange.value = dynamicParams.density;
      if (speedFactorInput) speedFactorInput.value = dynamicParams.speedFactor;
      
      // Обновляем в JS части
      if (window.updateSprayParams) {
        window.updateSprayParams(
          dynamicParams.radius,
          dynamicParams.density,
          scaleVal,
          dynamicParams.speedFactor,
          activePreset,
          presets[activePreset]?.enableDrips || false,
          presets[activePreset]?.paintConsumption || 1,
          presets[activePreset]
        );
      }
    }
  }, [paintLeft, activePreset, scaleVal, presets, calculateDynamicParams]);

  // Инициализация системы при загрузке
  useEffect(() => {
    // Применяем пресет 50cm при загрузке
    applyPreset('50cm');
  }, []);

  // Обновление фактических параметров при изменении базовых через слайдеры
  useEffect(() => {
    if (window.updateSprayParams) {
      window.updateSprayParams(
        actualRadius, 
        actualDensity, 
        actualSpeed,
        actualSpeedFactor,
        activePreset, 
        presets[activePreset]?.enableDrips || false,
        presets[activePreset]?.paintConsumption || 1,
        presets[activePreset]
      );
    }
  }, [actualRadius, actualDensity, actualSpeed, actualSpeedFactor, activePreset, presets]);

  return (
    <div style={{ margin: 0, padding: 0, background: '#000', minHeight: '100vh', color: '#fff', overflowX: 'auto' }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* === ГЛОБАЛЬНЫЕ СТИЛИ === */
            body { 
              font-family: system-ui, sans-serif; 
              margin: 0; 
              padding: 0; 
              overflow: hidden; 
            }
            canvas { 
              display: block; 
              background: #000; 
              cursor: crosshair; 
              touch-action: none; 
              user-select: none; 
              border: 1px dashed #343434;
              border-radius: 4px;
            }
            /* === АДАПТИВ === */
            @media (max-width: 700px) {
              #burger { display: block; }
              #controls-panel {
                right: -100%;
                opacity: 0;
                visibility: hidden;
              }
              #controls-panel.open {
                right: 0;
                opacity: 1;
                visibility: visible;
              }
              #canvas-container {
                width: 1024px;
                height: 1024px;
              }
            }
            @media (min-width: 701px) {
              #burger { display: none !important; }
              #controls-panel {
                right: 0 !important;
                opacity: 1 !important;
                visibility: visible !important;
                border-left: 1px solid #333;
              }
              #canvas-container {
                position: absolute;
                top: 20px;
                left: 20px;
                width: 1024px;
                height: 1024px;
              }
            }
            /* === БУРГЕР-МЕНЮ === */
            #burger {
              position: fixed;
              top: 16px;
              left: 16px;
              width: 32px;
              height: 24px;
              z-index: 1001;
              cursor: pointer;
              padding: 8px;
              background: rgba(0,0,0,0.4);
              border-radius: 4px;
            }
            .bar {
              display: block;
              width: 100%;
              height: 3px;
              background: #aaa;
              margin: 4px 0;
              transition: 0.3s;
              border-radius: 2px;
            }
            #burger.open .bar:nth-child(1) { 
              transform: rotate(45deg) translate(6px, 6px); 
              background: #ff3366;
            }
            #burger.open .bar:nth-child(2) { opacity: 0; }
            #burger.open .bar:nth-child(3) { 
              transform: rotate(-45deg) translate(6px, -6px); 
              background: #ff3366;
            }
            /* === КАСТОМНЫЙ КУРСОР — РОЗОВЫЙ КРУГ 16×16 === */
            #customCursor {
              position: fixed;
              width: 16px;
              height: 16px;
              border-radius: 50%;
              background: #ff3366;
              pointer-events: none;
              transform: translate(-50%, -50%);
              z-index: 1000;
              display: none;
              box-shadow: 0 0 6px rgba(255, 51, 102, 0.6);
            }
            /* === ПАНЕЛЬ УПРАВЛЕНИЯ === */
            #controls-panel {
              position: fixed;
              top: 0;
              right: 0;
              width: 320px;
              height: 100vh;
              background: rgba(15,15,15,0.96);
              padding: 24px 16px;
              color: #eee;
              z-index: 1000;
              overflow-y: auto;
              transition: all 0.3s ease;
            }
            /* === КОНТРОЛЫ === */
            .control-group { margin-bottom: 16px; }
            label { display: block; margin-bottom: 6px; font-size: 0.95em; color: #ccc; }
            input[type="range"] { width: 100%; margin-top: 4px; }
            button { 
              padding: 8px 16px;
              background: #333;
              color: #fff;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-weight: bold;
              width: 100%;
              margin-top: 6px;
            }
            button:hover { background: #444; }
            /* === ВЕРСИЯ === */
            #version {
              position: fixed;
              bottom: 12px;
              left: 32px;
              font-size: 0.7rem;
              opacity: 0.5;
              color: #666;
              z-index: 100;
              pointer-events: none;
              background: rgba(0,0,0,0.3);
              padding: 2px 6px;
              border-radius: 4px;
            }
            /* === ИНДИКАТОР БАЛЛОНЧИКА === */
            .can-indicator {
              margin-top: 20px;
              padding: 15px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
              text-align: center;
              cursor: pointer;
              transition: all 0.2s ease;
              position: relative;
            }
            .can-indicator:hover {
              background: rgba(255, 255, 255, 0.15);
              transform: translateY(-2px);
            }
            .can-visual {
              width: 80px;
              height: 160px;
              margin: 0 auto 10px;
              background: #333;
              border-radius: 40px 40px 20px 20px;
              position: relative;
              overflow: hidden;
              border: 2px solid #555;
            }
            .can-fill {
              position: absolute;
              bottom: 0;
              width: 100%;
              background: linear-gradient(to top, var(--current-color, #ff3366), var(--current-color-light, #ff6699));
              transition: height 0.5s ease;
              border-radius: 0 0 20px 20px;
            }
            .can-info {
              font-size: 12px;
              margin-top: 5px;
              color: #aaa;
            }
            .color-picker-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: rgba(0,0,0,0.8);
              border-radius: 10px;
              z-index: 10;
              pointer-events: none;
            }
            .color-picker-container.active {
              pointer-events: all;
            }
            .color-picker-container input[type="color"] {
              width: 50px;
              height: 50px;
              border: none;
              border-radius: 50%;
              cursor: pointer;
              opacity: 0;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            .color-selection-hint {
              color: #fff;
              font-size: 12px;
              text-align: center;
              margin-top: 10px;
              opacity: 0.7;
            }
            /* === ПРЕСЕТЫ === */
            .presets-container {
              position: fixed;
              top: 16px;
              left: 50%;
              transform: translateX(-50%);
              display: flex;
              gap: 10px;
              z-index: 1000;
              background: rgba(0,0,0,0.7);
              padding: 8px 16px;
              border-radius: 20px;
              backdrop-filter: blur(5px);
            }
            .preset-button {
              padding: 6px 12px;
              background: rgba(255, 255, 255, 0.1);
              color: #aaa;
              border: 1px solid transparent;
              border-radius: 5px;
              cursor: pointer;
              transition: all 0.2s ease;
              font-size: 0.9rem;
              white-space: nowrap;
            }
            .preset-button.active {
              background: rgba(255, 51, 102, 0.3);
              color: #fff;
              border-color: #ff3366;
            }
            .preset-button:hover {
              background: rgba(255, 255, 255, 0.2);
            }
            /* === ИНДИКАТОР ПОДТЁКОВ === */
            .drip-indicator {
              display: inline-block;
              margin-left: 5px;
              font-size: 10px;
              color: #ff3366;
              animation: drip-pulse 1s infinite;
            }
            @keyframes drip-pulse {
              0% { opacity: 0.5; }
              50% { opacity: 1; }
              100% { opacity: 0.5; }
            }
            /* === ИНФОРМАЦИЯ О ПРЕСЕТЕ === */
            .preset-info {
              font-size: 11px;
              color: #888;
              margin-top: 5px;
              line-height: 1.3;
              font-style: italic;
            }
            .dynamic-info {
              font-size: 10px;
              color: #666;
              margin-top: 3px;
              line-height: 1.2;
            }
            /* === СКРЫТЫЙ ИНПУТ ЦВЕТА === */
            .hidden-color-input {
              position: absolute;
              opacity: 0;
              pointer-events: none;
              width: 0;
              height: 0;
            }
            /* === ИНПУТ ЦВЕТА ДЛЯ ОТКРЫТИЯ НАТИВНОГО ПИКЕРА === */
            .native-color-input {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              opacity: 0;
              cursor: pointer;
              z-index: 20;
            }
          `,
        }}
      />
      <div style={{ position: 'relative', width: 'max-content', minWidth: '100vw', height: '100vh' }}>
        <div id="canvas-container">
          <canvas id="sprayCanvas" width="1024" height="1024"></canvas>
        </div>

        <div id="burger">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* Пресеты вверху вместо счетчика */}
        <div className="presets-container">
          {Object.keys(presets).map(key => (
            <button
              key={key}
              className={`preset-button ${activePreset === key ? 'active' : ''}`}
              onClick={() => applyPreset(key)}
            >
              {presets[key].name}
              {key === '10cm' || key === 'grunt' ? (
                <span className="drip-indicator" title="Включены подтёки">💧</span>
              ) : null}
            </button>
          ))}
        </div>

        <div id="customCursor"></div>

        <div id="controls-panel">
          <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Spray Controls</h3>
          
          {/* Индикатор баллончика с выбором цвета */}
          <div 
            className="can-indicator" 
            ref={canIndicatorRef}
            onClick={handleCanClick}
            style={{ position: 'relative' }}
          >
            {showColorPicker && (
              <div className="color-picker-container active">
                <input 
                  type="color" 
                  ref={colorPickerRef}
                  value={currentColor}
                  onChange={handleColorChange}
                  className="native-color-input"
                  title="Выберите цвет"
                />
                <div style={{ color: '#fff', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                  Выберите цвет краски<br/>
                  <small style={{ opacity: 0.7 }}>Нажмите вне этого окна для применения</small>
                </div>
              </div>
            )}
            <h4 style={{ marginBottom: '10px' }}>Остаток краски</h4>
            <div className="can-visual">
              <div 
                className="can-fill" 
                style={{ 
                  height: `${(paintLeft / 1000000) * 100}%`,
                  '--current-color': currentColor,
                  '--current-color-light': `${currentColor}CC`
                }}
              />
            </div>
            <div className="can-info">
              
              
            </div>
            <div className="preset-info">
              
              {presets[activePreset]?.description}
            </div>
            {activePreset === '50cm' && paintLeft <= 200000 && (
              <div className="dynamic-info">
                Динамика: радиус ↑ {radiusVal}px, плотность ↓ {densityVal}
              </div>
            )}
            {activePreset === '25cm' && paintLeft <= 200000 && (
              <div className="dynamic-info">
                Динамика: плотность ↓ {densityVal}, скорость ↓ {speedFactorVal.toFixed(1)}
              </div>
            )}
            {activePreset === '10cm' && paintLeft <= 200000 && (
              <div className="dynamic-info">
                Динамика: скорость ↑ {speedFactorVal.toFixed(1)}
              </div>
            )}
            {activePreset === 'grunt' && (
              <div className="dynamic-info">
                Режим: валик 15×50px, расход: {presets['grunt'].paintConsumption}px
              </div>
            )}
            {showColorPicker && (
              <div className="color-selection-hint">
                ⚠️ Выберите цвет в открывшемся окне, затем нажмите в любом месте
              </div>
            )}
          </div>

          <div className="control-group">
            <label>Line Scale: <span id="scaleVal" ref={scaleValRef}>0.65</span></label>
            <input type="range" id="scaleRange" min="0.1" max="1.0" step="0.05" value={scaleVal} 
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setScaleVal(value);
                setActualSpeed(value);
                if (window.updateSprayParams) {
                  window.updateSprayParams(
                    actualRadius, 
                    actualDensity, 
                    value,
                    actualSpeedFactor,
                    activePreset, 
                    presets[activePreset]?.enableDrips || false,
                    presets[activePreset]?.paintConsumption || 1,
                    presets[activePreset]
                  );
                }
              }} />
          </div>
          <div className="control-group">
            <label>Радиус: <span id="radiusVal" ref={radiusValRef}>45</span> px</label>
            <input type="range" id="radiusRange" min="5" max="100" value={radiusVal} 
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setRadiusVal(value);
                setActualRadius(value);
                if (window.updateSprayParams) {
                  window.updateSprayParams(
                    value, 
                    actualDensity, 
                    actualSpeed,
                    actualSpeedFactor,
                    activePreset, 
                    presets[activePreset]?.enableDrips || false,
                    presets[activePreset]?.paintConsumption || 1,
                    presets[activePreset]
                  );
                }
              }} />
          </div>
          <div className="control-group">
            <label>Плотность: <span id="densityVal" ref={densityValRef}>5600</span></label>
            <input type="range" id="densityRange" min="50" max="10000" value={densityVal} 
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (value < 50) return;
                setDensityVal(value);
                setActualDensity(value);
                if (window.updateSprayParams) {
                  window.updateSprayParams(
                    actualRadius, 
                    value, 
                    actualSpeed,
                    actualSpeedFactor,
                    activePreset, 
                    presets[activePreset]?.enableDrips || false,
                    presets[activePreset]?.paintConsumption || 1,
                    presets[activePreset]
                  );
                }
              }} />
          </div>
          <div className="control-group">
            <label>Скорость: <span id="speedFactorVal" ref={speedFactorValRef}>1.5</span></label>
            <input type="range" id="speedFactor" min="0.1" max="5.0" step="0.1" value={speedFactorVal} 
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setSpeedFactorVal(value);
                setActualSpeedFactor(value);
                if (window.updateSprayParams) {
                  window.updateSprayParams(
                    actualRadius, 
                    actualDensity, 
                    actualSpeed,
                    value,
                    activePreset, 
                    presets[activePreset]?.enableDrips || false,
                    presets[activePreset]?.paintConsumption || 1,
                    presets[activePreset]
                  );
                }
              }} />
          </div>
          <div className="control-group">
            <label>Краски: <span id="paintLeft" ref={paintLeftElRef}>{paintLeft}</span></label>
            <button id="resetBtn">Очистить</button>
          </div>
          <div className="control-group">
            <label>Фон: <input type="file" id="bgImageInput" accept="image/*" /></label>
          </div>
        </div>
        
        <div id="version">1.4.72 © streetwall.art</div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const config = {
                sprayRadius: ${actualRadius},
                dotsPerTick: ${actualDensity},
                speedFactor: ${actualSpeedFactor},
                lineScale: ${actualSpeed},
                paintMax: 1000000,
                paintLeft: ${paintLeft},
                currentColor: '${currentColor}'
              };
              
              // Динамические параметры
              let dynamicRadius = ${actualRadius};
              let dynamicDensity = ${actualDensity};
              let dynamicSpeed = ${actualSpeed};
              let dynamicSpeedFactor = ${actualSpeedFactor};
              let currentPreset = '50cm';
              let enableDrips = false;
              let paintConsumption = 1;
              let presetConfig = ${JSON.stringify(presets['50cm'])};
              
              let isDrawing = false;
              let lastSprayPos = null;
              let lastSprayTime = null;
              
              // Система подтёков - храним капли для каждой ячейки
              const dripMap = {};
              const staticSprayMap = {}; // Для отслеживания статичного распыления
              let staticSprayStartTime = null;
              let isStaticSpraying = false;
              let lastStaticSprayPos = null;
              
              const paintedPixels = new Set();
              
              const canvas = document.getElementById('sprayCanvas');
              const ctx = canvas.getContext('2d');
              const colorPicker = document.querySelector('.hidden-color-input');
              const scaleRange = document.getElementById('scaleRange');
              const radiusRange = document.getElementById('radiusRange');
              const densityRange = document.getElementById('densityRange');
              const speedFactorInput = document.getElementById('speedFactor');
              const scaleVal = document.getElementById('scaleVal');
              const radiusVal = document.getElementById('radiusVal');
              const densityVal = document.getElementById('densityVal');
              const speedFactorVal = document.getElementById('speedFactorVal');
              const paintLeftEl = document.getElementById('paintLeft');
              const canLevelRef = document.getElementById('canLevelRef');
              const resetBtn = document.getElementById('resetBtn');
              const bgImageInput = document.getElementById('bgImageInput');
              const burger = document.getElementById('burger');
              const controlsPanel = document.getElementById('controls-panel');
              const customCursor = document.getElementById('customCursor');
              const canFill = document.querySelector('.can-fill');
              
              // Глобальная функция для обновления параметров спрея
              window.updateSprayParams = function(newRadius, newDensity, newSpeed, newSpeedFactor, presetKey, dripsEnabled, consumption, preset) {
                dynamicRadius = newRadius;
                dynamicDensity = newDensity;
                dynamicSpeed = newSpeed;
                dynamicSpeedFactor = newSpeedFactor;
                currentPreset = presetKey || currentPreset;
                enableDrips = dripsEnabled || false;
                paintConsumption = consumption || 1;
                presetConfig = preset || presetConfig;
                
                config.sprayRadius = dynamicRadius;
                config.dotsPerTick = dynamicDensity;
                config.lineScale = dynamicSpeed;
                config.speedFactor = dynamicSpeedFactor;
                
                if (radiusVal) radiusVal.textContent = Math.round(dynamicRadius);
                if (densityVal) densityVal.textContent = Math.round(dynamicDensity);
                if (scaleVal) scaleVal.textContent = dynamicSpeed.toFixed(2);
                if (speedFactorVal) speedFactorVal.textContent = dynamicSpeedFactor.toFixed(1);
                
                if (scaleRange) scaleRange.value = dynamicSpeed;
                if (radiusRange) radiusRange.value = dynamicRadius;
                if (densityRange) densityRange.value = dynamicDensity;
                if (speedFactorInput) speedFactorInput.value = dynamicSpeedFactor;
                
                console.log('Параметры спрея обновлены:', {
                  radius: dynamicRadius,
                  density: dynamicDensity,
                  speed: dynamicSpeed,
                  speedFactor: dynamicSpeedFactor,
                  preset: currentPreset,
                  dripsEnabled: enableDrips,
                  consumption: paintConsumption
                });
              };

              window.updateSprayColor = function(newColor) {
                config.currentColor = newColor;
                if (colorPicker) colorPicker.value = newColor;
                customCursor.style.background = config.currentColor;
                customCursor.style.boxShadow = '0 0 6px ' + config.currentColor + 'A0';
                
                if (canFill) {
                  canFill.style.setProperty('--current-color', config.currentColor);
                  canFill.style.setProperty('--current-color-light', config.currentColor + 'CC');
                }
                
                console.log('Цвет спрея обновлен:', newColor);
              };

              function updatePaintUI() {
                if (paintLeftEl) paintLeftEl.textContent = config.paintLeft;
                if (canLevelRef) canLevelRef.textContent = config.paintLeft;
                if (canFill) {
                  const fillPercentage = (config.paintLeft / config.paintMax) * 100;
                  canFill.style.height = fillPercentage + '%';
                  const currentColor = config.currentColor;
                  canFill.style.setProperty('--current-color', currentColor);
                  canFill.style.setProperty('--current-color-light', currentColor + 'CC');
                }
              }

              function updateUI() {
                if (paintLeftEl) paintLeftEl.textContent = config.paintLeft;
                if (canLevelRef) canLevelRef.textContent = config.paintLeft;
                if (scaleVal) scaleVal.textContent = config.lineScale.toFixed(2);
                if (radiusVal) radiusVal.textContent = Math.round(config.sprayRadius);
                if (densityVal) densityVal.textContent = Math.round(config.dotsPerTick);
                if (speedFactorVal) speedFactorVal.textContent = config.speedFactor.toFixed(1);
                updatePaintUI();
              }

              ctx.fillStyle = '#000';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              function getCanvasCoords(e) {
                const rect = canvas.getBoundingClientRect();
                const clientX = e.touches?.[0]?.clientX || e.clientX;
                const clientY = e.touches?.[0]?.clientY || e.clientY;
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                return {
                  x: (clientX - rect.left) * scaleX,
                  y: (clientY - rect.top) * scaleY
                };
              }

              // Функция для проверки статичного распыления
              function checkStaticSpray(x, y) {
                if (!lastStaticSprayPos) {
                  lastStaticSprayPos = { x, y };
                  staticSprayStartTime = Date.now();
                  isStaticSpraying = true;
                  return false;
                }
                
                // Проверяем, сместился ли курсор значительно
                const distance = Math.hypot(x - lastStaticSprayPos.x, y - lastStaticSprayPos.y);
                const threshold = 5; // пикселей
                
                if (distance > threshold) {
                  // Курсор сместился - сбрасываем статичное распыление
                  lastStaticSprayPos = { x, y };
                  staticSprayStartTime = Date.now();
                  isStaticSpraying = false;
                  return false;
                }
                
                // Проверяем, как долго удерживаем в одной точке
                const timeHeld = Date.now() - staticSprayStartTime;
                
                if (timeHeld > 100) { // 0.1 секунда задержки
                  isStaticSpraying = true;
                  return timeHeld;
                }
                
                isStaticSpraying = false;
                return false;
              }

              // Функция для создания подтёка при статичном распылении
              function createStaticDrip(x, y, size, color, timeHeld) {
                if (!enableDrips || !isStaticSpraying) return;
                
                // Вычисляем интенсивность подтёка на основе времени удержания
                const maxTime = 5000; // 5 секунд до максимального подтёка
                const intensity = Math.min(1, timeHeld / maxTime);
                
                // Шанс подтёка увеличивается со временем
                const dripChance = presetConfig.dripChance || 0.01;
                const enhancedChance = dripChance * (1 + intensity * 2);
                
                if (Math.random() < enhancedChance) {
                  // Длина подтёка зависит от времени удержания
                  const baseLength = presetConfig.dripLength || 1;
                  const maxLength = presetConfig.dripMaxLength || 4;
                  const dripLength = baseLength + (maxLength - baseLength) * intensity;
                  
                  // Прозрачность подтёка
                  const dripAlpha = presetConfig.dripAlpha || 0.5;
                  
                  ctx.save();
                  ctx.globalAlpha = dripAlpha * (0.8 + Math.random() * 0.1);
                  ctx.strokeStyle = color;
                  
                  // Используем параметры толщины из пресета
                  const dripWidth = presetConfig.dripWidth || 0.8;
                  const dripWidthVariation = presetConfig.dripWidthVariation || 0.3;
                  ctx.lineWidth = dripWidth + Math.random() * dripWidthVariation;
                  
                  ctx.beginPath();
                  ctx.moveTo(x + (Math.random() * 2 - 1), y + size / 2);
                  
                  // Делаем подтёк более извилистым при долгом удержании
                  const segments = 3 + Math.floor(intensity * 9);
                  let currentY = y + size / 1;
                  let currentX = x;
                  
                  for (let i = 0; i < segments; i++) {
                    const segmentLength = dripLength / segments;
                    const jitter = intensity * 3; // Более извилистый при долгом удержании
                    currentX += (Math.random() * 2 - 1) * jitter;
                    currentY += segmentLength;
                    ctx.lineTo(currentX, currentY);
                  }
                  
                  ctx.stroke();
                  ctx.restore();
                }
              }

              // Функция для распыления валиком
              function sprayWithRoller(x, y) {
                if (config.paintLeft <= 0) return;

                const now = performance.now();
                let speed = 0;
                if (lastSprayPos && lastSprayTime !== null) {
                  const dt = now - lastSprayTime;
                  const dist = Math.hypot(x - lastSprayPos.x, y - lastSprayPos.y);
                  speed = Math.min(1, dist / (dt || 1) / config.speedFactor);
                }

                const rollerWidth = presetConfig.rollerWidth || 15;
                const rollerHeight = presetConfig.rollerHeight || 50;
                
                ctx.fillStyle = config.currentColor;
                ctx.globalAlpha = 0.25;
                ctx.fillRect(
                  x - rollerWidth/2, 
                  y - rollerHeight/2, 
                  rollerWidth, 
                  rollerHeight
                );
                
                const blurRadius = 1;
                const pointsToDraw = Math.min(config.dotsPerTick, 500);
                
                for (let i = 0; i < pointsToDraw; i++) {
                  const offsetX = (Math.random() - 0.5) * (rollerWidth + blurRadius * 2);
                  const offsetY = (Math.random() - 0.5) * (rollerHeight + blurRadius * 2);
                  
                  if (Math.abs(offsetX) < rollerWidth/2 + blurRadius && Math.abs(offsetY) < rollerHeight/2 + blurRadius) {
                    const distanceFromEdgeX = Math.max(0, Math.abs(offsetX) - rollerWidth/2);
                    const distanceFromEdgeY = Math.max(0, Math.abs(offsetY) - rollerHeight/2);
                    const edgeDistance = Math.sqrt(distanceFromEdgeX * distanceFromEdgeX + distanceFromEdgeY * distanceFromEdgeY);
                    
                    ctx.globalAlpha = 0.3 * (1 - Math.min(1, edgeDistance / blurRadius));
                    ctx.fillStyle = config.currentColor;
                    ctx.beginPath();
                    ctx.arc(x + offsetX, y + offsetY, 1 + Math.random() * 2, 0, 2 * Math.PI);
                    ctx.fill();
                  }
                }
                
                // Подтёки для валика - проверяем статичное распыление
                const timeHeld = checkStaticSpray(x, y);
                if (timeHeld && enableDrips) {
                  const dripChance = presetConfig.dripChance || 0.02;
                  if (Math.random() < dripChance) {
                    ctx.save();
                    ctx.globalAlpha = presetConfig.dripAlpha || 0.08;
                    ctx.strokeStyle = config.currentColor;
                    ctx.lineWidth = 3 + Math.random() * 4;
                    ctx.beginPath();
                    ctx.moveTo(x + (Math.random() * 4 - 2), y + rollerHeight/2);
                    const dripLength = (presetConfig.dripLength || 15) * (1 + timeHeld / 5000);
                    ctx.lineTo(x + (Math.random() * 8 - 4), y + rollerHeight/2 + dripLength);
                    ctx.stroke();
                    ctx.restore();
                  }
                }
                
                const area = (rollerWidth + blurRadius * 2) * (rollerHeight + blurRadius * 2);
                const pixelsToConsume = Math.min(Math.ceil(area / 100), 50);
                
                for (let i = 0; i < pixelsToConsume; i++) {
                  const px = Math.round(x + (Math.random() - 0.5) * (rollerWidth + blurRadius));
                  const py = Math.round(y + (Math.random() - 0.5) * (rollerHeight + blurRadius));
                  const key = px + "_" + py;
                  
                  if (!paintedPixels.has(key)) {
                    paintedPixels.add(key);
                    config.paintLeft = Math.max(0, config.paintLeft - paintConsumption);
                    
                    if (window.updatePaintLeft) {
                      window.updatePaintLeft(config.paintLeft);
                    }
                  }
                }
                
                if (config.paintLeft <= 0) {
                  config.paintLeft = 0;
                  alert('Краска закончилась!');
                }

                updatePaintUI();
                lastSprayPos = { x, y };
                lastSprayTime = now;
                ctx.globalAlpha = 1;
              }

              // Специальная улучшенная функция распыления для пресета 10см
              function sprayAt10cm(x, y) {
                if (config.paintLeft <= 0) return;

                const now = performance.now();
                let speed = 0;
                let moveAngle = 0;
                
                if (lastSprayPos && lastSprayTime !== null) {
                  const dt = now - lastSprayTime;
                  const dist = Math.hypot(x - lastSprayPos.x, y - lastSprayPos.y);
                  speed = Math.min(1, dist / (dt || 1) / config.speedFactor);
                  moveAngle = Math.atan2(y - lastSprayPos.y, x - lastSprayPos.x);
                }

                const scale = config.lineScale;
                const stretchFactor = 1 + Math.min(1.5, speed * 3); // Вытягивание до 2.5x

                // Три слоя с разными параметрами
                const layers = [
                  { count: 0.5, alpha: 0.2, sizeMult: 0.7, radiusMult: 1.0 }, // Фон
                  { count: 0.35, alpha: 0.4, sizeMult: 0.9, radiusMult: 0.8 }, // Средний
                  { count: 0.15, alpha: 0.6, sizeMult: 1.1, radiusMult: 0.6 }  // Передний
                ];

                let totalDrawn = 0;
                
                // Проверяем статичное распыление для подтёков
                const timeHeld = checkStaticSpray(x, y);
                
                for (const layer of layers) {
                  const layerCount = Math.floor(config.dotsPerTick * layer.count);
                  
                  for (let i = 0; i < layerCount; i++) {
                    // Нелинейное распределение (больше в центре)
                    const centerBias = presetConfig.centerBias || 0.7;
                    const distribution = Math.pow(Math.random(), centerBias);
                    const r = distribution * config.sprayRadius * scale * layer.radiusMult;
                    const angle = Math.random() * 2 * Math.PI;
                    
                    // Эллиптическая форма при движении
                    let dx, dy;
                    if (speed > 0.1 && stretchFactor > 1.1) {
                      const stretchedX = Math.cos(angle) * r * stretchFactor;
                      const stretchedY = Math.sin(angle) * r / stretchFactor;
                      
                      // Поворот в направлении движения
                      dx = stretchedX * Math.cos(moveAngle) - stretchedY * Math.sin(moveAngle);
                      dy = stretchedX * Math.sin(moveAngle) + stretchedY * Math.cos(moveAngle);
                    } else {
                      dx = Math.cos(angle) * r;
                      dy = Math.sin(angle) * r;
                    }
                    
                    // Размер зависит от позиции в облаке
                    const distanceFromCenter = r / (config.sprayRadius * scale);
                    const sizeVariation = 0.4 + distanceFromCenter * 0.6;
                    const size = (0.6 + Math.random() * 0.5) * scale * sizeVariation * layer.sizeMult;
                    
                    // Прозрачность зависит от скорости и слоя
                    const baseAlpha = 0.25 - (0.15 * speed);
                    ctx.globalAlpha = Math.max(0.05, baseAlpha * layer.alpha * (0.8 + Math.random() * 0.4));
                    
                    ctx.fillStyle = config.currentColor;
                    ctx.beginPath();
                    ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // Обработка подтёков при статичном распылении
                    if (timeHeld && enableDrips) {
                      const cellX = Math.round(x + dx);
                      const cellY = Math.round(y + dy);
                      const cellKey = cellX + "_" + cellY;
                      dripMap[cellKey] = (dripMap[cellKey] || 0) + 1;
                      const drops = dripMap[cellKey];
                      
                      // Порог для подтёка (зависит от масштаба)
                      const threshold = Math.max(8, 12 * scale);
                      
                      // Подтёк появляется только если достигли порога И удерживаем в одной точке
                      if (drops > threshold && drops % 3 === 0 && isStaticSpraying) {
                        // Длина подтёка увеличивается со временем и количеством капель
                        const dripLen = Math.min(
                          25 * scale * (1 + timeHeld / 300),
                          Math.sqrt(drops - threshold) * 0.4 * scale + Math.random() * 3
                        );
                        
                        ctx.save();
                        ctx.globalAlpha = 0.1 + Math.random() * 0.05;
                        ctx.strokeStyle = config.currentColor;
                        
                        // Используем параметры толщины из пресета для тонких подтёков
                        const dripWidth = presetConfig.dripWidth || 0.5;
                        const dripWidthVariation = presetConfig.dripWidthVariation || 0.2;
                        ctx.lineWidth = dripWidth + Math.random() * dripWidthVariation;
                        
                        ctx.beginPath();
                        ctx.moveTo(cellX + (Math.random() * 2 - 1), cellY + size / 4);
                        ctx.lineTo(cellX + (Math.random() * 2 - 1), cellY + size / 2 + dripLen);
                        ctx.stroke();
                        ctx.restore();
                      }
                    }

                    // Подсчёт краски
                    const px = Math.round(x + dx);
                    const py = Math.round(y + dy);
                    const key = px + "_" + py;
                    if (!paintedPixels.has(key)) {
                      paintedPixels.add(key);
                      config.paintLeft = Math.max(0, config.paintLeft - paintConsumption);
                      
                      if (window.updatePaintLeft) {
                        window.updatePaintLeft(config.paintLeft);
                      }
                    }
                    
                    totalDrawn++;
                  }
                }
                
                // Туманный край (дополнительные мелкие частицы)
                if (presetConfig.edgeFog) {
                  const fogCount = Math.floor(config.dotsPerTick * 0.1);
                  for (let i = 0; i < fogCount; i++) {
                    const fogRadius = config.sprayRadius * scale * (0.9 + Math.random() * 0.2);
                    const fogAngle = Math.random() * 2 * Math.PI;
                    const fogX = Math.cos(fogAngle) * fogRadius;
                    const fogY = Math.sin(fogAngle) * fogRadius;
                    
                    ctx.globalAlpha = 0.02 + Math.random() * 0.03;
                    ctx.fillStyle = config.currentColor;
                    ctx.beginPath();
                    ctx.arc(x + fogX, y + fogY, 0.3 * scale, 0, 2 * Math.PI);
                    ctx.fill();
                  }
                }

                if (config.paintLeft <= 0) {
                  config.paintLeft = 0;
                  alert('Краска закончилась!');
                }

                updatePaintUI();
                lastSprayPos = { x, y };
                lastSprayTime = now;
                ctx.globalAlpha = 1;
              }

              // Стандартная функция распыления для остальных пресетов
              function sprayAt(x, y) {
                if (config.paintLeft <= 0) return;

                const now = performance.now();
                let speed = 0;
                if (lastSprayPos && lastSprayTime !== null) {
                  const dt = now - lastSprayTime;
                  const dist = Math.hypot(x - lastSprayPos.x, y - lastSprayPos.y);
                  speed = Math.min(1, dist / (dt || 1) / config.speedFactor);
                }

                const currentRadius = config.sprayRadius;
                const currentDensity = config.dotsPerTick;
                const currentSpeed = config.lineScale;

                const scale = config.lineScale;

                const minDot = 0.7 * scale;
                const maxDot = 1.1 * scale;
                const dotFromSpeed = maxDot - (maxDot - minDot) * speed;

                const minRadius = currentRadius * 0.7 * scale;
                const maxRadius = currentRadius * 3 * scale;
                const radiusFromSpeed = minRadius + (maxRadius - minRadius) * speed;

                const minAlpha = 0.15;
                const maxAlpha = 0.55;
                const alphaFromSpeed = maxAlpha - (maxAlpha - minAlpha) * speed;

                const maxDotsToDraw = Math.min(currentDensity, 5000);
                
                // Проверяем статичное распыление
                const timeHeld = checkStaticSpray(x, y);
                
                for (let i = 0; i < maxDotsToDraw; i++) {
                  const angle = Math.random() * 2 * Math.PI;
                  const r = Math.random() * radiusFromSpeed;
                  const dx = Math.cos(angle) * r;
                  const dy = Math.sin(angle) * r;
                  const size = minDot + Math.random() * (maxDot - minDot);

                  ctx.globalAlpha = alphaFromSpeed * (0.8 + Math.random() * 0.3);
                  ctx.fillStyle = config.currentColor;
                  ctx.beginPath();
                  ctx.arc(x + dx, y + dy, size, 0, 2 * Math.PI);
                  ctx.fill();

                  // Обработка подтёков при статичном распылении
                  if (timeHeld && enableDrips) {
                    const cellX = Math.round(x + dx);
                    const cellY = Math.round(y + dy);
                    const cellKey = cellX + "_" + cellY;
                    dripMap[cellKey] = (dripMap[cellKey] || 0) + 1;
                    const drops = dripMap[cellKey];
                    
                    // Порог для подтёка (зависит от масштаба)
                    const threshold = Math.max(10, 14 * scale);
                    
                    // Подтёк появляется только если достигли порога И удерживаем в одной точке
                    if (drops > threshold && drops % 3 === 0 && isStaticSpraying) {
                      // Длина подтёка увеличивается со временем и количеством капель
                      const dripLen = Math.min(
                        30 * scale * (1 + timeHeld / 500),
                        Math.sqrt(drops - threshold) * 0.5 * scale + Math.random() * 4
                      );
                      
                      ctx.save();
                      ctx.globalAlpha = 0.12 + Math.random() * 0.01;
                      ctx.strokeStyle = config.currentColor;
                      
                      // Используем параметры толщины из пресета для тонких подтёков
                      const dripWidth = presetConfig.dripWidth || 0.8;
                      const dripWidthVariation = presetConfig.dripWidthVariation || 0.3;
                      ctx.lineWidth = dripWidth + Math.random() * dripWidthVariation;
                      
                      ctx.beginPath();
                      ctx.moveTo(cellX + (Math.random() * 2 - 1), cellY + size / 4);
                      ctx.lineTo(cellX + (Math.random() * 2 - 1), cellY + size / 2 + dripLen);
                      ctx.stroke();
                      ctx.restore();
                    }
                  }

                  const px = Math.round(x + dx);
                  const py = Math.round(y + dy);
                  const key = px + "_" + py;
                  if (!paintedPixels.has(key)) {
                    paintedPixels.add(key);
                    config.paintLeft = Math.max(0, config.paintLeft - paintConsumption);
                    
                    if (window.updatePaintLeft) {
                      window.updatePaintLeft(config.paintLeft);
                    }
                  }
                }

                if (config.paintLeft <= 0) {
                  config.paintLeft = 0;
                  alert('Краска закончилась!');
                }

                updatePaintUI();
                lastSprayPos = { x, y };
                lastSprayTime = now;
                ctx.globalAlpha = 1;
              }

              function handleStart(e) {
                e.preventDefault();
                if (config.paintLeft <= 0) return;
                const { x, y } = getCanvasCoords(e);
                isDrawing = true;
                lastStaticSprayPos = null; // Сбрасываем при новом нажатии
                staticSprayStartTime = null;
                
                if (currentPreset === 'grunt') {
                  sprayWithRoller(x, y);
                } else if (currentPreset === '10cm') {
                  sprayAt10cm(x, y); // Специальная функция для 10см
                } else {
                  sprayAt(x, y); // Стандартная для остальных
                }
                
                updateCursor(e);
              }

              function handleMove(e) {
                if (!isDrawing) return;
                e.preventDefault();
                const { x, y } = getCanvasCoords(e);
                
                if (currentPreset === 'grunt') {
                  sprayWithRoller(x, y);
                } else if (currentPreset === '10cm') {
                  sprayAt10cm(x, y); // Специальная функция для 10см
                } else {
                  sprayAt(x, y); // Стандартная для остальных
                }
                
                updateCursor(e);
              }

              function handleEnd() {
                isDrawing = false;
                customCursor.style.display = 'none';
                // Сбрасываем статичное распыление при отпускании
                lastStaticSprayPos = null;
                staticSprayStartTime = null;
                isStaticSpraying = false;
              }

              function updateCursor(e) {
                const x = e.clientX || (e.touches?.[0]?.clientX || 0);
                const y = e.clientY || (e.touches?.[0]?.clientY || 0);
                customCursor.style.left = x + 'px';
                customCursor.style.top = y + 'px';
                customCursor.style.display = 'block';
                customCursor.style.background = config.currentColor;
                customCursor.style.boxShadow = '0 0 6px ' + config.currentColor + 'A0';
              }

              // Добавление обработчиков событий
              ['touchstart', 'mousedown'].forEach(type =>
                canvas.addEventListener(type, handleStart, { passive: false })
              );
              ['touchmove', 'mousemove'].forEach(type =>
                canvas.addEventListener(type, handleMove, { passive: false })
              );
              ['touchend', 'mouseup', 'mouseleave'].forEach(type =>
                canvas.addEventListener(type, handleEnd)
              );

              canvas.addEventListener('click', () => {
                if (window.innerWidth <= 700) {
                  burger.classList.remove('open');
                  controlsPanel.classList.remove('open');
                }
              });

              // Обновление параметров через слайдеры
              scaleRange.addEventListener('input', (e) => {
                config.lineScale = parseFloat(e.target.value);
                dynamicSpeed = parseFloat(e.target.value);
                scaleRange.value = config.lineScale;
                updateUI();
              });

              radiusRange.addEventListener('input', (e) => {
                config.sprayRadius = parseInt(e.target.value);
                dynamicRadius = parseInt(e.target.value);
                radiusRange.value = config.sprayRadius;
                updateUI();
              });

              densityRange.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (value < 50) return;
                config.dotsPerTick = value;
                dynamicDensity = value;
                densityRange.value = config.dotsPerTick;
                updateUI();
              });

              speedFactorInput.addEventListener('input', (e) => {
                config.speedFactor = parseFloat(e.target.value);
                dynamicSpeedFactor = parseFloat(e.target.value);
                speedFactorInput.value = config.speedFactor;
                updateUI();
              });

              resetBtn.addEventListener('click', () => {
                paintedPixels.clear();
                for (let key in dripMap) delete dripMap[key];
                for (let key in staticSprayMap) delete staticSprayMap[key];
                config.paintLeft = config.paintMax;
                lastSprayPos = null;
                lastSprayTime = null;
                lastStaticSprayPos = null;
                staticSprayStartTime = null;
                isStaticSpraying = false;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                if (window.updatePaintLeft) {
                  window.updatePaintLeft(config.paintMax);
                }
                
                updateUI();
              });

              bgImageInput.addEventListener('change', (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                const img = new Image();
                img.onload = () => {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  URL.revokeObjectURL(url);
                };
                img.src = url;
              });

              if (burger) {
                burger.addEventListener('click', () => {
                  burger.classList.toggle('open');
                  controlsPanel.classList.toggle('open');
                });
              }

              window.updatePaintLeft = function(newPaintLeft) {
                console.log('Обновление краски в React:', newPaintLeft);
              };

              updateUI();
              
              // Инициализация параметров
              window.updateSprayParams(
                dynamicRadius, 
                dynamicDensity, 
                dynamicSpeed, 
                dynamicSpeedFactor,
                currentPreset, 
                enableDrips, 
                paintConsumption,
                presetConfig
              );
              
              // Инициализация цвета
              window.updateSprayColor(config.currentColor);
            })();
          `,
        }}
      />
    </div>
  );
}
