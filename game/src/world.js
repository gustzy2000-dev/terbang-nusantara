// Dunia misi: pulau, gunung berapi, cincin, koin, burung, dan landasan.
// Dibangun dari seed supaya misi yang sama selalu punya dunia yang sama.

import { GROUND_Y } from "./config.js";
import { makeRng, pickRange, pickInt } from "./random.js";

export function buildWorld(mission, seed) {
  const rng = makeRng(seed * 1000 + mission.id * 77 + 13);
  const distance = mission.distance;

  // Pulau-pulau di sepanjang rute, masing-masing dengan beberapa palem.
  const islands = [];
  let x = 500;
  while (x < distance - 900) {
    const w = pickRange(rng, 260, 520);
    const h = pickRange(rng, 60, 140);
    const palms = [];
    const nPalms = pickInt(rng, 2, 5);
    for (let i = 0; i < nPalms; i++) {
      palms.push({ dx: pickRange(rng, 20, w - 20), h: pickRange(rng, 26, 44) });
    }
    islands.push({ x, w, h, palms });
    x += w + pickRange(rng, 380, 700);
  }

  // Dua sampai tiga puncak gunung berapi di antara pulau.
  const volcanoes = [];
  const nVolc = pickInt(rng, 2, 3);
  for (let i = 0; i < nVolc; i++) {
    volcanoes.push({
      x: pickRange(rng, 900, distance - 900),
      h: pickRange(rng, 150, 240),
      w: pickRange(rng, 200, 300),
    });
  }

  // Cincin bernomor, tersebar merata dari awal sampai sebelum landasan.
  const rings = [];
  const firstX = 700;
  const lastX = distance - 700;
  for (let i = 0; i < mission.rings; i++) {
    const t = mission.rings === 1 ? 0.5 : i / (mission.rings - 1);
    rings.push({
      index: i,
      x: firstX + (lastX - firstX) * t + pickRange(rng, -60, 60),
      y: pickRange(rng, 180, 480),
      r: 52,
      passed: false,
    });
  }

  // Koin "Rp" tersebar di antara cincin.
  const coins = [];
  for (let i = 0; i < mission.coins; i++) {
    coins.push({
      x: pickRange(rng, 600, distance - 600),
      y: pickRange(rng, 200, 500),
      r: 14,
      taken: false,
      phase: pickRange(rng, 0, Math.PI * 2),
    });
  }

  // Burung berpatroli di sekitar titik tetapnya.
  const birds = [];
  for (let i = 0; i < mission.birds; i++) {
    birds.push({
      baseX: pickRange(rng, 900, distance - 900),
      baseY: pickRange(rng, 200, 450),
      phase: pickRange(rng, 0, Math.PI * 2),
      speed: pickRange(rng, 0.5, 1.1),
      r: 18,
    });
  }

  const runway = { x: distance - 320, w: 320, y: GROUND_Y };

  return { mission, seed, distance, islands, volcanoes, rings, coins, birds, runway };
}

// Tinggi tanah di posisi x: puncak pulau atau gunung, kalau tidak laut.
export function groundHeightAt(x, world) {
  let ground = GROUND_Y;
  for (const isl of world.islands) {
    if (x >= isl.x && x <= isl.x + isl.w) {
      ground = Math.min(ground, GROUND_Y - isl.h);
    }
  }
  for (const v of world.volcanoes) {
    const half = v.w / 2;
    if (x >= v.x - half && x <= v.x + half) {
      const t = 1 - Math.abs(x - v.x) / half;
      ground = Math.min(ground, GROUND_Y - v.h * t);
    }
  }
  return ground;
}

export function hitsGround(plane, world) {
  return plane.y + 14 >= groundHeightAt(plane.x, world);
}

export function distanceToRunway(plane, world) {
  return Math.max(0, Math.round(world.runway.x - plane.x));
}
