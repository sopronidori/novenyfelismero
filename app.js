/**
 * NÖVÉNYISMERET – ALKALMAZÁS
 *
 * TARTALOMJEGYZÉK (Ctrl+F-fel kereshető):
 *  01. Beállítások és alkalmazásállapot
 *  02. Segédfüggvények
 *  03. Haladás mentése és szűrések
 *  04. Gyakorlás
 *  05. Növénylista
 *  06. Tanulókártyák
 *  07. Lapfülek és eseménykezelők
 *  08. Haladás importálása / exportálása
 *  09. Próbavizsga fül bekötése (exam.js)
 *  10. Indítás
 *
 * A növénynevek a novenyek.js-ben, a színek a style.css-ben vannak.
 */

// ============================================================
// 01. BEÁLLÍTÁSOK ÉS ALKALMAZÁSÁLLAPOT
// ============================================================

// NE módosítsd: ez a régi változat mentéseivel is kompatibilis.
const STORAGE_KEY = 'novenyismeret_progress_v3';

let progress = loadProgress();
let currentPlant = null;
let previousPlantId = null;

let cardDeck = [];
let cardIndex = 0;
let cardRevealed = false;


// ============================================================
// 02. SEGÉDFÜGGVÉNYEK
// ============================================================

/** HTML-elem lekérése az id alapján. */
function element(id) {
  return document.getElementById(id);
}

/** Ékezet- és kis/nagybetű-független összehasonlítás. */
function normalizeName(value) {
  return String(value || '')
    .toLocaleLowerCase('hu-HU')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘´`]/g, "'")
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A fő név és a jegyzékben kifejezetten elfogadott névváltozatok. */
function acceptedNames(plant, language) {
  return [plant[language], ...((plant.alternatives || {})[language] || [])];
}

/** Akkor helyes, ha a válasz a fő névvel vagy egy elfogadott változattal egyezik. */
function isAcceptedAnswer(plant, language, answer) {
  const typed = normalizeName(answer);
  return typed.length > 0 && acceptedNames(plant, language)
    .some((name) => normalizeName(name) === typed);
}

/**
 * Kiegészítő névváltozatok megjelenítése.
 * A címke a novenyek.js alternativeLabel mezőjéből származik:
 * UA. (ugyanaz) / ELFOGADHATÓ / V. (másik megnevezés).
 * A fő név ettől külön marad, a megjegyzéseket sem duplázzuk.
 */
function createNameExtras(plant) {
  const alternatives = plant.alternatives || {};
  const rows = [
    ...(alternatives.hu || []).map((name) => ({ name, language: 'magyar' })),
    ...(alternatives.la || []).map((name) => ({ name, language: 'tudományos' })),
  ];

  if (!rows.length && !plant.note) return null;

  const container = document.createElement('div');
  container.className = 'name-extras';

  for (const row of rows) {
    const line = document.createElement('div');
    line.className = 'name-extra-row';

    const label = document.createElement('span');
    label.className = 'name-extra-label';
    label.textContent = plant.alternativeLabel || 'ELFOGADHATÓ';

    const text = document.createElement('span');
    text.textContent = `${row.name} (${row.language} névváltozat)`;

    line.append(label, text);
    container.append(line);
  }

  if (plant.note) {
    const note = document.createElement('div');
    note.className = 'name-extra-note';
    note.textContent = `Megjegyzés: ${plant.note}`;
    container.append(note);
  }
  return container;
}

/** Véletlen elem egy listából. */
function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

/** Fisher–Yates keverés, az eredeti lista módosítása nélkül. */
function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}


// ============================================================
// 03. HALADÁS MENTÉSE ÉS SZŰRÉSEK
// ============================================================

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
  } catch (error) {
    return {};
  }
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    alert('A böngésző nem engedi a mentést. A haladást exportálhatod fájlba.');
  }
}

/** Egy növény magyar (hu) és latin (la) tanultsága. */
function plantProgress(id) {
  return progress[id] || { hu: false, la: false };
}

/** A megadott tanulási módban megtanult-e a növény? */
function isLearned(plant, mode) {
  const learned = plantProgress(plant.id);
  if (mode === 'hu') return Boolean(learned.hu);
  if (mode === 'la') return Boolean(learned.la);
  return Boolean(learned.hu && learned.la);
}

/** Szűrés: aktív, összes, vagy megtanult növények. */
function plantsInPool(mode, pool) {
  return data.filter((plant) => {
    if (pool === 'all') return true;
    const learned = isLearned(plant, mode);
    return pool === 'learned' ? learned : !learned;
  });
}

function learningStats() {
  return {
    hungarian: data.filter((plant) => plantProgress(plant.id).hu).length,
    latin: data.filter((plant) => plantProgress(plant.id).la).length,
    both: data.filter((plant) => isLearned(plant, 'both')).length,
  };
}

function updateStats() {
  const stats = learningStats();
  const available = plantsInPool(element('mode').value, element('pool').value);
  const total = data.length;

  element('stats').textContent =
    `Magyar név megtanulva: ${stats.hungarian}/${total} • ` +
    `Latin név megtanulva: ${stats.latin}/${total} • ` +
    `Mindkettő: ${stats.both}/${total}`;

  element('progress').textContent =
    `Gyakorolható növények ebben a módban: ${available.length} • ` +
    `Mindkét név megtanulva: ${stats.both}/${total}`;
}

/** Megtanult jelölés ki-/bekapcsolása. */
function toggleLearned(id, language) {
  const learned = { ...plantProgress(id) };
  learned[language] = !learned[language];
  progress[id] = learned;
  saveProgress();
  updateStats();

  if (currentPlant && currentPlant.id === id) renderQuizQuestion();
  if (!element('listing').classList.contains('hidden')) renderPlantList();
}


// ============================================================
// 04. GYAKORLÁS
// ============================================================

function nextQuestion() {
  const choices = plantsInPool(element('mode').value, element('pool').value);
  updateStats();

  element('empty').classList.toggle('hidden', choices.length > 0);
  element('question').classList.toggle('hidden', choices.length === 0);

  if (choices.length === 0) {
    currentPlant = null;
    return;
  }

  // Ha lehet, ne ugyanazt a növényt kapjuk kétszer egymás után.
  const freshChoices = choices.filter((plant) => plant.id !== previousPlantId);
  currentPlant = randomItem(freshChoices.length ? freshChoices : choices);
  previousPlantId = currentPlant.id;

  element('plantImg').src = currentPlant.img;
  element('plantImg').alt = `A(z) ${currentPlant.id}. számú növény képe`;
  element('qNumber').textContent = `Kép sorszáma a tananyagban: ${currentPlant.id}`;
  element('huAnswer').value = '';
  element('laAnswer').value = '';
  element('feedback').classList.add('hidden');

  renderQuizQuestion();
}

function renderQuizQuestion() {
  const mode = element('mode').value;
  element('huLabel').classList.toggle('hidden', mode === 'la');
  element('huAnswer').classList.toggle('hidden', mode === 'la');
  element('latinBox').classList.toggle('hidden', mode === 'hu');

  if (!currentPlant) return;

  const learned = plantProgress(currentPlant.id);
  element('markHu').textContent = learned.hu
    ? '↩ Magyar visszatanulásra'
    : '✓ Magyar név megtanulva';
  element('markLa').textContent = learned.la
    ? '↩ Latin visszatanulásra'
    : '✓ Latin név megtanulva';
}

function showQuizAnswer(checkAnswers) {
  if (!currentPlant) return;

  const mode = element('mode').value;
  const messages = [];

  if (checkAnswers) {
    if (mode !== 'la') {
      const correct = isAcceptedAnswer(currentPlant, 'hu', element('huAnswer').value);
      messages.push(`Magyar: ${correct ? '✓ helyes' : '✗ eltér a fő névtől'}`);
    }
    if (mode !== 'hu') {
      const correct = isAcceptedAnswer(currentPlant, 'la', element('laAnswer').value);
      messages.push(`Latin: ${correct ? '✓ helyes' : '✗ eltér a fő névtől'}`);
    }
  }

  const feedback = element('feedback');
  feedback.replaceChildren();

  if (messages.length) {
    const checks = document.createElement('div');
    checks.textContent = messages.join('\n');
    feedback.append(checks);
  }

  const solution = document.createElement('div');
  solution.className = 'primary-answer';
  solution.textContent = `FŐ MEGOLDÁS: ${currentPlant.hu} — ${currentPlant.la}`;
  feedback.append(solution);

  const extras = createNameExtras(currentPlant);
  if (extras) feedback.append(extras);
  feedback.classList.remove('hidden');
}


// ============================================================
// 05. NÖVÉNYLISTA
// ============================================================

function plantMatchesListFilter(plant, filter, search) {
  const learned = plantProgress(plant.id);
  const matchesStatus =
    filter === 'all' ||
    (filter === 'done' && learned.hu && learned.la) ||
    (filter === 'partial' && learned.hu !== learned.la) ||
    (filter === 'todo' && !learned.hu && !learned.la);

  const matchesSearch =
    normalizeName(plant.hu).includes(search) ||
    normalizeName(plant.la).includes(search) ||
    acceptedNames(plant, 'hu').some((name) => normalizeName(name).includes(search)) ||
    acceptedNames(plant, 'la').some((name) => normalizeName(name).includes(search)) ||
    String(plant.id) === search;

  return matchesStatus && matchesSearch;
}

function createLearnedButton(plant, language) {
  const button = document.createElement('button');
  const learned = plantProgress(plant.id)[language];
  button.className = 'secondary small';
  button.style.margin = '5px 5px 0 0';
  button.textContent = `${learned ? '✓' : '○'} ${language === 'hu' ? 'Magyar' : 'Latin'}`;
  button.onclick = () => toggleLearned(plant.id, language);
  return button;
}

function createPlantListItem(plant) {
  const row = document.createElement('div');
  row.className = 'item';

  const image = document.createElement('img');
  image.className = 'thumb';
  image.src = plant.img;
  image.alt = `Növény ${plant.id}`;
  image.loading = 'lazy';

  const content = document.createElement('div');
  content.className = 'grow';

  const name = document.createElement('div');
  name.textContent = `${plant.id}. ${plant.hu}`;
  name.style.fontWeight = '700';

  const latin = document.createElement('div');
  latin.className = 'muted';
  latin.textContent = plant.la;

  const buttons = document.createElement('div');
  buttons.append(createLearnedButton(plant, 'hu'), createLearnedButton(plant, 'la'));
  const extras = createNameExtras(plant);
  content.append(name, latin);
  if (extras) content.append(extras);
  content.append(buttons);
  row.append(image, content);
  return row;
}

function renderPlantList() {
  updateStats();
  const filter = element('filter').value;
  const search = normalizeName(element('search').value);
  const matches = data.filter((plant) => plantMatchesListFilter(plant, filter, search));
  const container = element('items');

  container.replaceChildren();
  for (const plant of matches) container.append(createPlantListItem(plant));
  if (matches.length === 0) container.textContent = 'Nincs találat.';
}


// ============================================================
// 06. TANULÓKÁRTYÁK
// ============================================================

function cardCandidates() {
  return plantsInPool(element('cardMode').value, element('cardPool').value);
}

function buildCardDeck() {
  cardDeck = shuffled(cardCandidates());
  cardIndex = 0;
  renderCard();
}

function renderCard() {
  const hasCards = cardDeck.length > 0;
  element('cardEmpty').classList.toggle('hidden', hasCards);
  element('cardContent').classList.toggle('hidden', !hasCards);
  element('cardCount').textContent = hasCards
    ? `${cardIndex + 1} / ${cardDeck.length} kártya`
    : '0 kártya';

  if (!hasCards) return;

  const plant = cardDeck[cardIndex];
  const mode = element('cardMode').value;
  const learned = plantProgress(plant.id);
  cardRevealed = false;

  element('cardImg').src = plant.img;
  element('cardImg').alt = `${plant.id}. növény képe`;
  element('cardNumber').textContent = `Tananyag sorszáma: ${plant.id}`;
  const cardSolution = element('cardSolution');
  cardSolution.replaceChildren();

  // A fő név és a névváltozatok KÜLÖN elemként jelennek meg.
  // Így a tanulókártyán is egyértelmű, melyik a vizsgajegyzék fő megnevezése.
  const mainLabel = document.createElement('div');
  mainLabel.className = 'main-name-label';
  mainLabel.textContent = 'FŐ MEGNEVEZÉS';

  const mainAnswer = document.createElement('div');
  mainAnswer.className = 'primary-answer';
  mainAnswer.textContent = (mode === 'la' ? '' : plant.hu) +
    (mode === 'both' ? '\n' : '') +
    (mode === 'hu' ? '' : plant.la);
  cardSolution.append(mainLabel, mainAnswer);

  // Az UA. / ELFOGADHATÓ változatok és megjegyzések a fő név ALATT vannak.
  const extras = createNameExtras(plant);
  if (extras) cardSolution.append(extras);
  cardSolution.classList.add('hidden');
  element('cardHint').classList.remove('hidden');
  element('cardImg').classList.remove('hidden');

  element('cardHu').textContent = learned.hu
    ? '↩ Magyar visszatanulásra'
    : '✓ Magyar megtanulva';
  element('cardLa').textContent = learned.la
    ? '↩ Latin visszatanulásra'
    : '✓ Latin megtanulva';
  element('cardHu').classList.toggle('hidden', mode === 'la');
  element('cardLa').classList.toggle('hidden', mode === 'hu');
}

function flipCard() {
  if (!cardDeck.length) return;
  cardRevealed = !cardRevealed;
  element('cardSolution').classList.toggle('hidden', !cardRevealed);
  element('cardHint').classList.toggle('hidden', cardRevealed);
  element('cardImg').classList.toggle('hidden', cardRevealed);
}

function moveCard(step) {
  if (!cardDeck.length) return;
  cardIndex = (cardIndex + step + cardDeck.length) % cardDeck.length;
  renderCard();
}

function markCurrentCard(language) {
  if (!cardDeck.length) return;
  const plant = cardDeck[cardIndex];
  toggleLearned(plant.id, language);

  // Ha a jelölés miatt kikerült a kiválasztott halmazból,
  // a kártyapakliból is távolítsuk el.
  const allowedIds = new Set(cardCandidates().map((candidate) => candidate.id));
  if (!allowedIds.has(plant.id)) {
    cardDeck.splice(cardIndex, 1);
    if (cardIndex >= cardDeck.length) cardIndex = 0;
  }
  renderCard();
}


// ============================================================
// 07. LAPFÜLEK ÉS ESEMÉNYKEZELŐK
// ============================================================

function showTab(which) {
  element('quiz').classList.toggle('hidden', which !== 'quiz');
  element('listing').classList.toggle('hidden', which !== 'list');
  element('cards').classList.toggle('hidden', which !== 'cards');
  element('exam').classList.toggle('hidden', which !== 'exam');

  element('quizTab').className = which === 'quiz' ? '' : 'secondary';
  element('listTab').className = which === 'list' ? '' : 'secondary';
  element('cardsTab').className = which === 'cards' ? '' : 'secondary';
  element('examTab').className = which === 'exam' ? '' : 'secondary';

  if (which === 'list') renderPlantList();
  else if (which === 'cards') buildCardDeck();
  else if (which === 'exam') exam.open();
  else updateStats();
}

function connectEvents() {
  // Felső menü
  element('quizTab').onclick = () => showTab('quiz');
  element('cardsTab').onclick = () => showTab('cards');
  element('examTab').onclick = () => showTab('exam');
  element('listTab').onclick = () => showTab('list');

  // Gyakorlás
  element('mode').onchange = nextQuestion;
  element('pool').onchange = nextQuestion;
  element('next').onclick = nextQuestion;
  element('check').onclick = () => showQuizAnswer(true);
  element('show').onclick = () => showQuizAnswer(false);
  element('markHu').onclick = () => currentPlant && toggleLearned(currentPlant.id, 'hu');
  element('markLa').onclick = () => currentPlant && toggleLearned(currentPlant.id, 'la');

  // Növénylista
  element('filter').onchange = renderPlantList;
  element('search').oninput = renderPlantList;

  // Tanulókártyák
  element('cardMode').onchange = buildCardDeck;
  element('cardPool').onchange = buildCardDeck;
  element('flipCard').onclick = flipCard;
  element('cardPrev').onclick = () => moveCard(-1);
  element('cardNext').onclick = () => moveCard(1);
  element('cardShuffle').onclick = buildCardDeck;
  element('cardHu').onclick = () => markCurrentCard('hu');
  element('cardLa').onclick = () => markCurrentCard('la');

  // Mentés, betöltés, visszaállítás
  element('reset').onclick = resetProgress;
  element('export').onclick = exportProgress;
  element('importBtn').onclick = () => element('importFile').click();
  element('importFile').onchange = importProgress;
}


// ============================================================
// 08. HALADÁS IMPORTÁLÁSA / EXPORTÁLÁSA
// ============================================================

function resetProgress() {
  if (!confirm('Biztosan törlöd az összes megtanult jelölést?')) return;
  progress = {};
  saveProgress();
  renderPlantList();
}

function exportProgress() {
  const content = JSON.stringify({ version: 1, progress }, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const download = document.createElement('a');
  download.href = URL.createObjectURL(blob);
  download.download = 'novenyismeret-haladas.json';
  download.click();
  setTimeout(() => URL.revokeObjectURL(download.href), 1000);
}

async function importProgress(event) {
  const input = event.target;
  const file = input.files[0];
  if (!file) return;

  try {
    const imported = JSON.parse(await file.text());
    if (!imported.progress || typeof imported.progress !== 'object' || Array.isArray(imported.progress)) {
      throw new Error('Hibás formátum');
    }

    // Csak a tananyagban szereplő növényeket és logikai jelöléseket fogadjuk el.
    const validProgress = {};
    for (const plant of data) {
      const entry = imported.progress[plant.id];
      if (entry && typeof entry === 'object') {
        validProgress[plant.id] = {
          hu: entry.hu === true,
          la: entry.la === true,
        };
      }
    }

    if (confirm('Felülírod a jelenlegi haladást a fájlban található adatokkal?')) {
      progress = validProgress;
      saveProgress();
      renderPlantList();
    }
  } catch (error) {
    alert(`Nem sikerült betölteni: ${error.message}`);
  }

  input.value = '';
}


// ============================================================
// 09. INDÍTÁS
// ============================================================

connectEvents();
nextQuestion();
