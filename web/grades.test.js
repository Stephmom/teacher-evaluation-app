import { defaults, grades, normalize } from './grades.js';
const check = (condition, message) => { if (!condition) throw new Error(message); };
  check(grades(defaults).finalGrade.toFixed(2) === '2.90', 'Default final grade');
  check(grades(defaults).examGrade.toFixed(2) === '2.67', 'Default exam grade');
  check(grades({ ...defaults, assignmentCount: 12, submittedAssignments: 9 }).bookGrade === 7.5, '9/12 assignments');
  for (const total of [1, 12, 15, 20, 50]) {
    check(grades({ ...defaults, assignmentCount: total, submittedAssignments: total }).bookGrade === 10, `Full credit for ${total}`);
  }
  check(normalize({ ...defaults, assignmentCount: 2 }).submittedAssignments === 2, 'Clamp submitted work');
  check(normalize({ ...defaults, questionCount: 1 }).correctAnswers === 1, 'Clamp correct answers');
  check(Math.abs(grades({ ...defaults, examWeight: 100, bookWeight: 0 }).finalGrade - grades(defaults).examGrade) < 1e-12, 'Exam only');
  check(grades({ ...defaults, examWeight: 0, bookWeight: 100 }).finalGrade === 3, 'Book only');
  check(grades({ ...defaults, correctAnswers: 0, submittedAssignments: 0 }).finalGrade === 0, 'Zero earned');
  check(normalize({ ...defaults, assignmentCount: 0 }).assignmentCount === 1, 'Reject zero total');
  check(normalize({ ...defaults, questionCount: NaN }).questionCount === 15, 'Invalid number');
  check(Math.abs(grades({ ...defaults, correctAnswers: 1, questionCount: 3, examWeight: 100, bookWeight: 0 }).finalGrade - 10 / 3) < 1e-12, 'Keep full precision');

check(grades({ ...defaults, minimumFinalGrade: 7 }).finalGrade === 7, 'School final minimum');
check(grades({ ...defaults, examEnabled: false, bookEnabled: false, readingEnabled: true, readingGrade: 8 }).finalGrade === 8, 'Only reading enabled');
check(grades({ ...defaults, examEnabled: false, bookEnabled: false, minimumFinalGrade: 7 }).finalGrade === 0, 'No categories ignores floor');
check(grades({ ...defaults, readingEnabled: false, readingGrade: 10 }).finalGrade.toFixed(2) === '2.90', 'Disabled category excluded');
check(Math.abs(grades({ ...defaults, examEnabled: false, bookWeight: 20, writingEnabled: true, writingGrade: 9, writingWeight: 20 }).finalGrade - 6) < 1e-12, 'Normalize active weights');
console.info('PASS: all grading checks passed.');
