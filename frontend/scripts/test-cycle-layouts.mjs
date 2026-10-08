import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const extHtmlPath = path.resolve(process.env.HOME, '.vscode/extensions/zaaack.markdown-editor-0.1.21/media/index.html');

const testCycle1 = `
\`\`\`mermaid
flowchart TD
    P1["Phase 1: Planning & Backlog<br/>• Define sprint goals<br/>• Backlog refinement"] --> P2["Phase 2: Requirements<br/>• Canonical IR schema<br/>• User story mapping"]
    P2 --> P3["Phase 3: Architecture<br/>• Bidirectional AST<br/>• Visual data contracts"]
    P3 --> P4["Phase 4: Implementation<br/>• React Flow canvas<br/>• FastAPI compiler backend"]
    P4 --> P5["Phase 5: Testing<br/>• Automated Pytest suites<br/>• CIS Checkov compliance"]
    P5 --> P6["Phase 6: Deployment<br/>• Azure App Service<br/>• Practitioner evaluation"]
    P6 ==>|Continuous Iteration Cycle| P1

    style P1 fill:#eff6ff,stroke:#3b82f6,stroke-width:1.5px,color:#1e3a8a
    style P2 fill:#ecfeff,stroke:#06b6d4,stroke-width:1.5px,color:#0e7490
    style P3 fill:#eef2ff,stroke:#6366f1,stroke-width:1.5px,color:#3730a3
    style P4 fill:#ecfdf5,stroke:#10b981,stroke-width:1.5px,color:#065f46
    style P5 fill:#fffbeb,stroke:#f59e0b,stroke-width:1.5px,color:#92400e
    style P6 fill:#fff1f2,stroke:#f43f5e,stroke-width:1.5px,color:#9f1239
\`\`\`
`;

const testCycle3 = `
\`\`\`mermaid
flowchart TD
    subgraph Cycle[" "]
        direction TB
        subgraph TopRow[" "]
            direction LR
            P1["Phase 1: Planning & Backlog<br/>• Sprint goals & backlog"]
            P2["Phase 2: Requirements<br/>• Canonical IR & user stories"]
            P3["Phase 3: Architecture<br/>• Bidirectional AST model"]
        end
        subgraph BotRow[" "]
            direction RL
            P4["Phase 4: Implementation<br/>• React Flow & FastAPI"]
            P5["Phase 5: Testing<br/>• Pytest & Checkov CIS"]
            P6["Phase 6: Deployment<br/>• App Service & review"]
        end
    end

    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> P5
    P5 --> P6
    P6 ==>|Continuous Sprint Cycle| P1

    style Cycle fill:none,stroke:none
    style TopRow fill:none,stroke:none
    style BotRow fill:none,stroke:none
    style P1 fill:#eff6ff,stroke:#3b82f6,stroke-width:1.5px,color:#1e3a8a
    style P2 fill:#ecfeff,stroke:#06b6d4,stroke-width:1.5px,color:#0e7490
    style P3 fill:#eef2ff,stroke:#6366f1,stroke-width:1.5px,color:#3730a3
    style P4 fill:#ecfdf5,stroke:#10b981,stroke-width:1.5px,color:#065f46
    style P5 fill:#fffbeb,stroke:#f59e0b,stroke-width:1.5px,color:#92400e
    style P6 fill:#fff1f2,stroke:#f43f5e,stroke-width:1.5px,color:#9f1239
\`\`\`
`;

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 2500 });
  await page.goto('file://' + extHtmlPath);

  const testDoc = `# Test Cycles\n\n${testCycle1}\n\n${testCycle3}`;
  await page.evaluate((md) => {
    window.postMessage({ command: 'update', content: md, theme: 'dark', type: 'init' }, '*');
  }, testDoc);

  await new Promise(r => setTimeout(r, 4000));

  const svgs = await page.$$('div[data-type="mermaid"] svg, .language-mermaid svg');
  console.log('Found SVGs:', svgs.length);

  for (let i = 0; i < svgs.length; i++) {
    const box = await svgs[i].boundingBox();
    if (box && box.width > 0 && box.height > 0) {
      await page.screenshot({
        path: `frontend/scripts/cycle-${i + 1}.png`,
        clip: box
      });
      console.log(`Saved screenshot for cycle ${i + 1}`);
    }
  }

  await browser.close();
}
run();
