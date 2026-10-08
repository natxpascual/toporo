import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve('../manuscripts/figures');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log(`[Screenshot Generator] Launching headless Chrome from: ${CHROME_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1680,1050',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1680, height: 1050, deviceScaleFactor: 2 });

    console.log(`[Screenshot Generator] Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for store and templates to be exposed
    await page.waitForFunction(() => !!window.__STUDIO_STORE__ && !!window.__ARCH_TEMPLATES__);
    await new Promise(r => setTimeout(r, 1000));

    // ─── Step 0: Load Rich Architecture Template ────────────────────────────
    console.log('[Screenshot Generator] Loading 3-Tier Enterprise Web App template...');
    await page.evaluate(async () => {
      const store = window.__STUDIO_STORE__.getState();
      const templates = window.__ARCH_TEMPLATES__;
      // Find 'Production 3-Tier Enterprise Web App' or index 4
      const tpl = templates.find(t => t.name.includes('3-Tier')) || templates[4] || templates[0];
      if (tpl) {
        await store.loadTemplate(tpl.topology);
        if (store.refreshCodeAndAnalysis) {
          await store.refreshCodeAndAnalysis();
        }
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    // Fit view on canvas
    await page.evaluate(() => {
      const fitBtn = document.querySelector('.react-flow__controls-fitview');
      if (fitBtn) fitBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // ─── 1. Slide 13: Canonical IR & Bidirectional Synchronization ──────────
    console.log('[Screenshot Generator] Capturing Slide 13 (Split-view Canvas + Monaco Editor)...');
    await page.evaluate(() => {
      const store = window.__STUDIO_STORE__.getState();
      // Ensure inspector and copilot are closed
      store.closeInspector?.();
      store.toggleCopilot?.(false);
      store.closeImport?.();

      // Open split view if not already open
      const splitBtn = document.querySelector('button[title*="Toggle Terraform HCL split editor"]');
      if (splitBtn && !splitBtn.classList.contains('active')) {
        splitBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 2500));
    const slide13Path = path.join(OUT_DIR, 'slide-13-bidirectional-sync.png');
    await page.screenshot({ path: slide13Path, fullPage: false });
    console.log(`Saved: ${slide13Path}`);

    // ─── 2. Slide 14: Multi-Source Reverse Engineering ──────────────────────
    console.log('[Screenshot Generator] Capturing Slide 14 (Reverse Engineering Import Modal)...');
    await page.evaluate(() => {
      const store = window.__STUDIO_STORE__.getState();
      store.openImport?.();
    });
    await new Promise(r => setTimeout(r, 1500));
    const slide14Path = path.join(OUT_DIR, 'slide-14-reverse-engineering.png');
    await page.screenshot({ path: slide14Path, fullPage: false });
    console.log(`Saved: ${slide14Path}`);

    // Close Import modal cleanly
    await page.evaluate(() => {
      const store = window.__STUDIO_STORE__.getState();
      store.closeImport?.();
    });
    await new Promise(r => setTimeout(r, 1000));

    // ─── 3. Slide 15: Policy-as-Code Security & FinOps Forecasting ──────────
    console.log('[Screenshot Generator] Capturing Slide 15 (Security & FinOps Inspector)...');
    await page.evaluate(() => {
      const store = window.__STUDIO_STORE__.getState();
      // Close split view to maximize canvas and inspector width
      const splitBtn = document.querySelector('button[title*="Toggle Terraform HCL split editor"]');
      if (splitBtn && splitBtn.classList.contains('active')) {
        splitBtn.click();
      }

      // Select a database or app service resource that has security/cost impact
      const res = store.topology?.resources?.find(r => r.type.includes('sql') || r.type.includes('app') || r.type.includes('storage'));
      if (res) {
        store.selectResource?.(res.id);
      }
      store.openInspector?.(res ? res.id : undefined);
      store.setActiveTab?.('security');
    });
    await new Promise(r => setTimeout(r, 1500));

    // Make sure security tab is active in the DOM
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.tab-item'));
      const secTab = tabs.find(t => t.textContent.toLowerCase().includes('security'));
      if (secTab) secTab.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const slide15Path = path.join(OUT_DIR, 'slide-15-security-finops.png');
    await page.screenshot({ path: slide15Path, fullPage: false });
    console.log(`Saved: ${slide15Path}`);

    // ─── 4. Slide 16: AI Architecture Copilot ───────────────────────────────
    console.log('[Screenshot Generator] Capturing Slide 16 (AI Architecture Copilot)...');
    await page.evaluate(() => {
      const store = window.__STUDIO_STORE__.getState();
      store.closeInspector?.();
      store.toggleCopilot?.(true);
    });
    await new Promise(r => setTimeout(r, 1500));

    // Pre-populate prompt in textarea to show realism
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = 'Add a high-availability Azure PostgreSQL Flexible Server in the data tier subnet with automatic daily backup, private endpoint, and TLS 1.3 encryption.';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    const slide16Path = path.join(OUT_DIR, 'slide-16-ai-copilot.png');
    await page.screenshot({ path: slide16Path, fullPage: false });
    console.log(`Saved: ${slide16Path}`);

    console.log('[Screenshot Generator] All 4 slides captured with rich live UI state!');
  } catch (err) {
    console.error('[Screenshot Generator] Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

run();
