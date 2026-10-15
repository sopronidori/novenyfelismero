/**
 * NÖVÉNYISMERET – PRÓBAVIZSGA (exam.js)
 *
 * TARTALOMJEGYZÉK:
 *  01. Vizsgaszabályok és belső adatok
 *  02. Mentés és betöltés
 *  03. Új vizsga indítása és folytatása
 *  04. Időmérő (30 perc; az oldal bezárása sem állítja meg)
 *  05. Feladatlap és navigáció
 *  06. Leadás és pontozás
 *  07. Részletes hibajegyzék
 *  08. Gombok bekötése és indítás
 *
 * Függőségek: novenyek.js és app.js (data, element, shuffled,
 * isAcceptedAnswer, createNameExtras).
 * A vizsga NEM módosítja a tanulási haladást.
 */

const exam = (() => {
  'use strict';

  // ============================================================
  // 01. VIZSGASZABÁLYOK ÉS BELSŐ ADATOK
  // ============================================================

  const SETTINGS = Object.freeze({
    count: 50,                 // Ennyi különböző növényt kérdez.
    durationMinutes: 30,      // A próbavizsga időtartama.
    pointsPerHungarian: 1,    // Magyar név pontértéke.
    pointsPerLatin: 1,        // Tudományos név pontértéke.
    saveKey: 'novenyismeret_probavizsga_v1',
  });

  const MAX_POINTS = SETTINGS.count *
    (SETTINGS.pointsPerHungarian + SETTINGS.pointsPerLatin);

  // Egyetlen vizsga állapota (akkor is visszatölthető, ha frissítjük az oldalt).
  // status: running | finished
  let attempt = null;
  let currentIndex = 0;
  let renderedId = null; // Az éppen valóban megjelenített feladat azonosítója.
  let mistakesOnly = false;
  let timerHandle = null;

  const byId = (id) => element(id);

  function plantForId(id) {
    return data.find((plant) => plant.id === id);
  }

  function answerFor(id) {
    return attempt.answers[id] || { hu: '', la: '' };
  }

  function remainingMilliseconds() {
    return attempt ? Math.max(0, attempt.endsAt - Date.now()) : 0;
  }

  function hasAnswer(answer) {
    return Boolean(String(answer || '').trim());
  }

  function isFullyAnswered(answer) {
    return hasAnswer(answer.hu) && hasAnswer(answer.la);
  }


  // ============================================================
  // 02. MENTÉS ÉS BETÖLTÉS
  // ============================================================

  function saveAttempt() {
    try {
      localStorage.setItem(SETTINGS.saveKey, JSON.stringify(attempt));
    } catch (error) {
      // Privát böngészés / tele tárhely: a teszt ettől még működik az aktuális oldalon.
      console.warn('A próbavizsga mentése nem sikerült:', error);
    }
  }

  /** Hibás vagy korábbi verziójú állapotot nem töltünk be. */
  function loadAttempt() {
    try {
      const restored = JSON.parse(localStorage.getItem(SETTINGS.saveKey) || 'null');
      if (!restored || restored.version !== 1) return null;
      if (!['running', 'finished'].includes(restored.status)) return null;
      if (!Array.isArray(restored.ids) || restored.ids.length !== SETTINGS.count) return null;
      if (new Set(restored.ids).size !== SETTINGS.count) return null;
      if (!restored.ids.every((id) => Number.isInteger(id) && plantForId(id))) return null;
      if (!restored.answers || typeof restored.answers !== 'object') return null;
      if (!Number.isFinite(restored.startedAt) || !Number.isFinite(restored.endsAt)) return null;
      if (restored.endsAt <= restored.startedAt) return null;
      return restored;
    } catch (error) {
      return null;
    }
  }


  // ============================================================
  // 03. ÚJ VIZSGA INDÍTÁSA ÉS FOLYTATÁSA
  // ============================================================

  function showScreen(screen) {
    byId('examIntro').classList.toggle('hidden', screen !== 'intro');
    byId('examInProgress').classList.toggle('hidden', screen !== 'running');
    byId('examResults').classList.toggle('hidden', screen !== 'finished');
  }

  function start() {
    if (attempt && attempt.status === 'running') {
      if (!confirm('A folyamatban lévő próbavizsga elvész. Biztosan újat kezdesz?')) return;
    }

    if (data.length < SETTINGS.count) {
      alert('Nincs elég növény az 50 feladatos próbavizsgához.');
      return;
    }

    const now = Date.now();
    attempt = {
      version: 1,
      status: 'running',
      ids: shuffled(data).slice(0, SETTINGS.count).map((plant) => plant.id),
      startedAt: now,
      endsAt: now + SETTINGS.durationMinutes * 60 * 1000,
      finishedAt: null,
      finishReason: null,
      answers: {},
    };
    currentIndex = 0;
    renderedId = null;
    mistakesOnly = false;
    saveAttempt();
    showScreen('running');
    renderQuestion();
    startClock();
  }

  /** Fül megnyitásakor folytatjuk a futó vizsgát, vagy megmutatjuk az eredményt. */
  function open() {
    if (!attempt) {
      showScreen('intro');
      return;
    }
    if (attempt.status === 'running') {
      if (checkTimeLimit()) return;
      showScreen('running');
      renderQuestion();
      startClock();
    } else {
      showScreen('finished');
      renderResults();
    }
  }


  // ============================================================
  // 04. IDŐMÉRŐ
  // ============================================================

  function renderClock() {
    if (!attempt || attempt.status !== 'running') return;
    const seconds = Math.ceil(remainingMilliseconds() / 1000);
    const minutesPart = Math.floor(seconds / 60);
    const secondsPart = String(seconds % 60).padStart(2, '0');
    byId('examTimer').textContent = `${String(minutesPart).padStart(2, '0')}:${secondsPart}`;
    byId('examTimer').classList.toggle('urgent', seconds <= 300);
  }

  /** Minden alkalommal valódi, eltelt idő alapján ellenőrzünk. */
  function checkTimeLimit() {
    if (attempt && attempt.status === 'running' && remainingMilliseconds() === 0) {
      finish('timeout');
      return true;
    }
    return false;
  }

  function startClock() {
    stopClock();
    renderClock();
    timerHandle = window.setInterval(() => {
      if (!checkTimeLimit()) renderClock();
    }, 500);
  }

  function stopClock() {
    if (timerHandle !== null) window.clearInterval(timerHandle);
    timerHandle = null;
  }


  // ============================================================
  // 05. FELADATLAP ÉS NAVIGÁCIÓ
  // ============================================================

  function saveCurrentInputs() {
    if (!attempt || attempt.status !== 'running') return;
    const id = attempt.ids[currentIndex];
    // Újratöltés után, ha közben lejárt az idő, ne írjunk felül egy korábbi
    // választ a még üres, sosem megjelenített beviteli mezőkkel.
    if (renderedId !== id) return;
    attempt.answers[id] = {
      hu: byId('examHu').value,
      la: byId('examLa').value,
    };
    saveAttempt();
  }

  function updateAnsweredCount() {
    if (!attempt || attempt.status !== 'running') return;
    const complete = attempt.ids.filter((id) => isFullyAnswered(answerFor(id))).length;
    byId('examAnswered').textContent = `Mindkét név kitöltve: ${complete} / ${SETTINGS.count}`;
    byId('examProgressBar').value = complete;
  }

  function renderNavigation() {
    const container = byId('examNavigator');
    container.replaceChildren();

    attempt.ids.forEach((id, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(index + 1);
      button.title = `${index + 1}. feladat`;
      button.setAttribute('aria-label', `${index + 1}. feladat megnyitása`);
      const answer = answerFor(id);
      if (isFullyAnswered(answer)) button.classList.add('answered');
      else if (hasAnswer(answer.hu) || hasAnswer(answer.la)) button.classList.add('partial');
      if (index === currentIndex) {
        button.classList.add('current');
        button.setAttribute('aria-current', 'step');
      }
      button.addEventListener('click', () => goTo(index));
      container.append(button);
    });
  }

  function renderQuestion() {
    if (!attempt || attempt.status !== 'running') return;
    if (checkTimeLimit()) return;

    const id = attempt.ids[currentIndex];
    const plant = plantForId(id);
    const answer = answerFor(id);

    byId('examPosition').textContent = `${currentIndex + 1} / ${SETTINGS.count}`;
    byId('examImage').src = plant.img;
    byId('examImage').alt = `${currentIndex + 1}. felismerendő növény`;
    byId('examHu').value = answer.hu || '';
    byId('examLa').value = answer.la || '';
    renderedId = id;
    byId('examPrev').disabled = currentIndex === 0;
    byId('examNext').disabled = currentIndex === SETTINGS.count - 1;

    updateAnsweredCount();
    renderNavigation();
    renderClock();
  }

  function goTo(index) {
    if (!attempt || attempt.status !== 'running') return;
    if (checkTimeLimit()) return;
    if (index < 0 || index >= SETTINGS.count) return;
    saveCurrentInputs();
    currentIndex = index;
    renderQuestion();
  }

  /** Írás közben is mentjük a választ, még fül- és feladatváltás előtt. */
  function onInput() {
    if (checkTimeLimit()) return;
    saveCurrentInputs();
    updateAnsweredCount();
    renderNavigation();
  }


  // ============================================================
  // 06. LEADÁS ÉS PONTOZÁS
  // ============================================================

  function scoreItem(id) {
    const plant = plantForId(id);
    const answer = answerFor(id);
    const huCorrect = isAcceptedAnswer(plant, 'hu', answer.hu);
    const laCorrect = isAcceptedAnswer(plant, 'la', answer.la);
    return {
      id, plant, answer, huCorrect, laCorrect,
      points: Number(huCorrect) * SETTINGS.pointsPerHungarian +
        Number(laCorrect) * SETTINGS.pointsPerLatin,
    };
  }

  function calculateResults() {
    const items = attempt.ids.map(scoreItem);
    const huPoints = items.filter((item) => item.huCorrect).length * SETTINGS.pointsPerHungarian;
    const laPoints = items.filter((item) => item.laCorrect).length * SETTINGS.pointsPerLatin;
    const score = huPoints + laPoints;
    return { items, huPoints, laPoints, score, mistakes: items.filter((item) => item.points < 2).length };
  }

  function finish(reason = 'submitted') {
    if (!attempt || attempt.status !== 'running') return;

    // Az utolsó éppen szerkesztett válasz sem veszhet el.
    saveCurrentInputs();
    attempt.status = 'finished';
    attempt.finishedAt = Date.now();
    attempt.finishReason = reason;
    saveAttempt();
    stopClock();
    showScreen('finished');
    mistakesOnly = false;
    renderResults();
  }

  function submit() {
    if (!attempt || attempt.status !== 'running') return;
    if (checkTimeLimit()) return;
    saveCurrentInputs();
    const missing = attempt.ids.filter((id) => !isFullyAnswered(answerFor(id))).length;
    const note = missing > 0
      ? `Még ${missing} feladatnál nincs kitöltve mindkét név. `
      : '';
    if (confirm(`${note}Biztosan leadod a próbavizsgát? Leadás után nem módosíthatod a válaszokat.`)) {
      finish('submitted');
    }
  }


  // ============================================================
  // 07. RÉSZLETES HIBAJEGYZÉK
  // ============================================================

  function make(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (value !== undefined) node.textContent = String(value);
    return node;
  }

  function answerRow(label, given, correct, isCorrect, points) {
    const row = make('div', 'exam-answer-pair');
    const title = make('div', 'exam-answer-label', `${label} (${points} pont)`);
    const provided = make('div', isCorrect ? 'answer-ok' : 'answer-wrong',
      `${isCorrect ? '✓' : '✗'} Beírt válasz: ${hasAnswer(given) ? given : '— (üres)'}`);
    const solution = make('div', 'exam-correct-answer', `Helyes: ${correct}`);
    row.append(title, provided, solution);
    return row;
  }

  function createReviewItem(item, index) {
    const row = make('article', 'exam-review-item');

    const head = make('div', 'exam-review-head');
    const image = document.createElement('img');
    image.src = item.plant.img;
    image.alt = `${index + 1}. vizsgakérdés képe`;
    image.loading = 'lazy';

    const details = make('div', 'exam-review-details');
    const heading = make('h4', '', `${index + 1}. feladat – ${item.points}/2 pont`);
    const status = make('div', item.points === 2 ? 'answer-ok' : 'answer-wrong',
      item.points === 2 ? '✓ Mindkét név helyes' : '✗ Van javítandó válasz');
    details.append(heading, status);
    head.append(image, details);

    row.append(head,
      answerRow('Magyar név', item.answer.hu, item.plant.hu, item.huCorrect, Number(item.huCorrect)),
      answerRow('Tudományos név', item.answer.la, item.plant.la, item.laCorrect, Number(item.laCorrect)));

    // A fő megnevezés és UA./ELFOGADHATÓ címkék itt is ugyanúgy jelennek meg.
    const extras = createNameExtras(item.plant);
    if (extras) row.append(extras);
    return row;
  }

  function renderReview() {
    const result = calculateResults();
    const shown = mistakesOnly ? result.items.filter((item) => item.points < 2) : result.items;
    const container = byId('examReview');
    container.replaceChildren();

    const toggle = byId('examMistakesOnly');
    toggle.textContent = mistakesOnly ? 'Összes feladat mutatása' : `Csak a hibák mutatása (${result.mistakes})`;
    toggle.setAttribute('aria-pressed', String(mistakesOnly));

    if (!shown.length) {
      container.append(make('p', 'notice', 'Gratulálunk! Egyetlen hibás válasz sincs.'));
      return;
    }
    // Az index a vizsgán belüli sorszám, nem a 65-ös fajlista sorszáma.
    for (const item of shown) {
      const index = attempt.ids.indexOf(item.id);
      container.append(createReviewItem(item, index));
    }
  }

  function renderResults() {
    const result = calculateResults();
    const box = byId('examSummary');
    box.replaceChildren();

    const title = make('div', 'muted', attempt.finishReason === 'timeout'
      ? 'Lejárt a 30 perc – a rendszer automatikusan leadta a vizsgát.'
      : 'A próbavizsga befejeződött.');
    const total = make('div', 'exam-total', `${result.score} / ${MAX_POINTS} pont`);
    const percentage = make('div', 'exam-percent', `${Math.round(result.score / MAX_POINTS * 100)}%`);
    const split = make('p', '',
      `Növényfelismerés (magyar név): ${result.huPoints}/${SETTINGS.count} pont · ` +
      `Latin név helyesírása: ${result.laPoints}/${SETTINGS.count} pont`);
    const mistakes = make('p', '', `${result.mistakes} feladatban volt legalább egy hiba.`);
    const note = make('p', 'muted',
      'Ez automatikus gyakorlóértékelés: a valódi vizsgán a javítás eltérhet.');
    box.append(title, total, percentage, split, mistakes, note);
    renderReview();
  }


  // ============================================================
  // 08. GOMBOK BEKÖTÉSE ÉS INDÍTÁS
  // ============================================================

  function connectEvents() {
    byId('examStart').addEventListener('click', start);
    byId('examRestart').addEventListener('click', start);
    byId('examPrev').addEventListener('click', () => goTo(currentIndex - 1));
    byId('examNext').addEventListener('click', () => goTo(currentIndex + 1));
    byId('examFinish').addEventListener('click', submit);
    byId('examHu').addEventListener('input', onInput);
    byId('examLa').addEventListener('input', onInput);
    byId('examMistakesOnly').addEventListener('click', () => {
      mistakesOnly = !mistakesOnly;
      renderReview();
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && attempt && attempt.status === 'running') {
        if (!checkTimeLimit()) renderClock();
      }
    });
    window.addEventListener('focus', () => {
      if (attempt && attempt.status === 'running') {
        if (!checkTimeLimit()) renderClock();
      }
    });
  }

  attempt = loadAttempt();
  connectEvents();

  // Az idő akkor is letelik, ha a felhasználó először másik fülre lép.
  if (attempt && attempt.status === 'running') {
    if (!checkTimeLimit()) startClock();
  }

  return { open };
})();
