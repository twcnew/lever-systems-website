# Design — Lever LP (hors hero)

## Concept : la galerie vivante

La hero est la nuit (peinture sombre, dither, cinématique). Tout ce qui suit est la
galerie de jour : canvas clair, tableaux encadrés, diagrammes ASCII fonctionnels.
Deux langages visuels, un seul cadre :

- **`GalleryFrame`** (`components/GalleryFrame.tsx`) — cadre muséal (double bordure,
  passe-partout, ombre) + **cartel** (titre serif italic + ligne "médium",
  ex. *"The Data Layer — oil on data, 2026"*). `src` branchable pour les peintures
  finales, état d'attente en trame halftone. Option `dither` pour le traitement
  halftone sur image.
- **`AsciiDiagram`** (`components/ascii/`) — diagrammes monospace animés (dessin
  progressif au reveal, curseur, `prefers-reduced-motion` respecté). Générateurs :
  `playFlow`, `blueprint`, `STACK_MAP`, `signalFeed`.

## Canvas

- `--canvas`: `#fffaf0` (warm cream)
- **Fond LP** : shader Paper `ImageDithering` (`LpBackdrop`, source
  `/lp-canvas.png`) — blanc chaud `#fffaf0` + grain Bayer 8×8 discret.
  Fallback `background-color: var(--canvas)` sous `prefers-reduced-motion`.
- `--ink`: `#0e0a07`
- Body text : `rgba(14, 10, 7, 0.66)` minimum (AA sur pastels)
- `--hairline`: `rgba(14, 10, 7, 0.08)`

## Card surfaces (cycle per module)

- `--card-sky`: `#dce9f7`
- `--card-sand`: `#f3e8d4`
- `--card-mint`: `#d8efe6`
- `--card-lilac`: `#e8dff5`
- `--card-peach`: `#fde8d8`

## Shape

- Module radius: `24px` · inner cards `16–20px` · pills `999px`
- GalleryFrame : angles droits (musée), pas de radius

## Typography

- Headings : Geist Sans, weight 500–600, tight tracking
- **Serif italic (Instrument Serif) en accent** : cartels, citations clients,
  lignes de résultat, garantie — jamais en body
- Mono (Geist Mono) : réservé aux diagrammes ASCII
- Pas de labels uppercase répétés par section — le cartel de galerie est le seul
  système de labellisation

## Slots peinture restants (src à brancher sur GalleryFrame)

| Slot ID | Section |
|---------|---------|
| `paint-ascii-pillar-{data,signals,orchestration,execution}` | Feature pillars |
| `paint-ascii-bento-{product,about,use-cases}` | Resource bento |
| `paint-ascii-case-happypal` | Featured case study (image déjà branchée) |

## Homepage structure (Clay-inspired)

Hero cinématique inchangée, puis :

1. `SocialProofWall` — cartes cartel (quote serif, metric pill, stagger)
2. `UseCaseTabsSection` — tabs + **diagramme ASCII play-flow par tab**
3. `PromptBuilderSection` — chips → **blueprint ASCII animé** ; texte libre → stack map
4. `PillarsScrollSection` — **scroll épinglé façon Clay** : section 480vh,
   viewport sticky, les 4 piliers (copy + GalleryFrame) se substituent au
   scroll, nav chiffres romains I–IV. Copy en mode livrable
   ("I plug… / You get: …"). Fallback mobile <900px : liste empilée sans pin.
5. `InfrastructureSection` — timeline 30/60/90 + **signal feed ASCII sur fond ink** + garantie
6. `FeaturedCaseStudy` — HappyPal en cadre muséal
7. `ResourceBento` — tuiles avec cadres ; Blog = notes ASCII
8. `FaqSection` + `ClosingSection`

CSS : `.clay-*`, `.gframe`, `.ascii` dans `styles/lumio.css`, wrapper `.lp--clay`.

## Motion

- Hero : `runIntro` existant
- Sections : `useSectionReveal` → `.is-live`
- **Différencié par type** : copy fade-rise ; frames arrivent avec 0.18s de retard
  (scale 0.985 → 1) ; diagrammes ASCII se dessinent ; mur social stagger par carte
- Tout est neutralisé sous `prefers-reduced-motion`
