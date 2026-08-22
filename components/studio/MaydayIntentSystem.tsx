"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Brand } from "@/components/icons";
import { InkAnnotate } from "@/components/system/InkAnnotate";
import { useSectionReveal } from "@/components/sections/useSectionReveal";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import {
  MAYDAY_CALIBRATION_METRICS,
  MAYDAY_QUALIFICATION_GATES,
  MAYDAY_REFERENCES,
  MAYDAY_SIGNAL_PLAYS,
  MAYDAY_TOOLS,
  MAYDAY_WORKFLOW_STAGES,
  type MaydaySignalPlay,
  type MaydayTool,
} from "@/lib/studio/maydayIntentSystem";

const NAV_ITEMS = [
  { id: "lecture", label: "Ma lecture" },
  { id: "fit", label: "Filtre ICP" },
  { id: "moments", label: "Moments de bascule" },
  { id: "workflow", label: "Workflow" },
  { id: "brief", label: "Brief CRM" },
  { id: "calibration", label: "Calibration" },
] as const;

const INTRO_STAGES = [
  { number: "01", label: "Détecter", copy: "Un changement réel" },
  { number: "02", label: "Qualifier", copy: "Fit + seconde preuve" },
  { number: "03", label: "Router", copy: "Un brief contextualisé" },
  { number: "04", label: "Apprendre", copy: "Le retour du terrain" },
] as const;

const EVIDENCE_POINTS = [
  {
    id: "ai",
    eyebrow: "IA en production",
    title: "La connaissance doit devenir fiable pour la machine.",
    copy: "Production et contrôle de contenus assistés par des agents IA.",
    proof: "BoursoBank",
    href: "https://www.mayday.fr/cas-clients/boursobank",
  },
  {
    id: "distributed",
    eyebrow: "Support distribué",
    title: "La procédure doit survivre à plusieurs organisations.",
    copy: "Équipes internes, partenaires et centres externalisés doivent rester alignés.",
    proof: "Appart’City",
    href: "https://www.mayday.fr/cas-clients/appartcity",
  },
  {
    id: "complexity",
    eyebrow: "Complexité croissante",
    title: "L’onboarding et les mises à jour deviennent un goulot.",
    copy: "Des centaines de conseillers répartis sur plusieurs sites.",
    proof: "Doctolib",
    href: "https://www.mayday.fr/cas-clients/doctolib",
  },
] as const;

function MaydaySection({
  id,
  className = "",
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useSectionReveal<HTMLElement>();

  return (
    <section
      id={id}
      ref={ref}
      className={`lp-module mayday-playbook__section ${className}`.trim()}
    >
      {children}
    </section>
  );
}

function SectionHeading({
  label,
  title,
  sub,
}: {
  label: string;
  title: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="lp-module__copy mayday-playbook__section-heading">
      <span className="lp-module__label">{label}</span>
      <h2 className="lp-module__title">{title}</h2>
      {sub ? <p className="lp-module__sub">{sub}</p> : null}
    </div>
  );
}

function ToolChips({ tools }: { tools: MaydayTool[] }) {
  return (
    <span className="mayday-playbook__tool-chips">
      {tools.map((tool) => (
        <span className="mayday-playbook__tool-chip" key={tool.id}>
          <Image
            src={withBasePath(tool.src)}
            alt=""
            width={22}
            height={22}
            sizes="22px"
          />
          <span>
            <strong>{tool.label}</strong>
            <small>{tool.cadence}</small>
          </span>
        </span>
      ))}
    </span>
  );
}

function SignalSketch({ id }: { id: MaydaySignalPlay["id"] }) {
  if (id === "ai-delivery") {
    return (
      <svg viewBox="0 0 280 180" role="img" aria-label="Du POC à un agent IA alimenté par la connaissance">
        <path className="mayday-sketch__dash" d="M42 90h38m49 0h35m49 0h27" />
        <rect x="18" y="60" width="62" height="60" rx="7" />
        <rect x="112" y="46" width="70" height="88" rx="9" />
        <rect x="213" y="60" width="49" height="60" rx="24" />
        <path d="m68 82 12 8-12 8M170 82l12 8-12 8" />
        <path d="M132 70h30M132 84h24M132 98h30M132 112h18" />
        <circle cx="228" cy="83" r="2.5" className="mayday-sketch__fill" />
        <circle cx="246" cy="83" r="2.5" className="mayday-sketch__fill" />
        <path d="M228 101c5 5 13 5 18 0" />
        <text x="49" y="145" textAnchor="middle">POC</text>
        <text x="147" y="157" textAnchor="middle">CONNAISSANCE</text>
        <text x="238" y="145" textAnchor="middle">AGENT</text>
      </svg>
    );
  }

  if (id === "knowledge-program") {
    return (
      <svg viewBox="0 0 280 180" role="img" aria-label="Une connaissance dispersée qui reçoit un owner">
        <rect x="20" y="32" width="54" height="40" rx="5" transform="rotate(-6 20 32)" />
        <rect x="23" y="108" width="54" height="40" rx="5" transform="rotate(4 23 108)" />
        <rect x="203" y="32" width="54" height="40" rx="5" transform="rotate(6 203 32)" />
        <rect x="202" y="108" width="54" height="40" rx="5" transform="rotate(-4 202 108)" />
        <path className="mayday-sketch__dash" d="M78 56 112 78M79 126l33-22M202 56l-34 22M201 126l-33-22" />
        <circle cx="140" cy="92" r="44" />
        <path d="M121 78c12-6 25-4 38 2v34c-13-6-26-8-38-2V78Zm38 2v34" />
        <circle cx="140" cy="34" r="9" className="mayday-sketch__soft-fill" />
        <path d="M134 34h12M140 28v12" />
        <text x="140" y="160" textAnchor="middle">OWNER + GOUVERNANCE</text>
      </svg>
    );
  }

  if (id === "distributed-support") {
    return (
      <svg viewBox="0 0 280 180" role="img" aria-label="Une même connaissance distribuée entre plusieurs équipes">
        <circle cx="140" cy="88" r="36" />
        <path d="M122 78h36M122 89h29M122 100h36" />
        <path className="mayday-sketch__dash" d="M108 67 74 43M172 67l34-24M105 108l-37 26M175 108l37 26" />
        <rect x="24" y="24" width="58" height="38" rx="7" />
        <rect x="198" y="24" width="58" height="38" rx="7" />
        <rect x="18" y="125" width="66" height="38" rx="7" />
        <rect x="196" y="125" width="66" height="38" rx="7" />
        <text x="53" y="48" textAnchor="middle">INTERNE</text>
        <text x="227" y="48" textAnchor="middle">BPO</text>
        <text x="51" y="149" textAnchor="middle">PAYS A</text>
        <text x="229" y="149" textAnchor="middle">PAYS B</text>
        <text x="140" y="92" textAnchor="middle">SOURCE</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 280 180" role="img" aria-label="La complexité opérationnelle dépasse la capacité des procédures">
      <path d="M32 140h218M42 140V28" />
      <path d="M48 130c32-5 45-21 68-28 28-8 40-1 61-28 17-22 31-25 61-43" />
      <path className="mayday-sketch__dash" d="M58 128 86 96l30 6 30-42 31 14 30-39" />
      <circle cx="116" cy="102" r="5" className="mayday-sketch__fill" />
      <circle cx="177" cy="74" r="5" className="mayday-sketch__fill" />
      <rect x="61" y="48" width="52" height="30" rx="5" />
      <rect x="158" y="112" width="76" height="30" rx="5" />
      <text x="87" y="67" textAnchor="middle">MARCHÉ</text>
      <text x="196" y="131" textAnchor="middle">PROCÉDURES</text>
      <text x="143" y="164" textAnchor="middle">COMPLEXITÉ</text>
    </svg>
  );
}

function SignalPlay({ play }: { play: MaydaySignalPlay }) {
  return (
    <article className="mayday-playbook__play" data-play={play.number}>
      <div className="mayday-playbook__play-side">
        <span className="mayday-playbook__play-number">{play.number}</span>
        <div className="mayday-playbook__sketch">
          <SignalSketch id={play.id} />
        </div>
        <span className="mayday-playbook__freshness">Fenêtre · {play.freshness}</span>
      </div>

      <div className="mayday-playbook__play-content">
        <header>
          <h3>{play.title}</h3>
          <p>{play.summary}</p>
          <div className="mayday-playbook__play-anatomy" aria-label="Anatomie du signal">
            <span>Détecter</span>
            <span>Confirmer</span>
            <span>Exclure</span>
            <span>Router</span>
          </div>
        </header>

        <div className="mayday-playbook__play-details">
          <div className="mayday-playbook__detail mayday-playbook__detail--wide">
            <span>Ce qui est observable</span>
            <p>{play.observable}</p>
          </div>
          <div className="mayday-playbook__detail mayday-playbook__detail--wide">
            <span>Sources à surveiller</span>
            <ToolChips tools={play.tools} />
          </div>
          <div className="mayday-playbook__detail">
            <span>Ce qui confirme le signal</span>
            <p>{play.confirmation}</p>
          </div>
          <div className="mayday-playbook__detail mayday-playbook__detail--reject">
            <span>À exclure</span>
            <p>{play.falsePositive}</p>
          </div>
          <div className="mayday-playbook__detail">
            <span>Buyer group</span>
            <p>{play.personas}</p>
          </div>
          <div className="mayday-playbook__detail">
            <span>Activation Mayday</span>
            <p>{play.activation}</p>
          </div>
        </div>

        <footer>
          <span>Preuves Mayday</span>
          {play.proofs.map((proof) => (
            <a href={proof.href} target="_blank" rel="noreferrer" key={proof.href}>
              {proof.label} ↗
            </a>
          ))}
        </footer>
      </div>
    </article>
  );
}

function IntroSystem() {
  return (
    <ol className="mayday-playbook__intro-system" aria-label="Résumé du système signal vers action">
      {INTRO_STAGES.map((stage) => (
        <li key={stage.number}>
          <span>{stage.number}</span>
          <div>
            <strong>{stage.label}</strong>
            <small>{stage.copy}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}

function EvidenceMap() {
  return (
    <figure className="mayday-playbook__evidence-map" aria-labelledby="mayday-evidence-caption">
      <figcaption id="mayday-evidence-caption">
        <span>Lecture des cas Mayday</span>
        <strong>Le besoin apparaît quand l’opération change de forme.</strong>
      </figcaption>

      <div className="mayday-playbook__evidence-stage">
        <div className="mayday-playbook__evidence-center">
          <span>Moment commun</span>
          <strong>La manière de servir les clients vient de changer.</strong>
          <small>La connaissance devient un risque ou un prérequis.</small>
        </div>

        {EVIDENCE_POINTS.map((point, index) => (
          <article
            className={`mayday-playbook__evidence-point mayday-playbook__evidence-point--${point.id}`}
            key={point.id}
          >
            <span>{String(index + 1).padStart(2, "0")} · {point.eyebrow}</span>
            <strong>{point.title}</strong>
            <p>{point.copy}</p>
            <a href={point.href} target="_blank" rel="noreferrer">{point.proof} ↗</a>
          </article>
        ))}
      </div>
    </figure>
  );
}

function CalibrationLoop() {
  return (
    <div className="mayday-playbook__calibration-system">
      <div className="mayday-playbook__calibration-loop" aria-label="Boucle de calibration continue">
        <span className="mayday-playbook__calibration-kicker">Boucle de feedback</span>
        <svg viewBox="0 0 320 250" role="img" aria-label="Détecter, revoir, apprendre puis ajuster les règles">
          <defs>
            <marker id="mayday-loop-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>
          <path className="mayday-loop__orbit" d="M77 65c55-47 142-39 180 19 36 54 17 126-42 153-56 26-126 5-151-47-17-36-11-82 13-112" markerEnd="url(#mayday-loop-arrow)" />
          <circle cx="79" cy="60" r="23" />
          <circle cx="257" cy="96" r="23" />
          <circle cx="197" cy="220" r="23" />
          <circle cx="63" cy="174" r="23" />
          <text x="79" y="64" textAnchor="middle">01</text>
          <text x="257" y="100" textAnchor="middle">02</text>
          <text x="197" y="224" textAnchor="middle">03</text>
          <text x="63" y="178" textAnchor="middle">04</text>
        </svg>
        <div className="mayday-playbook__calibration-center">
          <strong>Règles</strong>
          <span>plus utiles à chaque cycle</span>
        </div>
        <ol>
          <li><span>01</span> Détecter</li>
          <li><span>02</span> Revoir</li>
          <li><span>03</span> Mesurer</li>
          <li><span>04</span> Ajuster</li>
        </ol>
      </div>

      <div className="mayday-playbook__metrics">
        {MAYDAY_CALIBRATION_METRICS.map((metric) => (
          <article key={metric.value}>
            <span>{metric.value}</span>
            <strong>{metric.label}</strong>
            <p>{metric.copy}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function MaydayIntentSystem() {
  const { founder } = ABOUT_CONTENT;

  return (
    <article className="mayday-playbook">
      <header className="mayday-playbook__intro">
        <div className="mayday-playbook__intro-rail">
          <span>Private GTM note</span>
          <span>Prepared for Mayday</span>
          <Brand className="mayday-playbook__brand" />
        </div>

        <div className="mayday-playbook__intro-copy">
          <span className="lp-module__label">Signal-to-action system</span>
          <h1>
            Détecter les projets de Knowledge Management
            <span>avant qu’ils deviennent évidents.</span>
          </h1>
          <p>
            Une proposition de système pour repérer le moment où une initiative
            IA, une organisation support distribuée ou une nouvelle complexité
            opérationnelle rend la connaissance prioritaire.
          </p>
          <p className="mayday-playbook__ink-note">
            De « l’IA qui sait » à un GTM qui sait quand agir.
          </p>
        </div>

        <div className="mayday-playbook__byline">
          <Image
            src={withBasePath(founder.avatarPhoto)}
            alt=""
            width={40}
            height={40}
            sizes="40px"
            priority
          />
          <span>
            <strong>{founder.name}</strong>
            <small>Lever · AI &amp; GTM systems</small>
          </span>
          <time dateTime="2026-08">Août 2026</time>
        </div>

        <IntroSystem />
      </header>

      <div className="mayday-playbook__layout">
        <main className="mayday-playbook__main">
          <MaydaySection id="lecture" className="mayday-playbook__section--lecture">
            <SectionHeading
              label="01 · Ma lecture"
              title={
                <>
                  Le signal n’est pas « ils veulent une base de connaissances ».
                  <span className="lp-module__title-accent">
                    Leur manière de servir les clients vient de changer.
                  </span>
                </>
              }
              sub={
                <>
                  J’ai relu les cas Mayday comme des points de rupture
                  opérationnels, pas comme des témoignages produit. Le motif
                  commun est une organisation qui change plus vite que ses
                  procédures ne circulent.
                </>
              }
            />

            <blockquote className="mayday-playbook__thesis">
              <p>
                Le système ne cherche donc pas une intention déclarée. Il cherche
                le changement qui transforme la connaissance en
                {" "}
                <InkAnnotate variant="underline">risque opérationnel</InkAnnotate>
                {" "}ou en prérequis à l’IA.
              </p>
            </blockquote>

            <EvidenceMap />
          </MaydaySection>

          <MaydaySection id="fit">
            <SectionHeading
              label="02 · Filtre ICP"
              title={
                <>
                  Avant de chercher le signal,
                  <span className="lp-module__title-accent">vérifier que le compte mérite la veille.</span>
                </>
              }
              sub="Le signal ne compense pas un mauvais fit. Trois conditions sont obligatoires ; la stack reste une information de contexte."
            />

            <div className="mayday-playbook__fit-grid">
              {MAYDAY_QUALIFICATION_GATES.map((gate, index) => (
                <article key={gate.id} className={gate.required ? "is-required" : "is-context"}>
                  <header>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <small>{gate.label}</small>
                  </header>
                  <h3>{gate.title}</h3>
                  <p>{gate.copy}</p>
                </article>
              ))}
            </div>

            <div className="mayday-playbook__fit-equation" aria-label="Règle de qualification ICP">
              <span>Opération support</span>
              <b>+</b>
              <span>Complexité</span>
              <b>+</b>
              <span>Connaissance opérationnelle</span>
              <b>=</b>
              <strong>Compte à monitorer</strong>
            </div>
            <p className="mayday-playbook__margin-note">Une stack CX n’est jamais un signal.</p>
          </MaydaySection>

          <MaydaySection id="moments" className="mayday-playbook__section--moments">
            <SectionHeading
              label="03 · Moments de bascule"
              title={
                <>
                  Quatre changements à détecter.
                  <span className="lp-module__title-accent">Toujours avec une preuve et un contre-signal.</span>
                </>
              }
              sub="Chaque play combine un événement observable, une confirmation et une règle d’exclusion. L’objectif est de détecter tôt sans confondre bruit et intention."
            />

            <div className="mayday-playbook__plays">
              {MAYDAY_SIGNAL_PLAYS.map((play) => (
                <SignalPlay play={play} key={play.id} />
              ))}
            </div>
          </MaydaySection>

          <MaydaySection id="workflow">
            <SectionHeading
              label="04 · Workflow"
              title={
                <>
                  De l’événement brut au brief utile.
                  <span className="lp-module__title-accent">Pas de séquence automatique entre les deux.</span>
                </>
              }
              sub="Clay orchestre la veille et les conditions. Le CRM ne reçoit que les comptes dont le fit et le moment sont démontrés."
            />

            <div className="mayday-playbook__workflow-panel">
              <ol className="mayday-playbook__workflow-steps">
                {MAYDAY_WORKFLOW_STAGES.map((stage) => (
                  <li key={stage.number}>
                    <span>{stage.number}</span>
                    <div>
                      <strong>{stage.title}</strong>
                      <p>{stage.copy}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mayday-playbook__decision">
                <span className="mayday-playbook__decision-label">Règle de décision</span>
                <div className="mayday-playbook__decision-grid">
                  <div className="mayday-playbook__rule-card">
                    <span>SI</span>
                    <p>fit validé</p>
                    <b>+</b>
                    <p>événement frais</p>
                    <b>+</b>
                    <p>preuve directe ou corroborée</p>
                    <strong>→ REVIEW</strong>
                  </div>
                  <div className="mayday-playbook__states">
                    <article>
                      <span>Ignore</span>
                      <p>Pas de fit. Rien n’est enrichi.</p>
                    </article>
                    <article>
                      <span>Watch</span>
                      <p>Fit présent, preuve encore faible.</p>
                    </article>
                    <article>
                      <span>Review</span>
                      <p>Fit, timing et preuve à valider humainement.</p>
                    </article>
                  </div>
                </div>
              </div>
            </div>

            <div className="mayday-playbook__tool-strip" aria-label="Outils du workflow">
              <div>
                <span>Stack proposée</span>
                <strong>Les sources alimentent Clay ; Clay applique les règles.</strong>
              </div>
              <ToolChips tools={MAYDAY_TOOLS} />
            </div>
          </MaydaySection>

          <MaydaySection id="brief">
            <SectionHeading
              label="05 · Brief CRM"
              title={
                <>
                  Ce que Marketing et Sales reçoivent.
                  <span className="lp-module__title-accent">Une preuve à juger, pas un lead à appeler.</span>
                </>
              }
            />

            <article className="mayday-playbook__brief-card">
              <header>
                <div>
                  <span>Statut · Review</span>
                  <strong>Projet IA service client en phase de mise en œuvre</strong>
                </div>
                <small>Exemple de sortie — aucun compte réel</small>
              </header>
              <dl>
                <div>
                  <dt>Pourquoi maintenant</dt>
                  <dd>Une offre recrute un Product Manager chargé de déployer un agent conversationnel pour le support.</dd>
                </div>
                <div>
                  <dt>Preuve</dt>
                  <dd>Citation exacte, URL, date de publication et source archivée.</dd>
                </div>
                <div>
                  <dt>Confirmation</dt>
                  <dd>Le poste cite la centralisation, la qualité et la maintenance des contenus utilisés par l’agent.</dd>
                </div>
                <div>
                  <dt>Buyer group</dt>
                  <dd>VP Customer Care · AI Transformation Lead · Knowledge Lead.</dd>
                </div>
                <div>
                  <dt>Angle Mayday</dt>
                  <dd>Fiabiliser la connaissance avant de la donner à l’agent ; rattacher le brief au cas BoursoBank.</dd>
                </div>
                <div>
                  <dt>Prochaine vérification</dt>
                  <dd>Confirmer le périmètre customer service et vérifier si une solution de Knowledge Management est déjà sélectionnée.</dd>
                </div>
              </dl>
              <footer>
                <span>Human review required</span>
                <p>Aucun contact n’est inscrit automatiquement dans une séquence.</p>
              </footer>
            </article>
          </MaydaySection>

          <MaydaySection id="calibration">
            <SectionHeading
              label="06 · Calibration"
              title={
                <>
                  Le système apprend du terrain.
                  <span className="lp-module__title-accent">Pas d’un score inventé au départ.</span>
                </>
              }
              sub="Les règles sont utiles seulement si Marketing et Sales peuvent dire pourquoi un signal était bon, mauvais ou trop tardif."
            />

            <CalibrationLoop />

            <aside className="mayday-playbook__closing-note">
              <span>Ma lecture extérieure</span>
              <h2>
                Est-ce que cela ressemble à votre réalité,
                <em> ou est-ce que je suis à côté de la plaque ?</em>
              </h2>
              <p>
                Sur les signaux, leur timing, ou même le besoin lui-même. Je
                serais aussi curieux de savoir si vos priorités actuelles sont
                complètement ailleurs.
              </p>
              <p className="mayday-playbook__closing-signature">Alexis</p>
            </aside>
          </MaydaySection>

          <footer className="mayday-playbook__references">
            <span className="lp-module__label">Sources</span>
            <h2>Recherche et documentation utilisées.</h2>
            <ol>
              {MAYDAY_REFERENCES.map((reference) => (
                <li key={reference.href}>
                  <a href={reference.href} target="_blank" rel="noreferrer">
                    {reference.label} ↗
                  </a>
                </li>
              ))}
            </ol>
          </footer>
        </main>

        <aside className="mayday-playbook__side-nav" aria-label="Sections du playbook">
          <div className="mayday-playbook__side-card">
            <span>Signal-to-action</span>
            <svg viewBox="0 0 180 118" aria-hidden="true">
              <circle cx="28" cy="59" r="14" />
              <rect x="67" y="42" width="46" height="34" rx="6" />
              <circle cx="151" cy="59" r="14" />
              <path d="M42 59h25m46 0h24M57 54l10 5-10 5m70-10 10 5-10 5" />
              <path d="M79 53h22M79 64h16" />
            </svg>
          </div>
          <nav>
            <ol>
              {NAV_ITEMS.map((item, index) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
      </div>
    </article>
  );
}
