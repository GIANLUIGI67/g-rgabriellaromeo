package com.grgabriellaromeo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.ui.theme.Michroma
import com.grgabriellaromeo.app.util.formatEuro
import com.grgabriellaromeo.app.util.Translations
import com.grgabriellaromeo.app.viewmodel.AuthViewModel
import com.grgabriellaromeo.app.viewmodel.CartViewModel
import com.grgabriellaromeo.app.viewmodel.CheckoutViewModel
import com.grgabriellaromeo.app.viewmodel.CheckoutState

@Composable
fun CheckoutScreen(
    lang: String,
    authVm: AuthViewModel,
    cartVm: CartViewModel,
    checkoutVm: CheckoutViewModel,
    onConfirmed: () -> Unit,
    onLoginRequired: () -> Unit
) {
    val authState by authVm.state.collectAsState()
    val cliente by authVm.cliente.collectAsState()
    val checkoutState by checkoutVm.state.collectAsState()
    val items by cartVm.items.collectAsState()

    val nome by checkoutVm.nome.collectAsState()
    val cognome by checkoutVm.cognome.collectAsState()
    val email by checkoutVm.email.collectAsState()
    val telefono by checkoutVm.telefono.collectAsState()
    val indirizzo by checkoutVm.indirizzo.collectAsState()
    val citta by checkoutVm.citta.collectAsState()
    val cap by checkoutVm.cap.collectAsState()
    val provincia by checkoutVm.provincia.collectAsState()
    val nazione by checkoutVm.nazione.collectAsState()
    val note by checkoutVm.note.collectAsState()
    val codiceSconto by checkoutVm.codiceSconto.collectAsState()
    val scontoApplicato by checkoutVm.scontoApplicato.collectAsState()
    val quote by checkoutVm.quote.collectAsState()
    val productionPolicyAccepted by checkoutVm.productionPolicyAccepted.collectAsState()

    LaunchedEffect(cliente) {
        cliente?.let { checkoutVm.prefillFromCliente(it) }
    }

    LaunchedEffect(checkoutState) {
        if (checkoutState is CheckoutState.Success) {
            cartVm.clear()
            onConfirmed()
        }
    }
    LaunchedEffect(items) {
        checkoutVm.refreshQuote(items)
    }

    val primoSconto = cliente?.primoSconto ?: false
    val totale = checkoutVm.calcolaTotale(items, primoSconto)
    val productionRequired = quote?.productionPolicyRequired == true

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = Translations.t("checkout", lang).uppercase(),
            color = Gold,
            fontFamily = Michroma,
            fontSize = 20.sp,
            letterSpacing = 2.sp
        )

        if (!authVm.isLoggedIn()) {
            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF111111))) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = "Accedi per continuare", color = Color.White)
                    Spacer(Modifier.height(8.dp))
                    Button(
                        onClick = onLoginRequired,
                        colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Color.Black),
                        modifier = Modifier.fillMaxWidth()
                    ) { Text(Translations.t("accedi", lang)) }
                }
            }
            return@Column
        }

        SectionTitle(Translations.t("dati_personali", lang))

        GRField(Translations.t("nome", lang), nome) { checkoutVm.nome.value = it }
        GRField(Translations.t("cognome", lang), cognome) { checkoutVm.cognome.value = it }
        GRField(Translations.t("email", lang), email, KeyboardType.Email) { checkoutVm.email.value = it }
        GRField(Translations.t("telefono", lang), telefono, KeyboardType.Phone) { checkoutVm.telefono.value = it }

        SectionTitle(Translations.t("spedisci_a", lang))
        GRField(Translations.t("indirizzo", lang), indirizzo) { checkoutVm.indirizzo.value = it }
        GRField(Translations.t("citta", lang), citta) { checkoutVm.citta.value = it }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Box(modifier = Modifier.weight(1f)) { GRField(Translations.t("cap", lang), cap, KeyboardType.Number) { checkoutVm.cap.value = it } }
            Box(modifier = Modifier.weight(1f)) { GRField(Translations.t("provincia", lang), provincia) { checkoutVm.provincia.value = it } }
        }
        GRField(Translations.t("nazione", lang), nazione) { checkoutVm.nazione.value = it }
        GRField(Translations.t("note_ordine", lang), note) { checkoutVm.note.value = it }

        if (primoSconto) {
            SectionTitle(Translations.t("codice_sconto", lang))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = codiceSconto,
                    onValueChange = { checkoutVm.codiceSconto.value = it },
                    modifier = Modifier.weight(1f),
                    colors = grFieldColors(),
                    singleLine = true,
                    label = { Text("BENVENUTO10", color = Color(0xFF888888)) }
                )
                Button(
                    onClick = { checkoutVm.applicaSconto(codiceSconto, primoSconto) },
                    colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Color.Black)
                ) { Text(Translations.t("applica", lang)) }
            }
            if (scontoApplicato) {
                Text(text = "✓ Sconto 10% applicato", color = Gold, fontSize = 13.sp)
            }
        }

        HorizontalDivider(color = Color(0xFF222222))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(Translations.t("totale", lang), color = Color.White, fontSize = 16.sp)
            Text(formatEuro(totale), color = Gold, fontSize = 16.sp, fontFamily = FontFamily.SansSerif)
        }

        if (checkoutState is CheckoutState.Error) {
            Text(text = (checkoutState as CheckoutState.Error).message, color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
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
                Text(Translations.t("conferma", lang), letterSpacing = 1.sp)
            }
        }

        Spacer(Modifier.height(32.dp))
    }
}

@Composable
private fun SectionTitle(title: String) {
    Text(text = title.uppercase(), color = Gold, fontSize = 12.sp, letterSpacing = 2.sp)
}

@Composable
private fun GRField(label: String, value: String, keyboardType: KeyboardType = KeyboardType.Text, onValueChange: (String) -> Unit) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label, color = Color(0xFF888888)) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        colors = grFieldColors(),
        modifier = Modifier.fillMaxWidth()
    )
}

@Composable
private fun grFieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = Gold,
    unfocusedBorderColor = Color(0xFF333333),
    focusedTextColor = Color.White,
    unfocusedTextColor = Color.White,
    cursorColor = Gold
)
