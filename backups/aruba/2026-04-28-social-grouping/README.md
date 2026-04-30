# Aruba Social Grouping Restore Point

Applied on 2026-04-28.

## Scope

- Updated `wp-content/themes/architectos/header.php`.
- Moved the QR code and Instagram label into the bottom social block.
- Placed the QR/Instagram block directly above the X, Facebook, and Search row.
- Replaced the previous CSS-drawn X with an inline white SVG X mark aligned in the same 20px row as Facebook.
- No database content, images, or CSS files were changed.

## Restore Point

Remote restore file created before upload:

- `wp-content/themes/architectos/header.php.codex-restore-social-grouping-20260428-102612`

Local restore file:

- `live-theme/restore-20260428-102612/header.php.before-social-grouping-20260428-102612`

## Immediate Rollback

Restore the local backup over the live theme file:

```sh
curl -fsS -u "$ARUBA_FTP_USER:$ARUBA_FTP_PASS" \
  -T "backups/aruba/2026-04-28-social-grouping/live-theme/restore-20260428-102612/header.php.before-social-grouping-20260428-102612" \
  "ftp://ftp.g-rgabriellaromeo.it//www.g-rgabriellaromeo.it/wordpress/wp-content/themes/architectos/header.php"
```

Or copy the remote restore file back to `header.php` from Aruba file manager.

## Verification

- `https://www.g-rgabriellaromeo.it/` returned `200`.
- `https://www.g-rgabriellaromeo.it/anello-berlin/?lang=it` returned `200`.
- Public HTML contains `codex_store_qr` inside `social_icons`.
- Public HTML contains `codex_social_row` and `https://x.com/RomeoGabriella`.
- Public HTML no longer contains `twitter.png` for the social link.
- Desktop and mobile screenshots were captured in this backup folder.
