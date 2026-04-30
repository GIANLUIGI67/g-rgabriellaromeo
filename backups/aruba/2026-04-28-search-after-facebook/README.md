# Aruba Search After Facebook Restore Point

Applied on 2026-04-28.

## Scope

- Updated `wp-content/themes/architectos/header.php`.
- Kept the search icon immediately after the Facebook text in the social row.
- Overrode inherited `search_ico` positioning with inline static positioning.
- No database content, image files, or CSS files were changed.

## Restore Point

Remote restore file created before upload:

- `wp-content/themes/architectos/header.php.codex-restore-search-after-facebook-20260428-104533`

Local restore file:

- `live-theme/restore-20260428-104533/header.php.before-search-after-facebook-20260428-104533`

## Immediate Rollback

Restore the local backup over the live theme file:

```sh
curl -fsS -u "$ARUBA_FTP_USER:$ARUBA_FTP_PASS" \
  -T "backups/aruba/2026-04-28-search-after-facebook/live-theme/restore-20260428-104533/header.php.before-search-after-facebook-20260428-104533" \
  "ftp://ftp.g-rgabriellaromeo.it/www.g-rgabriellaromeo.it/wordpress/wp-content/themes/architectos/header.php"
```

Or copy the remote restore file back to `header.php` from Aruba file manager.

## Verification

- `https://www.g-rgabriellaromeo.it/` returned `200`.
- `https://www.g-rgabriellaromeo.it/anello-berlin/?lang=it` returned `200`.
- Public HTML contains the static-positioned `search_ico` inline style.
- Desktop and mobile screenshots were captured in this backup folder.
