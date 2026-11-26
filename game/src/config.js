// Terbang Nusantara — semua angka permainan tinggal di sini.
// Misi, fisika, skor, dan palet warna: satu sumber kebenaran.

export const VIEW_W = 1280;
export const VIEW_H = 720;
export const GROUND_Y = 640;

export const PHYSICS = {
  gravity: 26, // px/s^2, pesawat melorot pelan kalau tidak diangkat
  lift: 95, // daya angkat yang melawan gravitasi saat kecepatan tinggi
  climbRate: 150, // px/s saat menanjak
  sinkRate: 120, // px/s saat menukik
  minSpeed: 90, // px/s, paling lambat
  maxSpeed: 420, // px/s, paling cepat
  cruiseSpeed: 200, // px/s, kecepatan awal
  throttleStep: 55, // poin throttle per detik (skala 0-100)
  boostSpeed: 120, // tambahan kecepatan saat boost
  boostDrain: 22, // bahan bakar per detik saat boost
  fuelDrain: 1.15, // bahan bakar per detik saat terbang biasa
  ringFuel: 14, // bahan bakar yang kembali tiap cincin
  coinFuel: 2, // bahan bakar yang kembali tiap koin
  maxFuel: 100,
  maxHearts: 3,
};

export const MISSIONS = [
  {
    id: 1,
    name: "Latihan Terbang",
    rings: 5,
    coins: 8,
    birds: 2,
    time: 90,
    wind: 0,
    distance: 5200,
    storm: false,
    desc: "Pemanasan di atas pulau: lewati 5 cincin, kumpulkan koin, lalu mendarat.",
  },
  {
    id: 2,
    name: "Antar Paket",
    rings: 7,
    coins: 10,
    birds: 4,
    time: 110,
    wind: 34,
    distance: 6800,
    storm: false,
    desc: "Angin samping 34 meniup pesawat. Antar paket melewati 7 cincin.",
  },
  {
    id: 3,
    name: "Badai",
    rings: 8,
    coins: 12,
    birds: 5,
    time: 130,
    wind: 55,
    distance: 8200,
    storm: true,
    desc: "Hujan, petir, dan angin 55. Hanya pilot tenang yang mendarat utuh.",
  },
];

export const SCORES = {
  ring: 100,
  coin: 10,
  landing: 250,
  timeBonusPerSec: 5,
  perfectBonus: 150, // mendarat tanpa kehilangan nyawa
};

export const COLORS = {
  skyTop: "#6fbdf2",
  skyMid: "#a8d8f8",
  skyLow: "#e8f6ff",
  sun: "#ffd94d",
  sunGlow: "#ffe98a",
  sea: "#1d7f9e",
  seaDeep: "#14627c",
  seaFoam: "#bfe9f2",
  island: "#3e9b5f",
  islandDark: "#2c7a46",
  sand: "#f2d492",
  palm: "#2f8f4e",
  volcano: "#5a4a42",
  volcanoDark: "#463832",
  lava: "#ff6a2a",
  lavaGlow: "#ffb347",
  runway: "#4a4f55",
  runwayLine: "#ffffff",
  runwayLight: "#ffd94d",
  ring: "#f5b301",
  ringGlow: "#ffe082",
  coin: "#ffd94d",
  coinText: "#8a5a00",
  danger: "#e5484d",
  cloud: "#ffffff",
  mountain: "#8fb8d8",
  mountainFar: "#b7d3e8",
  planeBody: "#e8eef4",
  planeAccent: "#e5484d",
  cockpit: "#7dd3fc",
  bird: "#334155",
  hudBg: "rgba(10, 30, 46, 0.72)",
  hudText: "#ffffff",
  hudGold: "#ffd94d",
};
