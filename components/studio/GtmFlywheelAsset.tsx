"use client";

import { Brand } from "@/components/icons";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import {
  FLYWHEEL_CENTER,
  FLYWHEEL_CENTER_SUB,
  FLYWHEEL_CIRCLES,
  FLYWHEEL_FAILURES,
  FLYWHEEL_KICKER,
  FLYWHEEL_KICKER_ACCENT,
  FLYWHEEL_STEPS,
  FLYWHEEL_TITLE,
  FLYWHEEL_TITLE_ACCENT,
  type FlywheelCircle,
} from "@/lib/studio/gtmFlywheel";

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

function CirclePoints({ circle }: { circle: FlywheelCircle }) {
  return (
    <div className={`flywheel-glass__col flywheel-glass__col--${circle.id}`}>
      <span className="flywheel-glass__col-label">{circle.label}</span>
      <ul className="flywheel-glass__col-points">
        {circle.points.map((point) => (
          <li key={point} className="flywheel-glass__col-point">
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GtmFlywheelAsset() {
  return (
    <div className="flywheel-glass">
      <div className="spine-glass__aurora" aria-hidden="true" />
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

      <div className="flywheel-glass__venn">
        <span className="flywheel-glass__circle flywheel-glass__circle--content" />
        <span className="flywheel-glass__circle flywheel-glass__circle--ads" />
        <span className="flywheel-glass__circle flywheel-glass__circle--outbound" />
        <span className="flywheel-glass__circle-label flywheel-glass__circle-label--content">
          Content
        </span>
        <span className="flywheel-glass__circle-label flywheel-glass__circle-label--ads">
          Ads
        </span>
        <span className="flywheel-glass__circle-label flywheel-glass__circle-label--outbound">
          Outbound
        </span>
        {FLYWHEEL_FAILURES.map((failure) => (
          <span
            key={failure.id}
            className="flywheel-glass__intersection"
            style={{ top: failure.pos.top, left: failure.pos.left }}
          >
            <span className="flywheel-glass__intersection-pair">
              {failure.pair}
            </span>
            <span className="flywheel-glass__intersection-label">
              {failure.label}
            </span>
          </span>
        ))}
        <span className="flywheel-glass__hub">
          <span className="flywheel-glass__hub-title">{FLYWHEEL_CENTER}</span>
          <span className="flywheel-glass__hub-sub">{FLYWHEEL_CENTER_SUB}</span>
        </span>
      </div>

      <div className="flywheel-glass__cols">
        {FLYWHEEL_CIRCLES.map((circle) => (
          <CirclePoints key={circle.id} circle={circle} />
        ))}
      </div>

      <div className="flywheel-glass__steps">
        {FLYWHEEL_STEPS.map((step) => (
          <div key={step.n} className="flywheel-glass__step">
            <span className="flywheel-glass__step-num">{step.n}</span>
            <span className="flywheel-glass__step-text">{step.text}</span>
          </div>
        ))}
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
