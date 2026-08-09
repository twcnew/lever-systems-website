export const FOOTER_CONTENT = {
  subscribe: {
    label: "Subscribe for GTM system notes and playbook updates.",
    placeholder: "you@company.com",
    comingSoon: "Newsletter coming soon.",
  },
  author: {
    label: "Built by",
  },
  brand: {
    name: "Lever",
    tagline: "Personalized AI systems for GTM teams",
  },
  social: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/alexis-rodrigues1/" },
    { label: "X", href: "https://x.com/twicewest94" },
  ],
  get year() {
    return new Date().getFullYear();
  },
};
