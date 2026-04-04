const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const pkgPath = path.join(repoRoot, 'package.json');
const nodeModulesHexoPkg = path.join(repoRoot, 'node_modules', 'hexo', 'package.json');

const REQUIRED_NODE = 'v20.19.0';
const REQUIRED_HEXO = '8.1.1';

function fail(message) {
  console.error(`[check-env] ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`[check-env] ${message}`);
}

if (process.version !== REQUIRED_NODE) {
  fail(`Node.js version must be ${REQUIRED_NODE}. Current: ${process.version}`);
}
ok(`Node version ${process.version} OK`);

if (!fs.existsSync(pkgPath)) {
  fail('package.json not found');
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const expectedHexo = pkg.dependencies && pkg.dependencies.hexo;
if (expectedHexo !== REQUIRED_HEXO) {
  fail(`package.json dependencies.hexo must be ${REQUIRED_HEXO}. Current: ${expectedHexo || 'missing'}`);
}
ok(`package.json hexo version ${expectedHexo} OK`);

if (!fs.existsSync(nodeModulesHexoPkg)) {
  fail('node_modules/hexo not found. Run: npm ci');
}

const installedHexo = JSON.parse(fs.readFileSync(nodeModulesHexoPkg, 'utf8')).version;
if (installedHexo !== REQUIRED_HEXO) {
  fail(`Installed hexo must be ${REQUIRED_HEXO}. Current: ${installedHexo}. Run: npm ci`);
}
ok(`Installed hexo ${installedHexo} OK`);

ok('Environment checks passed');
