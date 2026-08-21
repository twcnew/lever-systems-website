import type { Metadata } from "next";
import { SpineStudioPage } from "@/components/studio/SpineStudioPage";

export const metadata: Metadata = {
  title: "Studio — Spine",
  robots: { index: false, follow: false },
};

export default function SpineStudioRoute() {
  return <SpineStudioPage />;
}
