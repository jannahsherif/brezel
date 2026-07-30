// Brezel — Static Landing Page Server
// No database
// No signups
// No login
// No user data storage

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
};

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);

  if (reqPath === '/') {
    reqPath = '/index.html';
  }

  const filePath = path.normalize(
    path.join(PUBLIC_DIR, reqPath)
  );

  // Prevent path traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {
        'Content-Type': 'text/plain',
      });
      return res.end('Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      'Content-Type':
        MIME_TYPES[ext] || 'application/octet-stream',
    });

    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    return serveStatic(req, res);
  }

  res.writeHead(405);
  res.end('Method Not Allowed');
});

server.listen(PORT, () => {
  console.log(`Brezel is running on port ${PORT}`);
});