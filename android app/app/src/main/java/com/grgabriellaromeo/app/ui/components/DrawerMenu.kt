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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grgabriellaromeo.app.navigation.Screen
import com.grgabriellaromeo.app.ui.theme.Michroma
import com.grgabriellaromeo.app.util.Translations

private val menuItems = listOf(
    "home" to Screen.Home.route,
    "gioielli" to Screen.Gioielli.route,
    "abbigliamento" to Screen.Abbigliamento.route,
    "accessori" to Screen.Accessori.route,
    "offerte" to Screen.Offerte.route,
    "servizi" to Screen.Servizi.route,
    "eventi" to Screen.Eventi.route,
    "brand" to Screen.Brand.route
)

@Composable
fun GRDrawerContent(
    lang: String,
    onLangChange: (String) -> Unit = {},
    onNavigate: (String) -> Unit,
    onClose: () -> Unit
) {
    ModalDrawerSheet(
        modifier = Modifier
            .width(248.dp)
            .wrapContentHeight(),
        drawerContainerColor = Color.White,
        drawerContentColor = Color.Black
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 14.dp)
                .padding(top = 12.dp, bottom = 13.dp)
        ) {
            Text(
                text = Translations.t("navigazione", lang),
                fontFamily = Michroma,
                fontSize = 13.sp,
                color = Color.Black,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            menuItems.forEach { (key, route) ->
                Text(
                    text = Translations.t(key, lang),
                    color = Color.Black,
                    fontFamily = Michroma,
                    fontSize = 14.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            onNavigate(route)
                            onClose()
                        }
                        .padding(vertical = 6.dp)
                )
            }
        }
    }
}
