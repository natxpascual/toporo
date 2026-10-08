import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const extHtmlPath = path.resolve(process.env.HOME, '.vscode/extensions/zaaack.markdown-editor-0.1.21/media/index.html');

// Candidate for Figure 1 (Circular Cycle, no "1. ", clean styling)
const fig1Candidate = `
\`\`\`mermaid
flowchart LR
    subgraph SPRINT["AGILE SPRINT LIFECYCLE - Continuous Iteration Cycle"]
        direction TB
        P1["Phase 1: Planning & Backlog<br/>• Define sprint goals<br/>• Prioritize backlog"]
        P2["Phase 2: Requirements<br/>• Canonical IR schemas<br/>• Azure catalog specs"]
        P3["Phase 3: Architecture<br/>• Bidirectional AST model<br/>• Visual data contracts"]
        P4["Phase 4: Implementation<br/>• React Flow canvas<br/>• FastAPI compiler backend"]
        P5["Phase 5: Testing<br/>• Pytest test suites<br/>• CIS Checkov security scans"]
        P6["Phase 6: Deployment<br/>• Azure App Service deploy<br/>• Practitioner feedback"]

        P1 --> P2
        P2 --> P3
        P3 --> P4
        P4 --> P5
        P5 --> P6
        P6 ==>|Continuous Sprint Cycle| P1
    end

    style SPRINT fill:#f8fafc,stroke:#0284c7,stroke-width:2px,color:#0f172a
    style P1 fill:#eff6ff,stroke:#3b82f6,stroke-width:1.5px,color:#1e3a8a
    style P2 fill:#ecfeff,stroke:#06b6d4,stroke-width:1.5px,color:#0e7490
    style P3 fill:#eef2ff,stroke:#6366f1,stroke-width:1.5px,color:#3730a3
    style P4 fill:#ecfdf5,stroke:#10b981,stroke-width:1.5px,color:#065f46
    style P5 fill:#fffbeb,stroke:#f59e0b,stroke-width:1.5px,color:#92400e
    style P6 fill:#fff1f2,stroke:#f43f5e,stroke-width:1.5px,color:#9f1239
\`\`\`
`;

// Candidate for Figure 3 (Flattened subgraphs, node-to-node links, high-contrast colors)
const fig3Candidate = `
\`\`\`mermaid
flowchart TB
    subgraph Client["TIER 1: PRESENTATION LAYER - Web Client SPA"]
        direction LR
        Canvas["Visual Canvas Viewport<br/>React Flow 12 Azure Nodes<br/>Security Heatmaps & FinOps Badges"]
        Monaco["Split Monaco Code Editor<br/>Real-Time Terraform HCL<br/>Inline Checkov Markers"]
        Store["Centralized State Store (Zustand)<br/>Canonical IR, History, Cost Estimates"]

        Canvas <-->|AST Bidirectional Sync| Monaco
        Canvas --> Store
        Monaco --> Store
    end

    subgraph Backend["TIER 2: APPLICATION LAYER - FastAPI Backend Microservice"]
        direction LR
        subgraph CoreEngines["Core Compiler Subsystem"]
            direction TB
            Validator["Canonical IR Validator<br/>Pydantic V2 Schemas"]
            Jinja["Code Generator<br/>Jinja2 HCL Emitters"]
            Parsers["Multi-Source Ingestion<br/>python-hcl2, State, ARG"]
            Graph["Topological Engine<br/>NetworkX Directed Graph"]
            
            Validator --- Jinja
            Parsers --- Graph
        end

        subgraph AnalysisEngines["Security, FinOps & AI Subsystems"]
            direction TB
            Policy["Checkov Policy Engine<br/>CIS Azure Benchmarks"]
            FinOps["FinOps Pricing Engine<br/>Infracost & Retail API"]
            Copilot["AI Architecture Copilot<br/>Azure OpenAI GPT-4o Client"]

            Policy --- FinOps
            Policy --> Copilot
            FinOps --> Copilot
        end
    end

    subgraph External["TIER 3: EXTERNAL MANAGED SERVICES & CLOUD APIS"]
        direction LR
        AOAI["Azure OpenAI Service<br/>GPT-4o API"]
        Infracost["Infracost Cloud API<br/>Cloud Rate Cards"]
        Retail["Azure Retail Prices API<br/>Live Metered Rates"]
        ARG["Azure Resource Graph<br/>Subscription Queries"]
        Infra["Azure App Service & Key Vault<br/>Runtime Infrastructure"]
    end

    Store -->|HTTPS REST API / WebSocket Stream| Validator
    Store -->|Security & Cost Queries| Policy
    Copilot -->|System-Assigned Managed Identity| AOAI
    FinOps --> Infracost
    FinOps --> Retail
    Parsers --> ARG

    style Client fill:#f0f9ff,stroke:#0284c7,stroke-width:1.5px,color:#0c4a6e
    style Backend fill:#faf5ff,stroke:#7c3aed,stroke-width:1.5px,color:#4c1d95
    style CoreEngines fill:#ffffff,stroke:#c4b5fd,stroke-width:1px,color:#5b21b6
    style AnalysisEngines fill:#ffffff,stroke:#c4b5fd,stroke-width:1px,color:#5b21b6
    style External fill:#f0fdf4,stroke:#16a34a,stroke-width:1.5px,color:#14532d
    
    style Canvas fill:#ffffff,stroke:#38bdf8,stroke-width:1px,color:#0f172a
    style Monaco fill:#ffffff,stroke:#38bdf8,stroke-width:1px,color:#0f172a
    style Store fill:#ffffff,stroke:#38bdf8,stroke-width:1px,color:#0f172a
    
    style Validator fill:#ffffff,stroke:#a78bfa,stroke-width:1px,color:#0f172a
    style Jinja fill:#ffffff,stroke:#a78bfa,stroke-width:1px,color:#0f172a
    style Parsers fill:#ffffff,stroke:#a78bfa,stroke-width:1px,color:#0f172a
    style Graph fill:#ffffff,stroke:#a78bfa,stroke-width:1px,color:#0f172a
    style Policy fill:#ffffff,stroke:#a78bfa,stroke-width:1px,color:#0f172a
    style FinOps fill:#ffffff,stroke:#a78bfa,stroke-width:1px,color:#0f172a
    style Copilot fill:#ffffff,stroke:#a78bfa,stroke-width:1px,color:#0f172a
    
    style AOAI fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#0f172a
    style Infracost fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#0f172a
    style Retail fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#0f172a
    style ARG fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#0f172a
    style Infra fill:#ffffff,stroke:#4ade80,stroke-width:1px,color:#0f172a
\`\`\`
`;

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 2000 });
  await page.goto('file://' + extHtmlPath);

  const testDoc = `# Test Diagrams\n\n${fig1Candidate}\n\n${fig3Candidate}`;
  await page.evaluate((md) => {
    window.postMessage({ command: 'update', content: md, theme: 'dark', type: 'init' }, '*');
  }, testDoc);

  await new Promise(r => setTimeout(r, 4000));

  const svgs = await page.$$('div[data-type="mermaid"] svg, .language-mermaid svg');
  console.log('Found SVGs in candidate test:', svgs.length);

  for (let i = 0; i < svgs.length; i++) {
    const box = await svgs[i].boundingBox();
    console.log(`Candidate Fig ${i + 1} box:`, box);
    if (box && box.width > 0 && box.height > 0) {
      await page.screenshot({
        path: `frontend/scripts/candidate-fig-${i + 1}.png`,
        clip: box
      });
      console.log(`Saved screenshot for Candidate Fig ${i + 1}`);
    }
  }

  const errors = await page.evaluate(() => {
    const allText = Array.from(document.querySelectorAll('text, span, p')).map(e => e.textContent.trim());
    return allText.filter(t => t.toLowerCase().includes('unsupported') || t.toLowerCase().includes('error'));
  });

  console.log('Errors in candidate:', errors);

  await browser.close();
}
run();
