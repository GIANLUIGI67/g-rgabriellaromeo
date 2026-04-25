package com.grgabriellaromeo.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.grgabriellaromeo.app.navigation.GRNavGraph
import com.grgabriellaromeo.app.ui.theme.GRTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen().apply {
            setKeepOnScreenCondition { false }
            setOnExitAnimationListener { it.remove() }
        }
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            GRTheme {
                GRNavGraph()
            }
        }
    }
}
