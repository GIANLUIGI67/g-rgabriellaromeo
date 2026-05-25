package com.grgabriellaromeo.app.util

import java.util.Locale

private const val EURO_SIGN = "\u20AC"

fun formatEuro(value: Double): String {
    val formatted = "%,.2f".format(Locale.ITALY, value)
    return "$EURO_SIGN $formatted"
}

fun formatNegativeEuro(value: Double): String = "-${formatEuro(value)}"
