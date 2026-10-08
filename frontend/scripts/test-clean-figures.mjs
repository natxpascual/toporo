import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const extHtmlPath = path.resolve(process.env.HOME, '.vscode/extensions/zaaack.markdown-editor-0.1.21/media/index.html');
const rootDir = '/Users/natpascual/Library/CloudStorage/OneDrive-Personal/Documents/02. GSIT - Masters/00_CAPSTONE';

const fig1 = `
\`\`\`mermaid
flowchart TD
    P1["Phase 1: Planning & Backlog<br/>• Define sprint goals<br/>• Backlog refinement"] --> P2["Phase 2: Requirements Analysis<br/>• Canonical IR schemas<br/>• User story mapping"]
    P2 --> P3["Phase 3: Architecture & Design<br/>• Bidirectional AST model<br/>• Visual data contracts"]
    P3 --> P4["Phase 4: Implementation<br/>• React Flow canvas<br/>• FastAPI compiler backend"]
    P4 --> P5["Phase 5: Testing & Verification<br/>• Automated Pytest suites<br/>• CIS Checkov compliance"]
    P5 --> P6["Phase 6: Deployment & Evaluation<br/>• Azure App Service deploy<br/>• Practitioner feedback"]
    P6 ==>|Continuous Agile Iteration Cycle| P1

    style P1 fill:#eff6ff,stroke:#3b82f6,stroke-width:2px,color:#1e3a8a
    style P2 fill:#ecfeff,stroke:#06b6d4,stroke-width:2px,color:#0e7490
    style P3 fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#3730a3
    style P4 fill:#ecfdf5,stroke:#10b981,stroke-width:2px,color:#065f46
    style P5 fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,color:#92400e
    style P6 fill:#fff1f2,stroke:#f43f5e,stroke-width:2px,color:#9f1239
\`\`\`
`;

// Option A: 3 Clean Tiers (No nested subgraphs inside Tier 2, purely clean grid layout)
const fig3OptionA = `
\`\`\`mermaid
flowchart TB
    subgraph TIER1["Tier 1: Presentation Layer — Single-Page Application"]
        Canvas["Interactive Visual Canvas<br/>• React Flow 12 Viewport<br/>• Hierarchical Azure Nodes"]
        Monaco["Split Code Editor<br/>• Real-Time Terraform HCL<br/>• Inline Diagnostic Markers"]
        Store["Central State Store<br/>• Zustand State Manager<br/>• Canonical IR Sync"]

        Canvas <-->|AST Bidirectional Sync| Monaco
        Canvas --> Store
        Monaco --> Store
    end

    subgraph TIER2["Tier 2: Application Layer — FastAPI Asynchronous Backend Services"]
        Validator["Canonical IR Validator<br/>• Pydantic V2 Schemas"]
        Jinja["HCL Code Generator<br/>• Jinja2 Modular Emitters"]
        Parsers["Multi-Source Ingestion<br/>• python-hcl2, State, ARG"]
        GraphEngine["Topological Engine<br/>• NetworkX Layouts"]
        Policy["Policy & Compliance<br/>• Checkov CIS Benchmarks"]
        FinOps["FinOps Pricing Engine<br/>• Infracost & Retail API"]
        Copilot["AI Architecture Copilot<br/>• Azure OpenAI Client"]

        Validator --- Jinja
        Parsers --- GraphEngine
        Policy --- FinOps
        Policy --> Copilot
        FinOps --> Copilot
    end

    subgraph TIER3["Tier 3: External Managed Services & Cloud APIs"]
        AOAI["Azure OpenAI Service<br/>• GPT-4o Architecture Model"]
        Infracost["Infracost Cloud API<br/>• Cloud Cost Benchmarks"]
        Retail["Azure Retail Prices API<br/>• Live Metered Pricing"]
        ARG["Azure Resource Graph<br/>• Infrastructure Queries"]
        Infra["Azure Infrastructure<br/>• App Service & Key Vault"]
    end

    Store ==>|HTTPS REST API / WebSocket Stream| Validator
    Store ==>|Policy Scans & Cost Estimations| Policy
    Copilot ==>|System-Assigned Managed Identity| AOAI
    FinOps --> Infracost
    FinOps --> Retail
    Parsers --> ARG

    style TIER1 fill:#eff6ff,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    style TIER2 fill:#faf5ff,stroke:#7c3aed,stroke-width:2px,color:#4c1d95
    style TIER3 fill:#f0fdf4,stroke:#16a34a,stroke-width:2px,color:#14532d

    style Canvas fill:#ffffff,stroke:#3b82f6,stroke-width:1.5px,color:#0f172a
    style Monaco fill:#ffffff,stroke:#3b82f6,stroke-width:1.5px,color:#0f172a
    style Store fill:#ffffff,stroke:#3b82f6,stroke-width:1.5px,color:#0f172a

    style Validator fill:#ffffff,stroke:#8b5cf6,stroke-width:1.5px,color:#0f172a
    style Jinja fill:#ffffff,stroke:#8b5cf6,stroke-width:1.5px,color:#0f172a
    style Parsers fill:#ffffff,stroke:#8b5cf6,stroke-width:1.5px,color:#0f172a
    style GraphEngine fill:#ffffff,stroke:#8b5cf6,stroke-width:1.5px,color:#0f172a
    style Policy fill:#ffffff,stroke:#8b5cf6,stroke-width:1.5px,color:#0f172a
    style FinOps fill:#ffffff,stroke:#8b5cf6,stroke-width:1.5px,color:#0f172a
    style Copilot fill:#ffffff,stroke:#8b5cf6,stroke-width:1.5px,color:#0f172a

    style AOAI fill:#ffffff,stroke:#22c55e,stroke-width:1.5px,color:#0f172a
    style Infracost fill:#ffffff,stroke:#22c55e,stroke-width:1.5px,color:#0f172a
    style Retail fill:#ffffff,stroke:#22c55e,stroke-width:1.5px,color:#0f172a
    style ARG fill:#ffffff,stroke:#22c55e,stroke-width:1.5px,color:#0f172a
    style Infra fill:#ffffff,stroke:#22c55e,stroke-width:1.5px,color:#0f172a
\`\`\`
`;

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 3500 });
  await page.goto('file://' + extHtmlPath);

  const testDoc = `# Test Clean Diagrams\n\n${fig1}\n\n${fig3OptionA}`;
  await page.evaluate((md) => {
    window.postMessage({ command: 'update', content: md, theme: 'dark', type: 'init' }, '*');
  }, testDoc);

  await new Promise(r => setTimeout(r, 4000));

  const svgs = await page.$$('div[data-type="mermaid"] svg, .language-mermaid svg');
  console.log('Found SVGs in clean test:', svgs.length);

  for (let i = 0; i < svgs.length; i++) {
    const box = await svgs[i].boundingBox();
    console.log(`Clean Fig ${i + 1} box:`, box);
    if (box && box.width > 0 && box.height > 0) {
      await page.screenshot({
        path: path.resolve(rootDir, `frontend/scripts/clean-fig-${i + 1}.png`),
        clip: box
      });
      console.log(`Saved screenshot for clean-fig-${i + 1}.png`);
    }
  }

  const errors = await page.evaluate(() => {
    const allText = Array.from(document.querySelectorAll('text, span, p')).map(e => e.textContent.trim());
    return allText.filter(t => t.toLowerCase().includes('unsupported') || t.toLowerCase().includes('error') || t.toLowerCase().includes('syntax'));
  });

  console.log('Errors in clean figures:', errors);

  await browser.close();
}

run().catch(console.error);
