# Agent brief — Spine LinkedIn asset (type 01)

Read this before touching the visual. Caption: `posts/spine-01.md` in `lever-linkedin-os`. Work on `/studio/spine/`. HTML/CSS in this repo. Not ChatGPT. Not a ColdIQ restyle.

## Form

**01 `spine-flowchart`** from ColdIQ gold `visuals/training/01/ref.png`. Steal anatomy, not skin.

Steal: 4 stacked zones, zone pill + chip-strip, split-card (action over white logo deck), outline nodes, orthogonal 1px wires, caption footer.

Do not steal: dark grain, magenta/orange/yellow/green neon, ColdIQ faces, COLDIQ wordmark, `$2M+`.

## Field

White `#fff` + ink `#0e0a07` + royal `#5a8be4`. HITL is the only colored zone (royal frame + ~12% wash). No cream. No GalleryFrame sand.

## What the picture argues

Three signal types in → Clay orchestrates → team-validated ICP score and tiers → one owner (or round-robin) → Slack HITL → HubSpot / Slack / Lemlist. The plus-value is topology: Rewrite loops back to Score, Reject is a dead stub, round-robin only fires when there is no owner.

## Copy on the art

- Title: `One owner. One system.`
- Kicker: `A market signal to a routed action.`
- Capture: three outline nodes `First-party` / `Second-party` / `Third-party` fan into Clay split-card `Capture, orchestrate, enrich.` · rule `Existing paid tools first. New tools must earn their ROI.`
- Score: node `ICP criteria validated by the team` → split-card `Score + tier accounts.` → `Tier 1` most research / `Tier 2` more personalization / `Tier 3` fewer resources
- HITL (human in the loop): Slack · `One owner per account` · side branch `No owner? Round-robin to an AE` · Approve / Rewrite with feedback / Reject. Approve continues to Route. Rewrite dashed-loops back to Score. Reject does not feed Route.
- Route: after approval, three split-cards `Sync` / HubSpot, `Notify` / Slack, `Send` / Lemlist
- Footer: site author panel, compact — Caveat name + role | `<Brand />` | founder portrait

Caption only: P.S., paid-tools thesis, “one owner keeps the motion moving.”

## Surface

- `components/studio/SpineAsset.tsx` inside `.studio-spine__poster` (1px ink, white, height auto)
- Data: `lib/studio/spineFlowchart.ts`
- Crop: 1080×1350 screenshot later
- Logos: `public/gtm/` Clay, Slack, HubSpot, Lemlist. Signal types are text labels, not logos.

## Hard rules

- English. Every HITL written `HITL (human in the loop)`.
- No em dashes. Official Lever wordmark only.
- No n8n. No Cursor. No sequencer line. No waterfall / ICP-wrong copy.
- No URL except `lever.systems` in the footer.

## Anti-goals

- Kill sheet / “you know it’s dying when”
- Four equal cards with no wires
- Funnel, hub-and-spoke, versus 14 vs 1
- Cream, neon, glass, gradient text
- n8n, Cursor, or a logo salad on the three signal types

## Done when

Title readable in 2s. HITL fork in 5s. Rewrite returns to Score. Reject does not enter Route. Round-robin is a side branch into owner. Three destinations readable. White field, no cream.
