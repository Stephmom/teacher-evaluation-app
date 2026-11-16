import XCTest
@testable import TeacherGradeCalculator

final class GradeCalculationTests: XCTestCase {
    func testGradingAndAdjustableTotals() {
        var calculation = GradeCalculation()
        XCTAssertEqual(calculation.examGrade, 2.6666666667, accuracy: 0.000001)
        XCTAssertEqual(calculation.bookGrade, 3)
        XCTAssertEqual(calculation.finalGrade, 2.9, accuracy: 0.000001)

        for total in [12, 15, 20, 50] {
            calculation.assignmentCount = total
            calculation.submittedAssignments = total
            XCTAssertEqual(calculation.bookGrade, 10)
        }
        calculation.assignmentCount = 12
        calculation.submittedAssignments = 9
        XCTAssertEqual(calculation.bookGrade, 7.5)
        calculation.assignmentCount = 3
        XCTAssertEqual(calculation.submittedAssignments, 3)
        XCTAssertEqual(calculation.bookGrade, 10)
        calculation.questionCount = 2
        XCTAssertEqual(calculation.correctAnswers, 2)
        calculation.examWeight = 100
        XCTAssertEqual(calculation.finalGrade, calculation.examGrade)
        calculation.examWeight = 0
        XCTAssertEqual(calculation.finalGrade, calculation.bookGrade)
        calculation.submittedAssignments = 0
        XCTAssertEqual(calculation.finalGrade, 0)
        calculation.questionCount = 0
        XCTAssertEqual(calculation.examGrade, 0)

        calculation = GradeCalculation()
        XCTAssertEqual(calculation.assignmentCount, 10)
        XCTAssertEqual(calculation.examWeight, 30)
        XCTAssertEqual(calculation.finalGrade, 2.9, accuracy: 0.000001)
    }
}
