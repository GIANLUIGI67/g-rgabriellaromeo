# Aruba Social Left Alignment Restore Point

Applied on 2026-04-28.

## Scope

- Updated `wp-content/themes/architectos/header.php`.
- Left-aligned the QR code inside the bottom social block.
- Left-aligned the Instagram icon/text so it starts in the same column as the X icon.
- No database content, images, or CSS files were changed.

## Restore Point

Remote restore file created before upload:

- `wp-content/themes/architectos/header.php.codex-restore-social-left-align-20260428-103351`

Local restore file:

- `live-theme/restore-20260428-103351/header.php.before-social-left-align-20260428-103351`

## Immediate Rollback

Restore the local backup over the live theme file:

```sh
curl -fsS -u "$ARUBA_FTP_USER:$ARUBA_FTP_PASS" \
  -T "backups/aruba/2026-04-28-social-left-align/live-theme/restore-20260428-103351/header.php.before-social-left-align-20260428-103351" \
  "ftp://ftp.g-rgabriellaromeo.it//www.g-rgabriellaromeo.it/wordpress/wp-content/themes/architectos/header.php"
```

Or copy the remote restore file back to `header.php` from Aruba file manager.

## Verification

- `https://www.g-rgabriellaromeo.it/` returned `200`.
- `https://www.g-rgabriellaromeo.it/anello-berlin/?lang=it` returned `200`.
- Public HTML contains left-aligned `codex_store_qr`, `codex_instagram_row`, and `codex_instagram_link` inline styles.
- Desktop and mobile screenshots were captured in this backup folder.
