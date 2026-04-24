import SwiftUI

struct ProductListView: View {
    @EnvironmentObject private var store: AppStore
    let category: String?
    let title: String
    var onlyOffers = false

    private var filteredProducts: [Product] {
        store.products.filter { product in
            let categoryMatch = category == nil || product.categoria?.localizedCaseInsensitiveContains(category!) == true
            let offerMatch = !onlyOffers || product.offerta == true
            return categoryMatch && offerMatch
        }
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            ScrollView {
                LazyVStack(spacing: 18) {
                    Text(title)
                        .font(.custom("GRGabriellaUltraCustom", size: 40))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.top, 24)

                    if store.isLoading {
                        ProgressView()
                            .tint(.white)
                            .padding(.top, 30)
                    } else if filteredProducts.isEmpty {
                        Text("Nessun prodotto disponibile")
                            .font(.custom("GRGabriellaFinal", size: 18))
                            .foregroundStyle(.white.opacity(0.72))
                            .padding(.top, 30)
                    } else {
                        ForEach(filteredProducts) { product in
                            NavigationLink {
                                ProductDetailView(product: product)
                            } label: {
                                ProductCard(product: product)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 30)
            }
        }
        .toolbar(.hidden, for: .navigationBar)
    }
}

struct ProductCard: View {
    let product: Product

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            ProductImage(product: product)
                .frame(height: 280)
                .clipShape(RoundedRectangle(cornerRadius: 2))

            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.nome)
                        .font(.custom("GRGabriellaFinal", size: 20))
                        .foregroundStyle(.white)
                    if let sottocategoria = product.sottocategoria, !sottocategoria.isEmpty {
                        Text(sottocategoria)
                            .font(.custom("GRGabriellaFinal", size: 14))
                            .foregroundStyle(.white.opacity(0.62))
                    }
                }
                Spacer()
                Text(product.displayPrice.euro)
                    .font(.custom("GRGabriellaFinal", size: 18))
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
                        .font(.custom("GRGabriellaUltraCustom", size: 38))
                        .foregroundStyle(.white)

                    Text(product.displayPrice.euro)
                        .font(.custom("GRGabriellaFinal", size: 24))
                        .foregroundStyle(.white)

                    if let description = product.descrizione, !description.isEmpty {
                        Text(description)
                            .font(.custom("GRGabriellaFinal", size: 17))
                            .foregroundStyle(.white.opacity(0.78))
                    }

                    Button {
                        store.addToCart(product)
                    } label: {
                        Text(product.isAvailable ? store.l10n.text(.addToCart) : store.l10n.text(.soldOut))
                            .font(.custom("GRGabriellaFinal", size: 21))
                            .foregroundStyle(.black)
                            .frame(maxWidth: .infinity)
                            .frame(height: 54)
                            .background(Color.white)
                    }
                    .disabled(!product.isAvailable)
                    .opacity(product.isAvailable ? 1 : 0.45)
                }
                .padding(18)
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
                    Image("BrandLogo")
                        .resizable()
                        .scaledToFit()
                        .padding(50)
                        .opacity(0.8)
                }
            @unknown default:
                Color.white.opacity(0.08)
            }
        }
    }
}
