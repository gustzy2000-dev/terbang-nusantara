// Dunia misi: daratan, laut, pulau, gunung berapi, ring, koin, burung, dan landasan.
// Dibangun sekali per misi dari seed, jadi tiap misi punya peta yang sama di setiap main.
// Satu file, satu tugas: isi peta.

import { makeRng, pickRange, pickInt } from './random.js';
import { GROUND_Y, VIEW_H } from './config.js';

// Ketinggian daratan (permukaan tanah) pada posisi x dunia, 0..distance.
// Laut = GROUND_Y, pulau = lebih tinggi, gunung = jauh lebih tinggi.
export function buildWorld(mission, seed) {
  const rng = makeRng(seed);
  const distance = mission.distance;
  const islands = [];
  const peaks = [];
  let x = 500;
  while (x < distance - 900) {
    const kind = rng();
    if (kind < 0.45) {
      // Pulau hijau dengan palem.
      const w = pickRange(rng, 320, 620);
      islands.push({ x, w, h: pickRange(rng, 60, 130), palms: pickInt(rng, 2, 6) });
      x += w + pickRange(rng, 500, 900);
    } else if (kind < 0.7) {
      // Gunung berapi.
      const w = pickRange(rng, 420, 640);
      peaks.push({ x, w, h: pickRange(rng, 190, 300), smoke: rng() < 0.8 });
      x += w + pickRange(rng, 600, 1000);
    } else {
      // Hamparan laut terbuka.
      x += pickRange(rng, 700, 1200);
    }
  }

  // Ring target: berbaris dari awal sampai dekat landasan, ketinggian bervariasi.
  const rings = [];
  const gap = (distance - 1400) / mission.rings;
  for (let i = 0; i < mission.rings; i++) {
    rings.push({
      x: 700 + gap * i + pickRange(rng, -80, 80),
      y: pickRange(rng, 180, 420),
      r: 52,
      passed: false,
      id: i + 1,
    });
  }

  // Koin di antara ring.
  const coins = [];
  for (let i = 0; i < mission.coins; i++) {
    coins.push({
      x: pickRange(rng, 600, distance - 1200),
      y: pickRange(rng, 200, 460),
      taken: false,
      spin: rng() * Math.PI * 2,
    });
  }

  // Burung penghalang: terbang bolak-balik di jalurnya.
  const birds = [];
  for (let i = 0; i < mission.birds; i++) {
    birds.push({
      x: pickRange(rng, 1200, distance - 1500),
      y: pickRange(rng, 200, 440),
      baseY: 0,
      speed: pickRange(rng, 40, 90) * (rng() < 0.5 ? 1 : -1),
      wing: rng() * Math.PI * 2,
    });
  }
  birds.forEach((b) => { b.baseY = b.y; });

  // Landasan di ujung rute.
  const runway = { x: distance - 320, w: 320, y: GROUND_Y };

  return { distance, islands, peaks, rings, coins, birds, runway, seed };
}

// Ketinggian permukaan tanah pada posisi x (untuk tabrakan dan gambar).
export function groundHeightAt(world, x) {
  let top = GROUND_Y;
  for (const isl of world.islands) {
    if (x >= isl.x && x <= isl.x + isl.w) {
      const t = (x - isl.x) / isl.w;
      const hump = Math.sin(t * Math.PI);
      top = Math.min(top, GROUND_Y - isl.h * hump);
    }
  }
  for (const p of world.peaks) {
    if (x >= p.x && x <= p.x + p.w) {
      const t = (x - p.x) / p.w;
      const tri = t < 0.5 ? t * 2 : (1 - t) * 2;
      top = Math.min(top, GROUND_Y - p.h * tri);
    }
  }
  // Landasan rata di ujung.
  if (x >= world.runway.x && x <= world.runway.x + world.runway.w) {
    top = Math.min(top, GROUND_Y);
  }
  return top;
}

// Apakah titik (x, y) menabrak daratan.
export function hitsGround(world, x, y) {
  return y >= groundHeightAt(world, x);
}

// Jarak mendatar tersisa sampai landasan.
export function distanceToRunway(world, x) {
  return Math.max(0, world.runway.x - x);
}

export { VIEW_H };
