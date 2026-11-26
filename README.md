[![make.fun](https://make.fun/badge/best-flight-game-20261126-0057.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)
[![rank](https://make.fun/badge/best-flight-game-20261126-0057/gustzy2000-dev/terbang-nusantara/rank.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)
[![reward](https://make.fun/badge/best-flight-game-20261126-0057/gustzy2000-dev/terbang-nusantara/reward.svg)](https://make.fun/bounty/best-flight-game-20261126-0057)

# Terbang Nusantara

Game terbang 2D: terbangkan pesawat kecil melintasi pulau-pulau Indonesia, lewati cincin bernomor sesuai urutan, kumpulkan koin Rp, hemat bahan bakar, dan mendarat di landasan sebelum waktu habis. Ada tiga misi dengan angin dan cuaca yang makin menantang, tiga pengukur di layar (ketinggian, kecepatan, arah), serta suara mesin yang mengikuti kecepatan.

## Cara main

- **↑ / W** menanjak, **↓ / S** menukik
- **→ / D** tambah gas, **← / A** kurangi gas
- **Spasi** boost (boros bahan bakar)
- **P** jeda, **M** bisu
- **Seret mouse** di kanvas untuk kemudi

Mendarat hanya bisa di landasan, rendah dan pelan (di bawah 260), setelah semua cincin dilewati. Kalau mendarat sebelum semua cincin lolos, pesawat memantul kembali dengan peringatan. Tabrakan dengan burung atau tanah mengurangi satu nyawa (3 nyawa). Bahan bakar habis, waktu habis, atau terbang melewati landasan berarti misi berakhir.

## Misi

1. **Latihan Terbang** — 5 cincin, 8 koin, 90 detik, tanpa angin.
2. **Antar Paket** — 7 cincin, 10 koin, 110 detik, angin 34.
3. **Badai** — 8 cincin, 12 koin, 130 detik, angin 55, hujan dan petir.

## Struktur

- `game/index.html` — kerangka halaman: kanvas, HUD, pengukur, dan overlay.
- `game/src/config.js` — semua angka: fisika, misi, skor, palet warna.
- `game/src/random.js` — angka acak ber-seed (mulberry32) dan pembantu.
- `game/src/world.js` — membangun dunia misi: pulau, gunung berapi, cincin, koin, burung, landasan.
- `game/src/plane.js` — keadaan dan gerak pesawat, tabrakan, syarat mendarat.
- `game/src/render.js` — semua gambar: langit, laut, pulau, cincin, pesawat, pengukur.
- `game/src/audio.js` — dengung mesin dan bunyi WebAudio.
- `game/src/input.js` — keyboard dan seret mouse.
- `game/src/shots.js` — keadaan beku `?shot=start|play|rings|land` untuk tangkapan layar.
- `game/src/main.js` — loop utama, tabrakan, akhir misi, dan HUD.
- `main.ts` — program serah: menyalin `game/` dan `screenshots/` lalu menulis `dossier.json`.
- `vendor/makefun-game.ts` — pustaka dossier dari kit (tidak diubah).
