// Keadaan beku untuk screenshot (?shot=...&seed=...).
// Setiap shot mengatur pesawat, dunia, dan HUD ke satu momen yang sama di setiap muat ulang,
// lalu mematikan animasi supaya hasil tangkapan deterministik.
// Satu file, satu tugas: menyiapkan momen screenshot.

import { buildWorld } from './world.js';
import { makePlane } from './plane.js';

export function parseShot() {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get('shot');
  if (!shot) return null;
  return { shot, seed: Number(q.get('seed') || 1) };
}

// Mengembalikan state awal untuk shot yang diminta, atau null bila bukan mode shot.
export function shotState(shot, missions) {
  if (!shot) return null;
  const missionIndex = shot.shot === 'land' ? 0 : shot.shot === 'rings' ? 1 : 0;
  const mission = missions[missionIndex];
  const world = buildWorld(mission, shot.seed);
  const plane = makePlane();

  if (shot.shot === 'start') {
    // Layar judul: pesawat melayang di atas laut, pulau dan gunung di belakang.
    plane.x = 900;
    plane.y = 260;
    plane.speed = 200;
    plane.throttle = 0.5;
    plane.fuel = 82;
    return { mission, world, plane, phase: 'title', time: 6.2, score: 0, ringsGot: 0 };
  }
  if (shot.shot === 'play') {
    // Tengah penerbangan: ring di depan, koin di sekitar, HUD penuh.
    plane.x = 1500;
    plane.y = 300;
    plane.speed = 265;
    plane.throttle = 0.72;
    plane.fuel = 68;
    world.rings[1].x = plane.x + 420;
    world.rings[1].y = 280;
    world.rings[2].x = plane.x + 780;
    world.rings[2].y = 360;
    return { mission, world, plane, phase: 'flying', time: 9.4, score: 340, ringsGot: 2 };
  }
  if (shot.shot === 'rings') {
    // Misi 2, angin kencang: pesawat tepat menembus ring.
    const m2 = missions[1];
    const w2 = buildWorld(m2, shot.seed);
    const p2 = makePlane();
    p2.x = w2.rings[3].x - 300;
    p2.y = w2.rings[3].y;
    p2.speed = 310;
    p2.throttle = 0.8;
    p2.fuel = 54;
    w2.rings[0].passed = true;
    w2.rings[1].passed = true;
    w2.rings[2].passed = true;
    return { mission: m2, world: w2, plane: p2, phase: 'flying', time: 12.7, score: 610, ringsGot: 3 };
  }
  if (shot.shot === 'land') {
    // Pendekatan akhir: landasan di depan, pesawat rendah dan pelan.
    plane.x = world.runway.x - 480;
    plane.y = 560;
    plane.speed = 190;
    plane.throttle = 0.35;
    plane.fuel = 31;
    world.rings.forEach((r) => { r.passed = true; });
    return { mission, world, plane, phase: 'flying', time: 15.1, score: 890, ringsGot: 5 };
  }
  return null;
}

// Bekukan animasi di mode shot: tanpa animasi, screenshot selalu sama.
export function freezeAnimations() {
  const style = document.createElement('style');
  style.textContent = '* { animation: none !important; transition: none !important; }';
  document.head.appendChild(style);
}
