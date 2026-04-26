package com.grgabriellaromeo.app.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma

private data class ContactLink(
    val label: String,
    val uri: String
)

private val contactLinks = listOf(
    ContactLink("Email", "mailto:info@g-rgabriellaromeo.it"),
    ContactLink("WhatsApp", "https://wa.me/393429506938"),
    ContactLink("Instagram", "https://www.instagram.com/grgabriellaromeo/"),
    ContactLink("Facebook", "https://www.facebook.com/GRGabriellaRomeoItalianStyle")
)

@Composable
fun ContactDialog(onDismiss: () -> Unit) {
    val uriHandler = LocalUriHandler.current

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF111111),
        titleContentColor = Gold,
        textContentColor = Gold,
        title = {
            Text(
                text = "CONTATTI",
                fontFamily = Michroma,
                fontWeight = FontWeight.Normal,
                fontSize = 18.sp,
                letterSpacing = 2.sp
            )
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                contactLinks.forEach { link ->
                    TextButton(
                        onClick = {
                            uriHandler.openUri(link.uri)
                            onDismiss()
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = link.label,
                            color = Gold,
                            fontFamily = Michroma,
                            fontSize = 13.sp,
                            letterSpacing = 1.sp,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text(
                    text = "CHIUDI",
                    color = Gold,
                    fontFamily = Michroma,
                    fontSize = 12.sp,
                    letterSpacing = 1.sp
                )
            }
        }
    )
}
