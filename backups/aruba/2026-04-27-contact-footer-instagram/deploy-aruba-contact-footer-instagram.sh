#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${ARUBA_FTP_USER:-}" || -z "${ARUBA_FTP_PASS:-}" ]]; then
  echo "Set ARUBA_FTP_USER and ARUBA_FTP_PASS before running."
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOCAL_RESTORE_DIR="$ROOT_DIR/live-theme/restore-$STAMP"

FTP_AUTH="$ARUBA_FTP_USER:$ARUBA_FTP_PASS"
FTP_ROOT="ftp://ftp.g-rgabriellaromeo.it//www.g-rgabriellaromeo.it/wordpress"
FTP_THEME="$FTP_ROOT/wp-content/themes/architectos"
PUBLIC_SCRIPT_URL="https://www.g-rgabriellaromeo.it/wordpress/codex-contact-footer-instagram-20260427.php"
TOKEN="3dfcac5d9ac892ad0b05eea9dc3cf0106ea1"

UPDATED_HEADER="$ROOT_DIR/live-theme/header.php.after-contact-footer-instagram"
UPDATED_CUSTOM="$ROOT_DIR/live-theme/custom.css.after-contact-footer-instagram"
PATCH_SCRIPT="$ROOT_DIR/codex-contact-footer-instagram-20260427.php"

mkdir -p "$LOCAL_RESTORE_DIR"

echo "Downloading live theme files for local restore point: $LOCAL_RESTORE_DIR"
curl -fsS -u "$FTP_AUTH" "$FTP_THEME/header.php" -o "$LOCAL_RESTORE_DIR/header.php.before-contact-footer-instagram-$STAMP"
curl -fsS -u "$FTP_AUTH" "$FTP_THEME/footer.php" -o "$LOCAL_RESTORE_DIR/footer.php.before-contact-footer-instagram-$STAMP"
curl -fsS -u "$FTP_AUTH" "$FTP_THEME/custom.css" -o "$LOCAL_RESTORE_DIR/custom.css.before-contact-footer-instagram-$STAMP"

echo "Uploading remote restore copies next to live theme files."
curl -fsS -u "$FTP_AUTH" -T "$LOCAL_RESTORE_DIR/header.php.before-contact-footer-instagram-$STAMP" "$FTP_THEME/header.php.codex-restore-contact-footer-instagram-$STAMP"
curl -fsS -u "$FTP_AUTH" -T "$LOCAL_RESTORE_DIR/footer.php.before-contact-footer-instagram-$STAMP" "$FTP_THEME/footer.php.codex-restore-contact-footer-instagram-$STAMP"
curl -fsS -u "$FTP_AUTH" -T "$LOCAL_RESTORE_DIR/custom.css.before-contact-footer-instagram-$STAMP" "$FTP_THEME/custom.css.codex-restore-contact-footer-instagram-$STAMP"

echo "Uploading updated header.php and custom.css."
curl -fsS -u "$FTP_AUTH" -T "$UPDATED_HEADER" "$FTP_THEME/header.php"
curl -fsS -u "$FTP_AUTH" -T "$UPDATED_CUSTOM" "$FTP_THEME/custom.css"

echo "Uploading guarded WordPress content patch script."
curl -fsS -u "$FTP_AUTH" -T "$PATCH_SCRIPT" "$FTP_ROOT/codex-contact-footer-instagram-20260427.php"

echo "Running WordPress content patch dry run."
curl -fsS "$PUBLIC_SCRIPT_URL?token=$TOKEN"

if [[ "${APPLY_DB:-0}" == "1" ]]; then
  echo "Applying WordPress contact page update."
  curl -fsS "$PUBLIC_SCRIPT_URL?token=$TOKEN&apply=1"
else
  echo "DB dry run only. Re-run with APPLY_DB=1 to update the contact page content."
fi

cat <<EOF

Remote restore files:
- header.php.codex-restore-contact-footer-instagram-$STAMP
- footer.php.codex-restore-contact-footer-instagram-$STAMP
- custom.css.codex-restore-contact-footer-instagram-$STAMP

Immediate theme rollback:
curl -fsS -u "\$ARUBA_FTP_USER:\$ARUBA_FTP_PASS" -T "$LOCAL_RESTORE_DIR/header.php.before-contact-footer-instagram-$STAMP" "$FTP_THEME/header.php"
curl -fsS -u "\$ARUBA_FTP_USER:\$ARUBA_FTP_PASS" -T "$LOCAL_RESTORE_DIR/footer.php.before-contact-footer-instagram-$STAMP" "$FTP_THEME/footer.php"
curl -fsS -u "\$ARUBA_FTP_USER:\$ARUBA_FTP_PASS" -T "$LOCAL_RESTORE_DIR/custom.css.before-contact-footer-instagram-$STAMP" "$FTP_THEME/custom.css"

Immediate contact-page rollback:
curl -fsS "$PUBLIC_SCRIPT_URL?token=$TOKEN&rollback=1"

Verification URLs:
- https://www.g-rgabriellaromeo.it/contatti/?lang=it
- https://www.g-rgabriellaromeo.it/?lang=it

After verification, delete the patch script from the server:
curl -fsS -u "\$ARUBA_FTP_USER:\$ARUBA_FTP_PASS" -Q "DELE /www.g-rgabriellaromeo.it/wordpress/codex-contact-footer-instagram-20260427.php" "ftp://ftp.g-rgabriellaromeo.it/"
EOF
