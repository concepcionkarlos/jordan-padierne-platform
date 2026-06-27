import SwiftUI

// Every reusable surface, chip, button, and skeleton — built entirely from the
// Design System tokens. Screens compose these; they never set raw values.

// ─── Surfaces ────────────────────────────────────────────────────────────────
// Flat card (native inset-grouped feel — no shadow). Optional subtle tint to
// distinguish a card by meaning without adding a border.
struct PremiumCard<Content: View>: View {
    var padding: CGFloat = Layout.cardPadding
    var tint: Color? = nil
    @ViewBuilder var content: Content
    var body: some View {
        content
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background {
                RoundedRectangle(cornerRadius: Radius.card, style: .continuous)
                    .fill(Brand.cardBg)
                    .overlay {
                        if let tint {
                            RoundedRectangle(cornerRadius: Radius.card, style: .continuous)
                                .fill(tint.opacity(0.05))
                        }
                    }
            }
    }
}

// Quiet section label — sentence case, no tracking, no all-caps shouting.
struct SectionHeader: View {
    let title: String
    var systemImage: String? = nil
    var accent: Color = .secondary
    var body: some View {
        HStack(spacing: Space.xs) {
            if let systemImage { Image(systemName: systemImage).font(.footnote.weight(.semibold)) }
            Text(title).font(Typography.sectionLabel)
        }
        .foregroundStyle(accent)
    }
}

// ─── Chips (one geometry: h=8, v=4, capsule) ─────────────────────────────────
struct StatusPill: View {
    let text: String
    var color: Color
    var filled: Bool = false
    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .foregroundStyle(filled ? .white : color)
            .padding(.horizontal, Space.sm)
            .padding(.vertical, Space.xs)
            .background(filled ? AnyShapeStyle(color) : AnyShapeStyle(color.opacity(0.14)), in: Capsule())
    }
}

struct ScorePill: View {
    let score: Int
    var body: some View {
        HStack(spacing: 3) {
            Image(systemName: "bolt.fill").font(.system(size: 9))
            Text("\(score)").font(.caption.weight(.semibold))
        }
        .foregroundStyle(ScoreBand.color(score))
        .padding(.horizontal, Space.sm)
        .padding(.vertical, Space.xs)
        .background(ScoreBand.color(score).opacity(0.14), in: Capsule())
    }
}

struct StageBadge: View {
    let stage: String
    var body: some View {
        StatusPill(text: LeadStage(rawValue: stage)?.label ?? stage, color: Self.color(stage))
    }
    static func color(_ stage: String) -> Color {
        switch stage {
        case "NEW": return Brand.sky
        case "QUALIFIED": return .indigo
        case "CONTACTED": return .purple
        case "SHOWING_SCHEDULED": return .orange
        case "NEGOTIATION": return Brand.wine
        case "CLOSED": return .green
        default: return .gray
        }
    }
}

struct MetricChip: View {
    let icon: String
    let tint: Color
    let value: Int
    let label: String
    var body: some View {
        VStack(spacing: Space.xs) {
            Image(systemName: icon).font(.system(size: Icon.md, weight: .semibold)).foregroundStyle(tint)
            Text("\(value)").font(Typography.numeralSM).foregroundStyle(Brand.navy)
                .contentTransition(.numericText(value: Double(value)))
            Text(label).font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Space.md)
        .background(Brand.cardBg, in: RoundedRectangle(cornerRadius: Radius.control, style: .continuous))
        .animation(Anim.standard, value: value)
    }
}

// ─── Numbers ─────────────────────────────────────────────────────────────────
struct CountUpNumber: View {
    let value: Int
    var font: Font = Typography.numeralLG
    @State private var shown = 0
    var body: some View {
        Text("\(shown)")
            .font(font)
            .monospacedDigit()
            .contentTransition(.numericText(value: Double(shown)))
            .foregroundStyle(Brand.navy)
            .onAppear { withAnimation(Anim.standard) { shown = value } }
            .onChange(of: value) { _, n in withAnimation(Anim.standard) { shown = n } }
    }
}

struct ScoreBar: View {
    let score: Int
    let color: Color
    @State private var fill: CGFloat = 0
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(Color.primary.opacity(0.07))
                Capsule().fill(color).frame(width: max(6, geo.size.width * fill))
            }
        }
        .frame(height: 6)
        .onAppear { withAnimation(Anim.standard) { fill = CGFloat(score) / 100 } }
        .onChange(of: score) { _, n in withAnimation(Anim.standard) { fill = CGFloat(n) / 100 } }
    }
}

// ─── Score semantics (single source) ─────────────────────────────────────────
enum ScoreBand {
    static func color(_ score: Int) -> Color {
        score >= 75 ? .red : score >= 50 ? .orange : score >= 30 ? Brand.sky : .gray
    }
    static func headline(_ score: Int) -> String {
        score >= 75 ? "Ready to buy" : score >= 50 ? "Strong interest" : score >= 30 ? "Warming up" : "Early stage"
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

struct SmartScoreCard: View {
    let score: Int
    let percentile: Int?
    var body: some View {
        let color = ScoreBand.color(score)
        PremiumCard {
            VStack(alignment: .leading, spacing: Space.sm) {
                Text(ScoreBand.headline(score)).font(.headline.weight(.bold)).foregroundStyle(color)
                HStack(alignment: .firstTextBaseline, spacing: Space.xs) {
                    CountUpNumber(value: score)
                    Text("/ 100").font(.subheadline).foregroundStyle(.secondary)
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

// ─── Urgency semantics (single source) ───────────────────────────────────────
enum UrgencyStyle {
    static func of(_ u: String) -> (label: String, color: Color) {
        switch u {
        case "now":   return ("Do now", Brand.wine)
        case "today": return ("Today", .orange)
        case "soon":  return ("Soon", Brand.sky)
        default:      return ("Nurture", .gray)
        }
    }
}

struct CoachCard<Primary: View>: View {
    let urgency: String
    let emoji: String
    let title: String
    let reason: String
    @ViewBuilder var primary: () -> Primary
    var body: some View {
        let style = UrgencyStyle.of(urgency)
        PremiumCard(tint: style.color) {
            VStack(alignment: .leading, spacing: Space.md) {
                HStack(spacing: Space.sm) {
                    StatusPill(text: style.label, color: style.color, filled: true)
                    Spacer(minLength: 0)
                    Text(emoji).font(.body)
                }
                Text(title).font(Typography.cardTitle).foregroundStyle(Brand.navy)
                    .fixedSize(horizontal: false, vertical: true)
                Text(reason).font(.subheadline).foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
                primary()
            }
        }
    }
}

// ─── Buttons (≥44pt, one press style) ────────────────────────────────────────
struct ActionTile: View {
    let title: String
    let icon: String
    var tint: Color = Brand.primary
    var enabled: Bool = true
    var body: some View {
        VStack(spacing: Space.xs) {
            Image(systemName: icon).font(.system(size: Icon.md, weight: .semibold))
            Text(title).font(.caption.weight(.medium))
        }
        .frame(maxWidth: .infinity)
        .frame(minHeight: Hit.min)
        .padding(.vertical, Space.sm)
        .background(tint.opacity(0.10), in: RoundedRectangle(cornerRadius: Radius.control, style: .continuous))
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
        HStack(spacing: Space.sm) {
            Image(systemName: icon).font(.system(size: Icon.md, weight: .semibold))
            Text(title).font(.subheadline.weight(.semibold))
        }
        .frame(maxWidth: .infinity)
        .frame(minHeight: Hit.min)
        .padding(.vertical, Space.sm)
        .background(enabled ? AnyShapeStyle(tint) : AnyShapeStyle(Color.gray.opacity(0.4)),
                    in: RoundedRectangle(cornerRadius: Radius.control, style: .continuous))
        .foregroundStyle(.white)
    }
}

// 44pt round icon button (call / WhatsApp).
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
            Image(systemName: symbol).font(.system(size: Icon.md, weight: .semibold)).foregroundStyle(.white)
                .frame(width: Hit.min, height: Hit.min)
                .background(url == nil ? AnyShapeStyle(Color.gray.opacity(0.35)) : AnyShapeStyle(tint), in: Circle())
        }
        .buttonStyle(PressableStyle())
        .disabled(url == nil)
    }
}

// ─── Empty state (calm, generous whitespace, no heavy tile) ──────────────────
struct EmptyState: View {
    let icon: String
    let title: String
    let message: String
    var tint: Color = Brand.primary
    var hint: String? = nil
    var body: some View {
        VStack(spacing: Space.lg) {
            Image(systemName: icon).font(.system(size: 40, weight: .light)).foregroundStyle(tint.opacity(0.85))
            VStack(spacing: Space.xs) {
                Text(title).font(.title3.weight(.semibold)).foregroundStyle(Brand.navy)
                Text(message).font(.subheadline).foregroundStyle(.secondary).multilineTextAlignment(.center)
            }
            if let hint {
                Text(hint).font(.footnote.weight(.medium)).foregroundStyle(tint)
            }
        }
        .padding(Space.xxl)
    }
}

// ─── Transient confirmation (floating) ───────────────────────────────────────
struct ConfirmationToast: View {
    let text: String
    var body: some View {
        HStack(spacing: Space.sm) {
            Image(systemName: "checkmark.circle.fill")
            Text(text).font(.subheadline.weight(.semibold))
        }
        .foregroundStyle(.white)
        .padding(.horizontal, Space.lg).padding(.vertical, Space.md)
        .background(Brand.navy, in: Capsule())
        .floating()
        .transition(.move(edge: .bottom).combined(with: .opacity))
    }
}

// ─── Coach action row (Today's compact item) ─────────────────────────────────
struct CoachActionRow: View {
    let api: APIClient
    let action: CoachAction
    var body: some View {
        PremiumCard {
            HStack(spacing: Space.md) {
                NavigationLink {
                    LeadDetailView(api: api, lead: Lead(minimalId: action.leadId, name: action.name,
                                                        phone: action.phone, stage: action.stage, score: action.score))
                } label: {
                    VStack(alignment: .leading, spacing: Space.xs) {
                        Text(action.title).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.navy)
                            .lineLimit(2).multilineTextAlignment(.leading)
                        HStack(spacing: Space.xs) {
                            let s = UrgencyStyle.of(action.urgency)
                            StatusPill(text: s.label, color: s.color)
                            Text(firstName).font(.footnote).foregroundStyle(.secondary).lineLimit(1)
                            ScorePill(score: action.score)
                        }
                        Text(action.reason).font(.footnote).foregroundStyle(.secondary)
                            .lineLimit(2).multilineTextAlignment(.leading)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .buttonStyle(PressableStyle())   // press feedback on the navigatable row

                VStack(spacing: Space.sm) {
                    CircleIconLink(url: PhoneLinks.tel(action.phone), symbol: "phone.fill", tint: Brand.primary)
                    CircleIconLink(url: PhoneLinks.whatsapp(action.phone, message: "Hi \(firstName)! 👋 Jordan here."),
                                   symbol: "message.fill", tint: .green)
                }
            }
        }
    }
    private var firstName: String { action.name.split(separator: " ").first.map(String.init) ?? action.name }
}

// ─── Skeleton loading (elegant placeholder, gentle pulse) ────────────────────
struct SkeletonBlock: View {
    var height: CGFloat = 12
    var width: CGFloat? = nil
    @State private var pulse = false
    var body: some View {
        RoundedRectangle(cornerRadius: 6, style: .continuous)
            .fill(Color.primary.opacity(pulse ? 0.05 : 0.10))
            .frame(width: width, height: height)
            .frame(maxWidth: width == nil ? .infinity : nil, alignment: .leading)
            .onAppear {
                withAnimation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true)) { pulse = true }
            }
    }
}

struct SkeletonCard: View {
    var lines: Int = 3
    var body: some View {
        PremiumCard {
            VStack(alignment: .leading, spacing: Space.sm) {
                SkeletonBlock(height: 14, width: 130)
                ForEach(0..<max(1, lines), id: \.self) { _ in SkeletonBlock(height: 11) }
            }
        }
    }
}
