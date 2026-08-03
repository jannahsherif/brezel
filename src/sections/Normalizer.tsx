import { useState } from 'react'

/**
 * Act I — Standardisation.
 *
 * The argument: three formats that look nothing alike arrive on three different channels, and
 * come out as the same object. The proof is that the field grid on the right never moves — only
 * its values change. Straight out of the product's own constraint:
 * "EventRecord.format is a display label only. Nothing in this model branches on it."
 */

type Field = { label: string; value: string; unresolved?: boolean }

type Format = {
  id: string
  tab: string
  channel: string
  variant: 'email' | 'sheet' | 'whatsapp'
  fields: Field[]
}

const FORMATS: Format[] = [
  {
    id: 'gala',
    tab: 'Charity gala',
    channel: 'Email',
    variant: 'email',
    fields: [
      { label: 'Name', value: 'Foundation Annual Dinner' },
      { label: 'Client', value: 'Hartwell Foundation' },
      { label: 'Date', value: '2026-10-14' },
      { label: 'Venue', value: 'Corinthia Ballroom' },
      { label: 'City', value: 'London' },
      { label: 'Format', value: 'Charity gala' },
      { label: 'Producer', value: 'Priya Raman' },
      { label: 'Attendance', value: '287 / 320' },
    ],
  },
  {
    id: 'conference',
    tab: 'Conference',
    channel: 'Google Sheets',
    variant: 'sheet',
    fields: [
      { label: 'Name', value: "DevSummit '26" },
      { label: 'Client', value: 'Meridian Software' },
      { label: 'Date', value: '2026-11-03' },
      { label: 'Venue', value: 'Hall B, Messe Berlin' },
      { label: 'City', value: 'Berlin' },
      { label: 'Format', value: 'Conference' },
      { label: 'Producer', value: 'M. Oduya' },
      { label: 'Attendance', value: '1,842 / 2,000' },
    ],
  },
  {
    id: 'tradeshow',
    tab: 'Trade show',
    channel: 'WhatsApp',
    variant: 'whatsapp',
    fields: [
      // Nobody ever said what it was called. Brezel does not invent it — it asks.
      { label: 'Name', value: 'Needs a name', unresolved: true },
      { label: 'Client', value: 'Bauer Industrie GmbH' },
      { label: 'Date', value: '2026-09-22' },
      { label: 'Venue', value: 'ExCeL, North Hall' },
      { label: 'City', value: 'London' },
      { label: 'Format', value: 'Trade show' },
      { label: 'Producer', value: 'Tomas K.' },
      { label: 'Attendance', value: '3,410 / 4,000' },
    ],
  },
]

function Mark({ children }: { children: React.ReactNode }) {
  return <mark className="rounded-[3px] bg-[var(--color-accent-soft)] px-[3px] text-inherit">{children}</mark>
}

function RawEmail() {
  return (
    <div className="text-[13.5px] leading-relaxed text-[var(--color-ink-2)]">
      <div className="mb-4 space-y-1 border-b border-[var(--color-line-soft)] pb-3 text-[12px] text-[var(--color-muted)]">
        <p>
          <span className="text-[var(--color-faint)]">From&nbsp;&nbsp;</span> j.mbeki@hartwellfoundation.org
        </p>
        <p>
          <span className="text-[var(--color-faint)]">Subject</span> Re: 14 Oct — final numbers
        </p>
      </div>
      <p>
        Confirming the <Mark>Foundation Annual Dinner</Mark> on <Mark>14 October</Mark>. We&rsquo;re in
        the <Mark>Corinthia Ballroom</Mark>, <Mark>London</Mark>. Sit-down capacity is{' '}
        <Mark>320</Mark> and we&rsquo;re at <Mark>287</Mark> confirmed. <Mark>Priya</Mark> is producing
        from your side.
      </p>
      <p className="mt-3 text-[var(--color-muted)]">Best, J</p>
    </div>
  )
}

const SHEET_ROWS: [string, string][] = [
  ['EVENT_NAME', "DevSummit '26"],
  ['CLIENT', 'Meridian Software'],
  ['START', '2026-11-03'],
  ['LOCATION', 'Hall B, Messe Berlin'],
  ['CITY', 'Berlin'],
  ['CAP', '2000'],
  ['REG', '1842'],
  ['OWNER', 'M. Oduya'],
]

function RawSheet() {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[var(--color-line)]">
      {SHEET_ROWS.map(([k, v], i) => (
        <div
          key={k}
          className={`grid grid-cols-[126px_1fr] ${i > 0 ? 'border-t border-[var(--color-line-soft)]' : ''}`}
        >
          <div className="num border-r border-[var(--color-line-soft)] bg-[var(--color-rail)] px-3 py-2 text-[11.5px] text-[var(--color-muted)]">
            {k}
          </div>
          <div className="num px-3 py-2 text-[12.5px]">{v}</div>
        </div>
      ))}
    </div>
  )
}

const CHAT: { who: string; at: string; text: React.ReactNode; me?: boolean }[] = [
  { who: 'Tomas', at: '08:14', text: <>ok we&rsquo;re locked for the 22nd</> },
  { who: 'Tomas', at: '08:14', text: <>ExCeL, north hall</> },
  { who: 'Ops', at: '08:31', text: <>client side it&rsquo;s Bauer Industrie GmbH, contract sits with them</>, me: true },
  { who: 'Tomas', at: '08:33', text: <>expecting 4,000 over the two days, 3,410 registered so far</> },
  { who: 'Tomas', at: '08:33', text: <>I&rsquo;m producing</> },
]

function RawChat() {
  return (
    <div className="space-y-2">
      {CHAT.map((m, i) => (
        <div key={i} className={`flex ${m.me ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[86%] rounded-[12px] px-3 py-2 text-[13px] leading-snug ${
              m.me
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-ink)]'
                : 'bg-[var(--color-rail)] text-[var(--color-ink-2)]'
            }`}
          >
            {m.text}
            <span className="num ml-2 text-[10.5px] text-[var(--color-faint)]">{m.at}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Normalizer() {
  const [active, setActive] = useState(0)
  const fmt = FORMATS[active]

  return (
    <section id="standardise" className="border-t border-[var(--color-line)] px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1140px]">
        <header className="reveal max-w-[46ch]" data-reveal>
          <p className="eyebrow">Pillar one · Standardisation</p>
          <h2 className="display-2 mt-5">A gala, a conference and a trade show are the same object.</h2>
          <p className="mt-5 text-[16px] leading-relaxed text-[var(--color-ink-2)]">
            Every tool in the stack disagrees about what an event <em>is</em>. Brezel doesn&rsquo;t.
            One schema, filled from whatever turns up, on whatever channel it turns up on.
          </p>
        </header>

        <div className="reveal mt-12 grid gap-5 lg:grid-cols-[1fr_1fr]" data-reveal>
          {/* Left: what actually arrived. Different every time. */}
          <div>
            <div
              className="flex flex-wrap gap-1.5"
              role="tablist"
              aria-label="Choose an incoming event format"
            >
              {FORMATS.map((f, i) => (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={`btn text-[13px] ${
                    i === active
                      ? 'bg-[var(--color-ink)] text-white'
                      : 'btn-ghost text-[var(--color-ink-2)]'
                  }`}
                >
                  {f.tab}
                </button>
              ))}
            </div>

            <div className="card mt-3 min-h-[352px] p-5">
              <p className="mb-4 text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[var(--color-faint)]">
                Arrived on · {fmt.channel}
              </p>
              <div key={fmt.id} className="value-in">
                {fmt.variant === 'email' && <RawEmail />}
                {fmt.variant === 'sheet' && <RawSheet />}
                {fmt.variant === 'whatsapp' && <RawChat />}
              </div>
            </div>
          </div>

          {/* Right: the object. The grid never moves — that is the entire point. */}
          <div>
            <div className="flex items-center gap-2 px-1 py-[7px]">
              <span className="text-[13px] font-medium text-[var(--color-muted)]">The event object</span>
              <span className="h-px flex-1 bg-[var(--color-line)]" />
              <span className="num text-[11.5px] text-[var(--color-faint)]">8 fields · unchanged</span>
            </div>

            <div className="card mt-3 min-h-[352px] overflow-hidden">
              {fmt.fields.map((f, i) => (
                <div
                  key={f.label}
                  className={`grid grid-cols-[104px_1fr] items-baseline px-5 py-[13px] ${
                    i > 0 ? 'border-t border-[var(--color-line-soft)]' : ''
                  }`}
                >
                  <span className="text-[12.5px] text-[var(--color-muted)]">{f.label}</span>
                  {f.unresolved ? (
                    <span className="pill w-fit bg-[var(--color-risk-soft)] text-[var(--color-risk)]">
                      {f.value}
                    </span>
                  ) : (
                    <span key={fmt.id} className="num value-in text-[13.5px] font-medium">
                      {f.value}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="reveal num mt-6 max-w-[64ch] text-[12.5px] leading-relaxed text-[var(--color-muted)]" data-reveal>
          <span className="text-[var(--color-faint)]">// </span>
          format is a display label. Nothing in the model branches on it — which is why a dinner for
          287 and a two-day expo for 4,000 need no separate product.
        </p>
      </div>
    </section>
  )
}
