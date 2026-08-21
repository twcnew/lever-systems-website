"use client";

import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import { SPINE_POST } from "@/lib/studio/spinePost";
import { Drawer, TopNav } from "@/components/Chrome";
import { SiteFooter } from "@/components/lp/SiteFooter";
import { SpineAsset } from "@/components/studio/SpineAsset";
import { SpineModernAsset } from "@/components/studio/SpineModernAsset";
import { StudioNavTheme } from "@/components/studio/StudioNavTheme";

export function SpineStudioPage() {
  const { founder } = ABOUT_CONTENT;

  return (
    <>
      <StudioNavTheme />
      <TopNav />
      <Drawer />

      <main id="main" className="studio-spine">
        <div className="lp lp--clay">
          <header className="studio-spine__intro">
            <p className="studio-spine__label">Studio</p>
            <p className="studio-spine__draft-kicker">{SPINE_POST.label}</p>
            <article className="studio-spine__composer">
              <header className="studio-spine__composer-head">
                <img
                  className="studio-spine__composer-avatar"
                  src={withBasePath(founder.photo)}
                  alt=""
                  width={48}
                  height={48}
                />
                <div className="studio-spine__composer-meta">
                  <p className="studio-spine__composer-name">{founder.name}</p>
                  <p className="studio-spine__composer-role">{founder.role}</p>
                </div>
                <span className="studio-spine__composer-badge">
                  {SPINE_POST.badge}
                </span>
              </header>
              <div className="studio-spine__composer-body">
                {SPINE_POST.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </article>
            <h1 className="studio-spine__page-title">
              Spine flowchart. White field.
            </h1>
            <p className="studio-spine__lede">
              Type 01: four zones, split-cards, soft-corner ink wiring, HITL fork.
              Screenshot the 4:5 poster.
            </p>
          </header>

          <div className="studio-spine__stage">
            <div className="studio-spine__poster">
              <SpineAsset />
            </div>
            <p className="studio-spine__variant-label">Modern variant — liquid glass</p>
            <div className="studio-spine__poster studio-spine__poster--modern">
              <SpineModernAsset />
            </div>
          </div>
        </div>

        <div className="lp lp--clay cs-closing-band">
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
