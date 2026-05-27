import Foundation

struct Product: Identifiable, Codable, Hashable {
    let id: String
    let nome: String
    let nomeEn: String?
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
        case nomeEn = "nome_en"
        case madeToOrder = "made_to_order"
        case allowBackorder = "allow_backorder"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decodeFlexibleString(forKey: .id)
        nome = try container.decodeIfPresent(String.self, forKey: .nome) ?? ""
        nomeEn = try container.decodeIfPresent(String.self, forKey: .nomeEn)
        descrizione = try container.decodeIfPresent(String.self, forKey: .descrizione)
        prezzo = try container.decodeFlexibleDecimal(forKey: .prezzo)
        taglia = try container.decodeIfPresent(String.self, forKey: .taglia)
        categoria = try container.decodeIfPresent(String.self, forKey: .categoria)
        sottocategoria = try container.decodeIfPresent(String.self, forKey: .sottocategoria)
        immagine = try container.decodeIfPresent(String.self, forKey: .immagine)
        disponibile = try container.decodeIfPresent(Bool.self, forKey: .disponibile)
        quantita = try container.decodeIfPresent(Int.self, forKey: .quantita)
        offerta = try container.decodeIfPresent(Bool.self, forKey: .offerta)
        sconto = try container.decodeFlexibleDecimalIfPresent(forKey: .sconto)
        madeToOrder = try container.decodeIfPresent(Bool.self, forKey: .madeToOrder)
        allowBackorder = try container.decodeIfPresent(Bool.self, forKey: .allowBackorder)
    }

    init(
        id: String,
        nome: String,
        nomeEn: String? = nil,
        descrizione: String?,
        prezzo: Decimal,
        taglia: String?,
        categoria: String?,
        sottocategoria: String?,
        immagine: String?,
        disponibile: Bool?,
        quantita: Int?,
        offerta: Bool?,
        sconto: Decimal?,
        madeToOrder: Bool?,
        allowBackorder: Bool?
    ) {
        self.id = id
        self.nome = nome
        self.nomeEn = nomeEn
        self.descrizione = descrizione
        self.prezzo = prezzo
        self.taglia = taglia
        self.categoria = categoria
        self.sottocategoria = sottocategoria
        self.immagine = immagine
        self.disponibile = disponibile
        self.quantita = quantita
        self.offerta = offerta
        self.sconto = sconto
        self.madeToOrder = madeToOrder
        self.allowBackorder = allowBackorder
    }

    var displayPrice: Decimal {
        let discount = sconto ?? 0
        guard offerta == true, discount > 0 else { return prezzo }
        return prezzo - (prezzo * discount / 100)
    }

    var hasDisplayPrice: Bool {
        displayPrice > 0
    }

    var englishName: String {
        let trimmed = nomeEn?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        return trimmed.isEmpty ? nome : trimmed
    }

    var isSoldOut: Bool {
        disponibile == false
    }

    var isAvailable: Bool {
        !isSoldOut
    }

    func requiresProduction(for quantity: Int) -> Bool {
        quantity > (quantita ?? 0)
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
    let expiresIn: Int?
    let expiresAt: Int?
    let user: AuthUser

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case expiresIn = "expires_in"
        case expiresAt = "expires_at"
        case user
    }

    var isExpiringSoon: Bool {
        guard let expiresAt else { return false }
        return Date().timeIntervalSince1970 >= Double(expiresAt - 60)
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

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        email = try container.decodeIfPresent(String.self, forKey: .email) ?? ""
        nome = try container.decodeIfPresent(String.self, forKey: .nome)
        cognome = try container.decodeIfPresent(String.self, forKey: .cognome)
        telefono1 = try container.decodeIfPresent(String.self, forKey: .telefono1)
        telefono2 = try container.decodeIfPresent(String.self, forKey: .telefono2)
        indirizzo = try container.decodeIfPresent(String.self, forKey: .indirizzo)
        citta = try container.decodeIfPresent(String.self, forKey: .citta)
        paese = try container.decodeIfPresent(String.self, forKey: .paese)
        codicePostale = try container.decodeIfPresent(String.self, forKey: .codicePostale)
        primoSconto = try container.decodeFlexibleDecimalIfPresent(forKey: .primoSconto)
    }
}

struct EventRecord: Identifiable, Codable, Hashable {
    let id: String
    let titolo: String
    let descrizione: String?
    let dataInizio: String?
    let dataFine: String?
    let stato: String
    let pdfUrls: [String]
    let videoUrls: [String]
    let fotoUrls: [String]
    let createdAt: String?

    enum CodingKeys: String, CodingKey {
        case id, titolo, descrizione, stato
        case dataInizio = "data_inizio"
        case dataFine = "data_fine"
        case pdfUrls = "pdf_urls"
        case videoUrls = "video_urls"
        case fotoUrls = "foto_urls"
        case createdAt = "created_at"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decodeFlexibleString(forKey: .id)
        titolo = try container.decodeIfPresent(String.self, forKey: .titolo) ?? ""
        descrizione = try container.decodeIfPresent(String.self, forKey: .descrizione)
        dataInizio = try container.decodeIfPresent(String.self, forKey: .dataInizio)
        dataFine = try container.decodeIfPresent(String.self, forKey: .dataFine)
        stato = try container.decodeIfPresent(String.self, forKey: .stato) ?? "in_programmazione"
        pdfUrls = try container.decodeIfPresent([String].self, forKey: .pdfUrls) ?? []
        videoUrls = try container.decodeIfPresent([String].self, forKey: .videoUrls) ?? []
        fotoUrls = try container.decodeIfPresent([String].self, forKey: .fotoUrls) ?? []
        createdAt = try container.decodeIfPresent(String.self, forKey: .createdAt)
    }

    var isInProgrammazione: Bool { stato == "in_programmazione" }
    var primaryImageURL: URL? { fotoUrls.compactMap { URL(string: $0) }.first }

    var dateLabel: String? {
        guard let start = dataInizio?.prefix(10) else { return nil }
        if let end = dataFine?.prefix(10), end != start {
            return "\(start) - \(end)"
        }
        return String(start)
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

struct CustomerProfilePayload: Codable {
    var email: String?
    var nome: String?
    var cognome: String?
    var paese: String?
    var citta: String?
    var indirizzo: String?
    var codicePostale: String?
    var telefono1: String?
    var telefono2: String?

    enum CodingKeys: String, CodingKey {
        case email, nome, cognome, paese, citta, indirizzo, telefono1, telefono2
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
    let productionPolicyAccepted: Bool
}

struct ReserveRequest: Codable {
    let cart: [CheckoutCartItem]
    let shippingMethod: String
    let productionPolicyAccepted: Bool
}

struct CheckoutCartItem: Codable {
    let cartItem: Bool
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
        cartItem = true
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

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        cartItem = try container.decodeFlexibleBoolIfPresent(forKey: .cartItem) ?? true
        id = try container.decodeFlexibleString(forKey: .id)
        nome = try container.decodeIfPresent(String.self, forKey: .nome) ?? ""
        immagine = try container.decodeIfPresent(String.self, forKey: .immagine)
        prezzo = try container.decodeFlexibleDecimal(forKey: .prezzo)
        taglia = try container.decodeIfPresent(String.self, forKey: .taglia)
        descrizione = try container.decodeIfPresent(String.self, forKey: .descrizione)
        categoria = try container.decodeIfPresent(String.self, forKey: .categoria)
        sottocategoria = try container.decodeIfPresent(String.self, forKey: .sottocategoria)
        disponibile = try container.decodeFlexibleBoolIfPresent(forKey: .disponibile)
        madeToOrder = try container.decodeFlexibleBoolIfPresent(forKey: .madeToOrder) ?? false
        allowBackorder = try container.decodeFlexibleBoolIfPresent(forKey: .allowBackorder) ?? false
        offerta = try container.decodeFlexibleBoolIfPresent(forKey: .offerta) ?? false
        sconto = try container.decodeFlexibleDecimalIfPresent(forKey: .sconto) ?? 0
        quantita = try container.decodeFlexibleIntIfPresent(forKey: .quantita) ?? 1
    }
}

struct QuoteResponse: Decodable {
    let ok: Bool?
    let quote: CheckoutQuote

    enum CodingKeys: String, CodingKey {
        case ok
        case quote
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        ok = try container.decodeFlexibleBoolIfPresent(forKey: .ok)
        if container.contains(.quote) {
            quote = try container.decode(CheckoutQuote.self, forKey: .quote)
        } else {
            quote = try CheckoutQuote(from: decoder)
        }
    }
}

struct CustomerProfileResponse: Codable {
    let ok: Bool?
    let customer: CustomerProfile?
}

struct CheckoutQuote: Decodable {
    let cart: [CheckoutCartItem]?
    let shippingMethod: String
    let shippingCost: Decimal
    let subtotal: Decimal
    let firstDiscountPercent: Decimal
    let discountAmount: Decimal
    let total: Decimal
    let productionPolicyRequired: Bool?
    let productionItems: [ProductionItem]?

    enum CodingKeys: String, CodingKey {
        case cart
        case shippingMethod
        case shipping_method
        case shippingCost
        case shipping_cost
        case subtotal
        case firstDiscountPercent
        case first_discount_percent
        case discountAmount
        case discount_amount
        case total
        case productionPolicyRequired
        case production_policy_required
        case productionItems
        case production_items
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        cart = try container.decodeIfPresent([CheckoutCartItem].self, forKey: .cart)
        shippingMethod =
            (try? container.decode(String.self, forKey: .shippingMethod)) ??
            (try? container.decode(String.self, forKey: .shipping_method)) ??
            "ritiro"
        shippingCost =
            (try? container.decodeFlexibleDecimalIfPresent(forKey: .shippingCost)) ??
            (try? container.decodeFlexibleDecimalIfPresent(forKey: .shipping_cost)) ??
            0
        subtotal = (try? container.decodeFlexibleDecimalIfPresent(forKey: .subtotal)) ?? 0
        firstDiscountPercent =
            (try? container.decodeFlexibleDecimalIfPresent(forKey: .firstDiscountPercent)) ??
            (try? container.decodeFlexibleDecimalIfPresent(forKey: .first_discount_percent)) ??
            0
        discountAmount =
            (try? container.decodeFlexibleDecimalIfPresent(forKey: .discountAmount)) ??
            (try? container.decodeFlexibleDecimalIfPresent(forKey: .discount_amount)) ??
            0
        total = (try? container.decodeFlexibleDecimalIfPresent(forKey: .total)) ?? 0
        productionPolicyRequired =
            (try? container.decodeFlexibleBoolIfPresent(forKey: .productionPolicyRequired)) ??
            (try? container.decodeFlexibleBoolIfPresent(forKey: .production_policy_required))
        productionItems =
            (try? container.decodeIfPresent([ProductionItem].self, forKey: .productionItems)) ??
            (try? container.decodeIfPresent([ProductionItem].self, forKey: .production_items))
    }
}

struct ProductionItem: Decodable, Identifiable {
    let id: String
    let nome: String
    let requestedQuantity: Int
    let availableQuantity: Int

    enum CodingKeys: String, CodingKey {
        case id
        case nome
        case requestedQuantity
        case requested_quantity
        case availableQuantity
        case available_quantity
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = (try? container.decodeFlexibleString(forKey: .id)) ?? UUID().uuidString
        nome = (try? container.decode(String.self, forKey: .nome)) ?? ""
        requestedQuantity =
            (try? container.decodeFlexibleIntIfPresent(forKey: .requestedQuantity)) ??
            (try? container.decodeFlexibleIntIfPresent(forKey: .requested_quantity)) ??
            0
        availableQuantity =
            (try? container.decodeFlexibleIntIfPresent(forKey: .availableQuantity)) ??
            (try? container.decodeFlexibleIntIfPresent(forKey: .available_quantity)) ??
            0
    }
}

struct FinalizeResponse: Codable {
    let ok: Bool?
    let orderId: String
    let total: Decimal?
}

struct ReserveResponse: Codable {
    let ok: Bool?
    let tempOrderId: String
    let total: Decimal?
}

struct APIErrorResponse: Codable {
    let error: String?
    let message: String?
    let msg: String?
    let code: String?

    enum CodingKeys: String, CodingKey {
        case error, message, msg, code
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        error = try container.decodeIfPresent(String.self, forKey: .error)
        message = try container.decodeIfPresent(String.self, forKey: .message)
        msg = try container.decodeIfPresent(String.self, forKey: .msg)
        if let stringCode = try? container.decodeIfPresent(String.self, forKey: .code) {
            code = stringCode
        } else if let intCode = try? container.decodeIfPresent(Int.self, forKey: .code) {
            code = String(intCode)
        } else {
            code = nil
        }
    }

    var displayMessage: String? {
        [error, message, msg].compactMap { value in
            let trimmed = value?.trimmingCharacters(in: .whitespacesAndNewlines)
            return trimmed?.isEmpty == false ? trimmed : nil
        }.first
    }
}

extension KeyedDecodingContainer {
    func decodeFlexibleString(forKey key: Key) throws -> String {
        if let value = try? decode(String.self, forKey: key) {
            return value
        }
        if let value = try? decode(Int.self, forKey: key) {
            return String(value)
        }
        if let value = try? decode(UUID.self, forKey: key) {
            return value.uuidString
        }
        throw DecodingError.typeMismatch(
            String.self,
            DecodingError.Context(codingPath: codingPath + [key], debugDescription: "Expected string-compatible value")
        )
    }

    func decodeFlexibleDecimal(forKey key: Key) throws -> Decimal {
        if let value = try? decode(Decimal.self, forKey: key) {
            return value
        }
        if let value = try? decode(Double.self, forKey: key) {
            return Decimal(value)
        }
        if let value = try? decode(Int.self, forKey: key) {
            return Decimal(value)
        }
        if let value = try? decode(String.self, forKey: key) {
            return Self.parseFlexibleDecimal(value)
        }
        return 0
    }

    func decodeFlexibleDecimalIfPresent(forKey key: Key) throws -> Decimal? {
        guard contains(key) else {
            return nil
        }
        if (try? decodeNil(forKey: key)) == true {
            return nil
        }
        return try decodeFlexibleDecimal(forKey: key)
    }

    func decodeFlexibleInt(forKey key: Key) throws -> Int {
        if let value = try? decode(Int.self, forKey: key) {
            return value
        }
        if let value = try? decode(Double.self, forKey: key) {
            return Int(value)
        }
        if let value = try? decode(String.self, forKey: key) {
            let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
            if let intValue = Int(trimmed) {
                return intValue
            }
            if let doubleValue = Double(trimmed) {
                return Int(doubleValue)
            }
        }
        return 0
    }

    func decodeFlexibleIntIfPresent(forKey key: Key) throws -> Int? {
        guard contains(key) else {
            return nil
        }
        if (try? decodeNil(forKey: key)) == true {
            return nil
        }
        return try decodeFlexibleInt(forKey: key)
    }

    func decodeFlexibleBool(forKey key: Key) throws -> Bool {
        if let value = try? decode(Bool.self, forKey: key) {
            return value
        }
        if let value = try? decode(Int.self, forKey: key) {
            return value != 0
        }
        if let value = try? decode(String.self, forKey: key) {
            let normalized = value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
            if ["true", "1", "yes", "y", "si"].contains(normalized) {
                return true
            }
            if ["false", "0", "no", "n"].contains(normalized) {
                return false
            }
        }
        return false
    }

    func decodeFlexibleBoolIfPresent(forKey key: Key) throws -> Bool? {
        guard contains(key) else {
            return nil
        }
        if (try? decodeNil(forKey: key)) == true {
            return nil
        }
        return try decodeFlexibleBool(forKey: key)
    }

    private static func parseFlexibleDecimal(_ rawValue: String) -> Decimal {
        let trimmed = rawValue
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "\u{00A0}", with: "")
            .replacingOccurrences(of: " ", with: "")
            .replacingOccurrences(of: "€", with: "")

        guard !trimmed.isEmpty else { return 0 }

        let normalized: String
        if trimmed.contains(",") && trimmed.contains(".") {
            normalized = trimmed
                .replacingOccurrences(of: ".", with: "")
                .replacingOccurrences(of: ",", with: ".")
        } else if trimmed.contains(",") {
            normalized = trimmed.replacingOccurrences(of: ",", with: ".")
        } else {
            normalized = trimmed
        }

        return Decimal(string: normalized, locale: Locale(identifier: "en_US_POSIX")) ?? 0
    }
}
