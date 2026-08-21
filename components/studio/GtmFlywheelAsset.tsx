"use client";

import { useEffect, useRef, type RefObject } from "react";
import { Brand } from "@/components/icons";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import {
  FLYWHEEL_CENTER,
  FLYWHEEL_CENTER_SUB,
  FLYWHEEL_CHANNELS,
  FLYWHEEL_CTA,
  FLYWHEEL_CTA_ACCENT,
  FLYWHEEL_KICKER,
  FLYWHEEL_KICKER_ACCENT,
  FLYWHEEL_OVERLAPS,
  FLYWHEEL_STEPS,
  FLYWHEEL_TITLE,
  FLYWHEEL_TITLE_ACCENT,
  type FlywheelChannel,
} from "@/lib/studio/gtmFlywheel";

const FLOW_STEPS = ["content", "ads", "outbound", "hub"] as const;
type FlowStep = (typeof FLOW_STEPS)[number];

function accentSpan(text: string, accent?: string) {
  if (!accent || !text.includes(accent)) return text;
  const index = text.indexOf(accent);
  return (
    <>
      {text.slice(0, index)}
      <span className="flywheel-glass__accent">{accent}</span>
      {text.slice(index + accent.length)}
    </>
  );
}

function useFlywheelSequence(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let visible = false;
    let pageVisible = document.visibilityState === "visible";
    let stepIndex = 0;
    let timeoutId: number | undefined;

    const clearTimer = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const showCompleteState = () => {
      clearTimer();
      root.dataset.flowStep = "hub";
    };

    const schedule = () => {
      clearTimer();
      if (reducedMotion.matches) {
        showCompleteState();
        return;
      }
      if (!visible || !pageVisible) return;

      const step = FLOW_STEPS[stepIndex] satisfies FlowStep;
      root.dataset.flowStep = step;
      timeoutId = window.setTimeout(
        () => {
          stepIndex = (stepIndex + 1) % FLOW_STEPS.length;
          schedule();
        },
        step === "hub" ? 2200 : 1100,
      );
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) schedule();
        else clearTimer();
      },
      { threshold: 0.2 },
    );

    const onVisibilityChange = () => {
      pageVisible = document.visibilityState === "visible";
      if (pageVisible) schedule();
      else clearTimer();
    };

    const onMotionChange = () => {
      if (reducedMotion.matches) showCompleteState();
      else schedule();
    };

    root.dataset.flowStep = reducedMotion.matches ? "hub" : "content";
    observer.observe(root);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      clearTimer();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, [rootRef]);
}

function ChannelPoints({ channel }: { channel: FlywheelChannel }) {
  return (
    <section
      className={`flywheel-glass__channel flywheel-glass__channel--${channel.id}`}
      data-channel={channel.id}
      aria-labelledby={`flywheel-channel-${channel.id}`}
    >
      <h2
        id={`flywheel-channel-${channel.id}`}
        className="flywheel-glass__channel-label"
      >
        {channel.label}
      </h2>
      <ul className="flywheel-glass__channel-points">
        {channel.points.map((point, index) => (
          <li
            key={point}
            className="flywheel-glass__channel-point"
            data-point={index + 1}
          >
            {point}
          </li>
        ))}
      </ul>
    </section>
  );
}

function VennSurface() {
  return (
    <svg
      className="flywheel-glass__venn-surface"
      viewBox="0 0 920 770"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="flywheel-content-fill" cx="50%" cy="38%" r="68%">
          <stop offset="0" stopColor="rgba(90, 139, 228, .42)" />
          <stop offset=".72" stopColor="rgba(90, 139, 228, .20)" />
          <stop offset="1" stopColor="rgba(90, 139, 228, .07)" />
        </radialGradient>
        <radialGradient id="flywheel-ads-fill" cx="42%" cy="44%" r="68%">
          <stop offset="0" stopColor="rgba(102, 91, 208, .40)" />
          <stop offset=".72" stopColor="rgba(102, 91, 208, .20)" />
          <stop offset="1" stopColor="rgba(102, 91, 208, .07)" />
        </radialGradient>
        <radialGradient id="flywheel-outbound-fill" cx="58%" cy="44%" r="68%">
          <stop offset="0" stopColor="rgba(84, 164, 255, .38)" />
          <stop offset=".72" stopColor="rgba(84, 164, 255, .18)" />
          <stop offset="1" stopColor="rgba(84, 164, 255, .07)" />
        </radialGradient>
      </defs>
      <g className="flywheel-glass__disc flywheel-glass__disc--content">
        <circle cx="460" cy="280" r="276" fill="url(#flywheel-content-fill)" />
        <circle className="flywheel-glass__disc-line" cx="460" cy="280" r="276" />
      </g>
      <g className="flywheel-glass__disc flywheel-glass__disc--ads">
        <circle cx="330" cy="500" r="276" fill="url(#flywheel-ads-fill)" />
        <circle className="flywheel-glass__disc-line" cx="330" cy="500" r="276" />
      </g>
      <g className="flywheel-glass__disc flywheel-glass__disc--outbound">
        <circle cx="590" cy="500" r="276" fill="url(#flywheel-outbound-fill)" />
        <circle className="flywheel-glass__disc-line" cx="590" cy="500" r="276" />
      </g>
    </svg>
  );
}

export function GtmFlywheelAsset() {
  const rootRef = useRef<HTMLDivElement>(null);
  useFlywheelSequence(rootRef);

  return (
    <div className="flywheel-glass" ref={rootRef} data-flow-step="content">
      <div className="spine-glass__aurora" aria-hidden="true" />
      <div className="flywheel-glass__grid" aria-hidden="true" />
      <div className="spine-glass__grain" aria-hidden="true" />

      <span className="spine-glass__url" aria-hidden="true">
        lever.systems
      </span>

      <header className="spine-glass__topbar">
        <div className="spine-glass__byline">
          <img
            className="spine-glass__avatar"
            src={withBasePath(ABOUT_CONTENT.founder.avatarPhoto)}
            alt={ABOUT_CONTENT.founder.name}
            width={48}
            height={48}
          />
          <span className="spine-glass__name">{ABOUT_CONTENT.founder.name}</span>
          <span className="spine-glass__dot" aria-hidden="true">
            ·
          </span>
          <span className="spine-glass__role">{ABOUT_CONTENT.founder.role}</span>
          <Brand className="spine-glass__wordmark" />
        </div>
      </header>

      <header className="flywheel-glass__hero">
        <h1 className="flywheel-glass__title">
          {accentSpan(FLYWHEEL_TITLE, FLYWHEEL_TITLE_ACCENT)}
        </h1>
        <p className="flywheel-glass__kicker">
          {accentSpan(FLYWHEEL_KICKER, FLYWHEEL_KICKER_ACCENT)}
        </p>
      </header>

      <div
        className="flywheel-glass__venn"
        role="group"
        aria-label="Three-channel GTM flywheel"
      >
        <VennSurface />

        {FLYWHEEL_CHANNELS.map((channel) => (
          <ChannelPoints key={channel.id} channel={channel} />
        ))}

        {FLYWHEEL_OVERLAPS.map((overlap) => (
          <article
            key={overlap.id}
            className={`flywheel-glass__overlap flywheel-glass__overlap--${overlap.id}`}
            data-overlap={overlap.id}
          >
            <span className="flywheel-glass__overlap-pair">{overlap.pair}</span>
            <h3 className="flywheel-glass__overlap-title">{overlap.title}</h3>
            <p className="flywheel-glass__overlap-copy">{overlap.copy}</p>
          </article>
        ))}

        <article className="flywheel-glass__hub" data-channel="hub">
          <h2 className="flywheel-glass__hub-title">{FLYWHEEL_CENTER}</h2>
          <p className="flywheel-glass__hub-sub">{FLYWHEEL_CENTER_SUB}</p>
        </article>
      </div>

      <section className="flywheel-glass__steps" aria-label="Five flywheel actions">
        {FLYWHEEL_STEPS.map((step) => (
          <article
            key={step.n}
            className={`flywheel-glass__step flywheel-glass__step--${step.n}`}
          >
            <span className="flywheel-glass__step-num">{step.n}</span>
            <h2 className="flywheel-glass__step-title">{step.title}</h2>
            <p className="flywheel-glass__step-copy">{step.copy}</p>
          </article>
        ))}
      </section>

      <div className="flywheel-glass__closer">
        <span className="flywheel-glass__closer-stars" aria-hidden="true">
          ✦✦
        </span>
        <span>{accentSpan(FLYWHEEL_CTA, FLYWHEEL_CTA_ACCENT)}</span>
      </div>

      <img
        className="spine-glass__bust-corner"
        src={withBasePath(ABOUT_CONTENT.founder.footerPhoto)}
        alt={ABOUT_CONTENT.founder.name}
        width={900}
        height={824}
      />
    </div>
  );
}
