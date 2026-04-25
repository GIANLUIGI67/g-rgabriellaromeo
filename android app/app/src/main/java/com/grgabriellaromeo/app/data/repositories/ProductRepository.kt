package com.grgabriellaromeo.app.data.repositories

import com.grgabriellaromeo.app.data.SupabaseClient
import com.grgabriellaromeo.app.data.models.Product
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order

class ProductRepository {
    private val db = SupabaseClient.client

    suspend fun getAll(): List<Product> =
        db.from("products").select().decodeList()

    suspend fun getByCategory(categoria: String): List<Product> =
        db.from("products").select {
            filter { eq("categoria", categoria) }
            order("created_at", Order.DESCENDING)
        }.decodeList()

    suspend fun getOfferte(): List<Product> =
        db.from("products").select {
            filter { eq("offerta", true) }
        }.decodeList()

    suspend fun search(query: String): List<Product> =
        db.from("products").select {
            filter { ilike("nome", "%$query%") }
        }.decodeList()

    suspend fun getById(id: Int): Product? =
        db.from("products").select {
            filter { eq("id", id) }
        }.decodeSingleOrNull()
}
