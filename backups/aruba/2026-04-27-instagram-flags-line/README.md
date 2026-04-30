# Aruba WordPress Instagram/flags refinement

Applied on 2026-04-27.

## Scope

- Kept language flags at 20px but reduced right margin to keep all 8 flags on one row inside the 184px sidebar block.
- Added `white-space: nowrap` to the flag container.
- Moved the Instagram icon/text into its own block row below the QR code.
- Restyled the Instagram link with white Arial text at 13px, closer to the visual style of the existing Twitter/Facebook/search labels.

## Restore Point

Remote restore files created before upload:

- `header.php.codex-restore-instagram-flags-line-20260427-134758`
- `footer.php.codex-restore-instagram-flags-line-20260427-134758`
- `custom.css.codex-restore-instagram-flags-line-20260427-134758`

Local restore files:

- `live-theme/restore-20260427-134758/`

## Verification

Verified public HTML/CSS after upload:

- `#flags_language_selector` includes `white-space:nowrap`, 184px width, and 20px flags with reduced margins.
- `#codex_instagram_row` is present below the QR block.
- `#codex_instagram_link` uses white Arial text and 13px font.
- The Contact page still returns `200` and keeps the corrected phone/legal text.
