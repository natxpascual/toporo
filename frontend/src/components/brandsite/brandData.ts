export interface CopilotWorkflow {
  id: string;
  label: string;
  userPrompt: string;
  assistantIntro: string;
  toolCall: string;
  toolArgs: string;
  toolResult: string;
  summary: string;
}

export interface BentoItem {
  id: string;
  tag: string;
  tagAccentColor: string;
  strokeColor: string;
  description: string;
  variant: 'elk' | 'sandbox' | 'export';
}

export interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  monthlyPrice: number;
  annualPrice: number;
  customPriceLabel?: string;
  periodLabel: string;
  description: string;
  ctaLabel: string;
  route: string;
  introLine?: string;
  features: Array<{ title: string; subtitle?: string }>;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface TestimonialCard {
  name: string;
  handle: string;
  role: string;
  quote: string;
  mentionHighlight?: string;
}

export const HERO_STANDARDS = [
  { label: 'Terraform HCL2', sub: 'Bidirectional Sync' },
  { label: 'CIS Azure v2.0', sub: 'Automated Guardrails' },
  { label: 'FinOps Telemetry', sub: 'Real-Time Costing' },
  { label: 'Smart Auto-Layout', sub: 'Deterministic Canvas' },
  { label: 'ISO/IEC 25010', sub: 'Validated Quality' },
];

export const FEATURE_SECTIONS = [
  {
    index: '01',
    anchorId: 'visual-studio',
    title: 'Design visually, sync Terraform in real time',
    description:
      'Arrange Azure resource groups, hub-and-spoke virtual networks, and managed databases on an interactive canvas. Every visual property edit rewrites clean, production Terraform modules with zero translation drift.',
    stageKey: 'ast-sync' as const,
  },
  {
    index: '02',
    anchorId: 'code-inspector',
    title: 'Catch CIS violations before you apply',
    description:
      'Every resource edge and subnet rule is audited continuously against CIS Azure v2.0 guardrails. Spot public exposures, inspect blast radius, and apply verified Terraform remediations with a single click.',
    stageKey: 'secops' as const,
  },
  {
    index: '03',
    anchorId: 'finops-telemetry',
    title: 'Know your Azure bill before provisioning',
    description:
      'Track monthly and annual spend per SKU in real time using live Azure Retail pricing data. Compare compute tiers and disk redundancies right beside your topology before a single resource spins up.',
    stageKey: 'finops' as const,
  },
];

export const COPILOT_WORKFLOWS: CopilotWorkflow[] = [
  {
    id: 'provision-hub-spoke',
    label: 'Provision Hub-Spoke VNet',
    userPrompt: '> Build a zero-trust Hub & Spoke Azure topology with Firewall Premium and AKS spoke.',
    assistantIntro: "Synthesizing modular Hub-Spoke Terraform topology and validating CIS Azure v2.0 peering rules.",
    toolCall: 'synthesize_topology',
    toolArgs: '{ "pattern": "hub-spoke", "region": "eastus2", "firewall_tier": "Premium" }',
    toolResult: 'Added 6 resources, 4 VNet peerings -> 0 drift errors',
    summary: 'Generated Hub VNet (10.0.0.0/16), Azure Firewall Premium, and isolated AKS Spoke.',
  },
  {
    id: 'remediate-cis',
    label: 'Remediate CIS Violations',
    userPrompt: '> Audit the production storage and NSG rules for public internet exposure.',
    assistantIntro: "Running CIS Azure v2.0 policy scanner across canvas nodes and patching non-compliant blocks.",
    toolCall: 'remediate_cis_findings',
    toolArgs: '{ "checks": ["CIS-AZ-10", "CIS-AZ-35"], "mode": "strict_deny" }',
    toolResult: 'Remediated 2 Critical findings -> Compliance Score: 100%',
    summary: 'Enforced private endpoint routing, TLS 1.2 minimum, and explicit deny on SSH port 22.',
  },
  {
    id: 'optimize-finops',
    label: 'Optimize AKS FinOps',
    userPrompt: '> Bring monthly environment spend under $500/mo without dropping HA redundancy.',
    assistantIntro: "Querying live Azure Retail SKU tables and comparing node-pool burstable vs. D-series options.",
    toolCall: 'optimize_finops_skus',
    toolArgs: '{ "target_budget_usd": 500, "preserve_az": true }',
    toolResult: 'Projected spend reduced: $842.40/mo -> $468.90/mo (-44.3%)',
    summary: 'Right-sized AKS user pool to Standard_B4ms and tuned PostgreSQL Flexible Server storage IOPS.',
  },
  {
    id: 'export-bundle',
    label: 'Export Terraform Bundle',
    userPrompt: '> Package this validated architecture into modular files ready for CI/CD pipelines.',
    assistantIntro: "Serializing deterministic Terraform across main.tf, variables.tf, outputs.tf, and versions.tf.",
    toolCall: 'export_terraform_bundle',
    toolArgs: '{ "format": "zip", "include_cis_report": true, "include_bom": true }',
    toolResult: 'Bundle ready: toporo-hub-spoke.zip (18.4 KB, 100% CIS verified)',
    summary: 'Packaged clean Terraform modules with a FinOps cost ledger and pinned Azure provider constraints.',
  },
];

export const BENTO_CAPABILITIES: BentoItem[] = [
  {
    id: 'elk-layout',
    tag: 'DETERMINISTIC AUTO-LAYOUT',
    tagAccentColor: '#01B39F',
    strokeColor: '#01B39F',
    description:
      'Nested resource groups, VNet boundaries, and orthogonal peering edges arrange automatically without manual node untangling.',
    variant: 'elk',
  },
  {
    id: 'zero-credential',
    tag: 'ZERO-CREDENTIAL SANDBOX',
    tagAccentColor: '#A97DE7',
    strokeColor: '#A97DE7',
    description:
      'Model topologies, sync Terraform code, run static CIS policies, and estimate Azure billing locally without connecting live subscription secrets.',
    variant: 'sandbox',
  },
  {
    id: 'zip-export',
    tag: 'MULTI-FILE TERRAFORM EXPORT',
    tagAccentColor: '#4AB35A',
    strokeColor: '#4AB35A',
    description:
      'Export production-structured main.tf, variables.tf, and outputs.tf modules alongside CIS compliance and FinOps reports.',
    variant: 'export',
  },
];

export interface EcosystemItem {
  name: string;
  category: string;
  iconType: string;
}

export const AZURE_ECOSYSTEM: EcosystemItem[] = [
  { name: 'Virtual Network', category: 'NETWORK', iconType: 'azurerm_virtual_network' },
  { name: 'AKS Cluster', category: 'COMPUTE', iconType: 'azurerm_kubernetes_cluster' },
  { name: 'Azure Firewall', category: 'SECOPS', iconType: 'azurerm_firewall' },
  { name: 'PostgreSQL Flex', category: 'DATA', iconType: 'azurerm_postgresql_flexible_server' },
  { name: 'Key Vault', category: 'IDENTITY', iconType: 'azurerm_key_vault' },
  { name: 'Cosmos DB', category: 'GLOBAL', iconType: 'azurerm_cosmosdb_account' },
  { name: 'App Service', category: 'WEB', iconType: 'azurerm_linux_web_app' },
  { name: 'Application Gateway', category: 'INGRESS', iconType: 'azurerm_application_gateway' },
  { name: 'Storage Account', category: 'STORAGE', iconType: 'azurerm_storage_account' },
  { name: 'Load Balancer', category: 'ROUTING', iconType: 'azurerm_lb' },
  { name: 'Azure Functions', category: 'SERVERLESS', iconType: 'azurerm_linux_function_app' },
  { name: 'Terraform HCL2', category: 'IAC', iconType: 'terraform_hcl2' },
];

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    periodLabel: '',
    description: 'For individual cloud learners and visual Terraform prototyping.',
    ctaLabel: 'Sign Up Free',
    route: '/signup',
    features: [
      { title: 'Interactive Studio Canvas', subtitle: 'Unlimited local diagrams' },
      { title: 'Bidirectional Terraform Sync', subtitle: 'Real-time code & canvas' },
      { title: 'Static Security Guardrails', subtitle: 'Core CIS Azure v2.0 checks' },
      { title: 'Multi-file .tf export' },
      { title: 'Live FinOps Cost Engine', subtitle: 'SKU & region cost deltas' },
      { title: 'Blast Radius Simulation', subtitle: 'Interactive lateral-path trace' },
    ],
  },
  {
    id: 'pro',
    name: 'Toporo Pro',
    monthlyPrice: 25,
    annualPrice: 19,
    periodLabel: '/month',
    description: 'For cloud engineers and DevSecOps leads shipping production topologies.',
    ctaLabel: 'Start 7-Day Trial',
    route: '/signup',
    introLine: 'Everything in Free, plus:',
    features: [
      { title: 'Unlimited AI Copilot', subtitle: 'AI-powered multi-spoke topologies' },
      { title: 'Full CIS Benchmark Suite', subtitle: '1-click code remediation' },
      { title: 'Private architecture library', subtitle: 'Unlimited saved topologies' },
      { title: 'BOM & Compliance PDF/JSON', subtitle: 'Audit-ready evidence exports' },
      { title: 'Priority engineering support' },
    ],
  },
  {
    id: 'academic',
    name: 'Academic & Lab License',
    badge: 'Education',
    monthlyPrice: 0,
    annualPrice: 0,
    customPriceLabel: 'Contact Us',
    periodLabel: '',
    description: 'For educators and researchers. Exclusive for State Universities and Colleges in the Philippines.',
    ctaLabel: 'Coming Soon',
    route: '#',
    features: [
      { title: 'Self-hosted Design Studio', subtitle: 'Your own local sandbox' },
      { title: 'Classroom Licensing', subtitle: 'For faculty and students' },
      { title: 'No recurring subscription' },
    ],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How does Toporo keep visual diagrams and Terraform code synchronized?',
    answer:
      'Every drag-and-drop resource placement, subnet nesting change, or SKU update updates a unified architecture model. Toporo compiles clean Terraform blocks directly from that state and reflects manual code edits back onto the canvas instantaneously.',
  },
  {
    question: 'Do I need live Azure subscription credentials to use the studio?',
    answer:
      'No. Toporo runs as a zero-credential architecture workbench. You can synthesize topologies, run CIS Azure v2.0 static security checks, and query live Azure Retail Pricing estimates without uploading service principals or tenant secrets.',
  },
  {
    question: 'Which security framework powers the real-time guardrails?',
    answer:
      'Toporo integrates built-in static analysis mapped directly to CIS Azure Foundations Benchmark v2.0 controls, highlighting exposed management ports, missing encryption-at-rest, and permissive firewall policies right on the offending node.',
  },
  {
    question: 'Where do the live monthly cost estimates come from?',
    answer:
      'Our FinOps telemetry engine pairs resource attributes from your topology with live Azure Retail Pricing schedules so tier switches update your estimated spend immediately.',
  },
  {
    question: 'Can I import existing Terraform (.tf) repositories onto the canvas?',
    answer:
      'Yes. You can paste existing Azure Terraform blocks into the split-screen code inspector or import a project directory to reconstruct nested resource groups, virtual networks, and dependency edges with deterministic auto-layout routing.',
  },
  {
    question: 'What happens when I use the AI Architecture Copilot?',
    answer:
      'The Copilot translates plain-English workload requirements into structured Azure topologies, wires VNet peering and private endpoints automatically, and executes pre-flight security and FinOps checks before committing nodes to your canvas.',
  },
  {
    question: 'What files are included when I export a Terraform bundle?',
    answer:
      'Toporo exports modular Terraform code split cleanly across main.tf, variables.tf, outputs.tf, and versions.tf, optionally bundled with your CIS security posture summary and monthly FinOps Bill of Materials.',
  },
  {
    question: 'Can teams collaborate using enterprise Single Sign-On (SSO)?',
    answer:
      'Yes. Toporo supports streamlined authentication via enterprise SSO alongside workspace role controls so platform architects, security reviewers, and FinOps analysts stay aligned on one source of truth.',
  },
];

export const WALL_OF_LOVE: TestimonialCard[] = [
  {
    name: 'Elena Vasquez',
    handle: '@elenavasquez_cloud',
    role: 'Principal Platform Architect',
    quote: 'Seeing CIS security findings light up right on our hub-spoke canvas inside @ToporoEngine eliminated two days of PR back-and-forth.',
    mentionHighlight: '@ToporoEngine',
  },
  {
    name: 'Marcus Bennett',
    handle: '@mbennett_secops',
    role: 'Cloud Security Lead',
    quote: 'Most diagramming tools rot the day after kickoff. With @ToporoEngine, the diagram and main.tf are literally the same source of truth.',
    mentionHighlight: '@ToporoEngine',
  },
  {
    name: 'Priya Nair',
    handle: '@priyanair_finops',
    role: 'Staff Infrastructure Engineer',
    quote: 'Catching an accidental Premium Firewall SKU spike before terraform apply saved our Q3 staging budget instantly.',
  },
  {
    name: 'David Kim',
    handle: '@dkim_aks',
    role: 'DevOps Engineering Manager',
    quote: 'Onboarding junior engineers onto Azure networking used to take weeks. Now we sketch a blueprint in @ToporoEngine and inspect the code live.',
    mentionHighlight: '@ToporoEngine',
  },
  {
    name: 'Sofia Rossi',
    handle: '@sofiarossi_iac',
    role: 'Senior SRE',
    quote: 'Deterministic auto-layout nesting inside Virtual Networks means zero spaghetti lines when our AKS clusters scale across regions.',
  },
  {
    name: 'James OConnor',
    handle: '@joconnor_azure',
    role: 'Solutions Architect',
    quote: 'Exporting audited Terraform bundles alongside CIS and FinOps reports makes architecture review board sign-off effortless.',
  },
];

