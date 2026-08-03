import { useCallback, useEffect, useRef, useState } from 'react'
import { CUES, ROOMS, VENDORS, computeCascade, shiftTime, toMin } from '../lib/cascade'

/**
 * Act III — Interconnection.
 *
 * It demonstrates itself once, resets, and hands you the cue. No pinning, no scroll-jacking:
 * the visitor's scroll always does what they expect, and the only thing that moves on its own
 * is the one demonstration.
 *
 * Every number in the impact panel comes from computeCascade over the product's real cue graph.
 * Nothing is written down as a fact about the outcome — it is all derived from the drag.
 */

const DAY_START = toMin('10:00')
// 14:30 is the latest anything can land: the last cue ends 14:00, and MAX_DELTA pushes the
// keynote chain's tail to 14:15. Any more than this is dead board.
const DAY_END = toMin('14:30')
const PPM = 2 // pixels per minute
const BOARD_H = (DAY_END - DAY_START) * PPM
const SNAP = 5
const MIN_DELTA = -30
const MAX_DELTA = 60
const DEMO_DELTA = 40

const KEYNOTE = 'c1'

const topFor = (hhmm: string) => (toMin(hhmm) - DAY_START) * PPM
const clampSnap = (v: number) => Math.max(MIN_DELTA, Math.min(MAX_DELTA, Math.round(v / SNAP) * SNAP))

const HOURS = ['10:00', '11:00', '12:00', '13:00', '14:00']

export function Cascade() {
  const sectionRef = useRef<HTMLElement>(null)
  const [delta, setDelta] = useState(0)
  const [handedOver, setHandedOver] = useState(false)
  const [dragging, setDragging] = useState(false)
  /** Set the moment the visitor takes hold, so the demo never fights them for the cue. */
  const seized = useRef(false)

  // One self-demonstration, on first sight.
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let hold = 0

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()

        if (reduced) {
          // The end state has to carry the argument on its own.
          setDelta(DEMO_DELTA)
          setHandedOver(true)
          return
        }

        const ease = (t: number) => 1 - Math.pow(1 - t, 3)
        const run = (from: number, to: number, ms: number, then: () => void) => {
          const t0 = performance.now()
          const step = (now: number) => {
            if (seized.current) return
            const t = Math.min(1, (now - t0) / ms)
            setDelta(clampSnap(from + (to - from) * ease(t)))
            if (t < 1) raf = requestAnimationFrame(step)
            else then()
          }
          raf = requestAnimationFrame(step)
        }

        run(0, DEMO_DELTA, 950, () => {
          hold = window.setTimeout(() => {
            if (seized.current) return
            run(DEMO_DELTA, 0, 620, () => setHandedOver(true))
          }, 2300)
        })
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      window.clearTimeout(hold)
    }
  }, [])

  // The live drag flag is a ref, not state: a pointermove that lands in the same frame as the
  // pointerdown would read a stale `dragging` from the closure and be dropped on the floor.
  const drag = useRef({ y0: 0, d0: 0, on: false })
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      seized.current = true
      setHandedOver(true)
      setDragging(true)
      drag.current = { y0: e.clientY, d0: delta, on: true }
      // Capture keeps the drag alive when the cursor leaves the block. If the pointer is already
      // gone the browser throws — losing capture is survivable, losing the drag is not.
      try {
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      } catch {
        /* no capture; pointermove on the block still tracks */
      }
    },
    [delta],
  )
  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.on) return
    setDelta(clampSnap(drag.current.d0 + (e.clientY - drag.current.y0) / PPM))
  }, [])
  const endDrag = useCallback(() => {
    drag.current.on = false
    setDragging(false)
  }, [])

  /** Keyboard is a first-class way to move the cue, not an afterthought. */
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'Home') return
    e.preventDefault()
    seized.current = true
    setHandedOver(true)
    if (e.key === 'Home') return setDelta(0)
    setDelta((d) => clampSnap(d + (e.key === 'ArrowDown' ? SNAP : -SNAP)))
  }, [])

  const result = computeCascade(CUES, KEYNOTE, delta)
  const active = delta !== 0
  const movedIds = new Set(result.moved.map((m) => m.cue.id))
  const conflictIds = new Set(result.conflicts.flatMap((c) => [c.a.id, c.b.id]))
  /**
   * A clash is two blocks occupying the same minutes, so stacking them hides the very thing the
   * section exists to show. Split the pair left/right the way a calendar does — then the overlap
   * is a shape you can see rather than a number you have to read.
   */
  const lane = new Map<string, 0 | 1>()
  for (const c of result.conflicts) {
    lane.set(c.a.id, 0)
    lane.set(c.b.id, 1)
  }
  const startOf = (id: string, original: string) => (movedIds.has(id) ? shiftTime(original, delta) : original)

  // The dependency chain, drawn as one rail down the room it lives in.
  const chain = result.moved.filter((m) => m.cue.room === 'Main Stage')
  const chainTop = chain.length ? topFor(startOf(chain[0].cue.id, chain[0].cue.start)) : 0
  const chainEnd = chain.length
    ? topFor(startOf(chain[chain.length - 1].cue.id, chain[chain.length - 1].cue.start)) +
      chain[chain.length - 1].cue.durationMin * PPM
    : 0

  return (
    <section
      ref={sectionRef}
      id="cascade"
      className="border-t border-[var(--color-line)] px-6 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1140px]">
        <header className="reveal max-w-[50ch]" data-reveal>
          <p className="eyebrow">Pillar three · Interconnection</p>
          <h2 className="display-2 mt-5">Move one thing. See everything it touches.</h2>
          <p className="mt-5 text-[16px] leading-relaxed text-[var(--color-ink-2)]">
            This is the run of show for a real event in the prototype. Drag the keynote and Brezel
            walks the dependency graph for you — what shifts, what collides, and who has to be told.
          </p>
        </header>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_356px]">
          {/* The board. */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--color-line-soft)] px-5 py-3.5">
              <div className="flex items-baseline gap-2.5">
                <span className="text-[13px] font-medium">Run of show</span>
                <span className="num text-[11.5px] text-[var(--color-faint)]">
                  v7 · 15 cues · 3 rooms
                </span>
              </div>
              <span
                className={`pill transition-colors ${
                  active
                    ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                    : 'bg-[#f0ede6] text-[var(--color-muted)]'
                }`}
              >
                <span className="num">
                  {delta > 0 ? '+' : ''}
                  {delta} min
                </span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[540px] px-5 pb-5 pt-3">
                <div className="grid grid-cols-[46px_repeat(3,1fr)] gap-x-2">
                  <div />
                  {ROOMS.map((r) => (
                    <div
                      key={r}
                      className="pb-2 text-[11px] font-semibold uppercase tracking-[0.11em] text-[var(--color-faint)]"
                    >
                      {r}
                    </div>
                  ))}
                </div>

                <div className="relative grid grid-cols-[46px_repeat(3,1fr)] gap-x-2" style={{ height: BOARD_H }}>
                  {/* Time gutter. */}
                  <div className="relative">
                    {HOURS.map((h) => (
                      <span
                        key={h}
                        className="num absolute right-1 -translate-y-1/2 text-[11px] text-[var(--color-faint)]"
                        style={{ top: topFor(h) }}
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {ROOMS.map((room) => (
                    <div key={room} className="relative">
                      {/* Hour rules, behind everything. */}
                      {HOURS.map((h) => (
                        <span
                          key={h}
                          className="absolute inset-x-0 h-px bg-[var(--color-line-soft)]"
                          style={{ top: topFor(h) }}
                        />
                      ))}

                      {room === 'Main Stage' && active && (
                        <span
                          className="absolute -left-1.5 w-[2px] rounded-full bg-[var(--color-accent)] opacity-70"
                          style={{ top: chainTop, height: Math.max(0, chainEnd - chainTop) }}
                          aria-hidden
                        />
                      )}

                      {CUES.filter((c) => c.room === room).map((c) => {
                        const isMoved = active && movedIds.has(c.id)
                        const isConflict = conflictIds.has(c.id)
                        const isKeynote = c.id === KEYNOTE
                        const start = startOf(c.id, c.start)
                        return (
                          <div key={c.id}>
                            {/* Where it used to be — only for the cue you actually moved. Ghosting
                                the whole chain buries the board in dashed boxes. */}
                            {isMoved && isKeynote && (
                              <span
                                className="absolute inset-x-0 rounded-[8px] border border-dashed border-[var(--color-faint)] opacity-60"
                                style={{ top: topFor(c.start), height: c.durationMin * PPM - 3 }}
                                aria-hidden
                              />
                            )}
                            <div
                              onPointerDown={isKeynote ? onPointerDown : undefined}
                              onPointerMove={isKeynote ? onPointerMove : undefined}
                              onPointerUp={isKeynote ? endDrag : undefined}
                              onPointerCancel={isKeynote ? endDrag : undefined}
                              onKeyDown={isKeynote ? onKeyDown : undefined}
                              role={isKeynote ? 'slider' : undefined}
                              tabIndex={isKeynote ? 0 : undefined}
                              aria-label={isKeynote ? 'Opening keynote start time' : undefined}
                              aria-valuemin={isKeynote ? MIN_DELTA : undefined}
                              aria-valuemax={isKeynote ? MAX_DELTA : undefined}
                              aria-valuenow={isKeynote ? delta : undefined}
                              aria-valuetext={isKeynote ? `${start}, ${delta} minutes from plan` : undefined}
                              className={`absolute overflow-hidden rounded-[8px] border px-2.5 py-1.5 ${
                                dragging && isKeynote
                                  ? ''
                                  : 'transition-[top,left,right,background-color,border-color] duration-200'
                              } ${
                                isConflict
                                  ? 'border-[var(--color-risk)] bg-[var(--color-risk-soft)]'
                                  : isMoved
                                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                                    : 'border-[var(--color-line)] bg-[var(--color-surface)]'
                              } ${isKeynote ? 'cursor-grab touch-none select-none active:cursor-grabbing' : ''} ${
                                c.owner === null ? 'border-l-2 border-l-[var(--color-risk)]' : ''
                              }`}
                              style={{
                                top: topFor(start),
                                height: c.durationMin * PPM - 3,
                                left: lane.get(c.id) === 1 ? '36%' : 0,
                                right: lane.get(c.id) === 0 ? '36%' : 0,
                              }}
                            >
                              <p className="num flex items-center gap-1.5 text-[10.5px] text-[var(--color-muted)]">
                                {isKeynote && (
                                  <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                                )}
                                {start}
                              </p>
                              <p className="truncate text-[11.5px] font-medium leading-tight">{c.title}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="border-t border-[var(--color-line-soft)] px-5 py-3 text-[12px] text-[var(--color-muted)]">
              {handedOver ? (
                <>
                  <span className="font-medium text-[var(--color-ink-2)]">Now you try.</span> Drag
                  the keynote, or focus it and use ↑ ↓.
                </>
              ) : (
                'Watching Brezel move the keynote…'
              )}
            </p>
          </div>

          {/* The impact panel — everything here is derived, nothing is asserted. */}
          <div className="card flex flex-col overflow-hidden">
            <div className="border-b border-[var(--color-line-soft)] px-5 py-3.5">
              <span className="text-[13px] font-medium">What this change breaks</span>
            </div>

            {!active ? (
              <div className="flex flex-1 items-center px-5 py-8">
                <p className="text-[13px] leading-relaxed text-[var(--color-muted)]">
                  Nothing yet — the schedule is on plan. Move the keynote and this fills in.
                </p>
              </div>
            ) : (
              <div className="flex-1 divide-y divide-[var(--color-line-soft)]">
                <Row label="Cues that shift">
                  <p className="num text-[19px] font-semibold">{result.moved.length}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-muted)]">
                    {result.moved.map((m) => m.cue.title).join(', ')}
                  </p>
                </Row>

                <Row label="Conflicts created">
                  <p
                    className={`num text-[19px] font-semibold ${
                      result.conflicts.length ? 'text-[var(--color-risk)]' : ''
                    }`}
                  >
                    {result.conflicts.length}
                  </p>
                  {result.conflicts.map((c) => (
                    <p key={c.a.id + c.b.id} className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-2)]">
                      <span className="num">{c.room}</span> — {c.a.title} now overruns{' '}
                      {c.b.title}
                      {c.b.owner === null && (
                        <span className="pill ml-1.5 bg-[var(--color-risk-soft)] text-[var(--color-risk)]">
                          no owner
                        </span>
                      )}
                    </p>
                  ))}
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-[var(--color-faint)]">
                    Clashes that already existed are excluded — they are not this change&rsquo;s
                    fault.
                  </p>
                </Row>

                <Row label="Vendors affected">
                  <p className="num text-[19px] font-semibold">{result.vendorIds.length}</p>
                  <div className="mt-2 grid gap-1.5">
                    {result.vendorIds.map((id) => {
                      const v = VENDORS[id]
                      return (
                        <div key={id} className="flex items-baseline justify-between gap-3">
                          <span className="text-[12.5px]">
                            {v.contact}{' '}
                            <span className="text-[var(--color-muted)]">· {v.name}</span>
                          </span>
                          <span className="pill shrink-0 bg-[var(--color-risk-soft)] text-[var(--color-risk)]">
                            no account
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--color-faint)]">
                    None of them can be reached by asking them to log in. They get a scoped link
                    instead.
                  </p>
                </Row>
              </div>
            )}

            <div className="plane-rail border-t border-[var(--color-line-soft)] px-5 py-4">
              <p className="text-[12px] leading-relaxed text-[var(--color-ink-2)]">
                Brezel does not send any of this for you. It shows you the blast radius, drafts the
                message, and waits — then writes the decision to a change log that cannot be edited.
              </p>
            </div>
          </div>
        </div>

        <p className="reveal mt-6 max-w-[64ch] text-[14px] leading-relaxed text-[var(--color-ink-2)]" data-reveal>
          A calendar would have moved one block. The second-order effects — a room double-booked, a
          cue nobody owns, three suppliers who need to hear about it today — are the actual job, and
          they are what nothing else in this stack computes.
        </p>
      </div>
    </section>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4">
      <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[var(--color-faint)]">
        {label}
      </p>
      {children}
    </div>
  )
}
