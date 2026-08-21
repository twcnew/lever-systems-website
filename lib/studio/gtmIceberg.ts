export type IcebergSection = {
  id: "above" | "surface" | "deep";
  label: string;
  tag: string;
  arrow: string;
  items: string[];
};

export const ICEBERG_TITLE = "The Iceberg of GTM";
export const ICEBERG_TITLE_ACCENT = "Iceberg";
export const ICEBERG_KICKER =
  "Everyone sees the meetings. Nobody sees the systems that book them.";
export const ICEBERG_KICKER_ACCENT = "systems";

export const ICEBERG_PRINCIPLE =
  "Tactics peak. Systems compound. The tip is a byproduct of the layer nobody sees.";

export const ICEBERG_SECTIONS: IcebergSection[] = [
  {
    id: "above",
    label: "Above the waterline",
    tag: "What everyone sees",
    arrow: "Results everyone wants",
    items: [
      "Leads",
      "Revenue pipeline",
      "Followers",
      "Brand awareness",
      "Clients' trust",
    ],
  },
  {
    id: "surface",
    label: "Just below the surface",
    tag: "The actual work",
    arrow: "The actual work behind",
    items: [
      "Copywriting",
      "SEO and email",
      "Content and social",
      "Data analysis",
      "Experimentation",
      "Video production",
      "CRO",
    ],
  },
  {
    id: "deep",
    label: "Deep",
    tag: "What most forget",
    arrow: "What most forget",
    items: [
      "Positioning",
      "Messaging",
      "Customer research",
      "Value proposition",
      "Systems creation",
      "Discipline and consistency",
      "Problem solving",
      "Business strategy",
    ],
  },
];
