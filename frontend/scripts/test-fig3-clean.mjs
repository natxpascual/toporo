import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const extHtmlPath = path.resolve(process.env.HOME, '.vscode/extensions/zaaack.markdown-editor-0.1.21/media/index.html');

const fig3Test = `
\`\`\`mermaid
flowchart TB
    subgraph TIER1["TIER 1: PRESENTATION LAYER (Web Client SPA)"]
        direction LR
        Canvas["Visual Canvas Viewport<br/>• React Flow 12 Azure Nodes<br/>• Security Heatmaps & Cost Badges"]
        Monaco["Split Monaco Code Editor<br/>• Real-Time Terraform HCL<br/>• Inline Diagnostic Markers"]
        Store["Centralized State Store (Zustand)<br/>• Canonical IR Graph Document<br/>• Undo/Redo & Live Estimates"]

        Canvas <-->|AST Bidirectional Sync| Monaco
        Canvas --> Store
        Monaco --> Store
    end

    subgraph TIER2["TIER 2: APPLICATION LAYER (FastAPI Backend Microservice)"]
        direction TB
        subgraph CoreSubsystem["Core Compiler & Parser Subsystem"]
            direction LR
            Validator["Canonical IR Validator<br/>Pydantic V2 Schemas"]
            Jinja["Code Generator<br/>Jinja2 HCL Emitters"]
            Parsers["Multi-Source Ingestion<br/>python-hcl2, State, ARG"]
            Graph["Topological Engine<br/>NetworkX Directed Graph"]
        end

        subgraph AnalysisSubsystem["Security, FinOps & AI Subsystem"]
            direction LR
            Policy["Checkov Policy Engine<br/>CIS Azure Benchmarks"]
            FinOps["FinOps Pricing Engine<br/>Infracost & Retail API"]
            Copilot["AI Architecture Copilot<br/>Azure OpenAI GPT-4o Client"]
        end

        Validator --- Jinja
        Parsers --- Graph
        Policy --- FinOps
        Policy --> Copilot
        FinOps --> Copilot
    end

    subgraph TIER3["TIER 3: EXTERNAL MANAGED SERVICES & CLOUD APIS"]
        direction LR
        AOAI["Azure OpenAI Service<br/>GPT-4o API"]
        Infracost["Infracost Cloud API<br/>Cloud Rate Cards"]
        Retail["Azure Retail Prices API<br/>Metered Prices"]
        ARG["Azure Resource Graph<br/>Subscription Queries"]
        Infra["Azure App Service & Key Vault<br/>Runtime Hosting"]
    end

    Store -->|HTTPS REST API / WebSocket Stream| Validator
    Store -->|Policy Scans & Cost Estimations| Policy
    Copilot -->|System-Assigned Managed Identity| AOAI
    FinOps --> Infracost
    FinOps --> Retail
    Parsers --> ARG

    style TIER1 fill:#eff6ff,stroke:#1d4ed8,stroke-width:1.5px,color:#1e3a8a
    style TIER2 fill:#faf5ff,stroke:#6d28d9,stroke-width:1.5px,color:#4c1d95
    style CoreSubsystem fill:#ffffff,stroke:#c4b5fd,stroke-width:1px,color:#5b21b6
    style AnalysisSubsystem fill:#ffffff,stroke:#c4b5fd,stroke-width:1px,color:#5b21b6
    style TIER3 fill:#f0fdf4,stroke:#15803d,stroke-width:1.5px,color:#14532d

    style Canvas fill:#ffffff,stroke:#3b82f6,stroke-width:1px,color:#0f172a
    style Monaco fill:#ffffff,stroke:#3b82f6,stroke-width:1px,color:#0f172a
    style Store fill:#ffffff,stroke:#3b82f6,stroke-width:1px,color:#0f172a

    style Validator fill:#ffffff,stroke:#8b5cf6,stroke-width:1px,color:#0f172a
    style Jinja fill:#ffffff,stroke:#8b5cf6,stroke-width:1px,color:#0f172a
    style Parsers fill:#ffffff,stroke:#8b5cf6,stroke-width:1px,color:#0f172a
    style Graph fill:#ffffff,stroke:#8b5cf6,stroke-width:1px,color:#0f172a
    style Policy fill:#ffffff,stroke:#8b5cf6,stroke-width:1px,color:#0f172a
    style FinOps fill:#ffffff,stroke:#8b5cf6,stroke-width:1px,color:#0f172a
    style Copilot fill:#ffffff,stroke:#8b5cf6,stroke-width:1px,color:#0f172a

    style AOAI fill:#ffffff,stroke:#22c55e,stroke-width:1px,color:#0f172a
    style Infracost fill:#ffffff,stroke:#22c55e,stroke-width:1px,color:#0f172a
    style Retail fill:#ffffff,stroke:#22c55e,stroke-width:1px,color:#0f172a
    style ARG fill:#ffffff,stroke:#22c55e,stroke-width:1px,color:#0f172a
    style Infra fill:#ffffff,stroke:#22c55e,stroke-width:1px,color:#0f172a
\`\`\`
`;

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 3000 });
  await page.goto('file://' + extHtmlPath);

  const testDoc = `# Test Fig 3\n\n${fig3Test}`;
  await page.evaluate((md) => {
    window.postMessage({ command: 'update', content: md, theme: 'dark', type: 'init' }, '*');
  }, testDoc);

  await new Promise(r => setTimeout(r, 4000));

  const svgs = await page.$$('div[data-type="mermaid"] svg, .language-mermaid svg');
  console.log('Found SVGs:', svgs.length);

  if (svgs.length > 0) {
    const box = await svgs[0].boundingBox();
    console.log('Fig 3 box:', box);
    if (box && box.width > 0 && box.height > 0) {
      await page.screenshot({
        path: `frontend/scripts/fig-3-clean.png`,
        clip: box
      });
      console.log('Saved screenshot for fig-3-clean.png');
    }
  }

  const errors = await page.evaluate(() => {
    const allText = Array.from(document.querySelectorAll('text, span, p')).map(e => e.textContent.trim());
    return allText.filter(t => t.toLowerCase().includes('unsupported') || t.toLowerCase().includes('error'));
  });
  console.log('Errors:', errors);

  await browser.close();
}
run();
