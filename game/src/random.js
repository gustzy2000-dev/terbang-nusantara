// RNG ber-seed (mulberry32) supaya keadaan ?shot= selalu sama di setiap muat ulang.
// Satu file, satu tugas: angka acak yang bisa diulang.

export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickRange(rng, min, max) {
  return min + rng() * (max - min);
}

export function pickInt(rng, min, max) {
  return Math.floor(pickRange(rng, min, max + 1));
}

export function clamp(v, min, max) {
  return v < min ? min : v > max ? max : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
