package com.grgabriellaromeo.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Copyright
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grgabriellaromeo.app.R
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma

private val languages = listOf(
    "it" to "🇮🇹", "en" to "🇬🇧", "fr" to "🇫🇷", "de" to "🇩🇪",
    "es" to "🇪🇸", "ar" to "🇸🇦", "zh" to "🇨🇳", "ja" to "🇯🇵"
)

@Composable
fun HomeScreen(
    lang: String,
    cartCount: Int,
    onMenuClick: () -> Unit,
    onSearchClick: () -> Unit,
    onContactClick: () -> Unit,
    onUserClick: () -> Unit,
    onCartClick: () -> Unit,
    onLangChange: (String) -> Unit,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current

    Box(modifier = Modifier.fillMaxSize()) {
        // Hero background
        Image(
            painter = painterResource(id = R.drawable.hero),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        // Dark overlay
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.35f))
        )

        // Top bar overlay
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp)
                .align(Alignment.TopStart),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onSearchClick) {
                    Icon(Icons.Default.Search, contentDescription = "Cerca", tint = Gold)
                }
                IconButton(onClick = onMenuClick) {
                    Icon(Icons.Default.Menu, contentDescription = "Menu", tint = Gold)
                }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(4.dp), verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onContactClick) {
                    Icon(Icons.Default.Phone, contentDescription = "Contatti", tint = Gold)
                }
                IconButton(onClick = onUserClick) {
                    Icon(Icons.Default.Person, contentDescription = "Account", tint = Gold)
                }
                Box {
                    IconButton(onClick = onCartClick) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = "Carrello", tint = Gold)
                    }
                    if (cartCount > 0) {
                        Badge(
                            modifier = Modifier.align(Alignment.TopEnd).padding(4.dp),
                            containerColor = Gold
                        ) {
                            Text(cartCount.toString(), color = Color.Black, fontSize = 10.sp)
                        }
                    }
                }
            }
        }

        // Centered logo
        Column(
            modifier = Modifier
                .align(Alignment.Center)
                .offset(y = (-40).dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "G-R",
                color = Gold,
                fontFamily = Michroma,
                fontWeight = FontWeight.Bold,
                fontSize = 64.sp,
                letterSpacing = 8.sp,
                textAlign = TextAlign.Center
            )
            Text(
                text = "GABRIELLA ROMEO",
                color = Gold,
                fontFamily = Michroma,
                fontWeight = FontWeight.Normal,
                fontSize = 18.sp,
                letterSpacing = 5.sp,
                textAlign = TextAlign.Center
            )
        }

        // Bottom: language flags + Instagram QR
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Instagram QR code
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.clickable {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.instagram.com/grgabriellaromeo"))
                    context.startActivity(intent)
                }
            ) {
                Image(
                    painter = painterResource(id = R.drawable.qr_instagram),
                    contentDescription = "Instagram QR",
                    modifier = Modifier.size(72.dp)
                )
                Text(
                    text = "◎ Instagram",
                    color = Gold,
                    fontFamily = Michroma,
                    fontSize = 13.sp,
                    letterSpacing = 1.sp
                )
                Row(
                    horizontalArrangement = Arrangement.spacedBy(5.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.Copyright,
                        contentDescription = "Copyright",
                        tint = Gold,
                        modifier = Modifier.size(12.dp)
                    )
                    Text(
                        text = "grgabriellaromeo",
                        color = Gold,
                        fontFamily = Michroma,
                        fontSize = 10.sp,
                        letterSpacing = 1.sp
                    )
                }
            }

            // Language flags
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                languages.forEach { (code, flag) ->
                    Text(
                        text = flag,
                        fontSize = if (code == lang) 28.sp else 22.sp,
                        modifier = Modifier
                            .clickable { onLangChange(code) }
                            .padding(4.dp)
                    )
                }
            }
        }
    }
}
