import Foundation

enum AppConfig {
    static let supabaseURL = URL(string: infoValue("GR_SUPABASE_URL", fallback: "https://mdpplumkmxjwyzunpjpg.supabase.co"))!
    static let supabaseAnonKey = infoValue("GR_SUPABASE_ANON_KEY")
    static let stripePublishableKey = infoValue("GR_STRIPE_PK")
    static let paypalClientId = infoValue("GR_PAYPAL_CLIENT_ID")
    static let paypalEnabled = infoValue("GR_PAYPAL_ENABLED") == "true"
    static let webAPIBaseURL = URL(string: infoValue("GR_WEB_API_BASE_URL", fallback: "https://g-rgabriellaromeo.vercel.app"))!
    static let storageBucket = "immagini"

    static func imageURL(for path: String?) -> URL? {
        guard let rawPath = path else { return nil }
        let cleanedPath = rawPath
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .first { !$0.isEmpty } ?? ""
        guard !cleanedPath.isEmpty else { return nil }

        if let direct = URL(string: cleanedPath), direct.scheme != nil {
            return direct
        }
        let encoded = cleanedPath
            .split(separator: "/")
            .map { String($0).addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? String($0) }
            .joined(separator: "/")
        return URL(string: "\(supabaseURL.absoluteString)/storage/v1/object/public/\(storageBucket)/\(encoded)")
    }

    private static func infoValue(_ key: String, fallback: String = "") -> String {
        let value = Bundle.main.object(forInfoDictionaryKey: key) as? String
        guard let value, !value.isEmpty, !value.hasPrefix("$(") else { return fallback }
        return value
    }
}
