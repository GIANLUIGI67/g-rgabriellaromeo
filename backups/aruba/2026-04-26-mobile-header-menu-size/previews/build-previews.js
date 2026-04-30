const fs = require('fs');
const path = require('path');

const dir = __dirname;
const base = fs.readFileSync(path.join(dir, 'collections-base.html'), 'utf8');
const variants = [
  ['variant-a-sidebar-compact', 'variant-a-sidebar-compact.css'],
  ['variant-b-top-flex', 'variant-b-top-flex.css'],
  ['variant-c-top-stack', 'variant-c-top-stack.css'],
  ['variant-d-top-stack-centered', 'variant-d-top-stack-centered.css'],
  ['variant-e-left-stack-centered-logo', 'variant-e-left-stack-centered-logo.css'],
  ['variant-f-top-logo-left-buttons', 'variant-f-top-logo-left-buttons.css'],
  ['variant-g-left-logo-content-from-first-button', 'variant-g-left-logo-content-from-first-button.css'],
];

for (const [name, cssFile] of variants) {
  const css = fs.readFileSync(path.join(dir, cssFile), 'utf8');
  const html = base.replace(
    '</head>',
    `<style id="codex-mobile-preview">\n${css}\n</style>\n</head>`
  );
  fs.writeFileSync(path.join(dir, `${name}.html`), html);
}
