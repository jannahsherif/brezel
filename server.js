// Brezel — very simple backend
// - Serves the static site from /public
// - POST /api/signup  -> stores {name, email} in a local SQLite database
//                         and replies with a short personalized welcome message
// - GET  /api/signups  -> lists everyone who has signed up (handy for checking storage worked)
//
// No external dependencies: uses Node's built-in http server and its
// built-in SQLite module (node:sqlite), so `npm install` isn't even required.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DB_PATH = path.join(__dirname, 'signups.db');

// ---------- Database ----------
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insertSignup = db.prepare(
  'INSERT INTO signups (name, email) VALUES (?, ?)'
);
const listSignups = db.prepare(
  'SELECT id, name, email, created_at FROM signups ORDER BY id DESC'
);
const findByEmail = db.prepare(
  'SELECT id, name, email FROM signups WHERE email = ?'
);

// ---------- Helpers ----------
function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = '';
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > 1e6) { // 1MB safety cap
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks += chunk;
    });
    req.on('end', () => {
      if (!chunks) return resolve({});
      try {
        resolve(JSON.parse(chunks));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function welcomeMessage(name) {
  return `Welcome, ${name}! Thanks for signing up for Brezel, we're excited to have you on board. Great things are getting baked.`;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json',
};

function serveStatic(req, res) {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  const filePath = path.normalize(path.join(PUBLIC_DIR, reqPath));

  // Prevent path traversal outside of /public
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// ---------- Server ----------
const server = http.createServer(async (req, res) => {
  // --- API routes ---
  if (req.url === '/api/signup' && req.method === 'POST') {
    try {
      const { name, email } = await readJsonBody(req);

      if (!name || !name.trim() || !email || !email.trim()) {
        return sendJson(res, 400, { error: 'Name and email are both required.' });
      }
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(cleanEmail)) {
        return sendJson(res, 400, { error: 'That email address doesn\'t look right.' });
      }

      const existing = findByEmail.get(cleanEmail);
      if (existing) {
        return sendJson(res, 200, {
          message: `Welcome back, ${existing.name}! You're already signed up with us.`,
        });
      }

      insertSignup.run(cleanName, cleanEmail);
      return sendJson(res, 201, { message: welcomeMessage(cleanName) });
    } catch (err) {
      return sendJson(res, 400, { error: err.message || 'Something went wrong.' });
    }
  }

  if (req.url === '/api/signin' && req.method === 'POST') {
    try {
      const { email } = await readJsonBody(req);

      if (!email || !email.trim()) {
        return sendJson(res, 400, { error: 'Email is required.' });
      }
      const cleanEmail = email.trim().toLowerCase();

      const existing = findByEmail.get(cleanEmail);
      if (!existing) {
        return sendJson(res, 404, {
          error: "We couldn't find an account with that email. Sign up first!",
        });
      }

      return sendJson(res, 200, {
        message: `Good to see you again, ${existing.name}!`,
      });
    } catch (err) {
      return sendJson(res, 400, { error: err.message || 'Something went wrong.' });
    }
  }

  if (req.url === '/api/signups' && req.method === 'GET') {
    const rows = listSignups.all();
    return sendJson(res, 200, { count: rows.length, signups: rows });
  }

  // --- Static files (the site itself) ---
  if (req.method === 'GET') {
    return serveStatic(req, res);
  }

  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Brezel is running at http://localhost:${PORT}`);
  console.log(`Signups are stored in ${DB_PATH}`);
});
