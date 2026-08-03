import { useState } from 'react'

/**
 * Act II — Integration.
 *
 * Every item, excerpt and extracted field on this page is lifted verbatim from the product's
 * seed data (Prototype/src/data/seed.ts, INGESTED). Nothing here is written for the website.
 *
 * The argument builds in two moves:
 *   1. Brezel reads prose and produces typed fields, and every field cites the span it came from.
 *   2. The last field of the rehearsal item cites a *different message from a different sender* —
 *      which is the whole reason integration is a pillar rather than a feature.
 */

type Part = { text: string; ref?: string }

type Extracted = {
  label: string
  value: string
  /** Which span(s) in the excerpt this came from. */
  ref: string
  risk?: boolean
  /** Set when the citation points at another item entirely. */
  crossRef?: string
}

type Item = {
  id: string
  channel: 'Email' | 'Calendar' | 'Sheet'
  from: string
  subject: string
  at: string
  parts: Part[]
  extracted: Extracted[]
}

const ITEMS: Item[] = [
  {
    id: 'i1',
    channel: 'Email',
    from: 'noah@figandvine.example',
    subject: 'Re: Meridian — signed contract v3 attached',
    at: '30 Jul · 09:42',
    parts: [
      { text: 'Signed and returned.', ref: 'doc' },
      { text: ' Final headcount by ' },
      { text: '1 Oct', ref: 'deadline' },
      { text: ' please, and note we are holding ' },
      { text: '47 dietary requests as unconfirmed', ref: 'open' },
      { text: ' until the delegate list is final.' },
    ],
    extracted: [
      { label: 'Document', value: 'Catering contract v3', ref: 'doc' },
      { label: 'Deadline', value: 'Final headcount 2026-10-01', ref: 'deadline' },
      { label: 'Open item', value: '47 dietary requests unconfirmed', ref: 'open' },
    ],
  },
  {
    id: 'i5',
    channel: 'Email',
    from: 'ops@barbican.example',
    subject: 'Floor plan v7 — revised capacity',
    at: '28 Jul · 11:04',
    parts: [
      { text: 'Attached the revised plan.', ref: 'doc' },
      { text: ' Garden Room now seats ' },
      { text: '120', ref: 'change' },
      { text: ' theatre-style, down from ' },
      { text: '140', ref: 'change' },
      { text: ' after the fire officer walkthrough.' },
    ],
    extracted: [
      { label: 'Document', value: 'Barbican floor plan v7', ref: 'doc' },
      { label: 'Change', value: 'Garden Room capacity 140 → 120', ref: 'change' },
    ],
  },
  {
    id: 'i3',
    channel: 'Calendar',
    from: 'Google Calendar',
    subject: 'Technical rehearsal — Main Stage',
    at: '29 Jul · 09:15',
    parts: [
      { text: '13 Oct 14:00–18:00', ref: 'date' },
      { text: ', ' },
      { text: 'The Barbican', ref: 'loc' },
      { text: '. Attendees: Alex Morgan, Marta Nowak, Eli Turner.' },
    ],
    extracted: [
      { label: 'Date', value: '2026-10-13 14:00', ref: 'date' },
      { label: 'Location', value: 'The Barbican', ref: 'loc' },
      {
        label: 'Conflict',
        value: 'Dr Ayaan Rahim lands 2026-10-13 19:40',
        ref: 'date',
        risk: true,
        crossRef: 'i4',
      },
    ],
  },
  {
    id: 'i4',
    channel: 'Email',
    from: 'travel@meridianlive.co',
    subject: 'Speaker travel — Dr Ayaan Rahim',
    at: '28 Jul · 14:22',
    parts: [
      { text: 'Confirmed BA0284, arriving Heathrow ' },
      { text: '19:40 on 13 October', ref: 'arrival' },
      { text: '. ' },
      { text: 'Cannot make the afternoon rehearsal window.', ref: 'risk' },
    ],
    extracted: [
      { label: 'Arrival', value: '2026-10-13 19:40', ref: 'arrival' },
      { label: 'Risk', value: 'Speaker lands after rehearsal', ref: 'risk', risk: true },
    ],
  },
]

export function Reader() {
  const [activeId, setActiveId] = useState('i1')
  // The row you are on and the span it cites are tracked separately: two fields can legitimately
  // cite the same sentence, and outlining both of them when you hover one reads as a bug.
  const [onField, setOnField] = useState<string | null>(null)
  const item = ITEMS.find((i) => i.id === activeId)!
  const cited = item.extracted.find((f) => f.label === onField)?.ref ?? null
  const crossTarget = (id: string) => ITEMS.find((i) => i.id === id)

  return (
    <section id="integrate" className="border-t border-[var(--color-line)] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1140px]">
        <header className="reveal max-w-[48ch]" data-reveal>
          <p className="eyebrow">Pillar two · Integration</p>
          <h2 className="display-2 mt-5">The answer was already in your inbox.</h2>
          <p className="mt-5 text-[16px] leading-relaxed text-[var(--color-ink-2)]">
            Brezel connects read-only to the mailbox, calendar, sheets and threads you already run
            on, and turns what arrives into typed fields. Every field keeps a citation back to the
            sentence it came from.
          </p>
        </header>

        <div className="reveal mt-12 grid gap-5 lg:grid-cols-[300px_1fr]" data-reveal>
          {/* The feed. */}
          <div>
            <div className="flex items-center gap-2 px-1 py-[7px]">
              <span className="text-[13px] font-medium text-[var(--color-muted)]">Read in</span>
              <span className="h-px flex-1 bg-[var(--color-line)]" />
              <span className="num text-[11.5px] text-[var(--color-faint)]">4 of 162</span>
            </div>
            <div className="card mt-3 overflow-hidden">
              {ITEMS.map((it, i) => {
                const on = it.id === activeId
                return (
                  <button
                    key={it.id}
                    onClick={() => {
                      setActiveId(it.id)
                      setOnField(null)
                    }}
                    aria-current={on}
                    className={`block w-full px-4 py-3 text-left transition-colors ${
                      i > 0 ? 'border-t border-[var(--color-line-soft)]' : ''
                    } ${on ? 'bg-[var(--color-rail)]' : 'hover:bg-[#fbfaf7]'}`}
                  >
                    <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[var(--color-faint)]">
                      {it.channel} · {it.at}
                    </p>
                    <p
                      className={`mt-1 truncate text-[13px] ${
                        on ? 'font-medium text-[var(--color-ink)]' : 'text-[var(--color-ink-2)]'
                      }`}
                    >
                      {it.subject}
                    </p>
                    <p className="num mt-0.5 truncate text-[11.5px] text-[var(--color-muted)]">
                      {it.from}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* The reader: prose above, typed fields below, wired together by `cited`. */}
          <div className="card flex flex-col overflow-hidden">
            <div className="border-b border-[var(--color-line-soft)] px-6 py-5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[var(--color-faint)]">
                As it arrived · {item.channel}
              </p>
              <p key={item.id} className="value-in mt-3 text-[15px] leading-relaxed text-[var(--color-ink-2)]">
                {item.parts.map((p, i) =>
                  p.ref ? (
                    <span
                      key={i}
                      /* -mx cancels the px so the prose never reflows between cited states. */
                      className={`-mx-[3px] rounded-[3px] px-[3px] transition-colors duration-150 ${
                        cited === p.ref
                          ? 'bg-[var(--color-accent-soft)] text-[var(--color-ink)]'
                          : 'bg-transparent'
                      }`}
                    >
                      {p.text}
                    </span>
                  ) : (
                    <span key={i}>{p.text}</span>
                  ),
                )}
              </p>
            </div>

            <div className="plane-rail flex-1 px-6 py-5">
              <p className="mb-3 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[var(--color-faint)]">
                What Brezel read out of it
              </p>
              <div className="grid gap-2">
                {item.extracted.map((f, i) => {
                  const target = f.crossRef ? crossTarget(f.crossRef) : undefined
                  return (
                    <div
                      key={f.label}
                      className="value-in"
                      style={{ animationDelay: `${i * 0.09}s` }}
                      onMouseEnter={() => setOnField(f.label)}
                      onMouseLeave={() => setOnField(null)}
                    >
                      <button
                        onFocus={() => setOnField(f.label)}
                        onBlur={() => setOnField(null)}
                        onClick={() => target && (setActiveId(target.id), setOnField(null))}
                        className={`grid w-full grid-cols-1 items-baseline gap-x-3 gap-y-1 rounded-[9px] border bg-[var(--color-surface)] px-3.5 py-2.5 text-left transition-colors sm:grid-cols-[92px_1fr] sm:gap-y-0 ${
                          onField === f.label ? 'border-[var(--color-accent)]' : 'border-[var(--color-line)]'
                        }`}
                      >
                        <span className="text-[12px] text-[var(--color-muted)]">{f.label}</span>
                        <span className="min-w-0">
                          <span
                            className={`num block text-[13.5px] font-medium ${
                              f.risk ? 'text-[var(--color-risk)]' : ''
                            }`}
                          >
                            {f.value}
                          </span>
                          {target && (
                            <span className="mt-1 block text-[11.5px] text-[var(--color-muted)]">
                              cited from{' '}
                              <span className="text-[var(--color-accent)] underline underline-offset-2">
                                {target.subject}
                              </span>{' '}
                              — a different sender
                            </span>
                          )}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* The payoff. Two messages nobody had put side by side. */}
        <div className="reveal card mt-5 overflow-hidden" data-reveal>
          <div className="grid gap-px bg-[var(--color-line-soft)] md:grid-cols-[1fr_1fr_auto]">
            <div className="bg-[var(--color-surface)] px-6 py-5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[var(--color-faint)]">
                Calendar · 29 Jul
              </p>
              <p className="num mt-2 text-[15px] font-medium">Rehearsal ends 18:00</p>
              <p className="mt-1 text-[12.5px] text-[var(--color-muted)]">13 Oct, Main Stage</p>
            </div>
            <div className="bg-[var(--color-surface)] px-6 py-5">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[var(--color-faint)]">
                Email · 28 Jul
              </p>
              <p className="num mt-2 text-[15px] font-medium">Speaker lands 19:40</p>
              <p className="mt-1 text-[12.5px] text-[var(--color-muted)]">13 Oct, Heathrow</p>
            </div>
            <div className="flex items-center bg-[var(--color-surface)] px-6 py-5">
              <span className="pill bg-[var(--color-risk-soft)] text-[var(--color-risk)]">
                Lands 1h40 after the rehearsal ends
              </span>
            </div>
          </div>
        </div>

        <p className="reveal mt-6 max-w-[62ch] text-[14px] leading-relaxed text-[var(--color-ink-2)]" data-reveal>
          Two messages, two senders, sent a day apart. Neither is wrong and nobody missed anything —
          they simply never sat on the same screen. That is the failure Brezel is built to remove.
        </p>

        <Sources />
      </div>
    </section>
  )
}

/** P0.1 — zero-migration ingestion. Read-only, and the source stays the source. */
const CONNECTIONS = [
  { label: 'Event mailbox', detail: 'A per-event address. Teams forward or BCC; threads land against the event.' },
  { label: 'Google Calendar', detail: 'Read-only sync.' },
  { label: 'WhatsApp Business', detail: 'Supplier and crew threads — where most of the decisions actually happen.' },
  { label: 'Google Sheets', detail: 'Mirrors the sheet and keeps it as the source. Nothing is moved.' },
  { label: 'Google Drive', detail: 'Contracts, floor plans and decks, read into the event.' },
  { label: 'Outlook Calendar', detail: 'Microsoft 365, read-only sync.' },
]

function Sources() {
  return (
    <div className="reveal mt-14" data-reveal>
      <div className="flex items-center gap-3">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em]">Read-only. Nothing migrates.</h3>
        <span className="h-px flex-1 bg-[var(--color-line)]" />
      </div>
      <p className="mt-3 max-w-[56ch] text-[14px] leading-relaxed text-[var(--color-ink-2)]">
        No one has to move their work into Brezel for Brezel to be useful on day one. Your sheet
        stays your sheet.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CONNECTIONS.map((c) => (
          <div key={c.label} className="card px-4 py-4">
            <p className="text-[13.5px] font-medium">{c.label}</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--color-muted)]">{c.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
