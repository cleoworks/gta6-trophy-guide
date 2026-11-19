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
// The output has to be deterministic: the grader runs this program twice
// and requires the two results to be byte-identical, so the copy below is a
// plain file-for-file copy with no timestamps, ordering tricks or generated
// content of its own — the only file written fresh is dossier.json, and the
// vendored library builds it the same way every run. Before copying,
// checkAppPresent() fails loudly if the entry is incomplete or a screenshot
// is oversize, so a broken hand-in stops here instead of at the gate.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// v3 note: the entry's third version is a professional redesign of the app
// (design system, grade medallions, structured guide panel) with data and
// behaviour unchanged. This hand-in program did not need to change for it —
// it still copies the same app/ and screenshots/ and writes the same
// dossier — but the header grows so the file's own history stays honest.
//
// v4 note: the fourth version adds the decision-metadata block (difficulty,
// time, missables, playthroughs) to the app, rendered from a roadmapMeta
// object in the data file, and aligns the missable wording with the
// sources. The app grew; this program did not — same copy, same dossier.
//
// v5 note: the fifth version adds a rarity percentage per trophy and a
// Tips & Strategies block to the app's data file, and tightens the app's
// layout. Still nothing for this program to do differently: it copies
// app/ and screenshots/ exactly as they sit and lets the vendored library
// summarise them.
//
// Repair note: the session that first wrote v5 lost its recording when
// the machine restarted before sealing, so the v5 changes were re-written
// in a later recorded session, content unchanged. This program's behaviour
// is untouched either way: same copy, same dossier.
//
// v6 note: the sixth version turns the app's citations into a numbered
// source registry in the data file (each trophy now cites registry ids),
// groups the checklist by kind with live earned counts, adds a per-stage
// earned count to the roadmap and tightens the guide panel. The data
// file's shape changed; this program's job did not — it still copies
// app/ and screenshots/ exactly as they sit and lets the vendored library
// summarise them.

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
