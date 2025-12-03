// apps/jan-2026/lib/spray/presets.js
export const CAN_PRESETS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    sprayRadius: 30,
    dotSize: [0.8, 1.1],
    dotsPerTick: 556,
    dripThreshold: 15,
    alphaRange: [0.12, 0.6],
    price: 5,
    color: '#4a90e2'
  },
  heavyDrip: {
    id: 'heavyDrip',
    name: 'Heavy Drip',
    sprayRadius: 40,
    dotsPerTick: 700,
    dripThreshold: 8,
    maxDripLength: 120,
    price: 8,
    color: '#ff6b6b'
  },
  neonGlow: {
    id: 'neonGlow',
    name: 'Neon Glow',
    sprayRadius: 40,
    dotSize: [1.0, 1.5],
    alphaRange: [0.2, 0.8],
    price: 15,
    color: '#00f3ff',
    effects: ['glow']
  }
};
