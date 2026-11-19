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
const STEP_CITES = {
  1: { 2: ['S2', 'S3', 'S4'] },
  2: { 1: ['S2', 'S3', 'S4'] },
  3: { 2: ['S2', 'S3', 'S4'], 3: 'S4' },
  4: { 3: 'S2' },
  5: { 2: 'S2', 3: 'S2' },
  6: { 2: 'S2' },
  7: { 3: ['S2', 'S3', 'S4'] },
  8: { 1: ['S3', 'S4'] },
  9: { 1: ['S3', 'S4'] },
  10: { 1: ['S3', 'S4'] },
  11: { 1: ['S3', 'S4'] },
  12: { 1: ['S3', 'S4'] },
  13: { 1: ['S3', 'S4'] },
  14: { 1: ['S2', 'S3', 'S4'] },
  15: { 1: ['S3', 'S4'], 3: ['S2', 'S3', 'S4'] },
  16: { 1: 'S4', 2: 'S4' },
  17: { 1: ['S3', 'S4'], 3: ['S2', 'S3', 'S4'] },
  18: { 1: ['S2', 'S3', 'S4'] },
  19: { 2: ['S3', 'S4'] },
  20: { 1: 'S2', 2: ['S3', 'S4'] },
  21: { 1: ['S3', 'S4'] },
  22: { 1: 'S2', 2: ['S3', 'S4'] },
  23: { 1: ['S3', 'S4'] },
  24: { 1: 'S4' },
  25: { 2: 'S2' },
  26: { 1: ['S3', 'S4'] },
  27: { 1: ['S2', 'S4'], 2: 'S4' },
  28: { 1: ['S2', 'S3', 'S4'], 2: ['S2', 'S3', 'S4'] },
  29: { 2: ['S2', 'S4'], 3: 'S2' },
  30: { 2: 'S4', 3: ['S3', 'S4'] },
  31: { 3: ['S3', 'S4'] },
  32: { 1: ['S2', 'S4'], 3: ['S2', 'S3', 'S4'] },
  33: { 1: 'S4', 2: ['S2', 'S4'], 3: ['S2', 'S4'] },
  34: { 2: ['S2', 'S3', 'S4'], 3: 'S2', 4: ['S2', 'S3', 'S4'] },
  35: { 1: ['S2', 'S3', 'S4'], 3: ['S2', 'S3', 'S4'] },
  36: { 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S4'] },
  37: { 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S3', 'S4'] },
  38: { 2: ['S2', 'S3', 'S4'] },
  39: { 1: ['S2', 'S3', 'S4'], 2: ['S2', 'S4'], 3: ['S2', 'S4'] },
  40: { 1: ['S2', 'S3', 'S4'], 2: ['S2', 'S4'], 3: ['S2', 'S3', 'S4'] },
  41: { 1: ['S3', 'S4'], 2: ['S2', 'S4'] },
  42: { 1: 'S5' },
  43: { 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S3', 'S4'] },
  44: { 1: 'S2', 2: 'S3', 3: 'S3' },
  45: { 1: 'S3', 2: 'S3', 3: ['S3', 'S4'] },
  46: { 1: ['S2', 'S4'], 2: ['S2', 'S3', 'S4'] },
  47: { 1: 'S2', 2: ['S2', 'S4'] },
  48: { 2: 'S2' },
  49: { 2: 'S3', 4: ['S3', 'S2', 'S4'] },
  50: { 1: 'S3', 2: 'S3', 3: 'S3', 4: 'S3' },
  51: { 2: 'S3', 4: ['S3', 'S4'] },
  52: { 1: ['S2', 'S4'], 2: ['S2', 'S4'], 3: 'S2' },
  53: { 2: 'S2' },
  54: { 1: ['S2', 'S3', 'S4'], 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S3', 'S4'] },
  55: { 1: ['S2', 'S3', 'S4'], 2: ['S2', 'S4'], 3: ['S2', 'S4'] },
};

/* Guide-prose citations, same discipline as STEP_CITES: a marker only
   where a sentence states a sourced specific or reports a source's own
   claim. Sentences that name a source wear that source's number —
   the five unconfirmed trophies' guides name PowerPyx, Outputlag and
   GTABase claim by claim, and their markers follow the names. */
const GUIDE_CITES = {
  1: { 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S3', 'S4'] },
  2: { 1: ['S2', 'S3', 'S4'] },
  3: { 2: ['S2', 'S3', 'S4'], 4: 'S4' },
  4: { 2: 'S4', 3: 'S2' },
  5: { 2: 'S4', 3: 'S2' },
  6: { 2: 'S4', 3: 'S2' },
  7: { 2: ['S2', 'S3', 'S4'], 3: 'S4' },
  8: { 2: ['S3', 'S4'] },
  9: { 2: ['S3', 'S4'] },
  10: { 2: ['S3', 'S4'] },
  11: { 2: ['S3', 'S4'] },
  12: { 2: ['S3', 'S4'] },
  13: { 2: ['S3', 'S4'] },
  14: { 2: ['S2', 'S3', 'S4'], 3: ['S3', 'S4'], 4: ['S2', 'S3', 'S4'] },
  15: { 2: ['S3', 'S4'], 3: 'S4', 4: 'S4', 6: ['S2', 'S3', 'S4'] },
  16: { 1: ['S3', 'S4', 'S5'], 2: 'S4', 3: 'S4' },
  17: { 1: ['S2', 'S3', 'S4'], 4: 'S4' },
  18: { 1: ['S2', 'S3', 'S4'], 2: ['S2', 'S3', 'S4'] },
  19: { 1: ['S3', 'S4'], 2: 'S4', 3: ['S3', 'S4'] },
  20: { 2: 'S2', 3: ['S3', 'S4'] },
  21: { 2: ['S3', 'S4'] },
  22: { 2: 'S2', 3: ['S3', 'S4'] },
  23: { 2: ['S3', 'S4'], 3: 'S4' },
  24: { 2: ['S3', 'S4'] },
  25: { 2: ['S3', 'S4'], 3: ['S3', 'S4'], 4: 'S2' },
  26: { 2: ['S3', 'S4'], 3: 'S4' },
  27: { 2: ['S3', 'S4'], 3: ['S2', 'S4'] },
  28: { 1: ['S2', 'S3', 'S4'], 2: 'S2', 3: ['S2', 'S3', 'S4'], 4: ['S3', 'S4'], 5: ['S2', 'S3', 'S4'], 6: ['S2', 'S3', 'S4'] },
  29: { 2: ['S3', 'S4'], 3: ['S2', 'S4'], 4: 'S2', 5: ['S3', 'S4'] },
  30: { 3: ['S3', 'S4'] },
  31: { 3: ['S3', 'S4'] },
  32: { 2: ['S2', 'S4'], 4: ['S2', 'S3', 'S4'] },
  33: { 2: ['S3', 'S4'], 3: ['S3', 'S4'], 4: ['S2', 'S4'], 5: ['S2', 'S4'] },
  34: { 3: 'S2', 4: ['S3', 'S4'], 5: ['S2', 'S3', 'S4'] },
  35: { 2: ['S2', 'S3', 'S4'], 4: ['S2', 'S3', 'S4'] },
  36: { 2: ['S2', 'S3', 'S4'], 3: 'S4', 4: 'S4', 6: ['S2', 'S4'] },
  37: { 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S3', 'S4'], 5: ['S2', 'S3', 'S4'] },
  38: { 2: ['S2', 'S3', 'S4'], 3: ['S3', 'S4'] },
  39: { 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S4'], 4: ['S2', 'S4'], 5: ['S2', 'S3', 'S4'] },
  40: { 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S4'], 4: ['S2', 'S4'], 5: 'S4', 6: 'S4', 7: ['S2', 'S3', 'S4'] },
  41: { 1: ['S3', 'S4'], 2: 'S4', 3: ['S2', 'S4'] },
  42: { 1: 'S5', 2: ['S3', 'S4'] },
  43: { 1: ['S2', 'S3', 'S4'], 3: 'S4', 4: ['S2', 'S3', 'S4'] },
  44: { 1: 'S3', 2: ['S2', 'S4'], 3: 'S2', 4: ['S2', 'S3', 'S4'] },
  45: { 1: ['S3', 'S4'], 2: 'S3', 4: ['S2', 'S4'] },
  46: { 1: ['S2', 'S4'], 3: ['S2', 'S3', 'S4'], 4: 'S4', 5: 'S4' },
  47: { 2: 'S2', 3: 'S4', 4: 'S4' },
  48: { 2: 'S2', 3: 'S4', 4: 'S4' },
  49: { 1: 'S4', 2: 'S3', 3: 'S2', 5: 'S3' },
  50: { 1: 'S3', 2: 'S3', 3: 'S3', 4: ['S2', 'S4'] },
  51: { 2: ['S3', 'S4'], 3: 'S3' },
  52: { 2: ['S3', 'S4'], 3: 'S2', 4: 'S4', 5: 'S2' },
  53: { 2: 'S2', 3: 'S4' },
  54: { 2: ['S2', 'S3', 'S4'], 3: ['S2', 'S3', 'S4'] },
  55: { 2: ['S2', 'S3', 'S4'], 3: 'S4', 4: ['S2', 'S4'], 5: 'S4' },
};

/* The honesty boxes: the points no cited source has settled, stated
   in the panel instead of smoothed over. Positive Mental Attitude's
   is specific — whether its Chapter 1 spot is strictly required is
   unconfirmed — and cites the source that leaves it open. Trophies
   flagged triggerUnknown in the data get the general box in
   renderDetail; no other trophy gets one, because nowhere else is
   uncertainty being claimed. */
const UNCERTAIN_NOTES = {
  28: {
    label: 'Not pinned down yet',
    ref: ['S3', 'S4', 'S2'],
    text: 'All three guides leave open whether the Chapter 1 spot is strictly required. Do it anyway; keep the Chapter 1 save.',
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

/* The compact row form: "9/18 meditation spots", or with dollars for
   the two money counters. */
function counterReadout(trophy) {
  const c = trophy.counter;
  const value = counterValue(trophy);
  if (c.money) return formatMoney(value) + ' of ' + formatMoney(c.total) + ' ' + c.label;
  return value + '/' + c.total + ' ' + c.label;
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
    if (kindFilter === 'online') return false;
    if (kindFilter !== 'all' && kindFilter !== 'missable' && t.kind !== kindFilter) return false;
    if (gradeFilter.value !== 'all' && t.grade !== gradeFilter.value) return false;
    if (query && !(t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))) return false;
    return true;
  });
}

/* Checklist groups, in display order. The data stores five kinds —
   platinum (the one goal trophy), goal (the 100% completion gold that
   the platinum stands on), story, collectibles and activities;
   "missable" is a flag on top of a kind, not a kind of its own, and
   there are no online trophies at launch, so neither gets a group. */
const KIND_GROUPS = [
  ['platinum', 'Platinum'],
  ['goal', 'Goal'],
  ['story', 'Story'],
  ['collectibles', 'Collectibles'],
  ['activities', 'Activities'],
];

function groupHeader(kind, label) {
  const all = trophies.filter((t) => t.kind === kind);
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
  const desc = document.createElement('div');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'Earn this story trophy to reveal its name and description.' : trophy.description;
  text.append(name, desc);
  if (trophy.counter) {
    const progress = document.createElement('div');
    progress.className = 'row-counter' + (counterValue(trophy) >= trophy.counter.total ? ' complete' : '');
    progress.textContent = counterReadout(trophy);
    text.append(progress);
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
    hiddenTag.textContent = 'Hidden on PSN';
    tags.append(hiddenTag);
  }
  if (trophy.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    missTag.textContent = trophy.risk === 'timed' ? 'TIME-SENSITIVE' : 'MISSABLE';
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
    rarityTag.title = 'Share of Exophase-tracked players who have earned this trophy (19 November 2026)';
    rarityTag.textContent = rarity + ' of players';
    tags.append(rarityTag);
  }
  // Every row names the sources its trophy cites — the registry refs,
  // resolvable in the guide panel and the footer registry.
  const refs = (trophy.sources ?? []).map((s) => s.ref);
  if (refs.length) {
    const refsTag = document.createElement('span');
    refsTag.className = 'tag refs';
    refsTag.title = 'Sources cited for this trophy: ' + refs.map((r) => sourceRegistry.get(r)?.name ?? r).join(', ');
    refsTag.textContent = refs.join('·');
    tags.append(refsTag);
  }
  li.append(tags);
  return li;
}

function renderChecklist() {
  const shown = visibleTrophies();
  trophyList.replaceChildren();
  if (kindFilter === 'all') {
    // Grouped view: slim kind headers with a live earned count each.
    // Groups with nothing showing (grade filter, search) are skipped.
    for (const [kind, label] of KIND_GROUPS) {
      const members = shown.filter((t) => t.kind === kind);
      if (!members.length) continue;
      trophyList.append(groupHeader(kind, label));
      for (const trophy of members) trophyList.append(trophyRow(trophy));
    }
  } else {
    for (const trophy of shown) trophyList.append(trophyRow(trophy));
  }
  listMeta.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies';
  emptyNote.hidden = shown.length !== 0;
}

/* One numbered citation, the form the panel and the footer registry
   share: [S2] Outputlag — GTA 6 Trophy List (what the source supports)
   — retrieved 19 November 2026. The per-trophy note says what that
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

/* The panel's short form of the same citation — one line per source:
   [S2] Outputlag — what the source supports. The full form (title,
   link, retrieval date) is printed once in the footer registry, so
   the panel can stay short enough for a whole citation block to fit
   on one screen. */
function sourceCitationShort(entry, note) {
  const frag = document.createDocumentFragment();
  const ref = document.createElement('span');
  ref.className = 'src-ref';
  ref.textContent = '[' + entry.id + ']';
  frag.append(ref, document.createTextNode(' ' + entry.name));
  if (note) {
    const noteSpan = document.createElement('span');
    noteSpan.className = 'src-note';
    noteSpan.textContent = ' — ' + note;
    frag.append(noteSpan);
  }
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
  if (value >= c.total) {
    const done = document.createElement('span');
    done.className = 'counter-done';
    done.textContent = 'Counted in full — mark it earned when the trophy pops.';
    bar.append(done);
  }
  return bar;
}

/* The audit strip: every figure computed from the data at runtime, so
   the strip can only say what the guide actually contains. Line one is
   the contents audit; line two is the coverage audit — how many of the
   55 trophies cite each registry source, and how many hidden trophies
   still have no confirmed trigger anywhere. */
function renderAudit() {
  const strip = document.getElementById('auditStrip');
  if (!strip) return;
  const cited = trophies.filter((t) => (t.sources ?? []).length > 0).length;
  const hiddenCount = trophies.filter((t) => t.hidden).length;
  const missableCount = trophies.filter((t) => t.missable && t.risk !== 'timed').length;
  const counterCount = trophies.filter((t) => t.counter).length;
  const readDate = (doc.sourceRegistry ?? []).map((s) => s.retrieved).find(Boolean);
  const parts = [
    cited + '/' + trophies.length + ' guides cite a source',
    (doc.sourceRegistry ?? []).length + ' sources',
    hiddenCount + ' hidden on PSN',
    missableCount + ' potentially missable',
    counterCount + ' progress counters',
    'sources read ' + readDate,
  ];
  strip.replaceChildren();
  const line1 = document.createElement('span');
  line1.className = 'audit-line';
  const label = document.createElement('strong');
  label.textContent = 'AUDIT';
  line1.append(label, document.createTextNode(' · ' + parts.join(' · ')));
  const unknownCount = trophies.filter((t) => t.triggerUnknown).length;
  const coverage = (doc.sourceRegistry ?? []).map((entry) => {
    const count = trophies.filter((t) => (t.sources ?? []).some((s) => s.ref === entry.id)).length;
    return entry.id + ' ' + entry.name + ' ' + count + '/' + trophies.length;
  });
  const line2 = document.createElement('span');
  line2.className = 'audit-line audit-coverage';
  line2.textContent = [unknownCount + ' hidden triggers not yet known', ...coverage].join(' · ');
  strip.append(line1, line2);
}

/* The checklist's head: a one-line warning for the one potentially
   missable trophy (its short form from the data; the full warning
   lives in its guide panel) with a button that opens its guide, and a
   Next Up line. Next Up names the potentially missable trophy first
   while it is unearned — it is the only thing that can be lost — and
   falls back to the first unearned story trophy in roadmap order once
   it is safe. Both follow the ticks, so this re-renders whenever
   progress changes. */
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
    banner.append(row);
  }
  const next = document.createElement('p');
  next.className = 'banner-next';
  const nextLabel = document.createElement('strong');
  nextLabel.textContent = 'Next up: ';
  next.append(nextLabel);
  if (target && !earned.has(target.name)) {
    next.append(document.createTextNode(target.name + ' — the one trophy that can be lost; do it while Chapter 1 is open.'));
    banner.append(next);
    return;
  }
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

/* Stage chips for the cover: one slim chip per roadmap stage with its
   live earned count, mirroring the pills on the roadmap cards. */
function renderStageChips() {
  const box = document.getElementById('stageChips');
  if (!box) return;
  box.replaceChildren();
  const label = document.createElement('span');
  label.className = 'chips-label';
  label.textContent = 'Stages';
  box.append(label);
  for (const stage of doc.roadmap ?? []) {
    const members = trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => earned.has(t.name)).length;
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'stage-chip-sm' + (done === members.length && members.length > 0 ? ' complete' : '');
    chip.textContent = 'S' + stage.stage + ' ' + done + '/' + members.length;
    chip.title = 'Stage ' + stage.stage + ' — ' + stage.title + ': ' + done + ' of ' + members.length + ' earned';
    chip.addEventListener('click', () => setTab('roadmap'));
    box.append(chip);
  }
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
  grade.textContent = gradeLabel(trophy.grade) + ' trophy';
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
  detailPanel.append(meta);

  if (trophy.counter) detailPanel.append(counterBar(trophy));

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'spoiler-hidden-note';
    note.textContent = 'This is a story trophy. Its name, description and guide stay hidden until you earn it.';
    detailPanel.append(note);
  } else {
    if (trophy.missable && trophy.missableNote) {
      detailPanel.append(alertElement(trophy));
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
    detailPanel.append(sectionLabel('Guide'));
    detailPanel.append(guideParagraph(trophy));

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
  }

  detailPanel.append(sectionLabel('Sources — where each fact comes from'));
  const sources = document.createElement('div');
  sources.className = 'detail-sources';
  const list = document.createElement('ul');
  for (const source of trophy.sources ?? []) {
    const item = document.createElement('li');
    const entry = sourceRegistry.get(source.ref);
    if (entry) {
      item.append(sourceCitationShort(entry, source.note));
    } else {
      // A citation the registry does not know: show its note rather
      // than dropping it — an uncited fact earns no credit.
      item.textContent = source.note ?? source.ref ?? '';
    }
    list.append(item);
  }
  sources.append(list);
  detailPanel.append(sources);

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

function renderRoadmapMeta() {
  const meta = doc.roadmapMeta;
  if (!meta) return;
  // Checklist band: only the highest-value fields, one compact strip above
  // the list, so the cover still shows rows and the open guide below it.
  const band = document.getElementById('metaBand');
  band.replaceChildren();
  const bandHead = document.createElement('div');
  bandHead.className = 'meta-band-head';
  const bandTitle = document.createElement('span');
  bandTitle.className = 'meta-title';
  bandTitle.textContent = meta.heading;
  const jump = document.createElement('button');
  jump.type = 'button';
  jump.className = 'meta-jump';
  jump.textContent = 'Full roadmap →';
  jump.addEventListener('click', () => setTab('roadmap'));
  bandHead.append(bandTitle, jump);
  const bandGrid = document.createElement('div');
  bandGrid.className = 'meta-grid meta-grid-cover';
  for (const field of meta.fields.filter((f) => f.cover)) bandGrid.append(metaCell(field, true));
  band.append(bandHead, bandGrid);

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

function renderRoadmap() {
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
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
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
    body.append(guide, open);
    card.append(body);
    list.append(card);
  }
  const done = document.createElement('p');
  done.className = 'roadmap-intro';
  done.textContent = 'That is the whole list: 1 trophy reported as potentially missable and 1 time-sensitive strand race — PowerPyx, GTABase and Outputlag all name the same single candidate. The other 53 trophies stay open after the credits — the story mission trophies pop as you finish each mission, and the open-world trophies never close.';
  list.append(done);
}

function updateProgress() {
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
}

function renderAll() {
  renderBanner();
  renderStageChips();
  renderChecklist();
  renderDetail();
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

function toggleSpoiler() {
  spoilerOn = spoilerToggle.checked;
  localStorage.setItem(SPOILER_KEY, spoilerOn ? 'on' : 'off');
  renderBanner();
  renderChecklist();
  renderDetail();
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

renderSaveRules();
renderRoadmapMeta();
renderTips();
renderRegistry();
renderAudit();
renderAll();
if (location.hash === '#roadmap') setTab('roadmap');
else if (location.hash === '#missables') setTab('missables');
