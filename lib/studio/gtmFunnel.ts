export type FunnelTool = {
  id: string;
  label: string;
  src: string;
};

export type FunnelColumn = {
  id: string;
  label: string;
  tools: FunnelTool[];
};

export type FunnelStage = {
  id: "generation" | "capture" | "management" | "conversation";
  label: string;
  sublabel: string;
  columns: FunnelColumn[];
};

export const FUNNEL_TITLE = "Solo GTM Funnel";
export const FUNNEL_TITLE_ACCENT = "GTM Funnel";
export const FUNNEL_KICKER = "The tech stack I run end to end — from signal to signed";
export const FUNNEL_KICKER_ACCENT = "signal to signed";

export const GTM_FUNNEL: FunnelStage[] = [
  {
    id: "generation",
    label: "Lead Generation",
    sublabel: "Find + research accounts",
    columns: [
      {
        id: "intent",
        label: "Intent",
        tools: [
          { id: "clay", label: "Clay", src: "/gtm/clay.png" },
          { id: "bombora", label: "Bombora", src: "/gtm/bombora.png" },
          { id: "6sense", label: "6sense", src: "/gtm/6sense.png" },
          { id: "predictleads", label: "PredictLeads", src: "/gtm/predictleads.png" },
        ],
      },
      {
        id: "data",
        label: "Data",
        tools: [
          { id: "zoominfo", label: "ZoomInfo", src: "/gtm/zoominfo.png" },
          { id: "apollo", label: "Apollo", src: "/gtm/apollo.png" },
          { id: "lusha", label: "Lusha", src: "/gtm/lusha.png" },
          { id: "cognism", label: "Cognism", src: "/gtm/cognism.png" },
          { id: "clearbit", label: "Clearbit", src: "/gtm/clearbit.png" },
          { id: "fullenrich", label: "FullEnrich", src: "/gtm/fullenrich.png" },
        ],
      },
      {
        id: "web-data",
        label: "Web data",
        tools: [
          { id: "apify", label: "Apify", src: "/gtm/apify.png" },
          { id: "firecrawl", label: "Firecrawl", src: "/gtm/firecrawl.png" },
          { id: "captaindata", label: "Captain Data", src: "/gtm/captaindata.png" },
          { id: "phantombuster", label: "PhantomBuster", src: "/gtm/phantombuster.png" },
          { id: "theirstack", label: "TheirStack", src: "/gtm/theirstack.png" },
          { id: "prospeo", label: "Prospeo", src: "/gtm/prospeo.png" },
        ],
      },
      {
        id: "search-ai",
        label: "Search / AI",
        tools: [
          { id: "exa", label: "Exa", src: "/gtm/exa.png" },
          { id: "perplexity", label: "Perplexity", src: "/gtm/perplexity.png" },
          { id: "ahrefs", label: "Ahrefs", src: "/gtm/ahrefs.png" },
          { id: "semrush", label: "Semrush", src: "/gtm/semrush.png" },
        ],
      },
    ],
  },
  {
    id: "capture",
    label: "Lead Capture",
    sublabel: "Identify + capture",
    columns: [
      {
        id: "visitor-id",
        label: "Visitor ID",
        tools: [
          { id: "rb2b", label: "RB2B", src: "/gtm/rb2b.png" },
          { id: "snitcher", label: "Snitcher", src: "/gtm/snitcher.svg" },
          { id: "albacross", label: "Albacross", src: "/gtm/albacross.png" },
          { id: "leadfeeder", label: "Leadfeeder", src: "/gtm/leadfeeder.png" },
          { id: "commonroom", label: "Common Room", src: "/gtm/commonroom.png" },
        ],
      },
      {
        id: "forms",
        label: "Forms",
        tools: [
          { id: "typeform", label: "Typeform", src: "/gtm/typeform.png" },
          { id: "calendly", label: "Calendly", src: "/gtm/calendly.png" },
        ],
      },
      {
        id: "content",
        label: "Content",
        tools: [
          { id: "docsend", label: "DocSend", src: "/gtm/docsend.png" },
          { id: "wistia", label: "Wistia", src: "/gtm/wistia.png" },
        ],
      },
    ],
  },
  {
    id: "management",
    label: "Lead Management",
    sublabel: "Score + enrich + route",
    columns: [
      {
        id: "enrich-score",
        label: "Enrich / Score",
        tools: [
          { id: "clay-mgmt", label: "Clay", src: "/gtm/clay.png" },
          { id: "clearbit-mgmt", label: "Clearbit", src: "/gtm/clearbit.png" },
          { id: "harmonic", label: "Harmonic", src: "/gtm/harmonic.png" },
          { id: "champify", label: "Champify", src: "/gtm/champify.png" },
          { id: "usergems", label: "UserGems", src: "/gtm/usergems.png" },
        ],
      },
      {
        id: "analytics",
        label: "Analytics",
        tools: [
          { id: "segment", label: "Segment", src: "/gtm/segment.png" },
          { id: "mixpanel", label: "Mixpanel", src: "/gtm/mixpanel.png" },
          { id: "amplitude", label: "Amplitude", src: "/gtm/amplitude.png" },
          { id: "heap", label: "Heap", src: "/gtm/heap.png" },
          { id: "posthog", label: "PostHog", src: "/gtm/posthog.png" },
        ],
      },
      {
        id: "routing",
        label: "Routing",
        tools: [
          { id: "chilipiper", label: "Chili Piper", src: "/gtm/chilipiper.png" },
          { id: "hubspot-route", label: "HubSpot", src: "/gtm/hubspot.png" },
        ],
      },
      {
        id: "automation",
        label: "Automation",
        tools: [
          { id: "n8n", label: "n8n", src: "/gtm/n8n.png" },
          { id: "slack", label: "Slack", src: "/gtm/slack.png" },
        ],
      },
    ],
  },
  {
    id: "conversation",
    label: "Lead Conversation",
    sublabel: "Close",
    columns: [
      {
        id: "crm",
        label: "CRM",
        tools: [
          { id: "hubspot-crm", label: "HubSpot", src: "/gtm/hubspot.png" },
          { id: "pipedrive", label: "Pipedrive", src: "/gtm/pipedrive.png" },
          { id: "attio", label: "Attio", src: "/gtm/attio.png" },
          { id: "salesforce", label: "Salesforce", src: "/gtm/salesforce.png" },
        ],
      },
      {
        id: "calls",
        label: "Calls",
        tools: [
          { id: "fireflies", label: "Fireflies.ai", src: "/gtm/fireflies.png" },
          { id: "gong", label: "Gong", src: "/gtm/gong.png" },
          { id: "fathom", label: "Fathom", src: "/gtm/fathom.png" },
          { id: "aircall", label: "Aircall", src: "/gtm/aircall.svg" },
        ],
      },
      {
        id: "proposals",
        label: "Proposals",
        tools: [
          { id: "calendly-prop", label: "Calendly", src: "/gtm/calendly.png" },
          { id: "docsend-prop", label: "DocSend", src: "/gtm/docsend.png" },
        ],
      },
    ],
  },
];
