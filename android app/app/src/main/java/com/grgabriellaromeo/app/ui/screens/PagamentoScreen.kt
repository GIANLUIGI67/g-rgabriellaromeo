package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma
import com.grgabriellaromeo.app.util.formatEuro
import com.grgabriellaromeo.app.util.formatNegativeEuro
import com.grgabriellaromeo.app.util.Translations
import com.grgabriellaromeo.app.viewmodel.CartViewModel
import com.grgabriellaromeo.app.viewmodel.CheckoutViewModel
import com.grgabriellaromeo.app.viewmodel.CheckoutState
import com.grgabriellaromeo.app.viewmodel.AuthViewModel

private data class MetodoPag(val key: String, val labelKey: String, val icon: String)

private val metodi = listOf(
    MetodoPag("carta", "carta_credito", "💳"),
    MetodoPag("paypal", "paypal", "🅿"),
    MetodoPag("bonifico", "bonifico", "🏦"),
    MetodoPag("contrassegno", "contrassegno", "💵")
)

@Composable
fun PagamentoScreen(
    lang: String,
    authVm: AuthViewModel,
    cartVm: CartViewModel,
    checkoutVm: CheckoutViewModel,
    onConfirmed: () -> Unit
) {
    val items by cartVm.items.collectAsState()
    val cliente by authVm.cliente.collectAsState()
    val checkoutState by checkoutVm.state.collectAsState()
    val metodoPagamento by checkoutVm.metodoPagamento.collectAsState()
    val scontoApplicato by checkoutVm.scontoApplicato.collectAsState()
    val quote by checkoutVm.quote.collectAsState()
    val productionPolicyAccepted by checkoutVm.productionPolicyAccepted.collectAsState()

    val primoSconto = cliente?.primoSconto ?: false
    val totale = checkoutVm.calcolaTotale(items, primoSconto)
    val productionRequired = quote?.productionPolicyRequired == true

    LaunchedEffect(checkoutState) {
        if (checkoutState is CheckoutState.Success) {
            cartVm.clear()
            onConfirmed()
        }
    }
    LaunchedEffect(items) {
        checkoutVm.refreshQuote(items)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = Translations.t("pagamento", lang).uppercase(),
            color = Gold,
            fontFamily = Michroma,
            fontSize = 20.sp,
            letterSpacing = 2.sp
        )

        Text(
            text = Translations.t("scegli_pagamento", lang),
            color = Color(0xFF888888),
            fontSize = 13.sp
        )

        metodi.forEach { metodo ->
            val selected = metodoPagamento == metodo.key
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, if (selected) Gold else Color(0xFF333333))
                    .background(if (selected) Gold.copy(alpha = 0.05f) else Color.Transparent)
                    .clickable { checkoutVm.metodoPagamento.value = metodo.key }
                    .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                RadioButton(
                    selected = selected,
                    onClick = { checkoutVm.metodoPagamento.value = metodo.key },
                    colors = RadioButtonDefaults.colors(selectedColor = Gold, unselectedColor = Color(0xFF555555))
                )
                Text(text = metodo.icon, fontSize = 20.sp)
                Text(
                    text = Translations.t(metodo.labelKey, lang),
                    color = if (selected) Gold else Color.White,
                    fontSize = 14.sp
                )
            }
        }

        if (metodoPagamento == "carta") {
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF111111))) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Pagamento sicuro con Stripe", color = Color(0xFF888888), fontSize = 13.sp)
                    Spacer(Modifier.height(8.dp))
                    Text(text = "Inserisci i dati della carta nella prossima schermata dopo la conferma.", color = Color(0xFFCCCCCC), fontSize = 13.sp, lineHeight = 20.sp)
                }
            }
        }

        if (metodoPagamento == "bonifico") {
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF111111))) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "IBAN", color = Gold, fontSize = 12.sp, letterSpacing = 1.sp)
                    Spacer(Modifier.height(4.dp))
                    Text(text = "IT60 X054 2811 1010 0000 0123 456", color = Color.White, fontSize = 14.sp)
                    Spacer(Modifier.height(4.dp))
                    Text(text = "Intestato a: G-R Gabriella Romeo Srl", color = Color(0xFFCCCCCC), fontSize = 13.sp)
                    Text(text = "BIC: BPMOIT22XXX", color = Color(0xFFCCCCCC), fontSize = 13.sp)
                }
            }
        }

        HorizontalDivider(color = Color(0xFF222222))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(Translations.t("spedizione", lang), color = Color(0xFF888888))
            Text(Translations.t("gratuita", lang), color = Color(0xFF888888))
        }
        if (scontoApplicato) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(Translations.t("sconto", lang) + " 10%", color = Gold)
                Text(formatNegativeEuro(items.sumOf { it.subtotal } * 0.10), color = Gold, fontFamily = FontFamily.SansSerif)
            }
        }
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(Translations.t("totale", lang), color = Color.White, fontSize = 16.sp)
            Text(formatEuro(totale), color = Gold, fontSize = 16.sp, fontFamily = FontFamily.SansSerif)
        }

        if (checkoutState is CheckoutState.Error) {
            Text((checkoutState as CheckoutState.Error).message, color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
        }

        if (productionRequired) {
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF111111))) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(text = "Policy di produzione", color = Gold, fontFamily = Michroma, fontSize = 14.sp)
                    Text(
                        text = "Uno o più prodotti non sono disponibili in pronta consegna. Confermando la policy accetti che l'ordine venga prodotto e che i tempi di evasione dipendano dalla produzione.",
                        color = Gold,
                        fontSize = 12.sp,
                        lineHeight = 18.sp
                    )
                    quote?.productionItems?.takeIf { it.isNotEmpty() }?.let { items ->
                        Text(text = items.joinToString { it.nome }, color = Gold, fontSize = 12.sp)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(
                            checked = productionPolicyAccepted,
                            onCheckedChange = { checkoutVm.productionPolicyAccepted.value = it },
                            colors = CheckboxDefaults.colors(checkedColor = Gold)
                        )
                        Text(text = "Accetto la policy di produzione", color = Gold, fontSize = 12.sp)
                    }
                }
            }
        }

        Button(
            onClick = {
                authVm.currentUserId() ?: return@Button
                checkoutVm.submitOrder(items)
            },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Color.Black),
            enabled = checkoutState !is CheckoutState.Loading && (!productionRequired || productionPolicyAccepted)
        ) {
            if (checkoutState is CheckoutState.Loading) {
                CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.Black)
            } else {
                Text(Translations.t("paga_ora", lang), letterSpacing = 1.sp)
            }
        }

        Spacer(Modifier.height(32.dp))
    }
}
