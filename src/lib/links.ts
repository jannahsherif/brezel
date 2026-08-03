/**
 * Where the "Access prototype" buttons send people.
 *
 * Set `VITE_PROTOTYPE_URL` at build time to point at the deployed P0 prototype — Vite inlines it,
 * so switching environments never needs a code change:
 *
 *   VITE_PROTOTYPE_URL=https://prototype.brezel.cc npm run build
 *
 * The fallback is the prototype's own dev server (Prototype/vite.config.ts pins 5180), so a local
 * checkout of both projects works with no configuration at all.
 */
export const PROTOTYPE_URL = import.meta.env.VITE_PROTOTYPE_URL || 'http://localhost:5180'
