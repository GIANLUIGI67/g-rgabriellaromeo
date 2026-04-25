import Foundation

@MainActor
final class AppStore: ObservableObject {
    @Published var language: AppLanguage = AppLanguage(rawValue: UserDefaults.standard.string(forKey: "gr.language") ?? "") ?? .it {
        didSet {
            UserDefaults.standard.set(language.rawValue, forKey: "gr.language")
        }
    }
    @Published var products: [Product] = []
    @Published var events: [EventRecord] = []
    @Published var cart: [CartItem] = []
    @Published var session: AuthSession?
    @Published var customer: CustomerProfile?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private let sessionKey = "gr.auth.session"
    private let cartKey = "gr.cart"

    var l10n: L10n { L10n(language: language) }
    var cartCount: Int { cart.reduce(0) { $0 + $1.quantity } }
    var cartTotal: Decimal { cart.reduce(0) { $0 + $1.lineTotal } }

    func bootstrap() async {
        loadPersistedState()
        await refreshProducts()
        await refreshEvents()
        await refreshCustomer()
    }

    func refreshProducts() async {
        isLoading = true
        defer { isLoading = false }
        do {
            products = try await APIClient.shared.fetchProducts()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func refreshEvents() async {
        do {
            events = try await APIClient.shared.fetchEvents()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func login(email: String, password: String) async throws {
        let session = try await APIClient.shared.login(email: email, password: password)
        self.session = session
        persistSession()
        await refreshCustomer()
    }

    func register(payload: SignupPayload) async throws {
        try await APIClient.shared.register(payload)
        try await login(email: payload.email, password: payload.password)
    }

    func requestPasswordReset(email: String) async throws {
        try await APIClient.shared.requestPasswordReset(email: email)
    }

    func logout() {
        session = nil
        customer = nil
        UserDefaults.standard.removeObject(forKey: sessionKey)
    }

    func refreshCustomer() async {
        guard let session, let email = session.user.email else { return }
        do {
            customer = try await withAuthenticatedToken { accessToken in
                try await APIClient.shared.fetchCustomer(email: email, accessToken: accessToken)
            }
        } catch {
            if error.isSessionExpired {
                logout()
            } else {
                errorMessage = error.localizedDescription
            }
        }
    }

    func addToCart(_ product: Product) {
        guard product.isAvailable else { return }
        let currentQuantity = cart.first(where: { $0.id == product.id })?.quantity ?? 0
        guard currentQuantity < 99 else {
            errorMessage = "Quantita non valida"
            return
        }

        if let index = cart.firstIndex(where: { $0.id == product.id }) {
            cart[index].quantity += 1
        } else {
            cart.append(CartItem(product: product, quantity: 1))
        }
        persistCart()
    }

    func removeFromCart(_ item: CartItem) {
        cart.removeAll { $0.id == item.id }
        persistCart()
    }

    func setQuantity(for item: CartItem, quantity: Int) {
        guard let index = cart.firstIndex(where: { $0.id == item.id }) else { return }
        if quantity <= 0 {
            cart.remove(at: index)
        } else {
            cart[index].quantity = quantity
        }
        persistCart()
    }

    func requestQuote(shippingMethod: String) async throws -> CheckoutQuote {
        try await withAuthenticatedToken { accessToken in
            try await APIClient.shared.quote(cart: cart, shippingMethod: shippingMethod, accessToken: accessToken)
        }
    }

    func confirmBankTransfer(shippingMethod: String, productionPolicyAccepted: Bool) async throws -> FinalizeResponse {
        let result = try await withAuthenticatedToken { accessToken in
            try await APIClient.shared.finalizeBankTransfer(
                cart: cart,
                shippingMethod: shippingMethod,
                accessToken: accessToken,
                productionPolicyAccepted: productionPolicyAccepted
            )
        }
        cart.removeAll()
        persistCart()
        await refreshProducts()
        await refreshCustomer()
        return result
    }

    private func loadPersistedState() {
        if let sessionData = UserDefaults.standard.data(forKey: sessionKey),
           let session = try? JSONDecoder().decode(AuthSession.self, from: sessionData) {
            self.session = session
        }
        if let cartData = UserDefaults.standard.data(forKey: cartKey),
           let cart = try? JSONDecoder().decode([CartItem].self, from: cartData) {
            self.cart = cart
        }
    }

    private func persistSession() {
        guard let session, let data = try? JSONEncoder().encode(session) else { return }
        UserDefaults.standard.set(data, forKey: sessionKey)
    }

    private func persistCart() {
        guard let data = try? JSONEncoder().encode(cart) else { return }
        UserDefaults.standard.set(data, forKey: cartKey)
    }

    private func withAuthenticatedToken<T>(_ operation: (String) async throws -> T) async throws -> T {
        let currentSession = try await validSession()
        do {
            return try await operation(currentSession.accessToken)
        } catch {
            guard error.isSessionExpired else { throw error }
            let refreshedSession = try await refreshSession(from: session ?? currentSession)
            return try await operation(refreshedSession.accessToken)
        }
    }

    private func validSession() async throws -> AuthSession {
        guard let session else {
            throw AppError.server(l10n.text(.profileRequired))
        }
        if session.isExpiringSoon {
            return try await refreshSession(from: session)
        }
        return session
    }

    private func refreshSession(from currentSession: AuthSession) async throws -> AuthSession {
        guard let refreshToken = currentSession.refreshToken, !refreshToken.isEmpty else {
            logout()
            throw AppError.sessionExpired
        }
        do {
            let refreshedSession = try await APIClient.shared.refreshSession(refreshToken: refreshToken)
            session = refreshedSession
            persistSession()
            return refreshedSession
        } catch {
            logout()
            throw AppError.sessionExpired
        }
    }
}

extension Decimal {
    var euro: String {
        let euroSymbol = "\u{20AC}"
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        formatter.currencySymbol = euroSymbol
        formatter.locale = Locale(identifier: "it_IT")
        return formatter.string(from: self as NSDecimalNumber) ?? "\(euroSymbol)\(self)"
    }
}
