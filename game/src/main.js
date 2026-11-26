// Terbang Nusantara — loop utama, tabrakan, dan HUD.
// Fase: title -> brief -> flying -> done. Mode ?shot= menggambar satu
// keadaan beku tanpa loop (untuk tangkapan layar).

import { VIEW_W, VIEW_H, GROUND_Y, MISSIONS, PHYSICS, SCORES } from "./config.js";
import { clamp } from "./random.js";
import { buildWorld, groundHeightAt, hitsGround, distanceToRunway } from "./world.js";
import { makePlane, stepPlane, damagePlane, canLand } from "./plane.js";
import { drawScene, drawGauges } from "./render.js";
import { createAudio } from "./audio.js";
import { createInput } from "./input.js";
import { parseShot, shotState, freezeAnimations } from "./shots.js";

const cv = document.getElementById("cv");
const ctx = cv.getContext("2d");
const $ = (id) => document.getElementById(id);
const hud = {
  mission: $("hudMission"),
  fuel: $("hudFuelFill"),
  fuelText: $("hudFuelText"),
  hearts: $("hudHearts"),
  timer: $("hudTimer"),
  score: $("hudScore"),
  rings: $("hudRings"),
  dist: $("hudDist"),
  throttle: $("throttleFill"),
  toast: $("toast"),
};

const audio = createAudio();
const input = createInput(cv);

let state = null;
let paused = false;
let prevPause = false;
let prevMuted = false;

function newGame(missionIndex) {
  const mission = MISSIONS[missionIndex];
  const seed = Math.floor(Math.random() * 100000);
  return {
    phase: "flying",
    mission,
    missionIndex,
    world: buildWorld(mission, seed),
    plane: makePlane(),
    time: 0,
    timeLeft: mission.time,
    score: 0,
    ringsPassed: 0,
    nextRing: 0,
    toast: "",
    toastUntil: 0,
    result: null,
    muted: false,
    seed,
  };
}

function showOverlay(id) {
  for (const el of ["overlayTitle", "overlayBrief", "overlayEnd"]) {
    $(el).classList.toggle("hidden", el !== id);
  }
  if (!id) {
    for (const el of ["overlayTitle", "overlayBrief", "overlayEnd"]) $(el).classList.add("hidden");
  }
}

function showToast(text) {
  state.toast = text;
  state.toastUntil = state.time + 2.4;
  hud.toast.textContent = text;
  hud.toast.classList.remove("hidden");
}

function startGame(missionIndex) {
  state = newGame(missionIndex);
  audio.ensure();
  showOverlay(null);
  hud.toast.classList.add("hidden");
}

function endGame(kind) {
  state.phase = "done";
  state.result = { kind, score: state.score };
  const titles = {
    landed: "Mendarat dengan Sempurna!",
    crashed: "Pesawat Jatuh!",
    fuel: "Bahan Bakar Habis!",
    time: "Waktu Habis!",
    past: "Melewati Landasan!",
  };
  const details = {
    landed: "Semua cincin dilewati dan roda menyentuh landasan.",
    crashed: "Pesawat menghantam tanah. Coba lagi dengan lebih hati-hati.",
    fuel: "Tangki kosong di tengah jalan. Hemat bahan bakar lain kali.",
    time: "Waktu misi habis sebelum mendarat.",
    past: "Pesawat terbang melewati landasan tanpa mendarat.",
  };
  $("endTitle").textContent = titles[kind];
  $("endDetail").textContent = details[kind];
  $("endScore").textContent = `Skor: ${state.score}  •  Cincin: ${state.ringsPassed}/${state.mission.rings}`;
  showOverlay("overlayEnd");
  if (kind === "landed") audio.land();
}

function landPlane() {
  const bonus = Math.max(0, Math.floor(state.timeLeft)) * SCORES.timeBonusPerSec;
  const perfect = state.plane.hearts === PHYSICS.maxHearts ? SCORES.perfectBonus : 0;
  state.score += SCORES.landing + bonus + perfect;
  endGame("landed");
}

function update(dt) {
  const { plane, world, mission } = state;
  stepPlane(plane, input, mission, dt);
  state.time += dt;
  state.timeLeft = mission.time - state.time;
  audio.setEngine(plane.speed / (PHYSICS.maxSpeed + PHYSICS.boostSpeed), true);

  // Cincin berikutnya: hanya cincin sesuai urutan yang bisa dilewati.
  const ring = world.rings[state.nextRing];
  if (ring) {
    const dx = plane.x - ring.x;
    const dy = plane.y - ring.y;
    if (dx * dx + dy * dy < (ring.r + 24) * (ring.r + 24)) {
      ring.passed = true;
      state.ringsPassed += 1;
      state.nextRing += 1;
      state.score += SCORES.ring;
      plane.fuel = Math.min(PHYSICS.maxFuel, plane.fuel + PHYSICS.ringFuel);
      audio.ring();
      showToast(`Cincin ${ring.index + 1} dilewati! +${SCORES.ring} • Bahan bakar +${PHYSICS.ringFuel}`);
    }
  }

  // Koin: tambah skor dan sedikit bahan bakar.
  for (const coin of world.coins) {
    if (coin.taken) continue;
    const dx = plane.x - coin.x;
    const dy = plane.y - coin.y;
    if (dx * dx + dy * dy < 30 * 30) {
      coin.taken = true;
      state.score += SCORES.coin;
      plane.fuel = Math.min(PHYSICS.maxFuel, plane.fuel + PHYSICS.coinFuel);
      audio.coin();
    }
  }

  // Burung: tabrakan mengurangi nyawa dan memantulkan pesawat.
  for (const bird of world.birds) {
    const bx = bird.baseX + Math.sin(state.time * bird.speed + bird.phase) * 60;
    const by = bird.baseY + Math.sin(state.time * 1.3 + bird.phase) * 20;
    const dx = plane.x - bx;
    const dy = plane.y - by;
    if (dx * dx + dy * dy < 36 * 36 && damagePlane(plane)) {
      audio.crash();
      plane.vy = -120;
      plane.speed *= 0.8;
      showToast("Menabrak burung! -1 nyawa");
      if (plane.hearts <= 0) {
        endGame("crashed");
        return;
      }
    }
  }

  // Landasan: mendarat hanya kalau rendah dan pelan.
  const rw = world.runway;
  const overRunway = plane.x >= rw.x && plane.x <= rw.x + rw.w;
  if (overRunway && plane.y >= GROUND_Y - 30) {
    if (plane.speed < 260) {
      if (state.ringsPassed >= mission.rings) {
        landPlane();
        return;
      }
      showToast("Selesaikan semua cincin dulu!");
      plane.x -= 120;
      plane.vy = -160;
      plane.y = GROUND_Y - 60;
    } else {
      // Mendarat terlalu cepat: memantul tanpa merusak pesawat.
      showToast("Terlalu cepat! Pelankan sebelum mendarat.");
      plane.y = GROUND_Y - 16;
      plane.vy = -100;
      plane.speed *= 0.75;
    }
    return;
  }

  // Tanah atau gunung: tabrakan memantul; nyawa habis berarti jatuh.
  if (hitsGround(plane, world)) {
    if (damagePlane(plane)) {
      audio.crash();
      showToast("Menghantam tanah! -1 nyawa");
    }
    plane.y = groundHeightAt(plane.x, world) - 14;
    plane.vy = -140;
    plane.speed *= 0.7;
    if (plane.hearts <= 0) {
      endGame("crashed");
      return;
    }
  }

  // Tiga akhir misi lainnya.
  if (plane.fuel <= 0) endGame("fuel");
  else if (state.timeLeft <= 0) endGame("time");
  else if (plane.x > rw.x + rw.w + 250) endGame("past");
}

function updateHUD() {
  const { plane, mission } = state;
  hud.mission.textContent = `Misi ${mission.id} — ${mission.name}`;
  hud.fuel.style.width = `${plane.fuel}%`;
  hud.fuelText.textContent = `${Math.round(plane.fuel)}%`;
  hud.hearts.textContent = "♥".repeat(Math.max(0, plane.hearts)) + "♡".repeat(Math.max(0, 3 - plane.hearts));
  const t = Math.max(0, Math.ceil(state.timeLeft));
  hud.timer.textContent = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
  hud.score.textContent = `Skor ${state.score}`;
  hud.rings.textContent = `Cincin ${state.ringsPassed}/${mission.rings}`;
  hud.dist.textContent = `Landasan ${Math.round(distanceToRunway(plane, state.world) * 1.5)} m`;
  hud.throttle.style.width = `${Math.round(plane.throttle * 100)}%`;
  if (state.toast && state.time > state.toastUntil) {
    hud.toast.classList.add("hidden");
    state.toast = "";
  }
}

function draw() {
  drawScene(ctx, state, state.time);
  drawGauges($("gAlt"), $("gSpd"), $("gHdg"), state.plane);
}

// Layar judul memakai dunia misi 1 dengan pesawat diam di tanah.
let titleState = null;
function getTitleState() {
  if (!titleState) {
    titleState = newGame(0);
    titleState.phase = "title";
    titleState.plane.x = 180;
    titleState.plane.y = GROUND_Y - 16;
    titleState.plane.speed = 0;
    titleState.plane.throttle = 0;
  }
  return titleState;
}

let last = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;

  if (input.pause !== prevPause) {
    paused = input.pause;
    prevPause = input.pause;
    if (state) showToast(paused ? "Jeda — tekan P untuk lanjut" : "Lanjut terbang!");
  }
  if (input.muted !== prevMuted) {
    prevMuted = input.muted;
    audio.setMuted(input.muted);
  }

  if (state.phase === "title" || state.phase === "brief") {
    // Layar judul memakai keadaan judulnya sendiri, bukan keadaan
    // permainan terakhir — jadi misi dan dunia tidak pernah tertukar.
    const ts = getTitleState();
    ts.time += dt;
    drawScene(ctx, ts, ts.time);
    drawGauges($("gAlt"), $("gSpd"), $("gHdg"), ts.plane);
  } else if (!paused) {
    if (state.phase === "flying") update(dt);
    updateHUD();
    draw();
  } else {
    draw();
  }
  requestAnimationFrame(loop);
}

// Tombol-tombol layar.
$("btnStart").addEventListener("click", () => {
  audio.ensure();
  state.phase = "brief";
  showOverlay("overlayBrief");
});
$("btnFly").addEventListener("click", () => {
  const idx = parseInt(document.querySelector(".mission-card.selected")?.dataset.mission || "0", 10);
  startGame(idx);
});
$("btnAgain").addEventListener("click", () => {
  state = getTitleState();
  state.phase = "title";
  showOverlay("overlayTitle");
});
document.querySelectorAll(".mission-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".mission-card").forEach((c) => c.classList.remove("selected"));
    card.classList.add("selected");
    const m = MISSIONS[parseInt(card.dataset.mission, 10)];
    $("briefName").textContent = `Misi ${m.id} — ${m.name}`;
    $("briefDesc").textContent = m.desc;
  });
});
window.addEventListener("keydown", (e) => {
  if (e.code === "Enter" && state && state.phase === "title") {
    audio.ensure();
    state.phase = "brief";
    showOverlay("overlayBrief");
  }
});

// Boot: mode tangkapan layar menggambar satu frame beku,
// permainan biasa mulai dari layar judul.
(function boot() {
  const { shot, seed } = parseShot();
  if (["start", "play", "rings", "land"].includes(shot)) {
    state = shotState(shot, seed);
    freezeAnimations();
    if (state.phase === "title") showOverlay("overlayTitle");
    else showOverlay(null);
    updateHUD();
    draw();
    return;
  }
  state = getTitleState();
  state.phase = "title";
  showOverlay("overlayTitle");
  requestAnimationFrame(loop);
})();
