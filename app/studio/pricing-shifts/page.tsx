import type { Metadata } from "next";
import { Drawer, TopNav } from "@/components/Chrome";
import { SiteFooter } from "@/components/lp/SiteFooter";
import { PricingShiftsAsset } from "@/components/studio/PricingShiftsAsset";
import { StudioNavTheme } from "@/components/studio/StudioNavTheme";

export const metadata: Metadata = {
  title: "Studio — How Pricing Shifts GTM",
  robots: { index: false, follow: false },
};

export default function PricingShiftsStudioRoute() {
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
              How pricing shifts GTM. Liquid glass.
            </h1>
            <p className="studio-spine__lede">
              Nineteen companies, three pricing models and the GTM motion each
              one creates. Screenshot the 4:5 poster.
            </p>
          </header>

          <div className="studio-spine__stage studio-spine__stage--pricing-shifts">
            <div className="studio-spine__poster studio-spine__poster--modern studio-spine__poster--pricing-shifts">
              <PricingShiftsAsset />
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
