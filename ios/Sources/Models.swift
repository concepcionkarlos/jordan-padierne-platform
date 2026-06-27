import Foundation

// Mirrors the GET /api/today response contract.
struct TodayResponse: Decodable {
    let success: Bool
    let data: TodayData?
}

struct TodayData: Decodable {
    let brief: [String]
    let actions: [CoachAction]
    let counts: Counts
    let nextAppointment: NextAppointment?
}

// A single Coach next-best-action (the primary mobile content).
struct CoachAction: Decodable, Identifiable {
    var id: String { leadId }
    let leadId: String
    let name: String
    let phone: String?
    let stage: String
    let score: Int
    let urgency: String     // now / today / soon / nurture
    let title: String
    let reason: String
    let emoji: String
    let actionLabel: String
}

struct NextAppointment: Decodable, Identifiable {
    let id: String
    let title: String
    let startTime: String
    let type: String?
    let location: String?
    let leadName: String?
    let leadPhone: String?
}

struct Counts: Decodable {
    let hotLeads: Int
    let urgentLeads: Int
    let overdueFollowups: Int
    let todaysTasks: Int
}

// ─── Leads ───────────────────────────────────────────────────────────────────
struct LeadsResponse: Decodable {
    let success: Bool
    let data: [Lead]?
    let total: Int?
}

struct Lead: Decodable, Identifiable {
    let id: String
    let fullName: String
    let email: String?
    let phone: String?
    let pipelineStage: String
    let status: String?
    let hotScore: Int?
    let lastContact: String?
    let nextFollowup: String?
    let preferredArea: String?
    let clientType: String?
    let source: String?
    let createdAt: String
    let score: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case fullName = "full_name"
        case email, phone
        case pipelineStage = "pipeline_stage"
        case status
        case hotScore = "hot_score"
        case lastContact = "last_contact"
        case nextFollowup = "next_followup"
        case preferredArea = "preferred_area"
        case clientType = "client_type"
        case source
        case createdAt = "created_at"
        case score
    }
}

extension Lead {
    /// Minimal lead built from a Coach action — enough to open detail (the timeline loads by id).
    init(minimalId id: String, name: String, phone: String?, stage: String, score: Int?) {
        self.init(id: id, fullName: name, email: nil, phone: phone, pipelineStage: stage,
                  status: nil, hotScore: nil, lastContact: nil, nextFollowup: nil,
                  preferredArea: nil, clientType: nil, source: nil, createdAt: "", score: score)
    }
}

// Pipeline stages — display only. The status-sync business logic stays on the
// server (PATCH /api/pipeline); this is just the picker's labels.
enum LeadStage: String, CaseIterable, Identifiable {
    case new = "NEW"
    case qualified = "QUALIFIED"
    case contacted = "CONTACTED"
    case showing = "SHOWING_SCHEDULED"
    case negotiation = "NEGOTIATION"
    case closed = "CLOSED"
    case lost = "LOST"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .new: return "New"
        case .qualified: return "Qualified"
        case .contacted: return "Contacted"
        case .showing: return "Showing Scheduled"
        case .negotiation: return "In Negotiation"
        case .closed: return "Closed"
        case .lost: return "Lost"
        }
    }
}

// ─── Timeline (notes + appointments) ─────────────────────────────────────────
struct NotesResponse: Decodable {
    let success: Bool
    let data: [Note]?
}

struct Note: Decodable, Identifiable {
    let id: String
    let content: String
    let author: String
    let createdAt: String
    enum CodingKeys: String, CodingKey { case id, content, author, createdAt = "created_at" }
}

struct AppointmentsResponse: Decodable {
    let success: Bool
    let data: [Appointment]?
}

struct Appointment: Decodable, Identifiable {
    let id: String
    let title: String
    let type: String?
    let startsAt: String
    let status: String?
    enum CodingKeys: String, CodingKey { case id, title, type, startsAt = "starts_at", status }
}

struct TimelineItem: Identifiable {
    enum Kind { case note, appointment }
    let id: String
    let kind: Kind
    let title: String
    let subtitle: String?
    let date: Date?

    var icon: String {
        switch kind {
        case .note: return "note.text"
        case .appointment: return "calendar"
        }
    }
}

enum TimelineBuilder {
    static func merge(notes: [Note], appointments: [Appointment]) -> [TimelineItem] {
        var items: [TimelineItem] = []
        for n in notes {
            items.append(TimelineItem(id: "note-\(n.id)", kind: .note, title: n.content, subtitle: n.author, date: AppDate.parse(n.createdAt)))
        }
        for a in appointments {
            items.append(TimelineItem(id: "appt-\(a.id)", kind: .appointment, title: a.title, subtitle: a.type, date: AppDate.parse(a.startsAt)))
        }
        return items.sorted { ($0.date ?? .distantPast) > ($1.date ?? .distantPast) }
    }
}

struct GenericResponse: Decodable {
    let success: Bool
}

struct NoteResponse: Decodable {
    let success: Bool
    let data: Note?
}

// ─── Lead detail (header + Coach + timeline in one call) ─────────────────────
// Mirrors GET /api/leads/:id — the lead, its Smart Score + temperature, the
// Coach's next-best-action, and the full timeline.
struct LeadDetailResponse: Decodable {
    let success: Bool
    let data: LeadDetailData?
}

struct LeadDetailData: Decodable {
    let lead: Lead
    let score: Int?
    let scorePercentile: Int?     // "Top X% of your pipeline" (null when not meaningful)
    let temperature: Int?
    let freshness: Freshness?
    let coach: LeadCoach
    let notes: [Note]
    let appointments: [Appointment]
}

// How recently this lead was engaged — drives the activity status copy.
struct Freshness: Decodable {
    let level: String    // fresh / aging / stale / cold
    let ageDays: Int
}

// The single recommended next move for this lead (server-computed via getNextAction).
struct LeadCoach: Decodable {
    let title: String        // what to do
    let reason: String       // why it matters
    let urgency: String      // now / today / soon / nurture
    let emoji: String
    let actionType: String   // call / whatsapp / template / schedule / advance / qualify
    let actionLabel: String
    let stage: String?       // target stage when actionType is 'advance'
}
