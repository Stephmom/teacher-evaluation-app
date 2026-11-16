import SwiftUI
import UIKit

struct CalculatorView: View {
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @AppStorage("calculatorLanguage") private var language = "es"
    @AppStorage("calculatorTheme") private var theme = "system"
    @State private var calculation = GradeCalculation()
    @State private var showingCopied = false

    private var isDark: Bool { theme == "dark" || (theme == "system" && colorScheme == .dark) }
    private var accent: Color {
        isDark ? Color(red: 0.67, green: 0.73, blue: 1) : Color(red: 0.29, green: 0.39, blue: 0.81)
    }
    private var bookAccent: Color {
        isDark ? Color(red: 0.52, green: 0.83, blue: 0.81) : Color(red: 0.13, green: 0.50, blue: 0.52)
    }

    private func text(_ spanish: String, _ english: String) -> String {
        language == "es" ? spanish : english
    }

    private func formatted(_ grade: Double) -> String {
        String(format: "%.2f", locale: Locale(identifier: "en_US_POSIX"), grade)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                header
                card {
                    sectionTitle(text("Examen", "Exam"), icon: "pencil.and.list.clipboard")
                    countSlider(text("Total de preguntas del examen", "Total exam questions"),
                                value: $calculation.questionCount, range: 1...100)
                    countSlider(text("Aciertos obtenidos", "Correct answers"),
                                value: $calculation.correctAnswers, range: 0...calculation.questionCount,
                                total: calculation.questionCount)
                    gradeRow(text("Calificación del examen", "Exam grade"), grade: calculation.examGrade)
                }
                card {
                    sectionTitle(text("Trabajos del libro", "Book assignments"), icon: "book.closed")
                    countSlider(text("Total de trabajos asignados", "Total assigned work"),
                                value: $calculation.assignmentCount, range: 1...50)
                    HStack {
                        Text(text("1 trabajo", "1 assignment"))
                        Spacer()
                        Text(text("50 trabajos", "50 assignments"))
                    }
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    countSlider(text("Trabajos entregados", "Submitted assignments"),
                                value: $calculation.submittedAssignments, range: 0...calculation.assignmentCount,
                                total: calculation.assignmentCount)
                    gradeRow(text("Calificación del libro", "Book grade"), grade: calculation.bookGrade, color: bookAccent)
                }
                .tint(bookAccent)
                weightsCard
                finalCard
                actions
                Text(text(
                    "Ejemplo: Si asignaste 12 trabajos y un alumno entregó 9, su calificación del libro será 7.50. Si entregó los 12, obtiene 10.",
                    "Example: If you assigned 12 assignments and a student submitted 9, their book grade is 7.50. Submitting all 12 earns a 10."
                ))
                .font(.footnote)
                .foregroundStyle(.secondary)
            }
            .padding(20)
            .frame(maxWidth: 600)
            .frame(maxWidth: .infinity)
        }
        .background {
            ZStack {
                Color(uiColor: .systemGroupedBackground)
                LinearGradient(colors: [
                    Color(red: 0.96, green: 0.86, blue: 0.84),
                    Color(red: 0.82, green: 0.83, blue: 0.97),
                    Color(red: 0.76, green: 0.88, blue: 0.95)
                ], startPoint: .topLeading, endPoint: .bottomTrailing)
                .opacity(colorScheme == .dark ? 0.17 : 0.8)
            }
            .ignoresSafeArea()
        }
        .tint(accent)
        .preferredColorScheme(theme == "system" ? nil : (theme == "dark" ? .dark : .light))
        .animation(reduceMotion ? nil : .easeInOut(duration: 0.25), value: theme)
        .transaction { if reduceMotion { $0.disablesAnimations = true } }
        .environment(\.locale, Locale(identifier: language))
        .alert(text("Resultado copiado", "Result copied"), isPresented: $showingCopied) {
            Button(text("Aceptar", "OK"), role: .cancel) { }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: "graduationcap.fill")
                    .font(.title2)
                    .foregroundStyle(accent)
                    .frame(width: 50, height: 50)
                    .modifier(CalculatorGlassControl())
                    .accessibilityHidden(true)
                Spacer()
                Button {
                    theme = isDark ? "light" : "dark"
                } label: {
                    Image(systemName: isDark ? "sun.max" : "moon")
                        .font(.system(size: 19, weight: .medium))
                        .frame(width: 44, height: 44)
                        .modifier(CalculatorGlassControl())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(isDark ? text("Cambiar al modo claro", "Switch to light mode") : text("Cambiar al modo oscuro", "Switch to dark mode"))
                Picker(text("Idioma", "Language"), selection: $language) {
                    Text("Español").tag("es")
                    Text("English").tag("en")
                }
                .pickerStyle(.segmented)
                .frame(maxWidth: 240)
            }
            Text(text("Calculadora de calificaciones", "Grade calculator"))
                .font(.system(.largeTitle, design: .rounded, weight: .bold))
                .accessibilityAddTraits(.isHeader)
            Text(text("Primer grado · Configuración ajustable", "First grade · Adjustable settings"))
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    private var weightsCard: some View {
        card {
            sectionTitle(text("Porcentaje de evaluación", "Evaluation weights"), icon: "slider.horizontal.3")
            ViewThatFits(in: .horizontal) {
                HStack {
                    Text(text("Examen: ", "Exam: ") + "\(calculation.examWeight)%")
                    Spacer()
                    Text(text("Libro: ", "Book: ") + "\(100 - calculation.examWeight)%")
                }
                VStack(alignment: .leading, spacing: 8) {
                    Text(text("Examen: ", "Exam: ") + "\(calculation.examWeight)%")
                    Text(text("Libro: ", "Book: ") + "\(100 - calculation.examWeight)%")
                }
            }
            .font(.subheadline.weight(.semibold))
            Slider(value: integerBinding($calculation.examWeight), in: 0...100, step: 1) {
                Text(text("Porcentaje del examen", "Exam percentage"))
            }
            .accessibilityValue("\(calculation.examWeight)%")
        }
    }

    private var finalCard: some View {
        VStack(spacing: 8) {
            Text(text("Calificación final", "Final grade")).font(.headline)
            Text(formatted(calculation.finalGrade))
                .id(calculation.finalGrade)
                .transition(reduceMotion ? .identity : .opacity.combined(with: .offset(y: 3)))
                .font(.system(size: 72, weight: .semibold, design: .rounded))
                .monospacedDigit()
                .minimumScaleFactor(0.5)
                .lineLimit(1)
            Text(text("Escala de 0 a 10", "Scale from 0 to 10")).font(.subheadline)
            ProgressView(value: calculation.finalGrade, total: 10)
                .tint(accent)
                .frame(width: 96)
                .padding(.top, 8)
                .accessibilityHidden(true)
        }
        .foregroundStyle(colorScheme == .dark ? Color.white : accent)
        .frame(maxWidth: .infinity)
        .padding(24)
        .background {
            glassSurface
                .overlay {
                    RoundedRectangle(cornerRadius: 30, style: .continuous)
                        .fill(accent.opacity(0.09))
                }
        }
        .accessibilityElement(children: .combine)
        .animation(reduceMotion ? nil : .easeOut(duration: 0.22), value: calculation.finalGrade)
    }

    private var actions: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: 12) { resetButton; copyButton }
            VStack(spacing: 12) { resetButton; copyButton }
        }
        .buttonStyle(.plain)
        .controlSize(.large)
    }

    private var resetButton: some View {
        Button {
            calculation = GradeCalculation()
        } label: {
            Label(text("Reiniciar", "Reset"), systemImage: "arrow.counterclockwise")
                .font(.subheadline.weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 15)
                .padding(.horizontal, 12)
                .modifier(CalculatorGlassControl())
        }
    }

    private var copyButton: some View {
        Button {
            UIPasteboard.general.string = """
            \(text("Calificación del examen", "Exam grade")): \(formatted(calculation.examGrade)) (\(calculation.correctAnswers)/\(calculation.questionCount))
            \(text("Calificación del libro", "Book grade")): \(formatted(calculation.bookGrade)) (\(calculation.submittedAssignments)/\(calculation.assignmentCount))
            \(text("Examen", "Exam")): \(calculation.examWeight)% · \(text("Libro", "Book")): \(100 - calculation.examWeight)%
            \(text("Calificación final", "Final grade")): \(formatted(calculation.finalGrade))/10
            """
            showingCopied = true
        } label: {
            Label(text("Copiar resultado", "Copy result"), systemImage: "doc.on.doc")
                .font(.subheadline.weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 15)
                .padding(.horizontal, 12)
                .foregroundStyle(.white)
                .background(Color(red: 0.29, green: 0.39, blue: 0.81).gradient, in: Capsule())
                .overlay { Capsule().strokeBorder(.white.opacity(0.4), lineWidth: 1) }
        }
    }

    private func integerBinding(_ value: Binding<Int>) -> Binding<Double> {
        Binding(get: { Double(value.wrappedValue) }, set: { value.wrappedValue = Int($0.rounded()) })
    }

    private func countSlider(
        _ title: String, value: Binding<Int>, range: ClosedRange<Int>, total: Int? = nil
    ) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title).font(.subheadline).foregroundStyle(.secondary)
            Text(total.map { "\(value.wrappedValue) / \($0)" } ?? "\(value.wrappedValue)")
                .font(.title2.bold())
                .monospacedDigit()
            Slider(value: integerBinding(value), in: Double(range.lowerBound)...Double(range.upperBound), step: 1) {
                Text(title)
            }
            .accessibilityValue(total.map {
                "\(value.wrappedValue) \(text("de", "of")) \($0)"
            } ?? "\(value.wrappedValue)")
        }
    }

    private func gradeRow(_ title: String, grade: Double, color: Color? = nil) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Divider()
            Text(title).font(.subheadline).foregroundStyle(.secondary)
            Text(formatted(grade))
                .id(grade)
                .transition(reduceMotion ? .identity : .opacity.combined(with: .offset(y: 3)))
                .font(.largeTitle.bold()).monospacedDigit().foregroundStyle(color ?? accent)
        }
        .accessibilityElement(children: .combine)
        .animation(reduceMotion ? nil : .easeOut(duration: 0.22), value: grade)
    }

    private func sectionTitle(_ title: String, icon: String) -> some View {
        Label(title, systemImage: icon).font(.headline).accessibilityAddTraits(.isHeader)
    }

    private func card<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 20, content: content)
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background { glassSurface }
    }

    private var glassSurface: some View {
        RoundedRectangle(cornerRadius: 30, style: .continuous)
            .fill(reduceTransparency ? AnyShapeStyle(Color(uiColor: .secondarySystemGroupedBackground)) : AnyShapeStyle(.regularMaterial))
            .overlay {
                RoundedRectangle(cornerRadius: 30, style: .continuous)
                    .strokeBorder(
                        LinearGradient(colors: [.white.opacity(0.85), .white.opacity(0.15)],
                                       startPoint: .topLeading, endPoint: .bottomTrailing),
                        lineWidth: 1
                    )
            }
            .shadow(color: accent.opacity(0.09), radius: 20, x: 0, y: 10)
    }
}

private struct CalculatorGlassControl: ViewModifier {
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency

    @ViewBuilder
    func body(content: Content) -> some View {
        if reduceTransparency {
            content.background(Color(uiColor: .secondarySystemGroupedBackground), in: Capsule())
        } else {
            // Xcode 26+ uses native Liquid Glass; older toolchains retain the material fallback.
            #if compiler(>=6.2)
            if #available(iOS 26.0, *) {
                content.glassEffect(.regular.interactive(), in: .capsule)
            } else {
                fallback(content)
            }
            #else
            fallback(content)
            #endif
        }
    }

    private func fallback(_ content: Content) -> some View {
        content
            .background(.thinMaterial, in: Capsule())
            .overlay { Capsule().strokeBorder(.white.opacity(0.65), lineWidth: 1) }
            .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
    }
}
