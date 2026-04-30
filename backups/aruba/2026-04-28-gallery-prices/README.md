# Aruba WordPress Gallery Price Update

Prepared and applied on 2026-04-28 for `www.g-rgabriellaromeo.it`.

## Scope

Updated ring prices in the WordPress gallery product posts and their WPML translations:

- Berlin anello oro bianco e oro giallo: `€ 5.200` -> `€ 6.200`
- Marrakech anello oro bianco: `€ 7.700` -> `€ 8.500`
- Marrakech anello oro giallo: current live value was `€ 7.500`; updated to `€ 8.500`
- New Delhi anello oro giallo: `€ 6.700` -> `€ 7.600`
- New Delhi anello oro bianco: `€ 6.700` -> `€ 7.600`
- New York anello oro bianco: `€ 7900` -> `€ 8.100`
- New York anello oro giallo: `€ 7900` -> `€ 8.100`
- Sydney anello oro bianco: `€ 6.700` -> `€ 7.700`
- Sydney anello oro giallo: `€ 6.700` -> `€ 7.700`

Also repaired the Italian `anello-new-delhi-oro-bianco/` URL. Before the update, that URL resolved to attachment `ID 154`; after the update it resolves to the post `ID 553` (`New Delhi :: Anello Oro Bianco`).

## Backups

Local before-change HTML snapshots:

- `live-html-before/`

Server-side database backup written before the apply:

- `wp-content/uploads/codex-gallery-price-backups/gallery-prices-before-20260428-065656.serialized.txt`

Local copy of the same backup:

- `gallery-prices-before-20260428-065656.serialized.txt`

The script also saved the original rows in the WordPress option:

- `codex_gallery_prices_backup_20260428`

## Apply Evidence

- `dry-run-before.txt`
- `apply-output.txt`
- `dry-run-after.txt`

The temporary public script was deleted from the WordPress root after verification. Its URL returned `404`.

## Rollback

To roll back, re-upload `codex-gallery-prices-20260428.php` to the WordPress root and run it with `rollback=1`. The script restores the saved WordPress option backup.

After rollback, delete the script from the WordPress root again.

## Verified Italian URLs

- `/anello-berlin/` -> `€ 6.200`
- `/anello-marrakech-oro-bianco/` -> `€ 8.500`
- `/anello-marrakech/` -> `€ 8.500`
- `/anello-new-delhi/` -> `€ 7.600`
- `/anello-new-delhi-oro-bianco/` -> `postid-553`, `€ 7.600`
- `/anello-new-york/` -> `€ 8.100`
- `/anello-new-york-oro-giallo/` -> `€ 8.100`
- `/anello-sydney-oro-bianco/` -> `€ 7.700`
- `/anello-sydney/` -> `€ 7.700`
