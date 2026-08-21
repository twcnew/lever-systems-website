import type { Metadata } from "next";
import { ABOUT_CONTENT } from "@/lib/aboutContent";
import { withBasePath } from "@/lib/basePath";
import { Drawer, TopNav } from "@/components/Chrome";
import { SiteFooter } from "@/components/lp/SiteFooter";
import { SignalsMapAsset } from "@/components/studio/SignalsMapAsset";
import { StudioNavTheme } from "@/components/studio/StudioNavTheme";
import { SIGNALS_POST } from "@/lib/studio/signalsPost";

export const metadata: Metadata = {
  title: "Studio — Signals map",
  robots: { index: false, follow: false },
};

export default function SignalsStudioRoute() {
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
            <p className="studio-spine__draft-kicker">{SIGNALS_POST.label}</p>
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
                  {SIGNALS_POST.badge}
                </span>
              </header>
              <div className="studio-spine__composer-body">
                {SIGNALS_POST.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </article>
            <h1 className="studio-spine__page-title">
              Signals map. Liquid glass.
            </h1>
            <p className="studio-spine__lede">
              Three concentric rings: first-party, second-party, third-party.
              Screenshot the 4:5 poster.
            </p>
          </header>

          <div className="studio-spine__stage">
            <div className="studio-spine__poster studio-spine__poster--modern">
              <SignalsMapAsset />
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
