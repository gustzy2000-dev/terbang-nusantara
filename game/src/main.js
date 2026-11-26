// Terbang Nusantara — loop utama: misi, tabrakan, skor, layar, dan HUD.
// Satu file, satu tugas: menjalankan game.

import { VIEW_W, VIEW_H, GROUND_Y, MISSIONS, PHYSICS, SCORES } from './config.js';
import { buildWorld, groundHeightAt, hitsGround } from './world.js';
import { makePlane, stepPlane, damagePlane, tryLand, altitudeOf, headingOf } from './plane.js';
import { drawScene, drawAltGauge, drawSpeedGauge, drawHeadingGauge } from './render.js';
import { makeAudio, startEngine, setEngine, stopEngine, playRing, playCoin, playCrash, playLand, playClick, toggleMute } from './audio.js';
import { makeInput } from './input.js';
import { parseShot, shotState, freezeAnimations } from './shots.js';

const canvas = document.getElementById('cv');
const ctx = canvas.getContext('2d');

const els = {
  mission: document.getElementById('hudMission'),
  score: document.getElementById('hudScore'),
  rings: document.getElementById('hudRings'),
  timer: document.getElementById('hudTimer'),
  fuel: document.getElementById('fuelFill'),
  fuelWrap: document.getElementById('fuelWrap'),
  hearts: document.getElementById('hudHearts'),
  thr: document.getElementById('thrFill'),
  toast: document.getElementById('toast'),
  tag: document.getElementById('missionTag'),
  vAlt: document.getElementById('vAlt'),
  vSpd: document.getElementById('vSpd'),
  vHdg: document.getElementById('vHdg'),
  gAlt: document.getElementById('gAlt'),
  gSpd: document.getElementById('gSpd'),
  gHdg: document.getElementById('gHdg'),
  title: document.getElementById('titleScreen'),
  brief: document.getElementById('briefScreen'),
  end: document.getElementById('endScreen'),
  briefTitle: document.getElementById('briefTitle'),
  briefText: document.getElementById('briefText'),
  briefStats: document.getElementById('briefStats'),
  endTitle: document.getElementById('endTitle'),
  endText: document.getElementById('endText'),
  endStats: document.getElementById('endStats'),
};

const input = makeInput();
const audio = makeAudio();

const shot = parseShot();
let state = null;
let phase = 'title'; // title | brief | flying | done
let missionIndex = 0;
let score = 0;
let ringsGot = 0;
let coinsGot = 0;
let timeLeft = 0;
let time = 0;
let lastTs = 0;
let toastTimer = 0;
let tagTimer = 0;

function newMission(index) {
  missionIndex = index;
  const mission = MISSIONS[index];
  const world = buildWorld(mission, 1000 + index * 77);
  const plane = makePlane();
  state = { mission, world, plane };
  score = index === 0 ? 0 : score;
  ringsGot = 0;
  coinsGot = 0;
  timeLeft = mission.timeLimit;
  time = 0;
  phase = 'brief';
  showBrief(mission);
}

function showBrief(mission) {
  els.briefTitle.textContent = `Misi ${mission.id} — ${mission.name}`;
  els.briefText.textContent = mission.brief;
  els.briefStats.innerHTML =
    stat(mission.rings, 'RING') + stat(mission.coins, 'KOIN') +
    stat(mission.timeLimit + ' dtk', 'WAKTU') +
    stat(mission.wind ? `Angin ${mission.wind}` : 'Tenang', 'CUACA');
  els.brief.classList.remove('hidden');
  els.title.classList.add('hidden');
  els.end.classList.add('hidden');
  updateHud();
}

function stat(value, label) {
  return `<div class="stat"><b>${value}</b><span>${label}</span></div>`;
}

function showToast(text, seconds = 2) {
  els.toast.textContent = text;
  els.toast.style.display = 'block';
  toastTimer = seconds;
}

function showTag(title, sub) {
  els.tag.innerHTML = `${title}<small>${sub}</small>`;
  els.tag.style.display = 'block';
  tagTimer = 2.2;
}

function updateHud() {
  if (!state) return;
  const { mission, plane } = state;
  els.mission.innerHTML =
    `Misi ${mission.id} — ${mission.name}<small>${mission.goal}</small>`;
  els.score.textContent = score.toLocaleString('id-ID');
  els.rings.textContent = `${ringsGot}/${mission.rings}`;
  els.timer.textContent = Math.max(0, Math.ceil(timeLeft));
  els.fuel.style.width = plane.fuel + '%';
  els.fuelWrap.classList.toggle('low', plane.fuel < 25);
  els.hearts.textContent = '❤'.repeat(Math.max(0, plane.hearts)) + '🤍'.repeat(Math.max(0, PHYSICS.maxHearts - plane.hearts));
  els.thr.style.width = Math.round(plane.throttle * 100) + '%';
  els.vAlt.textContent = altitudeOf(plane);
  els.vSpd.textContent = Math.round(plane.speed);
  els.vHdg.textContent = String(headingOf(plane)).padStart(3, '0');
  drawAltGauge(els.gAlt, plane);
  drawSpeedGauge(els.gSpd, plane);
  drawHeadingGauge(els.gHdg, plane);
}

function endMission(won, reason) {
  phase = 'done';
  stopEngine(audio);
  const mission = state.mission;
  let bonus = 0;
  if (won) {
    bonus = Math.round(timeLeft) * SCORES.timeBonusPerSec + SCORES.landing;
    if (state.plane.hearts === PHYSICS.maxHearts) bonus += SCORES.perfectBonus;
    score += bonus;
    playLand(audio);
  }
  els.endTitle.textContent = won ? `Misi ${mission.id} Selesai!` : 'Penerbangan Gagal';
  els.endText.textContent = won
    ? `Kamu mendarat mulus di landasan. Bonus mendarat ${SCORES.landing} + bonus waktu ${Math.round(timeLeft) * SCORES.timeBonusPerSec}` +
      (state.plane.hearts === PHYSICS.maxHearts ? ` + bonus sempurna ${SCORES.perfectBonus}` : '') + '.'
    : reason;
  els.endStats.innerHTML =
    stat(score.toLocaleString('id-ID'), 'SKOR TOTAL') +
    stat(`${ringsGot}/${mission.rings}`, 'RING') +
    stat(coinsGot, 'KOIN') +
    stat(Math.max(0, Math.ceil(timeLeft)) + ' dtk', 'SISA WAKTU');
  document.getElementById('btnNext').textContent =
    won && missionIndex < MISSIONS.length - 1 ? 'LANJUT MISI BERIKUTNYA' : 'MAIN LAGI DARI MISI 1';
  els.end.classList.remove('hidden');
  updateHud();
}

function step(dt) {
  if (phase !== 'flying' || !state) return;
  const { mission, world, plane } = state;
  time += dt;
  timeLeft -= dt;

  if (input.paused) return;
  stepPlane(plane, input, mission, dt);
  setEngine(audio, plane.throttle, plane.speed);

  // Ring: lewati lingkaran.
  for (const ring of world.rings) {
    if (ring.passed) continue;
    const dx = plane.x - ring.x;
    const dy = plane.y - ring.y;
    if (Math.hypot(dx, dy) < ring.r) {
      ring.passed = true;
      ringsGot += 1;
      score += SCORES.ring;
      plane.fuel = Math.min(PHYSICS.maxFuel, plane.fuel + PHYSICS.ringFuel);
      playRing(audio);
      showToast(`Ring ${ring.id} dilewati! +${SCORES.ring}`);
      if (ringsGot === mission.rings) showTag('SEMUA RING DILEWATI', 'Sekarang mendarat di landasan!');
    }
  }

  // Koin.
  for (const coin of world.coins) {
    if (coin.taken) continue;
    if (Math.hypot(plane.x - coin.x, plane.y - coin.y) < 42) {
      coin.taken = true;
      coinsGot += 1;
      score += SCORES.coin;
      plane.fuel = Math.min(PHYSICS.maxFuel, plane.fuel + PHYSICS.coinFuel);
      playCoin(audio);
    }
  }

  // Burung.
  for (const bird of world.birds) {
    bird.x += bird.speed * dt;
    bird.y = bird.baseY + Math.sin(time * 2 + bird.wing) * 26;
    if (Math.hypot(plane.x - bird.x, plane.y - bird.y) < 34) {
      if (damagePlane(plane)) {
        playCrash(audio);
        showToast('Menabrak burung! −1 nyawa');
        if (plane.crashed) {
          endMission(false, 'Pesawatmu jatuh setelah menabrak burung. Coba lagi, terbang lebih hati-hati.');
          return;
        }
      }
    }
  }

  // Daratan dan gunung.
  if (hitsGround(world, plane.x, plane.y + 10)) {
    if (tryLand(plane, world) && ringsGot === mission.rings) {
      endMission(true);
      return;
    }
    if (damagePlane(plane)) {
      playCrash(audio);
      showToast('Menabrak daratan! −1 nyawa');
      if (plane.crashed) {
        endMission(false, 'Pesawatmu jatuh ke daratan. Ingat: lewati semua ring dulu, baru mendarat.');
        return;
      }
    }
  }

  // Mendarat tanpa semua ring: ditolak, lepas landas lagi.
  if (tryLand(plane, world) && ringsGot < mission.rings) {
    plane.landed = false;
    plane.y = GROUND_Y - 120;
    plane.speed = 220;
    showToast(`Belum bisa mendarat — ${mission.rings - ringsGot} ring lagi!`);
  }

  // Bahan bakar habis.
  if (plane.fuel <= 0 && plane.speed < 130) {
    plane.crashed = true;
    endMission(false, 'Bahan bakar habis dan pesawat kehilangan kecepatan. Lewati ring untuk mengisi bahan bakar.');
    return;
  }

  // Waktu habis.
  if (timeLeft <= 0) {
    endMission(false, 'Waktu habis sebelum kamu menyelesaikan misi. Coba lagi dengan rute yang lebih cepat.');
    return;
  }

  // Keluar rute.
  if (plane.x > world.distance + 200) {
    endMission(false, 'Kamu terbang melewati ujung rute tanpa mendarat. Putar balik dan cari landasannya.');
  }
}

function frame(ts) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0.016);
  lastTs = ts;

  if (shot && state) {
    // Mode screenshot: gambar sekali, beku.
    drawScene(ctx, state, state.time);
    updateHud();
    return;
  }

  if (!state) {
    // Layar judul: gambar dunia misi 1 sebagai latar.
    const demo = { mission: MISSIONS[0], world: buildWorld(MISSIONS[0], 1000), plane: makePlane() };
    demo.plane.x = 900;
    demo.plane.y = 260;
    drawScene(ctx, demo, ts / 1000);
    return;
  }

  step(dt);
  drawScene(ctx, state, time);
  updateHud();

  if (toastTimer > 0) {
    toastTimer -= dt;
    if (toastTimer <= 0) els.toast.style.display = 'none';
  }
  if (tagTimer > 0) {
    tagTimer -= dt;
    if (tagTimer <= 0) els.tag.style.display = 'none';
  }
}

document.getElementById('btnStart').addEventListener('click', () => {
  playClick(audio);
  startEngine(audio);
  newMission(0);
});

document.getElementById('btnFly').addEventListener('click', () => {
  playClick(audio);
  els.brief.classList.add('hidden');
  phase = 'flying';
  startEngine(audio);
  showTag(`MISI ${state.mission.id}`, state.mission.name);
});

document.getElementById('btnNext').addEventListener('click', () => {
  playClick(audio);
  els.end.classList.add('hidden');
  if (state.plane.landed && missionIndex < MISSIONS.length - 1) {
    newMission(missionIndex + 1);
  } else {
    newMission(0);
  }
});

document.getElementById('btnAgain').addEventListener('click', () => {
  playClick(audio);
  els.end.classList.add('hidden');
  score = 0;
  newMission(0);
});

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyM') {
    const muted = toggleMute(audio);
    showToast(muted ? 'Suara mati' : 'Suara hidup', 1.2);
  }
});

// Mode screenshot: bangun keadaan beku, gambar sekali, jangan mulai loop interaktif.
if (shot) {
  const frozen = shotState(shot, MISSIONS);
  if (frozen) {
    state = { mission: frozen.mission, world: frozen.world, plane: frozen.plane, time: frozen.time };
    score = frozen.score;
    ringsGot = frozen.ringsGot;
    timeLeft = frozen.mission.timeLimit - 20;
    phase = frozen.phase === 'title' ? 'title' : 'flying';
    freezeAnimations();
    if (frozen.phase === 'title') {
      els.title.classList.remove('hidden');
    } else {
      els.title.classList.add('hidden');
    }
    drawScene(ctx, state, frozen.time);
    updateHud();
  }
}

requestAnimationFrame(frame);
