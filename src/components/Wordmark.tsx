/**
 * The Brezel monogram, flat. The brand asset ships as a four-stop gradient with a drop shadow;
 * on cream that reads as a sticker. Here it is a single ink or rust fill — weight, not glow.
 */
export function Mark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 695 878"
      width={(size * 695) / 878}
      height={size}
      className={className}
      role="img"
      aria-label="Brezel"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M 668 17 L 655 12 L 646 12 L 634 16 L 624 24 L 350 393 L 347 392 L 343 366 L 330 322 L 322 302 L 304 268 L 285 242 L 265 222 L 249 210 L 233 201 L 215 194 L 192 189 L 162 189 L 139 194 L 123 200 L 100 213 L 84 226 L 62 251 L 45 278 L 34 302 L 23 336 L 16 369 L 12 407 L 13 463 L 16 489 L 24 506 L 35 515 L 44 518 L 241 518 L 244 520 L 243 525 L 95 747 L 92 757 L 93 775 L 98 786 L 108 796 L 119 801 L 134 802 L 148 797 L 158 788 L 304 578 L 308 576 L 318 838 L 325 853 L 336 862 L 345 865 L 359 865 L 368 862 L 380 852 L 387 835 L 377 520 L 653 519 L 665 515 L 677 504 L 682 492 L 682 37 L 677 26 Z M 133 268 L 146 259 L 158 254 L 174 251 L 188 252 L 213 262 L 228 274 L 238 285 L 253 307 L 263 327 L 277 369 L 287 427 L 287 445 L 280 454 L 78 454 L 78 394 L 81 372 L 88 343 L 98 316 L 107 299 L 119 282 Z M 617 140 L 618 454 L 383 455 L 382 451 L 603 155 L 614 141 Z"
      />
    </svg>
  )
}

export function Wordmark() {
  return (
    <a href="#top" className="flex items-center gap-2.5 text-[var(--color-ink)]">
      <Mark size={21} className="text-[var(--color-accent)]" />
      <span className="text-[19px] font-semibold tracking-[-0.02em]">Brezel</span>
    </a>
  )
}
