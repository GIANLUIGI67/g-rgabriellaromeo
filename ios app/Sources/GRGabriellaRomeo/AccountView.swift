import SwiftUI

struct AccountView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
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
    @State private var isSubmitting = false
    @State private var infoMessage: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if let session = store.session, let email = session.user.email {
                    loggedInContent(userEmail: email)
                } else {
                    authContent
                }
            }
            .padding(.horizontal, 17)
            .padding(.vertical, 24)
        }
        .background(Color.white)
        .scrollContentBackground(.hidden)
        .toolbar(.hidden, for: .navigationBar)
    }

    private var authContent: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(isRegistering ? store.l10n.text(.register) : store.l10n.text(.login))
                .font(.custom("GRGabriellaUltraCustom", size: 38))
                .foregroundStyle(.black)

            TextField(store.l10n.text(.email), text: $email)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .accountField()

            SecureField(store.l10n.text(.password), text: $password)
                .accountField()

            if isRegistering {
                registrationFields
            }

            Button {
                Task { await submit() }
            } label: {
                ZStack {
                    if isSubmitting {
                        ProgressView().tint(.white)
                    } else {
                        Text(isRegistering ? store.l10n.text(.register) : store.l10n.text(.login))
                            .font(.custom("GRGabriellaFinal", size: 18))
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .foregroundStyle(.white)
                .background(Color.black)
            }
            .disabled(isSubmitting)

            if let infoMessage, !infoMessage.isEmpty {
                Text(infoMessage)
                    .font(.custom("GRGabriellaFinal", size: 14))
                    .foregroundStyle(Color(red: 0.14, green: 0.43, blue: 0.19))
            }

            if !isRegistering {
                Button("Password dimenticata?") {
                    Task { await handleForgotPassword() }
                }
                .font(.custom("GRGabriellaFinal", size: 14))
                .foregroundStyle(.blue)
            }

            Button(isRegistering ? "Hai gia un account? Login" : "Crea account") {
                isRegistering.toggle()
                infoMessage = nil
            }
            .font(.custom("GRGabriellaFinal", size: 15))
            .foregroundStyle(.black.opacity(0.7))
        }
    }

    private var registrationFields: some View {
        VStack(spacing: 10) {
            TextField(store.l10n.text(.name), text: $nome).accountField()
            TextField(store.l10n.text(.surname), text: $cognome).accountField()
            TextField(store.l10n.text(.country), text: $paese).accountField()
            TextField(store.l10n.text(.city), text: $citta).accountField()
            TextField(store.l10n.text(.address), text: $indirizzo).accountField()
            TextField(store.l10n.text(.postalCode), text: $codicePostale).keyboardType(.numberPad).accountField()
            TextField(store.l10n.text(.phone), text: $telefono1).keyboardType(.phonePad).accountField()
            TextField("Telefono 2", text: $telefono2).keyboardType(.phonePad).accountField()
        }
    }

    private func loggedInContent(userEmail: String) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Account")
                .font(.custom("GRGabriellaUltraCustom", size: 40))
            Text(userEmail)
                .font(.custom("GRGabriellaFinal", size: 18))
            if let customer = store.customer {
                Text([customer.nome, customer.cognome].compactMap { $0 }.joined(separator: " "))
                    .font(.custom("GRGabriellaFinal", size: 18))
                Text(customer.indirizzo ?? "")
                    .font(.custom("GRGabriellaFinal", size: 15))
                Text("\(customer.citta ?? "") \(customer.codicePostale ?? "")")
                    .font(.custom("GRGabriellaFinal", size: 15))
            }
            Button(store.l10n.text(.logout)) {
                store.logout()
                dismiss()
            }
            .font(.custom("GRGabriellaFinal", size: 18))
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(Color.black)
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
            dismiss()
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
            store.errorMessage = nil
        } catch {
            store.errorMessage = error.localizedDescription
        }
    }
}

struct WebAccountPanel: View {
    @Binding var isPresented: Bool
    @EnvironmentObject private var store: AppStore

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Account")
                    .font(.custom("GRGabriellaFinal", size: 22))
                Spacer()
                Button {
                    withAnimation { isPresented = false }
                } label: {
                    Image(systemName: "xmark")
                }
            }

            if let email = store.session?.user.email {
                Text(email)
                    .font(.custom("GRGabriellaFinal", size: 16))
                Button(store.l10n.text(.logout)) {
                    store.logout()
                    isPresented = false
                }
            } else {
                NavigationLink {
                    AccountView()
                } label: {
                    Text(store.l10n.text(.login))
                        .font(.custom("GRGabriellaFinal", size: 18))
                        .frame(maxWidth: .infinity)
                        .frame(height: 46)
                        .foregroundStyle(.white)
                        .background(Color.black)
                }
            }
        }
        .foregroundStyle(.black)
        .padding(18)
        .background(Color.white)
    }
}

private extension View {
    func accountField() -> some View {
        self
            .font(.custom("GRGabriellaFinal", size: 17))
            .foregroundStyle(.black)
            .padding(.horizontal, 12)
            .frame(height: 48)
            .overlay(Rectangle().stroke(Color.black.opacity(0.24), lineWidth: 1))
    }
}
