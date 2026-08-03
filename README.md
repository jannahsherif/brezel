# Brezel — landing page

Marketing site for Brezel, ops intelligence for events. Cream, product-native: it shares the
design tokens of the P0 prototype so the hand-off from page to product has no visual seam.

```bash
npm install
npm run dev      # http://localhost:5181
npm run build    # → dist/
```

> The prototype's own dev server runs on **5180**. Both can run side by side.

## Structure

The page is three acts, one per product pillar.

| Section | Pillar | What it does |
|---|---|---|
| `sections/Hero.tsx` | — | Still by design. Connector lines draw once and rest; exactly one element stays live. |
| `sections/Normalizer.tsx` | Standardisation | Three unlike source formats dock into one schema. The grid never moves — only the label changes. |
| `sections/Reader.tsx` | Integration | Real ingested items; every extracted field cites the sentence it came from. One field cites a different sender's message. |
| `sections/Cascade.tsx` | Interconnection | Drag the keynote. Shifts, room conflicts and blast radius are computed live. |

## The rule

**Every number, name and outcome on this page is derived from the prototype's own data and logic —
never written as marketing copy.** `sections/Reader.tsx` lifts its items verbatim from the
prototype's `INGESTED` seed. `lib/cascade.ts` is a port of the prototype's `computeCascade` and cue
graph, and must stay in sync with it. If a claim can't be computed, it doesn't ship.

That constraint is why there are no invented customer logos and no unsourced statistics.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `VITE_PROTOTYPE_URL` | `http://localhost:5180` | Where the "Access prototype" buttons point. |

```bash
VITE_PROTOTYPE_URL=https://prototype.brezel.cc npm run build
```

See `.env.example`. Vite inlines the value at build time, so switching environments never needs a
code change.

## Stack

React 19 · TypeScript · Vite 7 · Tailwind 4. No UI framework and no animation library — the design
system is hand-built in `src/index.css` on the prototype's tokens, and all motion is CSS plus one
`requestAnimationFrame` loop in the cascade. Production bundle is ~72 kB gzipped.

## Accessibility

Every act has a designed static end state, not a frozen mid-animation frame — `prefers-reduced-motion`
skips the cascade's self-demo straight to its resolved state. The cue in Act III is a real
`role="slider"`: focusable, driven by <kbd>↑</kbd> <kbd>↓</kbd> and <kbd>Home</kbd>, with live
`aria-valuetext`.
