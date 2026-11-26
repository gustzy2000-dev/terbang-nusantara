// Pesawat: keadaan dan geraknya.
// Semua satuan piksel/detik; y membesar ke bawah (koordinat kanvas).

import { GROUND_Y, PHYSICS } from "./config.js";
import { clamp } from "./random.js";

export function makePlane() {
  return {
    x: 180,
    y: 300,
    vy: 0,
    speed: PHYSICS.cruiseSpeed,
    throttle: 0.5,
    fuel: PHYSICS.maxFuel,
    hearts: PHYSICS.maxHearts,
    invincible: 0,
    boost: false,
  };
}

// Satu langkah simulasi. input: { climb, dive, throttleUp, throttleDown,
// boost, drag } dengan drag -1..1 (negatif = tarik ke atas).
export function stepPlane(plane, input, mission, dt) {
  // Throttle naik/turun dengan tombol kiri-kanan (atau A/D).
  const step = PHYSICS.throttleStep / 100;
  if (input.throttleUp) plane.throttle = clamp(plane.throttle + step * dt, 0, 1);
  if (input.throttleDown) plane.throttle = clamp(plane.throttle - step * dt, 0, 1);

  // Kecepatan mengejar target dari throttle; boost menambah kecepatan.
  let target = PHYSICS.minSpeed + plane.throttle * (PHYSICS.maxSpeed - PHYSICS.minSpeed);
  plane.boost = !!input.boost && plane.fuel > 0;
  if (plane.boost) target += PHYSICS.boostSpeed;
  const rate = 120;
  if (plane.speed < target) plane.speed = Math.min(target, plane.speed + rate * dt);
  else plane.speed = Math.max(target, plane.speed - rate * dt);

  // Menanjak mengorbankan kecepatan, menukik menambahnya sedikit.
  const climbing = input.climb || input.drag < -0.2;
  const diving = input.dive || input.drag > 0.2;
  if (climbing) plane.speed = Math.max(PHYSICS.minSpeed, plane.speed - 20 * dt);
  if (diving) plane.speed = Math.min(PHYSICS.maxSpeed + PHYSICS.boostSpeed, plane.speed + 15 * dt);

  // Gerak vertikal: menanjak, menukik, atau melayang karena daya angkat.
  if (climbing) plane.vy = -PHYSICS.climbRate;
  else if (diving) plane.vy = PHYSICS.sinkRate;
  else plane.vy = PHYSICS.gravity - PHYSICS.lift * (plane.speed / PHYSICS.maxSpeed);

  plane.y += plane.vy * dt;
  plane.x += plane.speed * dt + mission.wind * 0.3 * dt;
  if (plane.y < 40) plane.y = 40;

  // Bahan bakar: terbang biasa boros sedikit, boost boros banyak.
  plane.fuel -= PHYSICS.fuelDrain * dt;
  if (plane.boost) plane.fuel -= PHYSICS.boostDrain * dt;
  if (plane.fuel < 0) plane.fuel = 0;

  if (plane.invincible > 0) plane.invincible -= dt;
}

export function altitudeOf(plane) {
  return Math.max(0, Math.round((GROUND_Y - plane.y) * 1.5));
}

// Arah hadap dalam derajat: positif = menanjak, negatif = menukik.
export function headingOf(plane) {
  const deg = (Math.atan2(-plane.vy, Math.max(1, plane.speed)) * 180) / Math.PI;
  return Math.round(clamp(deg, -45, 45));
}

// Tabrakan dengan burung atau tanah. Mengembalikan true kalau nyawa berkurang.
export function damagePlane(plane) {
  if (plane.invincible > 0) return false;
  plane.hearts -= 1;
  plane.invincible = 2;
  return true;
}

// Syarat mendarat: di atas landasan, rendah, dan pelan.
export function canLand(plane, world) {
  const r = world.runway;
  const overRunway = plane.x >= r.x && plane.x <= r.x + r.w;
  const low = plane.y >= GROUND_Y - 30;
  const slow = plane.speed < 260;
  return overRunway && low && slow;
}
