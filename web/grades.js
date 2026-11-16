export const defaults = { questionCount: 15, correctAnswers: 4, minimumExamGrade: 0, assignmentCount: 10, submittedAssignments: 3, examWeight: 30 };

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
    correctAnswers: bounded('correctAnswers', 0, questionCount),
    submittedAssignments: bounded('submittedAssignments', 0, assignmentCount),
    examWeight: bounded('examWeight', 0, 100)
  };
}

export function grades(values) {
  const state = normalize(values);
  const examGrade = Math.max(state.minimumExamGrade, state.correctAnswers / state.questionCount * 10);
  const bookGrade = state.submittedAssignments / state.assignmentCount * 10;
  const weight = state.examWeight / 100;
  return { examGrade, bookGrade, finalGrade: examGrade * weight + bookGrade * (1 - weight) };
}
