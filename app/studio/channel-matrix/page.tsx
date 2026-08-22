import type { Metadata } from "next";
import { Drawer, TopNav } from "@/components/Chrome";
import { SiteFooter } from "@/components/lp/SiteFooter";
import { ChannelMatrixAsset } from "@/components/studio/ChannelMatrixAsset";
import { StudioNavTheme } from "@/components/studio/StudioNavTheme";

export const metadata: Metadata = {
  title: "Studio — Outbound Channel Matrix",
  robots: { index: false, follow: false },
};

export default function ChannelMatrixStudioRoute() {
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
              Outbound channel matrix. Liquid glass.
            </h1>
            <p className="studio-spine__lede">
              Cold email, LinkedIn DMs or cold calling — matched to the right
              account tier. Screenshot the 4:5 poster.
            </p>
          </header>

          <div className="studio-spine__stage studio-spine__stage--channel-matrix">
            <p className="studio-spine__variant-label">Dark version</p>
            <div className="studio-spine__poster studio-spine__poster--modern studio-spine__poster--channel-matrix studio-spine__poster--channel-matrix-dark">
              <ChannelMatrixAsset theme="dark" />
            </div>

            <p className="studio-spine__variant-label">White version</p>
            <div className="studio-spine__poster studio-spine__poster--modern studio-spine__poster--channel-matrix studio-spine__poster--channel-matrix-light">
              <ChannelMatrixAsset theme="light" />
            </div>

            <p className="studio-spine__variant-label">Orange version</p>
            <div className="studio-spine__poster studio-spine__poster--modern studio-spine__poster--channel-matrix studio-spine__poster--channel-matrix-orange">
              <ChannelMatrixAsset theme="orange" />
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
