import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PROTOTYPE_URL } from '../lib/links'

/**
 * The hero is still.
 *
 * No drift, no parallax, no cursor reactivity, no draggable cards. The connector lines draw
 * once on load and then rest forever, and exactly one element stays alive: the registration
 * counter. A system that is under control should look like one.
 */

type Source = {
  /** Position in the constellation, as a fraction of the container. */
  fx: number
  fy: number
  src: string
  value: string
  sub: string
  /** Rust is reserved for change and risk. Only one card earns it. */
  risk?: boolean
  live?: boolean
}

const SOURCES: Source[] = [
  { fx: 0.115, fy: 0.13, src: 'Eventbrite', value: '', sub: 'registered', live: true },
  { fx: 0.082, fy: 0.5, src: 'QuickBooks', value: '£89.2k', sub: 'against £86.0k plan' },
  { fx: 0.135, fy: 0.87, src: 'WhatsApp', value: 'Crew thread', sub: '14 items read in' },
  { fx: 0.885, fy: 0.13, src: 'Calendar', value: '41 days', sub: 'to doors' },
  { fx: 0.912, fy: 0.5, src: 'Sheets', value: 'Run of show', sub: 'v7 · 41 cues' },
  { fx: 0.865, fy: 0.87, src: 'Email', value: '3 unsigned', sub: 'vendor contracts', risk: true },
]

/** Where a line stops: the edge of an invisible ellipse around the headline, so type stays clean. */
function stopAtEllipse(dx: number, dy: number, rx: number, ry: number) {
  const t = 1 / Math.sqrt((dx / rx) ** 2 + (dy / ry) ** 2)
  return { x: dx * t, y: dy * t }
}

function useMeasure() {
  const ref = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setBox({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, box] as const
}

/** The one live element on the page. Irregular cadence — a real feed does not tick on a metronome. */
function useRegistrations(start: number) {
  const [n, setN] = useState(start)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer: number
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          setN((v) => v + 1 + Math.floor(Math.random() * 3))
          schedule()
        },
        6000 + Math.random() * 5000,
      )
    }
    schedule()
    return () => window.clearTimeout(timer)
  }, [])
  return n
}

function SourceCard({ s, registered }: { s: Source; registered: number }) {
  return (
    /* w-max: an absolutely positioned box shrink-to-fits against the *remaining* space, so
       without it the cards nearest the right edge wrap their value onto three lines. */
    <div
      className="card absolute z-20 w-max -translate-x-1/2 -translate-y-1/2 px-4 py-3"
      style={{ left: `${s.fx * 100}%`, top: `${s.fy * 100}%` }}
    >
      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[var(--color-faint)]">
        {s.live && <span className="ring-pulse inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />}
        Src · {s.src}
      </p>
      <p
        className={`num mt-1.5 text-[21px] font-semibold tracking-[-0.02em] ${
          s.risk ? 'text-[var(--color-risk)]' : ''
        }`}
      >
        {s.live ? registered.toLocaleString('en-GB') : s.value}
      </p>
      <p className="mt-0.5 text-[12px] text-[var(--color-muted)]">{s.sub}</p>
    </div>
  )
}

export function Hero() {
  const [ref, { w, h }] = useMeasure()
  const registered = useRegistrations(1842)

  const cx = w / 2
  const cy = h / 2
  // The ring has to clear the headline but still leave visible line on the flanks — the mid-left
  // and mid-right cards sit at the ellipse's widest point, so an rx much above this hides them.
  const rx = Math.min(w * 0.28, 345)
  const ry = Math.min(h * 0.34, 195)

  const lines = SOURCES.map((s) => {
    const px = s.fx * w
    const py = s.fy * h
    const dx = px - cx
    const dy = py - cy
    const stop = stopAtEllipse(dx, dy, rx, ry)
    const x2 = cx + stop.x
    const y2 = cy + stop.y
    const len = Math.hypot(px - x2, py - y2)
    return { x1: px, y1: py, x2, y2, len, risk: s.risk }
  })

  return (
    <section id="top" className="relative overflow-hidden px-6 pb-20 pt-14 sm:pb-24 sm:pt-20">
      <div ref={ref} className="relative mx-auto w-full max-w-[1240px] lg:min-h-[600px]">
        {/* Lines and cards are desktop-only — below lg the constellation becomes a source strip. */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          {w > 0 && (
            <svg width={w} height={h} className="absolute inset-0" aria-hidden>
              {lines.map((l, i) => (
                <line
                  key={i}
                  x1={l.x1}
                  y1={l.y1}
                  x2={l.x2}
                  y2={l.y2}
                  stroke={l.risk ? 'var(--color-accent)' : 'var(--color-faint)'}
                  strokeWidth={1}
                  strokeOpacity={l.risk ? 0.5 : 0.62}
                  className="connector"
                  style={{ ['--len' as string]: `${l.len}`, animationDelay: `${0.24 + i * 0.07}s` }}
                />
              ))}
            </svg>
          )}
        </div>
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          {SOURCES.map((s) => (
            <SourceCard key={s.src} s={s} registered={registered} />
          ))}
        </div>

        {/* The headline block sits inside the ring the lines stop at. */}
        <div className="relative z-30 flex min-h-[inherit] flex-col items-center justify-center text-center">
          <p className="eyebrow">Ops intelligence for events</p>
          <h1 className="display mt-6 max-w-[16ch] text-balance">Event operations, finally untangled.</h1>
          <p className="mt-6 max-w-[50ch] text-[16.5px] leading-relaxed text-[var(--color-ink-2)]">
            Brezel reads the tools you already use, standardises what they say, and shows you what a
            change actually breaks.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a className="btn btn-primary btn-lg" href={PROTOTYPE_URL}>
              Access prototype <span aria-hidden>→</span>
            </a>
            <a className="btn btn-ghost btn-lg" href="#standardise">
              See how it works
            </a>
          </div>
          <p className="num mt-5 text-[12.5px] text-[var(--color-muted)]">
            No signup · six steps · every step a real state change
          </p>
        </div>
      </div>

      {/* Below lg: the same sources, stacked and honest, rather than a broken constellation. */}
      <div className="mx-auto mt-12 grid max-w-[560px] grid-cols-2 gap-3 lg:hidden">
        {SOURCES.map((s) => (
          <div key={s.src} className="card px-3.5 py-3">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--color-faint)]">
              {s.live && <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />}
              Src · {s.src}
            </p>
            <p
              className={`num mt-1.5 text-[17px] font-semibold tracking-[-0.02em] ${
                s.risk ? 'text-[var(--color-risk)]' : ''
              }`}
            >
              {s.live ? registered.toLocaleString('en-GB') : s.value}
            </p>
            <p className="mt-0.5 text-[11.5px] text-[var(--color-muted)]">{s.sub}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
