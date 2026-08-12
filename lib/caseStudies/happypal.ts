import type { CaseStudy } from "./types";

export const happypalCaseStudy: CaseStudy = {
  slug: "happypal",
  logoId: "happypal",
  company: "HappyPal",
  companyDescription:
    "HappyPal is a digital CSE platform for employee benefits, including gift cards, ticketing, subsidies, and internal communication. Series A (€7M, Educapital & Anthemis), 500K+ beneficiaries, with clients including LVMH, Société Générale, and RATP.",
  websiteUrl: "https://www.happypal.com",
  industry: "Employee benefits / CSE platform",
  headquarters: "Paris, France",
  brandColor: "#02B6AA",
  heroHeadline:
    "An always-on pipeline that books enterprise CSE meetings",
  heroImage: {
    src: "/case-studies/happypal-hero.png",
    alt: "HappyPal wordmark with impasto paint texture",
  },
  sideNavImage: {
    src: "/case-studies/happypal-side-nav.webp",
    alt: "HappyPal H mark with impasto paint texture",
  },
  heroMetrics: [
    {
      value: "Adobe+",
      label: "enterprise CSE meetings at AWS, TotalEnergies, LEGO, BlaBlaCar",
      variant: "blue",
    },
    {
      value: "10+",
      label: "qualified meetings booked every week",
      variant: "violet",
    },
    {
      value: "41%",
      label: "referral response via HR & Sales",
      variant: "violet",
    },
  ],
  heroQuote:
    "We built a pipeline that books 10+ enterprise CSE meetings every week at Adobe, AWS, TotalEnergies, LEGO, and BlaBlaCar.",
  intro: [
    "After its Series A, HappyPal needed commercial growth toward one million users. The market is huge: every French company with 11+ employees has a CSE (works council). Finding the buyer was the blocker.",
    "A CSE elected official is an everyday employee (accountant, developer, HR assistant) elected by colleagues to manage the committee. That role doesn’t show up in Apollo, LinkedIn Sales Navigator, or ZoomInfo. Reps couldn’t buy the list.",
  ],
  featuredQuote: {
    text: "From kickoff to delivery, the collaboration was seamless and the work was impeccable. I'd recommend them without hesitation.",
    author: "Eddy Frodé",
    role: "Head of Growth",
    avatarSrc: "/testimonials/eddy-frode-happypal-proof.webp",
  },
  heroPopoverQuote:
    "From kickoff to delivery, the collaboration was **seamless and the work was impeccable** — I'd recommend them without hesitation.",
  proofMetric: { value: "10+", label: "qualified meetings / week" },
  impactHighlights: [
    "Enterprise CSE meetings at **Adobe, AWS, TotalEnergies, LEGO, BlaBlaCar, Dell, BNP Paribas, Sopra Steria, Nexity, and Groupama**",
    "**10+** qualified meetings booked every week across BDRs and AEs",
    "**41%** response rate on the automated HR & Sales referral channel, 8 to 12× cold email",
    "Full sales team fed with call-ready CSE leads, **zero manual prospecting**",
    "Domain → enriched contact → live campaign in **under 2 minutes**",
  ],
  problem: {
    title: "The problem",
    titleAccent: "problem",
    body: [
      "HappyPal’s ICP is CSE elected officials. \"Élu CSE\" isn’t a LinkedIn title, isn’t a full-time role, and isn’t a firmographic filter you can buy. Professional emails for elected officials are often personal addresses or simply unreachable through classic enrichment tools.",
      "The sales team worked by hand: manual research, word of mouth, cold calls to company switchboards asking \"who manages the CSE?\" It worked, but it didn’t scale. Reps spent more time finding the right contact than selling.",
    ],
  },
  solution: {
    title: "The solution",
    titleAccent: "solution",
    body: [
      "We ran four identification channels in parallel.",
      "Competitive market mapping gave the team thousands of pre-qualified CSE contacts. An AI workflow turns a single domain into a verified CSE contact. Pattern-based email generation produces deliverable addresses enrichment vendors miss. An automated referral channel asks HR and Sales who runs the CSE.",
      "Clay, Smartlead, HubSpot, and Slack wire detection into outreach: the first channel that finds the contact wins, then multi-channel sequences take over.",
      "The pipeline runs continuously and feeds Sales with verified CSE contacts without manual ops.",
    ],
  },
  useCases: [
    {
      number: "01",
      title: "Mapping the active CSE market",
      titleAccent: "CSE market",
      navLabel: "Market mapping",
      body: [
        "Before building the detection engine, we mapped the active market. Several competitor platforms had exposed endpoints: publicly accessible directories and APIs without proper authentication. We extracted their full client bases: CSE names, elected officials, company names, and committee sizes.",
        "That produced thousands of pre-qualified contacts already on a competing platform, already category-aware, and open to switching. HappyPal started with a map of the active CSE market instead of an empty list.",
      ],
      bullets: [
        "Full competitive client base extracted via exposed public endpoints",
        "Thousands of pre-qualified CSE contacts as pipeline foundation",
        "Contacts already category-aware and potentially switch-ready",
      ],
      visual: {
        src: "/case-studies/happypal-use-case-01-market-map.jpg",
        alt: "Hand-drawn flow: competitor directories via public endpoints into an active CSE market map of France.",
        caption: "Competitive CSE market map",
      },
    },
    {
      number: "02",
      title: "One domain in, one CSE contact out",
      titleAccent: "CSE contact out",
      navLabel: "Domain → CSE contact",
      body: [
        "The commercial team pastes a company domain. AI agents scan the website and social pages for CSE mentions, pull search results for works-council names, cross-check LinkedIn for the likeliest profile, and enrich the contact.",
        "The result lands in three places at once: HubSpot (contact created or updated), Slack (lead summary for Sales), and the right outreach campaign. From paste to email sent: under 2 minutes, with no other human step.",
        "Every domain keeps the engine warm. Reps get call-ready leads in Slack and HubSpot without waiting for the next campaign batch.",
      ],
      bullets: [
        "Website, search, and LinkedIn analysis via AI agents",
        "Automatic push to HubSpot, Slack, and campaign enrollment",
        "Under 2 minutes from domain input to outreach live",
      ],
      visual: {
        src: "/case-studies/happypal-use-case-02-domain-contact.jpg",
        alt: "Hand-drawn pipeline: domain → AI agents → CSE profile → HubSpot, Slack, and campaign in under 2 minutes.",
        caption: "Domain in, CSE contact out",
      },
    },
    {
      number: "03",
      title: "Proprietary email generation at scale",
      titleAccent: "at scale",
      navLabel: "Email generation",
      body: [
        "When classic enrichment tools can’t find an elected official’s email, which is most of the time, we don’t stop. We read the company’s email format (firstname.lastname@, f.lastname@, firstname@, etc.), generate every plausible address for that contact, and run bulk SMTP verification.",
        "That yields verified emails Hunter, Apollo, and Dropcontact don’t have: 12,000+ verified emails at 95% deliverability.",
      ],
      visual: {
        src: "/case-studies/happypal-use-case-03-email-gen.jpg",
        alt: "Hand-drawn email pattern generation into SMTP verification and a verified inbox pool.",
        caption: "Proprietary email generation",
      },
    },
    {
      number: "04",
      title: "Automated referral via HR & Sales",
      titleAccent: "HR & Sales",
      navLabel: "Referral channel",
      body: [
        "Instead of hunting the CSE elected official first, we ask the people inside the company who already know: HR and Sales.",
        "The system finds HR and Sales profiles at the target company and sends a short, non-commercial note: \"We're trying to reach the person in charge of the CSE at [company]. Could you point us in the right direction?\" HR knows every elected official; asking costs them almost nothing and sells nothing.",
        "Response rate on this channel: 41%. Nearly one in two contacts names the elected official, 8 to 12× classic cold email.",
      ],
      bullets: [
        "RH/Sales referral: 41% response, high-quality introductions",
        "Classic cold email: 3–5% response",
        "Switchboard calls: ~10%, often wrong contact",
      ],
      visual: {
        src: "/case-studies/happypal-use-case-04-referral.jpg",
        alt: "Hand-drawn referral flow from HR and Sales asking who runs the CSE, with a 41% response callout.",
        caption: "Automated HR & Sales referral",
      },
    },
  ],
  impact: {
    title: "Impact",
    titleAccent: "Impact",
    body: [
      "The pipeline books **10+** qualified CSE meetings a week at companies like Adobe, AWS, TotalEnergies, LEGO, and BlaBlaCar, and feeds BDRs and AEs without manual prospecting.",
      "Each elected official the system finds is a contact enrichment tools didn’t already have.",
      "Competitive mapping, AI agents, email generation, and HR/Sales referral keep that flow stocked. Referral alone replies at **41%**.",
    ],
    quote: {
      text: "From kickoff to delivery, the collaboration was seamless and the work was impeccable. I'd recommend them without hesitation.",
      author: "Eddy Frodé",
      role: "Head of Growth",
      avatarSrc: "/testimonials/eddy-frode-happypal.webp",
    },
    metrics: [
      {
        value: "Adobe+",
        label: "enterprise CSE meetings at AWS, TotalEnergies, LEGO, BlaBlaCar",
        variant: "blue",
      },
      {
        value: "10+",
        label: "qualified meetings booked every week",
        variant: "violet",
      },
      {
        value: "41%",
        label: "referral response via HR & Sales",
        variant: "violet",
      },
    ],
  },
  relatedSlugs: ["swan", "flex"],
  relatedSubtitle:
    "Other GTM systems for messy ICPs and real sales teams.",
  indexCard: {
    headline:
      "An always-on pipeline that books enterprise CSE meetings",
  },
  wallSnippet:
    "10+ enterprise CSE meetings every week at Adobe, AWS, TotalEnergies, LEGO, BlaBlaCar.",
  seo: {
    title: "HappyPal Case Study — Lever",
    description:
      "How Lever helped HappyPal build a pipeline that books 10+ enterprise CSE meetings every week at Adobe, AWS, TotalEnergies, LEGO, and BlaBlaCar.",
  },
};
