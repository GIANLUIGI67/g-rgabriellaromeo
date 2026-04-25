package com.grgabriellaromeo.app.navigation

import androidx.compose.runtime.*
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.Scaffold
import androidx.compose.material3.rememberDrawerState
import androidx.compose.foundation.layout.padding
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.grgabriellaromeo.app.ui.components.GRDrawerContent
import com.grgabriellaromeo.app.ui.components.GRTopBar
import com.grgabriellaromeo.app.ui.components.UserAuthBottomSheet
import com.grgabriellaromeo.app.ui.screens.*
import com.grgabriellaromeo.app.viewmodel.*
import kotlinx.coroutines.launch

@Composable
fun GRNavGraph() {
    val navController = rememberNavController()
    val drawerState = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()

    val langVm: LangViewModel = viewModel()
    val cartVm: CartViewModel = viewModel()
    val authVm: AuthViewModel = viewModel()
    val checkoutVm: CheckoutViewModel = viewModel()

    val lang by langVm.lang.collectAsState()
    val cartCount by remember { derivedStateOf { cartVm.count } }

    var showAuth by remember { mutableStateOf(false) }

    val navBackStack by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStack?.destination?.route
    val isHome = currentRoute == Screen.Home.route

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            GRDrawerContent(
                lang = lang,
                onLangChange = { langVm.setLang(it) },
                onNavigate = { route ->
                    navController.navigate(route) {
                        popUpTo(Screen.Home.route) { saveState = true }
                        launchSingleTop = true
                        restoreState = true
                    }
                },
                onClose = { scope.launch { drawerState.close() } }
            )
        }
    ) {
        Scaffold(
            topBar = {
                if (!isHome) {
                    GRTopBar(
                        cartCount = cartCount,
                        onMenuClick = { scope.launch { drawerState.open() } },
                        onCartClick = {
                            navController.navigate(Screen.Cart.route) {
                                launchSingleTop = true
                            }
                        },
                        onSearchClick = {
                            navController.navigate(Screen.Search.route) {
                                launchSingleTop = true
                            }
                        },
                        onUserClick = { showAuth = true },
                        onLogoClick = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.Home.route) { inclusive = true }
                            }
                        }
                    )
                }
            }
        ) { padding ->
            NavHost(
                navController = navController,
                startDestination = Screen.Home.route,
                modifier = if (isHome) Modifier else Modifier.padding(padding)
            ) {
                composable(Screen.Home.route) {
                    HomeScreen(
                        lang = lang,
                        cartCount = cartCount,
                        onMenuClick = { scope.launch { drawerState.open() } },
                        onSearchClick = {
                            navController.navigate(Screen.Search.route) { launchSingleTop = true }
                        },
                        onUserClick = { showAuth = true },
                        onCartClick = {
                            navController.navigate(Screen.Cart.route) { launchSingleTop = true }
                        },
                        onLangChange = { langVm.setLang(it) },
                        onNavigate = { route -> navController.navigate(route) }
                    )
                }
                composable(Screen.Gioielli.route) {
                    ProductListScreen(
                        categoria = "gioielli",
                        lang = lang,
                        onAddToCart = { cartVm.addItem(it) }
                    )
                }
                composable(Screen.Abbigliamento.route) {
                    ProductListScreen(
                        categoria = "abbigliamento",
                        lang = lang,
                        onAddToCart = { cartVm.addItem(it) }
                    )
                }
                composable(Screen.Offerte.route) {
                    OfferteScreen(lang = lang, onAddToCart = { cartVm.addItem(it) })
                }
                composable(Screen.Eventi.route) {
                    EventiScreen(lang = lang)
                }
                composable(Screen.Servizi.route) {
                    ServiziScreen(lang = lang)
                }
                composable(Screen.Brand.route) {
                    BrandScreen(lang = lang)
                }
                composable(Screen.Search.route) {
                    SearchScreen(lang = lang, onAddToCart = { cartVm.addItem(it) })
                }
                composable(Screen.Cart.route) {
                    CartScreen(
                        cartVm = cartVm,
                        lang = lang,
                        onCheckout = { navController.navigate(Screen.Checkout.route) }
                    )
                }
                composable(Screen.Checkout.route) {
                    CheckoutScreen(
                        lang = lang,
                        authVm = authVm,
                        cartVm = cartVm,
                        checkoutVm = checkoutVm,
                        onConfirmed = { navController.navigate(Screen.OrdineConfermato.route) },
                        onLoginRequired = { showAuth = true }
                    )
                }
                composable(Screen.Pagamento.route) {
                    PagamentoScreen(
                        lang = lang,
                        authVm = authVm,
                        cartVm = cartVm,
                        checkoutVm = checkoutVm,
                        onConfirmed = { navController.navigate(Screen.OrdineConfermato.route) }
                    )
                }
                composable(Screen.OrdineConfermato.route) {
                    OrdineConfermatoScreen(
                        lang = lang,
                        onContinue = {
                            navController.navigate(Screen.Home.route) {
                                popUpTo(Screen.Home.route) { inclusive = true }
                            }
                        }
                    )
                }
            }
        }
    }

    if (showAuth) {
        UserAuthBottomSheet(
            authVm = authVm,
            lang = lang,
            onDismiss = { showAuth = false }
        )
    }
}
