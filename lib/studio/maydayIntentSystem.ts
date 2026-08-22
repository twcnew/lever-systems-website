export type MaydayTool = {
  id: string;
  label: string;
  src: string;
  cadence: string;
};

export type MaydayProof = {
  label: string;
  href: string;
};

export type MaydaySignalPlay = {
  id: "ai-delivery" | "knowledge-program" | "distributed-support" | "complexity-jump";
  number: string;
  title: string;
  summary: string;
  observable: string;
  tools: MaydayTool[];
  confirmation: string;
  falsePositive: string;
  personas: string;
  activation: string;
  freshness: string;
  proofs: MaydayProof[];
};

export type QualificationGate = {
  id: string;
  label: string;
  title: string;
  copy: string;
  required: boolean;
};

export type WorkflowStage = {
  number: string;
  title: string;
  copy: string;
};

export type MaydayReference = {
  label: string;
  href: string;
};

export const MAYDAY_QUALIFICATION_GATES: QualificationGate[] = [
  {
    id: "customer-ops",
    label: "Obligatoire",
    title: "Une vraie opération de service client",
    copy: "Des conseillers répondent, diagnostiquent ou accompagnent des clients. Une documentation IT interne ne suffit pas.",
    required: true,
  },
  {
    id: "complexity",
    label: "Obligatoire",
    title: "Un facteur de complexité",
    copy: "Équipes distribuées, BPO, plusieurs langues, réglementation, onboarding important ou procédures qui changent souvent.",
    required: true,
  },
  {
    id: "operational-knowledge",
    label: "Obligatoire",
    title: "Une connaissance qui pilote l’action",
    copy: "La qualité de la réponse dépend de procédures, règles ou contenus que les équipes doivent retrouver et appliquer.",
    required: true,
  },
  {
    id: "cx-stack",
    label: "Contexte",
    title: "Une stack CX compatible",
    copy: "Zendesk, Salesforce, Genesys, Intercom ou équivalent aide à qualifier l’intégration. Ce n’est jamais un signal d’achat seul.",
    required: false,
  },
];

const EXA: MaydayTool = { id: "exa", label: "Exa", src: "/gtm/exa.png", cadence: "quotidien" };
const FIRECRAWL: MaydayTool = { id: "firecrawl", label: "Firecrawl", src: "/gtm/firecrawl.png", cadence: "quotidien" };
const LINKEDIN: MaydayTool = { id: "linkedin", label: "LinkedIn", src: "/gtm/linkedin.png", cadence: "quotidien" };
const THEIRSTACK: MaydayTool = { id: "theirstack", label: "TheirStack", src: "/gtm/theirstack.png", cadence: "hebdomadaire" };
const BUILTWITH: MaydayTool = { id: "builtwith", label: "BuiltWith", src: "/gtm/builtwith.png", cadence: "confirmation" };
const GOOGLE_NEWS: MaydayTool = { id: "google-news", label: "Google News", src: "/gtm/google-news.png", cadence: "quotidien" };

export const MAYDAY_SIGNAL_PLAYS: MaydaySignalPlay[] = [
  {
    id: "ai-delivery",
    number: "01",
    title: "Un projet d’agent IA passe à la mise en œuvre",
    summary: "Le bon moment n’est pas le lancement public. C’est la phase où le POC, l’équipe ou le partenaire commence à rendre le projet réel.",
    observable: "POC ou appel d’offres, recrutement Conversational AI / Customer Service Automation, recherche d’un partenaire, pilote annoncé par un leader CX ou fiche de poste mentionnant un agent destiné au support.",
    tools: [EXA, LINKEDIN, FIRECRAWL, THEIRSTACK],
    confirmation: "Une seconde preuve relie le projet à la qualité, la gouvernance, la centralisation ou la maintenance de la connaissance utilisée par l’IA.",
    falsePositive: "Assistant interne générique, innovation lab sans use case service client, ou agent déjà lancé avec une architecture et un fournisseur arrêtés.",
    personas: "VP Customer Care · AI Transformation Lead · Head of CX · Knowledge Lead",
    activation: "Brief « AI-ready knowledge » : sources actuelles, gouvernance visible, risque de contenus contradictoires et preuve BoursoBank / Mayday AI.",
    freshness: "90 jours",
    proofs: [
      { label: "Direction IA de Mayday", href: "https://www.mayday.fr/ia" },
      { label: "Cas BoursoBank", href: "https://www.mayday.fr/cas-clients/boursobank" },
    ],
  },
  {
    id: "knowledge-program",
    number: "02",
    title: "La gouvernance de la connaissance devient un programme",
    summary: "Un owner apparaît, un budget se structure et la qualité de la connaissance cesse d’être une responsabilité diffuse.",
    observable: "Recrutement Knowledge Manager, CX Content Operations, Quality ou Training avec une responsabilité explicite de centralisation, gouvernance, diffusion ou maintenance des procédures.",
    tools: [THEIRSTACK, LINKEDIN, FIRECRAWL],
    confirmation: "La mission concerne les opérations client et cite plusieurs équipes, canaux, pays, bases ou outils à harmoniser.",
    falsePositive: "Rôle éditorial SEO, documentation développeur, enablement commercial ou wiki interne sans responsabilité sur le service client.",
    personas: "Nouveau Knowledge Manager · CX Operations Director · Head of Customer Care · Quality Lead",
    activation: "Transformer les responsabilités du poste en operating model : owners, cycles de revue, feedback terrain et diffusion dans les outils agents.",
    freshness: "90 jours",
    proofs: [
      { label: "Cas Rakuten", href: "https://www.mayday.fr/cas-clients/rakuten" },
      { label: "Cas BoursoBank", href: "https://www.mayday.fr/cas-clients/boursobank" },
    ],
  },
  {
    id: "distributed-support",
    number: "03",
    title: "Le support devient distribué",
    summary: "Le nombre d’endroits où la connaissance doit rester identique augmente : équipe interne, BPO, sites, pays ou langues.",
    observable: "Nouveau contrat BPO, centre de contact, site, pays ou langue ; changement de prestataire ; acquisition à intégrer ; recrutement d’un responsable outsourcing ou partner operations.",
    tools: [GOOGLE_NEWS, EXA, LINKEDIN, THEIRSTACK],
    confirmation: "L’évolution concerne bien des équipes de support et crée un enjeu explicite de qualité, formation, cohérence ou pilotage des procédures.",
    falsePositive: "Expansion commerciale sans équipe de service client, ouverture de bureau sans activité support, ou simple renouvellement d’un contrat de prestation.",
    personas: "Customer Care Director · Outsourcing Manager · Quality Director · Training Lead",
    activation: "Note d’alignement interne / externe : diffusion, feedback, formation et contrôle des mises à jour, illustrée par Rakuten et Appart’City.",
    freshness: "180 jours",
    proofs: [
      { label: "Cas Rakuten", href: "https://www.mayday.fr/cas-clients/rakuten" },
      { label: "Cas Appart’City", href: "https://www.mayday.fr/cas-clients/appartcity" },
    ],
  },
  {
    id: "complexity-jump",
    number: "04",
    title: "La complexité opérationnelle augmente brutalement",
    summary: "Un changement de marché produit de nouvelles procédures plus vite que l’organisation ne peut les absorber et les transmettre.",
    observable: "Lancement d’un produit complexe, entrée sur un marché, évolution réglementaire, acquisition ou vague de recrutements support sur plusieurs sites, langues ou spécialités.",
    tools: [EXA, FIRECRAWL, THEIRSTACK, BUILTWITH],
    confirmation: "Le changement entraîne de la formation, de nouvelles règles, une montée en compétence ou des contenus plus fréquemment mis à jour.",
    falsePositive: "Annonce marketing sans impact sur les opérations, recrutements isolés ou croissance du trafic compensée uniquement par du selfcare.",
    personas: "CX Operations · Knowledge Lead · Training & Quality · Customer Care Director",
    activation: "Brief onboarding + complexité : changement détecté, équipes touchées, connaissance à maintenir et cas Doctolib / Indy adapté.",
    freshness: "90 jours",
    proofs: [
      { label: "Cas Doctolib", href: "https://www.mayday.fr/cas-clients/doctolib" },
      { label: "Cas Indy", href: "https://www.mayday.fr/cas-clients/indy" },
    ],
  },
];

export const MAYDAY_WORKFLOW_STAGES: WorkflowStage[] = [
  { number: "01", title: "Univers ICP", copy: "Comptes avec une opération support et un facteur de complexité." },
  { number: "02", title: "Veille", copy: "Jobs, actualités, pages entreprise, prises de poste et changements de stack." },
  { number: "03", title: "Normalisation", copy: "Domaine, type d’événement, date, URL et citation exacte." },
  { number: "04", title: "Filtre de fit", copy: "Support réel, complexité et connaissance destinée aux opérations client." },
  { number: "05", title: "Preuve", copy: "Source directe ou événement corroboré par une seconde preuve indépendante." },
  { number: "06", title: "Statut", copy: "Ignore, Watch ou Review — aucune note opaque." },
  { number: "07", title: "Brief CRM", copy: "Pourquoi maintenant, buyer group, angle Mayday et prochaine vérification." },
  { number: "08", title: "Feedback", copy: "Marketing et Sales qualifient le signal pour améliorer les règles." },
];

export const MAYDAY_TOOLS: MaydayTool[] = [
  EXA,
  FIRECRAWL,
  THEIRSTACK,
  LINKEDIN,
  BUILTWITH,
  { id: "clay", label: "Clay", src: "/gtm/clay.png", cadence: "orchestration" },
];

export const MAYDAY_CALIBRATION_METRICS = [
  { value: "01", label: "Preuves exploitables", copy: "Part des événements accompagnés d’une citation et d’une source vérifiable." },
  { value: "02", label: "Briefs acceptés", copy: "Part des comptes Review jugés réellement utiles par Sales." },
  { value: "03", label: "Temps de réaction", copy: "Délai entre la détection de l’événement et sa revue humaine." },
  { value: "04", label: "Opportunités influencées", copy: "Résultats observés par famille de signal, sans attribuer artificiellement tout le pipeline." },
] as const;

export const MAYDAY_REFERENCES: MaydayReference[] = [
  { label: "François Castro-Lara — « L’IA qui sait vs l’IA qui fait »", href: "https://fr.linkedin.com/posts/francoisncastrolara_12-mois-chez-mayday-et-je-commence-seulement-activity-7444374590471946241-QtPQ" },
  { label: "Mayday — positionnement et intégrations", href: "https://www.mayday.fr/" },
  { label: "BoursoBank — IA, gouvernance et impact business", href: "https://www.mayday.fr/cas-clients/boursobank" },
  { label: "Appart’City — support externalisé avec Concentrix", href: "https://www.mayday.fr/cas-clients/appartcity" },
  { label: "Rakuten — pôle Knowledge et centre externalisé", href: "https://www.mayday.fr/cas-clients/rakuten" },
  { label: "Doctolib — croissance, cinq sites et onboarding", href: "https://www.mayday.fr/cas-clients/doctolib" },
  { label: "Indy — hypercroissance et connaissance destinée à l’IA", href: "https://www.mayday.fr/cas-clients/indy" },
  { label: "USU — rapprochement avec Mayday et ambition européenne", href: "https://www.usu.com/fr/news/mayday-rejoint-usu-pour-b%C3%A2tir-le-leader-europ%C3%A9en-du-knowledge-management" },
  { label: "Clay — workflows, conditions et actions CRM", href: "https://university.clay.com/docs/workflows" },
  { label: "TheirStack — jobs et technographies via API", href: "https://api.theirstack.com/openapi" },
];
