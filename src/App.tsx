import { Nav } from './components/Nav'
import { Hero } from './sections/Hero'
import { Normalizer } from './sections/Normalizer'
import { Reader } from './sections/Reader'
import { Cascade } from './sections/Cascade'
import { useReveal } from './lib/useReveal'
import { Mark } from './components/Wordmark'

export function App() {
  useReveal()

  return (
    <>
      <div className="grain" aria-hidden />
      <Nav />
      <main>
        <Hero />
        <Normalizer />
        <Reader />
        <Cascade />
      </main>
      <footer id="contact" className="border-t border-[var(--color-line)] px-6 py-10">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-[var(--color-muted)]">
            <Mark size={17} className="text-[var(--color-faint)]" />
            <span className="text-[13.5px]">Something&rsquo;s baking. Stay tuned.</span>
          </div>
          {/* Contact sits with the copyright, in the same quiet grey — it is a footnote, not a CTA. */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[var(--color-faint)]">
            <a
              href="mailto:hello@brezel.cc"
              className="num text-[12.5px] underline-offset-2 transition-colors hover:text-[var(--color-accent)] hover:underline"
            >
              hello@brezel.cc
            </a>
            <a
              href="https://www.linkedin.com/company/brezelcc/about/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Brezel on LinkedIn"
              className="grid h-7 w-7 place-items-center rounded-[8px] border border-[var(--color-line)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden>
                <path d="M6.94 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 8.48H3V21h4zM13.32 8.48H9.34V21h3.92v-6.57c0-3.66 4.77-3.96 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91z" />
              </svg>
            </a>
            <p className="num text-[12.5px]">© 2026 Brezel</p>
          </div>
        </div>
      </footer>
    </>
  )
}
