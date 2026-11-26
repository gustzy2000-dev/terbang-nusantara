// Suara WebAudio: dengung mesin yang mengikuti kecepatan,
// dan bunyi pendek untuk koin, cincin, dan tabrakan.
// AudioContext dibuat malas — baru saat pemain pertama kali berinteraksi.

export function createAudio() {
  let ctx = null;
  let engineOsc = null;
  let engineGain = null;
  let muted = false;

  function ensure() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    engineOsc = ctx.createOscillator();
    engineOsc.type = "sawtooth";
    engineOsc.frequency.value = 70;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;
    engineGain = ctx.createGain();
    engineGain.gain.value = 0;
    engineOsc.connect(filter);
    filter.connect(engineGain);
    engineGain.connect(ctx.destination);
    engineOsc.start();
  }

  function setEngine(speed01, flying) {
    if (!ctx || !engineOsc) return;
    const target = muted || !flying ? 0 : 0.05 + speed01 * 0.05;
    engineGain.gain.setTargetAtTime(target, ctx.currentTime, 0.1);
    engineOsc.frequency.setTargetAtTime(60 + speed01 * 90, ctx.currentTime, 0.1);
  }

  function blip(freq, dur, type, vol) {
    if (!ctx || muted) return;
    const osc = ctx.createOscillator();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  return {
    ensure,
    setEngine,
    setMuted(m) {
      muted = m;
      if (engineGain && ctx) {
        engineGain.gain.setTargetAtTime(m ? 0 : 0.06, ctx.currentTime, 0.05);
      }
    },
    coin() {
      blip(880, 0.12, "sine", 0.12);
      setTimeout(() => blip(1320, 0.14, "sine", 0.1), 60);
    },
    ring() {
      blip(523, 0.12, "triangle", 0.16);
      setTimeout(() => blip(784, 0.2, "triangle", 0.16), 80);
    },
    crash() {
      blip(120, 0.35, "sawtooth", 0.2);
      setTimeout(() => blip(70, 0.4, "sawtooth", 0.18), 100);
    },
    land() {
      [523, 659, 784].forEach((f, i) => setTimeout(() => blip(f, 0.22, "triangle", 0.15), i * 110));
    },
  };
}
