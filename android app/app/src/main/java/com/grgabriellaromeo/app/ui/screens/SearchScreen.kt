package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.grgabriellaromeo.app.data.models.CartItem
import com.grgabriellaromeo.app.data.models.Product
import com.grgabriellaromeo.app.ui.components.ProductCard
import com.grgabriellaromeo.app.ui.components.ProductDetailSheet
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.util.Translations
import com.grgabriellaromeo.app.viewmodel.ProductListViewModel
import com.grgabriellaromeo.app.viewmodel.ProductsState

@Composable
fun SearchScreen(
    lang: String,
    onAddToCart: (CartItem) -> Unit,
    vm: ProductListViewModel = viewModel()
) {
    val state by vm.state.collectAsState()
    var query by remember { mutableStateOf("") }
    var selectedProduct by remember { mutableStateOf<Product?>(null) }
    val keyboard = LocalSoftwareKeyboardController.current

    Column(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            placeholder = { Text(Translations.t("cerca_placeholder", lang), color = Color(0xFF888888)) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Gold) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
            keyboardActions = KeyboardActions(onSearch = {
                if (query.isNotBlank()) vm.search(query)
                keyboard?.hide()
            }),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Gold,
                unfocusedBorderColor = Color(0xFF333333),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                cursorColor = Gold
            ),
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
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
                if (products.isEmpty() && query.isNotBlank()) {
                    Box(Modifier.fillMaxSize(), Alignment.Center) {
                        Text(Translations.t("nessun_risultato", lang), color = Color(0xFF888888))
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
