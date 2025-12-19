// public/cans.js
window.CAN_PRESETS = {
  // 🎨 Базовый балончик — 4 режима распыления (расстояние до стены)
  basic: {
    id: 'basic',
    name: 'Basic Spray',
    modes: [
      // 1. Вплотную (5 см)
      {
        label: 'Close',
        params: {
          radius: 10,
          density: 800,
          speedFactor: 20,
          dripThreshold: 8,
          dripFactor: 6,
          maxDripLength: 120
        }
      },
      // 2. Близко (20 см)
      {
        label: 'Near',
        params: {
          radius: 25,
          density: 500,
          speedFactor: 10,
          dripThreshold: 15,
          dripFactor: 4,
          maxDripLength: 60
        }
      },
      // 3. Средне (35 см)
      {
        label: 'Medium',
        params: {
          radius: 40,
          density: 300,
          speedFactor: 7,
          dripThreshold: 25,
          dripFactor: 2,
          maxDripLength: 30
        }
      },
      // 4. Далеко (50 см)
      {
        label: 'Far',
        params: {
          radius: 70,
          density: 150,
          speedFactor: 4,
          dripThreshold: 50, // почти без подтёков
          dripFactor: 0.5,
          maxDripLength: 5
        }
      }
    ]
  },

  // 💧 Heavy Drip — для экспериментов
  heavyDrip: {
    id: 'heavyDrip',
    name: 'Heavy Drip',
    modes: [
      { params: { radius: 15, density: 1000, speedFactor: 25, dripThreshold: 5, dripFactor: 8, maxDripLength: 200 } },
      { params: { radius: 30, density: 700, speedFactor: 12, dripThreshold: 10, dripFactor: 6, maxDripLength: 150 } },
      { params: { radius: 50, density: 400, speedFactor: 8, dripThreshold: 20, dripFactor: 4, maxDripLength: 100 } },
      { params: { radius: 80, density: 200, speedFactor: 5, dripThreshold: 40, dripFactor: 2, maxDripLength: 40 } }
    ]
  }
};
