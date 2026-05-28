package com.grgabriellaromeo.app

import android.net.Uri
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

object AppDeepLinks {
    private val _events = MutableSharedFlow<Uri>(extraBufferCapacity = 1)
    val events = _events.asSharedFlow()
    private var pendingUri: Uri? = null

    fun dispatch(uri: Uri?) {
        if (uri != null) {
            pendingUri = uri
            _events.tryEmit(uri)
        }
    }

    fun consumePending(): Uri? {
        val uri = pendingUri
        pendingUri = null
        return uri
    }

    fun markHandled(uri: Uri) {
        if (pendingUri == uri) pendingUri = null
    }
}
