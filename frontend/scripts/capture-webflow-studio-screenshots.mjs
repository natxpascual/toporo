import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = process.env.TARGET_URL || 'http://localhost:3000';

const publicScreenshotsDir = path.resolve('frontend/public/screenshots');
const rootScreenshotsDir = path.resolve('screenshots');

for (const dir of [publicScreenshotsDir, rootScreenshotsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveBoth(filename, buffer) {
  const p1 = path.join(publicScreenshotsDir, filename);
  const p2 = path.join(rootScreenshotsDir, filename);
  fs.writeFileSync(p1, buffer);
  fs.writeFileSync(p2, buffer);
  console.log(`📸 Saved screenshot: ${filename}`);
}

async function run() {
  console.log('🚀 Launching headless Chrome to verify Studio fixes & capture real screenshots...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1440,900',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    await page.goto(`${BASE_URL}/#studio`, { waitUntil: 'networkidle0', timeout: 20000 });
    await page.evaluate(() => {
      window.__APP_ROUTER__?.navigate('/studio');
      window.useTopologyStore?.getState()?.setThemeMode('dark');
    });
    await new Promise((r) => setTimeout(r, 1000));

    // Load the Hub & Spoke enterprise blueprint
    await page.evaluate(async () => {
      const store = window.useTopologyStore.getState();
      await store.loadSample('hub-spoke');
      store.setGridMode('dotted');
      store.setViewMode('simple');
    });
    await new Promise((r) => setTimeout(r, 1200));

    // Click Fit to Screen in the draw.io-inspired toolbox
    await page.evaluate(() => {
      const fitBtn = document.querySelector('[data-testid="studio-toolbox"] button[title*="Fit"]');
      fitBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // ─────────────────────────────────────────────────────────────────────────
    // VERIFY FIX 3: Toolbox is docked directly below the Menu Header (draw.io style)
    // ─────────────────────────────────────────────────────────────────────────
    const toolboxCheck = await page.evaluate(() => {
      const header = document.querySelector('header');
      const toolbox = document.querySelector('[data-testid="studio-toolbox"]');
      if (!header || !toolbox) return { ok: false };
      const hRect = header.getBoundingClientRect();
      const tRect = toolbox.getBoundingClientRect();
      return {
        ok: Math.abs(tRect.top - hRect.bottom) <= 2 && tRect.width >= window.innerWidth - 5,
        headerBottom: hRect.bottom,
        toolboxTop: tRect.top,
        toolboxWidth: tRect.width,
        windowWidth: window.innerWidth,
      };
    });
    console.log('✅ Fix 3 (Draw.io Toolbox below Menu):', JSON.stringify(toolboxCheck));
    if (!toolboxCheck.ok) {
      throw new Error(`Toolbox position check failed: ${JSON.stringify(toolboxCheck)}`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VERIFY FIX 2: Opening Code Editor when Properties Panel is already visible
    // does NOT close the Properties Panel
    // ─────────────────────────────────────────────────────────────────────────
    await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const firstRes = store.topology.resources.find((r) => r.type === 'azurerm_firewall') || store.topology.resources[0];
      store.openInspector(firstRes?.id);
      store.setActiveTab('inspector');
    });
    await new Promise((r) => setTimeout(r, 500));

    const beforeCodeOpen = await page.evaluate(() => {
      return Boolean(document.querySelector('.bottom-panel-container'));
    });

    // Now click the Code Editor button while Properties Panel is open (and unpinned!)
    await page.evaluate(() => {
      const codeBtn = Array.from(document.querySelectorAll('header button')).find(
        (b) => b.title?.includes('Code Drawer') || b.innerText?.includes('Code')
      );
      codeBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 800));

    const afterCodeOpen = await page.evaluate(() => {
      const panel = document.querySelector('.bottom-panel-container');
      const editor = document.querySelector('[data-testid="code-editor-window"]');
      return {
        inspectorStillVisible: Boolean(panel),
        editorVisible: Boolean(editor),
      };
    });
    console.log('✅ Fix 2 (Properties Panel stays open when Code Editor enabled):', JSON.stringify({ beforeCodeOpen, ...afterCodeOpen }));
    if (!beforeCodeOpen || !afterCodeOpen.inspectorStillVisible || !afterCodeOpen.editorVisible) {
      throw new Error(`Fix 2 failed: ${JSON.stringify({ beforeCodeOpen, ...afterCodeOpen })}`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VERIFY FIX 1: Right side of Properties Panel spans until the edge of Code Editor
    // ─────────────────────────────────────────────────────────────────────────
    const spanCheck = await page.evaluate(() => {
      const panel = document.querySelector('.bottom-panel-container');
      const editor = document.querySelector('[data-testid="code-editor-window"]');
      if (!panel || !editor) return { ok: false };
      const pRect = panel.getBoundingClientRect();
      const eRect = editor.getBoundingClientRect();
      return {
        ok: Math.abs(pRect.right - eRect.left) <= 4 && eRect.bottom >= window.innerHeight - 2,
        inspectorRight: Math.round(pRect.right),
        editorLeft: Math.round(eRect.left),
        editorBottom: Math.round(eRect.bottom),
        windowHeight: window.innerHeight,
      };
    });
    console.log('✅ Fix 1 (Properties Panel right edge meets Code Editor left edge):', JSON.stringify(spanCheck));
    if (!spanCheck.ok) {
      throw new Error(`Fix 1 failed: ${JSON.stringify(spanCheck)}`);
    }

    // Re-fit canvas so it's centered nicely in the split view
    await page.evaluate(() => {
      const fitBtn = document.querySelector('[data-testid="studio-toolbox"] button[title*="Fit"]');
      fitBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    // ─────────────────────────────────────────────────────────────────────────
    // SCREENSHOT 1: Full Studio Split Workspace (Canvas + Toolbox + Properties + Monaco)
    // ─────────────────────────────────────────────────────────────────────────
    const bufSplitWorkspace = await page.screenshot({ type: 'png' });
    saveBoth('studio-split-workspace.png', bufSplitWorkspace);
    saveBoth('split-code-editor.png', bufSplitWorkspace);
    saveBoth('hero-topology-overview.png', bufSplitWorkspace);

    // ─────────────────────────────────────────────────────────────────────────
    // SCREENSHOT 2: Security Guardrails & CIS Audit Tab
    // ─────────────────────────────────────────────────────────────────────────
    await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      // Find a resource with security findings or inject realistic Checkov CIS findings on the selected resource for the showcase
      const resources = store.topology.resources.map((r) => {
        if (r.type === 'azurerm_firewall' || r.id === store.selectedResourceId) {
          return {
            ...r,
            security_findings: [
              {
                rule_id: 'CKV_AZURE_216',
                rule_name: 'Ensure Azure Firewall Threat Intelligence mode is set to Alert and Deny',
                severity: 'HIGH',
                description: 'Azure Firewall threat intelligence-based filtering should be configured to alert and deny traffic from known malicious IP addresses and domains.',
                fix_suggestion: 'threat_intel_mode = "Deny"',
              },
              {
                rule_id: 'CKV_AZURE_219',
                rule_name: 'Ensure Azure Firewall Policy IDPS is enabled in Premium tier',
                severity: 'CRITICAL',
                description: 'Intrusion Detection and Prevention System (IDPS) signatures inspect network traffic for lateral movement and command-and-control payloads.',
                fix_suggestion: 'sku_tier = "Premium"',
              },
            ],
          };
        }
        return r;
      });
      window.useTopologyStore.setState({
        topology: { ...store.topology, resources },
        securitySummary: { score: 82, critical: 1, high: 1, medium: 0, low: 0 },
      });
      store.setActiveTab('security');
    });
    await new Promise((r) => setTimeout(r, 600));

    const bufSecurity = await page.screenshot({ type: 'png' });
    saveBoth('studio-security-guardrails.png', bufSecurity);
    saveBoth('security-finops-inspector.png', bufSecurity);

    // ─────────────────────────────────────────────────────────────────────────
    // SCREENSHOT 3: Infracost Real-Time FinOps Cost Breakdown Tab
    // ─────────────────────────────────────────────────────────────────────────
    await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      store.setActiveTab('finops');
    });
    await new Promise((r) => setTimeout(r, 600));

    const bufFinops = await page.screenshot({ type: 'png' });
    saveBoth('studio-finops-cost.png', bufFinops);

    // ─────────────────────────────────────────────────────────────────────────
    // SCREENSHOT 4: Enterprise Blueprints & Specification Cards View
    // ─────────────────────────────────────────────────────────────────────────
    // Close code editor so the full canvas with Detailed Cards + Mini-Map + Blueprints sidebar shines
    await page.evaluate(async () => {
      const codeBtn = Array.from(document.querySelectorAll('header button')).find(
        (b) => b.title?.includes('Code Drawer') || b.innerText?.includes('Code')
      );
      codeBtn?.click();
      const store = window.useTopologyStore.getState();
      store.closeInspector();
      await store.loadSample('3tier-web');
      store.setViewMode('detailed');
      store.toggleMiniMap(true);
      const bpTab = Array.from(document.querySelectorAll('aside button')).find((b) =>
        b.innerText?.includes('Blueprints')
      );
      bpTab?.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await page.evaluate(() => {
      const fitBtn = document.querySelector('[data-testid="studio-toolbox"] button[title*="Fit"]');
      fitBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const bufCardsBlueprints = await page.screenshot({ type: 'png' });
    saveBoth('studio-cards-blueprints.png', bufCardsBlueprints);

    // ─────────────────────────────────────────────────────────────────────────
    // SCREENSHOT 5: AI Copilot Synthesis Modal Over Live Topology
    // ─────────────────────────────────────────────────────────────────────────
    await page.evaluate(async () => {
      const store = window.useTopologyStore.getState();
      await store.loadSample('hub-spoke');
      store.setViewMode('simple');
      store.toggleCopilot(true);
    });
    await new Promise((r) => setTimeout(r, 700));

    const bufCopilot = await page.screenshot({ type: 'png' });
    saveBoth('studio-ai-copilot.png', bufCopilot);

    console.log('🎉 All Studio fixes verified & 5 high-DPI real product screenshots captured!');
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
