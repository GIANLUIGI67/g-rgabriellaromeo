import Foundation

struct Product: Identifiable, Codable, Hashable {
    let id: String
    let nome: String
    let descrizione: String?
    let prezzo: Decimal
    let taglia: String?
    let categoria: String?
    let sottocategoria: String?
    let immagine: String?
    let disponibile: Bool?
    let quantita: Int?
    let offerta: Bool?
    let sconto: Decimal?
    let madeToOrder: Bool?
    let allowBackorder: Bool?

    enum CodingKeys: String, CodingKey {
        case id, nome, descrizione, prezzo, taglia, categoria, sottocategoria, immagine, disponibile, quantita, offerta, sconto
        case madeToOrder = "made_to_order"
        case allowBackorder = "allow_backorder"
    }

    var displayPrice: Decimal {
        let discount = sconto ?? 0
        guard offerta == true, discount > 0 else { return prezzo }
        return prezzo - (prezzo * discount / 100)
    }

    var isAvailable: Bool {
        disponibile != false && ((quantita ?? 0) > 0 || madeToOrder == true || allowBackorder == true)
    }
}

struct CartItem: Identifiable, Codable, Hashable {
    let product: Product
    var quantity: Int

    var id: String { product.id }
    var lineTotal: Decimal { product.displayPrice * Decimal(quantity) }
}

struct AuthSession: Codable {
    let accessToken: String
    let refreshToken: String?
    let user: AuthUser

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case user
    }
}

struct AuthUser: Codable {
    let id: String
    let email: String?
}

struct CustomerProfile: Codable {
    let email: String
    let nome: String?
    let cognome: String?
    let telefono1: String?
    let telefono2: String?
    let indirizzo: String?
    let citta: String?
    let paese: String?
    let codicePostale: String?
    let primoSconto: Decimal?

    enum CodingKeys: String, CodingKey {
        case email, nome, cognome, telefono1, telefono2, indirizzo, citta, paese
        case codicePostale = "codice_postale"
        case primoSconto = "primo_sconto"
    }
}

struct SignupPayload: Codable {
    var email: String
    var password: String
    var nome: String
    var cognome: String
    var paese: String
    var citta: String
    var indirizzo: String
    var codicePostale: String
    var telefono1: String
    var telefono2: String?

    enum CodingKeys: String, CodingKey {
        case email, password, nome, cognome, paese, citta, indirizzo, telefono1, telefono2
        case codicePostale = "codice_postale"
    }
}

struct QuoteRequest: Codable {
    let cart: [CheckoutCartItem]
    let shippingMethod: String
}

struct FinalizeRequest: Codable {
    let cart: [CheckoutCartItem]
    let shippingMethod: String
    let paymentMethod: String
    let paymentStatus: String
    let transactionId: String?
}

struct CheckoutCartItem: Codable {
    let cartItem = true
    let id: String
    let nome: String
    let immagine: String?
    let prezzo: Decimal
    let taglia: String?
    let descrizione: String?
    let categoria: String?
    let sottocategoria: String?
    let disponibile: Bool?
    let madeToOrder: Bool
    let allowBackorder: Bool
    let offerta: Bool
    let sconto: Decimal
    let quantita: Int

    enum CodingKeys: String, CodingKey {
        case cartItem, id, nome, immagine, prezzo, taglia, descrizione, categoria, sottocategoria, disponibile, offerta, sconto, quantita
        case madeToOrder = "made_to_order"
        case allowBackorder = "allow_backorder"
    }

    init(item: CartItem) {
        id = item.product.id
        nome = item.product.nome
        immagine = item.product.immagine
        prezzo = item.product.prezzo
        taglia = item.product.taglia
        descrizione = item.product.descrizione
        categoria = item.product.categoria
        sottocategoria = item.product.sottocategoria
        disponibile = item.product.disponibile
        madeToOrder = item.product.madeToOrder ?? false
        allowBackorder = item.product.allowBackorder ?? false
        offerta = item.product.offerta ?? false
        sconto = item.product.sconto ?? 0
        quantita = item.quantity
    }
}

struct QuoteResponse: Codable {
    let ok: Bool?
    let quote: CheckoutQuote
}

struct CheckoutQuote: Codable {
    let shippingMethod: String
    let shippingCost: Decimal
    let subtotal: Decimal
    let firstDiscountPercent: Decimal
    let discountAmount: Decimal
    let total: Decimal
}

struct FinalizeResponse: Codable {
    let ok: Bool?
    let orderId: String
    let total: Decimal?
}

struct APIErrorResponse: Codable {
    let error: String?
}
