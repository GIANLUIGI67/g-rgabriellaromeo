# Gallery Archive Title Only - 2026-04-28

Scope:
- Changed only theme files, no database edits.
- On gallery/listing pages, product cards now visually show image plus product title only.
- Product details, price, and request button remain visible on single product pages.
- The existing multilingual/database restore point from `2026-04-28-gallery-multilang-fix` was left intact.

Files changed on server:
- `wp-content/themes/architectos/custom.css`
  - Added selectors for `body.blog`, `body.archive`, and `body.search` product cards.
  - The selectors hide everything inside `.post_teaser.full_content_in_blog` except `.post_title`, plus hide `.teaser_meta`.
- `wp-content/themes/architectos/functions.php`
  - Added a cache-buster only for `custom.css` so browsers fetch the updated CSS immediately.

Server rollback files:
- `wp-content/themes/architectos/custom.css.codex-restore-gallery-title-only-20260428-092858`
- `wp-content/themes/architectos/functions.php.codex-restore-gallery-title-only-20260428-093332`

Local rollback files:
- `live-theme/custom.css.live-before-title-only`
- `live-theme/functions.php.after-title-only-cache-bust`
- Previous working `functions.php` source: `../2026-04-28-gallery-multilang-fix/live-theme/functions.php.live-current-before-gallery-archive-cleanup`

Verification:
- `/collections/` returns HTTP 200 and loads `custom.css?ver=1.0.5&codexv=202604280932`.
- `/collections/` screenshot shows product images plus titles only.
- `/category/anelli/` screenshot shows product images plus titles only.
- `/anello-new-delhi-oro-bianco/` returns HTTP 200 and still shows `CARATTERISTICHE`, `€ 7.600`, and `Richiesta Informazioni`.

Rollback procedure:
1. Restore `custom.css` from `custom.css.codex-restore-gallery-title-only-20260428-092858` or upload `live-theme/custom.css.live-before-title-only`.
2. Restore `functions.php` from `functions.php.codex-restore-gallery-title-only-20260428-093332` or upload `../2026-04-28-gallery-multilang-fix/live-theme/functions.php.live-current-before-gallery-archive-cleanup`.
3. No database rollback is needed for this change.
