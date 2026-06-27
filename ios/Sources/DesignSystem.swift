import SwiftUI
import UIKit

// ─────────────────────────────────────────────────────────────────────────────
//  Design System v2 — the single source of truth.
//  No screen or component defines raw spacing, radius, type, motion, elevation,
//  or touch targets. Everything reads from these tokens, so consistency is
//  architectural, not remembered. Change a value here → it changes everywhere.
// ─────────────────────────────────────────────────────────────────────────────

// MARK: - Spacing (strict 4-pt grid)
enum Space {
    static let xxs: CGFloat = 2
    static let xs:  CGFloat = 4
    static let sm:  CGFloat = 8
    static let md:  CGFloat = 12
    static let lg:  CGFloat = 16
    static let xl:  CGFloat = 20
    static let xxl: CGFloat = 24
    static let xxxl: CGFloat = 32
}

// MARK: - Layout (one margin, one rhythm — every screen obeys these)
enum Layout {
    static let screenMargin: CGFloat = Space.lg      // 16 — the single left/right margin
    static let cardPadding:   CGFloat = Space.lg      // 16 — inside every card
    static let cardSpacing:   CGFloat = Space.md      // 12 — between stacked cards
    static let sectionSpacing: CGFloat = Space.xl     // 20 — between major sections
    static let bottomInset:   CGFloat = 96            // clearance above the floating mic
}

// MARK: - Corner radius (card, control, capsule — nothing else exists)
enum Radius {
    static let card:    CGFloat = 18
    static let control: CGFloat = 12
}

// MARK: - Icon sizes
enum Icon {
    static let sm: CGFloat = 13
    static let md: CGFloat = 16
    static let lg: CGFloat = 20
    static let xl: CGFloat = 24
}

// MARK: - Touch targets (HIG minimum is 44pt — never smaller)
enum Hit { static let min: CGFloat = 44 }

// MARK: - Typography (system text styles for Dynamic Type + one numeral treatment)
enum Typography {
    static let cardTitle: Font    = .title3.weight(.semibold)            // card hero titles
    static let sectionLabel: Font = .footnote.weight(.semibold)          // quiet section labels
    static let numeralLG: Font    = .system(size: 44, weight: .bold, design: .rounded)
    static let numeralSM: Font    = .system(.headline, design: .rounded)
}

// MARK: - Motion (ONE system: a standard spring + a press spring)
enum Anim {
    static let standard = Animation.spring(response: 0.40, dampingFraction: 0.88)
    static let press    = Animation.spring(response: 0.24, dampingFraction: 0.72)
}

// MARK: - Elevation (cards are FLAT like native inset-grouped; only floating UI lifts)
struct FloatingShadow: ViewModifier {
    func body(content: Content) -> some View {
        content.shadow(color: .black.opacity(0.16), radius: 16, x: 0, y: 8)
    }
}
extension View { func floating() -> some View { modifier(FloatingShadow()) } }

// MARK: - Press feedback (one button style across the whole app)
struct PressableStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .opacity(configuration.isPressed ? 0.92 : 1)
            .animation(Anim.press, value: configuration.isPressed)
    }
}

// MARK: - Minimum hit target
extension View {
    func hitTarget() -> some View { frame(minWidth: Hit.min, minHeight: Hit.min) }
}
