// Terbang Nusantara — semua angka penyeimbang dan definisi misi.
// Satu file, satu tugas: angka-angka yang dipakai seluruh game.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const GROUND_Y = 640; // garis permukaan laut di layar

// Fisika pesawat (per detik).
export const PHYSICS = {
  gravity: 26,        // tarikan ke bawah saat gas kecil
  lift: 95,           // gaya angkat saat menanjak
  climbRate: 150,     // px/detik saat tombol naik ditekan
  sinkRate: 120,      // px/detik saat tombol turun ditekan
  minSpeed: 90,       // km/h — di bawah ini pesawat stall dan jatuh
  maxSpeed: 420,      // km/h
  cruiseSpeed: 200,   // km/h saat throttle 50%
  throttleStep: 55,   // km/h per detik saat gas/rem ditekan
  boostSpeed: 120,    // tambahan km/h saat boost
  boostDrain: 22,     // bahan bakar per detik saat boost
  fuelDrain: 1.15,    // bahan bakar per detik saat terbang normal
  ringFuel: 14,       // bahan bakar yang dikembalikan tiap ring
  coinFuel: 2,        // bahan bakar tiap koin
  maxFuel: 100,
  maxHearts: 3,
};

// Tiga misi: tujuan, ring, koin, cuaca, dan waktu berbeda.
export const MISSIONS = [
  {
    id: 1,
    name: 'Latihan Terbang',
    goal: 'Lewati 5 ring, lalu mendarat di landasan.',
    rings: 5,
    coins: 8,
    birds: 2,
    timeLimit: 90,
    wind: 0,
    storm: false,
    distance: 5200,
    brief: 'Langit cerah di atas kepulauan. Ikuti ring kuning satu per satu, ' +
      'kumpulkan koin, dan mendarat di landasan di ujung rute. Jaga bahan bakar.',
  },
  {
    id: 2,
    name: 'Antar Paket',
    goal: 'Antar paket ke pulau seberang: 7 ring, angin kencang.',
    rings: 7,
    coins: 10,
    birds: 4,
    timeLimit: 110,
    wind: 34,
    storm: false,
    distance: 6800,
    brief: 'Angin laut bertiup kencang dari kanan. Pesawatmu membawa paket penting ' +
      'untuk pulau seberang. Lewati 7 ring dan mendarat sebelum waktu habis.',
  },
  {
    id: 3,
    name: 'Badai',
    goal: 'Tembus badai: 8 ring, hujan dan petir, mendarat darurat.',
    rings: 8,
    coins: 12,
    birds: 5,
    timeLimit: 130,
    wind: 55,
    storm: true,
    distance: 8200,
    brief: 'Badai di depan. Hujan deras, petir, dan angin berubah-ubah. ' +
      'Terbang rendah dan stabil, lewati 8 ring, dan mendarat darurat di landasan.',
  },
];

export const SCORES = {
  ring: 100,
  coin: 10,
  landing: 250,
  timeBonusPerSec: 5,
  perfectBonus: 150, // mendarat tanpa kerusakan
};

export const COLORS = {
  skyTop: '#5fb2ef',
  skyMid: '#9fd8f7',
  skyBottom: '#d8f2fd',
  stormTop: '#3d4a63',
  stormMid: '#5c6b85',
  sea: '#1e7fbf',
  seaDeep: '#14619c',
  sand: '#f2d8a0',
  grass: '#5da24a',
  hill: '#3f7d3a',
  mountain: '#6b7c8c',
  volcano: '#5b4a4a',
  lava: '#ff7a2f',
  runway: '#3a3f4a',
  runwayLine: '#ffd75e',
  ring: '#ffd75e',
  ringGlow: 'rgba(255, 215, 94, 0.35)',
  planeBody: '#e8442e',
  planeWing: '#c93320',
  planeGlass: '#bfe9ff',
  hudAmber: '#ffd75e',
};
