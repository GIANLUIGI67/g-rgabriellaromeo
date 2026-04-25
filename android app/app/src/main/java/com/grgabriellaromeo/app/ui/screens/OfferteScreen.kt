package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grgabriellaromeo.app.data.models.CartItem
import com.grgabriellaromeo.app.data.models.Product
import com.grgabriellaromeo.app.ui.components.ProductCard
import com.grgabriellaromeo.app.ui.components.ProductDetailSheet
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma
import com.grgabriellaromeo.app.util.Translations
import com.grgabriellaromeo.app.viewmodel.ProductListViewModel
import com.grgabriellaromeo.app.viewmodel.ProductsState

@Composable
fun OfferteScreen(
    lang: String,
    onAddToCart: (CartItem) -> Unit,
    vm: ProductListViewModel = viewModel()
) {
    val state by vm.state.collectAsState()
    var selectedProduct by remember { mutableStateOf<Product?>(null) }

    LaunchedEffect(Unit) { vm.loadOfferte() }

    Column(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        Text(
            text = Translations.t("offerte", lang).uppercase(),
            color = Gold,
            fontFamily = Michroma,
            fontSize = 20.sp,
            letterSpacing = 2.sp,
            modifier = Modifier.padding(16.dp)
        )

        when (state) {
            is ProductsState.Loading -> Box(Modifier.fillMaxSize(), Alignment.Center) {
                CircularProgressIndicator(color = Gold)
            }
            is ProductsState.Error -> Box(Modifier.fillMaxSize(), Alignment.Center) {
                Text(Translations.t("errore", lang), color = Color(0xFF888888))
            }
            is ProductsState.Success -> {
                val products = (state as ProductsState.Success).products
                if (products.isEmpty()) {
                    Box(Modifier.fillMaxSize(), Alignment.Center) {
                        Text(Translations.t("nessun_prodotto", lang), color = Color(0xFF888888))
                    }
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(products) { product ->
                            ProductCard(product = product, lang = lang, onClick = { selectedProduct = product })
                        }
                    }
                }
            }
        }
    }

    selectedProduct?.let { p ->
        ProductDetailSheet(product = p, lang = lang, onDismiss = { selectedProduct = null }, onAddToCart = { onAddToCart(it); selectedProduct = null })
    }
}
