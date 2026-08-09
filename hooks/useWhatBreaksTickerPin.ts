import { useEffect, type RefObject } from "react";

/**
 * Mobile-only: measure the copy header for pile sticky tops.
 */
export function useWhatBreaksTickerPin(
  figureRef: RefObject<HTMLElement | null>,
  headerPinRef: RefObject<HTMLDivElement | null>,
) {
  useEffect(() => {
    const figure = figureRef.current;
    const headerPin = headerPinRef.current;
    if (!figure || !headerPin) return;

    const section = figure.closest<HTMLElement>(".lp-module--problem");
    if (!section) return;

    const mq = window.matchMedia("(max-width: 860px)");

    const measure = () => {
      if (!mq.matches) {
        section.style.removeProperty("--wb-header-height");
        section.style.removeProperty("--wb-pile-stick");
        return;
      }

      const headerStick = 92;
      const pileGap = 16;
      const headerHeight = Math.max(
        headerPin.offsetHeight,
        Math.ceil(headerPin.getBoundingClientRect().height),
      );
      const pileStick = headerStick + headerHeight + pileGap;

      section.style.setProperty("--wb-header-height", `${headerHeight}px`);
      section.style.setProperty("--wb-pile-stick", `${pileStick}px`);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(headerPin);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      section.style.removeProperty("--wb-header-height");
      section.style.removeProperty("--wb-pile-stick");
    };
  }, [figureRef, headerPinRef]);
}
