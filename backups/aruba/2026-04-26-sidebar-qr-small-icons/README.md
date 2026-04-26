# Aruba WordPress small QR correction

Restore point timestamp: `20260426-192906`

This backup documents the live WordPress correction after the QR code rendered at its native size in a cached browser session.

The update adds inline dimensions to the sidebar QR code so it stays small even if `custom.css` is cached, and adds inline sizing/z-index to the Twitter, Facebook, and search controls so they remain visible.

Remote restore files were kept on the Aruba server next to the live theme files:

- `header.php.codex-restore-small-qr-20260426-192906`
- `footer.php.codex-restore-small-qr-20260426-192906`
- `custom.css.codex-restore-small-qr-20260426-192906`
