import SwiftUI

struct AccountView: View {
    @State private var isPresented = true

    var body: some View {
        ZStack(alignment: .topTrailing) {
            HeroBackground()
            if isPresented {
                LoginPanel(isPresented: $isPresented)
                    .frame(maxWidth: 282)
                    .frame(height: 390, alignment: .top)
                    .clipped()
                    .padding(.top, 56)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}

struct LoginPanel: View {
    @Binding var isPresented: Bool
    @EnvironmentObject private var store: AppStore
    @State private var isRegistering = false
    @State private var email = ""
    @State private var password = ""
    @State private var nome = ""
    @State private var cognome = ""
    @State private var paese = "Italia"
    @State private var citta = ""
    @State private var indirizzo = ""
    @State private var codicePostale = ""
    @State private var telefono1 = ""
    @State private var telefono2 = ""
    @State private var isSubmitting = false
    @State private var infoMessage: String?

    private let benefits = [
        "Aggiungi prodotti alla lista desideri",
        "Per un checkout piu veloce",
        "Sconto 10% sul prossimo acquisto",
        "Referral program per sconti e buoni"
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 7) {
                HStack(alignment: .top) {
                    Text(store.session == nil ? "LOGIN" : "ACCOUNT")
                        .font(.custom("Michroma-Regular", size: 16))
                        .foregroundStyle(.black)
                        .lineLimit(1)
                        .minimumScaleFactor(0.72)
                    Spacer()
                    Button {
                        withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 18, weight: .regular))
                            .foregroundStyle(.black)
                    }
                }

                if let session = store.session, let userEmail = session.user.email {
                    loggedInContent(email: userEmail)
                } else {
                    authContent
                }
            }
            .padding(.horizontal, 12)
            .padding(.top, 12)
            .padding(.bottom, 12)
        }
        .background(Color.white)
    }

    private var authContent: some View {
        VStack(alignment: .leading, spacing: 7) {
            TextField("Email", text: $email)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .loginField()

            SecureField("Password", text: $password)
                .loginField()

            if isRegistering {
                VStack(spacing: 7) {
                    TextField("Nome", text: $nome).loginField()
                    TextField("Cognome", text: $cognome).loginField()
                    TextField("Paese", text: $paese).loginField()
                    TextField("Citta", text: $citta).loginField()
                    TextField("Indirizzo", text: $indirizzo).loginField()
                    TextField("CAP", text: $codicePostale).keyboardType(.numberPad).loginField()
                    TextField("Telefono 1", text: $telefono1).keyboardType(.phonePad).loginField()
                    TextField("Telefono 2", text: $telefono2).keyboardType(.phonePad).loginField()
                }
            }

            Button {
                Task { await submit() }
            } label: {
                ZStack {
                    if isSubmitting {
                        ProgressView().tint(.white)
                    } else {
                        Text(isRegistering ? "REGISTRATI" : "LOGIN")
                            .font(.custom("Michroma-Regular", size: 14))
                            .lineLimit(1)
                            .minimumScaleFactor(0.72)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 30)
                .foregroundStyle(Color.grGold)
                .background(Color.black)
            }
            .disabled(isSubmitting)

            if !isRegistering {
                Button {
                    Task { await handleForgotPassword() }
                } label: {
                    Text("Password dimenticata?")
                        .font(.custom("Michroma-Regular", size: 12))
                        .foregroundStyle(Color(red: 0.17, green: 0.38, blue: 0.96))
                }
            }

            Rectangle()
                .fill(Color.black.opacity(0.11))
                .frame(height: 1)

            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isRegistering.toggle()
                    infoMessage = nil
                }
            } label: {
                Text(isRegistering ? "LOGIN" : "CREA ACCOUNT")
                    .font(.custom("Michroma-Regular", size: 14))
                    .foregroundStyle(.black)
                    .lineLimit(1)
                    .minimumScaleFactor(0.62)
                    .frame(maxWidth: .infinity)
                    .frame(height: 30)
                    .overlay(Rectangle().stroke(Color.black, lineWidth: 1.2))
            }

            VStack(alignment: .leading, spacing: 2) {
                ForEach(benefits, id: \.self) { benefit in
                    Text("-  \(benefit)")
                        .font(.custom("Michroma-Regular", size: 9.5))
                        .foregroundStyle(Color(red: 0.34, green: 0.37, blue: 0.43))
                        .lineLimit(1)
                        .minimumScaleFactor(0.58)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(.top, 2)

            if let infoMessage {
                Text(infoMessage)
                    .font(.custom("Michroma-Regular", size: 12))
                    .foregroundStyle(Color(red: 0.1, green: 0.45, blue: 0.18))
            }
        }
    }

    private func loggedInContent(email: String) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(email)
                .font(.custom("Michroma-Regular", size: 13))
                .foregroundStyle(.black)
            if let customer = store.customer {
                Text([customer.nome, customer.cognome].compactMap { $0 }.joined(separator: " "))
                    .font(.custom("Michroma-Regular", size: 15))
                    .foregroundStyle(.black)
                Text([customer.indirizzo, customer.citta, customer.codicePostale, customer.paese].compactMap { $0 }.joined(separator: " "))
                    .font(.custom("Michroma-Regular", size: 12))
                    .foregroundStyle(.black.opacity(0.72))
            }

            Button {
                store.logout()
            } label: {
                Text("LOGOUT")
                    .font(.custom("Michroma-Regular", size: 15))
                    .foregroundStyle(Color.grGold)
                    .frame(maxWidth: .infinity)
                    .frame(height: 34)
                    .background(Color.black)
            }
        }
    }

    private func submit() async {
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
            withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
        } catch {
            store.errorMessage = error.localizedDescription
        }
    }

    private func handleForgotPassword() async {
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
        } catch {
            store.errorMessage = error.localizedDescription
        }
    }
}

private extension View {
    func loginField() -> some View {
        self
            .font(.custom("Michroma-Regular", size: 13))
            .foregroundStyle(.black)
            .padding(.horizontal, 8)
            .frame(height: 30)
            .overlay(Rectangle().stroke(Color.black, lineWidth: 1.2))
    }
}
