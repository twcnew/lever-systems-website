import type { Metadata } from "next";
import { Drawer, TopNav } from "@/components/Chrome";
import { SiteFooter } from "@/components/lp/SiteFooter";
import { GtmIcebergAsset } from "@/components/studio/GtmIcebergAsset";
import { StudioNavTheme } from "@/components/studio/StudioNavTheme";

export const metadata: Metadata = {
  title: "Studio — GTM Iceberg",
  robots: { index: false, follow: false },
};

export default function IcebergStudioRoute() {
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
              GTM iceberg. Liquid glass.
            </h1>
            <p className="studio-spine__lede">
              Tip above the waterline, systems below. Screenshot the 4:5 poster.
            </p>
          </header>

          <div className="studio-spine__stage">
            <div className="studio-spine__poster studio-spine__poster--modern">
              <GtmIcebergAsset />
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
