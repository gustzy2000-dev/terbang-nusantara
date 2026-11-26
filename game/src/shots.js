// Keadaan beku untuk tangkapan layar: ?shot=start|play|rings|land&seed=7
// Halaman tanpa parameter ?shot= adalah permainan biasa.

import { GROUND_Y, MISSIONS } from "./config.js";
import { buildWorld } from "./world.js";
import { makePlane } from "./plane.js";

export function parseShot() {
  const q = new URLSearchParams(window.location.search);
  const shot = q.get("shot") || "";
  const seed = parseInt(q.get("seed") || "7", 10) || 7;
  return { shot, seed };
}

// Membangun keadaan permainan yang beku untuk satu jenis tangkapan.
// Waktu dibekukan supaya cincin, awan, dan hujan tidak berubah-ubah.
export function shotState(shot, seed) {
  const mission = MISSIONS[0];
  const world = buildWorld(mission, seed);
  const plane = makePlane();

  if (shot === "start") {
    plane.x = 180;
    plane.y = GROUND_Y - 16;
    plane.speed = 0;
    plane.throttle = 0;
    return {
      phase: "title",
      mission,
      missionIndex: 0,
      world,
      plane,
      time: 0,
      timeLeft: mission.time,
      score: 0,
      ringsPassed: 0,
      nextRing: 0,
      toast: "",
      toastUntil: 0,
      result: null,
      muted: false,
      frozenTime: 1.0,
    };
  }

  if (shot === "play") {
    plane.x = 2100;
    plane.y = 270;
    plane.vy = -40;
    plane.speed = 230;
    plane.throttle = 0.6;
    plane.fuel = 71;
    world.rings[0].passed = true;
    world.rings[1].passed = true;
    return {
      phase: "flying",
      mission,
      missionIndex: 0,
      world,
      plane,
      time: 26,
      timeLeft: 64,
      score: 220,
      ringsPassed: 2,
      nextRing: 2,
      toast: "",
      toastUntil: 0,
      result: null,
      muted: false,
      frozenTime: 1.0,
    };
  }

  if (shot === "rings") {
    const ring = world.rings[3];
    plane.x = ring.x - 70;
    plane.y = ring.y;
    plane.vy = -20;
    plane.speed = 240;
    plane.throttle = 0.65;
    plane.fuel = 58;
    world.rings[0].passed = true;
    world.rings[1].passed = true;
    world.rings[2].passed = true;
    return {
      phase: "flying",
      mission,
      missionIndex: 0,
      world,
      plane,
      time: 41,
      timeLeft: 49,
      score: 330,
      ringsPassed: 3,
      nextRing: 3,
      toast: "",
      toastUntil: 0,
      result: null,
      muted: false,
      frozenTime: 1.0,
    };
  }

  // land: pesawat sudah menyentuh landasan, semua cincin lolos.
  // Pesawat diposisikan sedikit di atas landasan (bukan di balik panel
  // pengukur di kanan bawah) supaya tampak jelas sedang mendarat.
  world.rings.forEach((r) => {
    r.passed = true;
  });
  plane.x = world.runway.x + 60;
  plane.y = GROUND_Y - 55;
  plane.vy = 30;
  plane.speed = 120;
  plane.throttle = 0.15;
  plane.fuel = 33;
  return {
    phase: "flying",
    mission,
    missionIndex: 0,
    world,
    plane,
    time: 78,
    timeLeft: 12,
    score: 890,
    ringsPassed: mission.rings,
    nextRing: mission.rings,
    toast: "",
    toastUntil: 0,
    result: null,
    muted: false,
    frozenTime: 1.0,
  };
}

// Membekukan animasi CSS supaya tangkapan layar deterministik.
export function freezeAnimations() {
  const style = document.createElement("style");
  style.textContent = "* { animation: none !important; transition: none !important; }";
  document.head.appendChild(style);
}
