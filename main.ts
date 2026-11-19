// Leonida Ledger — a gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide itself is plain static files: app/index.html opens in a browser,
// app/app.js renders the checklist from app/data/trophies.json, and nothing
// is fetched over the network, so the whole thing works offline. This program
// is only the hand-in: it copies app/ and screenshots/ from beside this file
// into /output (or MAKEFUN_OUTPUT_DIR outside the grader) and writes
// /output/dossier.json with the vendored make.fun library, which is the
// summary the judge reads. Leave vendor/makefun-frontend.ts untouched: the
// scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Keep the hand-in inside the scorer's own caps (reference/gate.json): at
// most 4 screenshots of at most 256 KiB, app/ at most 993 files and
// directories and 48 MiB, and the dossier text at most 160 KiB. The library
// refuses an entry past them, so a bad build fails here, loudly, instead of
// silently handing in something the gate would refuse.
const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

function fail(message) {
  throw new Error('main.ts: ' + message);
}

function checkAppPresent() {
  const appDir = join(repoRoot, 'app');
  const index = join(appDir, 'index.html');
  const data = join(appDir, 'data', 'trophies.json');
  if (!existsSync(index)) fail('app/index.html is missing');
  if (!existsSync(data)) fail('app/data/trophies.json is missing');
  const shots = join(repoRoot, 'screenshots');
  if (!existsSync(shots)) fail('screenshots/ is missing');
  const files = readdirSync(shots).filter((name) => !name.startsWith('.'));
  if (files.length < 3 || files.length > 4) fail('screenshots/ must hold 3 or 4 images, found ' + files.length);
  for (const name of files) {
    if (statSync(join(shots, name)).size > 262144) fail('screenshot ' + name + ' is over 256 KiB');
  }
}

checkAppPresent();

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });

writeFileSync(join(outputDir, 'dossier.json'), buildDossier(outputDir, dossierOptions));
