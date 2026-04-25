package com.grgabriellaromeo.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.grgabriellaromeo.app.ui.theme.Gold
import com.grgabriellaromeo.app.util.Translations
import com.grgabriellaromeo.app.viewmodel.AuthState
import com.grgabriellaromeo.app.viewmodel.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserAuthBottomSheet(
    authVm: AuthViewModel,
    lang: String,
    onDismiss: () -> Unit
) {
    val state by authVm.state.collectAsState()
    val cliente by authVm.cliente.collectAsState()
    var isRegister by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var nome by remember { mutableStateOf("") }
    var cognome by remember { mutableStateOf("") }
    var telefono by remember { mutableStateOf("") }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF111111),
        contentColor = Color.White
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            when {
                state is AuthState.Success -> {
                    Text(
                        text = Translations.t("benvenuto", lang) + ", ${cliente?.nome ?: ""}",
                        color = Gold,
                        fontSize = 18.sp
                    )
                    cliente?.let { c ->
                        Text(text = c.email, color = Color(0xFF888888), fontSize = 13.sp)
                        if (c.primoSconto) {
                            Spacer(modifier = Modifier.height(4.dp))
                            Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF1A1A0A))) {
                                Text(
                                    text = "🎁 ${Translations.t("codice_sconto", lang)}: BENVENUTO10 (10%)",
                                    color = Gold,
                                    fontSize = 13.sp,
                                    modifier = Modifier.padding(12.dp)
                                )
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = { authVm.logout(); onDismiss() },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF888888))
                    ) {
                        Text(Translations.t("esci", lang))
                    }
                }

                else -> {
                    Text(
                        text = if (isRegister) Translations.t("registrati", lang) else Translations.t("accedi", lang),
                        color = Gold,
                        fontSize = 20.sp
                    )

                    if (isRegister) {
                        GRTextField(label = Translations.t("nome", lang), value = nome, onValueChange = { nome = it })
                        GRTextField(label = Translations.t("cognome", lang), value = cognome, onValueChange = { cognome = it })
                        GRTextField(label = Translations.t("telefono", lang), value = telefono, onValueChange = { telefono = it }, keyboardType = KeyboardType.Phone)
                    }

                    GRTextField(label = Translations.t("email", lang), value = email, onValueChange = { email = it }, keyboardType = KeyboardType.Email)
                    GRTextField(label = Translations.t("password", lang), value = password, onValueChange = { password = it }, isPassword = true)

                    if (state is AuthState.Error) {
                        Text(text = (state as AuthState.Error).message, color = MaterialTheme.colorScheme.error, fontSize = 13.sp)
                    }

                    Button(
                        onClick = {
                            if (isRegister) authVm.register(email, password, nome, cognome, telefono)
                            else authVm.login(email, password)
                        },
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Gold, contentColor = Color.Black),
                        enabled = state !is AuthState.Loading
                    ) {
                        if (state is AuthState.Loading) {
                            CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.Black)
                        } else {
                            Text(if (isRegister) Translations.t("registrati", lang) else Translations.t("accedi", lang))
                        }
                    }

                    TextButton(
                        onClick = { isRegister = !isRegister },
                        modifier = Modifier.align(Alignment.CenterHorizontally)
                    ) {
                        Text(
                            text = if (isRegister) Translations.t("accedi", lang) else Translations.t("registrati", lang),
                            color = Color(0xFF888888),
                            fontSize = 13.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun GRTextField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    keyboardType: KeyboardType = KeyboardType.Text,
    isPassword: Boolean = false
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label, color = Color(0xFF888888)) },
        singleLine = true,
        visualTransformation = if (isPassword) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Gold,
            unfocusedBorderColor = Color(0xFF444444),
            focusedTextColor = Color.White,
            unfocusedTextColor = Color.White,
            cursorColor = Gold
        ),
        modifier = Modifier.fillMaxWidth()
    )
}
