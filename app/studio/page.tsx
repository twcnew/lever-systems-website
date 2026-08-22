import type { Metadata } from "next";
import { Drawer, TopNav } from "@/components/Chrome";
import { SiteFooter } from "@/components/lp/SiteFooter";
import { StudioNavTheme } from "@/components/studio/StudioNavTheme";
import { withBasePath } from "@/lib/basePath";

export const metadata: Metadata = {
  title: "Studio — Templates",
  robots: { index: false, follow: false },
};

type Template = {
  href: string;
  thumb: string;
  thumbAlt: string;
  title: string;
  description: string;
  tag: string;
};

const TEMPLATES: Template[] = [
  {
    href: "/studio/signals",
    thumb: "/studio/signals-map.png",
    thumbAlt: "2026 Signal Map — three concentric rings of buyer intent",
    title: "Signals Map",
    description:
      "Three concentric rings — first, second, third-party. The map that makes the score defendable.",
    tag: "Liquid glass",
  },
  {
    href: "/studio/spine",
    thumb: "/studio/spine-glass.gif",
    thumbAlt: "Spine — capture, score, human-in-the-loop, route",
    title: "Spine",
    description:
      "Capture → score → HITL → route. The end-to-end flowchart with a human in the loop.",
    tag: "Liquid glass",
  },
  {
    href: "/studio/funnel",
    thumb: "/studio/funnel.png",
    thumbAlt: "Solo GTM Funnel — four stages, lead generation to conversation",
    title: "GTM Funnel",
    description:
      "Four stages, lead generation to conversation. The tech stack I run end to end.",
    tag: "Liquid glass",
  },
  {
    href: "/studio/pyramid",
    thumb: "/studio/pyramid.png",
    thumbAlt: "GTM Pyramid — five layers, foundation to predictable pipeline",
    title: "GTM Pyramid",
    description:
      "Five layers, foundation to peak. Build bottom-up or pipeline stays random.",
    tag: "Liquid glass",
  },
  {
    href: "/studio/flywheel",
    thumb: "/studio/flywheel.png",
    thumbAlt:
      "How Pipeline Multiplies — light blue, violet and cyan GTM flywheel",
    title: "Pipeline Multiplies",
    description:
      "Content, ads and outbound aligned on one ICP. Three coordinated channels turn isolated touches into a compounding GTM flywheel.",
    tag: "Liquid glass",
  },
  {
    href: "/studio/channel-matrix",
    thumb: "/studio/channel-matrix.png",
    thumbAlt:
      "Outbound Channel Matrix — Cold Email vs LinkedIn DMs vs Cold Calling",
    title: "Outbound Channel Matrix",
    description:
      "Ten factors, three outbound channels. Match email, LinkedIn and calling to the right account tier.",
    tag: "Liquid glass",
  },
  {
    href: "/studio/iceberg",
    thumb: "/studio/iceberg.png",
    thumbAlt: "GTM Iceberg — tip above the waterline, systems below",
    title: "GTM Iceberg",
    description:
      "The meetings are the tip. The systems are the 90% underneath. Systems compound.",
    tag: "Liquid glass",
  },
];

export default function StudioIndexRoute() {
  return (
    <>
      <StudioNavTheme />
      <TopNav />
      <Drawer />

      <main id="main" className="studio-spine">
        <div className="lp lp--clay">
          <header className="studio-spine__intro">
            <p className="studio-spine__label">Studio</p>
            <h1 className="studio-spine__page-title">Templates.</h1>
            <p className="studio-spine__lede">
              The visuals I build for LinkedIn — each one a 4:5 poster, screenshot
              ready. Pick one to open the full asset.
            </p>
          </header>

          <section className="studio-gallery">
            {TEMPLATES.map((tpl) => (
              <a key={tpl.href} href={tpl.href} className="studio-gallery__card">
                <span className="studio-gallery__thumb">
                  <img
                    src={withBasePath(tpl.thumb)}
                    alt={tpl.thumbAlt}
                    loading="lazy"
                  />
                </span>
                <span className="studio-gallery__body">
                  <span className="studio-gallery__head">
                    <span className="studio-gallery__title">{tpl.title}</span>
                    <span className="studio-gallery__tag">{tpl.tag}</span>
                  </span>
                  <span className="studio-gallery__desc">{tpl.description}</span>
                  <span className="studio-gallery__cta">Open template →</span>
                </span>
              </a>
            ))}
          </section>
        </div>

        <div className="lp lp--clay cs-closing-band">
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
