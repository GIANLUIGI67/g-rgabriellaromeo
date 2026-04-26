# Aruba WordPress WPML New Languages Prep

Target live WordPress path:
`/www.g-rgabriellaromeo.it/wordpress`

Theme header path:
`/www.g-rgabriellaromeo.it/wordpress/wp-content/themes/architectos/header.php`

Prepared/applied files:
- `header.php.after-wpml-new-languages`
  - Based on the currently prepared language-flags header.
  - Keeps the existing layout.
  - Keeps the manual extra flags only when WPML has not already rendered those languages.
  - Uses WPML code `zh-hans` for Chinese on WordPress and maps it to `zh` only for the Vercel store URL.
  - Uses WPML to resolve the translated gallery permalink for the newly added language logo links.
- `codex-wpml-new-languages-20260426.php`
  - One-time guarded migration script.
  - Activates `de`, `es`, `zh-hans`, and `ja`.
  - Creates/updates translated pages, portfolio city entries, home slides, and two translated nav menus per language.
  - Forces translated slugs and menu item relationships for this older WordPress/WPML install.
  - Writes a JSON backup under `wp-content/uploads/codex-wpml-backups/` before changing the database.

Applied on 2026-04-26:
1. Live `header.php` was backed up locally and remotely before upload.
2. The updated header was uploaded to the active `architectos` theme.
3. The guarded migration script was uploaded, dry-run, applied, repaired for slugs/menu relationships, and applied again.
4. Server-side JSON backups were written before each database-changing run.
5. The temporary migration script was deleted from the server. Its public URL now returns `404`.

Follow-up content repair on 2026-04-26:
1. Added the missing WPML translated `post` records for all 36 gallery items in `de`, `es`, `zh-hans`, and `ja`.
2. Added translated category terms for rings, bracelets, necklaces/pendants, and earrings in the four new languages.
3. Updated translated body copy for the 5 Pearls page and the five city portfolio pages.
4. Repaired category translation rows directly after old WPML term helpers reused Italian categories.
5. Re-forced page and portfolio slugs after old WordPress update calls blanked a few `post_name` values.
6. Added bottom city-page heading translations in `single-wpb_portfolio.php`.
7. Deleted the temporary content repair script from the server. Its public URL now returns `404`.

Form/store repair on 2026-04-26:
1. Extended the Custom Contact Forms field labels, model prompts, option labels, form titles, and submit button text from the original four-language text to all eight languages.
2. Updated the German, Spanish, Chinese, and Japanese contact/form pages for Berlin, Marrakech, New Delhi, New York, and Sydney with localized intro copy while keeping the existing image block and `[customcontact form=N]` shortcode layout.
3. Updated the translated contact submenu labels/slugs for the new-language form pages.
4. Updated the theme header store label to online-store wording in all eight languages:
   - `NEGOZIO ONLINE`
   - `ONLINE STORE`
   - `BOUTIQUE EN LIGNE`
   - `المتجر الإلكتروني`
   - `ONLINE-SHOP`
   - `TIENDA ONLINE`
   - `在线商店`
   - `オンラインストア`
5. Deleted the temporary form/store repair script from the server. Its public URL now returns `404`.

Form image/menu repair on 2026-04-26:
1. Copied the four existing product images from each original city contact form into the German, Spanish, Chinese, and Japanese form translations.
2. Rewrote the translated form image blocks to match the original 2-by-2 layout: two images, one line break, then two images.
3. Re-forced all 20 translated form slugs after `wp_update_post()` blanked the Berlin form slugs on this older WordPress/WPML install.
4. Updated the Italian/default 5 Pearls page and menu label from `5 Pearls of the World` to `5 Perle del Mondo`; the English translation remains `5 Pearls of the World`.
5. Deleted the temporary form image/menu repair script from the server. Its public URL now returns `404`.

Server-side database backups written:
- `wp-content/uploads/codex-wpml-backups/wpml-new-languages-before-20260426-142918.json`
- `wp-content/uploads/codex-wpml-backups/wpml-new-languages-before-20260426-143347.json`
- `wp-content/uploads/codex-wpml-backups/wpml-new-languages-before-20260426-143629.json`
- `wp-content/uploads/codex-wpml-backups/wpml-content-repair-before-20260426-145230.json`
- `wp-content/uploads/codex-wpml-backups/wpml-content-repair-before-20260426-145414.json`
- `wp-content/uploads/codex-wpml-backups/wpml-content-repair-before-20260426-145557.json`
- `wp-content/uploads/codex-wpml-backups/wpml-content-repair-before-20260426-145756.json`
- `wp-content/uploads/codex-wpml-backups/wpml-forms-store-before-20260426-151438.json`
- `wp-content/uploads/codex-wpml-backups/wpml-form-images-menu-before-20260426-153734.json`
- `wp-content/uploads/codex-wpml-backups/wpml-form-images-menu-before-20260426-153943.json`
- `wp-content/uploads/codex-wpml-backups/wpml-form-images-menu-before-20260426-155013.json`

Remote theme backup written:
- `wp-content/themes/architectos/single-wpb_portfolio.php.codex-backup-content-repair-20260426-165204`

Verified public URLs:
- `/?lang=de`
- `/?lang=es`
- `/?lang=zh-hans`
- `/?lang=ja`
- `/galerie/?lang=de`
- `/galeria/?lang=es`
- `/collections-zh-hans/?lang=zh-hans`
- `/collections-ja/?lang=ja`
- Representative home, portfolio, and contact links for all four new languages.
- Gallery page 2 in all four new languages.
- Representative product detail links in all four new languages.
- All five city portfolio links in all four new languages.
- All 20 new-language city contact/form pages.
- All 20 new-language city contact/form pages with four product images and active form markup.
- All 20 new-language city contact/form pages with the product images rendered as a 2-by-2 block.
- Store menu labels in all eight languages.
- Italian/default `5 Perle del Mondo` menu and page title; English remains `5 Pearls of the World`.

Original safe apply order:
1. Download and save the live `header.php` again before upload.
2. Upload `header.php.after-wpml-new-languages` over the live theme `header.php`.
3. Upload `codex-wpml-new-languages-20260426.php` to the WordPress root.
4. Open the script URL once without `apply=1` to confirm the dry run.
5. Open the script URL with `apply=1` once.
6. Delete the migration script from the server immediately.
7. Verify:
   - `/?lang=de`
   - `/?lang=es`
   - `/?lang=zh-hans`
   - `/?lang=ja`
   - The translated gallery URLs listed above.

Rollback:
- Re-upload the most recent saved live `header.php`.
- Use the JSON backup written by the migration script to identify and remove generated rows if needed.
