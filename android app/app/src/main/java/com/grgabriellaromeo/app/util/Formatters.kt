package com.grgabriellaromeo.app.util

import java.util.Locale

private const val EURO_SIGN = "\u20AC"

fun formatEuro(value: Double): String = "$EURO_SIGN %.2f".format(Locale.US, value)

fun formatNegativeEuro(value: Double): String = "-${formatEuro(value)}"
