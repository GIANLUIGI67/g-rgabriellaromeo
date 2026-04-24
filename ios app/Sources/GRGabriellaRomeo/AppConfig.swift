import Foundation

enum AppConfig {
    static let supabaseURL = URL(string: "https://mdpplumkmxjwyzunpjpg.supabase.co")!
    static let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcHBsdW1rbXhqd3l6dW5wanBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3OTMzMzUsImV4cCI6MjA5MjM2OTMzNX0.m2zTmVINP-wYHsNPd-6vMH3IyPoaplVyM0ZP4YllRN0"
    static let webAPIBaseURL = URL(string: "https://g-rgabriellaromeo.vercel.app")!
    static let storageBucket = "immagini"

    static func imageURL(for path: String?) -> URL? {
        guard let path, !path.isEmpty else { return nil }
        if let direct = URL(string: path), direct.scheme != nil {
            return direct
        }
        let encoded = path
            .split(separator: "/")
            .map { String($0).addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? String($0) }
            .joined(separator: "/")
        return supabaseURL.appending(path: "storage/v1/object/public/\(storageBucket)/\(encoded)")
    }
}
