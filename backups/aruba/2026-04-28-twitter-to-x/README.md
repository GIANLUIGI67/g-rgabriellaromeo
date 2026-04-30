# Aruba Twitter to X Restore Point

Applied on 2026-04-28.

## Scope

- Replaced the old Twitter image link in `wp-content/themes/architectos/header.php`.
- The social link now points to `https://x.com/RomeoGabriella`.
- The X mark is drawn inline with CSS, so no theme image file was added or replaced.
- No database content was changed.

## Restore Point

Remote restore file created before upload:

- `wp-content/themes/architectos/header.php.codex-restore-twitter-to-x-20260428-101957`

Local restore file:

- `live-theme/restore-20260428-101957/header.php.before-twitter-to-x-20260428-101957`

## Immediate Rollback

Restore the local backup over the live theme file:

```sh
curl -fsS -u "$ARUBA_FTP_USER:$ARUBA_FTP_PASS" \
  -T "backups/aruba/2026-04-28-twitter-to-x/live-theme/restore-20260428-101957/header.php.before-twitter-to-x-20260428-101957" \
  "ftp://ftp.g-rgabriellaromeo.it//www.g-rgabriellaromeo.it/wordpress/wp-content/themes/architectos/header.php"
```

Or copy the remote restore file back to `header.php` from Aruba file manager.

## Verification

- `https://www.g-rgabriellaromeo.it/` returned `200`.
- `https://www.g-rgabriellaromeo.it/anello-berlin/?lang=it` returned `200`.
- Public HTML now contains `https://x.com/RomeoGabriella`.
- Public HTML no longer contains `twitter.png` for the social link.
