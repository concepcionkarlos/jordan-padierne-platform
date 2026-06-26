import Foundation

// Static configuration. The Supabase URL + anon/publishable key are PUBLIC client
// credentials (the same the website ships to browsers) — safe to embed. The
// service-role key is never included.
enum AppConfig {
    static let supabaseURL = URL(string: "https://fwikhedmtouggqpiymrc.supabase.co")!
    static let supabaseAnonKey = "sb_publishable_hPxS73gY3AK5y88sLhTwDQ_MaCUJTe1"
    static let apiBaseURL = URL(string: "https://jordanpadierne.com")!
}
