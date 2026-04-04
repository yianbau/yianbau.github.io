const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const repoRoot = path.resolve(__dirname, '..');
const publicDir = path.join(repoRoot, 'public');
const port = Number(process.env.PUBLIC_SERVER_PORT || '4173');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
}

if (!fs.existsSync(publicDir)) {
  console.error('[serve-public] public/ not found. Run generate first.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url).pathname || '/';
  let requestPath = decodeURIComponent(parsed);
  if (requestPath.endsWith('/')) requestPath += 'index.html';
  if (!path.extname(requestPath)) requestPath += '/index.html';

  const absPath = path.normalize(path.join(publicDir, requestPath));
  if (!absPath.startsWith(publicDir)) {
    send404(res);
    return;
  }

  if (!fs.existsSync(absPath) || fs.statSync(absPath).isDirectory()) {
    send404(res);
    return;
  }

  const ext = path.extname(absPath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(absPath).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`[serve-public] serving ${publicDir} on http://127.0.0.1:${port}`);
});
