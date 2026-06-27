import Foundation

enum APIError: Error {
    case notAuthenticated
    case badResponse
    case status(Int)
}

// Thin client over the CRM's Next.js API. Every call carries the Supabase access
// token as a Bearer credential. All business logic (scoring, stage/status sync,
// freshness) stays server-side — this client only transports.
struct APIClient {
    let baseURL: URL
    let auth: AuthService

    // MARK: - Transport

    private func send(_ path: String, query: [URLQueryItem] = [], method: String = "GET", jsonBody: [String: Any]? = nil) async throws -> (Data, URLResponse) {
        guard let token = await auth.accessToken() else { throw APIError.notAuthenticated }
        var comps = URLComponents(url: baseURL.appending(path: path), resolvingAgainstBaseURL: false)
        if !query.isEmpty { comps?.queryItems = query }
        guard let url = comps?.url else { throw APIError.badResponse }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.cachePolicy = .reloadIgnoringLocalCacheData
        if let jsonBody {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: jsonBody)
        }
        return try await URLSession.shared.data(for: request)
    }

    private func decode<T: Decodable>(_ data: Data, _ response: URLResponse, as type: T.Type) throws -> T {
        guard let http = response as? HTTPURLResponse else { throw APIError.badResponse }
        guard (200..<300).contains(http.statusCode) else { throw APIError.status(http.statusCode) }
        return try JSONDecoder().decode(T.self, from: data)
    }

    // MARK: - Today
    func today() async throws -> TodayData {
        let (data, response) = try await send("api/today")
        let result = try decode(data, response, as: TodayResponse.self)
        guard result.success, let payload = result.data else { throw APIError.badResponse }
        return payload
    }

    // MARK: - Leads (server-scored + sorted)
    func leads(search: String) async throws -> [Lead] {
        let (data, response) = try await send("api/leads/search", query: [
            URLQueryItem(name: "search", value: search),
            URLQueryItem(name: "sort", value: "score"),
            URLQueryItem(name: "pageSize", value: "50"),
        ])
        return try decode(data, response, as: LeadsResponse.self).data ?? []
    }

    // MARK: - Lead detail (header + Coach + timeline, one round-trip)
    func leadDetail(id: String) async throws -> LeadDetailData {
        let (data, response) = try await send("api/leads/\(id)")
        let result = try decode(data, response, as: LeadDetailResponse.self)
        guard result.success, let payload = result.data else { throw APIError.badResponse }
        return payload
    }

    // MARK: - Timeline
    func notes(leadId: String) async throws -> [Note] {
        let (data, response) = try await send("api/notes", query: [URLQueryItem(name: "lead_id", value: leadId)])
        return try decode(data, response, as: NotesResponse.self).data ?? []
    }

    func appointments(leadId: String) async throws -> [Appointment] {
        let (data, response) = try await send("api/appointments", query: [URLQueryItem(name: "lead_id", value: leadId)])
        return try decode(data, response, as: AppointmentsResponse.self).data ?? []
    }

    // MARK: - Appointments (reuse the web CRUD; the server keeps the rules)
    func allAppointments() async throws -> [Appointment] {
        let (data, response) = try await send("api/appointments")
        return try decode(data, response, as: AppointmentsResponse.self).data ?? []
    }

    func createAppointment(leadId: String, title: String, type: String, startsAt: String, location: String?) async throws -> Appointment {
        var body: [String: Any] = ["lead_id": leadId, "title": title, "type": type, "starts_at": startsAt, "status": "scheduled"]
        if let location, !location.isEmpty { body["location"] = location }
        let (data, response) = try await send("api/appointments", method: "POST", jsonBody: body)
        let result = try decode(data, response, as: AppointmentResponse.self)
        guard result.success, let appt = result.data else { throw APIError.badResponse }
        return appt
    }

    func updateAppointment(id: String, fields: [String: Any]) async throws {
        var body = fields
        body["id"] = id
        let (data, response) = try await send("api/appointments", method: "PATCH", jsonBody: body)
        _ = try decode(data, response, as: GenericResponse.self)
    }

    func deleteAppointment(id: String) async throws {
        let (data, response) = try await send("api/appointments", query: [URLQueryItem(name: "id", value: id)], method: "DELETE")
        _ = try decode(data, response, as: GenericResponse.self)
    }

    // MARK: - Mutations (reuse the web endpoints; server keeps the logic)
    func updateStage(leadId: String, stage: String) async throws {
        let (data, response) = try await send("api/pipeline", method: "PATCH", jsonBody: ["lead_id": leadId, "stage": stage])
        _ = try decode(data, response, as: GenericResponse.self)
    }

    func updateFollowup(leadId: String, isoDate: String) async throws {
        let (data, response) = try await send("api/leads", method: "PATCH", jsonBody: ["id": leadId, "next_followup": isoDate])
        _ = try decode(data, response, as: GenericResponse.self)
    }

    func addNote(leadId: String, content: String) async throws -> Note {
        let (data, response) = try await send("api/notes", method: "POST", jsonBody: ["lead_id": leadId, "content": content])
        let result = try decode(data, response, as: NoteResponse.self)
        guard result.success, let note = result.data else { throw APIError.badResponse }
        return note
    }

    func registerPushToken(_ token: String) async throws {
        let (data, response) = try await send("api/push/register-ios", method: "POST",
                                              jsonBody: ["token": token, "label": "Jordan iPhone"])
        _ = try decode(data, response, as: GenericResponse.self)
    }
}
