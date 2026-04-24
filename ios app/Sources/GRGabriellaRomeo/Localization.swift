import Foundation

enum AppLanguage: String, CaseIterable, Identifiable {
    case it, en, fr, de, es, ar, zh, ja

    var id: String { rawValue }

    var flag: String {
        switch self {
        case .it: "IT"
        case .en: "EN"
        case .fr: "FR"
        case .de: "DE"
        case .es: "ES"
        case .ar: "AR"
        case .zh: "ZH"
        case .ja: "JA"
        }
    }
}

struct L10n {
    let language: AppLanguage

    func text(_ key: Key) -> String {
        Self.table[key]?[language] ?? Self.table[key]?[.it] ?? key.rawValue
    }

    enum Key: String {
        case homeTitle, abbigliamento, gioielli, accessori, offerte, cart, login, logout, register
        case email, password, name, surname, country, city, address, postalCode, phone
        case addToCart, soldOut, checkout, total, emptyCart, continueShopping
        case bankTransfer, confirmBankTransfer, terms, orderConfirmed, profileRequired
        case standardShipping, expressShipping, storePickup, shipping, payment
    }

    private static let table: [Key: [AppLanguage: String]] = [
        .homeTitle: [.it: "G-R Gabriella Romeo", .en: "G-R Gabriella Romeo"],
        .abbigliamento: [.it: "Abbigliamento", .en: "Clothing", .fr: "Vetements", .de: "Kleidung", .es: "Ropa"],
        .gioielli: [.it: "Gioielli", .en: "Jewelry", .fr: "Bijoux", .de: "Schmuck", .es: "Joyas"],
        .accessori: [.it: "Accessori", .en: "Accessories", .fr: "Accessoires", .de: "Accessoires", .es: "Accesorios"],
        .offerte: [.it: "Offerte", .en: "Offers"],
        .cart: [.it: "Carrello", .en: "Cart"],
        .login: [.it: "Login", .en: "Login"],
        .logout: [.it: "Logout", .en: "Logout"],
        .register: [.it: "Registrati", .en: "Register"],
        .email: [.it: "Email", .en: "Email"],
        .password: [.it: "Password", .en: "Password"],
        .name: [.it: "Nome", .en: "Name"],
        .surname: [.it: "Cognome", .en: "Surname"],
        .country: [.it: "Paese", .en: "Country"],
        .city: [.it: "Citta", .en: "City"],
        .address: [.it: "Indirizzo", .en: "Address"],
        .postalCode: [.it: "CAP", .en: "Postal code"],
        .phone: [.it: "Telefono", .en: "Phone"],
        .addToCart: [.it: "Aggiungi", .en: "Add"],
        .soldOut: [.it: "Venduto", .en: "Sold out"],
        .checkout: [.it: "Checkout", .en: "Checkout"],
        .total: [.it: "Totale", .en: "Total"],
        .emptyCart: [.it: "Il carrello e vuoto", .en: "Your cart is empty"],
        .continueShopping: [.it: "Continua shopping", .en: "Continue shopping"],
        .bankTransfer: [.it: "Bonifico bancario", .en: "Bank transfer"],
        .confirmBankTransfer: [.it: "Conferma bonifico", .en: "Confirm bank transfer"],
        .terms: [.it: "Accetto termini e condizioni", .en: "I accept terms and conditions"],
        .orderConfirmed: [.it: "Ordine confermato", .en: "Order confirmed"],
        .profileRequired: [.it: "Accedi o crea un account per procedere", .en: "Login or create an account to continue"],
        .standardShipping: [.it: "Spedizione standard", .en: "Standard shipping"],
        .expressShipping: [.it: "Spedizione express", .en: "Express shipping"],
        .storePickup: [.it: "Ritiro in negozio", .en: "Store pickup"],
        .shipping: [.it: "Spedizione", .en: "Shipping"],
        .payment: [.it: "Pagamento", .en: "Payment"]
    ]
}
