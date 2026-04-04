const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');

function fail(message) {
  console.error(`[verify-build] ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`[verify-build] ${message}`);
}

function assertFileExists(relPath) {
  const fullPath = path.join(publicDir, relPath);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing expected output: public/${relPath}`);
  }
  ok(`Found public/${relPath}`);
}

if (!fs.existsSync(publicDir)) {
  fail('public/ directory does not exist. Run hexo generate first.');
}

assertFileExists('index.html');
assertFileExists(path.join('about', 'index.html'));
assertFileExists('atom.xml');
assertFileExists('robots.txt');
assertFileExists('sitemap.xml');

const categoriesIndex = path.join(publicDir, 'categories', 'index.html');
const tagsIndex = path.join(publicDir, 'tags', 'index.html');
if (!fs.existsSync(categoriesIndex)) {
  fail('Missing categories page: public/categories/index.html');
}
if (!fs.existsSync(tagsIndex)) {
  fail('Missing tags page: public/tags/index.html');
}
ok('Found category and tag pages');

ok('Build output checks passed');
