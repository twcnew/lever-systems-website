import type { Metadata } from "next";
import { UseCasesPage } from "@/components/UseCasesPage";

export const metadata: Metadata = {
  title: "Customers",
  description:
    "Case studies from Seed to Series B teams — AI-native GTM systems Lever built inside their own tools.",
  openGraph: {
    title: "Customers — Lever",
    description:
      "Case studies from Seed to Series B teams — AI-native GTM systems Lever built inside their own tools.",
  },
};

export default function UseCases() {
  return <UseCasesPage />;
}
