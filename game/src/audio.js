// Suara WebAudio: dengung mesin, lonceng ring, koin, tabrakan, dan fanfare mendarat.
// Semua suara dibuat dari osilator — tanpa file audio.
// Satu file, satu tugas: bunyi.

export function makeAudio() {
  const audio = {
    ctx: null,
    engineOsc: null,
    engineGain: null,
    muted: false,
    started: false,
  };
  return audio;
}

function ensureCtx(audio) {
  if (!audio.ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audio.ctx = new AC();
  }
  if (audio.ctx.state === 'suspended') audio.ctx.resume();
  return audio.ctx;
}

export function startEngine(audio) {
  const ctx = ensureCtx(audio);
  if (!ctx || audio.started) return;
  audio.started = true;
  audio.engineOsc = ctx.createOscillator();
  audio.engineOsc.type = 'sawtooth';
  audio.engineOsc.frequency.value = 70;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 320;
  audio.engineGain = ctx.createGain();
  audio.engineGain.gain.value = 0.045;
  audio.engineOsc.connect(filter);
  filter.connect(audio.engineGain);
  audio.engineGain.connect(ctx.destination);
  audio.engineOsc.start();
}

export function setEngine(audio, throttle, speed) {
  if (!audio.engineOsc || !audio.ctx) return;
  const target = audio.muted ? 0 : 0.03 + throttle * 0.05;
  audio.engineGain.gain.setTargetAtTime(target, audio.ctx.currentTime, 0.1);
  audio.engineOsc.frequency.setTargetAtTime(55 + throttle * 60 + speed * 0.08, audio.ctx.currentTime, 0.1);
}

export function stopEngine(audio) {
  if (audio.engineOsc) {
    try { audio.engineOsc.stop(); } catch (e) { /* sudah berhenti */ }
    audio.engineOsc = null;
    audio.started = false;
  }
}

function blip(audio, freq, dur, type, vol, when = 0) {
  const ctx = ensureCtx(audio);
  if (!ctx || audio.muted) return;
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol || 0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function playRing(audio) {
  blip(audio, 880, 0.18, 'sine', 0.2);
  blip(audio, 1318, 0.3, 'sine', 0.16, 0.08);
}

export function playCoin(audio) {
  blip(audio, 1200, 0.1, 'triangle', 0.14);
  blip(audio, 1600, 0.14, 'triangle', 0.12, 0.06);
}

export function playCrash(audio) {
  blip(audio, 90, 0.4, 'sawtooth', 0.25);
  blip(audio, 55, 0.5, 'square', 0.18, 0.05);
}

export function playLand(audio) {
  const notes = [523, 659, 784, 1046];
  notes.forEach((n, i) => blip(audio, n, 0.25, 'triangle', 0.18, i * 0.11));
}

export function playClick(audio) {
  blip(audio, 700, 0.07, 'square', 0.08);
}

export function toggleMute(audio) {
  audio.muted = !audio.muted;
  if (audio.engineGain && audio.ctx) {
    audio.engineGain.gain.setTargetAtTime(audio.muted ? 0 : 0.05, audio.ctx.currentTime, 0.05);
  }
  return audio.muted;
}
