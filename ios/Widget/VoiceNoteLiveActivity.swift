import ActivityKit
import WidgetKit
import SwiftUI

// The Dynamic Island + lock-screen presentation of an active voice-note capture.
struct VoiceNoteLiveActivity: Widget {
    private static let brand = Color(red: 0x2E / 255.0, green: 0x69 / 255.0, blue: 0xAC / 255.0)

    var body: some WidgetConfiguration {
        ActivityConfiguration(for: VoiceNoteAttributes.self) { context in
            lockScreen(context)
                .padding()
                .activityBackgroundTint(Color.black.opacity(0.55))
                .activitySystemActionForegroundColor(.white)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "waveform").foregroundStyle(.red)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(context.attributes.startedAt, style: .timer).monospacedDigit().frame(width: 60)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Recording voice note").font(.headline)
                        Text(context.state.clientName).font(.caption).foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
            } compactLeading: {
                Image(systemName: "waveform").foregroundStyle(.red)
            } compactTrailing: {
                Text(context.attributes.startedAt, style: .timer).monospacedDigit().frame(width: 44)
            } minimal: {
                Image(systemName: "waveform").foregroundStyle(.red)
            }
        }
    }

    private func lockScreen(_ context: ActivityViewContext<VoiceNoteAttributes>) -> some View {
        HStack(spacing: 12) {
            Image(systemName: "waveform")
                .font(.title3)
                .foregroundStyle(.white)
                .frame(width: 40, height: 40)
                .background(Self.brand, in: Circle())
            VStack(alignment: .leading, spacing: 2) {
                Text("Recording voice note").font(.headline)
                Text(context.state.clientName).font(.subheadline).foregroundStyle(.secondary)
            }
            Spacer(minLength: 8)
            Text(context.attributes.startedAt, style: .timer).monospacedDigit().font(.title3)
        }
    }
}
