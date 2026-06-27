import SwiftUI

// "What's next?" after a showing — every common follow-on action in one tap.
// Reuses the existing endpoints (appointments, notes, pipeline, follow-up); no
// new business logic. Loads the full lead so email/stage actions are available.
struct PostShowingSheet: View {
    let api: APIClient
    let appointment: Appointment
    var onDone: () -> Void

    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL
    @State private var lead: Lead?
    @State private var note = ""
    @State private var scheduling = false
    @State private var status: String?

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Button { Task { await complete() } } label: {
                        Label(status == "completed" ? "Showing completed ✓" : "Mark showing complete",
                              systemImage: "checkmark.circle.fill")
                    }
                    .disabled(status == "completed")
                }

                Section("Say thank you") {
                    if let url = PhoneLinks.whatsapp(phone, message: thankYou) {
                        Link(destination: url) { Label("Thank-you on WhatsApp", systemImage: "message.fill") }
                    }
                    if let email = lead?.email, let url = MailLinks.mailto(email) {
                        Link(destination: url) { Label("Thank-you email", systemImage: "envelope.fill") }
                    }
                }

                Section("Keep it moving") {
                    Button { Task { await followUp() } } label: { Label("Follow up in 2 days", systemImage: "bell.fill") }
                    Button { scheduling = true } label: { Label("Schedule next showing", systemImage: "calendar.badge.plus") }
                    if let lead {
                        Menu {
                            ForEach(LeadStage.allCases) { s in
                                Button(s.label) { Task { await setStage(s.rawValue) } }
                            }
                        } label: {
                            Label("Stage: \(LeadStage(rawValue: lead.pipelineStage)?.label ?? lead.pipelineStage)",
                                  systemImage: "arrow.triangle.branch")
                        }
                    }
                }

                Section("Capture a note") {
                    TextField("How did it go?", text: $note, axis: .vertical).lineLimit(2...4)
                    Button("Save note") { Task { await saveNote() } }
                        .disabled(note.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .navigationTitle("Wrap up")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) { Button("Done") { onDone(); dismiss() } }
            }
            .task {
                status = appointment.status
                if let id = appointment.leadId { lead = (try? await api.leadDetail(id: id))?.lead }
            }
            .sheet(isPresented: $scheduling) {
                if let lead { AppointmentSheet(api: api, lead: lead) { Haptics.success() } }
            }
        }
    }

    private var phone: String? { lead?.phone ?? appointment.lead?.phone }
    private var firstName: String {
        (appointment.lead?.fullName ?? lead?.fullName ?? "there").split(separator: " ").first.map(String.init) ?? "there"
    }
    private var thankYou: String {
        "Hi \(firstName)! Thank you for your time today — it was great showing you the property. Let me know your thoughts whenever you're ready. 🙌"
    }

    private func complete() async {
        try? await api.updateAppointment(id: appointment.id, fields: ["status": "completed"])
        status = "completed"; Haptics.success()
    }
    private func followUp() async {
        guard let id = appointment.leadId else { return }
        let date = Calendar.current.date(byAdding: .day, value: 2, to: Date()) ?? Date()
        try? await api.updateFollowup(leadId: id, isoDate: ISO8601DateFormatter().string(from: date))
        Haptics.success()
    }
    private func setStage(_ s: String) async {
        guard let id = appointment.leadId else { return }
        try? await api.updateStage(leadId: id, stage: s)
        Haptics.success()
        lead = (try? await api.leadDetail(id: id))?.lead
    }
    private func saveNote() async {
        guard let id = appointment.leadId else { return }
        _ = try? await api.addNote(leadId: id, content: note.trimmingCharacters(in: .whitespaces))
        note = ""; Haptics.success()
    }
}
