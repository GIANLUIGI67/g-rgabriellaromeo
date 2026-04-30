# Aruba Social Final Tune Restore Point

Applied on 2026-04-28.

## Scope

- Updated `wp-content/themes/architectos/header.php`.
- Forced the QR link to align left, overriding the theme CSS that centered it.
- Replaced the Facebook image with lowercase `facebook` text in Facebook blue `#1877f2`.
- Replaced the search image with a white inline SVG magnifying glass.
- No database content, image files, or CSS files were changed.

## Restore Point

Remote restore file created before upload:

- `wp-content/themes/architectos/header.php.codex-restore-social-final-tune-20260428-104051`

Local restore file:

- `live-theme/restore-20260428-104051/header.php.before-social-final-tune-20260428-104051`

## Immediate Rollback

Restore the local backup over the live theme file:

```sh
curl -fsS -u "$ARUBA_FTP_USER:$ARUBA_FTP_PASS" \
  -T "backups/aruba/2026-04-28-social-final-tune/live-theme/restore-20260428-104051/header.php.before-social-final-tune-20260428-104051" \
  "ftp://ftp.g-rgabriellaromeo.it/www.g-rgabriellaromeo.it/wordpress/wp-content/themes/architectos/header.php"
```

Or copy the remote restore file back to `header.php` from Aruba file manager.

## Verification

- `https://www.g-rgabriellaromeo.it/` returned `200`.
- `https://www.g-rgabriellaromeo.it/anello-berlin/?lang=it` returned `200`.
- Public HTML contains the left-aligned QR link style.
- Public HTML contains Facebook text color `#1877f2`.
- Public HTML contains the white SVG search icon style.
- Desktop and mobile screenshots were captured in this backup folder.
