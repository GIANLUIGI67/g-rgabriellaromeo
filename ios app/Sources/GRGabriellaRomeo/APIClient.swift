import Foundation

final class APIClient {
    static let shared = APIClient()

    private let jsonEncoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .useDefaultKeys
        return encoder
    }()

    private let jsonDecoder = JSONDecoder()

    private init() {}

    func fetchProducts() async throws -> [Product] {
        var components = URLComponents(url: AppConfig.supabaseURL.appending(path: "rest/v1/products"), resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "order", value: "created_at.desc")
        ]
        var request = URLRequest(url: components.url!)
        applySupabaseHeaders(to: &request)
        return try await send(request)
    }

    func fetchEvents() async throws -> [EventRecord] {
        var components = URLComponents(url: AppConfig.supabaseURL.appending(path: "rest/v1/eventi"), resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "order", value: "data_inizio.desc")
        ]
        var request = URLRequest(url: components.url!)
        applySupabaseHeaders(to: &request)
        return try await send(request)
    }

    func login(email: String, password: String) async throws -> AuthSession {
        var components = URLComponents(url: AppConfig.supabaseURL.appending(path: "auth/v1/token"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "grant_type", value: "password")]
        var request = URLRequest(url: components.url!)
        request.httpMethod = "POST"
        applySupabaseHeaders(to: &request)
        request.httpBody = try jsonEncoder.encode(["email": email, "password": password])
        return try await send(request)
    }

    func register(_ payload: SignupPayload) async throws {
        var request = URLRequest(url: AppConfig.webAPIBaseURL.appending(path: "api/auth/signup"))
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try jsonEncoder.encode(payload)
        let _: EmptyResponse = try await send(request)
    }

    func requestPasswordReset(email: String) async throws {
        var request = URLRequest(url: AppConfig.supabaseURL.appending(path: "auth/v1/recover"))
        request.httpMethod = "POST"
        applySupabaseHeaders(to: &request)
        request.httpBody = try jsonEncoder.encode([
            "email": email,
            "redirect_to": "\(AppConfig.webAPIBaseURL.absoluteString)/reset-password"
        ])
        let _: EmptyResponse = try await send(request)
    }

    func fetchCustomer(email: String, accessToken: String) async throws -> CustomerProfile? {
        var components = URLComponents(url: AppConfig.supabaseURL.appending(path: "rest/v1/clienti"), resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "select", value: "*"),
            URLQueryItem(name: "email", value: "eq.\(email)")
        ]
        var request = URLRequest(url: components.url!)
        applySupabaseHeaders(to: &request, accessToken: accessToken)
        let profiles: [CustomerProfile] = try await send(request)
        return profiles.first
    }

    func quote(cart: [CartItem], shippingMethod: String, accessToken: String) async throws -> CheckoutQuote {
        let payload = QuoteRequest(cart: cart.map(CheckoutCartItem.init(item:)), shippingMethod: shippingMethod)
        var request = URLRequest(url: AppConfig.webAPIBaseURL.appending(path: "api/checkout/quote"))
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.httpBody = try jsonEncoder.encode(payload)
        let response: QuoteResponse = try await send(request)
        return response.quote
    }

    func finalizeBankTransfer(
        cart: [CartItem],
        shippingMethod: String,
        accessToken: String,
        productionPolicyAccepted: Bool
    ) async throws -> FinalizeResponse {
        let payload = FinalizeRequest(
            cart: cart.map(CheckoutCartItem.init(item:)),
            shippingMethod: shippingMethod,
            paymentMethod: "bonifico",
            paymentStatus: "in attesa bonifico",
            transactionId: nil,
            productionPolicyAccepted: productionPolicyAccepted
        )
        var request = URLRequest(url: AppConfig.webAPIBaseURL.appending(path: "api/checkout/finalize"))
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")
        request.httpBody = try jsonEncoder.encode(payload)
        return try await send(request)
    }

    private func applySupabaseHeaders(to request: inout URLRequest, accessToken: String? = nil) {
        request.addValue(AppConfig.supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.addValue("Bearer \(accessToken ?? AppConfig.supabaseAnonKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    }

    private func send<T: Decodable>(_ request: URLRequest) async throws -> T {
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw AppError.network("Risposta server non valida")
        }

        guard (200..<300).contains(http.statusCode) else {
            if http.statusCode == 400,
               let body = String(data: data, encoding: .utf8),
               body.localizedCaseInsensitiveContains("invalid login credentials") {
                throw AppError.server("Credenziali non valide")
            }
            if let apiError = try? jsonDecoder.decode(APIErrorResponse.self, from: data),
               let message = apiError.error,
               !message.isEmpty {
                throw AppError.server(message)
            }
            let body = String(data: data, encoding: .utf8) ?? "HTTP \(http.statusCode)"
            throw AppError.server(body)
        }

        if T.self == EmptyResponse.self {
            return EmptyResponse() as! T
        }
        if data.isEmpty {
            return EmptyResponse() as! T
        }
        return try jsonDecoder.decode(T.self, from: data)
    }
}

struct EmptyResponse: Decodable {}

enum AppError: LocalizedError {
    case server(String)
    case network(String)

    var errorDescription: String? {
        switch self {
        case .server(let message), .network(let message):
            return message
        }
    }
}
