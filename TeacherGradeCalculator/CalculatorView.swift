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
                    Toggle(text("Incluir en la evaluación", "Include in evaluation"), isOn: $calculation.examEnabled)
                    countSlider(text("Total de preguntas del examen", "Total exam questions"),
                                value: $calculation.questionCount, range: 1...100)
                    countSlider(text("Aciertos obtenidos", "Correct answers"),
                                value: $calculation.correctAnswers, range: 0...calculation.questionCount,
                                total: calculation.questionCount)
                    HStack {
                        Text(text("Calificación mínima del examen", "Minimum exam grade"))
                            .font(.subheadline).foregroundStyle(.secondary)
                        Spacer(minLength: 8)
                        TextField(text("Mínimo", "Minimum"), value: minimumExamGradeBinding,
                                  format: .number.precision(.fractionLength(0...1)))
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.center)
                            .frame(width: 76)
                            .padding(.vertical, 8)
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
                            .accessibilityLabel(text("Calificación mínima del examen", "Minimum exam grade"))
                    }
                    gradeRow(text("Calificación del examen", "Exam grade"), grade: calculation.examGrade)
                }
                card {
                    sectionTitle(text("Trabajos del libro", "Book assignments"), icon: "book.closed")
                    Toggle(text("Incluir en la evaluación", "Include in evaluation"), isOn: $calculation.bookEnabled)
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
                ForEach($calculation.categories) { $category in
                    card {
                        Toggle(text(category.spanish, category.english), isOn: $category.enabled)
                            .font(.headline)
                        VStack(alignment: .leading) {
                            Text(text("Calificación (0–10)", "Grade (0–10)"))
                            TextField(text("Calificación", "Grade"), value: $category.grade, format: .number)
                                .keyboardType(.decimalPad)
                                .textFieldStyle(.roundedBorder)
                            Slider(value: $category.grade, in: 0...10, step: 0.1)
                                .accessibilityLabel(text(category.spanish, category.english))
                            Text(text("Peso: ", "Weight: ") + String(format: "%.0f", category.weight))
                            Slider(value: $category.weight, in: 0...100, step: 1)
                                .accessibilityLabel(text("Peso", "Weight"))
                        }
                        .disabled(!category.enabled)
                        .opacity(category.enabled ? 1 : 0.45)
                    }
                }
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
            Text(text("Examen: ", "Exam: ") + "\(calculation.examWeight)")
            Slider(value: integerBinding($calculation.examWeight), in: 0...100, step: 1)
                .disabled(!calculation.examEnabled)
                .accessibilityLabel(text("Peso del examen", "Exam weight"))
            Text(text("Libro: ", "Book: ") + "\(calculation.bookWeight)")
            Slider(value: integerBinding($calculation.bookWeight), in: 0...100, step: 1)
                .disabled(!calculation.bookEnabled)
                .accessibilityLabel(text("Peso del libro", "Book weight"))
            Text(text("Los pesos activos se ajustan automáticamente al 100%.", "Active weights automatically scale to 100%."))
                .font(.footnote).foregroundStyle(.secondary)
        }
    }

    private var finalCard: some View {
        VStack(spacing: 8) {
            HStack {
                Text(text("Calificación final mínima", "Minimum final grade"))
                TextField(text("Mínimo", "Minimum"), value: $calculation.minimumFinalGrade, format: .number)
                    .keyboardType(.decimalPad).textFieldStyle(.roundedBorder).frame(width: 76)
                    .accessibilityLabel(text("Calificación final mínima", "Minimum final grade"))
            }
            if calculation.activeWeight == 0 {
                Text(text("Activa una categoría con peso mayor que 0 para calcular.", "Enable a category with a weight above 0 to calculate."))
                    .font(.footnote)
            }
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
            let total = calculation.activeWeight
            var rows: [String] = []
            if calculation.examEnabled {
                rows.append(text("Examen", "Exam") + ": " + formatted(calculation.examGrade))
            }
            if calculation.bookEnabled {
                rows.append(text("Libro", "Book") + ": " + formatted(calculation.bookGrade))
            }
            for category in calculation.categories where category.enabled {
                rows.append(text(category.spanish, category.english) + ": " + formatted(min(max(category.grade, 0), 10)) + " (" + formatted(total > 0 ? category.weight / total * 100 : 0) + "%)")
            }
            rows.append(text("Calificación final mínima", "Minimum final grade") + ": " + formatted(min(max(calculation.minimumFinalGrade, 0), 10)))
            rows.append(text("Calificación final", "Final grade") + ": " + formatted(calculation.finalGrade) + "/10")
            UIPasteboard.general.string = rows.joined(separator: "\n")
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

    private var minimumExamGradeBinding: Binding<Double> {
        Binding(get: { calculation.minimumExamGrade }, set: { calculation.minimumExamGrade = min(max($0, 0), 10) })
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
