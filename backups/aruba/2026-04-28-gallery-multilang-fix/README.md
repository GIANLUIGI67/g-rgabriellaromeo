# Gallery Multilingual Fix - 2026-04-28

Scope:
- Repaired gallery product body content across the 8 active languages.
- Regenerated German, Spanish, Simplified Chinese, and Japanese feature blocks from the Italian source content.
- Normalized Italian, English, French, and Arabic feature blocks while preserving their existing translated feature lines.
- Removed duplicate old/new Arabic price lines and kept exactly one localized price line.
- Added a small theme `widget_title` filter so the sidebar "Categories" title is localized in all 8 languages.

Rollback assets:
- Database rollback option: `codex_gallery_multilang_fix_backup_20260428`
- Primary server DB backup: `wp-content/uploads/codex-gallery-multilang-backups/gallery-multilang-before-20260428-071209.serialized.txt`
- Second identical post-rollback DB backup: `wp-content/uploads/codex-gallery-multilang-backups/gallery-multilang-before-20260428-071508.serialized.txt`
- Local DB backup copies:
  - `gallery-multilang-before-20260428-071209.serialized.txt`
  - `gallery-multilang-before-20260428-071508.serialized.txt`
- Theme backup on server: `wp-content/themes/architectos/functions.php.codex-restore-multilang-fix-20260428-091258`
- Theme backup locally: `live-theme/functions.php.live-before-multilang-fix`

Local files:
- `codex-gallery-multilang-fix-20260428.php`: guarded WordPress repair/rollback script.
- `apply-fixed-output.txt`: first corrected apply after rollback.
- `apply-clean-rebuild-output.txt`: final clean rebuild apply.
- `dry-run-after-clean-rebuild.txt`: final dry run after all changes.
- `verify-arabic-priced-pages.txt`: live verification for all Arabic priced ring pages.
- `live-html-before/`: pre-fix HTML snapshots for representative pages.

Final verification:
- Final dry-run reported no `price_lines_before => 2`, no `feature_lines_from_source => 0`, and no PHP warnings/fatals.
- Final apply reported `price_lines_after => 1` for 72 priced translations and `price_lines_after => 0` for 216 unpriced translations.
- All 9 Arabic priced pages verified with one price line, one expected new price hit, and zero old-price hits.
- Representative live pages checked:
  - `/anello-berlin-ja/?lang=ja`
  - `/anello-marrakech-oro-bianco/?lang=ar`
  - `/anello-berlin/?lang=ar`
  - `/anello-marrakech-oro-bianco-de/?lang=de`
  - `/anello-new-delhi-oro-bianco/?lang=it`
  - `/berlin-ring/?lang=en`

Rollback procedure:
1. Re-upload `codex-gallery-multilang-fix-20260428.php` to the WordPress root.
2. Open the script URL with the saved token and `rollback=1`; it restores posts from `codex_gallery_multilang_fix_backup_20260428`.
3. Restore the previous theme file by uploading `live-theme/functions.php.live-before-multilang-fix` to `wp-content/themes/architectos/functions.php`, or by copying the server backup `functions.php.codex-restore-multilang-fix-20260428-091258` over `functions.php`.
4. Delete the temporary repair script from the WordPress root after rollback.

Security cleanup:
- The temporary repair script was deleted from the WordPress root.
- HTTP verification after deletion returned `404`.
