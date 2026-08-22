import type { Metadata } from "next";
import { Drawer, TopNav } from "@/components/Chrome";
import { SiteFooter } from "@/components/lp/SiteFooter";
import { MaydayIntentSystem } from "@/components/studio/MaydayIntentSystem";
import { StudioNavTheme } from "@/components/studio/StudioNavTheme";

export const metadata: Metadata = {
  title: "Mayday — Signal-to-action playbook",
  description:
    "Une proposition de système GTM pour détecter, prouver et router les moments où la connaissance devient prioritaire.",
  robots: { index: false, follow: false },
};

export default function MaydaySignalsStudioRoute() {
  return (
    <>
      <StudioNavTheme />
      <TopNav />
      <Drawer />

      <main id="main" className="studio-spine mayday-system-page">
        <div className="lp lp--clay">
          <MaydayIntentSystem />
        </div>

        <div className="lp lp--clay cs-closing-band">
          <SiteFooter />
        </div>
      </main>
    </>
  );
}
