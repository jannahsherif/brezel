import { useEffect } from 'react'

/**
 * Reveals every `[data-reveal]` element as it enters view.
 *
 * Two deliberate guards, both learned from the current brezel.cc:
 *  - a single observer set up after paint, so elements already on screen reveal immediately;
 *  - a hard failsafe that shows everything after 1.6s no matter what. Content must never be
 *    left at opacity 0 because an observer did not fire — the page has to survive its own JS.
 */
export function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const show = (el: HTMLElement) => el.setAttribute('data-shown', 'true')

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue
          show(en.target as HTMLElement)
          io.unobserve(en.target)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    els.forEach((el) => io.observe(el))

    const failsafe = window.setTimeout(() => els.forEach(show), 1600)
    return () => {
      io.disconnect()
      window.clearTimeout(failsafe)
    }
  }, [])
}
