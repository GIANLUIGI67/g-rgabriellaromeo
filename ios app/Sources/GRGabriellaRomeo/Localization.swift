import Foundation

enum AppLanguage: String, CaseIterable, Identifiable {
    case it, en, fr, de, es, ar, zh, ja

    var id: String { rawValue }

    var flag: String {
        switch self {
        case .it: "🇮🇹"
        case .en: "🇬🇧"
        case .fr: "🇫🇷"
        case .de: "🇩🇪"
        case .es: "🇪🇸"
        case .ar: "🇸🇦"
        case .zh: "🇨🇳"
        case .ja: "🇯🇵"
        }
    }
}

struct L10n {
    let language: AppLanguage

    func text(_ key: Key) -> String {
        Self.table[key]?[language] ?? Self.table[key]?[.it] ?? key.rawValue
    }

    enum Key: String {
        case homeTitle, menu, navigation, home, gallery, abbigliamento, gioielli, accessori, offerte, servizi, eventi, brand
        case cart, login, logout, register, account, createAccount, forgotPassword
        case email, password, name, surname, country, city, address, postalCode, phone, phone1, phone2
        case addToCart, soldOut, checkout, total, emptyCart, continueShopping
        case bankTransfer, confirmBankTransfer, terms, orderConfirmed, profileRequired
        case standardShipping, expressShipping, storePickup, shipping, payment
        case allSubcategories, noProducts, priceOnRequest, requestPrice, addedToCart
        case productionPolicyTitle, productionPolicyBody, productionPolicyAccept, cancel
        case contacts, ourServices, servicesDescription, servicesEmailIntro
        case wishlistBenefit, checkoutBenefit, discountBenefit, referralBenefit
        case enterEmail, resetSent
    }

    private static let table: [Key: [AppLanguage: String]] = [
        .homeTitle: [.it: "G-R Gabriella Romeo", .en: "G-R Gabriella Romeo"],
        .menu: [.it: "Menu", .en: "Menu", .fr: "Menu", .de: "Menü", .es: "Menú", .ar: "القائمة", .zh: "菜单", .ja: "メニュー"],
        .navigation: [.it: "Navigazione", .en: "Navigation", .fr: "Navigation", .de: "Navigation", .es: "Navegación", .ar: "التنقل", .zh: "导航", .ja: "ナビ"],
        .home: [.it: "Home", .en: "Home", .fr: "Accueil", .de: "Startseite", .es: "Inicio", .ar: "الرئيسية", .zh: "首页", .ja: "ホーム"],
        .gallery: [.it: "Galleria", .en: "Gallery", .fr: "Galerie", .de: "Galerie", .es: "Galería", .ar: "معرض", .zh: "画廊", .ja: "ギャラリー"],
        .abbigliamento: [.it: "Abbigliamento", .en: "Clothing", .fr: "Vêtements", .de: "Kleidung", .es: "Ropa", .ar: "ملابس", .zh: "服装", .ja: "衣類"],
        .gioielli: [.it: "Gioielli", .en: "Jewelry", .fr: "Bijoux", .de: "Schmuck", .es: "Joyas", .ar: "مجوهرات", .zh: "珠宝", .ja: "ジュエリー"],
        .accessori: [.it: "Accessori", .en: "Accessories", .fr: "Accessoires", .de: "Accessoires", .es: "Accesorios", .ar: "إكسسوارات", .zh: "配饰", .ja: "アクセサリー"],
        .offerte: [.it: "Offerte", .en: "Offers", .fr: "Offres", .de: "Angebote", .es: "Ofertas", .ar: "عروض", .zh: "优惠", .ja: "セール"],
        .servizi: [.it: "Servizi", .en: "Services", .fr: "Services", .de: "Dienstleistungen", .es: "Servicios", .ar: "خدمات", .zh: "服务", .ja: "サービス"],
        .eventi: [.it: "Eventi", .en: "Events", .fr: "Événements", .de: "Veranstaltungen", .es: "Eventos", .ar: "فعاليات", .zh: "活动", .ja: "イベント"],
        .brand: [.it: "Il Brand", .en: "The Brand", .fr: "La marque", .de: "Die Marke", .es: "La marca", .ar: "العلامة", .zh: "品牌", .ja: "ブランド"],
        .cart: [.it: "Carrello", .en: "Cart", .fr: "Panier", .de: "Warenkorb", .es: "Carrito", .ar: "السلة", .zh: "购物车", .ja: "カート"],
        .login: [.it: "Login", .en: "Login", .fr: "Connexion", .de: "Anmelden", .es: "Iniciar sesión", .ar: "تسجيل الدخول", .zh: "登录", .ja: "ログイン"],
        .logout: [.it: "Logout", .en: "Logout", .fr: "Déconnexion", .de: "Abmelden", .es: "Cerrar sesión", .ar: "تسجيل الخروج", .zh: "退出登录", .ja: "ログアウト"],
        .register: [.it: "Registrati", .en: "Register", .fr: "S'inscrire", .de: "Registrieren", .es: "Registrarse", .ar: "تسجيل", .zh: "注册", .ja: "登録"],
        .account: [.it: "Account", .en: "Account", .fr: "Compte", .de: "Konto", .es: "Cuenta", .ar: "الحساب", .zh: "账户", .ja: "アカウント"],
        .createAccount: [.it: "Crea account", .en: "Create account", .fr: "Créer un compte", .de: "Konto erstellen", .es: "Crear cuenta", .ar: "إنشاء حساب", .zh: "创建账户", .ja: "アカウント作成"],
        .forgotPassword: [.it: "Password dimenticata?", .en: "Forgot password?", .fr: "Mot de passe oublié ?", .de: "Passwort vergessen?", .es: "¿Olvidaste la contraseña?", .ar: "هل نسيت كلمة المرور؟", .zh: "忘记密码？", .ja: "パスワードを忘れましたか？"],
        .email: [.it: "Email", .en: "Email", .fr: "Email", .de: "E-Mail", .es: "Email", .ar: "البريد الإلكتروني", .zh: "电子邮件", .ja: "メール"],
        .password: [.it: "Password", .en: "Password", .fr: "Mot de passe", .de: "Passwort", .es: "Contraseña", .ar: "كلمة المرور", .zh: "密码", .ja: "パスワード"],
        .name: [.it: "Nome", .en: "Name", .fr: "Prénom", .de: "Vorname", .es: "Nombre", .ar: "الاسم", .zh: "名字", .ja: "名前"],
        .surname: [.it: "Cognome", .en: "Surname", .fr: "Nom", .de: "Nachname", .es: "Apellido", .ar: "اسم العائلة", .zh: "姓氏", .ja: "姓"],
        .country: [.it: "Paese", .en: "Country", .fr: "Pays", .de: "Land", .es: "País", .ar: "البلد", .zh: "国家", .ja: "国"],
        .city: [.it: "Città", .en: "City", .fr: "Ville", .de: "Stadt", .es: "Ciudad", .ar: "المدينة", .zh: "城市", .ja: "都市"],
        .address: [.it: "Indirizzo", .en: "Address", .fr: "Adresse", .de: "Adresse", .es: "Dirección", .ar: "العنوان", .zh: "地址", .ja: "住所"],
        .postalCode: [.it: "CAP", .en: "Postal code", .fr: "Code postal", .de: "Postleitzahl", .es: "Código postal", .ar: "الرمز البريدي", .zh: "邮编", .ja: "郵便番号"],
        .phone: [.it: "Telefono", .en: "Phone", .fr: "Téléphone", .de: "Telefon", .es: "Teléfono", .ar: "الهاتف", .zh: "电话", .ja: "電話"],
        .phone1: [.it: "Telefono 1", .en: "Phone 1", .fr: "Téléphone 1", .de: "Telefon 1", .es: "Teléfono 1", .ar: "الهاتف 1", .zh: "电话 1", .ja: "電話 1"],
        .phone2: [.it: "Telefono 2", .en: "Phone 2", .fr: "Téléphone 2", .de: "Telefon 2", .es: "Teléfono 2", .ar: "الهاتف 2", .zh: "电话 2", .ja: "電話 2"],
        .addToCart: [.it: "Aggiungi", .en: "Add", .fr: "Ajouter", .de: "Hinzufügen", .es: "Añadir", .ar: "أضف", .zh: "添加", .ja: "追加"],
        .soldOut: [.it: "Venduto", .en: "Sold out", .fr: "Vendu", .de: "Ausverkauft", .es: "Agotado", .ar: "مباع", .zh: "售罄", .ja: "売り切れ"],
        .checkout: [.it: "Checkout", .en: "Checkout", .fr: "Paiement", .de: "Kasse", .es: "Pago", .ar: "الدفع", .zh: "结账", .ja: "チェックアウト"],
        .total: [.it: "Totale", .en: "Total", .fr: "Total", .de: "Gesamt", .es: "Total", .ar: "المجموع", .zh: "总计", .ja: "合計"],
        .emptyCart: [.it: "Il carrello è vuoto", .en: "Your cart is empty", .fr: "Votre panier est vide", .de: "Ihr Warenkorb ist leer", .es: "El carrito está vacío", .ar: "السلة فارغة", .zh: "购物车为空", .ja: "カートは空です"],
        .continueShopping: [.it: "Continua shopping", .en: "Continue shopping", .fr: "Continuer les achats", .de: "Weiter einkaufen", .es: "Seguir comprando", .ar: "متابعة التسوق", .zh: "继续购物", .ja: "買い物を続ける"],
        .bankTransfer: [.it: "Bonifico bancario", .en: "Bank transfer", .fr: "Virement bancaire", .de: "Banküberweisung", .es: "Transferencia bancaria", .ar: "تحويل بنكي", .zh: "银行转账", .ja: "銀行振込"],
        .confirmBankTransfer: [.it: "Conferma bonifico", .en: "Confirm bank transfer", .fr: "Confirmer le virement", .de: "Überweisung bestätigen", .es: "Confirmar transferencia", .ar: "تأكيد التحويل", .zh: "确认转账", .ja: "振込を確認"],
        .terms: [.it: "Accetto termini e condizioni", .en: "I accept terms and conditions", .fr: "J'accepte les conditions", .de: "Ich akzeptiere die Bedingungen", .es: "Acepto los términos", .ar: "أوافق على الشروط", .zh: "我接受条款", .ja: "利用規約に同意します"],
        .orderConfirmed: [.it: "Ordine confermato", .en: "Order confirmed", .fr: "Commande confirmée", .de: "Bestellung bestätigt", .es: "Pedido confirmado", .ar: "تم تأكيد الطلب", .zh: "订单已确认", .ja: "注文が確認されました"],
        .profileRequired: [.it: "Accedi o crea un account per procedere", .en: "Login or create an account to continue", .fr: "Connectez-vous ou créez un compte", .de: "Einloggen oder Konto erstellen", .es: "Inicia sesión o crea una cuenta", .ar: "سجل الدخول أو أنشئ حسابًا للمتابعة", .zh: "请登录或创建账户继续", .ja: "続行するにはログインまたは登録してください"],
        .standardShipping: [.it: "Spedizione standard", .en: "Standard shipping", .fr: "Livraison standard", .de: "Standardversand", .es: "Envío estándar", .ar: "شحن عادي", .zh: "标准配送", .ja: "通常配送"],
        .expressShipping: [.it: "Spedizione express", .en: "Express shipping", .fr: "Livraison express", .de: "Expressversand", .es: "Envío exprés", .ar: "شحن سريع", .zh: "快速配送", .ja: "速達配送"],
        .storePickup: [.it: "Ritiro in negozio", .en: "Store pickup", .fr: "Retrait en boutique", .de: "Abholung im Geschäft", .es: "Recogida en tienda", .ar: "استلام من المتجر", .zh: "店内自取", .ja: "店舗受け取り"],
        .shipping: [.it: "Spedizione", .en: "Shipping", .fr: "Livraison", .de: "Versand", .es: "Envío", .ar: "الشحن", .zh: "配送", .ja: "配送"],
        .payment: [.it: "Pagamento", .en: "Payment", .fr: "Paiement", .de: "Zahlung", .es: "Pago", .ar: "الدفع", .zh: "支付", .ja: "支払い"],
        .allSubcategories: [.it: "Tutte le sottocategorie", .en: "All subcategories", .fr: "Toutes les sous-catégories", .de: "Alle Unterkategorien", .es: "Todas las subcategorías", .ar: "كل الفئات الفرعية", .zh: "所有子类别", .ja: "すべてのサブカテゴリ"],
        .noProducts: [.it: "Nessun prodotto disponibile", .en: "No products available", .fr: "Aucun produit disponible", .de: "Keine Produkte verfügbar", .es: "No hay productos disponibles", .ar: "لا توجد منتجات متاحة", .zh: "暂无可用产品", .ja: "商品はありません"],
        .priceOnRequest: [.it: "Prezzo su richiesta", .en: "Price on request", .fr: "Prix sur demande", .de: "Preis auf Anfrage", .es: "Precio bajo solicitud", .ar: "السعر عند الطلب", .zh: "价格需咨询", .ja: "価格はお問い合わせください"],
        .requestPrice: [.it: "Richiedi prezzo", .en: "Request price", .fr: "Demander le prix", .de: "Preis anfragen", .es: "Solicitar precio", .ar: "اطلب السعر", .zh: "咨询价格", .ja: "価格を問い合わせる"],
        .addedToCart: [.it: "Aggiunto al carrello", .en: "Added to cart", .fr: "Ajouté au panier", .de: "Zum Warenkorb hinzugefügt", .es: "Añadido al carrito", .ar: "تمت الإضافة إلى السلة", .zh: "已加入购物车", .ja: "カートに追加しました"],
        .productionPolicyTitle: [.it: "Policy per la produzione", .en: "Production policy", .fr: "Politique de production", .de: "Produktionsrichtlinie", .es: "Política de producción", .ar: "سياسة الإنتاج", .zh: "生产政策", .ja: "生産ポリシー"],
        .productionPolicyBody: [.it: "L'articolo richiesto non è presente in magazzino e deve essere prodotto. Accettando questa policy confermi di voler procedere e di attendere produzione e spedizione fino a un massimo di 30 giorni, dopo i quali potrà essere richiesto un rimborso.", .en: "This item is not currently in stock and must be produced. By accepting this policy, you confirm that you want to proceed and wait for production and shipping for up to 30 days, after which a refund may be requested.", .fr: "L'article demandé n'est pas en stock et doit être produit. En acceptant cette politique, vous confirmez vouloir procéder et attendre la production et l'expédition jusqu'à 30 jours, après quoi un remboursement pourra être demandé.", .de: "Der angeforderte Artikel ist derzeit nicht auf Lager und muss produziert werden. Mit der Annahme dieser Richtlinie bestätigen Sie, dass Sie fortfahren und bis zu 30 Tage auf Produktion und Versand warten möchten. Danach kann eine Rückerstattung beantragt werden.", .es: "El artículo solicitado no está en stock y debe producirse. Al aceptar esta política, confirmas que deseas continuar y esperar la producción y el envío hasta un máximo de 30 días, después de los cuales se podrá solicitar un reembolso.", .ar: "هذا المنتج غير متوفر حالياً في المخزون ويجب إنتاجه. بقبول هذه السياسة، تؤكد رغبتك في المتابعة وانتظار الإنتاج والشحن لمدة تصل إلى 30 يوماً، وبعد ذلك يمكن طلب استرداد الأموال.", .zh: "该商品当前无库存，需要生产。接受此政策即表示您确认继续下单，并愿意等待最长 30 天的生产和发货，之后可申请退款。", .ja: "この商品は現在在庫がなく、生産が必要です。このポリシーに同意すると、注文を続行し、生産と発送を最大30日まで待つことに同意したことになります。その後、返金を申請できます。"],
        .productionPolicyAccept: [.it: "Accetto la policy per la produzione", .en: "I accept the production policy", .fr: "J'accepte la politique de production", .de: "Ich akzeptiere die Produktionsrichtlinie", .es: "Acepto la política de producción", .ar: "أوافق على سياسة الإنتاج", .zh: "我接受生产政策", .ja: "生産ポリシーに同意します"],
        .cancel: [.it: "Annulla", .en: "Cancel", .fr: "Annuler", .de: "Abbrechen", .es: "Cancelar", .ar: "إلغاء", .zh: "取消", .ja: "キャンセル"],
        .contacts: [.it: "Contatti", .en: "Contacts", .fr: "Contacts", .de: "Kontakt", .es: "Contactos", .ar: "اتصال", .zh: "联系方式", .ja: "連絡先"],
        .ourServices: [.it: "I nostri servizi", .en: "Our services", .fr: "Nos services", .de: "Unsere Dienstleistungen", .es: "Nuestros servicios", .ar: "خدماتنا", .zh: "我们的服务", .ja: "サービス"],
        .servicesDescription: [.it: "Offriamo servizi su misura per ogni esigenza. Contattaci per maggiori informazioni.", .en: "We offer tailored services for every need. Contact us for more information.", .fr: "Nous proposons des services sur mesure. Contactez-nous pour plus d'informations.", .de: "Wir bieten maßgeschneiderte Dienstleistungen. Kontaktieren Sie uns für weitere Informationen.", .es: "Ofrecemos servicios a medida. Contáctanos para más información.", .ar: "نقدم خدمات مخصصة لكل احتياج. تواصل معنا لمزيد من المعلومات.", .zh: "我们提供定制服务。请联系我们了解更多信息。", .ja: "ご要望に合わせたサービスをご提供します。詳細はお問い合わせください。"],
        .servicesEmailIntro: [.it: "Per informazioni e preventivi scrivi a:", .en: "For information and quotes write to:", .fr: "Pour informations et devis, écrivez à :", .de: "Für Informationen und Angebote schreiben Sie an:", .es: "Para información y presupuestos escribe a:", .ar: "للمعلومات وعروض الأسعار راسلنا على:", .zh: "如需信息和报价，请发送邮件至：", .ja: "情報と見積もりはこちらへ："],
        .wishlistBenefit: [.it: "Aggiungi prodotti alla lista desideri", .en: "Add products to your wishlist", .fr: "Ajoutez des produits à vos favoris", .de: "Produkte zur Wunschliste hinzufügen", .es: "Añade productos a favoritos", .ar: "أضف المنتجات إلى قائمة الرغبات", .zh: "将商品加入愿望清单", .ja: "商品をウィッシュリストに追加"],
        .checkoutBenefit: [.it: "Per un checkout più veloce", .en: "For faster checkout", .fr: "Pour un paiement plus rapide", .de: "Für einen schnelleren Checkout", .es: "Para pagar más rápido", .ar: "لإتمام الشراء بسرعة", .zh: "更快完成结账", .ja: "より速い購入手続き"],
        .discountBenefit: [.it: "Sconto 10% sul prossimo acquisto", .en: "10% off your next purchase", .fr: "10 % sur votre prochain achat", .de: "10 % Rabatt auf den nächsten Einkauf", .es: "10% en tu próxima compra", .ar: "خصم 10٪ على الشراء التالي", .zh: "下次购买享 10% 优惠", .ja: "次回購入が10%オフ"],
        .referralBenefit: [.it: "Referral program per sconti e buoni", .en: "Referral program for discounts and vouchers", .fr: "Programme de parrainage pour remises", .de: "Empfehlungsprogramm für Rabatte", .es: "Programa de referidos con descuentos", .ar: "برنامج إحالة للخصومات والقسائم", .zh: "推荐计划可获折扣和礼券", .ja: "紹介プログラムで割引と特典"],
        .enterEmail: [.it: "Inserisci la tua email", .en: "Enter your email", .fr: "Saisissez votre email", .de: "E-Mail eingeben", .es: "Introduce tu email", .ar: "أدخل بريدك الإلكتروني", .zh: "请输入电子邮件", .ja: "メールを入力してください"],
        .resetSent: [.it: "Ti abbiamo inviato una email per reimpostare la password.", .en: "We sent you an email to reset your password.", .fr: "Nous vous avons envoyé un email de réinitialisation.", .de: "Wir haben Ihnen eine E-Mail zum Zurücksetzen gesendet.", .es: "Te enviamos un email para restablecer la contraseña.", .ar: "أرسلنا لك بريدًا لإعادة تعيين كلمة المرور.", .zh: "我们已发送重置密码邮件。", .ja: "パスワード再設定メールを送信しました。"]
    ]
}
