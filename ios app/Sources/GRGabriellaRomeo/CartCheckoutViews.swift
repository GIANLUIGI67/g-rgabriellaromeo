import SwiftUI

struct CartView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        CheckoutView()
            .environmentObject(store)
    }
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
    @State private var orderId: String?
    @State private var infoMessage: String?

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(red: 0.12, green: 0.12, blue: 0.12))
                        .overlay {
                            VStack(alignment: .leading, spacing: 22) {
                                Text("Riepilogo\nOrdine")
                                    .font(.custom("Michroma", size: 55))
                                    .foregroundStyle(Color.grGold)
                                    .multilineTextAlignment(.center)
                                    .frame(maxWidth: .infinity)

                                checkoutSummary
                                CheckoutStepsView(isAuthenticated: store.session != nil)

                                if store.session == nil {
                                    checkoutAuthSection
                                } else {
                                    checkoutDetailsSection
                                }
                            }
                            .padding(.horizontal, 30)
                            .padding(.vertical, 32)
                        }
                        .frame(maxWidth: 430)
                        .padding(.horizontal, 21)
                        .padding(.top, 98)
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
            }
        }
        .navigationDestination(item: $orderId) { id in
            OrderConfirmedView(orderId: id)
        }
    }

    private var checkoutSummary: some View {
        VStack(alignment: .leading, spacing: 12) {
            if store.cart.isEmpty {
                Text("Il carrello è vuoto.")
                    .font(.custom("Michroma", size: 30))
                    .foregroundStyle(Color.grGold.opacity(0.75))
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 22)
            } else {
                ForEach(store.cart) { item in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(alignment: .top) {
                            Text("\(item.quantity)x \(item.product.nome)")
                                .font(.custom("Michroma", size: 18))
                                .foregroundStyle(Color.grGold)
                            Spacer()
                            Text(item.lineTotal.euro)
                                .font(.system(size: 18, weight: .regular))
                                .foregroundStyle(Color.grGold)
                        }

                        HStack {
                            Spacer()
                            Button("Rimuovi") {
                                store.removeFromCart(item)
                                Task { await loadQuote() }
                            }
                            .font(.custom("Michroma", size: 13))
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
                    .font(.custom("Michroma", size: 16))
                    .foregroundStyle(Color.grGold)
                    .padding(.top, 8)
                }
            }
        }
    }

    private var checkoutAuthSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("Accedi o Registrati")
                .font(.custom("Michroma", size: 40))
                .foregroundStyle(Color.grGold)

            CheckoutField(text: $email, placeholder: "Email", keyboard: .emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
            CheckoutSecureField(text: $password, placeholder: "Password")

            HStack(spacing: 16) {
                Button {
                    Task { await submitAuth() }
                } label: {
                    ZStack {
                        if isSubmitting {
                            ProgressView().tint(.white)
                        } else {
                            Text(isRegistering ? "Registrati" : "Accedi")
                                .font(.custom("Michroma", size: 30))
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 86)
                    .foregroundStyle(Color.grGold)
                    .background(Color(red: 0.0, green: 0.45, blue: 0.95))
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                }
                .disabled(isSubmitting)

                Button {
                    withAnimation(.easeInOut(duration: 0.2)) { isRegistering.toggle() }
                } label: {
                    Text(isRegistering ? "Login" : "Crea\nAccount")
                        .font(.custom("Michroma", size: 30))
                        .multilineTextAlignment(.center)
                        .frame(maxWidth: .infinity)
                        .frame(height: 86)
                        .foregroundStyle(Color.grGold)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.grGold.opacity(0.18), lineWidth: 1.2))
                }
            }

            Button("Password dimenticata?") {
                Task { await forgotPassword() }
            }
            .font(.custom("Michroma", size: 18))
            .foregroundStyle(.blue)

            if let infoMessage, !infoMessage.isEmpty {
                Text(infoMessage)
                    .font(.custom("Michroma", size: 14))
                    .foregroundStyle(.green)
            }

            if isRegistering {
                VStack(spacing: 10) {
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
        VStack(alignment: .leading, spacing: 16) {
            Text("I Tuoi Dettagli")
                .font(.custom("Michroma", size: 36))
                .foregroundStyle(Color.grGold)

            if let customer = store.customer {
                VStack(alignment: .leading, spacing: 6) {
                    Text([customer.nome, customer.cognome].compactMap { $0 }.joined(separator: " "))
                    Text(customer.email)
                    Text(customer.indirizzo ?? "")
                    Text("\(customer.citta ?? "") \(customer.codicePostale ?? "")")
                    Text(customer.paese ?? "")
                    Text(customer.telefono1 ?? "")
                }
                .font(.custom("Michroma", size: 15))
                .foregroundStyle(Color.grGold.opacity(0.78))
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

            VStack(alignment: .leading, spacing: 10) {
                Text(store.l10n.text(.bankTransfer))
                Text("IBAN: IT10 Y050 3426 2010 0000 0204 438")
                Text("Intestato a: G-R Gabriella Romeo")
                Text("Causale: Ordine GR")
            }
            .font(.custom("Michroma", size: 15))
            .foregroundStyle(Color.grGold.opacity(0.8))
            .padding()
            .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.grGold.opacity(0.25)))

            Toggle(store.l10n.text(.terms), isOn: $isAccepted)
                .font(.custom("Michroma", size: 15))
                .foregroundStyle(Color.grGold.opacity(0.82))
                .tint(.blue)

            if quote?.productionPolicyRequired == true {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Policy di produzione")
                        .font(.custom("Michroma", size: 18))
                        .foregroundStyle(Color.grGold)
                    Text("Uno o più prodotti non sono disponibili in pronta consegna. Confermando la policy accetti che l'ordine venga prodotto e che i tempi di evasione dipendano dalla produzione.")
                        .font(.custom("Michroma", size: 13))
                        .foregroundStyle(Color.grGold.opacity(0.82))
                    if let items = quote?.productionItems, !items.isEmpty {
                        Text(items.map(\.nome).joined(separator: ", "))
                            .font(.custom("Michroma", size: 13))
                            .foregroundStyle(Color.grGold)
                    }
                    Toggle("Accetto la policy di produzione", isOn: $isProductionPolicyAccepted)
                        .font(.custom("Michroma", size: 13))
                        .foregroundStyle(Color.grGold.opacity(0.86))
                        .tint(.blue)
                }
                .padding()
                .overlay(RoundedRectangle(cornerRadius: 6).stroke(Color.grGold.opacity(0.35)))
            }

            Button {
                Task { await confirm() }
            } label: {
                if isSubmitting {
                    ProgressView().tint(.white)
                } else {
                    Text(store.l10n.text(.confirmBankTransfer))
                        .font(.custom("Michroma", size: 18))
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .foregroundStyle(Color.grGold)
            .background((!canConfirm || isSubmitting) ? Color.green.opacity(0.35) : Color.green.opacity(0.72))
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .disabled(!canConfirm || isSubmitting)
        }
    }

    private var canConfirm: Bool {
        isAccepted &&
        quote != nil &&
        !store.cart.isEmpty &&
        (quote?.productionPolicyRequired != true || isProductionPolicyAccepted)
    }

    private func loadQuote() async {
        guard store.session != nil, !store.cart.isEmpty else { return }
        do {
            quote = try await store.requestQuote(shippingMethod: shippingMethod)
            if quote?.productionPolicyRequired != true {
                isProductionPolicyAccepted = false
            }
        } catch {
            store.errorMessage = error.localizedDescription
        }
    }

    private func confirm() async {
        isSubmitting = true
        defer { isSubmitting = false }
        do {
            let result = try await store.confirmBankTransfer(
                shippingMethod: shippingMethod,
                productionPolicyAccepted: isProductionPolicyAccepted
            )
            orderId = result.orderId
        } catch {
            store.errorMessage = error.localizedDescription
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
}

struct CheckoutStepsView: View {
    let isAuthenticated: Bool

    var body: some View {
        HStack(spacing: 14) {
            CheckoutStep(number: "1", title: "Accedi o\nRegistrati", isActive: true)
            Rectangle()
                .fill(Color.grGold.opacity(0.14))
                .frame(height: 1)
                .frame(maxWidth: .infinity)
            CheckoutStep(number: "2", title: isAuthenticated ? "Verifica i\nTuoi Dati" : "I Tuoi\nDettagli", isActive: isAuthenticated)
        }
        .padding(.vertical, 6)
    }
}

struct CheckoutStep: View {
    let number: String
    let title: String
    let isActive: Bool

    var body: some View {
        VStack(spacing: 8) {
            Text(number)
                .font(.custom("Michroma", size: 24))
                .foregroundStyle(Color.grGold)
                .frame(width: 54, height: 54)
                .background(isActive ? Color(red: 0.0, green: 0.45, blue: 0.95) : Color.grGold.opacity(0.12))
                .clipShape(Circle())
            Text(title)
                .font(.custom("Michroma", size: 24))
                .foregroundStyle(Color.grGold.opacity(0.82))
                .multilineTextAlignment(.center)
        }
    }
}

struct CheckoutField: View {
    @Binding var text: String
    let placeholder: String
    var keyboard: UIKeyboardType = .default

    var body: some View {
        TextField(placeholder, text: $text)
            .font(.custom("Michroma", size: 28))
            .foregroundStyle(Color.grGold)
            .keyboardType(keyboard)
            .padding(.horizontal, 18)
            .frame(height: 67)
            .background(Color(red: 0.16, green: 0.16, blue: 0.16))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.grGold.opacity(0.12), lineWidth: 1.2))
    }
}

struct CheckoutSecureField: View {
    @Binding var text: String
    let placeholder: String

    var body: some View {
        SecureField(placeholder, text: $text)
            .font(.custom("Michroma", size: 28))
            .foregroundStyle(Color.grGold)
            .padding(.horizontal, 18)
            .frame(height: 67)
            .background(Color(red: 0.16, green: 0.16, blue: 0.16))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.grGold.opacity(0.12), lineWidth: 1.2))
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
    let orderId: String

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack(spacing: 18) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 58))
                    .foregroundStyle(.green)
                Text("Ordine confermato")
                    .font(.custom("Michroma", size: 38))
                    .foregroundStyle(Color.grGold)
                Text(orderId)
                    .font(.custom("Michroma", size: 18))
                    .foregroundStyle(Color.grGold.opacity(0.75))
            }
            .padding()
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}
