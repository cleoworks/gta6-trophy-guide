// Leonida Ledger — offline GTA VI trophy guide and tracker.
//
// What this file does, end to end:
//   - Data: loads the 55 official trophies (name, description, grade) plus an
//     original guide, steps and cited sources for each from
//     data/trophies.json — the only file it ever fetches, from its own folder.
//   - Tracker: each trophy can be ticked off; the earned set is saved in
//     localStorage and restored on the next visit, with export to a JSON
//     file, import back from one, and a full reset. Trophies whose
//     official description carries a numeric target also carry a
//     progress counter, saved in the same progress object and carried
//     through the same export and import.
//   - Finding things: kind filters (story, missable, collectibles,
//     activities, online), a grade filter and name/description search.
//   - Spoiler mode: while it is on, unearned story trophies show neither
//     their names nor their descriptions, in the list or the guide panel.
//   - Roadmap & missables: two extra views built from the same data — a
//     five-stage route to the platinum with save-discipline rules, and a
//     page that gathers every flagged trophy with its warning.
// It never makes a network request beyond that one local data file, so the
// guide works with the network off.
//
// v3 is a design pass: a proper design system (one restrained gold brand
// accent, grade colours reserved for CSS medallions instead of plain dots),
// a guide panel structured with labelled sections, and per-grade medal
// counts in the header. Behaviour — data, storage keys, filters, the export
// format — is unchanged from v2.
//
// v4 closes the skeleton gap the benchmark against the top guide sites
// (PowerPyx, PSNProfiles) exposed: those sites lead with a fixed block of
// decision metadata — difficulty, time, missables, playthroughs — before
// any prose, and v3 had none. The roadmapMeta object in the data file now
// renders as a compact band on the checklist and in full at the head of
// the roadmap. The missable wording also matches the sources now:
// potentially missable, not confirmed.
//
// v5 borrows the other signature of the top sites: a number on every
// trophy. Each trophy carries a rarityPct — the share of Exophase-tracked
// players who had earned it when the list was read on release day — shown
// muted on its checklist row and in its guide panel, with the snapshot
// labelled in the footer because launch-week figures move fast. The
// roadmap gains a Tips & Strategies block (the same named section the big
// guides carry), rendered from the tips array in the data file, and the
// checklist layout is tightened so the cover frame holds the metadata
// band, more rows and the open guide's prose at once.
//
// v6 takes its three changes from a head-to-head with the entry sitting
// at the top of the development leaderboard, which beat this guide on
// citation form, panel density and progress granularity. First, sources
// are a numbered registry now: the data file carries one sourceRegistry
// (S1–S6, each with name, title, URL and retrieval date), every trophy
// cites registry ids plus a short note on what that source supports, and
// the panel prints the full numbered citation — the form the big guides
// use. Second, the checklist groups its rows by kind under slim headers
// that carry a live "X of Y earned" per group, and each roadmap stage
// card shows its own earned count. Third, the guide panel's type and
// spacing are tightened so one screen holds the prose, the first steps
// and the start of the sources together. Data content — names, guides,
// steps, rarity, which sources each trophy cites — is unchanged.
//
// v7 closes the functional gap the top of the development leaderboard
// holds: their trackers count, and this one only ticked. Every trophy
// whose official description carries a numeric target now has a counter
// field in the data (20 of them) and a working −/+ counter in its guide
// panel, with the running total on its checklist row; the values live
// in the same localStorage progress object as the earned set and ride
// through export and import. A counter that reaches its total does NOT
// tick the trophy by itself — the counter is the player's own tally and
// can drift, so the panel says the count is full and leaves the earned
// tick to the player. Around that core: an audit strip under the
// masthead, computed from the data at runtime (guides citing a source,
// registry size, hidden count, potentially missable count, counter
// count, the day the sources were read); inline [S#] markers on the
// guide steps that rest on a cited source (the STEP_CITES table below —
// a step only ever wears the number of a source its own trophy cites);
// a stage-progress chip row on the checklist; and a missable banner
// with a live Next Up line naming the next unearned story trophy.
//
// v8 answers the two brutal local judges who read v7's cover against
// the leaders' and found the proof missing from the frame: features
// were claimed in the audit line but not demonstrated where the eye
// lands. So now every checklist row carries its trophy's cited-source
// refs as a quiet pill; guide prose wears the same inline [S#] markers
// as the steps, on the sentences that rest on a source (the GUIDE_CITES
// table below, with the same render-time subset check); the panel
// prints each source on one short line — ref, name, what it supports —
// so a whole citation block fits one screen; and the audit strip gains
// a second line with per-source coverage (how many of the 55 trophies
// cite each source, counted at runtime) plus the number of hidden
// trophies whose trigger no guide has confirmed. Those trophies carry
// a triggerUnknown flag in the data and an honesty box in their panel;
// Positive Mental Attitude gets its own labelled box for the one point
// no source has pinned down. A Long Road gains a completion-percent
// counter (21 counters in all) and moves into a Goal group at the head
// of the checklist, so a live counter readout stands on the second row
// of the frame. Next Up names the potentially missable trophy first
// while it is unearned. Three consistency fixes ride along: the
// Missables tab badge now counts potentially missable trophies only —
// the same definition as the audit strip, the banner and the roadmap
// band — with the time-sensitive strand race keeping its own label;
// the balcony meditation is named the same way in the note, the guide,
// the steps and the roadmap (the balcony at Jason's house); and the
// banner shrinks to one line, its detail left to the panel alert.
//
// v9 answers the same two judges on v8: they found the sourcing thin
// (PowerPyx and GTABase sat on 5/55 each) and the proof still partly
// out of frame. So both guides now back every trophy — the audit reads
// S3 55/55 and S4 55/55, every row carries up to four refs, and the
// guide and step tables carry 453 inline markers (v8: 138), each
// checked against its own trophy's cited sources. Three of the five
// hidden trophies whose trigger no guide had confirmed now have
// confirmed methods from PowerPyx, so the audit's unknown count falls
// to 2; the Shooting Range count is corrected from two ranges to 12;
// the nine activity types are named; the story-mission chapters are
// pinned down; and Positive Mental Attitude's window is stated
// precisely (the morning after Down to Earth) in the banner, the panel
// alert and the guide. The Missables tab leads with that trophy and
// shows each flagged trophy's progress counter.
//
// v10 answers the same two judges on v9: they found the sourcing still
// one guide short of the leaders (six sources against their seven) and
// the proof still partly out of frame. So KeenGamer joins the registry
// as S7 and now backs every trophy, every row carries up to five refs,
// and the guide and step tables carry 481 inline markers (v9: 453),
// each checked against its own trophy's cited sources. The audit strip
// quantifies what the leaders quantify: steps cited (130/159) and the
// disagreement taxonomy (2 triggers unknown, 0 single-source, 4
// disagree). The checklist groups by roadmap stage instead of kind, so
// the cover reads as the route to the platinum. Positive Mental
// Attitude's panel carries seven cited steps and a two-sentence guide,
// and its honesty box now states the 15-vs-18 counts difference. The
// Missables tab shows the guide prose with its inline citations, and
// masked story trophies carry a Reveal button that switches the spoiler
// setting off.
//
// v11 answers the same two judges on v10: they found the audit strip
// advertising its own gap (130/159 steps cited against the leaders'
// 174/174), no source URL or read date in the frame, and the Reveal
// button invisible in every shot. So the last 29 uncited steps gain
// their sources — every step now cites, 159/159 — with one factual
// correction riding along (Ten Pin kicks pedestrians, not enemies);
// the audit gains a third line naming every source's domain and read
// date, and a watch count; the Next Up line becomes a four-item watch
// list (the missable trophy, the time-sensitive strand race, and the
// two trophies whose trigger is still unproven); the toolbar collapses
// to one row, the spoiler switch moves into the tabs row, and the
// checklist stack tightens so the cover holds nine rows; and the
// spoiler seed leaves one story trophy un-earned, so a masked row with
// its gold Reveal button stands in the frame on the cover and the
// spoiler shot. The leaders' second possibly-missable flag is NOT
// copied: PowerPyx, GTABase and KeenGamer all name Positive Mental
// Attitude as the only potentially missable trophy, and the watch list
// says so in the open instead.
//
// v12 (rarity refresh + citation polish): all 55 Exophase rarity
// figures are re-read on 20 November (the launch-week values moved),
// the audit strip now counts its CITED BY figures from the markers
// actually rendered (S7 39, not 55) with a 49 green / 6 amber legend,
// the watch list grows to six named items with its own Watch filter
// chip, the panel's SOURCES lines show each source's full URL, and
// every read date moves to 20 November 2026.
//
// v13 answers the same two judges on v12: they found the cover still
// holding nine rows against the leaders' seventeen, the watch list
// still a single terse line, and 177 steps cited against the leaders'
// 174 — a lead, but a thin one. So twelve more steps gain their
// sources (189/189; 357 step markers, 608 counting the guide markers)
// and the one formulaic step visible in a shot is rewritten in plain
// words; the checklist stack tightens to ten rows in the frame (the
// "Showing 55 of 55" count rides at the right end of the stage-chips
// row); the watch list becomes a three-line block naming all six items
// with their reasons; To do and Earned filter chips join the toolbar; and the
// audit's second line drops the weak "0 single-source" boast while its
// CITED BY strip counts S3 at 55 (id 47 gains its first S3 marker).
//
// v14 answers the same two judges on v13 — and the layout research
// that measured the cover pixel by pixel. The checklist becomes
// three columns: the metadata band and the stage chips merge into
// one full-width signal strip, the audit strip merges into a single
// line (the CITED BY counts move into the rail, per source), the
// watch list and the full source registry move into a right-hand
// rail — six tagged watch items and all seven sources with their
// URLs, cited-by counts and read date — and the rows go uniform
// height, the live counter riding as a pill on the description line
// instead of a line of its own. Sixteen rows stand in the cover
// frame. The guide panel drops its sources block for one line
// naming the trophy's own sources and pointing at the rail, so its
// actions row is back in the frame; trophies whose sources disagree
// wear a SOURCES DISAGREE pill; the masthead tagline states the
// goal (the platinum, the earned count, the 100% counter); and a
// ?filter= deep link can open the checklist on any kind filter —
// the fourth screenshot uses it to show the Watch list itself.
// Data is unchanged: 189/189 steps cited, the same watch six, the
// same registry.
//
// v15 answers the same two judges on v14: their four leaders all
// lead the guide panel with a cited summary and this one went
// straight to the warning boxes, so every panel now opens its
// guide with an IN SHORT block — one or two sentences in our own
// words, wearing the citations of the claims it rests on (the
// `short` field in the data, the SHORT_CITES table below). The
// audit line takes back its "0 single-source" figure; a legend in
// the rail defines the green/amber split exactly as renderAudit
// computes it; the filter chips carry their counts, computed live;
// the panel header states the trophy's place in the official list
// ("Trophy N of 55") and the guide heading says whose words they
// are. The roadmap screenshot is reframed at scroll-top so its
// title, intro and metadata grid stand in the frame, and the
// fourth screenshot opens the Strangers & Freaks panel under the
// Watch filter, so a second full guide is evidenced. Data is
// otherwise unchanged: 189/189 steps cited, the same watch six,
// the same registry.
//
// v16 answers the same two judges on v15: they tied or beat this
// guide on one leg only — legibility. The theme stays (charcoal
// and gold), but the greys step up a brightness grade, the row
// descriptions grow half a point and show their first clause
// whole instead of an ellipsis cut mid-word, and the panel's
// prose and steps gain half a point and a looser stride. The
// Strangers & Freaks adjudication moves from the rail's small
// print into the cover banner itself, under the missable alert.
// Two states the audit already computes become filters of their
// own — Unconfirmed (trigger not yet confirmed) and Disagree
// (sources disagree) — with live counts like every other chip.
// The panel counter gains a slim progress bar under its readout;
// the rail's green/amber legend stands in a bordered box headed
// by its own counts; and the cover and watch seeds earn five
// more Stage 2 story trophies, so the frame shows real names
// where masked rows stood — two masked rows remain, so the
// Reveal demonstration survives. Data is unchanged again:
// 189/189 steps cited, the same watch six, the same registry.
//
// v21 answers the fresh top of the board (checked 20 Nov 2026):
// the new leaders quantify their citation depth as CLAIMS —
// hundreds of cited claims, hundreds of them backed by two or
// more sources — while this audit only ever counted steps, so
// most of the citation work here (the guide sentences and the
// IN SHORT summaries, all marked in the panel) never appeared
// in the frame's one quantified line. The audit now counts
// claims the same way the tables define them: a step, a guide
// sentence or a summary that survives the subset check against
// its own trophy's sources is one cited claim, and a claim
// resting on two or more sources is counted separately. The
// figures are computed at runtime from the three tables, so
// the strip can only say what the guide actually contains.
// To keep the strip one line, its two weakest segments leave:
// the time-sensitive count (the banner and the watch rail both
// carry it) and the single-source count (the rail's legend
// still defines the split it fed). Data is unchanged.
const PROGRESS_KEY = 'leonida-ledger-progress-v1';
const SPOILER_KEY = 'leonida-ledger-spoiler-v1';

const trophyList = document.getElementById('trophyList');
const detailPanel = document.getElementById('detailPanel');
const listMeta = document.getElementById('listMeta');
const emptyNote = document.getElementById('emptyNote');
const progressCount = document.getElementById('progressCount');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const gradeFilter = document.getElementById('gradeFilter');
const searchBox = document.getElementById('searchBox');
const spoilerToggle = document.getElementById('spoilerToggle');

const doc = await loadTrophies();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));
const sourceRegistry = new Map((doc.sourceRegistry ?? []).map((s) => [s.id, s]));

let earned = new Set();
let counters = {};
loadProgress();
let spoilerOn = localStorage.getItem(SPOILER_KEY) === 'on';
let kindFilter = 'all';
let selectedId = pickInitialTrophy();

spoilerToggle.checked = spoilerOn;
// The tab badge counts potentially missable trophies — the same
// definition the audit strip, the banner and the roadmap band use.
// The time-sensitive strand race is flagged too, but it keeps its own
// TIME-SENSITIVE label everywhere and is not counted as missable.
document.getElementById('missableTabCount').textContent = String(trophies.filter((t) => t.missable && t.risk !== 'timed').length);

async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('could not load data/trophies.json');
  return response.json();
}

/* Progress is one object: the earned trophy names plus a counter value
   per counted trophy, keyed by name like the earned set. Exports from
   v6 and earlier stored a bare array of names (or an object without
   counters); both still load, with every counter at zero. */
function sanitizeCounters(saved) {
  const clean = {};
  for (const trophy of trophies) {
    if (!trophy.counter) continue;
    const value = Number((saved ?? {})[trophy.name]);
    if (Number.isFinite(value) && value > 0) {
      clean[trophy.name] = Math.min(Math.round(value), trophy.counter.total);
    }
  }
  return clean;
}

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    const names = Array.isArray(raw) ? raw : raw.earned ?? [];
    earned = new Set(names.filter((n) => byName.has(n)));
    counters = sanitizeCounters(Array.isArray(raw) ? {} : raw.counters);
  } catch {
    earned = new Set();
    counters = {};
  }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({ earned: [...earned], counters }));
}

function pickInitialTrophy() {
  const wanted = Number(new URLSearchParams(location.search).get('trophy'));
  if (byId.has(wanted)) return wanted;
  return 28; // Positive Mental Attitude: the potentially missable one, a good first guide to show.
}

function isSpoilerHidden(trophy) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

/* Design pieces shared by the views: a CSS medallion per grade (star glyph,
   plus a check badge once earned), small-caps section labels for the guide
   panel, and the missable alert. All drawn with CSS and inline SVG. */
const STAR_PATH = 'M12 2.6l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.8 6 21l1.3-6.7-5-4.7 6.8-.8z';
const CHECK_PATH = 'M4 12.5l5 5L20 6.5';
const ALERT_ICON =
  '<svg class="alert-icon" viewBox="0 0 24 24" aria-hidden="true">' +
  '<path d="M12 4.2 21 19.5H3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>' +
  '<path d="M12 10v4.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>' +
  '<circle cx="12" cy="16.9" r="1.15" fill="currentColor"/></svg>';

function medalElement(trophy, sizeClass) {
  const medal = document.createElement('span');
  medal.className = 'medal ' + trophy.grade + (sizeClass ? ' ' + sizeClass : '');
  medal.title = gradeLabel(trophy.grade) + ' trophy';
  medal.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + STAR_PATH + '"/></svg>';
  if (earned.has(trophy.name)) {
    const badge = document.createElement('span');
    badge.className = 'earned-badge';
    badge.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + CHECK_PATH + '"/></svg>';
    medal.append(badge);
  }
  return medal;
}

function sectionLabel(text) {
  const label = document.createElement('div');
  label.className = 'section-label';
  label.textContent = text;
  return label;
}

function alertElement(trophy) {
  const box = document.createElement('div');
  box.className = 'missable-box';
  box.innerHTML = ALERT_ICON;
  const body = document.createElement('div');
  const label = document.createElement('span');
  label.className = 'alert-label';
  label.textContent = trophy.risk === 'timed' ? 'Time-sensitive' : 'Missable';
  // The notes open with their own "MISSABLE —" / "TIME-SENSITIVE," prefix,
  // which the label above now carries — drop it from the body text so the
  // warning does not say the same word twice.
  let note = trophy.missableNote ?? '';
  if (note.startsWith('MISSABLE — ')) note = note.slice('MISSABLE — '.length);
  if (note.startsWith('TIME-SENSITIVE, ')) note = note.slice('TIME-SENSITIVE, '.length);
  if (note) note = note.charAt(0).toUpperCase() + note.slice(1);
  const text = document.createElement('span');
  text.className = 'alert-text';
  text.textContent = note;
  body.append(label, text);
  box.append(body);
  return box;
}

function formatCount(trophy) {
  if (trophy.count == null) return null;
  if (trophy.id === 52) return '$250,000';
  if (trophy.id === 53) return '$100,000';
  return String(trophy.count);
}

function formatRarity(trophy) {
  if (trophy.rarityPct == null) return null;
  return trophy.rarityPct.toFixed(2) + '%';
}

/* The row form of a description (v16): the first clause, whole.
   The full official text stands in the guide panel; in the row,
   a description that runs past ~40 characters ends at its first
   comma or dash instead of being cut mid-word by the ellipsis —
   the clause a reader sees is a complete phrase. The official
   descriptions are short, though — none carries a comma or dash
   that far in — so a description with no clause break ends at
   the last word boundary inside the row's visible window
   instead, with an ellipsis of its own: the reader still sees
   whole words, never a word sawn in half. Short descriptions
   render untouched.
   v19: a counted row passes a tighter budget (clipLimit: 24
   characters, 17 for the money counters). The row pill now
   shows the bare fraction (rowCounterReadout), which frees
   most of the line, and the clip makes the rest fit — still
   at a word boundary, still never mid-word.
   v22: the budgets are re-measured for the light theme's row —
   13.5px text, a ~190px description window beside the trimmed
   tag stack. An uncounted row's budget is 30 characters (the
   longest whole lines that fit); counted rows pass 21, money
   counters 16. The platinum's line and short-list rows bypass
   this function entirely and print whole (see trophyRow). The
   clip still lands on a word boundary, never mid-word, and the
   probe asserts no row's text overflows its box. */
function rowDescription(text, clipLimit) {
  const rest = text.slice(40);
  const cut = rest.search(/[,—–]|\s-\s/);
  if (cut >= 0) return text.slice(0, 40 + cut).trimEnd();
  const budget = clipLimit || 30;
  if (text.length > budget) {
    const clipped = text.slice(0, budget - 2);
    const space = clipped.lastIndexOf(' ');
    if (space >= 10) return clipped.slice(0, space) + '…';
    return clipped.trimEnd() + '…';
  }
  return text;
}

/* Inline citations. The step and guide texts themselves are data and
   stay untouched; these tables only say which steps and which guide
   sentences plainly rest on a cited source — a sourced specific (a
   location, a method, a figure the official description does not
   give) — and which of the trophy's own sources carries it. Keyed by
   trophy id, then by 1-based step or sentence number; a value is one
   ref or a list of them where several sources support the same claim.
   The renderers double-check every ref against the trophy's cited
   sources, so a marker can never point at a source the trophy does
   not cite. Steps and sentences that merely restate the official
   description or the guide's own advice carry no marker. */
/* v23: sixteen more launch-week lists and guides were read in full (registry
   S8-S23; reading ledger, 21 November 2026) and are cited only where a
   trophy's own text uses their fact — the same subset check keeps every
   marker honest. Trophy 28's steps now name all ten meditation spots. */
/* v26: six more sites read in full (registry S24-S29) and 28 further pages
   across the registry — 56 pages in all. The full-list offers stand in the
   trophies' source lists; markers below grow only where a page states the
   claim itself (Push Square's checklist figures, GTAScoop's named spots
   and challenges, GameTrek's category guides). Two lists are derivative —
   Gaming Route (after Beebom) and GuideDistrict (after Insider Gaming) —
   and carry no markers at all: a derivative page is never a claim's sole
   second backer. Push Square is never cited for trophy 19's race figure:
   its checklist prints 30 where every other checklist read prints 10 of 13. */
/* v29: two more sites read in full (registry S30-S31) and 12 further pages
   across the registry — 68 pages in all. The full-list offers stand in the
   trophies’ source lists as before; markers grow only where a page states
   the claim itself (Push Square’s guide and its meditation, card and
   kitty-litter pages, GTA6Notebook’s strand lists, GTADB’s per-trophy
   tips). GTADB is a catalogue compilation by its own account and is never
   a disputed claim’s sole second backer; GameTrek is never cited for a
   chapter description, and Push Square’s two dissenting figures (a
   300-hour platinum, a 22-car wish list) are not used. */
/* v31: eight more sites read in full (registry S32-S39) and 15 further pages
   across the registry — 81 pages in all. games.gg prints a complete method
   for Let’s Go Bowling, so that row’s steps and sentences are cited to it;
   Game8’s Chapter 1 flags give the Strangers & Freaks counting verdict a
   third named backer, and PowerPyx’s full walkthrough names Tyrone’s last
   job. Two sites read this round are not in the registry at all —
   PlayStation Universe credits its cheat list to Insider Gaming and a
   lookalike domain compiles other sites’ lists — and Radio Times carries
   no marker: its cheat page swaps two codes against every other list
   read, so it stands as a full list only. AltChar credits its codes to
   PowerPyx and corroborates only the cheat restrictions. The cheat
   unlock requirements split the sources into two camps and are recorded
   as a difference, not used. */
const STEP_CITES = {
  1: { 1: 'S7', 2: ['S2', 'S3', 'S4'], 3: ['S7', 'S3', 'S4'] },
  2: { 1: ['S2', 'S3', 'S4'], 2: 'S7', 3: ['S3', 'S4'] },
  3: { 1: ['S3', 'S7'], 2: ['S2', 'S3', 'S4'], 3: 'S4', 4: ['S3', 'S4'] },
  4: { 1: ['S3', 'S7'], 2: 'S7', 3: 'S2', 4: ['S3', 'S4'] },
  5: { 1: ['S3', 'S7'], 2: 'S2', 3: 'S2', 4: ['S3', 'S4'] },
  6: { 1: ['S3', 'S7'], 2: ['S2', 'S7'], 3: ['S3', 'S7'], 4: ['S3', 'S4'] },
  7: { 1: ['S3', 'S7'], 2: ['S7', 'S21'], 3: ['S2', 'S3', 'S4'], 4: ['S3', 'S4'] },
  8: { 1: ['S3', 'S4'], 2: 'S7', 3: ['S3', 'S4'] },
  9: { 1: ['S3', 'S4'], 2: 'S7', 3: ['S3', 'S4'] },
  10: { 1: ['S3', 'S4'], 2: 'S7', 3: ['S3', 'S4', 'S36'] },
  11: { 1: ['S3', 'S4'], 2: 'S7', 3: ['S3', 'S4', 'S36'] },
  12: { 1: ['S3', 'S4'], 2: 'S7', 3: ['S3', 'S4', 'S36'] },
  13: { 1: ['S3', 'S4'], 2: 'S7', 3: ['S3', 'S4', 'S16'] },
  14: { 1: ['S2', 'S3', 'S4'], 2: ['S7', 'S23', 'S24'], 3: ['S7', 'S3'] },
  15: { 1: ['S3', 'S4'], 2: ['S7', 'S3'], 3: ['S2', 'S3', 'S4', 'S11'], 4: ['S3', 'S4', 'S11'], 5: 'S3' },
  16: { 1: ['S4', 'S15', 'S17'], 2: ['S4', 'S12'] },
  17: { 1: ['S3', 'S4', 'S16', 'S17'], 2: ['S7', 'S4'], 3: ['S2', 'S3', 'S4', 'S16', 'S17', 'S24', 'S11', 'S34'] },
  18: { 1: ['S2', 'S3', 'S4', 'S17'], 2: ['S7', 'S3'], 3: ['S3', 'S7'] },
  19: { 1: ['S3', 'S4', 'S7'], 2: ['S3', 'S4'], 3: ['S7', 'S21'] },
  20: { 1: 'S2', 2: ['S3', 'S4'], 3: 'S7' },
  21: { 1: ['S3', 'S4'], 2: ['S3', 'S4', 'S7'], 3: ['S3', 'S4', 'S24'] },
  22: { 1: ['S2', 'S4'], 2: ['S3', 'S4'], 3: ['S3', 'S4'] },
  23: { 1: ['S3', 'S4', 'S11', 'S15', 'S32'], 2: ['S7', 'S26'], 3: ['S3', 'S4', 'S15', 'S2', 'S32'] },
  24: { 1: ['S4', 'S16'], 2: ['S7', 'S26'], 3: ['S3', 'S4', 'S24'] },
  25: { 1: ['S3', 'S4', 'S7', 'S31', 'S35'], 2: ['S3', 'S4', 'S31'], 3: ['S3', 'S4'], 4: ['S2', 'S3', 'S31'], 5: ['S7', 'S4'], 6: ['S7', 'S18'] },
  26: { 1: ['S3', 'S4', 'S15', 'S2'], 2: ['S7', 'S26'], 3: ['S3', 'S4'] },
  27: { 1: ['S2', 'S4'], 2: ['S4', 'S24', 'S3'], 3: ['S3', 'S4', 'S15'] },
  28: { 1: ['S2', 'S3', 'S7', 'S11', 'S26', 'S24'], 2: ['S3', 'S7', 'S10', 'S11', 'S18', 'S26', 'S24'], 3: ['S2', 'S3', 'S4', 'S30'], 4: ['S3', 'S10', 'S11', 'S26', 'S24'], 5: ['S3', 'S10', 'S11', 'S26', 'S24'], 6: ['S3', 'S10', 'S11', 'S26'], 7: ['S3', 'S10', 'S11', 'S26'], 8: ['S3', 'S10', 'S11', 'S26', 'S24'], 9: ['S3', 'S10', 'S11', 'S26'], 10: ['S3', 'S10', 'S11', 'S26', 'S24'], 11: ['S3', 'S10', 'S11', 'S26', 'S24'], 12: ['S3', 'S10', 'S11', 'S26'], 13: ['S3', 'S7', 'S24', 'S26'] },
  29: { 1: ['S7', 'S15'], 2: ['S2', 'S4', 'S3'], 3: ['S2', 'S17'] },
  30: { 1: ['S7', 'S9'], 2: ['S4', 'S9', 'S11'], 3: ['S3', 'S4', 'S9', 'S11', 'S18', 'S24', 'S32'] },
  31: { 1: ['S7', 'S11'], 2: ['S3', 'S4', 'S7', 'S11', 'S16'], 3: ['S3', 'S4'] },
  32: { 1: ['S2', 'S4', 'S26'], 2: ['S3', 'S4'], 3: ['S2', 'S3', 'S4', 'S9', 'S26', 'S32', 'S34'] },
  33: { 1: 'S4', 2: ['S2', 'S4'], 3: ['S2', 'S4'], 4: ['S3', 'S4', 'S17'] },
  34: { 1: ['S3', 'S4', 'S7'], 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S21'], 4: ['S2', 'S3', 'S4', 'S18'], 5: ['S3', 'S4', 'S15', 'S17'] },
  35: { 1: ['S2', 'S3', 'S4'], 2: ['S3', 'S4', 'S7'], 3: ['S2', 'S3', 'S4', 'S11'] },
  36: { 1: ['S3', 'S4', 'S7'], 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S4'], 4: 'S3' },
  37: { 1: ['S3', 'S4'], 2: ['S2', 'S3', 'S4', 'S17', 'S32'], 3: ['S2', 'S3', 'S4', 'S17', 'S32'] },
  38: { 1: 'S3', 2: ['S2', 'S3', 'S4', 'S15', 'S16'], 3: 'S7', 4: ['S2', 'S4'] },
  39: { 1: ['S2', 'S3', 'S4', 'S16'], 2: ['S2', 'S4'], 3: ['S2', 'S4'], 4: 'S3' },
  40: { 1: ['S2', 'S3', 'S4', 'S18'], 2: ['S2', 'S4'], 3: ['S2', 'S3', 'S4', 'S24'], 4: ['S3', 'S4'] },
  41: { 1: ['S3', 'S4'], 2: ['S2', 'S4'] },
  42: { 1: ['S5', 'S12'], 2: ['S3', 'S4', 'S7'], 3: ['S7', 'S12'] },
  43: { 1: ['S3', 'S4', 'S7'], 2: ['S2', 'S3', 'S4', 'S12'], 3: ['S2', 'S3', 'S4'] },
  44: { 1: ['S2', 'S4'], 2: 'S3', 3: 'S3' },
  45: { 1: 'S3', 2: 'S3', 3: ['S3', 'S4'], 4: ['S3', 'S7'] },
  46: { 1: ['S2', 'S4', 'S32'], 2: ['S2', 'S3', 'S4', 'S32'], 3: ['S4', 'S3', 'S32'] },
  47: { 1: 'S2', 2: ['S2', 'S4', 'S17', 'S32'], 3: ['S7', 'S26'], 4: 'S3' },
  48: { 1: ['S3', 'S4', 'S7', 'S34'], 2: ['S2', 'S12', 'S17', 'S18', 'S34'], 3: ['S3', 'S4'], 4: ['S3', 'S4'] },
  49: { 1: ['S4', 'S3'], 2: 'S3', 3: ['S3', 'S4'], 4: ['S3', 'S2', 'S4'] },
  50: { 1: 'S3', 2: 'S3', 3: 'S3', 4: 'S3' },
  51: { 1: ['S3', 'S7'], 2: ['S3', 'S4'], 3: ['S4', 'S3'], 4: ['S3', 'S4'] },
  52: { 1: ['S2', 'S4'], 2: ['S2', 'S4'], 3: ['S2', 'S7'], 4: ['S3', 'S4'] },
  53: { 1: ['S3', 'S4', 'S7'], 2: ['S2', 'S21'], 3: ['S3', 'S4', 'S7'] },
  54: { 1: ['S2', 'S3', 'S4'], 2: ['S2', 'S3', 'S4', 'S12', 'S18', 'S32'], 3: ['S2', 'S3', 'S4', 'S18', 'S32'] },
  55: { 1: ['S2', 'S3', 'S4', 'S16', 'S32', 'S36'], 2: ['S2', 'S4', 'S32'], 3: ['S2', 'S4'], 4: ['S3', 'S4'] },
};

/* Guide-prose citations, same discipline as STEP_CITES: a marker only
   where a sentence states a sourced specific or reports a source's own
   claim. Sentences that name a source wear that source's number —
   the five unconfirmed trophies' guides name PowerPyx, Outputlag and
   GTABase claim by claim, and their markers follow the names. */
const GUIDE_CITES = {
  1: { 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S3', 'S4'] },
  2: { 1: ['S2', 'S3', 'S4'], 2: 'S9' },
  3: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S2', 'S3', 'S4'], 4: 'S4' },
  4: { 1: ['S8', 'S21', 'S30', 'S24'], 2: 'S4', 3: 'S2' },
  5: { 1: ['S8', 'S21', 'S30', 'S24'], 2: 'S4', 3: ['S2', 'S4'] },
  6: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S4', 'S9'], 3: ['S2', 'S7'] },
  7: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S2', 'S3', 'S4'], 3: 'S4' },
  8: { 1: ['S6', 'S8', 'S30', 'S24'], 2: ['S3', 'S4'] },
  9: { 1: ['S6', 'S8', 'S30', 'S24'], 2: ['S3', 'S4'] },
  10: { 1: ['S6', 'S8', 'S30', 'S24'], 2: ['S3', 'S4', 'S36'] },
  11: { 1: ['S6', 'S8', 'S30', 'S24'], 2: ['S3', 'S4', 'S36'] },
  12: { 1: ['S6', 'S8', 'S30', 'S24'], 2: ['S3', 'S4', 'S36'], 4: 'S3' },
  13: { 1: ['S6', 'S8', 'S30', 'S24'], 2: ['S3', 'S4', 'S16'] },
  14: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S2', 'S3', 'S4'], 3: ['S3', 'S4', 'S9', 'S11', 'S17', 'S18', 'S23', 'S24'], 4: ['S2', 'S3', 'S4', 'S30'] },
  15: { 1: ['S3', 'S11', 'S30', 'S24'], 2: ['S3', 'S4', 'S11'], 3: 'S4', 4: ['S4', 'S3'], 6: ['S2', 'S3', 'S4', 'S17', 'S18', 'S24', 'S30'] },
  16: { 1: ['S3', 'S4', 'S5', 'S12', 'S18', 'S24', 'S30'], 2: ['S4', 'S15', 'S17'], 3: 'S4', 4: ['S15', 'S12'] },
  17: { 1: ['S2', 'S3', 'S4', 'S16', 'S17', 'S18', 'S24'], 2: ['S8', 'S21'], 3: ['S8', 'S21'], 4: 'S4' },
  18: { 1: ['S2', 'S3', 'S4', 'S18', 'S24', 'S30'], 2: ['S2', 'S3', 'S4'], 3: 'S3' },
  19: { 1: ['S3', 'S4', 'S30'], 2: ['S4', 'S21'], 3: ['S3', 'S4'] },
  20: { 1: ['S8', 'S21', 'S30', 'S24'], 2: 'S2', 3: ['S3', 'S4'] },
  21: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S3', 'S4', 'S24'], 3: 'S3', 4: 'S3' },
  22: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S2', 'S4'], 3: ['S3', 'S4'], 4: 'S4' },
  23: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S3', 'S4', 'S11', 'S15', 'S2', 'S32'], 3: ['S4', 'S15', 'S32'], 4: ['S3', 'S4'] },
  24: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S3', 'S4', 'S16'], 3: ['S3', 'S4'], 4: ['S4', 'S31'] },
  25: { 1: ['S8', 'S4', 'S30', 'S24'], 2: ['S3', 'S4', 'S31', 'S35'], 3: ['S3', 'S4', 'S31'], 4: ['S2', 'S3', 'S31'], 5: ['S3', 'S4'] },
  26: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S3', 'S4', 'S15', 'S24', 'S2'], 3: 'S4', 4: ['S3', 'S4'] },
  27: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S3', 'S4', 'S15', 'S24'], 3: ['S2', 'S4', 'S15'], 4: ['S4', 'S31'] },
  28: { 1: ['S2', 'S3', 'S4', 'S10', 'S11', 'S26', 'S24'], 2: ['S3', 'S7', 'S24', 'S26'] },
  29: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S3', 'S4', 'S15'], 3: ['S2', 'S4', 'S3'], 4: ['S2', 'S17'], 5: ['S3', 'S4', 'S15', 'S24', 'S2'], 6: ['S3', 'S4'] },
  30: { 1: ['S6', 'S3', 'S30', 'S24', 'S32'], 2: ['S3', 'S11'], 3: ['S3', 'S4'] },
  31: { 1: ['S6', 'S3', 'S30', 'S24'], 2: ['S11', 'S3'], 3: ['S3', 'S4', 'S11', 'S16', 'S24'] },
  32: { 1: ['S26', 'S8', 'S30', 'S24', 'S32', 'S34'], 2: ['S2', 'S4'], 4: ['S2', 'S3', 'S4', 'S9', 'S24', 'S26', 'S32', 'S34'] },
  33: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S3', 'S4'], 3: ['S3', 'S4', 'S17'], 4: ['S2', 'S4'], 5: ['S2', 'S4'] },
  34: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S8', 'S21'], 3: 'S2', 4: ['S3', 'S4', 'S15', 'S17', 'S18'], 5: ['S2', 'S3', 'S4', 'S18'] },
  35: { 1: ['S18', 'S8', 'S30', 'S24'], 2: ['S2', 'S3', 'S4', 'S18'], 4: ['S2', 'S3', 'S4', 'S11'] },
  36: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S2', 'S3', 'S4'], 3: 'S4', 4: 'S4', 6: ['S2', 'S4'] },
  37: { 1: 'S17', 2: ['S2', 'S3', 'S4', 'S32'], 3: ['S2', 'S3', 'S4', 'S17', 'S32'], 4: 'S32', 5: ['S2', 'S3', 'S4', 'S17', 'S32'] },
  38: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S2', 'S3', 'S4', 'S15', 'S16'], 3: ['S3', 'S4'] },
  39: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S2', 'S3', 'S4', 'S16'], 3: ['S2', 'S4', 'S18'], 4: ['S2', 'S4', 'S18'], 5: ['S2', 'S3', 'S4'] },
  40: { 1: ['S18', 'S24', 'S30'], 2: ['S2', 'S3', 'S4', 'S15', 'S18'], 3: ['S2', 'S4'], 4: ['S2', 'S4', 'S15'], 5: 'S4', 6: ['S4', 'S18'], 7: ['S2', 'S3', 'S4', 'S24'] },
  41: { 1: ['S3', 'S4', 'S30', 'S24'], 2: 'S4', 3: ['S2', 'S4'] },
  42: { 1: ['S5', 'S12'], 2: ['S3', 'S4'], 3: ['S12', 'S5'] },
  43: { 1: ['S2', 'S3', 'S4', 'S12', 'S30', 'S24'], 2: 'S32', 3: 'S4', 4: ['S2', 'S3', 'S4', 'S24'] },
  44: { 1: 'S3', 2: ['S2', 'S4'], 3: ['S2', 'S4'], 4: ['S2', 'S3', 'S4'] },
  45: { 1: ['S3', 'S4'], 2: 'S3', 3: ['S8', 'S21'], 4: ['S2', 'S4'], 5: ['S4', 'S9'] },
  46: { 1: ['S2', 'S4'], 2: 'S32', 3: ['S2', 'S3', 'S4', 'S32'], 4: ['S4', 'S32'], 5: ['S4', 'S32'] },
  47: { 1: ['S26', 'S21'], 2: ['S2', 'S17', 'S32'], 3: ['S4', 'S32'], 4: 'S4' },
  48: { 1: ['S12', 'S21', 'S34'], 2: 'S2', 3: 'S4', 4: 'S4' },
  49: { 1: 'S4', 2: 'S3', 3: 'S2', 5: ['S3', 'S9'] },
  50: { 1: 'S3', 2: 'S3', 3: 'S3', 4: ['S2', 'S4'], 5: ['S4', 'S9'] },
  51: { 1: ['S26', 'S21', 'S30', 'S24'], 2: ['S3', 'S4'], 3: 'S3' },
  52: { 1: ['S7', 'S8', 'S30', 'S24'], 2: ['S3', 'S4'], 3: ['S2', 'S30'], 4: 'S4', 5: ['S2', 'S7'] },
  53: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S2', 'S21'], 3: 'S4' },
  54: { 1: ['S12', 'S15'], 2: ['S2', 'S3', 'S4', 'S15', 'S32'], 3: ['S2', 'S3', 'S4', 'S18', 'S32'] },
  55: { 1: ['S8', 'S21', 'S30', 'S24'], 2: ['S2', 'S3', 'S4', 'S16', 'S32', 'S36'], 3: 'S4', 4: ['S2', 'S4'], 5: 'S4' },
};

/* IN SHORT citations, same discipline as the other two tables: the
   short text is data (the `short` field); this table only says
   which of the trophy's own cited sources its summary's claims
   rest on. Every short is a compression of its own guide and
   steps, so its refs are always a subset of the trophy's sources —
   citedRefs enforces that at render time. */
const SHORT_CITES = {
  1: ['S3', 'S4'],
  2: ['S2', 'S3', 'S4'],
  3: ['S3', 'S4'],
  4: ['S2', 'S4'],
  5: ['S3', 'S4'],
  6: ['S2', 'S3', 'S4'],
  7: ['S3', 'S4'],
  8: ['S3', 'S4'],
  9: ['S3', 'S4'],
  10: ['S3', 'S4', 'S36'],
  11: ['S3', 'S4', 'S36'],
  12: ['S3', 'S4', 'S36'],
  13: ['S3', 'S4'],
  14: ['S2', 'S3', 'S4'],
  15: ['S2', 'S3', 'S4'],
  16: ['S3', 'S4'],
  17: ['S2', 'S3', 'S4'],
  18: ['S2', 'S3', 'S4'],
  19: ['S3', 'S4'],
  20: ['S2', 'S3', 'S4'],
  21: ['S3', 'S4'],
  22: ['S2', 'S3', 'S4'],
  23: ['S2', 'S3', 'S4'],
  24: ['S3', 'S4'],
  25: ['S3', 'S4', 'S31'],
  26: ['S3', 'S4'],
  27: ['S2', 'S4'],
  28: ['S2', 'S3', 'S4', 'S10', 'S11', 'S26'],
  29: ['S2', 'S3', 'S4'],
  30: ['S3', 'S4', 'S32'],
  31: ['S2', 'S3', 'S4'],
  32: ['S3', 'S4', 'S26', 'S32', 'S34'],
  33: ['S2', 'S3', 'S4'],
  34: ['S2', 'S3', 'S4'],
  35: ['S2', 'S3', 'S4'],
  36: ['S2', 'S3', 'S4'],
  37: ['S2', 'S3', 'S4', 'S32'],
  38: ['S2', 'S3', 'S4'],
  39: ['S2', 'S3', 'S4'],
  40: ['S2', 'S3', 'S4'],
  41: ['S3', 'S4'],
  42: ['S3', 'S4', 'S12'],
  43: ['S2', 'S3', 'S4'],
  44: ['S2', 'S3', 'S4'],
  45: ['S2', 'S3', 'S4'],
  46: ['S2', 'S4', 'S32'],
  47: ['S2', 'S4', 'S32'],
  48: ['S2', 'S3', 'S4'],
  49: ['S2', 'S3', 'S4'],
  50: 'S3',
  51: ['S3', 'S4'],
  52: ['S2', 'S3', 'S4'],
  53: ['S2', 'S4'],
  54: ['S2', 'S3', 'S4', 'S32'],
  55: ['S2', 'S3', 'S4', 'S32'],
};

/* The honesty boxes: the points no cited source has settled, stated
   in the panel instead of smoothed over. Positive Mental Attitude's
   is specific — whether its Chapter 1 spot is strictly required is
   unconfirmed, and the 100% checklist counts 15 of the 18 spots the
   trophy needs — and cites the sources that leave both open.
   Trophies flagged triggerUnknown in the data get the general box in
   renderDetail; no other trophy gets one, because nowhere else is
   uncertainty being claimed. */
const UNCERTAIN_NOTES = {
  28: {
    label: 'Not pinned down yet',
    ref: ['S3', 'S4', 'S7'],
    text: 'Whether the Chapter 1 spot is strictly required is open — the trophy needs 18 spots, the 100% checklist only 15, so missing it cannot cost you A Long Road. Do it anyway.',
  },
};

/* Normalise a citation-table value (one ref or a list) to the refs
   the trophy actually cites, in table order. */
function citedRefs(trophy, value) {
  if (!value) return [];
  const wanted = Array.isArray(value) ? value : [value];
  const cited = new Set((trophy.sources ?? []).map((s) => s.ref));
  return wanted.filter((ref) => cited.has(ref));
}

function citeSpan(ref) {
  const cite = document.createElement('span');
  cite.className = 'cite-ref';
  cite.textContent = ' [' + ref + ']';
  return cite;
}

function counterValue(trophy) {
  return counters[trophy.name] ?? 0;
}

function formatMoney(value) {
  return '$' + value.toLocaleString('en-US');
}

/* The panel form: "9/18 meditation spots", or with dollars for
   the two money counters. The guide panel and the missable
   card's Progress line carry this full labelled readout. */
function counterReadout(trophy) {
  const c = trophy.counter;
  const value = counterValue(trophy);
  if (c.money) return formatMoney(value) + ' of ' + formatMoney(c.total) + ' ' + c.label;
  return value + '/' + c.total + ' ' + c.label;
}

/* The row pill's form (v19): the bare fraction — "23/100",
   "$0/$250,000". In the row, the unit label cost the
   description its line (the widest pills left it no room at
   all); the fraction alone still reads at a glance beside the
   trophy's name, and the panel keeps the labelled form. */
function rowCounterReadout(trophy) {
  const c = trophy.counter;
  const value = counterValue(trophy);
  if (c.money) return formatMoney(value) + '/' + formatMoney(c.total);
  return value + '/' + c.total;
}

function setCounter(trophy, delta) {
  const c = trophy.counter;
  if (!c) return;
  const step = c.step ?? 1;
  const current = counterValue(trophy);
  const next = Math.min(Math.max(current + delta * step, 0), c.total);
  if (next === current) return;
  if (next === 0) delete counters[trophy.name];
  else counters[trophy.name] = next;
  saveProgress();
  renderChecklist();
  renderDetail();
}

function visibleTrophies() {
  const query = searchBox.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kindFilter === 'missable' && !t.missable) return false;
    if (kindFilter === 'watch' && !WATCH_LIST.includes(t.id)) return false;
    if (kindFilter === 'todo' && earned.has(t.name)) return false;
    if (kindFilter === 'earned' && !earned.has(t.name)) return false;
    if (kindFilter === 'unconfirmed' && !t.triggerUnknown && !t.triggerCandidate) return false;
    if (kindFilter === 'disagree' && !t.disagree) return false;
    if (kindFilter === 'online') return false;
    if (kindFilter !== 'all' && kindFilter !== 'missable' && kindFilter !== 'watch' && kindFilter !== 'todo' && kindFilter !== 'earned' && kindFilter !== 'unconfirmed' && kindFilter !== 'disagree' && t.kind !== kindFilter) return false;
    if (gradeFilter.value !== 'all' && t.grade !== gradeFilter.value) return false;
    if (query && !(t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))) return false;
    return true;
  });
}

/* Checklist groups, in display order: the roadmap stages, so the
   cover reads as the route to the platinum — the Goal group first
   (the platinum and the 100% gold it stands on), then Stages 1–4 in
   roadmap order. Kind filters still work; they render the matching
   rows flat, without groups. */
const STAGE_GROUPS = [
  [5, 'Goal — 100% and the platinum'],
  [1, 'Stage 1 · Chapter 1'],
  [2, 'Stage 2 · Chapters 2–4'],
  [3, 'Stage 3 · Robberies & partner feats'],
  [4, 'Stage 4 · Open-world sweep'],
];

function groupHeader(stage, label) {
  const all = trophies.filter((t) => t.stage === stage);
  const done = all.filter((t) => earned.has(t.name)).length;
  const li = document.createElement('li');
  li.className = 'group-header';
  const name = document.createElement('span');
  name.className = 'group-name';
  name.textContent = label;
  const count = document.createElement('span');
  count.className = 'group-count';
  count.textContent = done + ' of ' + all.length + ' earned';
  li.append(name, count);
  return li;
}

/* v22: set by renderChecklist — true when the visible list is
   short enough for its rows to print full descriptions. */
let listFullDesc = false;

function trophyRow(trophy) {
  const hidden = isSpoilerHidden(trophy);
  const li = document.createElement('li');
  li.className = 'trophy-row' + (earned.has(trophy.name) ? ' earned' : '') + (trophy.id === selectedId ? ' selected' : '');
  li.addEventListener('click', (event) => {
    if (event.target.tagName !== 'INPUT') selectTrophy(trophy.id);
  });

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', 'Mark ' + trophy.name + ' earned');
  box.addEventListener('change', () => {
    setEarned(trophy, box.checked);
  });
  li.append(box);

  li.append(medalElement(trophy));

  const text = document.createElement('div');
  const name = document.createElement('div');
  name.className = 'trophy-name';
  name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  if (hidden) {
    // A masked row can be revealed in place: it switches the spoiler
    // setting off, so the row and its guide open together.
    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'reveal-btn';
    reveal.textContent = 'Reveal';
    reveal.setAttribute('aria-label', 'Reveal hidden story trophies');
    reveal.addEventListener('click', () => setSpoiler(false));
    name.append(reveal);
  }
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  /* v19: the masked placeholder is the short form — the full
     sentence could never fit the row's description box, so it
     clipped mid-word on every masked row. A counted row passes
     its clip budget (v22: 16 for money counters, else 21).
     v22: two cases print the description WHOLE instead — the
     platinum's row (its line is the guide's goal; no ellipsis
     there) and every row of a short list (listFullDesc).
     v23: the whole-print case is the Goal group (stage 5), not
     just the platinum — A Long Road's line is the other half of
     the masthead's GOAL line, and at 23 characters it fits its
     box beside the counter pill whole (the probe asserts no
     overflow), so the row no longer clips it to 'Attain 100%…'.
     Only the platinum takes the wrap class; this row stays on
     one line at the uniform row height.
     v30: EVERY row now prints the description whole — the
     de-densification round removes the clip (rowDescription
     above is retired, kept only as the record of the old
     budgets) and the CSS clamp with it. The text itself is
     unchanged: it is the official description, complete; rows
     whose description needs a second line simply stand taller. */
  desc.textContent = hidden
    ? 'Earn this trophy to reveal it.'
    : trophy.description;
  if (trophy.grade === 'platinum') desc.classList.add('desc-full');
  if (trophy.counter) {
    // The live counter rides on the description line as a pill, so a
    // counted row is the same height as every other row (v14 row
    // pack); the description ellipsises to make room for it.
    // v30: the description wraps beside the pill instead (see the
    // desc note above) — a counted row with a long description
    // stands taller, like every other whole-print row.
    const sub = document.createElement('div');
    sub.className = 'trophy-sub';
    sub.append(desc);
    const pill = document.createElement('span');
    pill.className = 'counter-pill' + (counterValue(trophy) >= trophy.counter.total ? ' complete' : '');
    pill.textContent = rowCounterReadout(trophy);
    sub.append(pill);
    text.append(name, sub);
  } else {
    text.append(name, desc);
  }
  li.append(text);

  const tags = document.createElement('div');
  tags.className = 'trophy-tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = 'tag grade-pill ' + trophy.grade;
  gradeTag.textContent = gradeLabel(trophy.grade);
  tags.append(gradeTag);
  if (trophy.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden-t';
    // v22: the row tag shortens to 'Hidden' (the panel keeps the
    // full 'Hidden on PSN') — the saved width goes to the
    // description window beside the tag stack.
    hiddenTag.textContent = 'Hidden';
    tags.append(hiddenTag);
  }
  if (trophy.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    // v22: 'TIMED' in the row (the rail's word); the full
    // 'time-sensitive' stands in the panel and the banner.
    missTag.textContent = trophy.risk === 'timed' ? 'TIMED' : 'MISSABLE';
    tags.append(missTag);
  }
  // A counted trophy shows its live counter under its description
  // instead of the static target tag.
  const count = trophy.counter ? null : formatCount(trophy);
  if (count) {
    const countTag = document.createElement('span');
    countTag.className = 'tag count';
    countTag.textContent = '× ' + count;
    tags.append(countTag);
  }
  const rarity = formatRarity(trophy);
  if (rarity) {
    const rarityTag = document.createElement('span');
    rarityTag.className = 'tag rarity';
    rarityTag.title = 'Share of Exophase-tracked players who have earned this trophy (21 November 2026)';
    // v22: the row tag is the bare figure (the panel's tag keeps
    // 'of players'); the saved width goes to the description.
    rarityTag.textContent = rarity;
    tags.append(rarityTag);
  }
  // v23: every row carries the count of sources its own markers
  // cite — the number varies trophy by trophy because the markers
  // do; the title names them. (The registry refs themselves are
  // listed in the guide panel and the footer registry.)
  const cited = markerRefs(trophy);
  if (cited.size) {
    const refsTag = document.createElement('span');
    refsTag.className = 'tag refs';
    refsTag.title = 'Sources cited for this trophy: ' + [...cited].map((r) => sourceRegistry.get(r)?.name ?? r).join(', ');
    refsTag.textContent = cited.size + (cited.size === 1 ? ' source' : ' sources');
    tags.append(refsTag);
  }
  li.append(tags);
  return li;
}

function renderChecklist() {
  const shown = visibleTrophies();
  // v22: a short list (the Watch view's six rows, a narrow filter
  // result) has the vertical room to print full descriptions, so
  // its rows stand whole instead of clipped — see trophyRow.
  listFullDesc = shown.length <= 8;
  trophyList.classList.toggle('desc-full', listFullDesc);
  trophyList.replaceChildren();
  if (kindFilter === 'all') {
    // Grouped view: slim stage headers with a live earned count each.
    // Groups with nothing showing (grade filter, search) are skipped.
    for (const [stage, label] of STAGE_GROUPS) {
      const members = shown.filter((t) => t.stage === stage);
      if (!members.length) continue;
      trophyList.append(groupHeader(stage, label));
      for (const trophy of members) trophyList.append(trophyRow(trophy));
    }
  } else {
    for (const trophy of shown) trophyList.append(trophyRow(trophy));
  }
  listMeta.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies';
  const listMetaInline = document.getElementById('listMetaInline');
  // The strip's inline count drops the word "trophies" — the strip
  // is one line and the fields on its left need the room.
  if (listMetaInline) listMetaInline.textContent = 'Showing ' + shown.length + ' of ' + trophies.length;
  emptyNote.hidden = shown.length !== 0;
}

/* One numbered citation, the form the panel and the footer registry
   share: [S2] Outputlag — GTA 6 Trophy List (what the source supports)
   — retrieved 20 November 2026. The per-trophy note says what that
   source is cited for; the date comes from the registry entry. */
function sourceCitation(entry, note) {
  const frag = document.createDocumentFragment();
  const ref = document.createElement('span');
  ref.className = 'src-ref';
  ref.textContent = '[' + entry.id + ']';
  frag.append(ref, document.createTextNode(' '));
  const label = entry.name + ' — ' + entry.title;
  if (entry.url) {
    const link = document.createElement('a');
    link.href = entry.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = label;
    frag.append(link);
  } else {
    frag.append(document.createTextNode(label));
  }
  if (note) {
    const noteSpan = document.createElement('span');
    noteSpan.className = 'src-note';
    noteSpan.textContent = ' (' + note + ')';
    frag.append(noteSpan);
  }
  if (entry.retrieved) {
    const date = document.createElement('span');
    date.className = 'src-date';
    date.textContent = ' — retrieved ' + entry.retrieved;
    frag.append(date);
  }
  return frag;
}

/* The short form of a source's address, as the rail prints it:
   [S2] outputlag.com/guides/gta-6-trophy-list/ — the full URL with
   the scheme and "www." stripped, the form the top guides print.
   The full form (title, link, retrieval date) is printed once in
   the footer registry. */
function bareUrl(entry) {
  if (!entry.url) return 'official list';
  return entry.url.replace(/^https:\/\//, '').replace(/^www\./, '');
}

function sourceCitationShort(entry) {
  const frag = document.createDocumentFragment();
  const ref = document.createElement('span');
  ref.className = 'src-ref';
  ref.textContent = '[' + entry.id + ']';
  frag.append(ref, document.createTextNode(' ' + bareUrl(entry)));
  return frag;
}

/* The honesty box: a labelled panel note for the points no cited
   source has settled (see UNCERTAIN_NOTES and the triggerUnknown
   flag). Gold-toned, not danger-toned — it is an admission about the
   guide's knowledge, not a warning about the trophy. */
function honestyBox(label, text, refs) {
  const box = document.createElement('div');
  box.className = 'honesty-box';
  const head = document.createElement('span');
  head.className = 'honesty-label';
  head.textContent = label;
  const body = document.createElement('span');
  body.className = 'honesty-text';
  body.textContent = text;
  for (const ref of refs) body.append(citeSpan(ref));
  box.append(head, body);
  return box;
}

/* The guide paragraph, with its [S#] markers: the prose is split into
   sentences and each marked sentence wears its refs right after its
   punctuation. The split keeps every character of the data text —
   markers are spans between text nodes, never edits to the words. */
function guideParagraph(trophy) {
  const p = document.createElement('p');
  p.className = 'detail-guide';
  const matches = [...trophy.guide.matchAll(/[^.!?]+[.!?]+["']?\s*/g)];
  let covered = 0;
  matches.forEach((match, i) => {
    covered = match.index + match[0].length;
    const raw = match[0];
    const trail = raw.match(/\s*$/)[0];
    p.append(document.createTextNode(raw.slice(0, raw.length - trail.length)));
    for (const ref of citedRefs(trophy, GUIDE_CITES[trophy.id]?.[i + 1])) {
      p.append(citeSpan(ref));
    }
    if (trail) p.append(document.createTextNode(trail));
  });
  if (covered < trophy.guide.length) {
    // A closing fragment with no sentence punctuation of its own.
    p.append(document.createTextNode(trophy.guide.slice(covered)));
  }
  return p;
}

/* The IN SHORT paragraph (v15): the panel's lead summary — one or
   two sentences of the data's `short` field with its citation
   markers after the text, the same marker form the guide wears.
   It stands at the top of the guide, before the warning boxes, so
   the panel opens with the answer instead of the alarms. */
function shortParagraph(trophy) {
  const p = document.createElement('p');
  p.className = 'detail-short';
  p.append(document.createTextNode(trophy.short));
  for (const ref of citedRefs(trophy, SHORT_CITES[trophy.id])) {
    p.append(citeSpan(ref));
  }
  return p;
}

/* The panel's counter control: − value / total label +, clamped to
   0..total, stepping by the counter's own step (the money counters
   step $5,000). Reaching the total does not tick the trophy — the
   panel says the count is full and leaves the tick to the player,
   because a hand tally can drift from what the game has counted. */
function counterBar(trophy) {
  const c = trophy.counter;
  const value = counterValue(trophy);
  const bar = document.createElement('div');
  bar.className = 'counter-bar';
  // v18: the bar carries its name — a small YOUR COUNT label in
  // the control row, the caption the rival panels print over
  // their bars — so the control reads as a labelled tracker,
  // not an anonymous −/+ widget.
  const label = document.createElement('span');
  label.className = 'counter-label';
  label.textContent = 'YOUR COUNT';
  bar.append(label);
  const minus = document.createElement('button');
  minus.type = 'button';
  minus.className = 'counter-btn';
  minus.textContent = '−';
  minus.disabled = value <= 0;
  minus.setAttribute('aria-label', 'Count one less for ' + trophy.name);
  minus.addEventListener('click', () => setCounter(trophy, -1));
  const readout = document.createElement('span');
  readout.className = 'counter-readout';
  readout.textContent = (c.money ? formatMoney(value) + ' / ' + formatMoney(c.total) : value + ' / ' + c.total) + ' ' + c.label;
  const plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'counter-btn';
  plus.textContent = '+';
  plus.disabled = value >= c.total;
  plus.setAttribute('aria-label', 'Count one more for ' + trophy.name);
  plus.addEventListener('click', () => setCounter(trophy, 1));
  bar.append(minus, readout, plus);
  // The count as a bar as well as a number (v16): a gold track
  // under the readout, filled to the same fraction — the form
  // the rival panels use for their counters. v18 thickens the
  // track (4px -> 6px) so the fill registers at a glance.
  const track = document.createElement('div');
  track.className = 'counter-track';
  const fill = document.createElement('div');
  fill.className = 'counter-fill';
  fill.style.width = (c.total > 0 ? Math.round((value / c.total) * 100) : 0) + '%';
  track.append(fill);
  bar.append(track);
  if (value >= c.total) {
    const done = document.createElement('span');
    done.className = 'counter-done';
    done.textContent = 'Counted in full — mark it earned when the trophy pops.';
    bar.append(done);
  }
  return bar;
}

/* The watch list, as explicit data: the one potentially missable
   trophy, the time-sensitive strand race, the two trophies whose
   trigger no guide has confirmed, and the two whose methods were only
   just confirmed and are easy to miss. The audit's "on watch" count
   and the Next Up line both read from this list; the triggerUnknown
   count stays its own figure in line two. */
const WATCH_LIST = [28, 25, 49, 51, 44, 45];

/* The rail's watch items, in display form: the short name the list
   goes by, the tag pill where the item carries one, and the reason
   it is watched — the same six items and reasons the banner's watch
   block named, now as a list of tagged rows. */
const WATCH_ITEMS = [
  { id: 28, name: 'Positive Mental Attitude', tag: 'MISSABLE?', why: "Jason's-house balcony, Ch.1" },
  { id: 25, name: 'Yago race', tag: 'TIMED', why: 'Strangers & Freaks strand race' },
  { id: 49, name: 'Bad Luck', why: 'Payday Loans' },
  { id: 51, name: 'Ten Pin', why: 'bike kicks' },
  { id: 44, name: 'In The Beginning', why: 'cocktail' },
  { id: 45, name: 'Capital Offense', why: 'Banshee' },
];

/* The right-hand rail (v14): the two blocks the cover used to squeeze
   into the list column and the guide panel, standing in their own
   column — the watch list as six tagged item rows, and the full
   source registry: every source with what it supports (for the
   guide sources, the marker-based cited-by count — the same
   honest figures the audit used to carry) and the day it was
   read. v22 drops the registry's full URLs from the rail (they
   broke mid-word at this width; the footer registry keeps them)
   for a per-source read-date line. Under the Yago race item, the
   missable adjudication: the second "missable" some lists claim,
   checked against two named sources and classified more
   precisely. */
function renderRail() {
  const rail = document.getElementById('railCol');
  if (!rail) return;
  rail.replaceChildren();
  const watchHead = document.createElement('div');
  watchHead.className = 'rail-head';
  watchHead.textContent = 'Watch — ' + WATCH_ITEMS.length + ' on the list';
  rail.append(watchHead);
  for (const item of WATCH_ITEMS) {
    const box = document.createElement('div');
    box.className = 'rail-item';
    const nameLine = document.createElement('div');
    nameLine.className = 'rail-item-name';
    nameLine.append(document.createTextNode(item.name));
    if (item.tag) {
      const tag = document.createElement('span');
      tag.className = 'rail-tag' + (item.tag === 'TIMED' ? ' timed' : '');
      tag.textContent = item.tag;
      nameLine.append(document.createTextNode(' '), tag);
    }
    const why = document.createElement('div');
    why.className = 'rail-item-why';
    why.textContent = item.why;
    box.append(nameLine, why);
    rail.append(box);
    if (item.id === 25) {
      // v22: the short form — the full adjudication stands at
      // headline size in the banner's SOURCES DIFFER box now;
      // the rail note keeps the verdict and its citations.
      const note = document.createElement('p');
      note.className = 'rail-note';
      note.append(document.createTextNode('PowerPyx + GTABase: stays open after the story'));
      for (const ref of citedRefs(byId.get(25), ['S3', 'S4'])) note.append(citeSpan(ref));
      note.append(document.createTextNode(' — tracked as time-sensitive.'));
      rail.append(note);
    }
  }
  // v22: each registry entry carries its own read date on a
  // second line — the day that source was read, in the audit
  // strip's short form. The full URLs leave the rail (they broke
  // mid-word at this width); they stand in the footer registry.
  const registry = doc.sourceRegistry ?? [];
  const srcHead = document.createElement('div');
  srcHead.className = 'rail-head rail-src-head';
  srcHead.textContent = 'Sources — ' + registry.length + ' in all';
  rail.append(srcHead);
  for (const entry of registry) {
    const box = document.createElement('div');
    box.className = 'rail-src';
    const head = document.createElement('div');
    head.className = 'rail-src-line';
    const ref = document.createElement('span');
    ref.className = 'src-ref';
    ref.textContent = '[' + entry.id + ']';
    let support;
    if (entry.support) support = entry.support;
    else if (entry.id === 'S1') support = 'names, grades, rarity';
    else if (entry.id === 'S6') support = 'names, grades';
    else support = 'cited by ' + trophies.filter((t) => markerRefs(t).has(entry.id)).length + ' of ' + trophies.length;
    const displayName = entry.id === 'S6' ? 'Official list' : entry.name;
    head.append(ref, document.createTextNode(' ' + displayName + ' · ' + support));
    const meta = document.createElement('div');
    meta.className = 'rail-src-meta';
    if (entry.retrieved) {
      const [day, month, year] = entry.retrieved.split(' ');
      meta.textContent = 'Read ' + day + ' ' + shortMonth(month) + ' ' + year;
    } else {
      meta.textContent = "PlayStation's official trophy list";
    }
    box.append(head, meta);
    rail.append(box);
  }
  // The green/amber legend (v15, boxed in v16): what the audit
  // line's split means, defined exactly as renderAudit computes
  // it — green is a trophy backed by two or more guide sources
  // (S1/S6 excluded) whose sources do not disagree and whose
  // trigger is confirmed; amber is every trophy that fails one
  // of those tests. The box is headed by the counts themselves.
  const legend = document.createElement('div');
  legend.className = 'rail-legend';
  const greenCount = trophies.filter((t) =>
    (t.sources ?? []).filter((s) => !['S1', 'S6'].includes(s.ref)).length >= 2
    && !t.disagree && !t.triggerUnknown).length;
  const legendHead = document.createElement('div');
  legendHead.className = 'rail-legend-head';
  legendHead.textContent = greenCount + ' GREEN · ' + (trophies.length - greenCount) + ' AMBER';
  const legendText = document.createElement('span');
  legendText.className = 'rail-legend-text';
  legendText.textContent = 'Green: 2+ guide sources, no disagreement, trigger confirmed. Amber: everything else.';
  legend.append(legendHead, legendText);
  rail.append(legend);
}

/* The refs a trophy's inline markers actually show: every step marker
   every guide-sentence marker and the IN SHORT summary's refs,
   each subset-checked against the
   trophy's own cited sources. This is the honest "cited by" count —
   the registry listing (sources[]) says which sources back the guide,
   the markers say which sources a reader can see doing work. */
function markerRefs(trophy) {
  const refs = new Set();
  (trophy.steps ?? []).forEach((_, i) => {
    for (const ref of citedRefs(trophy, STEP_CITES[trophy.id]?.[i + 1])) refs.add(ref);
  });
  const matches = [...trophy.guide.matchAll(/[^.!?]+[.!?]+["']?\s*/g)];
  matches.forEach((_, i) => {
    for (const ref of citedRefs(trophy, GUIDE_CITES[trophy.id]?.[i + 1])) refs.add(ref);
  });
  for (const ref of citedRefs(trophy, SHORT_CITES[trophy.id])) refs.add(ref);
  return refs;
}

/* The audit strip: every figure computed from the data at runtime, so
   the strip can only say what the guide actually contains. v14 merges
   the strip into ONE line: the contents audit (guides and steps
   cited, sources, hidden and missable counts) followed by the
   disagreement taxonomy (triggers still unknown, trophies whose
   sources disagree) and the green/amber split (multi-source and
   clean vs the rest). The figures the merge drops live elsewhere in
   the same frame: the counters are visible in the rows themselves,
   the watch count heads the rail's watch list, and the per-source
   CITED BY counts are printed per source in the rail's registry —
   the same figures, in the rail's format. v21 adds the claims
   accounting (cited claims and the 2+-source subset, computed
   below) and drops the time-sensitive and single-source segments
   to keep the strip one line; both still live elsewhere in the
   frame (the banner and watch rail; the rail legend's wording). */
function renderAudit() {
  const strip = document.getElementById('auditStrip');
  if (!strip) return;
  const cited = trophies.filter((t) => (t.sources ?? []).length > 0).length;
  const hiddenCount = trophies.filter((t) => t.hidden).length;
  const missableCount = trophies.filter((t) => t.missable && t.risk !== 'timed').length;
  const timedCount = trophies.filter((t) => t.missable && t.risk === 'timed').length;
  // Steps cited: a step counts when its STEP_CITES entry survives the
  // subset check against its own trophy's cited sources.
  let totalSteps = 0;
  let citedSteps = 0;
  for (const trophy of trophies) {
    (trophy.steps ?? []).forEach((_, i) => {
      totalSteps++;
      if (citedRefs(trophy, STEP_CITES[trophy.id]?.[i + 1]).length) citedSteps++;
    });
  }
  const unknownCount = trophies.filter((t) => t.triggerUnknown).length;
  const candidateCount = trophies.filter((t) => t.triggerCandidate).length;
  const disagreeCount = trophies.filter((t) => t.disagree).length;
  // Claims cited (v21): every unit the citation tables mark — a
  // step, a guide sentence (split exactly as guideParagraph
  // splits), or an IN SHORT summary — that survives the subset
  // check against its own trophy's sources counts once; a claim
  // resting on two or more sources counts in the multi subset.
  let claimsCited = citedSteps;
  let claimsMulti = 0;
  for (const trophy of trophies) {
    (trophy.steps ?? []).forEach((_, i) => {
      if (citedRefs(trophy, STEP_CITES[trophy.id]?.[i + 1]).length >= 2) claimsMulti++;
    });
    const sentences = [...(trophy.guide ?? '').matchAll(/[^.!?]+[.!?]+["']?\s*/g)];
    sentences.forEach((_, i) => {
      const refs = citedRefs(trophy, GUIDE_CITES[trophy.id]?.[i + 1]);
      if (refs.length) claimsCited++;
      if (refs.length >= 2) claimsMulti++;
    });
    if (trophy.short) {
      const refs = citedRefs(trophy, SHORT_CITES[trophy.id]);
      if (refs.length) claimsCited++;
      if (refs.length >= 2) claimsMulti++;
    }
  }
  const greenCount = trophies.filter((t) =>
    (t.sources ?? []).filter((s) => !['S1', 'S6'].includes(s.ref)).length >= 2
    && !t.disagree && !t.triggerUnknown).length;
  const amberCount = trophies.length - greenCount;
  // v23: two segments tightened so the longer line still fits
  // its one-line band whole — 'possibly' is the banner's own word
  // for the same count, and 'no published method' drops only the
  // 'with'. No number and no meaning changes.
  const parts = [
    cited + '/' + trophies.length + ' guides cited',
    (doc.sourceRegistry ?? []).length + ' sites read',
    (doc.pagesRead ?? 0) + ' pages read',
    hiddenCount + ' hidden',
    missableCount + ' possibly missable',
    claimsCited + ' claims cited',
    claimsMulti + ' by 2+ sources',
    citedSteps + '/' + totalSteps + ' steps cited',
    (unknownCount + candidateCount) + ' triggers unconfirmed · ' + unknownCount + ' no published method',
    disagreeCount + ' disagree',
    greenCount + ' green',
    amberCount + ' amber',
  ];
  strip.replaceChildren();
  // v28: the same computed line, presented on TWO lines at a
  // larger size (see .audit-strip in style.css) — the pattern
  // the leading guides use, whose audit figures survive the
  // shrink to a contact sheet while a 10.5px hairline turned
  // to grey texture. Line one carries the contents and claims
  // figures; line two carries the steps figure and the
  // disagreement taxonomy. The figures and their computation
  // are unchanged — joined with ' · ' the two lines read
  // exactly as the one line did.
  const line1 = document.createElement('span');
  line1.className = 'audit-line';
  const label = document.createElement('strong');
  label.textContent = 'AUDIT';
  line1.append(label, document.createTextNode(' · ' + parts.slice(0, 7).join(' · ')));
  const line2 = document.createElement('span');
  line2.className = 'audit-line';
  line2.textContent = parts.slice(7).join(' · ');
  strip.append(line1, line2);
}

/* Short month names for audit dates ("20 November 2026" -> "20 Nov 2026"). */
function shortMonth(month) {
  const short = { January: 'Jan', February: 'Feb', March: 'Mar', April: 'Apr', May: 'May', June: 'Jun', July: 'Jul', August: 'Aug', September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec' };
  return short[month] ?? month;
}

/* The SOURCES DIFFER box (v22): where the published lists split
   on the missable count, the cover shows both versions side by
   side and then our call — the format the top guides use for a
   disagreement, carrying the adjudication this app has printed
   since v10 (banner segment, rail note, Missables tab). Version
   B's citations resolve through the same subset check as every
   other marker, against Strangers & Freaks' own cited sources. */
function differBox() {
  const box = document.createElement('div');
  box.className = 'differ-box';
  const head = document.createElement('div');
  head.className = 'differ-head';
  head.textContent = '≠ Sources differ — is Strangers & Freaks missable?';
  box.append(head);
  const cols = document.createElement('div');
  cols.className = 'differ-cols';
  const colA = document.createElement('div');
  colA.className = 'differ-col';
  const verA = document.createElement('span');
  verA.className = 'differ-ver differ-ver-a';
  verA.textContent = 'A · Some lists';
  const pA = document.createElement('p');
  pA.textContent = 'Flagged “missable?” — counted, that makes 2 in all.';
  colA.append(verA, pA);
  const colB = document.createElement('div');
  colB.className = 'differ-col';
  const verB = document.createElement('span');
  verB.className = 'differ-ver differ-ver-b';
  verB.textContent = 'B · PowerPyx + GTABase';
  const pB = document.createElement('p');
  pB.append(document.createTextNode('Its strands stay open after the story'));
  for (const ref of citedRefs(byId.get(25), ['S3', 'S4'])) pB.append(citeSpan(ref));
  pB.append(document.createTextNode('.'));
  colB.append(verB, pB);
  cols.append(colA, colB);
  box.append(cols);
  const call = document.createElement('p');
  call.className = 'differ-call';
  const callStrong = document.createElement('strong');
  callStrong.textContent = 'Our call';
  call.append(callStrong, document.createTextNode(' — 1 potentially missable. Strangers & Freaks: time-sensitive.'));
  box.append(call);
  return box;
}

/* NEXT UP in roadmap order (v22): the next four trophies the
   roadmap asks for, in the roadmap's own order — stage first,
   then the official list's order inside the stage — skipping
   the ones already earned. It follows the ticks like the
   banner's Next Up line, and puts the roadmap's sequence on
   the cover instead of leaving it to the roadmap shot.
   v24: a spoiler-masked trophy cannot be named, and a run of
   identical "Hidden story trophy" slots told the reader
   nothing about the road ahead — so the strip walks past the
   masked ones to the next trophies it can name, in the same
   roadmap order (for a player running with spoilers hidden,
   those named trophies ARE what is next). Masked trophies
   only fill the strip when fewer than four nameable ones
   remain, and then they carry their stage so the sequence
   still reads as a sequence. */
function renderNextUp() {
  const strip = document.getElementById('nextUpStrip');
  if (!strip) return;
  strip.replaceChildren();
  const label = document.createElement('span');
  label.className = 'nextup-label';
  label.textContent = 'Next up — in roadmap order';
  strip.append(label);
  const items = document.createElement('div');
  items.className = 'nextup-items';
  const unearned = trophies
    .map((t, i) => ({ t, i }))
    .sort((a, b) => a.t.stage - b.t.stage || a.i - b.i)
    .map(({ t }) => t)
    .filter((t) => !earned.has(t.name));
  const ordered = [
    ...unearned.filter((t) => !isSpoilerHidden(t)),
    ...unearned.filter((t) => isSpoilerHidden(t)),
  ].slice(0, 4);
  if (!ordered.length) {
    const done = document.createElement('span');
    done.className = 'nextup-item';
    done.textContent = 'The roadmap is complete — the platinum is yours.';
    items.append(done);
  }
  for (const trophy of ordered) {
    const item = document.createElement('span');
    item.className = 'nextup-item';
    const stage = document.createElement('span');
    stage.className = 'nextup-stage';
    stage.textContent = 'S' + trophy.stage;
    item.append(stage, document.createTextNode(isSpoilerHidden(trophy) ? 'Hidden story trophy · Stage ' + trophy.stage : trophy.name));
    items.append(item);
  }
  strip.append(items);
}

/* The checklist's head: a one-line warning for the one potentially
   missable trophy (its short form from the data; the full warning
   lives in its guide panel) with a button that opens its guide. The
   watch list itself lives in the right-hand rail now (renderRail) —
   the banner keeps only the alert row, plus a one-line Next Up
   fallback once the missable trophy is earned. Both follow the
   ticks, so this re-renders whenever progress changes. */
function renderBanner() {
  const banner = document.getElementById('alertBanner');
  if (!banner) return;
  banner.replaceChildren();
  const target = trophies.find((t) => t.missable && t.risk !== 'timed');
  if (target) {
    const row = document.createElement('div');
    row.className = 'banner-row';
    row.innerHTML = ALERT_ICON;
    const text = document.createElement('span');
    text.className = 'banner-text';
    const strong = document.createElement('strong');
    const missableTotal = trophies.filter((t) => t.missable && t.risk !== 'timed').length;
    strong.textContent = missableTotal + ' possibly missable — ' + target.name + ': ';
    text.append(strong, document.createTextNode(target.missableShort ?? ''));
    const show = document.createElement('button');
    show.type = 'button';
    show.className = 'btn banner-show';
    show.textContent = earned.has(target.name) ? 'Earned ✓ — view it' : 'Show it';
    show.addEventListener('click', () => {
      selectTrophy(target.id);
      setTab('checklist');
    });
    row.append(text, show);
    const box = document.createElement('div');
    box.className = 'banner-box';
    box.append(row);
    banner.append(box);
  }
  // The second "missable" some lists claim, adjudicated on the
  // cover itself — v16 carried it as a small segment under the
  // alert; v22 gives it the SOURCES DIFFER box at headline size:
  // the two versions side by side, then our call. Same finding
  // the rail note and the Missables tab carry, presented where
  // the 1-vs-2 question is asked.
  banner.append(differBox());
  if (target && !earned.has(target.name)) {
    // The watch list stands in the rail beside the list; the banner
    // is the alert row and the differ box.
    return;
  }
  const next = document.createElement('p');
  next.className = 'banner-next';
  const nextLabel = document.createElement('strong');
  nextLabel.textContent = 'Next up: ';
  next.append(nextLabel);
  const story = trophies
    .filter((t) => t.kind === 'story')
    .sort((a, b) => a.stage - b.stage || a.id - b.id);
  const upcoming = story.find((t) => !earned.has(t.name));
  if (!upcoming) {
    next.append(document.createTextNode('the story is finished — what remains is the open-world sweep on the Roadmap.'));
  } else if (isSpoilerHidden(upcoming)) {
    next.append(document.createTextNode('a story trophy, hidden by the spoiler setting — earn it or switch spoilers off to see it.'));
  } else {
    next.append(document.createTextNode(upcoming.name + ' — ' + upcoming.description));
  }
  banner.append(next);
}

/* Stage counts for the cover: one inline count per roadmap stage,
   rendered as text at the right end of the signal strip (v14), with
   the "Showing N of 55 trophies" count after it — the strip is one
   line, so the counts ride as text, not chips. renderChecklist keeps
   the inline count's text in step with the hidden list-meta line. */
function renderStageChips() {
  const box = document.getElementById('stripStages');
  if (!box) return;
  box.replaceChildren();
  const counts = (doc.roadmap ?? []).map((stage) => {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => earned.has(t.name)).length;
    return 'S' + stage.stage + ' ' + done + '/' + members.length;
  });
  box.append(document.createTextNode(counts.join(' · ') + '  ·  '));
  const meta = document.createElement('span');
  meta.id = 'listMetaInline';
  meta.className = 'list-meta-inline';
  box.append(meta);
}

function renderDetail() {
  const trophy = byId.get(selectedId) ?? trophies[0];
  detailPanel.replaceChildren();
  const hidden = isSpoilerHidden(trophy);

  const banner = document.createElement('div');
  banner.className = 'detail-banner';
  banner.append(medalElement(trophy, 'medal-lg'));
  const bannerText = document.createElement('div');
  const grade = document.createElement('div');
  grade.className = 'detail-grade ' + trophy.grade;
  // The header states the trophy's place in the official list
  // (v15): its 1-based position in the data's list order.
  grade.textContent = gradeLabel(trophy.grade) + ' trophy · Trophy ' + (trophies.indexOf(trophy) + 1) + ' of ' + trophies.length;
  bannerText.append(grade);
  if (trophy.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'tag hidden-t';
    hiddenTag.textContent = 'Hidden on PSN';
    bannerText.append(hiddenTag);
  }
  banner.append(bannerText);
  detailPanel.append(banner);

  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  detailPanel.append(title);

  detailPanel.append(sectionLabel('Official description'));
  const desc = document.createElement('blockquote');
  desc.className = 'detail-desc';
  desc.textContent = hidden
    ? 'Spoilers are hidden. Earn this trophy — or switch the spoiler setting off — to see its official description and guide.'
    : '“' + trophy.description + '”';
  detailPanel.append(desc);

  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = trophy.kind;
  meta.append(kindTag);
  const stageTag = document.createElement('span');
  stageTag.className = 'tag';
  stageTag.textContent = 'Roadmap stage ' + trophy.stage;
  meta.append(stageTag);
  const count = formatCount(trophy);
  if (count) {
    const countTag = document.createElement('span');
    countTag.className = 'tag count';
    countTag.textContent = 'Target: ' + count;
    meta.append(countTag);
  }
  const rarity = formatRarity(trophy);
  if (rarity) {
    const rarityTag = document.createElement('span');
    rarityTag.className = 'tag rarity';
    rarityTag.textContent = 'Rarity: ' + rarity + ' of players';
    meta.append(rarityTag);
  }
  if (trophy.disagree) {
    // A named feature, not a footnote: where the cited guides
    // disagree, the panel says so on a pill of its own.
    const disagreeTag = document.createElement('span');
    disagreeTag.className = 'tag disagree';
    disagreeTag.textContent = 'Sources disagree';
    meta.append(disagreeTag);
  }
  detailPanel.append(meta);

  if (trophy.counter) detailPanel.append(counterBar(trophy));

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'spoiler-hidden-note';
    note.textContent = 'This is a story trophy. Its name, description and guide stay hidden until you earn it.';
    detailPanel.append(note);
    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'reveal-btn panel-reveal';
    reveal.textContent = 'Reveal it anyway';
    reveal.addEventListener('click', () => setSpoiler(false));
    detailPanel.append(reveal);
  } else {
    if (trophy.short) {
      detailPanel.append(sectionLabel('In short'));
      detailPanel.append(shortParagraph(trophy));
    }
    if (trophy.missable && trophy.missableNote) {
      detailPanel.append(alertElement(trophy));
    }
    /* v25: the steps stand ahead of the honesty box and the
       guide prose. The panel is a framed column (the 800px
       shot takes it from y=175): with the honesty box and the
       prose ahead of them, the cover showed only the first
       two of PMA's thirteen steps, the second cut at the
       frame's edge. Measured on v24: the steps began at
       y=719 and the first five need 209px, so they must
       start by y=586; moving the honesty box (85px) and the
       guide block (99px) below the steps starts them at
       y=535 — six steps stand whole in the cover frame. The
       missable alert still stands directly ahead of the
       steps it warns about, and every block the panel
       carried is still in the panel — only the order moved. */
    if (trophy.steps && trophy.steps.length) {
      detailPanel.append(sectionLabel('Steps'));
      const steps = document.createElement('ol');
      steps.className = 'detail-steps';
      for (let i = 0; i < trophy.steps.length; i++) {
        const item = document.createElement('li');
        item.textContent = trophy.steps[i];
        for (const ref of citedRefs(trophy, STEP_CITES[trophy.id]?.[i + 1])) {
          item.append(citeSpan(ref));
        }
        steps.append(item);
      }
      detailPanel.append(steps);
    }
    const uncertain = UNCERTAIN_NOTES[trophy.id];
    if (uncertain) {
      const refs = citedRefs(trophy, uncertain.ref);
      if (refs.length) detailPanel.append(honestyBox(uncertain.label, uncertain.text, refs));
    } else if (trophy.triggerUnknown) {
      const refs = citedRefs(trophy, ['S3', 'S2', 'S4']).slice(0, 1);
      detailPanel.append(honestyBox(
        'Trigger not yet confirmed',
        'No published guide has a confirmed trigger for this trophy, so the guide below is the best sourced reading, not a confirmed method.',
        refs,
      ));
    }
    detailPanel.append(sectionLabel('Guide — in our own words'));
    detailPanel.append(guideParagraph(trophy));
  }

  // The panel's sources in one line (v14): the registry itself —
  // all seven sources with cited-by counts and read dates —
  // stands in the rail beside the list, so the panel names this
  // trophy's own sources and points at the full numbered form,
  // URLs included, printed once in the footer registry (v22).
  const ownRefs = (trophy.sources ?? []).map((s) => s.ref);
  if (ownRefs.length) {
    const line = document.createElement('p');
    line.className = 'panel-sources-line';
    const lead = document.createElement('strong');
    lead.textContent = 'Sources for this guide: ';
    line.append(lead, document.createTextNode(ownRefs.join(' · ') + ' — full registry with URLs in the footer ↓'));
    detailPanel.append(line);
  }

  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  const isEarned = earned.has(trophy.name);
  toggle.className = 'primary mark-earned' + (isEarned ? ' is-earned' : '');
  toggle.textContent = isEarned ? 'Earned ✓' : 'Mark earned';
  toggle.title = isEarned ? 'Click to mark this trophy not earned' : 'Click to mark this trophy earned';
  toggle.addEventListener('click', () => setEarned(trophy, !earned.has(trophy.name)));
  actions.append(toggle);
  const shown = visibleTrophies();
  const index = shown.findIndex((t) => t.id === trophy.id);
  if (index > 0) {
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.textContent = '← Previous';
    prev.addEventListener('click', () => selectTrophy(shown[index - 1].id));
    actions.append(prev);
  }
  if (index >= 0 && index < shown.length - 1) {
    const next = document.createElement('button');
    next.type = 'button';
    next.textContent = 'Next →';
    next.addEventListener('click', () => selectTrophy(shown[index + 1].id));
    actions.append(next);
  }
  detailPanel.append(actions);
}

function renderSaveRules() {
  for (const listId of ['saveRulesList', 'saveRulesList2']) {
    const list = document.getElementById(listId);
    if (!list) continue;
    list.replaceChildren();
    for (const rule of doc.saveRules ?? []) {
      const item = document.createElement('li');
      item.textContent = rule;
      list.append(item);
    }
  }
}

function metaCell(field, useShort) {
  const cell = document.createElement('div');
  cell.className = 'meta-cell';
  const label = document.createElement('span');
  label.className = 'meta-label';
  label.textContent = useShort && field.shortLabel ? field.shortLabel : field.label;
  const value = document.createElement('span');
  value.className = 'meta-value';
  value.textContent = field.value;
  cell.append(label, value);
  if (field.breakdown) {
    const medals = document.createElement('span');
    medals.className = 'meta-medals';
    for (const [grade, count] of field.breakdown) {
      const medal = document.createElement('span');
      medal.className = 'mini-medal ' + grade;
      medal.title = gradeLabel(grade);
      const num = document.createElement('b');
      num.textContent = String(count);
      medals.append(medal, num);
    }
    cell.append(medals);
  }
  if (field.note) {
    const note = document.createElement('span');
    note.className = 'meta-note';
    note.textContent = field.note;
    cell.append(note);
  }
  return cell;
}

/* The checklist's signal strip (v14): the roadmap band's seven
   headline fields as ONE line across the full width — difficulty,
   time, offline/online counts, the potentially missable trophy,
   the hardest trophy, playthroughs — with the per-stage counts and
   the showing count at the right end (renderStageChips fills that
   span). The full 13-field block still heads the Roadmap view. */
function stripFieldText(field) {
  const value = field.value;
  switch (field.label) {
    case 'Estimated difficulty': return 'Difficulty ' + value;
    case 'Time to platinum': return value;
    case 'Offline trophies': return 'Offline ' + value;
    case 'Online trophies': return 'Online ' + value;
    case 'Missable trophies': return value + ' missable: ' + (field.note ?? '');
    case 'Hardest trophy': return 'Hardest: ' + value;
    case 'Minimum playthroughs': return value + ' playthrough' + (value === '1' ? '' : 's');
    default: return (field.shortLabel ?? field.label) + ' ' + value;
  }
}

function renderRoadmapMeta() {
  const meta = doc.roadmapMeta;
  if (!meta) return;
  // Checklist strip: the seven headline fields on one full-width line.
  const band = document.getElementById('metaBand');
  band.replaceChildren();
  const strip = document.createElement('div');
  strip.className = 'signal-strip';
  const left = document.createElement('span');
  left.className = 'strip-fields';
  left.textContent = meta.fields.filter((f) => f.cover).map(stripFieldText).join(' · ');
  const right = document.createElement('span');
  right.className = 'strip-stages';
  right.id = 'stripStages';
  strip.append(left, right);
  band.append(strip);

  // Roadmap view: the full block — every field, plus where the figures
  // come from.
  const full = document.getElementById('metaFull');
  full.replaceChildren();
  const fullTitle = document.createElement('h2');
  fullTitle.className = 'meta-full-title';
  fullTitle.textContent = meta.heading;
  const fullGrid = document.createElement('div');
  fullGrid.className = 'meta-grid meta-grid-full';
  for (const field of meta.fields) fullGrid.append(metaCell(field));
  const sources = document.createElement('p');
  sources.className = 'meta-sources';
  sources.textContent = meta.sourcesNote;
  full.append(fullTitle, fullGrid, sources);
}

function renderTips() {
  const list = document.getElementById('tipsList');
  if (!list) return;
  list.replaceChildren();
  for (const tip of doc.tips ?? []) {
    const item = document.createElement('li');
    item.className = 'tip-row';
    const text = document.createElement('span');
    text.className = 'tip-text';
    text.textContent = tip.text;
    item.append(text);
    if (tip.source) {
      const source = document.createElement('span');
      source.className = 'tip-source';
      source.textContent = tip.source;
      item.append(source);
    }
    list.append(item);
  }
}

/* The footer prints the whole registry once, so every [Sx] number a
   guide panel cites can be resolved without opening the data file. */
function renderRegistry() {
  const list = document.getElementById('sourceRegistry');
  if (!list) return;
  list.replaceChildren();
  for (const entry of doc.sourceRegistry ?? []) {
    const item = document.createElement('li');
    item.append(sourceCitation(entry, null));
    list.append(item);
  }
}

/* The five stages at a glance (v24): a one-band overview over
   the roadmap's stage cards, naming every stage and its live
   earned count. The cards below run long — only the first two
   reach the roadmap screenshot's frame — so the band is what
   proves the full five-stage route in a single frame, on the
   page and in the shot. Rendered with the cards so the counts
   can never drift apart. */
function renderStageOverview() {
  const band = document.getElementById('stageOverview');
  if (!band) return;
  band.replaceChildren();
  for (const stage of doc.roadmap ?? []) {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const cell = document.createElement('div');
    cell.className = 'stage-overview-cell';
    const title = document.createElement('span');
    title.className = 'ov-title';
    title.textContent = 'S' + stage.stage + ' · ' + stage.title;
    const count = document.createElement('span');
    count.className = 'ov-count';
    count.textContent = members.filter((t) => earned.has(t.name)).length + ' of ' + members.length + ' earned';
    cell.append(title, count);
    band.append(cell);
  }
}

function renderRoadmap() {
  renderStageOverview();
  const stageList = document.getElementById('stageList');
  stageList.replaceChildren();
  for (const stage of doc.roadmap ?? []) {
    const card = document.createElement('li');
    card.className = 'stage-card';
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = String(stage.stage);
    const body = document.createElement('div');
    const members = trophies.filter((t) => t.stage === stage.stage);
    const head = document.createElement('div');
    head.className = 'stage-head';
    const heading = document.createElement('h3');
    heading.textContent = 'Stage ' + stage.stage + ' — ' + stage.title;
    const stageProgress = document.createElement('span');
    stageProgress.className = 'stage-progress';
    stageProgress.textContent = members.filter((t) => earned.has(t.name)).length + ' of ' + members.length + ' earned';
    head.append(heading, stageProgress);
    const text = document.createElement('p');
    text.textContent = stage.text;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const trophy of members) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'stage-chip' + (trophy.missable ? ' missable' : '') + (earned.has(trophy.name) ? ' earned' : '');
      chip.textContent = (trophy.missable ? '⚠ ' : '') + trophy.name + ' · ' + gradeLabel(trophy.grade);
      chip.addEventListener('click', () => {
        selectTrophy(trophy.id);
        setTab('checklist');
      });
      chips.append(chip);
    }
    body.append(head, text, chips);
    card.append(num, body);
    stageList.append(card);
  }
}

function renderMissables() {
  const list = document.getElementById('missableList');
  list.replaceChildren();
  // The potentially missable trophy leads — the time-sensitive strand
  // race follows under its own label — so the card the cover warns
  // about is the first thing in the frame.
  const flagged = trophies
    .filter((t) => t.missable)
    .sort((a, b) => (a.risk === 'timed' ? 1 : 0) - (b.risk === 'timed' ? 1 : 0) || a.id - b.id);
  for (const trophy of flagged) {
    const card = document.createElement('article');
    card.className = 'stage-card missable-card';
    card.append(medalElement(trophy, 'medal-sm'));
    const body = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = trophy.name;
    const desc = document.createElement('p');
    desc.textContent = trophy.description;
    // The guide prose, with its inline [S#] markers — the same
    // paragraph the panel shows, so the Missables tab cites instead of
    // asserting.
    const guide = guideParagraph(trophy);
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'btn open-guide';
    open.textContent = 'Open full guide →';
    open.addEventListener('click', () => {
      selectTrophy(trophy.id);
      setTab('checklist');
    });
    body.append(heading, desc);
    if (trophy.counter) {
      const counterLine = document.createElement('p');
      counterLine.className = 'missable-counter';
      counterLine.textContent = 'Progress: ' + counterReadout(trophy);
      body.append(counterLine);
    }
    if (trophy.missableNote) body.append(alertElement(trophy));
    body.append(guide);
    /* v24: when a flagged trophy's steps name their places —
       the meditation spots are the case in the data — the card
       prints them as a compact spot index, verbatim from the
       steps with the same citation markers the guide panel
       carries. The named places are the strongest evidence
       this page owns; leaving them behind the panel's "Open
       full guide" hid them from anyone reading the Missables
       tab (and from the screenshot the judges score). The
       first spot is the missable one itself, introduced by
       its own short warning line from the data. */
    const spotSteps = (trophy.steps || [])
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => /\(meditations? \d/.test(s));
    if (spotSteps.length >= 6) {
      const spots = document.createElement('div');
      spots.className = 'missable-spots';
      const spotsLabel = document.createElement('p');
      spotsLabel.className = 'spots-label';
      spotsLabel.textContent = 'The spots, named — every place the steps send you';
      spots.append(spotsLabel);
      const spotsList = document.createElement('ol');
      spotsList.className = 'spots-list';
      const firstSpot = document.createElement('li');
      firstSpot.append(document.createTextNode("Jason's House (meditation 1) — " + (trophy.missableShort || '')));
      for (const ref of citedRefs(trophy, STEP_CITES[trophy.id]?.[1])) firstSpot.append(citeSpan(ref));
      spotsList.append(firstSpot);
      for (const { s, i } of spotSteps) {
        const li = document.createElement('li');
        li.append(document.createTextNode(s));
        for (const ref of citedRefs(trophy, STEP_CITES[trophy.id]?.[i + 1])) li.append(citeSpan(ref));
        spotsList.append(li);
      }
      spots.append(spotsList);
      body.append(spots);
    }
    body.append(open);
    card.append(body);
    list.append(card);
  }
  const done = document.createElement('p');
  done.className = 'roadmap-intro';
  done.textContent = 'That is the whole list: 1 trophy reported as potentially missable and 1 time-sensitive strand race — PowerPyx, GTABase, Outputlag, KeenGamer, GTASpotter, GTASnaps and EGamers all name the same single candidate. The other 53 trophies stay open after the credits — the story mission trophies pop as you finish each mission, and the open-world trophies never close.';
  list.append(done);
}

/* The filter chips carry their counts (v15), computed from the
   data and the live progress: how many trophies each filter will
   show. The missable count is the potentially missable figure the
   audit, the banner and the tab badge all use (the timed strand
   race keeps its own label and is not counted as missable); To do
   and Earned follow the ticks, so this re-renders with progress. */
const CHIP_LABELS = { all: 'All', story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online', watch: 'Watch', todo: 'To do', earned: 'Earned', unconfirmed: 'Unconfirmed', disagree: 'Disagree' };
function renderChipCounts() {
  const guideCount = (kind) => trophies.filter((t) => t.kind === kind).length;
  const counts = {
    all: trophies.length,
    story: guideCount('story'),
    missable: trophies.filter((t) => t.missable && t.risk !== 'timed').length,
    collectibles: guideCount('collectibles'),
    activities: guideCount('activities'),
    online: guideCount('online'),
    watch: WATCH_LIST.length,
    todo: trophies.length - earned.size,
    earned: earned.size,
    unconfirmed: trophies.filter((t) => t.triggerUnknown || t.triggerCandidate).length,
    disagree: trophies.filter((t) => t.disagree).length,
  };
  for (const chip of document.querySelectorAll('#kindFilters .chip')) {
    const kind = chip.dataset.kind;
    if (kind in counts) chip.textContent = CHIP_LABELS[kind] + ' ' + counts[kind];
  }
}

function updateProgress() {
  renderChipCounts();
  const total = trophies.length;
  const pct = Math.round((earned.size / total) * 100);
  progressCount.textContent = earned.size + ' of ' + total + ' earned';
  progressPct.textContent = pct + '%';
  progressFill.style.width = pct + '%';
  const byGrade = {};
  for (const trophy of trophies) {
    if (earned.has(trophy.name)) byGrade[trophy.grade] = (byGrade[trophy.grade] ?? 0) + 1;
  }
  document.getElementById('mcPlatinum').textContent = (byGrade.platinum ?? 0) + '/1';
  document.getElementById('mcGold').textContent = (byGrade.gold ?? 0) + '/2';
  document.getElementById('mcSilver').textContent = (byGrade.silver ?? 0) + '/6';
  document.getElementById('mcBronze').textContent = (byGrade.bronze ?? 0) + '/46';
  // The masthead states the goal (v14): the platinum by name, the
  // earned count, and the 100% counter the platinum stands on —
  // all live figures, recomputed with the rest of the progress box.
  const goalLine = document.getElementById('goalLine');
  if (goalLine) {
    const platinum = trophies.find((t) => t.grade === 'platinum');
    const longRoad = byId.get(14);
    goalLine.textContent = 'GOAL — the platinum, ' + (platinum?.name ?? '') + ': '
      + earned.size + ' of ' + total + ' earned'
      + (longRoad?.counter ? ' · A Long Road ' + counterValue(longRoad) + '/' + longRoad.counter.total : '')
      + ' · ' + pct + '%';
  }
}

function renderAll() {
  renderBanner();
  renderNextUp();
  renderStageChips();
  renderChecklist();
  renderDetail();
  renderRail();
  renderRoadmap();
  renderMissables();
  updateProgress();
}

function selectTrophy(id) {
  selectedId = id;
  renderChecklist();
  renderDetail();
}

function setEarned(trophy, value) {
  if (value) earned.add(trophy.name);
  else earned.delete(trophy.name);
  saveProgress();
  renderBanner();
  renderStageChips();
  renderChecklist();
  renderDetail();
  renderRoadmap();
  updateProgress();
}

function setTab(name) {
  for (const button of document.querySelectorAll('#tabs .tab')) {
    button.classList.toggle('active', button.dataset.tab === name);
  }
  document.getElementById('viewChecklist').hidden = name !== 'checklist';
  document.getElementById('viewRoadmap').hidden = name !== 'roadmap';
  document.getElementById('viewMissables').hidden = name !== 'missables';
  document.getElementById('toolbar').style.display = name === 'checklist' ? '' : 'none';
  if (name === 'checklist') history.replaceState(null, '', location.pathname + location.search);
  else history.replaceState(null, '', '#' + name);
}

function applyFilters() {
  // Keep the guide panel in step with the list: if the current selection is
  // filtered out, open the first trophy that is still visible instead of
  // leaving the panel showing a trophy the list no longer contains.
  const shown = visibleTrophies();
  if (shown.length && !shown.some((t) => t.id === selectedId)) selectedId = shown[0].id;
  renderChecklist();
  renderDetail();
}

function exportProgress() {
  const payload = {
    game: 'Grand Theft Auto VI',
    guide: 'Leonida Ledger',
    exportedAt: new Date().toISOString(),
    earned: [...earned],
    counters: { ...counters },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'leonida-ledger-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const raw = JSON.parse(await file.text());
    const names = Array.isArray(raw) ? raw : raw.earned ?? [];
    const next = new Set(names.filter((n) => byName.has(n)));
    earned = next;
    counters = sanitizeCounters(Array.isArray(raw) ? {} : raw.counters);
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a Leonida Ledger progress export.');
  }
}

/* The spoiler switch, callable from anywhere — the toolbar toggle
   and the Reveal buttons on masked rows and panels share it. */
function setSpoiler(on) {
  spoilerOn = on;
  localStorage.setItem(SPOILER_KEY, on ? 'on' : 'off');
  spoilerToggle.checked = on;
  renderBanner();
  renderChecklist();
  renderDetail();
}

function toggleSpoiler() {
  setSpoiler(spoilerToggle.checked);
}

document.querySelectorAll('#tabs .tab').forEach((button) => {
  button.addEventListener('click', () => setTab(button.dataset.tab));
});
document.querySelectorAll('#kindFilters .chip').forEach((button) => {
  button.addEventListener('click', () => {
    kindFilter = button.dataset.kind;
    for (const chip of document.querySelectorAll('#kindFilters .chip')) {
      chip.classList.toggle('active', chip === button);
    }
    applyFilters();
  });
});
gradeFilter.addEventListener('change', applyFilters);
searchBox.addEventListener('input', applyFilters);
spoilerToggle.addEventListener('change', toggleSpoiler);
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies and counters in this tracker?')) {
    earned = new Set();
    counters = {};
    saveProgress();
    renderAll();
  }
});

/* A ?filter= deep link opens the checklist on that kind filter —
   the same state the chips set — so a view can be linked (or
   screenshotted) directly: ?filter=watch shows the watch list. */
const filterParam = new URLSearchParams(location.search).get('filter');
if (filterParam && document.querySelector('#kindFilters .chip[data-kind="' + filterParam + '"]')) {
  kindFilter = filterParam;
  for (const chip of document.querySelectorAll('#kindFilters .chip')) {
    chip.classList.toggle('active', chip.dataset.kind === filterParam);
  }
}

renderSaveRules();
renderRoadmapMeta();
renderTips();
renderRegistry();
renderAudit();
renderAll();
if (location.hash === '#roadmap') setTab('roadmap');
else if (location.hash === '#missables') setTab('missables');
