import { defaults, normalize, grades, categories, extraCategories, contributions } from './grades.js?v=accessibility-1';

const translations = {
  es: {
    title: 'Calculadora de calificaciones',
    breakdown: 'Cómo se calcula', contribution: 'Aporta', points: 'puntos', activeWeight: 'Peso activo', excluded: 'No se incluye', noMinimum: 'Sin mínimo establecido', meetsMinimum: 'Alcanza el mínimo', belowMinimum: 'Por debajo del mínimo antes del ajuste', minimumApplied: 'Mínimo aplicado', calculated: 'Calificación calculada', adjustment: 'Ajuste al mínimo', weightInput: 'Peso relativo', exam: 'Examen', book: 'Trabajos del libro', bookShort: 'Libro',
    questionCount: 'Total de preguntas del examen', correctAnswers: 'Aciertos obtenidos',
    minimumExamGrade: 'Calificación mínima del examen',
    viewResult: 'Ver resultado', collapse: 'Minimizar', expand: 'Expandir', minimumFinalGrade: 'Calificación final mínima', classwork: 'Trabajo en clase', writing: 'Escritura', speaking: 'Expresión oral', listening: 'Comprensión auditiva', reading: 'Lectura',
    include: 'Incluir en la evaluación', grade: 'Calificación (0–10)', weightHelp: 'Los pesos activos se ajustan automáticamente al 100%.', noCategories: 'Activa una categoría con peso mayor que 0 para calcular.',
    assignmentCount: 'Total de trabajos asignados', submittedAssignments: 'Trabajos entregados',
    examGrade: 'Calificación del examen', bookGrade: 'Calificación del libro',
    weights: 'Porcentaje de evaluación', examWeight: 'Porcentaje del examen',
    finalGrade: 'Calificación final', scale: 'Escala de 0 a 10',
    reset: 'Reiniciar', copy: 'Copiar resultado', copied: 'Resultado copiado',
    darkMode: 'Modo oscuro', useDark: 'Cambiar al modo oscuro', useLight: 'Cambiar al modo claro',
    resetDone: 'Valores restablecidos', manualCopy: 'Selecciona y copia el resultado de abajo.',
    oneAssignment: '1 trabajo', fiftyAssignments: '50 trabajos',
    example: 'Ejemplo: Si asignaste 12 trabajos y un alumno entregó 9, su calificación del libro será 7.50. Si entregó los 12, obtiene 10.'
  },
  en: {
    title: 'Grade calculator',
    breakdown: 'How it is calculated', contribution: 'Contributes', points: 'points', activeWeight: 'Active weight', excluded: 'Not included', noMinimum: 'No minimum set', meetsMinimum: 'Meets minimum', belowMinimum: 'Below minimum before adjustment', minimumApplied: 'Minimum applied', calculated: 'Calculated grade', adjustment: 'Minimum adjustment', weightInput: 'Relative weight', exam: 'Exam', book: 'Book assignments', bookShort: 'Book',
    questionCount: 'Total exam questions', correctAnswers: 'Correct answers',
    minimumExamGrade: 'Minimum exam grade',
    viewResult: 'View result', collapse: 'Minimize', expand: 'Expand', minimumFinalGrade: 'Minimum final grade', classwork: 'Classwork', writing: 'Writing', speaking: 'Speaking', listening: 'Listening', reading: 'Reading',
    include: 'Include in evaluation', grade: 'Grade (0–10)', weightHelp: 'Active weights automatically scale to 100%.', noCategories: 'Enable a category with a weight above 0 to calculate.',
    assignmentCount: 'Total assigned work', submittedAssignments: 'Submitted assignments',
    examGrade: 'Exam grade', bookGrade: 'Book grade',
    weights: 'Evaluation weights', examWeight: 'Exam percentage',
    finalGrade: 'Final grade', scale: 'Scale from 0 to 10',
    reset: 'Reset', copy: 'Copy result', copied: 'Result copied',
    darkMode: 'Dark mode', useDark: 'Switch to dark mode', useLight: 'Switch to light mode',
    resetDone: 'Values reset', manualCopy: 'Select and copy the result below.',
    oneAssignment: '1 assignment', fiftyAssignments: '50 assignments',
    example: 'Example: If you assigned 12 assignments and a student submitted 9, their book grade is 7.50. Submitting all 12 earns a 10.'
  }
};
const element = id => document.getElementById(id);
let state = { ...defaults };
let language = 'es';
try { if (localStorage.getItem('calculatorLanguage') === 'en') language = 'en'; } catch { /* Storage may be disabled. */ }
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let themePreference;
try {
  const saved = localStorage.getItem('calculatorTheme');
  if (saved === 'light' || saved === 'dark') themePreference = saved;
} catch { /* Follow the device theme when storage is unavailable. */ }

function applyTheme() {
  const dark = (themePreference ?? (systemTheme.matches ? 'dark' : 'light')) === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#101623' : '#dce6ed';
  const t = translations[language];
  element('theme-toggle').setAttribute('aria-pressed', String(dark));
  element('theme-toggle').setAttribute('aria-label', t.darkMode);
  element('theme-toggle').title = dark ? t.useLight : t.useDark;
}

element('theme-toggle').addEventListener('click', () => {
  themePreference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('calculatorTheme', themePreference); } catch { /* Keep this session's selection. */ }
  applyTheme();
});
systemTheme.addEventListener('change', applyTheme);
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) document.getAnimations().forEach(animation => animation.cancel());
});

for (const key of extraCategories) {
  const card = document.createElement('section');
  card.className = 'card skill-card';
  card.setAttribute('aria-labelledby', `${key}-title`);
  card.innerHTML = `<h2 id="${key}-title"><span data-i18n="${key}"></span></h2>
    <label class="category-toggle"><span data-i18n="include"></span><input id="${key}Enabled" type="checkbox" role="switch"></label>
    <fieldset id="${key}-fields"><label for="${key}Grade" data-i18n="grade"></label>
    <input id="${key}Grade" type="number" min="0" max="10" step="0.1" inputmode="decimal" value="0">
    <input id="${key}Grade-slider" type="range" min="0" max="10" step="0.1" value="0" data-label="grade"></fieldset>`;
  document.querySelector('.grid').append(card);
}
// Small vector emblems stay crisp at every zoom level and in both themes.
const cardIcons = {
  exam: { color: '#318cd0', pale: '#d4f0ff', art: '<path d="M14 8h16l8 8v24a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4Z"/><path d="M30 8v8h8" class="icon-detail"/><path d="m21 29 4 4 9-11" class="icon-detail"/>' },
  book: { color: '#158a88', pale: '#c1f4e9', art: '<path d="M24 13C18 8 10 8 5 11v27c7-3 13-1 19 3 6-4 12-6 19-3V11c-5-3-13-3-19 2Z"/><path d="M24 14v26M10 17c4-1 7 0 10 2m8 0c3-2 6-3 10-2" class="icon-detail"/>' },
  classwork: { color: '#c47722', pale: '#ffdfaa', art: '<rect x="10" y="10" width="29" height="34" rx="5"/><rect x="17" y="6" width="15" height="8" rx="3" class="icon-front"/><path d="m17 25 3 3 5-6m-8 14h15" class="icon-detail"/>' },
  writing: { color: '#7060c5', pale: '#e7dbff', art: '<path d="m10 32 23-23a4 4 0 0 1 6 0l2 2a4 4 0 0 1 0 6L18 40l-11 3 3-11Z"/><path d="m28 14 9 9M10 32l8 8" class="icon-detail"/>' },
  speaking: { color: '#b34f82', pale: '#ffd9eb', art: '<rect x="18" y="6" width="14" height="25" rx="7"/><path d="M12 24a13 13 0 0 0 26 0M25 37v7m-7 0h14" class="icon-detail"/>' },
  listening: { color: '#277cab', pale: '#cbf1ff', art: '<path d="M7 29v-5a17 17 0 0 1 34 0v5" class="icon-detail"/><rect x="5" y="25" width="10" height="17" rx="5"/><rect x="33" y="25" width="10" height="17" rx="5"/>' },
  reading: { color: '#438b54', pale: '#d8f5bd', art: '<rect x="11" y="6" width="28" height="37" rx="5"/><path d="M29 7v14l-5-4-5 4V7" class="icon-front"/><path d="M18 31h14m-14 6h10" class="icon-detail"/>' },
  weight: { color: '#4f75b8', pale: '#dceaff', art: '<rect x="7" y="26" width="8" height="16" rx="4"/><rect x="20" y="17" width="8" height="25" rx="4"/><rect x="33" y="7" width="8" height="35" rx="4"/>' },
  final: { color: '#078e69', pale: '#beffe5', art: '<path d="M14 7h17l8 8v24a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4Z"/><path d="M19 18h9m-9 7h9" class="icon-detail"/><path d="m23 34 6 6 13-15" class="icon-check"/>' }
};
for (const [key, { color, pale, art }] of Object.entries(cardIcons)) {
  const heading = element(`${key}-title`);
  const icon = document.createElement('span');
  icon.className = 'section-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.style.setProperty('--icon-color', color);
  icon.style.setProperty('--icon-pale', pale);
  icon.innerHTML = `<svg viewBox="0 0 48 48"><defs><linearGradient id="glass-${key}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${pale}"/><stop offset=".55" stop-color="${color}" stop-opacity=".7"/><stop offset="1" stop-color="${pale}"/></linearGradient></defs><g fill="url(#glass-${key})" stroke="${color}" stroke-width="1.4">${art}</g></svg>`;
  const previous = heading.querySelector('.section-icon');
  if (previous) previous.replaceWith(icon); else heading.prepend(icon);
}

for (const key of ['exam', 'book']) {
  const toggle = document.createElement('label');
  toggle.className = 'category-toggle';
  toggle.innerHTML = `<span data-i18n="include"></span><input id="${key}Enabled" type="checkbox" role="switch" checked>`;
  element(`${key}-title`).after(toggle);
}
element('weight-controls').innerHTML = categories.map(key => `<div class="weight-row"><label for="${key}Weight"><span data-i18n="${key}"></span> <strong id="${key}Weight-value"></strong></label><input id="${key}Weight" type="number" min="0" max="100" value="${defaults[`${key}Weight`]}" inputmode="numeric"></div>`).join('');

for (const key of categories) {
  const note = document.createElement('p');
  note.id = `${key}-contribution`;
  note.className = 'contribution';
  element(`${key}-title`).closest('.card').append(note);
}

// Keep the controls in the DOM so minimizing never changes an evaluation.
document.querySelectorAll('.card').forEach(card => {
  const heading = card.querySelector('h2');
  const content = document.createElement('div');
  content.className = 'card-content';
  content.id = `${heading.id}-content`;
  [...card.children].filter(child => child !== heading).forEach(child => content.append(child));
  card.append(content);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'collapse-button';
  button.setAttribute('aria-controls', content.id);
  button.setAttribute('aria-expanded', 'true');
  button.textContent = '−';
  button.addEventListener('click', () => {
    const collapsed = !content.hidden;
    content.hidden = collapsed;
    card.classList.toggle('collapsed', collapsed);
    button.setAttribute('aria-expanded', String(!collapsed));
    button.textContent = collapsed ? '+' : '−';
    updateCollapseLabels();
  });
  card.append(button);
});

function updateCollapseLabels() {
  const t = translations[language];
  document.querySelectorAll('.collapse-button').forEach(button => {
    const title = button.closest('.card').querySelector('h2').textContent;
    const label = `${button.getAttribute('aria-expanded') === 'true' ? t.collapse : t.expand}: ${title}`;
    button.setAttribute('aria-label', label);
    button.title = label;
  });
}

let announcementTimer;
function render(announce = true) {
  state = normalize(state);
  const t = translations[language];
  document.documentElement.lang = language;
  document.title = t.title;
  applyTheme();
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t[node.dataset.i18n]; });
  document.querySelectorAll('[data-label]').forEach(node => { node.setAttribute('aria-label', t[node.dataset.label]); });
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
  for (const key of ['questionCount', 'assignmentCount']) {
    element(key).value = state[key];
    element(`${key}-slider`).value = state[key];
    element(`${key}-total`).textContent = state[key];
  }
  element('minimumExamGrade').value = state.minimumExamGrade;
  for (const [key, total] of [['correctAnswers', 'questionCount'], ['submittedAssignments', 'assignmentCount']]) {
    element(key).max = state[total];
    element(key).value = state[key];
    element(`${key}-value`).textContent = state[key];
    element(key).setAttribute('aria-valuetext', `${state[key]} ${language === 'es' ? 'de' : 'of'} ${state[total]}`);
  }
  element('minimumFinalGrade').value = state.minimumFinalGrade;
  const totalWeight = categories.reduce((sum, key) => sum + (state[`${key}Enabled`] ? state[`${key}Weight`] : 0), 0);
  for (const key of categories) {
    const enabled = state[`${key}Enabled`];
    element(`${key}Enabled`).checked = enabled;
    element(`${key}Enabled`).setAttribute('aria-describedby', `${key}-contribution`);
    element(`${key}Enabled`).setAttribute('aria-label', `${t.include}: ${t[key]}`);
    element(`${key}Weight`).value = state[`${key}Weight`];
    element(`${key}Weight`).disabled = !enabled;
    element(`${key}Weight`).setAttribute('aria-label', `${t[key]}: ${t.weightInput}`);
    element(`${key}Weight`).setAttribute('aria-describedby', `${key}Weight-value`);
    element(`${key}Weight-value`).textContent = `${enabled && totalWeight ? (state[`${key}Weight`] / totalWeight * 100).toFixed(1) : '0'}%`;
    if (extraCategories.includes(key)) {
      element(`${key}-fields`).disabled = !enabled;
      element(`${key}Grade`).value = state[`${key}Grade`];
      element(`${key}Grade`).setAttribute('aria-label', `${t[key]}: ${t.grade}`);
      element(`${key}Grade-slider`).value = state[`${key}Grade`];
      element(`${key}Grade-slider`).setAttribute('aria-label', `${t[key]}: ${t.grade}`);
    } else {
      element(`${key}-title`).closest('section').querySelectorAll('input:not([role="switch"])').forEach(input => { input.disabled = !enabled; });
    }
  }
  element('calculation-note').textContent = totalWeight ? '' : t.noCategories;
  const result = grades(state);
  const rows = contributions(state);
  const calculated = rows.reduce((sum, row) => sum + row.points, 0);
  for (const key of categories) {
    const row = rows.find(row => row.key === key);
    element(`${key}-contribution`).textContent = row
      ? `${t.activeWeight}: ${(row.weight * 100).toFixed(1)}% · ${t.contribution} ${row.points.toFixed(2)} / 10 ${t.points}`
      : t.excluded;
  }
  const finalStatus = !totalWeight ? t.noCategories : state.minimumFinalGrade === 0 ? t.noMinimum
    : calculated < state.minimumFinalGrade ? `${t.belowMinimum} · ${t.minimumApplied}: ${state.minimumFinalGrade.toFixed(2)}` : t.meetsMinimum;
  const rawExam = state.correctAnswers / state.questionCount * 10;
  element('exam-status').textContent = !state.examEnabled ? t.excluded : state.minimumExamGrade === 0 ? t.noMinimum
    : rawExam < state.minimumExamGrade ? `${t.belowMinimum} · ${t.calculated}: ${rawExam.toFixed(2)} · ${t.minimumApplied}: ${state.minimumExamGrade.toFixed(2)}` : t.meetsMinimum;
  element('grade-status').textContent = finalStatus;
  element('pinned-status').textContent = totalWeight && calculated < state.minimumFinalGrade ? t.minimumApplied : t.viewResult;
  element('grade-breakdown').replaceChildren(...rows.map(row => {
    const line = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = t[row.key];
    const detail = document.createElement('span');
    detail.textContent = `${row.score.toFixed(2)} × ${(row.weight * 100).toFixed(1)}% = ${row.points.toFixed(2)}`;
    line.append(title, detail);
    return line;
  }));
  element('calculated-grade').textContent = totalWeight ? `${t.calculated}: ${calculated.toFixed(2)} / 10` : '';
  element('minimum-adjustment').textContent = totalWeight && calculated < state.minimumFinalGrade
    ? `${t.adjustment}: +${(state.minimumFinalGrade - calculated).toFixed(2)} = ${result.finalGrade.toFixed(2)} / 10` : '';
  clearTimeout(announcementTimer);
  if (announce) announcementTimer = setTimeout(() => {
    element('grade-announcement').textContent = `${t.finalGrade}: ${totalWeight ? result.finalGrade.toFixed(2) + ' / 10. ' + finalStatus : t.noCategories}`;
  }, 650);
  for (const [key, grade] of Object.entries(result)) {
    const output = element(key);
    const next = grade.toFixed(2);
    if (output.textContent !== next) {
      output.textContent = key === 'finalGrade' && !totalWeight ? '—' : next;
      if (!reducedMotion.matches) {
        output.getAnimations().forEach(animation => animation.cancel());
        output.animate([{ opacity: 0.5, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 220, easing: 'cubic-bezier(.2,.7,.3,1)' });
      }
    }
  }
  element('pinned-grade').textContent = totalWeight ? result.finalGrade.toFixed(2) : '—';
  element('pinned-result').setAttribute('aria-label', `${t.finalGrade}: ${totalWeight ? result.finalGrade.toFixed(2) + ' / 10. ' + finalStatus : t.noCategories}. ${t.viewResult}`);
  document.querySelector('.result-meter').style.setProperty('--grade', `${result.finalGrade * 10}%`);
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    const fraction = (Number(slider.value) - Number(slider.min)) / (Number(slider.max) - Number(slider.min));
    slider.style.setProperty('--fill', `${fraction * 100}%`);
  });
  element('copy-fallback').setAttribute('aria-label', t.copy);
  updateCollapseLabels();
}

function clearStatus() {
  element('status').textContent = '';
  element('copy-fallback').hidden = true;
}

for (const key of Object.keys(defaults)) {
  const controls = [element(key), element(`${key}-slider`)].filter(Boolean);
  controls.forEach(control => {
    const update = () => {
      if (control.value === '' || !control.validity.valid) return;
      state[key] = control.type === 'checkbox' ? control.checked : Number(control.value);
      clearStatus();
      render();
    };
    control.addEventListener('input', update);
    if (control.type === 'number') control.addEventListener('change', () => {
      state[key] = control.value === '' ? defaults[key] : Number(control.value);
      clearStatus();
      render();
    });
  });
}

document.querySelectorAll('[data-language]').forEach(button => {
  button.addEventListener('click', () => {
    language = button.dataset.language;
    try { localStorage.setItem('calculatorLanguage', language); } catch { /* Keep the selection for this session. */ }
    clearStatus();
    render();
  });
});
element('reset').addEventListener('click', () => {
  state = { ...defaults };
  clearStatus();
  render();
  element('status').textContent = translations[language].resetDone;
});
element('copy').addEventListener('click', async () => {
  const t = translations[language];
  const result = grades(state);
  const scores = { ...state, ...result };
  const totalWeight = categories.reduce((sum, key) => sum + (state[`${key}Enabled`] ? state[`${key}Weight`] : 0), 0);
  const summary = categories.filter(key => state[`${key}Enabled`]).map(key => `${t[key]}: ${scores[`${key}Grade`].toFixed(2)} (${totalWeight ? (state[`${key}Weight`] / totalWeight * 100).toFixed(1) : 0}%)`).join('\n') + `\n${t.minimumFinalGrade}: ${state.minimumFinalGrade}\n${t.finalGrade}: ${result.finalGrade.toFixed(2)}/10${totalWeight ? '' : `\n${t.noCategories}`}`;
  clearStatus();
  try {
    await navigator.clipboard.writeText(summary);
    element('status').textContent = t.copied;
  } catch {
    element('copy-fallback').value = summary;
    element('copy-fallback').hidden = false;
    element('copy-fallback').focus();
    element('copy-fallback').select();
    element('status').textContent = t.manualCopy;
  }
});
element('pinned-result').addEventListener('click', () => {
  const card = element('final-title').closest('.card');
  const toggle = card.querySelector('.collapse-button');
  if (toggle.getAttribute('aria-expanded') === 'false') toggle.click();
  card.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
  element('final-title').tabIndex = -1;
  element('final-title').focus({ preventScroll: true });
});
render(false);
