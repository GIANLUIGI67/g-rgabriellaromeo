package com.grgabriellaromeo.app.viewmodel

import android.app.Application
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

private val Context.dataStore by preferencesDataStore(name = "settings")
private val LANG_KEY = stringPreferencesKey("language")

class LangViewModel(app: Application) : AndroidViewModel(app) {
    private val _lang = MutableStateFlow("it")
    val lang: StateFlow<String> = _lang

    init {
        viewModelScope.launch {
            val prefs = app.dataStore.data.first()
            _lang.value = prefs[LANG_KEY] ?: "it"
        }
    }

    fun setLang(newLang: String) {
        _lang.value = newLang
        viewModelScope.launch {
            getApplication<Application>().dataStore.edit { it[LANG_KEY] = newLang }
        }
    }
}
