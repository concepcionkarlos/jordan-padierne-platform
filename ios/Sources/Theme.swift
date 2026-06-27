import SwiftUI
import UIKit

// Jordan's brand palette + the premium card surface used across the app.
enum Brand {
    static let navy    = Color(red: 0x0A / 255.0, green: 0x16 / 255.0, blue: 0x28 / 255.0) // #0A1628
    static let navy600 = Color(red: 0x1A / 255.0, green: 0x3A / 255.0, blue: 0x6B / 255.0) // #1A3A6B
    static let primary = Color(red: 0x2E / 255.0, green: 0x69 / 255.0, blue: 0xAC / 255.0) // #2E69AC (interactive)
    static let sky     = Color(red: 0x7B / 255.0, green: 0xA7 / 255.0, blue: 0xC2 / 255.0) // #7BA7C2
    static let wine    = Color(red: 0x8B / 255.0, green: 0x1A / 255.0, blue: 0x2F / 255.0) // #8B1A2F

    static let groupedBg = Color(uiColor: .systemGroupedBackground)
    static let cardBg    = Color(uiColor: .secondarySystemGroupedBackground)
}

// A tinted icon chip used in cards (e.g. the appointment glyph).
struct IconTile: View {
    let symbol: String
    let tint: Color
    var size: CGFloat = 40

    var body: some View {
        Image(systemName: symbol)
            .font(.system(size: size * 0.45, weight: .semibold))
            .foregroundStyle(tint)
            .frame(width: size, height: size)
            .background(tint.opacity(0.14), in: RoundedRectangle(cornerRadius: Radius.control, style: .continuous))
    }
}
