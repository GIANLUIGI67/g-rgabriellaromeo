package com.grgabriellaromeo.app.navigation

sealed class Screen(val route: String) {
    object Home : Screen("home")
    object Gioielli : Screen("gioielli")
    object Abbigliamento : Screen("abbigliamento")
    object Offerte : Screen("offerte")
    object Eventi : Screen("eventi")
    object Servizi : Screen("servizi")
    object Brand : Screen("brand")
    object Search : Screen("search")
    object Cart : Screen("cart")
    object Checkout : Screen("checkout")
    object Pagamento : Screen("pagamento")
    object OrdineConfermato : Screen("ordine_confermato")
}
