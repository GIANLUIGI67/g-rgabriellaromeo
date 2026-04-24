import SwiftUI

struct AccountView: View {
    @State private var isPresented = true

    var body: some View {
        ZStack(alignment: .topTrailing) {
            HeroBackground()
            if isPresented {
                LoginPanel(isPresented: $isPresented)
                    .frame(maxWidth: 336)
                    .frame(maxHeight: 560, alignment: .top)
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
        "Per aggiungere i tuoi prodotti alla lista dei desideri",
        "Per un checkout piu veloce",
        "Ottieni uno sconto del 10% sul tuo prossimo acquisto",
        "Unisciti al nostro referral program per sconti e buoni acquisto"
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top) {
                    Text(store.session == nil ? "LOGIN" : "ACCOUNT")
                        .font(.custom("GRGabriellaFinal", size: 24))
                        .foregroundStyle(.black)
                    Spacer()
                    Button {
                        withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 24, weight: .regular))
                            .foregroundStyle(.black)
                    }
                }

                if let session = store.session, let userEmail = session.user.email {
                    loggedInContent(email: userEmail)
                } else {
                    authContent
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 18)
            .padding(.bottom, 20)
        }
        .background(Color.white)
    }

    private var authContent: some View {
        VStack(alignment: .leading, spacing: 12) {
            TextField("Email", text: $email)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .loginField()

            SecureField("Password", text: $password)
                .loginField()

            if isRegistering {
                VStack(spacing: 12) {
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
                            .font(.custom("GRGabriellaFinal", size: 22))
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 42)
                .foregroundStyle(.white)
                .background(Color.black)
            }
            .disabled(isSubmitting)

            if !isRegistering {
                Button {
                    Task { await handleForgotPassword() }
                } label: {
                    Text("Password dimenticata?")
                        .font(.custom("GRGabriellaFinal", size: 18))
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
                    .font(.custom("GRGabriellaFinal", size: 22))
                    .foregroundStyle(.black)
                    .frame(maxWidth: .infinity)
                    .frame(height: 42)
                    .overlay(Rectangle().stroke(Color.black, lineWidth: 1.2))
            }

            VStack(alignment: .leading, spacing: 6) {
                ForEach(benefits, id: \.self) { benefit in
                    Text("-  \(benefit)")
                        .font(.custom("GRGabriellaFinal", size: 18))
                        .foregroundStyle(Color(red: 0.34, green: 0.37, blue: 0.43))
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(.top, 4)

            if let infoMessage {
                Text(infoMessage)
                    .font(.custom("GRGabriellaFinal", size: 15))
                    .foregroundStyle(Color(red: 0.1, green: 0.45, blue: 0.18))
            }
        }
    }

    private func loggedInContent(email: String) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(email)
                .font(.custom("GRGabriellaFinal", size: 18))
                .foregroundStyle(.black)
            if let customer = store.customer {
                Text([customer.nome, customer.cognome].compactMap { $0 }.joined(separator: " "))
                    .font(.custom("GRGabriellaFinal", size: 22))
                    .foregroundStyle(.black)
                Text([customer.indirizzo, customer.citta, customer.codicePostale, customer.paese].compactMap { $0 }.joined(separator: " "))
                    .font(.custom("GRGabriellaFinal", size: 18))
                    .foregroundStyle(.black.opacity(0.72))
            }

            Button {
                store.logout()
            } label: {
                Text("LOGOUT")
                    .font(.custom("GRGabriellaFinal", size: 22))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
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
            .font(.custom("GRGabriellaFinal", size: 20))
            .foregroundStyle(.black)
            .padding(.horizontal, 14)
            .frame(height: 44)
            .overlay(Rectangle().stroke(Color.black, lineWidth: 1.2))
    }
}
