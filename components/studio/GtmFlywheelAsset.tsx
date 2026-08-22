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

const CARD_STEPS = [1, 2, 3, 4, 5] as const;
type CardStep = (typeof CARD_STEPS)[number];
type FlywheelTheme = "dark" | "light";

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

function useFlywheelCardSequence(rootRef: RefObject<HTMLDivElement | null>) {
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
      root.dataset.activeStep = "all";
    };

    const schedule = () => {
      clearTimer();
      if (reducedMotion.matches) {
        showCompleteState();
        return;
      }
      if (!visible || !pageVisible) return;

      const step = CARD_STEPS[stepIndex] satisfies CardStep;
      root.dataset.activeStep = String(step);
      timeoutId = window.setTimeout(
        () => {
          stepIndex = (stepIndex + 1) % CARD_STEPS.length;
          schedule();
        },
        1000,
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

    root.dataset.flowStep = "static";
    root.dataset.activeStep = reducedMotion.matches ? "all" : "1";
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

function ChannelPoints({
  channel,
  instanceId,
}: {
  channel: FlywheelChannel;
  instanceId: string;
}) {
  return (
    <section
      className={`flywheel-glass__channel flywheel-glass__channel--${channel.id}`}
      data-channel={channel.id}
      aria-labelledby={`${instanceId}-channel-${channel.id}`}
    >
      <h2
        id={`${instanceId}-channel-${channel.id}`}
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

function VennSurface({
  instanceId,
  theme,
}: {
  instanceId: string;
  theme: FlywheelTheme;
}) {
  const fills =
    theme === "light"
      ? {
          content: ["rgba(55, 111, 235, .58)", "rgba(55, 111, 235, .31)", "rgba(55, 111, 235, .10)"],
          ads: ["rgba(129, 69, 225, .56)", "rgba(129, 69, 225, .29)", "rgba(129, 69, 225, .09)"],
          outbound: ["rgba(14, 165, 233, .54)", "rgba(14, 165, 233, .27)", "rgba(14, 165, 233, .09)"],
        }
      : {
          content: ["rgba(90, 139, 228, .48)", "rgba(90, 139, 228, .24)", "rgba(90, 139, 228, .08)"],
          ads: ["rgba(119, 91, 218, .46)", "rgba(119, 91, 218, .23)", "rgba(119, 91, 218, .08)"],
          outbound: ["rgba(61, 166, 238, .44)", "rgba(61, 166, 238, .22)", "rgba(61, 166, 238, .08)"],
        };

  const contentFillId = `${instanceId}-content-fill`;
  const adsFillId = `${instanceId}-ads-fill`;
  const outboundFillId = `${instanceId}-outbound-fill`;
  const contentLabelPathId = `${instanceId}-content-label-path`;
  const adsLabelPathId = `${instanceId}-ads-label-path`;
  const outboundLabelPathId = `${instanceId}-outbound-label-path`;
  const outboundLabelPath =
    theme === "light"
      ? "M 535 760 Q 650 770 740 722"
      : "M 535 748 Q 650 758 740 710";

  return (
    <svg
      className="flywheel-glass__venn-surface"
      viewBox="0 0 920 770"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={contentFillId} cx="50%" cy="38%" r="68%">
          <stop offset="0" stopColor={fills.content[0]} />
          <stop offset=".72" stopColor={fills.content[1]} />
          <stop offset="1" stopColor={fills.content[2]} />
        </radialGradient>
        <radialGradient id={adsFillId} cx="42%" cy="44%" r="68%">
          <stop offset="0" stopColor={fills.ads[0]} />
          <stop offset=".72" stopColor={fills.ads[1]} />
          <stop offset="1" stopColor={fills.ads[2]} />
        </radialGradient>
        <radialGradient id={outboundFillId} cx="58%" cy="44%" r="68%">
          <stop offset="0" stopColor={fills.outbound[0]} />
          <stop offset=".72" stopColor={fills.outbound[1]} />
          <stop offset="1" stopColor={fills.outbound[2]} />
        </radialGradient>
        <path
          id={contentLabelPathId}
          d="M 315 75 Q 460 15 605 75"
        />
        <path
          id={adsLabelPathId}
          d="M 110 660 Q 205 760 330 775"
        />
        <path
          id={outboundLabelPathId}
          d={outboundLabelPath}
        />
      </defs>
      <g className="flywheel-glass__disc flywheel-glass__disc--content">
        <circle cx="460" cy="280" r="276" fill={`url(#${contentFillId})`} />
        <circle className="flywheel-glass__disc-line" cx="460" cy="280" r="276" />
      </g>
      <g className="flywheel-glass__disc flywheel-glass__disc--ads">
        <circle cx="330" cy="500" r="276" fill={`url(#${adsFillId})`} />
        <circle className="flywheel-glass__disc-line" cx="330" cy="500" r="276" />
      </g>
      <g className="flywheel-glass__disc flywheel-glass__disc--outbound">
        <circle cx="590" cy="500" r="276" fill={`url(#${outboundFillId})`} />
        <circle className="flywheel-glass__disc-line" cx="590" cy="500" r="276" />
      </g>
      <g className="flywheel-glass__venn-labels">
        <text className="flywheel-glass__venn-label flywheel-glass__venn-label--content">
          <textPath href={`#${contentLabelPathId}`} startOffset="50%">
            CONTENT
          </textPath>
        </text>
        <text className="flywheel-glass__venn-label flywheel-glass__venn-label--ads">
          <textPath href={`#${adsLabelPathId}`} startOffset="50%">
            ADS
          </textPath>
        </text>
        <text className="flywheel-glass__venn-label flywheel-glass__venn-label--outbound">
          <textPath href={`#${outboundLabelPathId}`} startOffset="50%">
            OUTBOUND
          </textPath>
        </text>
      </g>
    </svg>
  );
}

export function GtmFlywheelAsset({
  theme = "dark",
}: {
  theme?: FlywheelTheme;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  useFlywheelCardSequence(rootRef);
  const instanceId = `flywheel-${theme}`;

  return (
    <div
      className={`flywheel-glass flywheel-glass--${theme}`}
      ref={rootRef}
      data-flow-step="static"
      data-active-step="1"
      data-theme={theme}
    >
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
          {theme === "light" ? (
            <span className="spine-glass__dot" aria-hidden="true">
              ·
            </span>
          ) : null}
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
        <VennSurface instanceId={instanceId} theme={theme} />

        {FLYWHEEL_CHANNELS.map((channel) => (
          <ChannelPoints
            key={channel.id}
            channel={channel}
            instanceId={instanceId}
          />
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
            data-step={step.n}
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
