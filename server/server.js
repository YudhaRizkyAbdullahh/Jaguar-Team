const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
// Layani file dari root repositori (satu tingkat di atas folder `server/`)
const BASE = path.join(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.ico': 'image/x-icon',
};

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('404 Not Found');
}

function safeJoin(base, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const fullPath = path.join(base, decoded);
  if (!fullPath.startsWith(base)) return null;
  return fullPath;
}

const server = http.createServer((req, res) => {
  try {
    let reqPath = req.url || '/';

    if (reqPath === '/') {
      reqPath = '/html/index.html';
    }

    const filePath = safeJoin(BASE, reqPath);
    if (!filePath) return send404(res);

    fs.stat(filePath, (err, stats) => {
      if (err) {
        const altPath = safeJoin(BASE, path.join('/html', reqPath));
        if (!altPath) return send404(res);
        return fs.stat(altPath, (ae, ast) => {
          if (ae) return send404(res);
          if (ast.isDirectory()) {
            const indexFile = path.join(altPath, 'index.html');
            return fs.stat(indexFile, (ie, ist) => {
              if (ie || !ist.isFile()) return send404(res);
              streamFile(indexFile, res);
            });
          }
          if (ast.isFile()) return streamFile(altPath, res);
          return send404(res);
        });
      }

      if (stats.isDirectory()) {
        const indexFile = path.join(filePath, 'index.html');
        return fs.stat(indexFile, (ie, ist) => {
          if (ie || !ist.isFile()) return send404(res);
          streamFile(indexFile, res);
        });
      }

      if (stats.isFile()) return streamFile(filePath, res);
      send404(res);
    });
  } catch (e) {
    send404(res);
  }
});

function streamFile(fullPath, res) {
  const ext = path.extname(fullPath).toLowerCase();
  const ct = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': ct });
  const stream = fs.createReadStream(fullPath);
  stream.pipe(res);
  stream.on('error', () => send404(res));
}

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}/html/index.html`;
  console.log(`Static server: serving ./html on ${url}`);
  // Coba buka browser bawaan ke alamat ini (upaya terbaik, menyesuaikan platform)
  try {
    const { exec } = require('child_process');
    const openCommand = process.platform === 'win32'
      ? `cmd /c start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;
    exec(openCommand, (err) => {
      if (err) {
        // abaikan kesalahan; membuka browser hanya untuk kenyamanan
      }
    });
  } catch (e) {
    // abaikan jika ada error di sini
  }
});

// penghentian aman (graceful shutdown)
process.on('SIGINT', () => process.exit());
