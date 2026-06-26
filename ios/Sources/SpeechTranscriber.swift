import Foundation
import AVFoundation
import Speech

enum TranscriberError: Error { case onDeviceUnavailable }

// On-device speech capture. Streams the microphone into SFSpeechRecognizer with
// requiresOnDeviceRecognition = true (no audio leaves the phone, no server, no AI).
// Publishes the live transcript + audio levels, supports EN/ES locales, and stops
// safely on audio interruptions (calls/route changes) while preserving the transcript.
@MainActor
final class SpeechTranscriber: ObservableObject {
    @Published var transcript = ""
    @Published var levels: [Float] = []
    @Published var isRecording = false
    @Published private(set) var authorized = false
    @Published private(set) var localeID = "en-US"
    /// Bumped whenever an interruption forces recording to stop (so the UI can react).
    @Published private(set) var interruptionTick = 0

    private let engine = AVAudioEngine()
    private var recognizer: SFSpeechRecognizer?
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private var observers: [NSObjectProtocol] = []

    init() {
        recognizer = SFSpeechRecognizer(locale: Locale(identifier: localeID))
    }

    func configure(localeID: String) {
        guard localeID != self.localeID || recognizer == nil else { return }
        self.localeID = localeID
        recognizer = SFSpeechRecognizer(locale: Locale(identifier: localeID))
    }

    /// True only when the recognizer is available AND can run fully on-device.
    var isOnDeviceAvailable: Bool {
        guard let recognizer else { return false }
        return recognizer.isAvailable && recognizer.supportsOnDeviceRecognition
    }

    func requestPermissions() async -> Bool {
        let speechOK = await withCheckedContinuation { (cont: CheckedContinuation<Bool, Never>) in
            SFSpeechRecognizer.requestAuthorization { cont.resume(returning: $0 == .authorized) }
        }
        let micOK = await withCheckedContinuation { (cont: CheckedContinuation<Bool, Never>) in
            AVAudioApplication.requestRecordPermission { cont.resume(returning: $0) }
        }
        authorized = speechOK && micOK
        return authorized
    }

    func start() throws {
        guard isOnDeviceAvailable else { throw TranscriberError.onDeviceUnavailable }
        transcript = ""
        levels = []

        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .measurement, options: .duckOthers)
        try session.setActive(true, options: .notifyOthersOnDeactivation)
        registerObservers(session)

        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        request.requiresOnDeviceRecognition = true
        self.request = request

        let input = engine.inputNode
        let format = input.outputFormat(forBus: 0)
        input.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self, request] buffer, _ in
            request.append(buffer)
            let level = SpeechTranscriber.rms(buffer)
            Task { @MainActor in self?.pushLevel(level) }
        }

        engine.prepare()
        try engine.start()
        isRecording = true

        task = recognizer?.recognitionTask(with: request) { [weak self] result, _ in
            guard let self, let result else { return }
            Task { @MainActor in self.transcript = result.bestTranscription.formattedString }
        }
    }

    func stop() {
        engine.inputNode.removeTap(onBus: 0)
        engine.stop()
        request?.endAudio()
        task?.cancel()
        request = nil
        task = nil
        isRecording = false
        removeObservers()
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }

    // MARK: - Interruptions (calls, unplugged headphones, route changes)

    private func registerObservers(_ session: AVAudioSession) {
        let nc = NotificationCenter.default
        observers.append(nc.addObserver(forName: AVAudioSession.interruptionNotification, object: session, queue: nil) { [weak self] note in
            let raw = (note.userInfo?[AVAudioSessionInterruptionTypeKey] as? NSNumber)?.uintValue ?? 0
            guard AVAudioSession.InterruptionType(rawValue: raw) == .began else { return }
            Task { @MainActor in self?.handleInterruption() }
        })
        observers.append(nc.addObserver(forName: AVAudioSession.routeChangeNotification, object: session, queue: nil) { [weak self] note in
            let raw = (note.userInfo?[AVAudioSessionRouteChangeReasonKey] as? NSNumber)?.uintValue ?? 0
            guard AVAudioSession.RouteChangeReason(rawValue: raw) == .oldDeviceUnavailable else { return }
            Task { @MainActor in self?.handleInterruption() }
        })
    }

    private func removeObservers() {
        observers.forEach { NotificationCenter.default.removeObserver($0) }
        observers.removeAll()
    }

    private func handleInterruption() {
        guard isRecording else { return }
        stop()                  // transcript captured so far is preserved (not cleared)
        interruptionTick += 1
    }

    // MARK: - Audio level

    private func pushLevel(_ level: Float) {
        levels.append(level)
        if levels.count > 40 { levels.removeFirst(levels.count - 40) }
    }

    nonisolated static func rms(_ buffer: AVAudioPCMBuffer) -> Float {
        guard let data = buffer.floatChannelData?[0] else { return 0 }
        let count = Int(buffer.frameLength)
        guard count > 0 else { return 0 }
        var sum: Float = 0
        for i in 0..<count { sum += data[i] * data[i] }
        return min(1, (sum / Float(count)).squareRoot() * 12)
    }
}
