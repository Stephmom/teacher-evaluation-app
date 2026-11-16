import { defaults, normalize, grades } from './grades.js';

const translations = {
  es: {
    title: 'Calculadora de calificaciones', subtitle: 'Primer grado · Configuración ajustable',
    exam: 'Examen', book: 'Trabajos del libro', bookShort: 'Libro',
    questionCount: 'Total de preguntas del examen', correctAnswers: 'Aciertos obtenidos',
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
    title: 'Grade calculator', subtitle: 'First grade · Adjustable settings',
    exam: 'Exam', book: 'Book assignments', bookShort: 'Book',
    questionCount: 'Total exam questions', correctAnswers: 'Correct answers',
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
  document.querySelector('meta[name="theme-color"]').content = dark ? '#101623' : '#eef1fb';
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

function render() {
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
  for (const [key, total] of [['correctAnswers', 'questionCount'], ['submittedAssignments', 'assignmentCount']]) {
    element(key).max = state[total];
    element(key).value = state[key];
    element(`${key}-value`).textContent = state[key];
    element(key).setAttribute('aria-valuetext', `${state[key]} ${language === 'es' ? 'de' : 'of'} ${state[total]}`);
  }
  element('examWeight').value = state.examWeight;
  element('examWeight').setAttribute('aria-valuetext', `${state.examWeight}%`);
  element('examWeight-value').textContent = `${state.examWeight}%`;
  element('bookWeight-value').textContent = `${100 - state.examWeight}%`;
  const result = grades(state);
  for (const [key, grade] of Object.entries(result)) {
    const output = element(key);
    const next = grade.toFixed(2);
    if (output.textContent !== next) {
      output.textContent = next;
      if (!reducedMotion.matches) {
        output.getAnimations().forEach(animation => animation.cancel());
        output.animate([{ opacity: 0.5, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 220, easing: 'cubic-bezier(.2,.7,.3,1)' });
      }
    }
  }
  document.querySelector('.result-meter').style.setProperty('--grade', `${result.finalGrade * 10}%`);
  document.querySelectorAll('input[type="range"]').forEach(slider => {
    const fraction = (Number(slider.value) - Number(slider.min)) / (Number(slider.max) - Number(slider.min));
    slider.style.setProperty('--fill', `${fraction * 100}%`);
  });
  element('copy-fallback').setAttribute('aria-label', t.copy);
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
      state[key] = Number(control.value);
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
  const summary = `${t.examGrade}: ${result.examGrade.toFixed(2)} (${state.correctAnswers}/${state.questionCount})\n${t.bookGrade}: ${result.bookGrade.toFixed(2)} (${state.submittedAssignments}/${state.assignmentCount})\n${t.exam}: ${state.examWeight}% · ${t.bookShort}: ${100 - state.examWeight}%\n${t.finalGrade}: ${result.finalGrade.toFixed(2)}/10`;
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
render();
