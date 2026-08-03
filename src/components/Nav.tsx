import { useEffect, useState } from 'react'
import { Wordmark } from './Wordmark'
import { PROTOTYPE_URL } from '../lib/links'

/** Sticky, quiet. The hairline is the only thing that ever changes. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 bg-[var(--color-canvas)]/85 backdrop-blur-[6px] transition-colors duration-200 ${
        scrolled ? 'border-b border-[var(--color-line)]' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-[62px] max-w-[1240px] items-center justify-between gap-6 px-6">
        <Wordmark />
        <div className="hidden items-center gap-7 text-[14px] text-[var(--color-ink-2)] md:flex">
          <a className="hover:text-[var(--color-ink)]" href="#standardise">
            How it works
          </a>
          <a className="hover:text-[var(--color-ink)]" href="#contact">
            Contact
          </a>
        </div>
        <a className="btn btn-primary" href={PROTOTYPE_URL}>
          Access prototype
        </a>
      </nav>
    </header>
  )
}
