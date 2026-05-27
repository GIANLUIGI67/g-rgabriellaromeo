import SwiftUI

struct CartView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        CheckoutView()
            .environmentObject(store)
    }
}

private enum CheckoutPaymentMethod: String, CaseIterable, Identifiable {
    case bankTransfer
    case paypal
    case card

    var id: String { rawValue }
}

struct CheckoutView: View {
    @EnvironmentObject private var store: AppStore
    @State private var isRegistering = false
    @State private var email = ""
    @State private var password = ""
    @State private var nome = ""
    @State private var cognome = ""
    @State private var paese = "Italia"
    @State private var citta = "Roma"
    @State private var indirizzo = ""
    @State private var codicePostale = ""
    @State private var telefono1 = ""
    @State private var telefono2 = ""
    @State private var shippingMethod = "ritiro"
    @State private var quote: CheckoutQuote?
    @State private var isAccepted = false
    @State private var isProductionPolicyAccepted = false
    @State private var isSubmitting = false
    @State private var confirmedOrder: ConfirmedOrderRoute?
    @State private var infoMessage: String?
    @State private var checkoutError: String?
    @State private var selectedPaymentMethod: CheckoutPaymentMethod = .bankTransfer

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Riepilogo Ordine")
                            .font(.custom("Michroma-Regular", size: 24))
                            .foregroundStyle(Color.grGold)
                            .lineLimit(1)
                            .minimumScaleFactor(0.62)
                            .frame(maxWidth: .infinity, alignment: .center)

                        if let checkoutError, !checkoutError.isEmpty {
                            Text(checkoutError)
                                .font(.custom("Michroma-Regular", size: 12))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 10)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(Color.red.opacity(0.82))
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                        }

                        checkoutSummary
                        CheckoutStepsView(isAuthenticated: store.session != nil)

                        if store.session == nil {
                            checkoutAuthSection
                        } else {
                            checkoutDetailsSection
                        }
                    }
                    .padding(.horizontal, 18)
                    .padding(.vertical, 20)
                    .frame(maxWidth: 390)
                    .background(Color(red: 0.12, green: 0.12, blue: 0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal, 16)
                    .padding(.top, 86)
                }
                .padding(.bottom, 36)
            }

            WebBackButton()
                .padding(.top, 48)
                .padding(.leading, 14)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .toolbar(.hidden, for: .navigationBar)
        .task { await loadQuote() }
        .onChange(of: shippingMethod) { _, _ in
            Task { await loadQuote() }
        }
        .task {
            syncProfileFieldsFromStore()
            normalizeSelectedPaymentMethod()
        }
        .onChange(of: store.customer?.email) { _, _ in
            syncProfileFieldsFromStore()
        }
        .navigationDestination(item: $confirmedOrder) { order in
            OrderConfirmedView(orderId: order.id, isBankTransfer: order.isBankTransfer)
        }
    }

    private var checkoutSummary: some View {
        VStack(alignment: .leading, spacing: 10) {
            if store.cart.isEmpty {
                Text("Il carrello è vuoto.")
                    .font(.custom("Michroma-Regular", size: 16))
                    .foregroundStyle(Color.grGold.opacity(0.75))
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 12)
            } else {
                ForEach(store.cart) { item in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(alignment: .top) {
                            Text("\(item.quantity)x \(item.product.nome)")
                                .font(.custom("Michroma-Regular", size: 13))
                                .foregroundStyle(Color.grGold)
                                .lineLimit(2)
                                .minimumScaleFactor(0.72)
                            Spacer()
                            Text(item.lineTotal.euro)
                                .font(.system(size: 14, weight: .regular))
                                .foregroundStyle(Color.grGold)
                                .lineLimit(1)
                        }

                        HStack {
                            Spacer()
                            Button("Rimuovi") {
                                store.removeFromCart(item)
                                Task { await loadQuote() }
                            }
                            .font(.custom("Michroma-Regular", size: 13))
                            .foregroundStyle(Color.grGold.opacity(0.65))
                        }
                    }
                    .padding(.bottom, 6)
                }

                if let quote {
                    VStack(spacing: 8) {
                        Row(label: "Totale:", value: quote.subtotal.euro)
                        if quote.discountAmount > 0 {
                            Row(label: "Sconto primo ordine", value: "-\(quote.discountAmount.euro)")
                                .foregroundStyle(Color.green)
                        }
                        Row(label: "Totale da pagare:", value: quote.total.euro, isBold: true)
                    }
                    .font(.custom("Michroma-Regular", size: 16))
                    .foregroundStyle(Color.grGold)
                    .padding(.top, 8)
                }
            }
        }
    }

    private var checkoutAuthSection: some View {
        VStack(alignment: .leading, spacing: 11) {
            Text("\(store.l10n.text(.login)) / \(store.l10n.text(.register))")
                .font(.custom("Michroma-Regular", size: 21))
                .foregroundStyle(Color.grGold)
                .lineLimit(1)
                .minimumScaleFactor(0.56)

            CheckoutField(text: $email, placeholder: "Email", keyboard: .emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
            CheckoutSecureField(text: $password, placeholder: "Password")

            HStack(spacing: 10) {
                Button {
                    Task { await submitAuth() }
                } label: {
                    ZStack {
                        if isSubmitting {
                            ProgressView().tint(.white)
                        } else {
                            Text(isRegistering ? store.l10n.text(.register) : store.l10n.text(.login))
                                .font(.custom("Michroma-Regular", size: 15))
                                .lineLimit(1)
                                .minimumScaleFactor(0.62)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .foregroundStyle(Color.grGold)
                    .background(Color(red: 0.0, green: 0.45, blue: 0.95))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                .disabled(isSubmitting)

                Button {
                    withAnimation(.easeInOut(duration: 0.2)) { isRegistering.toggle() }
                } label: {
                    Text(isRegistering ? store.l10n.text(.login) : store.l10n.text(.createAccount))
                        .font(.custom("Michroma-Regular", size: 14))
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                        .minimumScaleFactor(0.56)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .foregroundStyle(Color.grGold)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.grGold.opacity(0.18), lineWidth: 1.2))
                }
            }

            Button("Password dimenticata?") {
                Task { await forgotPassword() }
            }
            .font(.custom("Michroma-Regular", size: 13))
            .foregroundStyle(.blue)
            .lineLimit(1)
            .minimumScaleFactor(0.7)

            if let infoMessage, !infoMessage.isEmpty {
                Text(infoMessage)
                    .font(.custom("Michroma-Regular", size: 14))
                    .foregroundStyle(.green)
            }

            if isRegistering {
                VStack(spacing: 8) {
                    CheckoutField(text: $nome, placeholder: "Nome")
                    CheckoutField(text: $cognome, placeholder: "Cognome")
                    CheckoutField(text: $paese, placeholder: "Paese")
                    CheckoutField(text: $citta, placeholder: "Citta")
                    CheckoutField(text: $indirizzo, placeholder: "Indirizzo")
                    CheckoutField(text: $codicePostale, placeholder: "Codice postale", keyboard: .numberPad)
                    CheckoutField(text: $telefono1, placeholder: "Telefono 1", keyboard: .phonePad)
                    CheckoutField(text: $telefono2, placeholder: "Telefono 2", keyboard: .phonePad)
                }
                .padding(.top, 8)
            }
        }
    }

    private var checkoutDetailsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("I Tuoi Dettagli")
                .font(.custom("Michroma-Regular", size: 22))
                .foregroundStyle(Color.grGold)
                .lineLimit(1)
                .minimumScaleFactor(0.7)

            VStack(spacing: 8) {
                CheckoutField(text: $nome, placeholder: "Nome")
                CheckoutField(text: $cognome, placeholder: "Cognome")
                CheckoutField(text: $email, placeholder: "Email", keyboard: .emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .disabled(true)
                    .opacity(0.8)
                CheckoutField(text: $indirizzo, placeholder: "Indirizzo")
                CheckoutField(text: $citta, placeholder: "Citta")
                CheckoutField(text: $codicePostale, placeholder: "Codice postale", keyboard: .numbersAndPunctuation)
                CheckoutField(text: $paese, placeholder: "Paese")
                CheckoutField(text: $telefono1, placeholder: "Telefono 1", keyboard: .phonePad)
                CheckoutField(text: $telefono2, placeholder: "Telefono 2", keyboard: .phonePad)
            }

            Text(store.l10n.text(.shipping)).webSectionTitle()

            Picker(store.l10n.text(.shipping), selection: $shippingMethod) {
                Text(store.l10n.text(.storePickup)).tag("ritiro")
                Text(store.l10n.text(.standardShipping)).tag("standard")
                Text(store.l10n.text(.expressShipping)).tag("express")
            }
            .pickerStyle(.menu)
            .tint(.white)
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.grGold.opacity(0.35)))

            Text(store.l10n.text(.payment)).webSectionTitle()

            VStack(spacing: 8) {
                if isPayPalEnabled {
                    paymentMethodButton(title: "PayPal", method: .paypal)
                }
                if isCardEnabled {
                    paymentMethodButton(title: "Carta di Credito", method: .card)
                }
                paymentMethodButton(title: store.l10n.text(.bankTransfer), method: .bankTransfer)
            }

            if selectedPaymentMethod == .bankTransfer {
                VStack(alignment: .leading, spacing: 10) {
                    Text(store.l10n.text(.bankTransfer))
                    Text("IBAN: IT10 Y050 3426 2010 0000 0204 438")
                    Text("Intestato a: G-R Gabriella Romeo")
                    Text("Causale: Ordine GR")
                }
                .font(.custom("Michroma-Regular", size: 12))
                .foregroundStyle(Color.grGold.opacity(0.8))
                .padding()
                .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.grGold.opacity(0.25)))
            } else {
                VStack(alignment: .leading, spacing: 10) {
                    Text(selectedPaymentMethod == .paypal ? "PayPal" : "Carta di Credito")
                    Text("Per completare in modo sicuro questo pagamento, verrai reindirizzato al checkout web ufficiale.")
                        .foregroundStyle(Color.grGold.opacity(0.8))
                }
                .font(.custom("Michroma-Regular", size: 12))
                .padding()
                .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.grGold.opacity(0.25)))
            }

            if quote?.productionPolicyRequired == true {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Policy di produzione")
                        .font(.custom("Michroma-Regular", size: 15))
                        .foregroundStyle(Color.grGold)
                    Text("Uno o più prodotti non sono disponibili in pronta consegna. Confermando la policy accetti che l'ordine venga prodotto e che i tempi di evasione dipendano dalla produzione.")
                        .font(.custom("Michroma-Regular", size: 13))
                        .foregroundStyle(Color.grGold.opacity(0.82))
                    if let items = quote?.productionItems, !items.isEmpty {
                        Text(items.map(\.nome).joined(separator: ", "))
                            .font(.custom("Michroma-Regular", size: 13))
                            .foregroundStyle(Color.grGold)
                    }
                    Toggle("Accetto la policy di produzione", isOn: $isProductionPolicyAccepted)
                        .font(.custom("Michroma-Regular", size: 13))
                        .foregroundStyle(Color.grGold.opacity(0.86))
                        .tint(.blue)
                }
                .padding()
                .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.grGold.opacity(0.35)))
            }

            if selectedPaymentMethod == .bankTransfer {
                Toggle(store.l10n.text(.terms), isOn: $isAccepted)
                    .font(.custom("Michroma-Regular", size: 12))
                    .foregroundStyle(Color.grGold.opacity(0.82))
                    .tint(.blue)

                Button {
                    Task { await confirm() }
                } label: {
                    if isSubmitting {
                        ProgressView().tint(.white)
                    } else {
                        Text(store.l10n.text(.confirmBankTransfer))
                            .font(.custom("Michroma-Regular", size: 15))
                            .lineLimit(1)
                            .minimumScaleFactor(0.62)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .foregroundStyle(Color.grGold)
                .background(isSubmitting ? Color.green.opacity(0.35) : Color.green.opacity(0.72))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .disabled(isSubmitting)
            } else {
                Button {
                    Task { await continueToWebCheckout() }
                } label: {
                    if isSubmitting {
                        ProgressView().tint(.white)
                    } else {
                        Text(selectedPaymentMethod == .paypal ? "Continua con PayPal" : "Continua con Carta")
                            .font(.custom("Michroma-Regular", size: 15))
                            .lineLimit(1)
                            .minimumScaleFactor(0.62)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .foregroundStyle(Color.grGold)
                .background(isSubmitting ? Color.blue.opacity(0.35) : Color.blue.opacity(0.72))
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .disabled(isSubmitting)
            }
        }
    }

    private var isPayPalEnabled: Bool {
        AppConfig.paypalEnabled && !AppConfig.paypalClientId.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private var isCardEnabled: Bool {
        !AppConfig.stripePublishableKey.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private func normalizeSelectedPaymentMethod() {
        switch selectedPaymentMethod {
        case .paypal where !isPayPalEnabled:
            selectedPaymentMethod = isCardEnabled ? .card : .bankTransfer
        case .card where !isCardEnabled:
            selectedPaymentMethod = isPayPalEnabled ? .paypal : .bankTransfer
        default:
            break
        }
    }

    private func paymentMethodButton(title: String, method: CheckoutPaymentMethod) -> some View {
        let isSelected = selectedPaymentMethod == method
        return Button {
            checkoutError = nil
            selectedPaymentMethod = method
        } label: {
            HStack {
                Text(title)
                    .font(.custom("Michroma-Regular", size: 13))
                    .foregroundStyle(Color.grGold)
                Spacer()
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundStyle(isSelected ? Color.green : Color.grGold.opacity(0.55))
            }
            .padding(.horizontal, 12)
            .frame(height: 44)
            .background(Color.black.opacity(0.35))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(isSelected ? Color.green.opacity(0.9) : Color.grGold.opacity(0.35), lineWidth: 1.2)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
        .buttonStyle(.plain)
    }

    private var isProfileComplete: Bool {
        guard
            nome.trimmedNonEmpty != nil,
            cognome.trimmedNonEmpty != nil,
            indirizzo.trimmedNonEmpty != nil,
            citta.trimmedNonEmpty != nil,
            paese.trimmedNonEmpty != nil,
            codicePostale.trimmedNonEmpty != nil,
            telefono1.trimmedNonEmpty != nil
        else {
            return false
        }
        return true
    }

    private func loadQuote() async {
        guard store.session != nil, !store.cart.isEmpty else { return }
        do {
            try await store.ensureCustomerProfile(currentProfilePayload())
            quote = try await store.requestQuote(shippingMethod: shippingMethod)
            if quote?.productionPolicyRequired != true {
                isProductionPolicyAccepted = false
            }
        } catch {
            store.errorMessage = error.localizedDescription
        }
    }

    private func validateCheckoutInputs(requireBankTransferAcceptance: Bool) -> Bool {
        guard store.session != nil else {
            checkoutError = store.l10n.text(.profileRequired)
            return false
        }
        guard !store.cart.isEmpty else {
            checkoutError = store.l10n.text(.emptyCart)
            return false
        }
        guard isProfileComplete else {
            checkoutError = "Completa tutti i campi obbligatori prima di procedere al pagamento."
            return false
        }
        if selectedPaymentMethod == .paypal && !isPayPalEnabled {
            checkoutError = "PayPal non disponibile al momento."
            return false
        }
        if selectedPaymentMethod == .card && !isCardEnabled {
            checkoutError = "Pagamento con carta non disponibile al momento."
            return false
        }
        guard !requireBankTransferAcceptance || isAccepted else {
            checkoutError = store.l10n.text(.terms)
            return false
        }
        if quote?.productionPolicyRequired == true && !isProductionPolicyAccepted {
            checkoutError = "Accetta la policy di produzione per continuare."
            return false
        }
        return true
    }

    private func ensureQuoteLoaded() async throws {
        if quote == nil {
            quote = try await store.requestQuote(shippingMethod: shippingMethod)
        }
    }

    private func confirm() async {
        guard selectedPaymentMethod == .bankTransfer else { return }
        checkoutError = nil
        guard validateCheckoutInputs(requireBankTransferAcceptance: true) else { return }

        isSubmitting = true
        defer { isSubmitting = false }
        do {
            try await store.ensureCustomerProfile(currentProfilePayload())
            try await ensureQuoteLoaded()
            let result = try await store.confirmBankTransfer(
                shippingMethod: shippingMethod,
                productionPolicyAccepted: isProductionPolicyAccepted
            )
            confirmedOrder = ConfirmedOrderRoute(id: result.orderId, isBankTransfer: true)
        } catch {
            checkoutError = error.localizedDescription
        }
    }

    private func continueToWebCheckout() async {
        guard selectedPaymentMethod != .bankTransfer else { return }
        checkoutError = nil
        guard validateCheckoutInputs(requireBankTransferAcceptance: false) else { return }

        isSubmitting = true
        defer { isSubmitting = false }

        do {
            try await store.ensureCustomerProfile(currentProfilePayload())
            try await ensureQuoteLoaded()
            guard let session = store.session,
                  let paymentURL = buildWebCheckoutURL(session: session) else {
                checkoutError = "Impossibile aprire il checkout web."
                return
            }
            await MainActor.run {
                UIApplication.shared.open(paymentURL, options: [:]) { didOpen in
                    if !didOpen {
                        self.checkoutError = "Impossibile aprire il checkout web per PayPal/Carta."
                    }
                }
            }
        } catch {
            checkoutError = error.localizedDescription
        }
    }

    private func submitAuth() async {
        isSubmitting = true
        defer { isSubmitting = false }
        infoMessage = nil
        do {
            if isRegistering {
                try await store.register(payload: SignupPayload(
                    email: email.trimmingCharacters(in: .whitespacesAndNewlines),
                    password: password,
                    nome: nome,
                    cognome: cognome,
                    paese: paese,
                    citta: citta,
                    indirizzo: indirizzo,
                    codicePostale: codicePostale,
                    telefono1: telefono1,
                    telefono2: telefono2.isEmpty ? nil : telefono2
                ))
            } else {
                try await store.login(email: email.trimmingCharacters(in: .whitespacesAndNewlines), password: password)
            }
            await loadQuote()
        } catch {
            store.errorMessage = error.localizedDescription
        }
    }

    private func forgotPassword() async {
        let normalizedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !normalizedEmail.isEmpty else {
            store.errorMessage = "Inserisci la tua email"
            return
        }
        isSubmitting = true
        defer { isSubmitting = false }
        do {
            try await store.requestPasswordReset(email: normalizedEmail)
            infoMessage = "Ti abbiamo inviato una email per reimpostare la password."
            store.errorMessage = nil
        } catch {
            store.errorMessage = error.localizedDescription
        }
    }

    private func currentProfilePayload() -> CustomerProfilePayload {
        CustomerProfilePayload(
            email: store.session?.user.email ?? store.customer?.email ?? email.trimmedNonEmpty,
            nome: nome.trimmedNonEmpty ?? store.customer?.nome,
            cognome: cognome.trimmedNonEmpty ?? store.customer?.cognome,
            paese: paese.trimmedNonEmpty ?? store.customer?.paese,
            citta: citta.trimmedNonEmpty ?? store.customer?.citta,
            indirizzo: indirizzo.trimmedNonEmpty ?? store.customer?.indirizzo,
            codicePostale: codicePostale.trimmedNonEmpty ?? store.customer?.codicePostale,
            telefono1: telefono1.trimmedNonEmpty ?? store.customer?.telefono1,
            telefono2: telefono2.trimmedNonEmpty ?? store.customer?.telefono2
        )
    }

    private func syncProfileFieldsFromStore() {
        if let customer = store.customer {
            email = customer.email
            nome = customer.nome ?? ""
            cognome = customer.cognome ?? ""
            paese = customer.paese ?? "Italia"
            citta = customer.citta ?? "Roma"
            indirizzo = customer.indirizzo ?? ""
            codicePostale = customer.codicePostale ?? ""
            telefono1 = customer.telefono1 ?? ""
            telefono2 = customer.telefono2 ?? ""
        } else if let sessionEmail = store.session?.user.email {
            email = sessionEmail
        }
    }

    private func buildWebCheckoutURL(session: AuthSession) -> URL? {
        var components = URLComponents(url: AppConfig.webAPIBaseURL.appending(path: "pagamento"), resolvingAgainstBaseURL: false)
        let cartPayload = store.cart.map(CheckoutCartItem.init(item:))
        guard
            let cartData = try? JSONEncoder().encode(cartPayload),
            let base64Cart = cartData.base64EncodedString().base64URLEncoded
        else {
            return nil
        }

        let selectedMethod: String
        switch selectedPaymentMethod {
        case .paypal:
            selectedMethod = "paypal"
        case .card:
            selectedMethod = "carta"
        case .bankTransfer:
            selectedMethod = "bonifico"
        }

        components?.queryItems = [
            URLQueryItem(name: "lang", value: store.language.rawValue),
            URLQueryItem(name: "mobile_access_token", value: session.accessToken),
            URLQueryItem(name: "mobile_refresh_token", value: session.refreshToken),
            URLQueryItem(name: "mobile_shipping", value: shippingMethod),
            URLQueryItem(name: "mobile_payment", value: selectedMethod),
            URLQueryItem(name: "mobile_cart", value: base64Cart)
        ]
        return components?.url
    }
}

private extension String {
    var trimmedNonEmpty: String? {
        let value = trimmingCharacters(in: .whitespacesAndNewlines)
        return value.isEmpty ? nil : value
    }

    var base64URLEncoded: String? {
        let replaced = replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
        return replaced.isEmpty ? nil : replaced
    }
}

private struct ConfirmedOrderRoute: Identifiable, Hashable {
    let id: String
    let isBankTransfer: Bool
}

struct CheckoutStepsView: View {
    let isAuthenticated: Bool

    var body: some View {
        HStack(spacing: 10) {
            CheckoutStep(number: "1", title: "Accedi o\nRegistrati", isActive: true)
            Rectangle()
                .fill(Color.grGold.opacity(0.14))
                .frame(height: 1)
                .frame(maxWidth: .infinity)
            CheckoutStep(number: "2", title: isAuthenticated ? "Verifica i\nTuoi Dati" : "I Tuoi\nDettagli", isActive: isAuthenticated)
        }
        .padding(.vertical, 2)
    }
}

struct CheckoutStep: View {
    let number: String
    let title: String
    let isActive: Bool

    var body: some View {
        VStack(spacing: 5) {
            Text(number)
                .font(.custom("Michroma-Regular", size: 15))
                .foregroundStyle(Color.grGold)
                .frame(width: 36, height: 36)
                .background(isActive ? Color(red: 0.0, green: 0.45, blue: 0.95) : Color.grGold.opacity(0.12))
                .clipShape(Circle())
            Text(title)
                .font(.custom("Michroma-Regular", size: 10))
                .foregroundStyle(Color.grGold.opacity(0.82))
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .minimumScaleFactor(0.72)
        }
    }
}

struct CheckoutField: View {
    @Binding var text: String
    let placeholder: String
    var keyboard: UIKeyboardType = .default

    var body: some View {
        TextField("", text: $text, prompt: placeholderText)
            .font(.custom("Michroma-Regular", size: 15))
            .foregroundStyle(Color.grGold)
            .tint(Color.grGold)
            .keyboardType(keyboard)
            .padding(.horizontal, 12)
            .frame(height: 48)
            .background(Color(red: 0.16, green: 0.16, blue: 0.16))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.grGold.opacity(0.12), lineWidth: 1.2))
            .accessibilityLabel(placeholder)
    }

    private var placeholderText: Text {
        Text(placeholder)
            .foregroundColor(Color.grGold.opacity(0.62))
    }
}

struct CheckoutSecureField: View {
    @Binding var text: String
    let placeholder: String

    var body: some View {
        SecureField("", text: $text, prompt: placeholderText)
            .font(.custom("Michroma-Regular", size: 15))
            .foregroundStyle(Color.grGold)
            .tint(Color.grGold)
            .padding(.horizontal, 12)
            .frame(height: 48)
            .background(Color(red: 0.16, green: 0.16, blue: 0.16))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.grGold.opacity(0.12), lineWidth: 1.2))
            .accessibilityLabel(placeholder)
    }

    private var placeholderText: Text {
        Text(placeholder)
            .foregroundColor(Color.grGold.opacity(0.62))
    }
}

struct Row: View {
    let label: String
    let value: String
    var isBold = false

    var body: some View {
        HStack {
            Text(label)
            Spacer()
            Text(value)
                .font(.system(size: 16, weight: isBold ? .bold : .regular))
                .fontWeight(isBold ? .bold : .regular)
        }
    }
}

struct OrderConfirmedView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    let orderId: String
    let isBankTransfer: Bool

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack(spacing: 18) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 58))
                    .foregroundStyle(.green)
                Text(store.l10n.text(.orderConfirmed))
                    .font(.custom("Michroma-Regular", size: 30))
                    .foregroundStyle(Color.grGold)
                    .lineLimit(2)
                    .minimumScaleFactor(0.55)
                    .multilineTextAlignment(.center)
                Text(orderId)
                    .font(.custom("Michroma-Regular", size: 18))
                    .foregroundStyle(Color.grGold.opacity(0.75))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                if isBankTransfer {
                    Text(store.l10n.text(.bankTransferShippingNotice))
                        .font(.custom("Michroma-Regular", size: 14))
                        .foregroundStyle(Color.grGold.opacity(0.86))
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)
                        .padding(.top, 4)
                }
                Text(store.l10n.text(.orderEmailNotice))
                    .font(.custom("Michroma-Regular", size: 13))
                    .foregroundStyle(Color.grGold.opacity(0.7))
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)

                Button {
                    dismiss()
                } label: {
                    Text(store.l10n.text(.continueShopping))
                        .font(.custom("Michroma-Regular", size: 14))
                        .lineLimit(1)
                        .minimumScaleFactor(0.62)
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .foregroundStyle(.black)
                        .background(Color.grGold)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .padding(.top, 10)
            }
            .padding(28)
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}
