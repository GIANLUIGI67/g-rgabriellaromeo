package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
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
            text = "OFFERTE",
            color = Gold,
            fontFamily = Michroma,
            fontSize = 28.sp,
            letterSpacing = 1.4.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 30.dp)
                .padding(top = 88.dp, bottom = 22.dp)
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
                    LazyColumn(
                        contentPadding = PaddingValues(horizontal = 30.dp, vertical = 6.dp),
                        verticalArrangement = Arrangement.spacedBy(26.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(products) { product ->
                            Box(
                                modifier = Modifier.fillMaxWidth(),
                                contentAlignment = Alignment.Center
                            ) {
                                ProductCard(product = product, lang = lang, onClick = { selectedProduct = product })
                            }
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
