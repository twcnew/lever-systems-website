export type StackTool = {
  id: string;
  label: string;
  src: string;
};

/** Curated shipping stack — shown as an infinite marquee on the LP. */
export const STACK_STRIP_CONTENT = {
  label: "Stack",
  title: "The tools I ship with.",
  tools: [
    { id: "claude-code", label: "Claude Code", src: "/gtm/stack/claude-code.png" },
    { id: "chatgpt", label: "ChatGPT", src: "/gtm/stack/chatgpt.png" },
    { id: "cursor", label: "Cursor", src: "/gtm/stack/cursor.svg" },
    { id: "n8n", label: "n8n", src: "/gtm/stack/n8n.svg" },
    { id: "clay", label: "Clay", src: "/gtm/stack/clay.webp" },
    { id: "hubspot", label: "HubSpot", src: "/gtm/stack/hubspot.png" },
    { id: "slack", label: "Slack", src: "/gtm/stack/slack.png" },
    { id: "lemlist", label: "Lemlist", src: "/gtm/stack/lemlist.png" },
    { id: "fullenrich", label: "FullEnrich", src: "/gtm/stack/fullenrich.png" },
    { id: "mailpool", label: "Mailpool", src: "/gtm/stack/mailpool.webp" },
  ] satisfies StackTool[],
};
