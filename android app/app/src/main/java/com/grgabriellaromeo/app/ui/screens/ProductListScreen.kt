package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
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
    var subcategoryMenuOpen by remember { mutableStateOf(false) }

    LaunchedEffect(categoria) { vm.load(categoria) }

    val subcategories = remember(state) {
        (state as? ProductsState.Success)?.products
            ?.mapNotNull { it.sottocategoria }
            ?.filter { it.isNotBlank() }
            ?.distinct()
            ?.sorted()
            ?: emptyList()
    }

    val filtered = remember(state, selectedSub) {
        val all = (state as? ProductsState.Success)?.products ?: emptyList()
        if (selectedSub == null) all else all.filter { it.sottocategoria == selectedSub }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        Text(
            text = titleForCategory(categoria),
            color = Gold,
            fontFamily = Michroma,
            fontSize = if (categoria == "abbigliamento") 23.sp else 28.sp,
            letterSpacing = 1.4.sp,
            lineHeight = if (categoria == "abbigliamento") 34.sp else 38.sp,
            textAlign = TextAlign.Center,
            maxLines = 2,
            overflow = TextOverflow.Clip,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 18.dp)
                .padding(top = 88.dp, bottom = 22.dp)
        )

        if (subcategories.isNotEmpty()) {
            SubcategoryMenu(
                label = selectedSub ?: "Tutte le sottocategorie",
                options = subcategories,
                open = subcategoryMenuOpen,
                onToggle = { subcategoryMenuOpen = !subcategoryMenuOpen },
                onSelect = {
                    selectedSub = it
                    subcategoryMenuOpen = false
                },
                onClear = {
                    selectedSub = null
                    subcategoryMenuOpen = false
                }
            )
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
                    LazyColumn(
                        contentPadding = PaddingValues(horizontal = 30.dp, vertical = 6.dp),
                        verticalArrangement = Arrangement.spacedBy(26.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(filtered) { product ->
                            Box(
                                modifier = Modifier.fillMaxWidth(),
                                contentAlignment = Alignment.Center
                            ) {
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
private fun SubcategoryMenu(
    label: String,
    options: List<String>,
    open: Boolean,
    onToggle: () -> Unit,
    onSelect: (String) -> Unit,
    onClear: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 42.dp)
            .padding(bottom = 22.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(46.dp)
                .background(Color.White)
                .clickable { onToggle() }
                .padding(horizontal = 14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = label,
                color = Color.Black,
                fontFamily = Michroma,
                fontSize = 16.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f)
            )
            Icon(
                Icons.Default.KeyboardArrowDown,
                contentDescription = null,
                tint = Gold,
                modifier = Modifier.size(24.dp)
            )
        }

        if (open) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 6.dp)
                    .background(Color.White)
            ) {
                DropdownOption(
                    label = "Tutte le sottocategorie",
                    selected = label == "Tutte le sottocategorie",
                    onClick = onClear
                )
                options.forEach { option ->
                    DropdownOption(
                        label = option,
                        selected = label == option,
                        onClick = { onSelect(option) }
                    )
                }
            }
        }
    }
}

@Composable
private fun DropdownOption(label: String, selected: Boolean, onClick: () -> Unit) {
    Text(
        text = label,
        color = Color.Black,
        fontFamily = Michroma,
        fontSize = 14.sp,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis,
        modifier = Modifier
            .fillMaxWidth()
            .background(if (selected) Color(0xFFF7F2E4) else Color.White)
            .clickable { onClick() }
            .padding(horizontal = 14.dp, vertical = 10.dp)
    )
}

private fun titleForCategory(categoria: String): String = when (categoria) {
    "gioielli" -> "GALLERIA\nGIOIELLI"
    "abbigliamento" -> "GALLERIA\nABBIGLIAMENTO"
    "accessori" -> "GALLERIA\nACCESSORI"
    "offerte" -> "OFFERTE"
    else -> categoria.uppercase()
}
