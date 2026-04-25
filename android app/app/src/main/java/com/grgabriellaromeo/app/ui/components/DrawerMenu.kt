package com.grgabriellaromeo.app.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grgabriellaromeo.app.navigation.Screen
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma
import com.grgabriellaromeo.app.util.Translations

private val menuItems = listOf(
    "home" to Screen.Home.route,
    "gioielli" to Screen.Gioielli.route,
    "abbigliamento" to Screen.Abbigliamento.route,
    "offerte" to Screen.Offerte.route,
    "eventi" to Screen.Eventi.route,
    "servizi" to Screen.Servizi.route,
    "brand" to Screen.Brand.route,
    "cerca" to Screen.Search.route
)

@Composable
fun GRDrawerContent(
    lang: String,
    onLangChange: (String) -> Unit = {},
    onNavigate: (String) -> Unit,
    onClose: () -> Unit
) {
    ModalDrawerSheet(
        drawerContainerColor = Color.Black,
        drawerContentColor = Color.White
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(vertical = 24.dp)
        ) {
            Text(
                text = "G-R Gabriella Romeo",
                fontFamily = Michroma,
                fontWeight = FontWeight.Normal,
                fontSize = 20.sp,
                color = Gold,
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 16.dp)
            )

            LanguageSwitcher(currentLang = lang, onSelect = onLangChange)

            HorizontalDivider(color = Color(0xFF333333), modifier = Modifier.padding(vertical = 8.dp))

            menuItems.forEach { (key, route) ->
                Text(
                    text = Translations.t(key, lang).uppercase(),
                    color = Color.White,
                    fontSize = 14.sp,
                    letterSpacing = 2.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            onNavigate(route)
                            onClose()
                        }
                        .padding(horizontal = 24.dp, vertical = 16.dp)
                )
                HorizontalDivider(color = Color(0xFF1A1A1A))
            }

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "+39 0522 123456",
                color = Color(0xFF888888),
                fontSize = 13.sp,
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 4.dp)
            )
            Text(
                text = "info@g-rgabriellaromeo.it",
                color = Color(0xFF888888),
                fontSize = 13.sp,
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 4.dp)
            )
        }
    }
}
