const { spawnSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const args = ['playwright', 'test', '--config=tests/ui/playwright.config.js'];

const run = spawnSync('npx', args, {
  cwd: repoRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

if (run.status !== 0) {
  process.exit(run.status || 1);
}
