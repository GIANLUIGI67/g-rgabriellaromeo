package com.grgabriellaromeo.app

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class AdminContainerActivity : AppCompatActivity() {
    private lateinit var webView: WebView
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val clipData = result.data?.clipData
        val singleData = result.data?.data
        val uris: Array<Uri>? = when {
            result.resultCode != RESULT_OK -> null
            clipData != null -> {
                Array(clipData.itemCount) { index -> clipData.getItemAt(index).uri }
            }
            singleData != null -> arrayOf(singleData)
            else -> null
        }
        fileChooserCallback?.onReceiveValue(uris)
        fileChooserCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin_container)
        title = getString(R.string.admin_page_title)

        val rootView = findViewById<View>(R.id.adminRoot)
        val headerView = findViewById<View>(R.id.adminHeader)
        webView = findViewById(R.id.adminWebView)
        findViewById<Button>(R.id.adminReloadButton).setOnClickListener { webView.reload() }
        applySystemBarInsets(rootView, headerView)

        configureWebView()

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
        } else {
            webView.loadUrl(BuildConfig.ADMIN_URL)
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    private fun applySystemBarInsets(rootView: View, headerView: View) {
        val initialHeaderLeft = headerView.paddingLeft
        val initialHeaderTop = headerView.paddingTop
        val initialHeaderRight = headerView.paddingRight
        val initialHeaderBottom = headerView.paddingBottom

        val initialWebViewLeft = webView.paddingLeft
        val initialWebViewTop = webView.paddingTop
        val initialWebViewRight = webView.paddingRight
        val initialWebViewBottom = webView.paddingBottom

        ViewCompat.setOnApplyWindowInsetsListener(rootView) { _, insets ->
            val barsInsets = insets.getInsets(WindowInsetsCompat.Type.systemBars())

            headerView.setPadding(
                initialHeaderLeft + barsInsets.left,
                initialHeaderTop + barsInsets.top,
                initialHeaderRight + barsInsets.right,
                initialHeaderBottom
            )

            webView.setPadding(
                initialWebViewLeft + barsInsets.left,
                initialWebViewTop,
                initialWebViewRight + barsInsets.right,
                initialWebViewBottom + barsInsets.bottom
            )

            insets
        }
        ViewCompat.requestApplyInsets(rootView)
    }

    private fun configureWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadsImagesAutomatically = true

        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val uri = request.url
                val scheme = uri.scheme?.lowercase()
                if (scheme == "http" || scheme == "https") {
                    return false
                }
                return openExternalUri(uri)
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>,
                fileChooserParams: FileChooserParams
            ): Boolean {
                this@AdminContainerActivity.fileChooserCallback?.onReceiveValue(null)
                this@AdminContainerActivity.fileChooserCallback = filePathCallback

                return try {
                    val chooserIntent = fileChooserParams.createIntent()
                    fileChooserLauncher.launch(chooserIntent)
                    true
                } catch (_: ActivityNotFoundException) {
                    this@AdminContainerActivity.fileChooserCallback = null
                    Toast.makeText(
                        this@AdminContainerActivity,
                        getString(R.string.admin_load_error),
                        Toast.LENGTH_SHORT
                    ).show()
                    false
                }
            }
        }
    }

    private fun openExternalUri(uri: Uri): Boolean {
        return try {
            startActivity(Intent(Intent.ACTION_VIEW, uri))
            true
        } catch (_: Exception) {
            false
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onDestroy() {
        fileChooserCallback?.onReceiveValue(null)
        fileChooserCallback = null
        webView.destroy()
        super.onDestroy()
    }
}
