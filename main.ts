// Terbang Nusantara — program serah: menyalin game dan tangkapan layar
// ke $MAKEFUN_OUTPUT_DIR, lalu menulis dossier.json untuk juri.

import { buildDossier } from "./vendor/makefun-game.ts";
import { cp, mkdir, stat, writeFile } from "node:fs/promises";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

await mkdir(outDir, { recursive: true });
await cp("game", `${outDir}/game`, { recursive: true });
await cp("screenshots", `${outDir}/screenshots`, { recursive: true });

// buildDossier mengembalikan dossier sebagai byte JSON kanonis
// (tidak menulis berkas sendiri) — jadi tulis sendiri ke dossier.json.
const dossierBytes = await buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
await writeFile(`${outDir}/dossier.json`, dossierBytes);

// Cetak ukuran dossier supaya kegagalan diam-diam langsung ketahuan.
const dossierSize = (await stat(`${outDir}/dossier.json`)).size;
console.log(`dossier.json: ${dossierSize} bytes -> ${outDir}/dossier.json`);
