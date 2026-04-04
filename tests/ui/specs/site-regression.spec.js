const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const publicDir = path.join(repoRoot, 'public');

const requiredSelectors = {
  home: ['body > .container-fluid.navbar-container', 'nav.navbar', '.row'],
  about: ['body > .container-fluid.navbar-container', 'nav.navbar', '.row'],
  categories: ['body > .container-fluid.navbar-container', 'nav.navbar', '.row'],
  tags: ['body > .container-fluid.navbar-container', 'nav.navbar', '.row'],
  post: ['body > .container-fluid.navbar-container', 'nav.navbar', '.row']
};

function toWebPath(absPath) {
  return `/${path.relative(publicDir, absPath).replace(/\\/g, '/')}`.replace(/\/index\.html$/, '/');
}

function findRepresentativePostPath() {
  if (!fs.existsSync(publicDir)) return null;
  const allFiles = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      if (entry.isFile() && entry.name === 'index.html') allFiles.push(abs);
    }
  }

  walk(publicDir);
  const postFile = allFiles.find((abs) => {
    const rel = path.relative(publicDir, abs).replace(/\\/g, '/');
    return /^\d{4}\/\d{2}\/\d{2}\/.+\/index\.html$/.test(rel);
  });

  return postFile ? toWebPath(postFile) : null;
}

const representativePost = findRepresentativePostPath();
const pages = [
  { id: 'home', path: '/', priority: 'P1' },
  { id: 'about', path: '/about/', priority: 'P1' },
  { id: 'categories', path: '/categories/', priority: 'P2' },
  { id: 'tags', path: '/tags/', priority: 'P2' }
];

if (representativePost) {
  pages.push({ id: 'post', path: representativePost, priority: 'P2' });
}

for (const pageDef of pages) {
  test(`${pageDef.priority} ${pageDef.id} visual and dom regression`, async ({ page }) => {
    await page.goto(pageDef.path, { waitUntil: 'networkidle' });

    for (const selector of requiredSelectors[pageDef.id]) {
      await expect(page.locator(selector).first()).toBeVisible();
    }

    const domSignature = await page.evaluate(() => {
      const keepAttrs = ['id', 'class', 'role', 'data-page'];
      const walk = (node) => {
        if (!(node instanceof Element)) return null;
        const attrs = keepAttrs
          .map((key) => [key, node.getAttribute(key)])
          .filter(([, value]) => Boolean(value))
          .map(([k, v]) => `${k}=${v}`)
          .join(',');

        const children = Array.from(node.children).map(walk).filter(Boolean);
        return { tag: node.tagName.toLowerCase(), attrs, children };
      };

      return JSON.stringify(walk(document.body));
    });

    expect(domSignature).toMatchSnapshot(`${pageDef.id}.dom.json`);
    await expect(page).toHaveScreenshot(`${pageDef.id}.png`, { fullPage: true });
  });
}
