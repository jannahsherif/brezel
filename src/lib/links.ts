/**
 * Where the "Access prototype" buttons send people.
 *
 * The landing page and the prototype share one origin — brezel.cc serves this page at /,
 * and the front-door Worker in the (private) prototype repo owns /login and /app. So this
 * is a plain same-origin path, not a cross-domain URL: no env var, no build-time config.
 *
 * The gate itself lives at /login. Nothing here decides who gets in.
 *
 * Locally the two projects run on separate Vite ports, so `npm run dev` on this page will
 * 404 on /login. Use `npm run preview:worker` in the prototype repo to exercise the real
 * routing, which serves both halves on one port exactly as production does.
 */
export const PROTOTYPE_URL = '/login'
