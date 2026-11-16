import Foundation

struct GradeCalculation {
    var questionCount = 15 {
        didSet { correctAnswers = min(correctAnswers, questionCount) }
    }
    var correctAnswers = 4
    var minimumExamGrade = 0.0
    var assignmentCount = 10 {
        didSet { submittedAssignments = min(submittedAssignments, assignmentCount) }
    }
    var submittedAssignments = 3
    var examWeight = 30
    var bookWeight = 70
    var examEnabled = true
    var bookEnabled = true
    var minimumFinalGrade = 0.0
    var categories = [
        EvaluationCategory(id: "classwork", spanish: "Trabajo en clase", english: "Classwork"),
        EvaluationCategory(id: "writing", spanish: "Escritura", english: "Writing"),
        EvaluationCategory(id: "speaking", spanish: "Expresión oral", english: "Speaking"),
        EvaluationCategory(id: "listening", spanish: "Comprensión auditiva", english: "Listening"),
        EvaluationCategory(id: "reading", spanish: "Lectura", english: "Reading")
    ]
    var activeWeight: Double {
        (examEnabled ? Double(examWeight) : 0) + (bookEnabled ? Double(bookWeight) : 0)
        + categories.filter(\.enabled).reduce(0) { $0 + $1.weight }
    }

    var examGrade: Double { max(min(max(minimumExamGrade, 0), 10), grade(earned: correctAnswers, total: questionCount)) }
    var bookGrade: Double { grade(earned: submittedAssignments, total: assignmentCount) }
    var finalGrade: Double {
        guard activeWeight > 0 else { return 0 }
        let weighted = (examEnabled ? examGrade * Double(examWeight) : 0)
            + (bookEnabled ? bookGrade * Double(bookWeight) : 0)
            + categories.filter(\.enabled).reduce(0) { $0 + min(max($1.grade, 0), 10) * $1.weight }
        return max(min(max(minimumFinalGrade, 0), 10), weighted / activeWeight)
    }

    private func grade(earned: Int, total: Int) -> Double {
        guard total > 0 else { return 0 }
        return Double(min(max(earned, 0), total)) / Double(total) * 10
    }
}

struct EvaluationCategory: Identifiable {
    let id: String
    let spanish: String
    let english: String
    var enabled = false
    var grade = 0.0
    var weight = 20.0
}
