import SwiftUI
import VisionKit
import Vision

struct ScannedCard {
    var name = ""
    var phone = ""
    var email = ""
}

// VisionKit document scanner → on-device OCR (Vision) → best-guess name/phone/email.
// No data leaves the device; Jordan reviews/edits before saving.
struct DocumentScanner: UIViewControllerRepresentable {
    var onResult: (ScannedCard) -> Void
    var onCancel: () -> Void

    func makeUIViewController(context: Context) -> VNDocumentCameraViewController {
        let vc = VNDocumentCameraViewController()
        vc.delegate = context.coordinator
        return vc
    }
    func updateUIViewController(_ vc: VNDocumentCameraViewController, context: Context) {}
    func makeCoordinator() -> Coordinator { Coordinator(self) }

    final class Coordinator: NSObject, VNDocumentCameraViewControllerDelegate {
        let parent: DocumentScanner
        init(_ parent: DocumentScanner) { self.parent = parent }

        func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFinishWith scan: VNDocumentCameraScan) {
            let image = scan.pageCount > 0 ? scan.imageOfPage(at: 0) : nil
            guard let image else { parent.onCancel(); return }
            CardParser.parse(image) { [parent] card in parent.onResult(card) }
        }
        func documentCameraViewControllerDidCancel(_ controller: VNDocumentCameraViewController) {
            parent.onCancel()
        }
        func documentCameraViewController(_ controller: VNDocumentCameraViewController, didFailWithError error: Error) {
            parent.onCancel()
        }
    }
}

enum CardParser {
    static func parse(_ image: UIImage, completion: @escaping (ScannedCard) -> Void) {
        guard let cg = image.cgImage else { completion(ScannedCard()); return }
        let request = VNRecognizeTextRequest { req, _ in
            let lines = (req.results as? [VNRecognizedTextObservation])?
                .compactMap { $0.topCandidates(1).first?.string } ?? []
            let card = extract(from: lines)
            DispatchQueue.main.async { completion(card) }
        }
        request.recognitionLevel = .accurate
        request.usesLanguageCorrection = true
        let handler = VNImageRequestHandler(cgImage: cg, options: [:])
        DispatchQueue.global(qos: .userInitiated).async { try? handler.perform([request]) }
    }

    private static func extract(from lines: [String]) -> ScannedCard {
        var card = ScannedCard()
        let emailRegex = try? NSRegularExpression(pattern: "[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}", options: .caseInsensitive)
        for line in lines {
            let range = NSRange(line.startIndex..., in: line)
            if card.email.isEmpty, let m = emailRegex?.firstMatch(in: line, range: range), let r = Range(m.range, in: line) {
                card.email = String(line[r])
            }
            if card.phone.isEmpty {
                let digits = line.filter(\.isNumber)
                if (10...15).contains(digits.count) && line.filter(\.isLetter).count <= 3 {
                    card.phone = line.trimmingCharacters(in: .whitespaces)
                }
            }
        }
        // Name = first "person-like" line: 2–3 words, mostly letters, no digits/@.
        card.name = lines.first(where: { line in
            let words = line.split(separator: " ")
            return (2...3).contains(words.count) && line.filter(\.isLetter).count >= 4
                && !line.contains("@") && line.filter(\.isNumber).isEmpty
        }) ?? ""
        return card
    }
}
