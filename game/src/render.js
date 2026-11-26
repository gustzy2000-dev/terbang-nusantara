// Semua gambar di canvas: langit, laut, daratan, landasan, ring, pesawat, dan alat ukur.
// Satu file, satu tugas: menggambar.

import { VIEW_W, VIEW_H, GROUND_Y, COLORS } from './config.js';
import { groundHeightAt } from './world.js';
import { altitudeOf, headingOf } from './plane.js';

export function drawScene(ctx, state, time) {
  const { mission, world, plane } = state;
  const storm = mission.storm;
  const camX = Math.max(0, plane.x - 300);

  drawSky(ctx, storm, time);
  drawSun(ctx, storm, time);
  drawClouds(ctx, camX, storm, time);
  drawFarMountains(ctx, camX, storm);
  drawSea(ctx, camX, time);
  drawIslands(ctx, world, camX, time);
  drawPeaks(ctx, world, camX, time);
  drawRunway(ctx, world, camX);
  drawRings(ctx, world, camX, time);
  drawCoins(ctx, world, camX, time);
  drawBirds(ctx, world, camX, time);
  drawPlane(ctx, plane, time);
  if (storm) drawRain(ctx, time);
  drawVignette(ctx);
}

function drawSky(ctx, storm, time) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  if (storm) {
    g.addColorStop(0, COLORS.stormTop);
    g.addColorStop(0.55, COLORS.stormMid);
    g.addColorStop(1, '#8a94a8');
  } else {
    g.addColorStop(0, COLORS.skyTop);
    g.addColorStop(0.55, COLORS.skyMid);
    g.addColorStop(1, COLORS.skyBottom);
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function drawSun(ctx, storm, time) {
  const x = 1050;
  const y = 110;
  ctx.save();
  ctx.globalAlpha = storm ? 0.25 : 0.95;
  ctx.fillStyle = '#fff3b0';
  ctx.beginPath();
  ctx.arc(x, y, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = storm ? 0.1 : 0.3;
  ctx.fillStyle = '#ffe98a';
  ctx.beginPath();
  ctx.arc(x, y, 70 + Math.sin(time * 0.8) * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawClouds(ctx, camX, storm, time) {
  ctx.save();
  ctx.fillStyle = storm ? 'rgba(40,48,66,0.85)' : 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 9; i++) {
    const baseX = i * 620 + 120;
    const x = ((baseX - camX * (0.25 + (i % 3) * 0.12)) % 2200 + 2200) % 2200 - 400;
    const y = 70 + (i % 4) * 55 + Math.sin(time * 0.3 + i) * 6;
    const s = 0.8 + (i % 3) * 0.35;
    cloud(ctx, x, y, 90 * s);
  }
  ctx.restore();
}

function cloud(ctx, x, y, w) {
  ctx.beginPath();
  ctx.ellipse(x, y, w, w * 0.32, 0, 0, Math.PI * 2);
  ctx.ellipse(x - w * 0.45, y + 6, w * 0.55, w * 0.24, 0, 0, Math.PI * 2);
  ctx.ellipse(x + w * 0.45, y + 6, w * 0.6, w * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFarMountains(ctx, camX, storm) {
  ctx.save();
  ctx.fillStyle = storm ? '#4c5a72' : '#7fa8c9';
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  for (let x = 0; x <= VIEW_W; x += 40) {
    const wx = x + camX * 0.4;
    const h = 90 + 70 * Math.abs(Math.sin(wx * 0.004)) + 40 * Math.sin(wx * 0.011);
    ctx.lineTo(x, GROUND_Y - h);
  }
  ctx.lineTo(VIEW_W, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSea(ctx, camX, time) {
  const g = ctx.createLinearGradient(0, GROUND_Y - 30, 0, VIEW_H);
  g.addColorStop(0, COLORS.sea);
  g.addColorStop(1, COLORS.seaDeep);
  ctx.fillStyle = g;
  ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
  // Ombak.
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 14; i++) {
    const x = ((i * 173 - camX) % 1400 + 1400) % 1400 - 60;
    const y = GROUND_Y + 18 + (i % 3) * 22;
    const w = 34 + (i % 4) * 8;
    ctx.beginPath();
    ctx.moveTo(x, y + Math.sin(time * 2 + i) * 2);
    ctx.quadraticCurveTo(x + w / 2, y - 6, x + w, y + Math.sin(time * 2 + i) * 2);
    ctx.stroke();
  }
}

function drawIslands(ctx, world, camX, time) {
  for (const isl of world.islands) {
    const x0 = isl.x - camX;
    if (x0 + isl.w < -50 || x0 > VIEW_W + 50) continue;
    // Pasir.
    ctx.fillStyle = COLORS.sand;
    ctx.beginPath();
    ctx.moveTo(x0 - 14, GROUND_Y);
    ctx.quadraticCurveTo(x0 + isl.w / 2, GROUND_Y - isl.h - 26, x0 + isl.w + 14, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    // Rumput.
    ctx.fillStyle = COLORS.grass;
    ctx.beginPath();
    ctx.moveTo(x0, GROUND_Y);
    ctx.quadraticCurveTo(x0 + isl.w / 2, GROUND_Y - isl.h, x0 + isl.w, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    // Palem.
    for (let p = 0; p < isl.palms; p++) {
      const px = x0 + ((p + 0.5) / isl.palms) * isl.w;
      const py = GROUND_Y - isl.h * 0.55 - (p % 2) * 12;
      drawPalm(ctx, px, py, time + p);
    }
  }
}

function drawPalm(ctx, x, y, time) {
  ctx.strokeStyle = '#7a5230';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 4, y - 22, x + 10, y - 34);
  ctx.stroke();
  ctx.strokeStyle = '#2f7d33';
  ctx.lineWidth = 3;
  const sway = Math.sin(time * 1.4) * 3;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI * (0.15 + i * 0.17);
    ctx.beginPath();
    ctx.moveTo(x + 10, y - 34);
    ctx.quadraticCurveTo(
      x + 10 + Math.cos(a) * 16, y - 34 + Math.sin(a) * 12 + sway,
      x + 10 + Math.cos(a) * 26, y - 34 + Math.sin(a) * 20 + sway * 1.5,
    );
    ctx.stroke();
  }
}

function drawPeaks(ctx, world, camX, time) {
  for (const p of world.peaks) {
    const x0 = p.x - camX;
    if (x0 + p.w < -50 || x0 > VIEW_W + 50) continue;
    // Gunung berapi.
    ctx.fillStyle = COLORS.volcano;
    ctx.beginPath();
    ctx.moveTo(x0, GROUND_Y);
    ctx.lineTo(x0 + p.w * 0.5, GROUND_Y - p.h);
    ctx.lineTo(x0 + p.w, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    // Kawah dan lava, menempel di puncak.
    ctx.fillStyle = '#3d2f2f';
    ctx.beginPath();
    ctx.ellipse(x0 + p.w * 0.5, GROUND_Y - p.h + 8, p.w * 0.08, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.lava;
    ctx.beginPath();
    ctx.ellipse(x0 + p.w * 0.5, GROUND_Y - p.h + 8, p.w * 0.045, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Asap.
    if (p.smoke) {
      ctx.fillStyle = 'rgba(240,240,240,0.55)';
      for (let s = 0; s < 3; s++) {
        const sy = GROUND_Y - p.h - 24 - s * 26 - ((time * 12 + s * 40) % 60);
        const sx = x0 + p.w * 0.5 + Math.sin(time + s) * 8 + s * 6;
        ctx.beginPath();
        ctx.arc(sx, sy, 12 + s * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // Salju di puncak gunung biasa (yang tidak berasap).
    if (!p.smoke) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(x0 + p.w * 0.5 - p.w * 0.07, GROUND_Y - p.h + 26);
      ctx.lineTo(x0 + p.w * 0.5, GROUND_Y - p.h);
      ctx.lineTo(x0 + p.w * 0.5 + p.w * 0.07, GROUND_Y - p.h + 26);
      ctx.closePath();
      ctx.fill();
    }
  }
}

function drawRunway(ctx, world, camX) {
  const rw = world.runway;
  const x0 = rw.x - camX;
  if (x0 + rw.w < -50 || x0 > VIEW_W + 50) return;
  ctx.fillStyle = COLORS.runway;
  ctx.fillRect(x0, GROUND_Y - 4, rw.w, 10);
  // Garis tengah.
  ctx.fillStyle = COLORS.runwayLine;
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(x0 + 14 + i * 52, GROUND_Y - 1, 30, 4);
  }
  // Lampu landasan.
  for (let i = 0; i <= 8; i++) {
    ctx.fillStyle = i % 2 ? '#ff5a3c' : '#37ff8a';
    ctx.beginPath();
    ctx.arc(x0 + (i / 8) * rw.w, GROUND_Y - 8, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // Papan "LANDASAN".
  ctx.fillStyle = 'rgba(8,24,46,0.75)';
  ctx.fillRect(x0 + rw.w / 2 - 62, GROUND_Y - 52, 124, 30);
  ctx.fillStyle = '#ffd75e';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LANDASAN', x0 + rw.w / 2, GROUND_Y - 31);
}

function drawRings(ctx, world, camX, time) {
  for (const ring of world.rings) {
    const x = ring.x - camX;
    if (x < -80 || x > VIEW_W + 80) continue;
    if (ring.passed) continue;
    const pulse = 1 + Math.sin(time * 3 + ring.id) * 0.05;
    ctx.save();
    ctx.strokeStyle = COLORS.ringGlow;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(x, ring.y, ring.r * pulse + 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = COLORS.ring;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, ring.y, ring.r * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#08223d';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(ring.id), x, ring.y - ring.r - 10);
    ctx.restore();
  }
}

function drawCoins(ctx, world, camX, time) {
  for (const coin of world.coins) {
    if (coin.taken) continue;
    const x = coin.x - camX;
    if (x < -30 || x > VIEW_W + 30) continue;
    const squish = Math.abs(Math.cos(time * 3 + coin.spin));
    ctx.save();
    ctx.translate(x, coin.y);
    ctx.scale(0.4 + squish * 0.6, 1);
    ctx.fillStyle = '#ffd75e';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c8930a';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#c8930a';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Rp', 0, 5);
    ctx.restore();
  }
}

function drawBirds(ctx, world, camX, time) {
  ctx.save();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const b of world.birds) {
    const x = b.x - camX;
    if (x < -40 || x > VIEW_W + 40) continue;
    const flap = Math.sin(time * 10 + b.wing) * 8;
    ctx.beginPath();
    ctx.moveTo(x - 14, b.y - flap);
    ctx.quadraticCurveTo(x, b.y + 4, x + 14, b.y - flap);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPlane(ctx, plane, time) {
  const sx = 300; // pesawat selalu di x layar 300
  const sy = plane.y;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(plane.pitch);
  if (plane.invincible > 0 && Math.floor(time * 8) % 2 === 0) ctx.globalAlpha = 0.45;

  // Sayap belakang.
  ctx.fillStyle = COLORS.planeWing;
  ctx.beginPath();
  ctx.moveTo(-6, -4);
  ctx.lineTo(-30, -20);
  ctx.lineTo(-34, -12);
  ctx.lineTo(-10, 4);
  ctx.closePath();
  ctx.fill();
  // Badan.
  ctx.fillStyle = COLORS.planeBody;
  ctx.beginPath();
  ctx.moveTo(-42, 2);
  ctx.quadraticCurveTo(-30, -12, 8, -10);
  ctx.quadraticCurveTo(38, -8, 46, 0);
  ctx.quadraticCurveTo(38, 8, 6, 10);
  ctx.quadraticCurveTo(-30, 12, -42, 2);
  ctx.closePath();
  ctx.fill();
  // Jendela kokpit (menyala).
  ctx.fillStyle = COLORS.planeGlass;
  ctx.beginPath();
  ctx.moveTo(16, -8);
  ctx.quadraticCurveTo(30, -7, 36, -1);
  ctx.quadraticCurveTo(26, 2, 14, 1);
  ctx.closePath();
  ctx.fill();
  // Jendela penumpang.
  ctx.fillStyle = 'rgba(191,233,255,0.85)';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(-6 - i * 11, -2, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
  // Sayap utama.
  ctx.fillStyle = COLORS.planeWing;
  ctx.beginPath();
  ctx.moveTo(4, 2);
  ctx.lineTo(-6, 26);
  ctx.lineTo(2, 28);
  ctx.lineTo(16, 6);
  ctx.closePath();
  ctx.fill();
  // Baling-baling.
  ctx.save();
  ctx.translate(48, 0);
  ctx.rotate(plane.propAngle);
  ctx.strokeStyle = 'rgba(40,40,40,0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(0, 16);
  ctx.moveTo(-16, 0);
  ctx.lineTo(16, 0);
  ctx.stroke();
  ctx.restore();
  // Lampu navigasi.
  ctx.fillStyle = '#37ff8a';
  ctx.beginPath();
  ctx.arc(-2, 26, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRain(ctx, time) {
  ctx.save();
  ctx.strokeStyle = 'rgba(180,210,255,0.5)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 90; i++) {
    const x = ((i * 137 + time * 420) % 1400) - 60;
    const y = ((i * 89 + time * 700) % 760) - 20;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 8, y + 22);
    ctx.stroke();
  }
  // Kilat sesekali.
  if (Math.floor(time) % 7 === 3 && time % 1 < 0.12) {
    ctx.fillStyle = 'rgba(255,255,220,0.18)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  ctx.restore();
}

function drawVignette(ctx) {
  const g = ctx.createRadialGradient(
    VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.45, VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.95);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

// ---- Alat ukur (gauge) di bawah layar ----

export function drawAltGauge(canvas, plane) {
  const ctx = canvas.getContext('2d');
  const alt = altitudeOf(plane);
  drawGaugeFace(ctx, canvas.width, canvas.height, '#ffd75e');
  drawNeedle(ctx, canvas.width / 2, canvas.height - 8, 34, (alt % 1000) / 1000, '#ffd75e');
  ctx.fillStyle = '#eaf2ff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(alt + ' m', canvas.width / 2, 16);
}

export function drawSpeedGauge(canvas, plane) {
  const ctx = canvas.getContext('2d');
  drawGaugeFace(ctx, canvas.width, canvas.height, '#7ee0ff');
  drawNeedle(ctx, canvas.width / 2, canvas.height - 8, 34,
    Math.min(1, plane.speed / 500), '#7ee0ff');
  ctx.fillStyle = '#eaf2ff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(Math.round(plane.speed) + '', canvas.width / 2, 16);
}

export function drawHeadingGauge(canvas, plane) {
  const ctx = canvas.getContext('2d');
  const hdg = headingOf(plane);
  drawGaugeFace(ctx, canvas.width, canvas.height, '#37ff8a');
  // Kompas: garis arah.
  const cx = canvas.width / 2;
  const cy = canvas.height - 8;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((hdg - 90) * Math.PI) / 180);
  ctx.strokeStyle = '#37ff8a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -30);
  ctx.stroke();
  ctx.fillStyle = '#37ff8a';
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.lineTo(-5, -26);
  ctx.lineTo(5, -26);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#eaf2ff';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(hdg).padStart(3, '0') + '°', cx, 16);
}

function drawGaugeFace(ctx, w, h, color) {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w / 2, h - 8, 36, Math.PI, 0);
  ctx.stroke();
  ctx.globalAlpha = 1;
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + (i / 10) * Math.PI;
    const x1 = w / 2 + Math.cos(a) * 30;
    const y1 = h - 8 + Math.sin(a) * 30;
    const x2 = w / 2 + Math.cos(a) * 36;
    const y2 = h - 8 + Math.sin(a) * 36;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function drawNeedle(ctx, cx, cy, len, frac, color) {
  const a = Math.PI + frac * Math.PI;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
}

export { groundHeightAt };
