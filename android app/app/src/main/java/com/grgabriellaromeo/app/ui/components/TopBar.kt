package com.grgabriellaromeo.app.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grgabriellaromeo.app.ui.theme.Gold

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GRTopBar(
    cartCount: Int,
    onMenuClick: () -> Unit,
    onCartClick: () -> Unit,
    onSearchClick: () -> Unit,
    onContactClick: () -> Unit,
    onUserClick: () -> Unit,
    onLogoClick: () -> Unit
) {
    TopAppBar(
        title = {},
        navigationIcon = {
            IconButton(onClick = onMenuClick) {
                Icon(Icons.Default.Menu, contentDescription = "Menu", tint = Gold)
            }
        },
        actions = {
            IconButton(onClick = onSearchClick) {
                Icon(Icons.Default.Search, contentDescription = "Search", tint = Gold)
            }
            IconButton(onClick = onContactClick) {
                Icon(Icons.Default.Phone, contentDescription = "Contact", tint = Gold)
            }
            Box {
                IconButton(onClick = onCartClick) {
                    Icon(Icons.Default.ShoppingCart, contentDescription = "Cart", tint = Gold)
                }
                if (cartCount > 0) {
                    Badge(
                        modifier = Modifier.align(Alignment.TopEnd).padding(4.dp),
                        containerColor = Gold
                    ) {
                        Text(
                            text = cartCount.toString(),
                            color = Color.Black,
                            fontSize = 10.sp
                        )
                    }
                }
            }
            IconButton(onClick = onUserClick) {
                Icon(Icons.Default.Person, contentDescription = "User", tint = Gold)
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = Color.Black,
            titleContentColor = Gold
        )
    )
}
