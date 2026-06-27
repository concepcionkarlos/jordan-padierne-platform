import SwiftUI
import ContactsUI

// Fast field lead capture (open-house check-in / sign call), with one-tap import
// from the iPhone's Contacts. Creates the lead via the existing /api/leads POST.
struct NewLeadView: View {
    let api: APIClient
    var onSaved: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var fullName = ""
    @State private var phone = ""
    @State private var email = ""
    @State private var area = ""
    @State private var source = "open_house"
    @State private var clientType = "buyer"
    @State private var notes = ""
    @State private var showPicker = false
    @State private var saving = false

    private let sources = ["open_house", "referral", "website", "sign_call", "cold_call", "other"]
    private let types = ["buyer", "seller", "renter", "investor"]

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Button { showPicker = true } label: {
                        Label("Import from Contacts", systemImage: "person.crop.circle.badge.plus")
                    }
                }
                Section("Lead") {
                    TextField("Full name", text: $fullName).textContentType(.name)
                    TextField("Phone", text: $phone).textContentType(.telephoneNumber).keyboardType(.phonePad)
                    TextField("Email", text: $email).textContentType(.emailAddress)
                        .keyboardType(.emailAddress).textInputAutocapitalization(.never).autocorrectionDisabled()
                    TextField("Preferred area", text: $area)
                }
                Section {
                    Picker("Source", selection: $source) {
                        ForEach(sources, id: \.self) { Text(prettify($0)).tag($0) }
                    }
                    Picker("Type", selection: $clientType) {
                        ForEach(types, id: \.self) { Text($0.capitalized).tag($0) }
                    }
                    TextField("Notes", text: $notes, axis: .vertical).lineLimit(2...4)
                }
            }
            .navigationTitle("New lead")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { Task { await save() } }.disabled(!canSave || saving)
                }
            }
            .sheet(isPresented: $showPicker) {
                ContactPicker { fill(from: $0) }.ignoresSafeArea()
            }
        }
    }

    private var canSave: Bool { !fullName.trimmingCharacters(in: .whitespaces).isEmpty }

    private func fill(from c: CNContact) {
        let name = [c.givenName, c.familyName].filter { !$0.isEmpty }.joined(separator: " ")
        if !name.isEmpty { fullName = name }
        if let p = c.phoneNumbers.first?.value.stringValue { phone = p }
        if let e = c.emailAddresses.first?.value as String? { email = e }
    }

    private func save() async {
        saving = true
        defer { saving = false }
        var fields: [String: Any] = [
            "full_name": fullName.trimmingCharacters(in: .whitespaces),
            "source": source, "client_type": clientType,
            "pipeline_stage": "NEW", "status": "new",
        ]
        if !phone.isEmpty { fields["phone"] = phone }
        if !email.isEmpty { fields["email"] = email }
        if !area.isEmpty { fields["preferred_area"] = area }
        if !notes.isEmpty { fields["notes"] = notes }
        do {
            try await api.createLead(fields: fields)
            Haptics.success()
            onSaved()
            dismiss()
        } catch {}
    }

    private func prettify(_ s: String) -> String {
        s.replacingOccurrences(of: "_", with: " ").capitalized
    }
}

// The system Contacts picker — out-of-process, so it needs no Contacts permission.
struct ContactPicker: UIViewControllerRepresentable {
    var onPick: (CNContact) -> Void

    func makeUIViewController(context: Context) -> CNContactPickerViewController {
        let picker = CNContactPickerViewController()
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: CNContactPickerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(onPick: onPick) }

    final class Coordinator: NSObject, CNContactPickerDelegate {
        let onPick: (CNContact) -> Void
        init(onPick: @escaping (CNContact) -> Void) { self.onPick = onPick }
        func contactPicker(_ picker: CNContactPickerViewController, didSelect contact: CNContact) {
            onPick(contact)
        }
    }
}
