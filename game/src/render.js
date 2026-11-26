// Semua gambar: langit, laut, pulau, cincin, pesawat, dan pengukur.
// Kamera mengikuti pesawat; semua posisi dunia dikurangi camX.

import { VIEW_W, VIEW_H, GROUND_Y, COLORS } from "./config.js";
import { clamp } from "./random.js";
import { altitudeOf, headingOf } from "./plane.js";

export function cameraX(plane, world) {
  const max = Math.max(0, world.distance - VIEW_W + 200);
  return clamp(plane.x - 260, 0, max);
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function drawScene(ctx, state, time) {
  const { mission, world, plane } = state;
  const camX = cameraX(plane, world);

  // Langit: gradasi biru muda ke bawah.
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, COLORS.skyTop);
  sky.addColorStop(0.55, COLORS.skyMid);
  sky.addColorStop(1, COLORS.skyLow);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, VIEW_W, GROUND_Y);

  // Matahari dengan cahaya lembut, diam di sudut kanan atas layar.
  ctx.save();
  ctx.shadowColor = COLORS.sunGlow;
  ctx.shadowBlur = 60;
  ctx.fillStyle = COLORS.sun;
  circle(ctx, 1060, 92, 42);
  ctx.restore();
  ctx.fillStyle = COLORS.sunGlow;
  circle(ctx, 1060, 92, 30);

  // Awan: parallax lambat, posisi tetap dari indeksnya.
  ctx.fillStyle = COLORS.cloud;
  for (let i = 0; i < 8; i++) {
    const span = VIEW_W + 480;
    const cx = (((i * 397 + 300 - camX * 0.3) % span) + span) % span - 240;
    const cy = 52 + ((i * 53) % 150);
    const s = 0.8 + ((i * 37) % 40) / 50;
    ctx.globalAlpha = 0.92;
    circle(ctx, cx, cy, 26 * s);
    circle(ctx, cx + 26 * s, cy + 6 * s, 20 * s);
    circle(ctx, cx - 26 * s, cy + 8 * s, 18 * s);
    circle(ctx, cx + 4 * s, cy - 12 * s, 20 * s);
  }
  ctx.globalAlpha = 1;

  // Pegunungan jauh: parallax sedang, segitiga biru pudar.
  ctx.fillStyle = COLORS.mountainFar;
  for (let i = 0; i < 6; i++) {
    const span = VIEW_W + 700;
    const mx = (((i * 523 + 120 - camX * 0.5) % span) + span) % span - 350;
    const mh = 110 + ((i * 61) % 90);
    ctx.beginPath();
    ctx.moveTo(mx - 190, GROUND_Y);
    ctx.lineTo(mx, GROUND_Y - mh);
    ctx.lineTo(mx + 190, GROUND_Y);
    ctx.closePath();
    ctx.fill();
  }

  // Laut: gradasi teal dengan ombak putih yang bergerak pelan.
  const sea = ctx.createLinearGradient(0, GROUND_Y, 0, VIEW_H);
  sea.addColorStop(0, COLORS.sea);
  sea.addColorStop(1, COLORS.seaDeep);
  ctx.fillStyle = sea;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  ctx.strokeStyle = COLORS.seaFoam;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const wx = (((i * 211 + time * 24) % (VIEW_W + 120)) + VIEW_W + 120) % (VIEW_W + 120) - 60;
    const wy = GROUND_Y + 14 + ((i * 29) % 52);
    ctx.beginPath();
    ctx.arc(wx, wy, 12 + ((i * 13) % 10), Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;

  // Pulau: pasir di bawah, hijau di atas, palem di puncaknya.
  for (const isl of world.islands) {
    const sx = isl.x - camX;
    if (sx + isl.w < -50 || sx > VIEW_W + 50) continue;
    ctx.fillStyle = COLORS.sand;
    ctx.beginPath();
    ctx.ellipse(sx + isl.w / 2, GROUND_Y - 4, isl.w / 2, 14, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = COLORS.island;
    ctx.beginPath();
    ctx.ellipse(sx + isl.w / 2, GROUND_Y - isl.h, isl.w / 2, isl.h * 0.55, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = COLORS.islandDark;
    ctx.beginPath();
    ctx.ellipse(sx + isl.w / 2, GROUND_Y - isl.h * 0.7, isl.w / 3, isl.h * 0.3, 0, Math.PI, 0);
    ctx.fill();
    for (const palm of isl.palms) {
      const px = sx + palm.dx;
      const py = GROUND_Y - isl.h * 0.85;
      ctx.strokeStyle = "#7a5230";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + 4, py - palm.h);
      ctx.stroke();
      ctx.strokeStyle = COLORS.palm;
      ctx.lineWidth = 2.5;
      for (let f = 0; f < 4; f++) {
        const a = -Math.PI / 2 + (f - 1.5) * 0.55;
        ctx.beginPath();
        ctx.moveTo(px + 4, py - palm.h);
        ctx.lineTo(px + 4 + Math.cos(a) * 16, py - palm.h + Math.sin(a) * 12 + 8);
        ctx.stroke();
      }
    }
  }

  // Gunung berapi: kerucut cokelat, lava menyala, asap mengepul.
  for (const v of world.volcanoes) {
    const sx = v.x - camX;
    if (sx + v.w / 2 < -50 || sx - v.w / 2 > VIEW_W + 50) continue;
    ctx.fillStyle = COLORS.volcano;
    ctx.beginPath();
    ctx.moveTo(sx - v.w / 2, GROUND_Y);
    ctx.lineTo(sx - 26, GROUND_Y - v.h);
    ctx.lineTo(sx + 26, GROUND_Y - v.h);
    ctx.lineTo(sx + v.w / 2, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = COLORS.volcanoDark;
    ctx.beginPath();
    ctx.moveTo(sx + 26, GROUND_Y - v.h);
    ctx.lineTo(sx + v.w / 2, GROUND_Y);
    ctx.lineTo(sx, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.shadowColor = COLORS.lavaGlow;
    ctx.shadowBlur = 18;
    ctx.fillStyle = COLORS.lava;
    ctx.beginPath();
    ctx.ellipse(sx, GROUND_Y - v.h + 4, 26, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    for (let s = 0; s < 3; s++) {
      const rise = ((time * 22 + s * 40) % 120) / 120;
      const sy = GROUND_Y - v.h - 10 - rise * 90;
      ctx.globalAlpha = 0.7 * (1 - rise);
      circle(ctx, sx + Math.sin(time + s * 2) * 8, sy, 8 + rise * 16);
    }
    ctx.globalAlpha = 1;
  }

  // Landasan: strip abu-abu, garis tengah putih, lampu kuning, papan nama.
  const rw = world.runway;
  const rx = rw.x - camX;
  if (rx < VIEW_W + 100 && rx + rw.w > -100) {
    ctx.fillStyle = COLORS.runway;
    ctx.fillRect(rx, GROUND_Y - 6, rw.w, 12);
    ctx.fillStyle = COLORS.runwayLine;
    for (let d = 12; d < rw.w - 12; d += 40) {
      ctx.fillRect(rx + d, GROUND_Y - 2, 20, 4);
    }
    ctx.fillStyle = COLORS.runwayLight;
    for (let d = 0; d <= rw.w; d += 40) {
      circle(ctx, rx + d, GROUND_Y - 8, 3);
      circle(ctx, rx + d, GROUND_Y + 8, 3);
    }
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(rx + 8, GROUND_Y - 52, 96, 30);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("LANDASAN", rx + 56, GROUND_Y - 37);
  }

  // Cincin: lingkaran emas bercahaya dengan nomor; cincin berikutnya
  // berdenyut lebih terang dan bertanda panah kecil di atasnya.
  for (const ring of world.rings) {
    const sx = ring.x - camX;
    if (sx < -80 || sx > VIEW_W + 80) continue;
    const pulse = 1 + 0.06 * Math.sin(time * 3 + ring.index);
    const isNext = ring.index === state.nextRing;
    ctx.save();
    ctx.shadowColor = isNext ? COLORS.ringGlow : COLORS.ring;
    ctx.shadowBlur = isNext ? 30 : 12;
    ctx.strokeStyle = ring.passed ? "#22c55e" : COLORS.ring;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(sx, ring.y, ring.r * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = ring.passed ? "#22c55e" : "#7c4a03";
    ctx.font = "bold 26px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(ring.index + 1), sx, ring.y);
    if (isNext) {
      ctx.fillStyle = COLORS.ringGlow;
      ctx.beginPath();
      ctx.moveTo(sx, ring.y - ring.r - 26);
      ctx.lineTo(sx - 10, ring.y - ring.r - 10);
      ctx.lineTo(sx + 10, ring.y - ring.r - 10);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Koin "Rp": lingkaran emas yang naik-turun pelan.
  for (const coin of world.coins) {
    if (coin.taken) continue;
    const sx = coin.x - camX;
    if (sx < -30 || sx > VIEW_W + 30) continue;
    const cy = coin.y + Math.sin(time * 2 + coin.phase) * 4;
    ctx.save();
    ctx.shadowColor = COLORS.coin;
    ctx.shadowBlur = 10;
    ctx.fillStyle = COLORS.coin;
    circle(ctx, sx, cy, coin.r);
    ctx.restore();
    ctx.strokeStyle = COLORS.coinText;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx, cy, coin.r - 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = COLORS.coinText;
    ctx.font = "bold 11px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Rp", sx, cy);
  }

  // Burung: dua sayap yang mengepak, berpatroli di sekitar titiknya.
  ctx.strokeStyle = COLORS.bird;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (const bird of world.birds) {
    const bx = bird.baseX + Math.sin(time * bird.speed + bird.phase) * 60 - camX;
    const by = bird.baseY + Math.sin(time * 1.3 + bird.phase) * 20;
    if (bx < -40 || bx > VIEW_W + 40) continue;
    const flap = Math.sin(time * 10 + bird.phase) * 7;
    ctx.beginPath();
    ctx.moveTo(bx - 14, by - flap);
    ctx.quadraticCurveTo(bx - 5, by + 3, bx, by);
    ctx.quadraticCurveTo(bx + 5, by + 3, bx + 14, by - flap);
    ctx.stroke();
  }
  ctx.lineCap = "butt";

  // Pesawat: berkedip saat kebal, miring mengikuti arah hadap.
  const px = plane.x - camX;
  const py = plane.y;
  const blink = plane.invincible > 0 && Math.floor(time * 8) % 2 === 0;
  if (!blink && px > -80 && px < VIEW_W + 80) {
    const angle = (-headingOf(plane) * Math.PI) / 180;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle * 0.7);
    ctx.fillStyle = COLORS.planeBody;
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.planeAccent;
    ctx.fillRect(-28, -3, 56, 5);
    ctx.fillStyle = COLORS.planeBody;
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(6, -20);
    ctx.lineTo(12, -6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-26, 2);
    ctx.lineTo(-34, -12);
    ctx.lineTo(-28, 2);
    ctx.closePath();
    ctx.fill();
    ctx.save();
    ctx.shadowColor = COLORS.cockpit;
    ctx.shadowBlur = 12;
    ctx.fillStyle = COLORS.cockpit;
    ctx.beginPath();
    ctx.ellipse(14, -4, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(30 + Math.cos(time * 40) * 10, Math.sin(time * 40) * 10);
    ctx.stroke();
    ctx.restore();
    // Jejak asap tipis di belakang pesawat, searah geraknya.
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px - 34, py + 4);
    ctx.lineTo(px - 34 - Math.max(0, plane.speed) * 0.16, py + 4 - plane.vy * 0.1);
    ctx.stroke();
    ctx.restore();
  }

  // Badai: hujan miring dan kilat sesekali.
  if (mission.storm) {
    ctx.strokeStyle = "rgba(174, 194, 224, 0.35)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 90; i++) {
      const rx2 = (((i * 97 + time * 900) % (VIEW_W + 40)) + VIEW_W + 40) % (VIEW_W + 40) - 20;
      const ry2 = (((i * 57 + time * 1400) % (VIEW_H + 40)) + VIEW_H + 40) % (VIEW_H + 40) - 20;
      ctx.moveTo(rx2, ry2);
      ctx.lineTo(rx2 - 8, ry2 + 18);
    }
    ctx.stroke();
    if (time % 7 < 0.15) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      let lx = 300 + ((time * 100) % 500);
      let ly = 0;
      ctx.moveTo(lx, ly);
      while (ly < 300) {
        lx += (Math.sin(ly * 0.2 + time) * 30);
        ly += 50;
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(30, 50, 80, 0.12)";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  // Vignette: tepi layar sedikit gelap supaya HUD terbaca.
  const vg = ctx.createRadialGradient(
    VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.45,
    VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.95
  );
  vg.addColorStop(0, "rgba(0, 0, 0, 0)");
  vg.addColorStop(1, "rgba(0, 0, 0, 0.18)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

// Satu pengukur setengah lingkaran: busur, tick, jarum, label, nilai.
function drawGauge(cv, label, value, max, unit) {
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const W = cv.width;
  const H = cv.height;
  ctx.clearRect(0, 0, W, H);
  const cx = W / 2;
  const cy = H - 12;
  const r = Math.min(W / 2 - 8, H - 20);
  const frac = clamp(value / max, 0, 1);

  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, 0);
  ctx.stroke();

  ctx.strokeStyle = COLORS.hudGold;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * frac);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= 4; i++) {
    const a = Math.PI + (Math.PI * i) / 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r - 8), cy + Math.sin(a) * (r - 8));
    ctx.lineTo(cx + Math.cos(a) * (r - 2), cy + Math.sin(a) * (r - 2));
    ctx.stroke();
  }

  const na = Math.PI + Math.PI * frac;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(na) * (r - 12), cy + Math.sin(na) * (r - 12));
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 13px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${Math.round(value)} ${unit}`, cx, cy - r * 0.45);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = "11px Arial, sans-serif";
  ctx.fillText(label, cx, H - 4);
}

// Tiga pengukur: ketinggian (m), kecepatan, dan arah hadap (derajat).
export function drawGauges(gAlt, gSpd, gHdg, plane) {
  drawGauge(gAlt, "KETINGGIAN", altitudeOf(plane), 900, "m");
  drawGauge(gSpd, "KECEPATAN", plane.speed, 540, "");
  drawGauge(gHdg, "ARAH", headingOf(plane) + 45, 90, "°");
}
