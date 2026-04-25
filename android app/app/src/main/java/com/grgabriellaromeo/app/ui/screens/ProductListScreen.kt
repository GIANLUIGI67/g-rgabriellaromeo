package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
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
fun ProductListScreen(
    categoria: String,
    lang: String,
    onAddToCart: (CartItem) -> Unit,
    vm: ProductListViewModel = viewModel()
) {
    val state by vm.state.collectAsState()
    var selectedProduct by remember { mutableStateOf<Product?>(null) }
    var selectedSub by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(categoria) { vm.load(categoria) }

    val subcategories = remember(state) {
        (state as? ProductsState.Success)?.products
            ?.mapNotNull { it.sottocategoria }
            ?.distinct()
            ?: emptyList()
    }

    val filtered = remember(state, selectedSub) {
        val all = (state as? ProductsState.Success)?.products ?: emptyList()
        if (selectedSub == null) all else all.filter { it.sottocategoria == selectedSub }
    }

    Column(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        Text(
            text = Translations.t(categoria, lang).uppercase(),
            color = Gold,
            fontFamily = Michroma,
            fontSize = 20.sp,
            letterSpacing = 2.sp,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 16.dp)
        )

        if (subcategories.isNotEmpty()) {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
            ) {
                item {
                    SubcategoryChip(
                        label = Translations.t("tutti", lang),
                        selected = selectedSub == null,
                        onClick = { selectedSub = null }
                    )
                }
                items(subcategories) { sub ->
                    SubcategoryChip(
                        label = sub,
                        selected = selectedSub == sub,
                        onClick = { selectedSub = if (selectedSub == sub) null else sub }
                    )
                }
            }
        }

        when (state) {
            is ProductsState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Gold)
                }
            }
            is ProductsState.Error -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(text = Translations.t("errore", lang), color = Color(0xFF888888))
                }
            }
            is ProductsState.Success -> {
                if (filtered.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(text = Translations.t("nessun_prodotto", lang), color = Color(0xFF888888))
                    }
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(filtered) { product ->
                            ProductCard(
                                product = product,
                                lang = lang,
                                onClick = { selectedProduct = product }
                            )
                        }
                    }
                }
            }
        }
    }

    selectedProduct?.let { product ->
        ProductDetailSheet(
            product = product,
            lang = lang,
            onDismiss = { selectedProduct = null },
            onAddToCart = { item ->
                onAddToCart(item)
                selectedProduct = null
            }
        )
    }
}

@Composable
private fun SubcategoryChip(label: String, selected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clickable { onClick() }
            .background(if (selected) Gold else Color(0xFF1A1A1A))
            .padding(horizontal = 14.dp, vertical = 7.dp)
    ) {
        Text(
            text = label,
            color = if (selected) Color.Black else Color.White,
            fontSize = 12.sp,
            letterSpacing = 1.sp
        )
    }
}
