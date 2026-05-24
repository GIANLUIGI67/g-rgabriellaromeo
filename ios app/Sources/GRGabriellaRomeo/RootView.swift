import SwiftUI
import UIKit

struct RootView: View {
    @EnvironmentObject private var store: AppStore
    @State private var isMenuOpen = false
    @State private var isContactOpen = false
    @State private var isAccountOpen = false
    @State private var showWishlistMessage = false

    var body: some View {
        NavigationStack {
            GeometryReader { geometry in
                let headerHorizontalPadding: CGFloat = geometry.size.width < 390 ? 10 : 18

                ZStack(alignment: .top) {
                    HeroBackground()

                    VStack(spacing: 0) {
                        WebHeader(
                            availableWidth: geometry.size.width - (headerHorizontalPadding * 2),
                            isMenuOpen: $isMenuOpen,
                            isContactOpen: $isContactOpen,
                            isAccountOpen: $isAccountOpen,
                            showWishlistMessage: $showWishlistMessage
                        )
                        .padding(.top, max(12, geometry.safeAreaInsets.top + 8))
                        .padding(.horizontal, headerHorizontalPadding)

                        Spacer()

                        BrandMark()
                            .padding(.bottom, geometry.size.height * 0.23)

                        Spacer()

                        FooterSocialBlock()
                            .padding(.bottom, max(26, geometry.safeAreaInsets.bottom + 18))
                    }
                    .frame(width: geometry.size.width, height: geometry.size.height)

                    if isMenuOpen {
                        NavigationDrawer(isPresented: $isMenuOpen)
                            .padding(.top, max(92, geometry.safeAreaInsets.top + 66))
                            .transition(.opacity)
                            .zIndex(10)
                    }

                    if isContactOpen {
                        ContactCard(isPresented: $isContactOpen)
                            .padding(.top, max(92, geometry.safeAreaInsets.top + 66))
                            .padding(.trailing, 96)
                            .frame(maxWidth: .infinity, alignment: .trailing)
                            .transition(.opacity)
                            .zIndex(11)
                    }

                    if isAccountOpen {
                        LoginPanel(isPresented: $isAccountOpen)
                            .frame(width: min(geometry.size.width * 0.68, 282))
                            .frame(height: min(geometry.size.height * 0.48, 390), alignment: .top)
                            .clipped()
                            .frame(maxWidth: .infinity, alignment: .trailing)
                            .padding(.top, max(56, geometry.safeAreaInsets.top + 30))
                            .transition(.move(edge: .trailing).combined(with: .opacity))
                            .zIndex(12)
                    }
                }
                .ignoresSafeArea()
            }
            .toolbar(.hidden, for: .navigationBar)
            .alert("Pagina in Sviluppo", isPresented: $showWishlistMessage) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("La pagina della wishlist e attualmente in fase di sviluppo. Tornera presto disponibile!")
            }
            .alert("Errore", isPresented: Binding(
                get: { store.errorMessage != nil },
                set: { if !$0 { store.errorMessage = nil } }
            )) {
                Button("OK", role: .cancel) { store.errorMessage = nil }
            } message: {
                Text(store.errorMessage ?? "")
            }
        }
    }
}

struct HeroBackground: View {
    var body: some View {
        GeometryReader { geometry in
            BundleImage(name: "hero", extensionName: "png")
                .scaledToFill()
                .frame(width: geometry.size.width, height: geometry.size.height, alignment: .center)
                .clipped()
                .overlay(Color.black.opacity(0.10))
        }
        .ignoresSafeArea()
    }
}

struct BundleImage: View {
    let name: String
    let extensionName: String

    var body: some View {
        if let url = Bundle.main.url(forResource: name, withExtension: extensionName),
           let uiImage = UIImage(contentsOfFile: url.path) {
            Image(uiImage: uiImage)
                .resizable()
        } else {
            Color.black
        }
    }
}

private struct WebHeader: View {
    let availableWidth: CGFloat
    @Binding var isMenuOpen: Bool
    @Binding var isContactOpen: Bool
    @Binding var isAccountOpen: Bool
    @Binding var showWishlistMessage: Bool

    var body: some View {
        HStack(spacing: headerSpacing) {
            NavigationLink {
                ProductListView(category: nil, title: "CERCA")
            } label: {
                Image(systemName: "magnifyingglass")
                    .webHeaderIcon(size: searchIconSize)
            }

            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isMenuOpen.toggle()
                    isContactOpen = false
                    isAccountOpen = false
                }
            } label: {
                HStack(spacing: menuItemSpacing) {
                    Image(systemName: "line.3.horizontal")
                        .font(.system(size: menuIconSize, weight: .regular))
                    Text("MENU")
                        .font(.custom("Michroma-Regular", size: menuTextSize))
                        .lineLimit(1)
                        .minimumScaleFactor(0.78)
                }
                .foregroundStyle(Color.grGold)
            }
            .layoutPriority(1)

            Spacer(minLength: 0)

            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isContactOpen.toggle()
                    isMenuOpen = false
                    isAccountOpen = false
                }
            } label: {
                Image(systemName: "phone")
                    .webHeaderIcon(size: iconSize)
            }

            Button {
                isMenuOpen = false
                isContactOpen = false
                isAccountOpen = false
                showWishlistMessage = true
            } label: {
                Image(systemName: "heart")
                    .webHeaderIcon(size: heartIconSize)
            }

            NavigationLink {
                CheckoutView()
            } label: {
                Image(systemName: "cart")
                    .webHeaderIcon(size: iconSize)
            }

            Button {
                withAnimation(.easeInOut(duration: 0.18)) {
                    isAccountOpen.toggle()
                    isMenuOpen = false
                    isContactOpen = false
                }
            } label: {
                Image(systemName: "person")
                    .webHeaderIcon(size: iconSize)
            }
        }
        .frame(maxWidth: .infinity)
    }

    private var isCompact: Bool { availableWidth < 410 }
    private var isNarrow: Bool { availableWidth < 350 }
    private var headerSpacing: CGFloat { isCompact ? 8 : 12 }
    private var menuItemSpacing: CGFloat { isCompact ? 6 : 10 }
    private var menuTextSize: CGFloat { isNarrow ? 17 : (isCompact ? 18 : 24) }
    private var menuIconSize: CGFloat { isCompact ? 21 : 25 }
    private var searchIconSize: CGFloat { isCompact ? 22 : 27 }
    private var iconSize: CGFloat { isCompact ? 23 : 27 }
    private var heartIconSize: CGFloat { isCompact ? 24 : 28 }
}

private struct BrandMark: View {
    var body: some View {
        VStack(spacing: 14) {
            Text("G-R")
                .font(.custom("Michroma-Regular", size: 60))
                .frame(maxWidth: .infinity)
            Text("GABRIELLA ROMEO")
                .font(.custom("Michroma-Regular", size: 30))
                .frame(maxWidth: .infinity)
        }
        .foregroundStyle(Color.grGold)
        .tracking(5)
        .multilineTextAlignment(.center)
        .minimumScaleFactor(0.62)
        .lineLimit(1)
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 18)
    }
}

private struct FooterSocialBlock: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        VStack(spacing: 18) {
            BundleImage(name: "qr-instagram", extensionName: "png")
                .scaledToFit()
                .frame(width: 104, height: 104)

            VStack(spacing: 5) {
                HStack(spacing: 10) {
                    Image(systemName: "camera")
                        .font(.system(size: 18, weight: .regular))
                    Text("Instagram")
                        .font(.custom("Michroma-Regular", size: 18))
                }

                HStack(spacing: 7) {
                    Image(systemName: "c.circle")
                        .font(.system(size: 12, weight: .regular))
                    Text("grgabriellaromeo")
                        .font(.custom("Michroma-Regular", size: 12))
                }
            }
            .foregroundStyle(Color.grGold)

            HStack(spacing: 13) {
                ForEach(AppLanguage.allCases) { language in
                    Button {
                        store.language = language
                    } label: {
                        Text(language.flag)
                            .font(.system(size: 20))
                            .opacity(store.language == language ? 1 : 0.5)
                            .scaleEffect(store.language == language ? 1.08 : 1)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Lingua \(language.rawValue)")
                }
            }
        }
    }
}

private struct NavigationDrawer: View {
    @Binding var isPresented: Bool
    @EnvironmentObject private var store: AppStore

    private let items: [(L10n.Key?, String?, String)] = [
        (nil, nil, "Home"),
        (.gioielli, "gioielli", "Gioielli"),
        (.abbigliamento, "abbigliamento", "Abbigliamento"),
        (.accessori, "accessori", "Accessori"),
        (.offerte, "offerte", "Offerte"),
        (nil, "servizi", "Servizi"),
        (nil, "eventi", "Eventi"),
        (nil, "brand", "Il Brand")
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack(spacing: 10) {
                Text("NAVIGAZIONE")
                    .font(.custom("Michroma-Regular", size: 14))
                    .foregroundStyle(.black)
                    .lineLimit(1)
                    .minimumScaleFactor(0.68)
                    .allowsTightening(true)
                    .layoutPriority(1)
                Spacer()
                Button {
                    withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 18, weight: .regular))
                        .foregroundStyle(.black)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                ForEach(items, id: \.2) { item in
                    if let category = item.1 {
                        NavigationLink {
                            if category == "eventi" {
                                EventsView()
                            } else if category == "servizi" {
                                ServicesView()
                            } else if category == "brand" {
                                BrandView()
                            } else {
                                ProductListView(category: category, title: title(for: category))
                            }
                        } label: {
                            Text(label(for: item))
                                .drawerItem()
                        }
                    } else {
                        Button {
                            withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
                        } label: {
                            Text(label(for: item))
                                .drawerItem()
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.top, 12)
        .padding(.bottom, 13)
        .frame(width: 248, alignment: .leading)
        .background(Color.white)
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func label(for item: (L10n.Key?, String?, String)) -> String {
        if let key = item.0 {
            return store.l10n.text(key)
        }
        return item.2
    }

    private func title(for category: String) -> String {
        switch category {
        case "gioielli":
            return "GALLERIA GIOIELLI"
        case "abbigliamento":
            return "GALLERIA ABBIGLIAMENTO"
        case "accessori":
            return "GALLERIA ACCESSORI"
        case "offerte":
            return "OFFERTE"
        case "servizi":
            return "SERVIZI"
        case "eventi":
            return "EVENTI"
        case "brand":
            return "IL BRAND"
        default:
            return category.uppercased()
        }
    }
}

struct EventsView: View {
    @EnvironmentObject private var store: AppStore

    private var inProgrammazione: [EventRecord] {
        store.events.filter { $0.isInProgrammazione }
    }

    private var conclusi: [EventRecord] {
        store.events.filter { $0.stato == "concluso" }
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    Text("EVENTI")
                        .font(.custom("Michroma-Regular", size: 26))
                        .foregroundStyle(Color.grGold)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .padding(.top, 24)

                    if store.events.isEmpty {
                        Text("NESSUN EVENTO")
                            .font(.custom("Michroma-Regular", size: 14))
                            .foregroundStyle(Color.grGold.opacity(0.76))
                            .frame(maxWidth: .infinity, alignment: .center)
                            .padding(.top, 40)
                    } else {
                        EventsSection(title: "IN PROGRAMMAZIONE", events: inProgrammazione)
                        EventsSection(title: "CONCLUSI", events: conclusi)
                    }
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 34)
            }

            WebBackButton()
                .padding(.top, 48)
                .padding(.leading, 14)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .task {
            await store.refreshEvents()
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}

struct ServicesView: View {
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 18) {
                Text("SERVIZI")
                    .font(.custom("Michroma-Regular", size: 34))
                    .foregroundStyle(Color.grGold)
                    .multilineTextAlignment(.center)
                    .padding(.top, 96)

                Text("I nostri servizi")
                    .font(.custom("Michroma-Regular", size: 17))
                    .foregroundStyle(Color.grGold.opacity(0.86))

                Text("Offriamo servizi su misura per ogni esigenza. Contattaci per maggiori informazioni.")
                    .font(.custom("Michroma-Regular", size: 13))
                    .foregroundStyle(Color.grGold.opacity(0.74))
                    .multilineTextAlignment(.center)
                    .lineSpacing(5)
                    .padding(.horizontal, 28)

                Link("info@g-rgabriellaromeo.it", destination: URL(string: "mailto:info@g-rgabriellaromeo.it")!)
                    .font(.custom("Michroma-Regular", size: 13))
                    .foregroundStyle(Color.grGold)

                Spacer()
            }
            .padding(.horizontal, 22)

            WebBackButton()
                .padding(.top, 48)
                .padding(.leading, 14)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}

struct BrandView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    private var brandText: String {
        Self.texts[store.language] ?? Self.texts[.it] ?? ""
    }

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                Image("BrandCarretti")
                    .resizable()
                    .scaledToFill()
                    .frame(width: geometry.size.width, height: geometry.size.height)
                    .clipped()
                    .ignoresSafeArea()

                LinearGradient(
                    colors: [
                        Color.black.opacity(0.68),
                        Color.black.opacity(0.34)
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 12) {
                        Text(brandText)
                            .font(.custom("Michroma-Regular", size: 15))
                            .foregroundStyle(.white)
                            .multilineTextAlignment(.center)
                            .lineSpacing(8)
                            .shadow(color: .black.opacity(0.55), radius: 8, x: 0, y: 2)
                            .fixedSize(horizontal: false, vertical: true)

                        Image("BrandSignature")
                            .resizable()
                            .scaledToFit()
                            .frame(width: min(geometry.size.width * 0.62, 280))
                            .blendMode(.screen)
                            .shadow(color: .black.opacity(0.5), radius: 4, x: 0, y: 2)
                    }
                    .padding(.horizontal, 24)
                    .padding(.top, max(88, geometry.safeAreaInsets.top + 72))
                    .padding(.bottom, max(34, geometry.safeAreaInsets.bottom + 24))
                    .frame(minHeight: geometry.size.height, alignment: .center)
                }

                Button {
                    dismiss()
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundStyle(.black)
                        .frame(width: 42, height: 34)
                        .background(Color.white)
                        .clipShape(RoundedRectangle(cornerRadius: 6))
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Indietro")
                .padding(.top, max(16, geometry.safeAreaInsets.top + 8))
                .padding(.leading, 16)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
    }

    private static let texts: [AppLanguage: String] = [
        .it: """
        Gabriella Romeo nasce a Catania, culla di miti e luce mediterranea, dove il sole bacia il mare e la storia si intreccia con la magia. Ogni creazione è un pezzo unico, realizzato a mano con amore e dedizione, un’incantevole fusione di arte e cuore.

        Il brand celebra una femminilità rara, autentica e potente, capace di illuminare chi la indossa con eleganza senza tempo. GR Gabriella Romeo è molto più di moda: è un viaggio poetico tra tradizione e innovazione, un sogno tangibile che cattura l’essenza vibrante e magica della Sicilia.

        Questo è il mio stile.
        """,
        .en: """
        Gabriella Romeo was born in Catania, cradle of myths and Mediterranean light, where the sun kisses the sea and history intertwines with magic. Each creation is a unique piece, handmade with love and dedication — a magical fusion of art and heart.

        The brand celebrates a rare, authentic and powerful femininity, capable of illuminating the wearer with timeless elegance. GR Gabriella Romeo is more than fashion: it is a poetic journey between tradition and innovation, a tangible dream that captures the vibrant and magical essence of Sicily.

        This is my style.
        """,
        .fr: """
        Gabriella Romeo est née à Catane, berceau des mythes et de la lumière méditerranéenne, où le soleil embrasse la mer et où l’histoire se mêle à la magie. Chaque création est une pièce unique, réalisée à la main avec amour et dévouement, une fusion enchanteresse d’art et de cœur.

        La marque célèbre une féminité rare, authentique et puissante, capable d’illuminer celle qui la porte avec une élégance intemporelle. GR Gabriella Romeo, c’est bien plus que de la mode : c’est un voyage poétique entre tradition et innovation, un rêve tangible qui capture l’essence vibrante et magique de la Sicile.

        C’est mon style.
        """,
        .de: """
        Gabriella Romeo wurde in Catania geboren, Wiege von Mythen und mediterranem Licht, wo die Sonne das Meer küsst und sich Geschichte mit Magie vermischt. Jede Kreation ist ein Unikat, von Hand gefertigt mit Liebe und Hingabe — eine zauberhafte Verschmelzung von Kunst und Herz.

        Die Marke feiert eine seltene, authentische und kraftvolle Weiblichkeit, die ihre Trägerin mit zeitloser Eleganz erstrahlen lässt. GR Gabriella Romeo ist mehr als Mode: eine poetische Reise zwischen Tradition und Innovation, ein greifbarer Traum, der die lebendige, magische Essenz Siziliens einfängt.

        Das ist mein Stil.
        """,
        .es: """
        Gabriella Romeo nació en Catania, cuna de mitos y luz mediterránea, donde el sol besa el mar y la historia se entrelaza con la magia. Cada creación es una pieza única, hecha a mano con amor y dedicación, una fusión encantadora de arte y corazón.

        La marca celebra una feminidad rara, auténtica y poderosa, capaz de iluminar a quien la lleva con una elegancia atemporal. GR Gabriella Romeo es mucho más que moda: es un viaje poético entre tradición e innovación, un sueño tangible que captura la esencia vibrante y mágica de Sicilia.

        Este es mi estilo.
        """,
        .ar: """
        وُلدت علامة Gabriella Romeo في كاتانيا، مهد الأساطير والنور المتوسطي، حيث تقبّل الشمس البحر وتتشابك فيهما الحكاية بالسحر. كلّ تصميم هو قطعة فريدة مصنوعة يدويًا بحب واهتمام، ومزيج ساحر بين الفن والقلب.

        تحتفي العلامة بأنوثة نادرة وأصيلة وقوية، تضيء من ترتديها بأناقة خالدة. GR Gabriella Romeo هي أكثر من مجرّد موضة؛ إنها رحلة شعرية بين التقاليد والابتكار، حلم ملموس يلتقط جوهر صقلية النابض والساحر.

        هذا هو أسلوبي.
        """,
        .zh: """
        Gabriella Romeo 诞生于卡塔尼亚，这是一个充满神话与地中海阳光的地方，阳光亲吻着大海，历史与魔法交织在一起。每件作品都是独一无二的手工制作，融合了爱与奉献，是艺术与心灵的迷人结合。

        这个品牌颂扬一种罕见、真实而强大的女性气质，使佩戴者散发出永恒的优雅。GR Gabriella Romeo 远不止于时尚：它是一场诗意的旅程，融合传统与创新，是一个捕捉西西里岛生动魔力的可触梦想。

        这就是我的风格。
        """,
        .ja: """
        Gabriella Romeo は、神話と地中海の光に満ちたカターニアで生まれました。太陽が海を照らし、歴史が魔法と交差する地です。すべての作品は、愛と献身を込めて手作業で作られたユニークな一点物であり、芸術と心の魅惑的な融合です。

        ブランドは、まれで本物、そして力強い女性らしさを称賛し、それをまとう人を時を超えた優雅さで輝かせます。GR Gabriella Romeo はファッションを超えた存在。伝統と革新の間を旅する詩的な物語であり、西シチリアの活気ある魔法の本質を捉えた、触れられる夢です。

        これが私のスタイルです。
        """
    ]
}

private struct EventsSection: View {
    let title: String
    let events: [EventRecord]

    var body: some View {
        if !events.isEmpty {
            VStack(alignment: .leading, spacing: 14) {
                Text(title)
                    .font(.custom("Michroma-Regular", size: 14))
                    .foregroundStyle(Color.grGold)

                ForEach(events) { event in
                    EventCard(event: event)
                }
            }
        }
    }
}

private struct EventCard: View {
    let event: EventRecord

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            if let url = event.primaryImageURL {
                AsyncImage(url: url) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .scaledToFill()
                    default:
                        Color(red: 0.07, green: 0.07, blue: 0.07)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 210)
                .clipped()
            }

            VStack(alignment: .leading, spacing: 8) {
                Text(event.titolo)
                    .font(.custom("Michroma-Regular", size: 17))
                    .foregroundStyle(Color.grGold)
                    .lineLimit(2)
                    .minimumScaleFactor(0.78)

                if let dateLabel = event.dateLabel {
                    Text(dateLabel)
                        .font(.custom("Michroma-Regular", size: 11))
                        .foregroundStyle(Color.grGold.opacity(0.68))
                }

                if let description = event.descrizione, !description.isEmpty {
                    Text(description)
                        .font(.custom("Michroma-Regular", size: 11))
                        .foregroundStyle(Color.grGold.opacity(0.82))
                        .lineSpacing(4)
                }

                if !event.pdfUrls.isEmpty || !event.videoUrls.isEmpty {
                    Text("PDF \(event.pdfUrls.count)  VIDEO \(event.videoUrls.count)")
                        .font(.custom("Michroma-Regular", size: 10))
                        .foregroundStyle(Color.grGold.opacity(0.74))
                        .padding(.top, 2)
                }
            }
            .padding(14)
        }
        .background(Color(red: 0.04, green: 0.04, blue: 0.04))
        .overlay(Rectangle().stroke(Color.grGold.opacity(0.18), lineWidth: 1))
    }
}

private struct ContactCard: View {
    @Binding var isPresented: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            HStack {
                Text("CONTATTI")
                    .font(.custom("Michroma-Regular", size: 27))
                Spacer()
                Button {
                    withAnimation(.easeInOut(duration: 0.18)) { isPresented = false }
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 24, weight: .regular))
                }
            }

            ContactLink(label: "✉️ info@g-\nrgabriellaromeo.it", url: "mailto:info@g-rgabriellaromeo.it")
            ContactLink(label: "💬 WhatsApp", url: "https://wa.me/393429506938")
            ContactLink(label: "📸 Instagram", url: "https://www.instagram.com/grgabriellaromeo/")
            ContactLink(label: "📘 Facebook", url: "https://www.facebook.com/GRGabriellaRomeoItalianStyle")
        }
        .font(.custom("Michroma-Regular", size: 24))
        .foregroundStyle(Color.grGold)
        .padding(.horizontal, 24)
        .padding(.vertical, 23)
        .frame(width: 222, alignment: .leading)
        .background(Color(red: 0.07, green: 0.09, blue: 0.14))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color(red: 0.26, green: 0.31, blue: 0.43), lineWidth: 1))
    }
}

private struct ContactLink: View {
    let label: String
    let url: String

    var body: some View {
        Button {
            if let url = URL(string: url) {
                UIApplication.shared.open(url)
            }
        } label: {
            Text(label)
                .multilineTextAlignment(.leading)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .buttonStyle(.plain)
    }
}

private extension Image {
    func webHeaderIcon(size: CGFloat) -> some View {
        self
            .font(.system(size: size, weight: .regular))
            .foregroundStyle(Color.grGold)
    }
}

private extension Text {
    func drawerItem() -> some View {
        self
            .font(.custom("Michroma-Regular", size: 14.5))
            .foregroundStyle(.black)
            .lineLimit(1)
            .minimumScaleFactor(0.68)
            .allowsTightening(true)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

extension View {
    func webButton() -> some View {
        self
            .font(.custom("Michroma-Regular", size: 22))
            .foregroundStyle(Color.grGold)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .overlay(Rectangle().stroke(Color.grGold.opacity(0.72), lineWidth: 1))
    }

    func webSectionTitle() -> some View {
        self
            .font(.custom("Michroma-Regular", size: 20))
            .foregroundStyle(Color.grGold)
            .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct WebBackButton: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        Button {
            dismiss()
        } label: {
            Image(systemName: "chevron.left")
                .font(.system(size: 28, weight: .regular))
                .foregroundStyle(Color.grGold)
                .frame(width: 48, height: 48)
                .background(Color.black.opacity(0.28))
                .clipShape(Circle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Indietro")
    }
}
