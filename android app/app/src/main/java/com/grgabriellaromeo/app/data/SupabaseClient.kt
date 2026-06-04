package com.grgabriellaromeo.app.data

import com.grgabriellaromeo.app.BuildConfig
import io.github.jan.supabase.annotations.SupabaseInternal
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.auth.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.serializer.KotlinXSerializer
import io.github.jan.supabase.storage.Storage
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.HttpRequestRetry
import kotlinx.serialization.json.Json
import java.util.concurrent.TimeUnit
import kotlin.time.Duration.Companion.seconds

@OptIn(SupabaseInternal::class)
object SupabaseClient {
    val client = createSupabaseClient(
        supabaseUrl = BuildConfig.SUPABASE_URL.trim().trimEnd('/'),
        supabaseKey = BuildConfig.SUPABASE_ANON_KEY.trim()
    ) {
        requestTimeout = 30.seconds
        httpEngine = OkHttp.create {
            config {
                connectTimeout(30, TimeUnit.SECONDS)
                readTimeout(30, TimeUnit.SECONDS)
                writeTimeout(30, TimeUnit.SECONDS)
                retryOnConnectionFailure(true)
            }
        }
        httpConfig {
            install(HttpRequestRetry) {
                retryOnException(maxRetries = 2, retryOnTimeout = true)
                retryOnServerErrors(maxRetries = 1)
                exponentialDelay(
                    baseDelayMs = 700,
                    maxDelayMs = 2_500,
                    randomizationMs = 300
                )
            }
        }
        defaultSerializer = KotlinXSerializer(Json {
            ignoreUnknownKeys = true
            coerceInputValues = true
        })
        install(Auth)
        install(Postgrest)
        install(Storage)
    }
}
