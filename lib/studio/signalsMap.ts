export type SignalTool = {
  id: string;
  label: string;
  src: string;
};

export type SignalGroup = {
  id: string;
  label: string;
  tools: SignalTool[];
};

export type SignalRing = {
  id: "first" | "second" | "third";
  label: string;
  sublabel: string;
  groups: SignalGroup[];
};

export const SIGNALS_TITLE = "2026 Signal Map";
export const SIGNALS_TITLE_ACCENT = "2026 Signal Map";
export const SIGNALS_KICKER = "First, second, third — the three layers of buyer intent";
export const SIGNALS_KICKER_ACCENT = "buyer intent";
export const SIGNALS_RULE =
  "Mine the center first. Enrich outward. Stop when coverage is enough.";

export const SIGNALS_HUB = { label: "Clay", src: "/gtm/clay.png" };

export const SIGNALS_RINGS: SignalRing[] = [
  {
    id: "first",
    label: "First-party",
    sublabel: "What you already own",
    groups: [
      {
        id: "crm",
        label: "CRM data",
        tools: [
          { id: "hubspot", label: "HubSpot", src: "/gtm/hubspot.png" },
          { id: "salesforce", label: "Salesforce", src: "/gtm/salesforce.png" },
          { id: "pipedrive", label: "Pipedrive", src: "/gtm/pipedrive.png" },
        ],
      },
      {
        id: "calls",
        label: "Call transcripts",
        tools: [
          { id: "gong", label: "Gong", src: "/gtm/gong.png" },
          { id: "fathom", label: "Fathom", src: "/gtm/fathom.png" },
          { id: "fireflies", label: "Fireflies.ai", src: "/gtm/fireflies.png" },
        ],
      },
      {
        id: "product-usage",
        label: "Product usage",
        tools: [
          { id: "mixpanel", label: "Mixpanel", src: "/gtm/mixpanel.png" },
          { id: "amplitude", label: "Amplitude", src: "/gtm/amplitude.png" },
          { id: "segment", label: "Segment", src: "/gtm/segment.png" },
          { id: "posthog", label: "PostHog", src: "/gtm/posthog.png" },
          { id: "heap", label: "Heap", src: "/gtm/heap.png" },
          { id: "fullstory", label: "FullStory", src: "/gtm/fullstory.png" },
        ],
      },
      {
        id: "email",
        label: "Marketing sequence",
        tools: [
          { id: "instantly", label: "Instantly", src: "/gtm/instantly.png" },
          { id: "lemlist", label: "Lemlist", src: "/gtm/lemlist.png" },
          { id: "mailchimp", label: "Mailchimp", src: "/gtm/mailchimp.png" },
        ],
      },
      {
        id: "meetings",
        label: "Meeting forms",
        tools: [
          { id: "calendly", label: "Calendly", src: "/gtm/calendly.png" },
          { id: "typeform", label: "Typeform", src: "/gtm/typeform.png" },
          { id: "chilipiper", label: "Chili Piper", src: "/gtm/chilipiper.png" },
        ],
      },
      {
        id: "gated",
        label: "Gated content",
        tools: [
          { id: "wistia", label: "Wistia", src: "/gtm/wistia.png" },
          { id: "docsend", label: "DocSend", src: "/gtm/docsend.png" },
          { id: "gandalf", label: "Gandalf", src: "/gtm/gandalf.png" },
        ],
      },
      {
        id: "linkedin-signals",
        label: "LinkedIn signals",
        tools: [
          { id: "linkedin-sales-nav", label: "LinkedIn Sales Nav", src: "/gtm/linkedin.png" },
          { id: "trigify", label: "Trigify", src: "/gtm/trigify.svg" },
          { id: "shield", label: "Shield", src: "/gtm/shield.png" },
        ],
      },
    ],
  },
  {
    id: "second",
    label: "Second-party",
    sublabel: "What a partner shares with you",
    groups: [
      {
        id: "visitors",
        label: "Website visitor",
        tools: [
          { id: "clearbit", label: "Clearbit", src: "/gtm/clearbit.png" },
          { id: "6sense", label: "6sense", src: "/gtm/6sense.png" },
          { id: "leadfeeder", label: "Leadfeeder", src: "/gtm/leadfeeder.png" },
          { id: "albacross", label: "Albacross", src: "/gtm/albacross.png" },
          { id: "rb2b", label: "RB2B", src: "/gtm/rb2b.png" },
          { id: "snitcher", label: "Snitcher", src: "/gtm/snitcher.svg" },
        ],
      },
      {
        id: "affinity",
        label: "Affinity signals",
        tools: [
          { id: "harmonic", label: "Harmonic", src: "/gtm/harmonic.png" },
          { id: "bombora", label: "Bombora", src: "/gtm/bombora.png" },
          { id: "g2-intent", label: "G2 Intent", src: "/gtm/g2.png" },
        ],
      },
      {
        id: "ad-engagement",
        label: "Ad engagement",
        tools: [
          { id: "linkedin-ads", label: "LinkedIn Ads", src: "/gtm/linkedin.png" },
          { id: "meta-ads", label: "Meta Ads", src: "/gtm/meta.svg" },
          { id: "google-ads", label: "Google Ads", src: "/gtm/marketplace/google-ads.png" },
        ],
      },
      {
        id: "champion",
        label: "Champion tracking",
        tools: [
          { id: "usergems", label: "UserGems", src: "/gtm/usergems.png" },
          { id: "keyplay", label: "Keyplay", src: "/gtm/keyplay.png" },
          { id: "champify", label: "Champify", src: "/gtm/champify.png" },
        ],
      },
      {
        id: "review-sites",
        label: "Review sites",
        tools: [
          { id: "g2", label: "G2", src: "/gtm/g2.png" },
          { id: "capterra", label: "Capterra", src: "/gtm/capterra.png" },
          { id: "trustpilot", label: "Trustpilot", src: "/gtm/trustpilot.svg" },
        ],
      },
    ],
  },
  {
    id: "third",
    label: "Third-party",
    sublabel: "What's public or scraped",
    groups: [
      {
        id: "web-data",
        label: "Web data",
        tools: [
          { id: "wappalyzer", label: "Wappalyzer", src: "/gtm/wappalyzer.png" },
          { id: "storelead", label: "StoreLead", src: "/gtm/storelead.png" },
          { id: "owler", label: "Owler", src: "/gtm/owler.png" },
        ],
      },
      {
        id: "web-data-agents",
        label: "Web data agents",
        tools: [
          { id: "firecrawl", label: "Firecrawl", src: "/gtm/firecrawl.png" },
          { id: "exa", label: "Exa", src: "/gtm/exa.png" },
          { id: "perplexity", label: "Perplexity", src: "/gtm/perplexity.png" },
          { id: "manus", label: "Manus AI", src: "/gtm/manus.png" },
        ],
      },
      {
        id: "funding",
        label: "Funding announcements",
        tools: [
          { id: "crunchbase", label: "Crunchbase", src: "/gtm/crunchbase.png" },
          { id: "techcrunch", label: "TechCrunch", src: "/gtm/techcrunch.png" },
          { id: "fortune", label: "Fortune", src: "/gtm/fortune.png" },
          { id: "predictleads", label: "PredictLeads", src: "/gtm/predictleads.png" },
          { id: "theorg", label: "The Org", src: "/gtm/theorg.png" },
          { id: "pitchbook", label: "PitchBook", src: "/gtm/pitchbook.svg" },
        ],
      },
      {
        id: "jobs",
        label: "Job openings",
        tools: [
          { id: "indeed", label: "Indeed", src: "/gtm/indeed.png" },
          { id: "greenhouse", label: "Greenhouse", src: "/gtm/greenhouse.png" },
          { id: "theirstack", label: "TheirStack", src: "/gtm/theirstack.png" },
        ],
      },
      {
        id: "search-trends",
        label: "Search trends",
        tools: [
          { id: "semrush", label: "Semrush", src: "/gtm/semrush.png" },
          { id: "similarweb", label: "Similarweb", src: "/gtm/similarweb.png" },
          { id: "ahrefs", label: "Ahrefs", src: "/gtm/ahrefs.png" },
        ],
      },
      {
        id: "social",
        label: "Social engagement",
        tools: [
          { id: "x", label: "X", src: "/gtm/marketplace/twitter.png" },
          { id: "reddit", label: "Reddit", src: "/gtm/marketplace/reddit.png" },
          { id: "producthunt", label: "Product Hunt", src: "/gtm/producthunt.png" },
        ],
      },
      {
        id: "firmographic",
        label: "Firmographic data",
        tools: [
          { id: "apollo", label: "Apollo", src: "/gtm/apollo.png" },
          { id: "zoominfo", label: "ZoomInfo", src: "/gtm/zoominfo.png" },
          { id: "cognism", label: "Cognism", src: "/gtm/cognism.png" },
          { id: "lusha", label: "Lusha", src: "/gtm/lusha.png" },
          { id: "uplead", label: "UpLead", src: "/gtm/uplead.png" },
          { id: "rocketreach", label: "RocketReach", src: "/gtm/rocketreach.png" },
          { id: "prospeo", label: "Prospeo", src: "/gtm/prospeo.png" },
        ],
      },
      {
        id: "technographic",
        label: "Technographic data",
        tools: [
          { id: "builtwith", label: "BuiltWith", src: "/gtm/builtwith.png" },
          { id: "fullenrich", label: "FullEnrich", src: "/gtm/fullenrich.png" },
          { id: "theirstack-tech", label: "TheirStack", src: "/gtm/theirstack.png" },
        ],
      },
      {
        id: "lookalike",
        label: "Lookalike search",
        tools: [
          { id: "oceanio", label: "Ocean.io", src: "/gtm/oceanio.png" },
          { id: "sparktoro", label: "SparkToro", src: "/gtm/sparktoro.png" },
          { id: "discolike", label: "DiscoLike", src: "/gtm/discolike.png" },
        ],
      },
      {
        id: "news",
        label: "News",
        tools: [
          { id: "google-news", label: "Google News", src: "/gtm/google-news.png" },
          { id: "exa-news", label: "Exa", src: "/gtm/exa.png" },
        ],
      },
      {
        id: "ads-activity",
        label: "Ads activity",
        tools: [
          { id: "spyfu", label: "SpyFu", src: "/gtm/spyfu.png" },
          { id: "adyntel", label: "Adyntel", src: "/gtm/adyntel.png" },
        ],
      },
      {
        id: "scraping",
        label: "Custom scraping",
        tools: [
          { id: "phantombuster", label: "PhantomBuster", src: "/gtm/phantombuster.png" },
          { id: "captaindata", label: "Captain Data", src: "/gtm/captaindata.png" },
          { id: "apify", label: "Apify", src: "/gtm/apify.png" },
        ],
      },
    ],
  },
];
