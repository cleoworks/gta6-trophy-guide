// Leonida Ledger — offline GTA VI trophy guide and tracker.
//
// What this file does, end to end:
//   - Data: loads the 55 official trophies (name, description, grade) plus an
//     original guide, steps and cited sources for each from
//     data/trophies.json — the only file it ever fetches, from its own folder.
//   - Tracker: each trophy can be ticked off; the earned set is saved in
//     localStorage and restored on the next visit, with export to a JSON
//     file, import back from one, and a full reset.
//   - Finding things: kind filters (story, missable, collectibles,
//     activities, online), a grade filter and name/description search.
//   - Spoiler mode: while it is on, unearned story trophies show neither
//     their names nor their descriptions, in the list or the guide panel.
//   - Roadmap & missables: two extra views built from the same data — a
//     five-stage route to the platinum with save-discipline rules, and a
//     page that gathers every flagged trophy with its warning.
// It never makes a network request beyond that one local data file, so the
// guide works with the network off.
const PROGRESS_KEY = 'leonida-ledger-progress-v1';
const SPOILER_KEY = 'leonida-ledger-spoiler-v1';

const trophyList = document.getElementById('trophyList');
const detailPanel = document.getElementById('detailPanel');
const listMeta = document.getElementById('listMeta');
const emptyNote = document.getElementById('emptyNote');
const progressCount = document.getElementById('progressCount');
const progressPct = document.getElementById('progressPct');
const progressFill = document.getElementById('progressFill');
const progressSub = document.getElementById('progressSub');
const gradeFilter = document.getElementById('gradeFilter');
const searchBox = document.getElementById('searchBox');
const spoilerToggle = document.getElementById('spoilerToggle');

const doc = await loadTrophies();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

let earned = loadProgress();
let spoilerOn = localStorage.getItem(SPOILER_KEY) === 'on';
let kindFilter = 'all';
let selectedId = pickInitialTrophy();

spoilerToggle.checked = spoilerOn;
document.getElementById('missableTabCount').textContent = String(trophies.filter((t) => t.missable).length);

async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error('could not load data/trophies.json');
  return response.json();
}

function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    const names = Array.isArray(raw) ? raw : raw.earned ?? [];
    return new Set(names.filter((n) => byName.has(n)));
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

function pickInitialTrophy() {
  const wanted = Number(new URLSearchParams(location.search).get('trophy'));
  if (byId.has(wanted)) return wanted;
  return 28; // Positive Mental Attitude: the one missable, a good first guide to show.
}

function isSpoilerHidden(trophy) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function formatCount(trophy) {
  if (trophy.count == null) return null;
  if (trophy.id === 52) return '$250,000';
  if (trophy.id === 53) return '$100,000';
  return String(trophy.count);
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

function renderChecklist() {
  const shown = visibleTrophies();
  trophyList.replaceChildren();
  for (const trophy of shown) {
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

    const dot = document.createElement('span');
    dot.className = 'grade-dot ' + trophy.grade;
    dot.title = gradeLabel(trophy.grade);
    li.append(dot);

    const text = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = hidden ? 'Hidden story trophy' : trophy.name;
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = hidden ? 'Earn this story trophy to reveal its name and description.' : trophy.description;
    text.append(name, desc);
    li.append(text);

    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    const gradeTag = document.createElement('span');
    gradeTag.className = 'tag';
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
    const count = formatCount(trophy);
    if (count) {
      const countTag = document.createElement('span');
      countTag.className = 'tag count';
      countTag.textContent = '× ' + count;
      tags.append(countTag);
    }
    li.append(tags);
    trophyList.append(li);
  }
  listMeta.textContent = 'Showing ' + shown.length + ' of ' + trophies.length + ' trophies';
  emptyNote.hidden = shown.length !== 0;
}

function renderDetail() {
  const trophy = byId.get(selectedId) ?? trophies[0];
  detailPanel.replaceChildren();
  const hidden = isSpoilerHidden(trophy);

  const grade = document.createElement('div');
  grade.className = 'detail-grade ' + trophy.grade;
  grade.textContent = gradeLabel(trophy.grade) + ' trophy' + (trophy.hidden ? ' · Hidden on PSN' : '');
  detailPanel.append(grade);

  const title = document.createElement('h2');
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  detailPanel.append(title);

  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = hidden
    ? 'Spoilers are hidden. Earn this trophy — or switch the spoiler setting off — to see its official description and guide.'
    : 'Official description: “' + trophy.description + '”';
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
  detailPanel.append(meta);

  if (hidden) {
    const note = document.createElement('p');
    note.className = 'spoiler-hidden-note';
    note.textContent = 'This is a story trophy. Its name, description and guide stay hidden until you earn it.';
    detailPanel.append(note);
  } else {
    if (trophy.missable && trophy.missableNote) {
      const box = document.createElement('p');
      box.className = 'missable-box';
      const strong = document.createElement('strong');
      strong.textContent = trophy.risk === 'timed' ? 'TIME-SENSITIVE — ' : 'MISSABLE — ';
      box.append(strong, document.createTextNode(trophy.missableNote));
      detailPanel.append(box);
    }
    const guide = document.createElement('p');
    guide.className = 'detail-guide';
    guide.textContent = trophy.guide;
    detailPanel.append(guide);

    if (trophy.steps && trophy.steps.length) {
      const stepsTitle = document.createElement('strong');
      stepsTitle.textContent = 'Steps';
      detailPanel.append(stepsTitle);
      const steps = document.createElement('ol');
      steps.className = 'detail-steps';
      for (const step of trophy.steps) {
        const item = document.createElement('li');
        item.textContent = step;
        steps.append(item);
      }
      detailPanel.append(steps);
    }
  }

  const sources = document.createElement('div');
  sources.className = 'detail-sources';
  const sourcesTitle = document.createElement('strong');
  sourcesTitle.textContent = 'Sources — where each fact comes from';
  sources.append(sourcesTitle);
  const list = document.createElement('ul');
  for (const source of trophy.sources ?? []) {
    const item = document.createElement('li');
    if (source.url) {
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = source.label;
      item.append(link);
    } else {
      item.textContent = source.label;
    }
    list.append(item);
  }
  sources.append(list);
  detailPanel.append(sources);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'primary';
  toggle.textContent = earned.has(trophy.name) ? '✓ Earned — mark not earned' : 'Mark earned';
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

function renderRoadmap() {
  const stageList = document.getElementById('stageList');
  stageList.replaceChildren();
  for (const stage of doc.roadmap ?? []) {
    const card = document.createElement('li');
    card.className = 'stage-card';
    const heading = document.createElement('h3');
    heading.textContent = 'Stage ' + stage.stage + ' — ' + stage.title;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';
    for (const trophy of trophies.filter((t) => t.stage === stage.stage)) {
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
    card.append(heading, text, chips);
    stageList.append(card);
  }
}

function renderMissables() {
  const list = document.getElementById('missableList');
  list.replaceChildren();
  for (const trophy of trophies.filter((t) => t.missable)) {
    const card = document.createElement('article');
    card.className = 'stage-card';
    const heading = document.createElement('h3');
    heading.textContent = (trophy.risk === 'timed' ? 'TIME-SENSITIVE: ' : 'MISSABLE: ') + trophy.name;
    const desc = document.createElement('p');
    desc.textContent = trophy.description;
    const note = document.createElement('p');
    note.className = 'missable-box';
    note.textContent = trophy.missableNote ?? '';
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'chip';
    open.textContent = 'Open full guide →';
    open.addEventListener('click', () => {
      selectTrophy(trophy.id);
      setTab('checklist');
    });
    card.append(heading, desc, note, guide, open);
    list.append(card);
  }
  const done = document.createElement('p');
  done.className = 'roadmap-intro';
  done.textContent = 'That is the whole list: 1 confirmed missable and 1 time-sensitive strand race, per Outputlag’s launch-week guide. The other 53 trophies stay open after the credits — the story mission trophies pop as you finish each mission, and the open-world trophies never close.';
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
  progressSub.textContent =
    'Platinum ' + (byGrade.platinum ?? 0) + '/1 · Gold ' + (byGrade.gold ?? 0) + '/2 · Silver ' +
    (byGrade.silver ?? 0) + '/6 · Bronze ' + (byGrade.bronze ?? 0) + '/46 · 28 hidden';
}

function renderAll() {
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
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a Leonida Ledger progress export.');
  }
}

function toggleSpoiler() {
  spoilerOn = spoilerToggle.checked;
  localStorage.setItem(SPOILER_KEY, spoilerOn ? 'on' : 'off');
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
  if (confirm('Clear all earned trophies in this tracker?')) {
    earned = new Set();
    saveProgress();
    renderAll();
  }
});

renderSaveRules();
renderAll();
if (location.hash === '#roadmap') setTab('roadmap');
else if (location.hash === '#missables') setTab('missables');
