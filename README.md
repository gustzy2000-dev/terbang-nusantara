[![make.fun](https://make.fun/badge/best-flight-game-20261126-0057.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)
[![rank](https://make.fun/badge/best-flight-game-20261126-0057/gustzy2000-dev/terbang-nusantara/rank.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)
[![reward](https://make.fun/badge/best-flight-game-20261126-0057/gustzy2000-dev/terbang-nusantara/reward.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)

# Terbang Nusantara

Game terbang 2D yang berjalan dari file statis di desktop Chrome, tanpa jaringan.
Terbang melintasi laut, pulau, dan gunung berapi di kepulauan Indonesia: lewati ring
target, kumpulkan koin, hemat bahan bakar, dan mendarat mulus di landasan.

## Cara main

- **↑ / W** naik, **↓ / S** turun, **→ / D** tambah gas, **← / A** kurangi gas
- **Spasi** boost, **mouse** seret untuk membelok, **P** jeda, **M** suara
- Lewati semua ring untuk mengisi bahan bakar, lalu mendarat di landasan.
- Menabrak burung atau daratan mengurangi 1 nyawa (3 nyawa).

## Misi

1. **Latihan Terbang** — langit cerah, 5 ring, 90 detik.
2. **Antar Paket** — angin laut kencang, 7 ring, 110 detik.
3. **Badai** — hujan, petir, angin berubah-ubah, 8 ring, 130 detik.

HUD menampilkan altitude, speed, dan heading di alat ukur yang menyala,
plus bahan bakar, skor, dan waktu tersisa.

## Menjalankan

```sh
node serve.ts
# buka http://localhost:8080
```

## Struktur

- `game/index.html` — tata letak, HUD, dan layar (judul, briefing, selesai)
- `game/src/config.js` — angka penyeimbang dan definisi misi
- `game/src/random.js` — RNG ber-seed untuk keadaan deterministik
- `game/src/world.js` — peta misi: pulau, gunung berapi, ring, koin, burung, landasan
- `game/src/plane.js` — fisika pesawat
- `game/src/render.js` — semua gambar canvas dan alat ukur
- `game/src/audio.js` — suara WebAudio (tanpa file audio)
- `game/src/input.js` — keyboard dan mouse
- `game/src/shots.js` — keadaan beku untuk screenshot (`?shot=start|play|rings|land`)
- `game/src/main.js` — loop utama, misi, tabrakan, skor
- `main.ts` — program penyerahan: menyalin game/ dan screenshots/ lalu menulis dossier.json
- `screenshots/` — 4 tangkapan layar asli dari game ini

Entry untuk [make.fun — Make the best flight game](https://make.fun/bounty/best-flight-game-20261126-0057).
