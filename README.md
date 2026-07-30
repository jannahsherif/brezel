# Brezel — signup backend

A very small backend wired into your Brezel landing page:

- **Sign up** (nav button or the CTA at the bottom of the page) opens a form for
  name + email. Submitting it stores the person in a local SQLite database and
  shows a short, personalized welcome message.
- **Book a demo** (nav link or the CTA button) shows a "Demo coming soon — stay
  tuned!" message instead.
- **Sign in** (nav link) asks for the email you signed up with, checks it
  against the database, and welcomes you back — or tells you to sign up first
  if it doesn't recognize the email.

## Run it

You need [Node.js](https://nodejs.org) 22.5 or newer (for the built-in SQLite
support — no `npm install` required, there are zero dependencies).

```bash
node server.js
```

Then open **http://localhost:3000** in your browser.

A file called `signups.db` will be created automatically the first time
someone signs up — that's your database. You can peek at everyone who's
signed up any time at:

```
http://localhost:3000/api/signups
```

## What's inside

```
brezel-app/
├── server.js          # the backend: static file server + signup API
├── package.json
├── public/
│   ├── index.html      # your landing page, with signup/demo wired up
│   └── uploads/
│       └── brezel_logo_gradient_ready.svg
└── signups.db          # created automatically once someone signs up
```

### API

**POST `/api/signup`**
Body: `{ "name": "Ada Lovelace", "email": "ada@example.com" }`
Response: `{ "message": "Welcome, Ada Lovelace! ..." }`

Signing up twice with the same email won't create a duplicate row — it just
returns a friendly "welcome back" message.

**POST `/api/signin`**
Body: `{ "email": "ada@example.com" }`
Response: `{ "message": "Good to see you again, Ada Lovelace!" }`, or a 404 with an
error if that email hasn't signed up yet.

**GET `/api/signups`**
Returns everyone stored so far — useful for checking that storage is working.

## Notes on the HTML

Your uploaded file (`Brezel Landing.dc.html`) was exported from a design tool
in a proprietary format that needs that tool's own JavaScript runtime (React +
a custom `DCLogic` class system) to render. I converted it into a plain,
dependency-free HTML/CSS/JS page that looks and behaves the same — same
colors, type, hero animation, drag-able cards, scroll reveals — but runs
anywhere with just a browser, and now includes the sign up/demo logic. The
only other page in your zip (`Brezel Deck.dc.html`) wasn't touched since your
request was about the landing page's signup and demo flows.
