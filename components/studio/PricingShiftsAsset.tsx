import { Brand } from "@/components/icons";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import {
  PRICING_MODELS,
  PRICING_SHIFTS_CTA,
  PRICING_SHIFTS_CTA_ACCENT,
  PRICING_SHIFTS_KICKER,
  PRICING_SHIFTS_KICKER_ACCENT,
  PRICING_SHIFTS_TITLE,
  PRICING_SHIFTS_TITLE_ACCENT,
  type PricingCompany,
  type PricingModel,
} from "@/lib/studio/pricingShifts";

function accentSpan(text: string, accent: string) {
  const index = text.indexOf(accent);
  if (index < 0) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="pricing-shifts__accent">{accent}</span>
      {text.slice(index + accent.length)}
    </>
  );
}

function LogoMark({ company }: { company: PricingCompany }) {
  if (company.id === "microsoft") {
    return (
      <span className="pricing-shifts__logo pricing-shifts__logo--microsoft" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
    );
  }

  if (company.id === "monday") {
    return (
      <span className="pricing-shifts__logo pricing-shifts__logo--monday" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    );
  }

  const marks: Record<string, string> = {
    harvey: "H",
    decagon: "⬡",
    intercom: "▥",
    zendesk: "Z",
    sierra: "✺",
    salesforce: "☁",
    openai: "◎",
    "11x": "11x",
    zapier: "✳",
    elevenlabs: "Ⅱ",
    bland: "∞",
    clay: "◒",
    unify: "◫",
    relay: "↝",
    relevance: "◒",
    kittl: "K",
    aisdr: "AiSDR",
  };

  return (
    <span
      className={`pricing-shifts__logo pricing-shifts__logo--${company.id}`}
      aria-hidden="true"
    >
      {marks[company.id] ?? company.name.slice(0, 2)}
    </span>
  );
}

function CompanyCard({
  company,
  model,
}: {
  company: PricingCompany;
  model: PricingModel;
}) {
  return (
    <article
      className={`pricing-shifts__company pricing-shifts__company--${model.id}`}
    >
      <LogoMark company={company} />
      <h3 className="pricing-shifts__company-name">{company.name}</h3>
      <p className="pricing-shifts__company-pricing">{company.pricing}</p>
    </article>
  );
}

function PricingSection({ model }: { model: PricingModel }) {
  const firstRow = model.id === "usage" ? model.companies.slice(0, 5) : model.companies;
  const secondRow = model.id === "usage" ? model.companies.slice(5) : [];

  return (
    <section
      className={`pricing-shifts__section pricing-shifts__section--${model.id}`}
      aria-labelledby={`pricing-${model.id}`}
    >
      <header className="pricing-shifts__section-head">
        <h2 id={`pricing-${model.id}`} className="pricing-shifts__section-label">
          {model.label}
        </h2>
        <p className="pricing-shifts__section-description">{model.description}</p>
      </header>

      <div className="pricing-shifts__companies pricing-shifts__companies--primary">
        {firstRow.map((company) => (
          <CompanyCard key={company.id} company={company} model={model} />
        ))}
      </div>

      {secondRow.length ? (
        <div className="pricing-shifts__companies pricing-shifts__companies--secondary">
          {secondRow.map((company) => (
            <CompanyCard key={company.id} company={company} model={model} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function PricingShiftsAsset() {
  return (
    <div className="pricing-shifts">
      <div className="spine-glass__aurora" aria-hidden="true" />
      <div className="pricing-shifts__grid" aria-hidden="true" />
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
          <span className="spine-glass__dot" aria-hidden="true">·</span>
          <span className="spine-glass__role">{ABOUT_CONTENT.founder.role}.</span>
          <Brand className="spine-glass__wordmark" />
        </div>
      </header>

      <header className="pricing-shifts__hero">
        <h1 className="pricing-shifts__title">
          {accentSpan(PRICING_SHIFTS_TITLE, PRICING_SHIFTS_TITLE_ACCENT)}
        </h1>
        <p className="pricing-shifts__kicker">
          {accentSpan(PRICING_SHIFTS_KICKER, PRICING_SHIFTS_KICKER_ACCENT)}
        </p>
      </header>

      <div className="pricing-shifts__tiles" aria-hidden="true">
        <span>✳</span>
        <span>◎</span>
        <span>▥</span>
        <span>⬡</span>
      </div>

      <div className="pricing-shifts__models">
        {PRICING_MODELS.map((model) => (
          <PricingSection key={model.id} model={model} />
        ))}
      </div>

      <div className="pricing-shifts__closer">
        <span className="pricing-shifts__closer-stars" aria-hidden="true">✦✦</span>
        {accentSpan(PRICING_SHIFTS_CTA, PRICING_SHIFTS_CTA_ACCENT)}
      </div>

      <img
        className="spine-glass__bust-corner"
        src={withBasePath(ABOUT_CONTENT.founder.footerPhoto)}
        alt=""
        aria-hidden="true"
      />
    </div>
  );
}
