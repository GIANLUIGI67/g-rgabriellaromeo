#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${ARUBA_FTP_USER:-}" || -z "${ARUBA_FTP_PASS:-}" ]]; then
  echo "Set ARUBA_FTP_USER and ARUBA_FTP_PASS before running."
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
WORK_DIR="$ROOT_DIR/backups/aruba/$STAMP-mobile-collection-slideshow-fix"
mkdir -p "$WORK_DIR"

FTP_AUTH="$ARUBA_FTP_USER:$ARUBA_FTP_PASS"
FTP_THEME="ftp://ftp.g-rgabriellaromeo.it//www.g-rgabriellaromeo.it/wordpress/wp-content/themes/architectos"
REMOTE_CUSTOM_CSS="$FTP_THEME/custom.css"

LOCAL_BEFORE="$WORK_DIR/custom.css.before-$STAMP"
LOCAL_AFTER="$WORK_DIR/custom.css.after-$STAMP"
LOCAL_VERIFY="$WORK_DIR/custom.css.verify-after-upload-$STAMP"
REMOTE_RESTORE="$FTP_THEME/custom.css.codex-restore-mobile-collection-slideshow-$STAMP"

echo "Downloading live custom.css..."
curl -fsS -u "$FTP_AUTH" "$REMOTE_CUSTOM_CSS" -o "$LOCAL_BEFORE"
cp "$LOCAL_BEFORE" "$LOCAL_AFTER"

if rg -q "CODEX COLLECTION SLIDESHOW MOBILE FIX" "$LOCAL_AFTER"; then
  echo "Patch marker already present in custom.css, skipping CSS append."
else
  cat >> "$LOCAL_AFTER" <<'CSS'

/* CODEX COLLECTION SLIDESHOW MOBILE FIX */
@media screen and (max-width: 820px) {
  body.single-wpb_portfolio.fullscreen_slideshow #supersized,
  body.single-wpb_portfolio.fullscreen_slideshow #supersized li {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 56vh !important;
    max-height: 56vh !important;
    min-height: 300px !important;
    overflow: hidden !important;
  }

  body.single-wpb_portfolio.fullscreen_slideshow #supersized li img,
  body.single-wpb_portfolio.fullscreen_slideshow #supersized img {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    object-fit: contain !important;
    object-position: center center !important;
    left: 0 !important;
    top: 0 !important;
  }

  body.single-wpb_portfolio.fullscreen_slideshow #slide-list {
    left: 12px !important;
    right: 12px !important;
    width: auto !important;
  }
}

@media screen and (max-width: 480px) {
  body.single-wpb_portfolio.fullscreen_slideshow #supersized,
  body.single-wpb_portfolio.fullscreen_slideshow #supersized li {
    height: 50vh !important;
    max-height: 50vh !important;
    min-height: 260px !important;
  }
}
/* /CODEX COLLECTION SLIDESHOW MOBILE FIX */
CSS
fi

echo "Creating immediate remote restore point..."
curl -fsS -u "$FTP_AUTH" -T "$LOCAL_BEFORE" "$REMOTE_RESTORE"

echo "Uploading patched custom.css..."
curl -fsS -u "$FTP_AUTH" -T "$LOCAL_AFTER" "$REMOTE_CUSTOM_CSS"

echo "Verifying upload..."
curl -fsS -u "$FTP_AUTH" "$REMOTE_CUSTOM_CSS" -o "$LOCAL_VERIFY"
if rg -q "CODEX COLLECTION SLIDESHOW MOBILE FIX" "$LOCAL_VERIFY"; then
  echo "Upload OK."
else
  echo "Upload verification failed: marker not found in remote custom.css."
  exit 1
fi

cat <<EOF
Done.
Local backup dir:
- $WORK_DIR

Remote restore file:
- $REMOTE_RESTORE

Immediate rollback:
curl -fsS -u "\$ARUBA_FTP_USER:\$ARUBA_FTP_PASS" -T "$LOCAL_BEFORE" "$REMOTE_CUSTOM_CSS"
EOF
