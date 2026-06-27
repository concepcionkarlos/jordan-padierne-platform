import SwiftUI

enum CaptureLanguage: String, CaseIterable, Identifiable {
    case en, es
    var id: String { rawValue }
    var label: String { self == .en ? "EN" : "ES" }
    var spoken: String { self == .en ? "English" : "Spanish" }
    var localeID: String { self == .en ? "en-US" : "es-US" }
}

// The signature interaction: a large floating mic. Press and HOLD to record
// (on-device), release to review an editable transcript, Save to attach the note
// to a lead via the existing API. Works from Today (pick a client) and Lead Detail.
struct VoiceCaptureButton: View {
    let api: APIClient
    let lead: Lead?                       // nil on Today → pick a client on save
    var onSaved: ((Note) -> Void)? = nil

    @EnvironmentObject private var sync: NoteSyncService
    @StateObject private var speech = SpeechTranscriber()
    @AppStorage("capture_language") private var language: CaptureLanguage = .en

    private enum Phase { case idle, recording, review }
    @State private var phase: Phase = .idle
    @State private var transcript = ""
    @State private var pickedLead: Lead?
    @State private var pressing = false
    @State private var startedAt = Date()
    @State private var saving = false
    @State private var savedOffline = false
    @State private var showPicker = false
    @State private var showUnavailable = false
    @State private var unavailableText = ""
    @State private var autoStopTask: Task<Void, Never>?

    private let maxRecordingNanos: UInt64 = 120_000_000_000   // ~2 minutes

    var body: some View {
        ZStack {
            if phase != .idle { overlay.transition(.opacity) }
            VStack {
                Spacer()
                HStack {
                    Spacer()
                    VStack(spacing: 10) {
                        if phase == .idle { languagePill }
                        fab
                    }
                    .padding(24)
                }
            }
        }
        .animation(Anim.standard, value: phase)
        .task {
            speech.configure(localeID: language.localeID)
            _ = await speech.requestPermissions()
        }
        .onChange(of: speech.interruptionTick) { _, _ in handleInterruption() }
        .sheet(isPresented: $showPicker) {
            LeadPickerView(api: api) { picked in
                pickedLead = picked
                showPicker = false
            }
        }
        .alert("Voice notes need on-device dictation", isPresented: $showUnavailable) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(unavailableText)
        }
    }

    // MARK: Floating controls

    private var languagePill: some View {
        Picker("Dictation language", selection: $language) {
            ForEach(CaptureLanguage.allCases) { Text($0.label).tag($0) }
        }
        .pickerStyle(.segmented)
        .frame(width: 108)
        .accessibilityLabel("Dictation language")
    }

    private var fab: some View {
        Image(systemName: phase == .recording ? "waveform" : "mic.fill")
            .font(.system(size: 25, weight: .semibold))
            .foregroundStyle(.white)
            .frame(width: 64, height: 64)
            .background(
                LinearGradient(
                    colors: phase == .recording ? [Color.red, Color.red.opacity(0.82)] : [Brand.primary, Brand.navy],
                    startPoint: .topLeading, endPoint: .bottomTrailing
                ),
                in: Circle()
            )
            .overlay(Circle().strokeBorder(Color.white.opacity(0.22), lineWidth: 1))
            .shadow(color: Brand.navy.opacity(0.35), radius: 12, y: 6)
            .scaleEffect(phase == .recording ? 1.16 : 1)
            .opacity(phase == .review ? 0 : 1)
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in pressing = true; if phase == .idle { begin() } }
                    .onEnded { _ in pressing = false; if phase == .recording { end() } }
            )
            .accessibilityLabel(phase == .recording ? "Recording. Release to stop." : "Voice note")
            .accessibilityHint("Press and hold to record a voice note")
    }

    // MARK: Overlay (recording + review)

    @ViewBuilder private var overlay: some View {
        ZStack {
            Color.black.opacity(0.6).ignoresSafeArea()
                .allowsHitTesting(phase == .review)

            if phase == .recording {
                recordingPanel.allowsHitTesting(false)
            } else if phase == .review {
                reviewPanel
            }
        }
    }

    private var recordingPanel: some View {
        VStack(spacing: 22) {
            Text("Listening…").font(.headline).foregroundStyle(.white)
            Waveform(levels: speech.levels)
                .frame(height: 76)
                .padding(.horizontal, 40)
            Text(speech.transcript.isEmpty ? "Speak now" : speech.transcript)
                .font(.title3)
                .foregroundStyle(speech.transcript.isEmpty ? .white.opacity(0.5) : .white)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 28)
            Spacer()
            Text("Release to finish")
                .font(.subheadline)
                .foregroundStyle(.white.opacity(0.7))
                .padding(.bottom, 130)
        }
        .padding(.top, 90)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Recording voice note. \(speech.transcript)")
    }

    private var reviewPanel: some View {
        VStack {
            Spacer()
            VStack(alignment: .leading, spacing: 14) {
                Text("Voice note").font(.headline)

                TextEditor(text: $transcript)
                    .frame(height: 150)
                    .scrollContentBackground(.hidden)
                    .padding(8)
                    .background(.quaternary, in: RoundedRectangle(cornerRadius: 12))
                    .accessibilityLabel("Voice note transcript")

                attachRow

                if savedOffline {
                    Label("Saved offline — it'll sync automatically", systemImage: "wifi.slash")
                        .font(.caption).foregroundStyle(.orange)
                }

                HStack {
                    Button("Cancel", role: .cancel) { reset() }
                        .buttonStyle(.bordered)
                        .accessibilityHint("Discard this voice note")
                    Spacer()
                    Button { Task { await save() } } label: {
                        if saving { ProgressView() } else { Text("Save").bold() }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(!canSave)
                    .accessibilityHint("Save this note to the client")
                }
            }
            .padding(20)
            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: Radius.card, style: .continuous))
            .padding()
        }
    }

    @ViewBuilder private var attachRow: some View {
        if let lead {
            Label(lead.fullName, systemImage: "person.crop.circle.fill")
                .font(.subheadline).foregroundStyle(.secondary)
        } else {
            Button { showPicker = true } label: {
                HStack {
                    Image(systemName: "person.crop.circle")
                    Text(pickedLead?.fullName ?? "Choose client")
                    Spacer()
                    Image(systemName: "chevron.right").font(.caption)
                }
                .foregroundStyle(pickedLead == nil ? Color.accentColor : .primary)
            }
            .accessibilityLabel(pickedLead == nil ? "Choose a client to attach this note" : "Attached to \(pickedLead?.fullName ?? "")")
        }
    }

    private var canSave: Bool {
        !saving
            && !transcript.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            && (lead != nil || pickedLead != nil)
    }

    // MARK: Flow

    private func begin() {
        guard speech.authorized else {
            Task {
                let ok = await speech.requestPermissions()
                if ok && pressing { startRecording() }
            }
            return
        }
        startRecording()
    }

    private func startRecording() {
        speech.configure(localeID: language.localeID)
        do {
            try speech.start()
            phase = .recording
            startedAt = Date()
            Haptics.impact(.medium)
            autoStopTask?.cancel()
            autoStopTask = Task { @MainActor in
                try? await Task.sleep(nanoseconds: maxRecordingNanos)
                if phase == .recording { end() }   // hit the 2-minute cap
            }
        } catch TranscriberError.onDeviceUnavailable {
            unavailableText = "On-device dictation for \(language.spoken) isn't ready on this iPhone yet. Try the other language, or enable Dictation in Settings → General → Keyboard."
            showUnavailable = true
            phase = .idle
        } catch {
            phase = .idle
        }
    }

    private func end() {
        guard phase == .recording else { return }
        autoStopTask?.cancel()
        speech.stop()
        Haptics.impact(.light)
        transcript = speech.transcript
        let tooShort = Date().timeIntervalSince(startedAt) < 0.4
        if tooShort || transcript.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            phase = .idle
            return
        }
        pickedLead = lead
        phase = .review
    }

    // Audio interruption (call / route change) stopped recording — keep the transcript.
    private func handleInterruption() {
        guard phase == .recording else { return }
        autoStopTask?.cancel()
        Haptics.impact(.light)
        transcript = speech.transcript
        if transcript.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            phase = .idle
        } else {
            pickedLead = lead
            phase = .review
        }
    }

    private func save() async {
        guard let target = lead ?? pickedLead else { return }
        let body = transcript.trimmingCharacters(in: .whitespacesAndNewlines)
        saving = true
        let note = await sync.save(leadId: target.id, content: body)
        saving = false
        Haptics.success()

        if let note {
            onSaved?(note)
            reset()
        } else {
            // Queued offline — still show it immediately in the timeline.
            let local = Note(id: "local-\(UUID().uuidString)", content: body, author: "Jordan",
                             createdAt: ISO8601DateFormatter().string(from: Date()))
            onSaved?(local)
            savedOffline = true
            try? await Task.sleep(nanoseconds: 1_000_000_000)
            reset()
        }
    }

    private func reset() {
        autoStopTask?.cancel()
        phase = .idle
        transcript = ""
        pickedLead = nil
        savedOffline = false
    }
}

// Quick searchable client picker for capturing from Today.
struct LeadPickerView: View {
    let api: APIClient
    var onPick: (Lead) -> Void

    @StateObject private var vm: LeadsViewModel
    @Environment(\.dismiss) private var dismiss

    init(api: APIClient, onPick: @escaping (Lead) -> Void) {
        self.api = api
        self.onPick = onPick
        _vm = StateObject(wrappedValue: LeadsViewModel(api: api))
    }

    var body: some View {
        NavigationStack {
            List(vm.leads) { lead in
                Button { onPick(lead) } label: { LeadRow(lead: lead) }
                    .buttonStyle(.plain)
            }
            .listStyle(.plain)
            .navigationTitle("Choose client")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(text: $vm.search, prompt: "Search clients")
            .onChange(of: vm.search) { _, _ in vm.searchChanged() }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
            }
            .task { if vm.leads.isEmpty { await vm.load() } }
        }
    }
}
