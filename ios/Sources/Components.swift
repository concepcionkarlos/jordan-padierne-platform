import SwiftUI
import UIKit

// The shared design system. Every screen is composed from these — so the app
// feels like one product, not a set of pages. (Brand palette lives in Theme.swift.)

// ─── Motion ──────────────────────────────────────────────────────────────────
enum Motion {
    static let spring = Animation.spring(response: 0.42, dampingFraction: 0.82)
    static let snappy = Animation.spring(response: 0.30, dampingFraction: 0.78)
    static let gentle = Animation.spring(response: 0.55, dampingFraction: 0.86)
}

// Subtle spring scale + dim while a button is held.
struct PressableStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.96 : 1)
            .opacity(configuration.isPressed ? 0.92 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// Staggered entrance for stacked cards — each fades + rises in just after the one above.
struct CardEntrance: ViewModifier {
    let index: Int
    @State private var shown = false
    func body(content: Content) -> some View {
        content
            .opacity(shown ? 1 : 0)
            .offset(y: shown ? 0 : 14)
            .onAppear {
                withAnimation(.spring(response: 0.5, dampingFraction: 0.85).delay(Double(index) * 0.06)) {
                    shown = true
                }
            }
    }
}
extension View { func cardEntrance(_ index: Int) -> some View { modifier(CardEntrance(index: index)) } }

// ─── Surfaces ────────────────────────────────────────────────────────────────
struct PremiumCard<Content: View>: View {
    var padding: CGFloat = 18
    var accent: Color? = nil
    @ViewBuilder var content: Content
    var body: some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Brand.cardBg, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            .overlay {
                if let accent {
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(accent.opacity(0.28), lineWidth: 1.5)
                }
            }
            .shadow(color: .black.opacity(0.06), radius: 14, x: 0, y: 6)
    }
}

struct SectionHeader: View {
    let title: String
    var systemImage: String? = nil
    var accent: Color = .secondary
    var body: some View {
        HStack(spacing: 6) {
            if let systemImage {
                Image(systemName: systemImage).font(.caption2.weight(.bold))
            }
            Text(title.uppercased()).font(.caption2.weight(.bold)).tracking(0.8)
        }
        .foregroundStyle(accent)
    }
}

// ─── Pills & chips ───────────────────────────────────────────────────────────
struct StatusPill: View {
    let text: String
    var emoji: String? = nil
    var color: Color
    var filled: Bool = false
    var body: some View {
        HStack(spacing: 4) {
            if let emoji { Text(emoji).font(.caption2) }
            Text(text).font(.caption2.weight(.bold))
        }
        .foregroundStyle(filled ? .white : color)
        .padding(.horizontal, 9).padding(.vertical, 5)
        .background(filled ? AnyShapeStyle(color) : AnyShapeStyle(color.opacity(0.15)), in: Capsule())
    }
}

// Smart Score chip — bolt + number, colored by band.
struct ScorePill: View {
    let score: Int
    var body: some View {
        HStack(spacing: 3) {
            Image(systemName: "bolt.fill").font(.system(size: 9))
            Text("\(score)").font(.caption2.weight(.bold))
        }
        .foregroundStyle(ScoreBand.color(score))
        .padding(.horizontal, 7).padding(.vertical, 3)
        .background(ScoreBand.color(score).opacity(0.14), in: Capsule())
    }
}

struct MetricChip: View {
    let icon: String
    let tint: Color
    let value: Int
    let label: String
    var body: some View {
        VStack(spacing: 5) {
            HStack(spacing: 4) {
                Image(systemName: icon).font(.system(size: 11, weight: .semibold)).foregroundStyle(tint)
                Text("\(value)").font(.subheadline.weight(.bold)).foregroundStyle(Brand.navy)
                    .contentTransition(.numericText(value: Double(value)))
            }
            Text(label).font(.caption2).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(Brand.cardBg, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .animation(Motion.spring, value: value)
    }
}

// ─── Numbers ─────────────────────────────────────────────────────────────────
// Rolls smoothly to its value on appear and whenever it changes (native numeric text).
struct CountUpNumber: View {
    let value: Int
    var font: Font = .system(size: 40, weight: .bold, design: .rounded)
    @State private var shown = 0
    var body: some View {
        Text("\(shown)")
            .font(font)
            .monospacedDigit()
            .contentTransition(.numericText(value: Double(shown)))
            .foregroundStyle(Brand.navy)
            .onAppear { withAnimation(.spring(response: 0.9, dampingFraction: 0.95)) { shown = value } }
            .onChange(of: value) { _, n in withAnimation(.spring(response: 0.6, dampingFraction: 0.9)) { shown = n } }
    }
}

struct ScoreBar: View {
    let score: Int
    let color: Color
    @State private var fill: CGFloat = 0
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Color.primary.opacity(0.08))
                Capsule()
                    .fill(LinearGradient(colors: [color.opacity(0.65), color], startPoint: .leading, endPoint: .trailing))
                    .frame(width: max(8, geo.size.width * fill))
            }
        }
        .frame(height: 8)
        .onAppear { animate(to: score) }
        .onChange(of: score) { _, n in animate(to: n) }
    }
    private func animate(to s: Int) {
        withAnimation(.spring(response: 0.9, dampingFraction: 0.9)) { fill = CGFloat(s) / 100 }
    }
}

// ─── Score band semantics (shared, single source) ────────────────────────────
enum ScoreBand {
    static func color(_ score: Int) -> Color {
        score >= 75 ? .red : score >= 50 ? .orange : score >= 30 ? Brand.sky : .gray
    }
    // Answers "how close to buying?" instead of showing a raw number.
    static func headline(_ score: Int) -> String {
        score >= 75 ? "READY TO BUY" : score >= 50 ? "STRONG INTEREST" : score >= 30 ? "WARMING UP" : "EARLY STAGE"
    }
    static func descriptor(_ score: Int) -> String {
        switch score {
        case 75...: return "Strong signals across budget, stage & engagement."
        case 50...: return "Engaged and moving — keep the momentum."
        case 30...: return "Some intent — nurture toward a showing."
        default:    return "Needs qualifying before investing your time."
        }
    }
}

// ─── Smart Score card ────────────────────────────────────────────────────────
struct SmartScoreCard: View {
    let score: Int
    let percentile: Int?      // "Top X% of your pipeline" when meaningful
    var body: some View {
        let color = ScoreBand.color(score)
        PremiumCard {
            VStack(alignment: .leading, spacing: 10) {
                SectionHeader(title: "Smart Score", systemImage: "bolt.fill", accent: color)
                Text(ScoreBand.headline(score)).font(.title3.weight(.heavy)).foregroundStyle(color)
                HStack(alignment: .firstTextBaseline, spacing: 5) {
                    CountUpNumber(value: score)
                    Text("/ 100").font(.headline).foregroundStyle(.secondary)
                }
                ScoreBar(score: score, color: color)
                Text(subtitle).font(.subheadline).foregroundStyle(.secondary)
            }
        }
    }
    private var subtitle: String {
        if let percentile { return "Top \(percentile)% of your pipeline" }
        return ScoreBand.descriptor(score)
    }
}

// ─── Urgency semantics (shared) ──────────────────────────────────────────────
enum UrgencyStyle {
    static func of(_ u: String) -> (label: String, color: Color) {
        switch u {
        case "now":   return ("Do Now", Brand.wine)
        case "today": return ("Today", .orange)
        case "soon":  return ("Soon", Brand.sky)
        default:      return ("Nurture", .gray)
        }
    }
}

// ─── Coach card (the single recommended move) ────────────────────────────────
struct CoachCard<Primary: View>: View {
    let urgency: String
    let emoji: String
    let title: String
    let reason: String
    @ViewBuilder var primary: () -> Primary
    var body: some View {
        let style = UrgencyStyle.of(urgency)
        PremiumCard(accent: style.color) {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 6) {
                    StatusPill(text: style.label, color: style.color, filled: true)
                    SectionHeader(title: "Your Next Move")
                    Spacer(minLength: 0)
                    Text(emoji).font(.body)
                }
                Text(title).font(.title3.weight(.bold)).foregroundStyle(Brand.navy)
                    .fixedSize(horizontal: false, vertical: true)
                Text(reason).font(.subheadline).foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                primary()
            }
        }
    }
}

// ─── Buttons ─────────────────────────────────────────────────────────────────
// Shared secondary visual — used by ActionButton(.secondary) and by Menus.
struct ActionTile: View {
    let title: String
    let icon: String
    var tint: Color = Brand.primary
    var enabled: Bool = true
    var body: some View {
        VStack(spacing: 5) {
            Image(systemName: icon).font(.system(size: 16, weight: .semibold))
            Text(title).font(.caption2.weight(.semibold))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 12)
        .background(tint.opacity(0.10), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .foregroundStyle(tint)
        .opacity(enabled ? 1 : 0.4)
    }
}

struct ActionButton: View {
    enum Style { case primary, secondary }
    let title: String
    let icon: String
    var style: Style = .primary
    var tint: Color = Brand.primary
    var url: URL? = nil
    var action: (() -> Void)? = nil
    @Environment(\.openURL) private var openURL
    private var enabled: Bool { url != nil || action != nil }
    var body: some View {
        Button {
            Haptics.impact(.light)
            if let url { openURL(url) } else { action?() }
        } label: {
            if style == .primary { primaryLabel } else {
                ActionTile(title: title, icon: icon, tint: tint, enabled: enabled)
            }
        }
        .buttonStyle(PressableStyle())
        .disabled(!enabled)
    }
    private var primaryLabel: some View {
        HStack(spacing: 8) {
            Image(systemName: icon).font(.system(size: 16, weight: .semibold))
            Text(title).font(.subheadline.weight(.bold))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 14)
        .background(enabled ? AnyShapeStyle(tint) : AnyShapeStyle(Color.gray.opacity(0.4)),
                    in: RoundedRectangle(cornerRadius: 14, style: .continuous))
        .foregroundStyle(.white)
    }
}

struct CircleIconLink: View {
    let url: URL?
    let symbol: String
    let tint: Color
    @Environment(\.openURL) private var openURL
    var body: some View {
        Button {
            guard let url else { return }
            Haptics.impact(.light); openURL(url)
        } label: {
            Image(systemName: symbol).font(.system(size: 15, weight: .semibold)).foregroundStyle(.white)
                .frame(width: 40, height: 40)
                .background(url == nil ? AnyShapeStyle(Color.gray.opacity(0.4)) : AnyShapeStyle(tint), in: Circle())
        }
        .buttonStyle(PressableStyle())
        .disabled(url == nil)
    }
}

// ─── Empty state ─────────────────────────────────────────────────────────────
struct EmptyState: View {
    let icon: String
    let title: String
    let message: String
    var tint: Color = Brand.primary
    var hint: String? = nil
    var body: some View {
        VStack(spacing: 14) {
            IconTile(symbol: icon, tint: tint, size: 64)
            VStack(spacing: 6) {
                Text(title).font(.title3.weight(.bold)).foregroundStyle(Brand.navy)
                Text(message).font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.center)
            }
            if let hint {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.up.forward.app.fill").font(.footnote)
                    Text(hint).font(.footnote.weight(.semibold))
                }
                .foregroundStyle(tint)
                .padding(.horizontal, 16).padding(.vertical, 11)
                .background(tint.opacity(0.10), in: Capsule())
            }
        }
        .padding(40)
    }
}

// ─── Transient confirmation toast ────────────────────────────────────────────
// A small celebratory checkmark capsule for completed actions (stage, follow-up, note).
struct ConfirmationToast: View {
    let text: String
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "checkmark.circle.fill")
            Text(text).font(.subheadline.weight(.semibold))
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 18).padding(.vertical, 12)
        .background(Brand.navy, in: Capsule())
        .shadow(color: .black.opacity(0.2), radius: 12, y: 5)
        .transition(.move(edge: .top).combined(with: .opacity))
    }
}

// ─── Coach action row (Today's compact list item) ────────────────────────────
struct CoachActionRow: View {
    let api: APIClient
    let action: CoachAction
    var body: some View {
        PremiumCard(padding: 14) {
            HStack(spacing: 12) {
                NavigationLink {
                    LeadDetailView(api: api, lead: Lead(minimalId: action.leadId, name: action.name,
                                                        phone: action.phone, stage: action.stage, score: action.score))
                } label: {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(action.title).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.navy)
                            .lineLimit(2).multilineTextAlignment(.leading)
                        HStack(spacing: 6) {
                            let s = UrgencyStyle.of(action.urgency)
                            StatusPill(text: s.label, color: s.color)
                            Text(firstName).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                            ScorePill(score: action.score)
                        }
                        Text(action.reason).font(.caption2).foregroundStyle(.secondary)
                            .lineLimit(2).multilineTextAlignment(.leading)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .buttonStyle(.plain)

                VStack(spacing: 8) {
                    CircleIconLink(url: PhoneLinks.tel(action.phone), symbol: "phone.fill", tint: Brand.primary)
                    CircleIconLink(url: PhoneLinks.whatsapp(action.phone, message: "Hi \(firstName)! 👋 Jordan here."),
                                   symbol: "message.fill", tint: .green)
                }
            }
        }
    }
    private var firstName: String { action.name.split(separator: " ").first.map(String.init) ?? action.name }
}
