# Aruba Home Slide Translations Restore Point

Applied on 2026-04-28.

## Scope

- Updated only the `_h_title` post meta for home slideshow source slide `207` and its WPML translations.
- Fixed the final home slide title/subtitle in all 8 languages:
  - Italian: `5 Perle del Mondo / Comincia il viaggio...`
  - English: `5 Pearls of the World / The journey begins...`
  - French: `5 Perles du Monde / Le voyage commence...`
  - Arabic: `خمس لآلئ العالم / تبدأ الرحلة...`
  - German: `5 Perlen der Welt / Die Reise beginnt...`
  - Spanish: `5 Perlas del Mundo / Comienza el viaje...`
  - Chinese: `世界五颗珍珠 / 旅程开始...`
  - Japanese: `世界の5つの真珠 / 旅が始まります...`
- No theme files, images, CSS files, page bodies, menus, or product/gallery posts were changed.

## Restore Point

Backup option created in WordPress:

- `codex_home_slide_translations_backup_20260428`

Backup file created on the server:

- `wp-content/uploads/codex-home-slide-translation-backups/home-slide-before-20260428-085313.serialized.txt`

Local copy of the backup file:

- `home-slide-before-20260428-085313.serialized.txt`

Temporary guarded script left on the server for rollback:

- Actual script location: WordPress root `codex-home-slide-translations-20260428.php`.

## Immediate Rollback

Open the guarded script URL with the saved token and `rollback=1`.

The rollback restores the old `_h_title` values from the WordPress backup option.

## Verification

- `dry-run-before.txt`: captured the old and planned values before applying.
- `apply-output.txt`: captured the backup and update output.
- `audit-after.txt`: confirms current values match planned values.
- `live-html-after/home-*.html`: public live HTML captured for all 8 languages after applying.
- All 8 public home pages returned translated final slide text.
