// DealHunt entry program (Node 22, standard library only).
//
// The site is plain static files in app/ next to this file: three pages, one
// stylesheet, and data.js holding the 54 checked deals. Nothing is built and
// nothing is fetched at run time. This program hands the entry in: it copies
// app/ and screenshots/ into the output directory and writes
// output/dossier.json, the summary the scoring pass reads, using the vendored
// make.fun library in vendor/ (left exactly as the kit shipped it — the
// scorer requires dossier.json to be byte for byte what its own copy writes).
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Two guards keep a broken entry from ever being handed in: the program
// refuses to run when app/index.html is missing or screenshots/ holds no
// image, and it refuses to write an empty dossier. It never deletes
// anything — the output directory is created if needed and files are only
// added or overwritten.

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function countShots(dir) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((name) => /\.(jpe?g|png)$/i.test(name)).length;
}

const entryPage = join(repoRoot, 'app', 'index.html');
if (!existsSync(entryPage)) {
  throw new Error(`refusing to hand in an entry with no home page: ${entryPage} is missing`);
}

const shotCount = countShots(join(repoRoot, 'screenshots'));
if (shotCount === 0) {
  throw new Error('refusing to hand in an entry with no screenshots: screenshots/ holds no .jpg or .png file');
}

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 16 MiB of app files).
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
if (!dossier || dossier.length === 0) {
  throw new Error('refusing to hand in an entry with an empty dossier');
}
writeFileSync(join(outDir, 'dossier.json'), dossier);

const dossierBytes = statSync(join(outDir, 'dossier.json')).size;
console.log(`DealHunt handed in: ${shotCount} screenshots, dossier.json ${dossierBytes} bytes`);
