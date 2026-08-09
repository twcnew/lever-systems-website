import { withBasePath } from "@/lib/basePath";

/* Hand-drawn SVG marks — every asset on the site is original and owned. */

// Asset filename is legacy; the file contains the Lever wordmark lettering.
export const LEVER_WORDMARK_SRC = withBasePath("/frontral-wordmark.png");

export function LumioMark({ className }: { className?: string }) {
  // abstract "ledger valley" mark: two peaks dipping into a basin
  return (
    <svg viewBox="0 0 22 22" fill="currentColor" className={className} aria-hidden="true">
      <path d="M1 1c.5 4.4 1.7 8.6 3.6 11.7 1.6 2.6 3.9 4.3 6.4 4.3s4.8-1.7 6.4-4.3C19.3 9.6 20.5 5.4 21 1v20c-3.2-.9-6.6-1.4-10-1.4S4.2 20.1 1 21V1Z" />
    </svg>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <img
      className={`brand__wordmark${className ? ` ${className}` : ""}`}
      src={LEVER_WORDMARK_SRC}
      alt="Lever"
    />
  );
}

export function DoubleArrows() {
  // two opposed diagonal arrows (sw / ne)
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M10.5 2.5h5v5M15.5 2.5 9.8 8.2M7.5 15.5h-5v-5M2.5 15.5l5.7-5.7" />
    </svg>
  );
}

/** Google Meet icon (2020) — official brand colors for "book a call" CTAs. */
export function VideoCall() {
  return (
    <svg
      viewBox="0 0 87.5 72"
      fill="none"
      aria-hidden="true"
      className="icon-meet"
    >
      <path
        fill="#00832d"
        d="M49.5 36l8.53 9.75 11.47 7.33 2-17.02-2-16.64-11.69 6.44z"
      />
      <path
        fill="#0066da"
        d="M0 51.5V66c0 3.315 2.685 6 6 6h14.5l3-10.96-3-9.54-9.95-3z"
      />
      <path fill="#e94235" d="M20.5 0L0 20.5l10.55 3 9.95-3 2.95-9.41z" />
      <path fill="#2684fc" d="M20.5 20.5H0v31h20.5z" />
      <path
        fill="#00ac47"
        d="M82.6 8.68L69.5 19.42v33.66l13.16 10.79c1.97 1.54 4.85.135 4.85-2.37V11c0-2.535-2.945-3.925-4.91-2.32zM49.5 36v15.5h-29V72h43c3.315 0 6-2.685 6-6V53.08z"
      />
      <path
        fill="#ffba00"
        d="M63.5 0h-43v20.5h29V36l20-16.57V6c0-3.315-2.685-6-6-6z"
      />
    </svg>
  );
}

export function BrowserArrows() {
  return (
    <svg viewBox="0 0 44 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" style={{ width: 44, height: 14 }}>
      <path d="M9 1 3 7l6 6M3 7h10" opacity=".9" />
      <path d="M33 1l6 6-6 6M39 7H29" opacity=".4" />
    </svg>
  );
}

export function Padlock() {
  return (
    <svg viewBox="0 0 10 12" fill="none" stroke="#fff" strokeWidth="1.1" className="padlock" aria-hidden="true">
      <rect x="1" y="5" width="8" height="6" rx="1.4" fill="#fff" stroke="none" />
      <path d="M2.8 5V3.4a2.2 2.2 0 0 1 4.4 0V5" />
    </svg>
  );
}

export function CornerPlus() {
  return (
    <svg viewBox="0 0 12 12" fill="none" className="corner-plus" aria-hidden="true">
      <rect x="0.5" y="0.5" width="11" height="11" rx="5.5" stroke="white" />
      <path d="M3.4 6h5.2M6 3.4v5.2" stroke="white" strokeLinecap="round" />
    </svg>
  );
}

export function DotsMenu() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="3" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="8" cy="13" r="1.4" />
    </svg>
  );
}

export function UnfoldMore() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <path d="m5 6 3-3 3 3M5 10l3 3 3-3" />
    </svg>
  );
}

export function HomeIcon({ filled = false }: { filled?: boolean }) {
  return filled ? (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1.8 2 7v6.4c0 .5.4.8.8.8h3.4v-4h3.6v4h3.4c.4 0 .8-.3.8-.8V7L8 1.8Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M2.5 7.2 8 2.4l5.5 4.8v6.1a.7.7 0 0 1-.7.7H9.6v-3.8H6.4V14H3.2a.7.7 0 0 1-.7-.7V7.2Z" />
    </svg>
  );
}

export function QMark() {
  return (
    <svg className="qmark" viewBox="0 0 14 14" fill="none" stroke="rgba(14,10,7,.35)" strokeWidth="1.2" aria-hidden="true">
      <circle cx="7" cy="7" r="6" />
      <path d="M7 9.5V10m0-5.5a1.5 1.5 0 0 1 0 3" strokeLinecap="round" />
    </svg>
  );
}

/* 7-bar sparkline used in the dashboard KPI cards: one highlighted bar */
export function Spark({ bars, strong = 1 }: { bars: number[]; strong?: number }) {
  return (
    <svg className="spark" width="44" height="49" viewBox="0 0 44 49" fill="none" aria-hidden="true">
      {bars.map((top, i) => (
        <path
          key={i}
          className={i === strong ? undefined : "dim"}
          d={`M${1 + i * 7} ${top}L${1 + i * 7} 49`}
          stroke="#0E0A07"
          strokeOpacity={i === strong ? 1 : 0.2}
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}

export function SparkleAI() {
  // four-point star with a small companion — "AI insight"
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11 3c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6Z" />
      <path d="M18.5 13.5c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
    </svg>
  );
}

export function CashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#5A8BE4" strokeWidth="1.5" aria-hidden="true">
      <rect x="2.5" y="6.5" width="19" height="11" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.5v0M18 14.5v0" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function WarnTriangle() {
  return (
    <svg viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <path d="M7 1.2 13.4 13H.6L7 1.2Zm-.7 4.3v3.4h1.4V5.5H6.3Zm0 4.6v1.4h1.4v-1.4H6.3Z" />
    </svg>
  );
}

export function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  );
}

export function BankIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
      <path d="M9 1 17 6H1L9 1ZM2 7h14v8H2z" />
    </svg>
  );
}

export function FlowIcon() {
  return (
    <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="2" y="2" width="6" height="6" />
      <rect x="10" y="10" width="6" height="6" />
      <path d="M8 5h2v5" />
    </svg>
  );
}

/* generic placeholder logos for the two "blank" orbit tiles */
export function NotchMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true" style={{ width: "42%" }}>
      <path d="M5 19V5l9 10V5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 5v14" strokeLinecap="round" opacity=".45" />
    </svg>
  );
}

export function KnotMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ width: "46%" }}>
      <circle cx="9.5" cy="9.5" r="5.5" />
      <circle cx="14.5" cy="14.5" r="5.5" />
    </svg>
  );
}

/* pinwheel mark for the collaboration tile (original four-lobe design) */
export function PinwheelMark() {
  return (
    <svg viewBox="0 0 32 32" width="44" height="44" aria-hidden="true">
      <rect x="13.5" y="2" width="5" height="12" rx="2.5" fill="#E01E5A" />
      <rect x="13.5" y="18" width="5" height="12" rx="2.5" fill="#2EB67D" />
      <rect x="2" y="13.5" width="12" height="5" rx="2.5" fill="#ECB22E" />
      <rect x="18" y="13.5" width="12" height="5" rx="2.5" fill="#36C5F0" />
    </svg>
  );
}

export function LinkedInIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2h-9ZM5 6.25V12H3.5V6.25H5Zm-.75-1.5a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75ZM12 12h-1.5V9.25c0-.75-.15-1.75-1.35-1.75-1.35 0-1.55 1.05-1.55 2.13V12H6.5V6.25h1.44v1.02h.02c.2-.38.7-1.25 1.75-1.25 1.87 0 2.22 1.23 2.22 2.83V12Z" />
    </svg>
  );
}
