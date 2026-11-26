// Pesawat: posisi, kecepatan, bahan bakar, kerusakan, dan fisikanya.
// Satu file, satu tugas: bagaimana pesawat bergerak.

import { PHYSICS, VIEW_H, GROUND_Y } from './config.js';
import { clamp } from './random.js';

export function makePlane() {
  return {
    x: 180,          // posisi dunia (px dari awal rute)
    y: 300,          // posisi layar (px dari atas)
    speed: 200,      // km/h
    throttle: 0.5,   // 0..1
    pitch: 0,        // sudut hidung, radian (-naik, +turun)
    fuel: PHYSICS.maxFuel,
    hearts: PHYSICS.maxHearts,
    boost: false,
    invincible: 0,   // detik kebal setelah tabrakan
    propAngle: 0,
    crashed: false,
    landed: false,
  };
}

// Satu langkah fisika. input: {up, down, gas, brake, boost, steerY}
// steerY: -1..1 dari seret mouse (negatif = naik). dt dalam detik.
export function stepPlane(plane, input, mission, dt) {
  if (plane.crashed || plane.landed) return;

  // Throttle.
  if (input.gas) plane.throttle = clamp(plane.throttle + 0.6 * dt, 0, 1);
  if (input.brake) plane.throttle = clamp(plane.throttle - 0.6 * dt, 0, 1);

  // Kecepatan dari throttle + boost + angin.
  const target = PHYSICS.minSpeed +
    (PHYSICS.maxSpeed - PHYSICS.minSpeed) * plane.throttle;
  plane.speed += (target - plane.speed) * Math.min(1, 1.4 * dt);
  plane.boost = !!input.boost && plane.fuel > 0;
  if (plane.boost) plane.speed += PHYSICS.boostSpeed * dt;
  plane.speed = clamp(plane.speed - mission.wind * 0.12 * dt, 60, PHYSICS.maxSpeed + 140);

  // Gerak maju.
  const pxPerSec = plane.speed * 1.9;
  plane.x += pxPerSec * dt;

  // Gerak naik/turun: tombol, atau seret mouse.
  let climb = 0;
  if (input.up) climb -= 1;
  if (input.down) climb += 1;
  if (input.steerY !== 0) climb = input.steerY;
  const vertical = climb * PHYSICS.climbRate +
    (plane.speed < PHYSICS.minSpeed + 20 ? PHYSICS.gravity * 1.6 : PHYSICS.gravity * 0.35);
  plane.y += vertical * dt;

  // Pitch mengikuti arah gerak.
  const targetPitch = clamp(vertical / 260, -0.45, 0.45);
  plane.pitch += (targetPitch - plane.pitch) * Math.min(1, 6 * dt);

  // Bahan bakar.
  plane.fuel -= (PHYSICS.fuelDrain + (plane.boost ? PHYSICS.boostDrain : 0)) * dt;
  if (plane.fuel <= 0) {
    plane.fuel = 0;
    plane.throttle = Math.max(0, plane.throttle - 0.4 * dt);
  }

  // Batas langit dan laut.
  if (plane.y < 60) plane.y = 60;
  if (plane.y > GROUND_Y - 14) plane.y = GROUND_Y - 14;

  if (plane.invincible > 0) plane.invincible -= dt;
  plane.propAngle += dt * (6 + plane.throttle * 26);
}

// Ketinggian dalam meter (0 di permukaan laut).
export function altitudeOf(plane) {
  return Math.max(0, Math.round((GROUND_Y - plane.y) * 1.5));
}

// Heading: 090 = timur (maju), berubah sedikit dengan pitch.
export function headingOf(plane) {
  const deg = 90 + plane.pitch * 57;
  return Math.round(((deg % 360) + 360) % 360);
}

// Kerusakan sekali: kurangi hati, beri kebal 2 detik, pantulkan pesawat ke atas.
export function damagePlane(plane) {
  if (plane.invincible > 0 || plane.crashed) return false;
  plane.hearts -= 1;
  plane.invincible = 2;
  plane.y -= 46;
  plane.speed = Math.max(120, plane.speed - 60);
  if (plane.hearts <= 0) {
    plane.crashed = true;
  }
  return true;
}

// Mendarat: pesawat di atas landasan, rendah, dan pelan.
export function tryLand(plane, world) {
  const rw = world.runway;
  const onRunway = plane.x >= rw.x - 40 && plane.x <= rw.x + rw.w + 60;
  const low = plane.y >= GROUND_Y - 60;
  const slow = plane.speed < 260;
  if (onRunway && low && slow) {
    plane.landed = true;
    plane.y = GROUND_Y - 14;
    return true;
  }
  return false;
}
