import SwiftUI

struct ProductListView: View {
    @EnvironmentObject private var store: AppStore
    let category: String?
    let title: String
    var onlyOffers = false
    @State private var selectedSubcategory = "Tutte le sottocategorie"

    private var subcategories: [String] {
        let values = store.products
            .filter { product in
                guard let category else { return true }
                return product.categoria?.localizedCaseInsensitiveContains(category) == true
            }
            .compactMap(\.sottocategoria)
            .filter { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }
        let unique = Array(Set(values)).sorted()

        if category == "gioielli", unique.isEmpty {
            return ["Anelli", "Collane", "Bracciali", "Orecchini"]
        }
        return unique
    }

    private var filteredProducts: [Product] {
        store.products.filter { product in
            let categoryMatch = category == nil || product.categoria?.localizedCaseInsensitiveContains(category!) == true
            let offerMatch = !onlyOffers || product.offerta == true
            let subcategoryMatch = selectedSubcategory == "Tutte le sottocategorie" || product.sottocategoria == selectedSubcategory
            return categoryMatch && offerMatch && subcategoryMatch
        }
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 28) {
                    Text(title)
                        .font(.custom("GRGabriellaFinal", size: 38))
                        .tracking(3)
                        .foregroundStyle(.white)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                        .minimumScaleFactor(0.7)
                        .padding(.top, 92)

                    if category != nil {
                        subcategoryMenu
                    }

                    if store.isLoading {
                        ProgressView()
                            .tint(.white)
                            .padding(.top, 30)
                    } else if filteredProducts.isEmpty {
                        Text("Nessun prodotto disponibile")
                            .font(.custom("GRGabriellaFinal", size: 24))
                            .foregroundStyle(.white.opacity(0.72))
                            .padding(.top, 30)
                    } else {
                        LazyVStack(spacing: 22) {
                            ForEach(filteredProducts) { product in
                                NavigationLink {
                                    ProductDetailView(product: product)
                                } label: {
                                    ProductCard(product: product)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.top, 6)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 42)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
    }

    private var subcategoryMenu: some View {
        Menu {
            Button {
                selectedSubcategory = "Tutte le sottocategorie"
            } label: {
                if selectedSubcategory == "Tutte le sottocategorie" {
                    Label("Tutte le sottocategorie", systemImage: "checkmark")
                } else {
                    Text("Tutte le sottocategorie")
                }
            }

            ForEach(subcategories, id: \.self) { value in
                Button {
                    selectedSubcategory = value
                } label: {
                    if selectedSubcategory == value {
                        Label(value, systemImage: "checkmark")
                    } else {
                        Text(value)
                    }
                }
            }
        } label: {
            HStack {
                Text(selectedSubcategory)
                    .font(.custom("GRGabriellaFinal", size: 24))
                    .foregroundStyle(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                Spacer()
                Image(systemName: "chevron.down")
                    .foregroundStyle(.white)
            }
            .padding(.horizontal, 18)
            .frame(height: 54)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.white, lineWidth: 2)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Color(red: 0.0, green: 0.32, blue: 0.78), lineWidth: 4)
                    .padding(-5)
            )
        }
        .padding(.horizontal, 25)
    }
}

struct ProductCard: View {
    let product: Product

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ProductImage(product: product)
                .frame(height: 280)
                .clipShape(Rectangle())

            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.nome)
                        .font(.custom("GRGabriellaFinal", size: 22))
                        .foregroundStyle(.white)
                    if let sottocategoria = product.sottocategoria, !sottocategoria.isEmpty {
                        Text(sottocategoria)
                            .font(.custom("GRGabriellaFinal", size: 16))
                            .foregroundStyle(.white.opacity(0.62))
                    }
                }
                Spacer()
                Text(product.displayPrice.euro)
                    .font(.custom("GRGabriellaFinal", size: 20))
                    .foregroundStyle(.white)
            }
        }
    }
}

struct ProductDetailView: View {
    @EnvironmentObject private var store: AppStore
    let product: Product

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    ProductImage(product: product)
                        .frame(height: 430)
                        .clipped()

                    Text(product.nome)
                        .font(.custom("GRGabriellaFinal", size: 38))
                        .foregroundStyle(.white)

                    Text(product.displayPrice.euro)
                        .font(.custom("GRGabriellaFinal", size: 24))
                        .foregroundStyle(.white)

                    if let description = product.descrizione, !description.isEmpty {
                        Text(description)
                            .font(.custom("GRGabriellaFinal", size: 19))
                            .foregroundStyle(.white.opacity(0.78))
                    }

                    Button {
                        store.addToCart(product)
                    } label: {
                        Text(product.isAvailable ? store.l10n.text(.addToCart) : store.l10n.text(.soldOut))
                            .font(.custom("GRGabriellaFinal", size: 24))
                            .foregroundStyle(.black)
                            .frame(maxWidth: .infinity)
                            .frame(height: 54)
                            .background(Color.white)
                    }
                    .disabled(!product.isAvailable)
                    .opacity(product.isAvailable ? 1 : 0.45)
                }
                .padding(18)
                .padding(.top, 42)
                .padding(.bottom, 30)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}

struct ProductImage: View {
    let product: Product

    var body: some View {
        AsyncImage(url: AppConfig.imageURL(for: product.immagine)) { phase in
            switch phase {
            case .empty:
                ZStack {
                    Color.white.opacity(0.08)
                    ProgressView().tint(.white)
                }
            case .success(let image):
                image
                    .resizable()
                    .scaledToFill()
            case .failure:
                ZStack {
                    Color.white.opacity(0.08)
                    Text("G-R")
                        .font(.custom("GRGabriellaFinal", size: 46))
                        .foregroundStyle(.white.opacity(0.75))
                }
            @unknown default:
                Color.white.opacity(0.08)
            }
        }
    }
}
