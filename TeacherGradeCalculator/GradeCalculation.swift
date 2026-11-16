import Foundation

struct GradeCalculation {
    var questionCount = 15 {
        didSet { correctAnswers = min(correctAnswers, questionCount) }
    }
    var correctAnswers = 4
    var assignmentCount = 10 {
        didSet { submittedAssignments = min(submittedAssignments, assignmentCount) }
    }
    var submittedAssignments = 3
    var examWeight = 30

    var examGrade: Double { grade(earned: correctAnswers, total: questionCount) }
    var bookGrade: Double { grade(earned: submittedAssignments, total: assignmentCount) }
    var finalGrade: Double {
        let weight = Double(min(max(examWeight, 0), 100)) / 100
        return examGrade * weight + bookGrade * (1 - weight)
    }

    private func grade(earned: Int, total: Int) -> Double {
        guard total > 0 else { return 0 }
        return Double(min(max(earned, 0), total)) / Double(total) * 10
    }
}
