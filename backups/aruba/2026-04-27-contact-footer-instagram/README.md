# Aruba WordPress contact/footer Instagram update

Prepared on 2026-04-27 for `www.g-rgabriellaromeo.it`.

## Scope

- Updates the Contact page phone from `+393465755626` to `+393429506938`.
- Replaces the Italian legal line with:
  `Il marchio g-r gabriellaromeo e le collezioni in questo sito sono proprieta' esclusiva di Gabriella Romeo.`
- Removes the known English `NEW TREND S.r.l.` legal line wording if found in the translated Contact page.
- Enlarges the language flags from 18px to 20px wide.
- Enlarges the Instagram QR from 58px to 64px.
- Centers the QR under the language flags.
- Adds an Instagram link under the QR with a small CSS icon and `instagram` label.

## Prepared files

- `live-theme/header.php.after-contact-footer-instagram`
- `live-theme/custom.css.after-contact-footer-instagram`
- `codex-contact-footer-instagram-20260427.php`
- `deploy-aruba-contact-footer-instagram.sh`

## Safe apply

Run with Aruba FTP credentials:

```sh
ARUBA_FTP_USER='...' ARUBA_FTP_PASS='...' APPLY_DB=1 \
  backups/aruba/2026-04-27-contact-footer-instagram/deploy-aruba-contact-footer-instagram.sh
```

The deploy script downloads the live `header.php`, `footer.php`, and `custom.css`, stores local copies, uploads remote restore copies next to the live theme files, uploads the updated theme files, uploads the guarded WordPress patch script, then applies the Contact page update only when `APPLY_DB=1`.

## Rollback

The deploy script prints exact rollback commands with the timestamped local restore directory. It also creates these remote restore files:

- `header.php.codex-restore-contact-footer-instagram-20260427-132354`
- `footer.php.codex-restore-contact-footer-instagram-20260427-132354`
- `custom.css.codex-restore-contact-footer-instagram-20260427-132354`

Local restore copies are under:

- `live-theme/restore-20260427-132354/`

For Contact page content rollback, use the guarded script before deleting it:

```sh
curl -fsS 'https://www.g-rgabriellaromeo.it/wordpress/codex-contact-footer-instagram-20260427.php?token=3dfcac5d9ac892ad0b05eea9dc3cf0106ea1&rollback=1'
```

After verification, delete the guarded patch script from the server.

## Applied notes

Applied on 2026-04-27.

- Theme files were backed up locally and remotely before upload.
- The Contact page update was applied to the WPML contact translations found under the Italian source page.
- This old WordPress/WPML install blanked `post_name` values during the first content update, so the patch script was updated to use direct DB updates and re-force the contact slugs:
  - `contatti`
  - `contact-us`
  - `%d8%a7%d8%aa%d8%b5%d9%84-%d8%a8%d9%86%d8%a7`
  - `kontakt`
  - `contacto`
  - `contact-zh-hans`
  - `contact-ja`
- Original Contact page content backup option:
  - `codex_contact_footer_instagram_backup_20260427`
- Original server-side JSON backup:
  - `wp-content/uploads/codex-contact-footer-instagram-backups/contact-footer-instagram-before-20260427-112402.json`
- The temporary guarded script was deleted from the server after verification; its public URL returned `404`.
