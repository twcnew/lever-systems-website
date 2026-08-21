import type { Metadata } from "next";
import { Drawer, TopNav } from "@/components/Chrome";
import { SiteFooter } from "@/components/lp/SiteFooter";
import { GtmFlywheelAsset } from "@/components/studio/GtmFlywheelAsset";
import { StudioNavTheme } from "@/components/studio/StudioNavTheme";

export const metadata: Metadata = {
  title: "Studio — How Pipeline Multiplies",
  robots: { index: false, follow: false },
};

export default function FlywheelStudioRoute() {
  return (
    <>
      <StudioNavTheme />
      <TopNav />
      <Drawer />

      <main id="main" className="studio-spine">
        <div className="lp lp--clay">
          <header className="studio-spine__intro">
            <p className="studio-spine__label">Studio</p>
            <h1 className="studio-spine__page-title">
              How pipeline multiplies. Liquid glass.
            </h1>
            <p className="studio-spine__lede">
              Content, ads and outbound on one ICP. Screenshot the 4:5 poster.
            </p>
          </header>

          <div className="studio-spine__stage studio-spine__stage--flywheel">
            <div className="studio-spine__poster studio-spine__poster--modern">
              <GtmFlywheelAsset />
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
