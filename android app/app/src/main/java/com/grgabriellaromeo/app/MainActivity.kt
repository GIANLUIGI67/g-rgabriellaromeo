package com.grgabriellaromeo.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.grgabriellaromeo.app.navigation.GRNavGraph
import com.grgabriellaromeo.app.ui.theme.GRTheme
import com.stripe.android.PaymentConfiguration

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen().apply {
            setKeepOnScreenCondition { false }
            setOnExitAnimationListener { it.remove() }
        }
        super.onCreate(savedInstanceState)
        if (BuildConfig.STRIPE_PK.isNotBlank()) {
            PaymentConfiguration.init(applicationContext, BuildConfig.STRIPE_PK)
        }
        AppDeepLinks.dispatch(intent?.data)
        enableEdgeToEdge()
        setContent {
            GRTheme {
                GRNavGraph()
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        AppDeepLinks.dispatch(intent.data)
    }
}
