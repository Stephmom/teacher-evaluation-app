export const extraCategories = ['classwork', 'writing', 'speaking', 'listening', 'reading'];
export const categories = ['exam', 'book', ...extraCategories];
export const defaults = { questionCount: 15, correctAnswers: 4, minimumExamGrade: 0, assignmentCount: 10, submittedAssignments: 3, examWeight: 30, bookWeight: 70, examEnabled: true, bookEnabled: true, minimumFinalGrade: 0,
  ...Object.fromEntries(extraCategories.flatMap(key => [[`${key}Grade`, 0], [`${key}Weight`, 20], [`${key}Enabled`, false]])) };

export function normalize(values) {
  const bounded = (key, min, max) => {
    const number = Number(values[key]);
    return Math.min(max, Math.max(min, Number.isFinite(number) ? Math.round(number) : defaults[key]));
  };
  const questionCount = bounded('questionCount', 1, 100);
  const assignmentCount = bounded('assignmentCount', 1, 50);
  const minimumExamGrade = Math.min(10, Math.max(0, Number.isFinite(Number(values.minimumExamGrade)) ? Number(values.minimumExamGrade) : defaults.minimumExamGrade));
  return {
    questionCount, assignmentCount, minimumExamGrade,
    minimumFinalGrade: Math.min(10, Math.max(0, Number(values.minimumFinalGrade) || 0)),
    ...Object.fromEntries(categories.flatMap(key => [
      [`${key}Enabled`, values[`${key}Enabled`] ?? defaults[`${key}Enabled`]],
      [`${key}Weight`, bounded(`${key}Weight`, 0, 100)],
      ...(extraCategories.includes(key) ? [[`${key}Grade`, Math.min(10, Math.max(0, Number(values[`${key}Grade`]) || 0))]] : [])
    ])),
    correctAnswers: bounded('correctAnswers', 0, questionCount),
    submittedAssignments: bounded('submittedAssignments', 0, assignmentCount),
    examWeight: bounded('examWeight', 0, 100)
  };
}

export function grades(values) {
  const state = normalize(values);
  const examGrade = Math.max(state.minimumExamGrade, state.correctAnswers / state.questionCount * 10);
  const bookGrade = state.submittedAssignments / state.assignmentCount * 10;
  const scores = { examGrade, bookGrade, ...Object.fromEntries(extraCategories.map(key => [`${key}Grade`, state[`${key}Grade`]])) };
  const totalWeight = categories.reduce((sum, key) => sum + (state[`${key}Enabled`] ? state[`${key}Weight`] : 0), 0);
  const weighted = categories.reduce((sum, key) => sum + (state[`${key}Enabled`] ? scores[`${key}Grade`] * state[`${key}Weight`] : 0), 0);
  return { examGrade, bookGrade, finalGrade: totalWeight ? Math.max(state.minimumFinalGrade, weighted / totalWeight) : 0 };
}
