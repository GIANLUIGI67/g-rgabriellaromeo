import Foundation

@MainActor
final class AppStore: ObservableObject {
    @Published var language: AppLanguage = .it
    @Published var products: [Product] = []
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
            customer = try await APIClient.shared.fetchCustomer(email: email, accessToken: session.accessToken)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func addToCart(_ product: Product) {
        guard product.isAvailable else { return }
        let currentQuantity = cart.first(where: { $0.id == product.id })?.quantity ?? 0
        let stock = product.quantita ?? 0
        let canBackorder = product.madeToOrder == true || product.allowBackorder == true
        guard canBackorder || currentQuantity < stock else {
            errorMessage = "Quantita non disponibile"
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
        guard let token = session?.accessToken else {
            throw AppError.server(l10n.text(.profileRequired))
        }
        return try await APIClient.shared.quote(cart: cart, shippingMethod: shippingMethod, accessToken: token)
    }

    func confirmBankTransfer(shippingMethod: String) async throws -> FinalizeResponse {
        guard let token = session?.accessToken else {
            throw AppError.server(l10n.text(.profileRequired))
        }
        let result = try await APIClient.shared.finalizeBankTransfer(cart: cart, shippingMethod: shippingMethod, accessToken: token)
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
}

extension Decimal {
    var euro: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        formatter.currencySymbol = "€"
        formatter.locale = Locale(identifier: "it_IT")
        return formatter.string(from: self as NSDecimalNumber) ?? "€\(self)"
    }
}
