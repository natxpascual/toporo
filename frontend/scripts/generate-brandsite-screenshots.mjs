import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

function getChromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidatePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome binary not found.');
}

const targetUrl = process.env.TARGET_URL || 'http://localhost:3100';
const publicDir = path.resolve('public/screenshots');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function run() {
  const chromePath = getChromePath();
  console.log('[Screenshot Generator] Browser:', chromePath);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 20000 });

    // 1. Load starter architecture template
    await page.evaluate(() => {
      const store = window.__STUDIO_STORE__?.getState();
      const templates = window.__ARCH_TEMPLATES__;
      if (store && templates && templates.length > 0) {
        // Find a rich template e.g. web-paas or single-vm or aks
        const t = templates.find((x) => x.id === 'starter-single-vm') || templates[0];
        store.loadTemplate(t.topology);
      }
    });

    await new Promise((r) => setTimeout(r, 1000));

    // Capture Hero Canvas Overview
    const heroPath = path.join(publicDir, 'hero-topology-overview.png');
    await page.screenshot({ path: heroPath });
    console.log('[Screenshot Generator] Saved:', heroPath);

    // 2. Open Split View Monaco Editor
    await page.evaluate(() => {
      // Click split view button or toggle
      const splitBtn = Array.from(document.querySelectorAll('button')).find((b) =>
        b.innerText?.includes('Split') || b.title?.includes('Split') || b.querySelector('svg')
      );
      // or find button with Split Editor
      const allButtons = Array.from(document.querySelectorAll('header button'));
      const found = allButtons.find((b) => b.getAttribute('title')?.toLowerCase().includes('split') || b.innerText?.toLowerCase().includes('split'));
      if (found) found.click();
    });

    await new Promise((r) => setTimeout(r, 1000));
    const splitPath = path.join(publicDir, 'split-code-editor.png');
    await page.screenshot({ path: splitPath });
    console.log('[Screenshot Generator] Saved:', splitPath);

    // 3. Open Inspector / Security tab
    await page.evaluate(() => {
      const store = window.__STUDIO_STORE__?.getState();
      if (store) {
        store.openInspector?.('vm_core');
        store.setActiveTab?.('security');
      }
    });

    await new Promise((r) => setTimeout(r, 1000));
    const secPath = path.join(publicDir, 'security-finops-inspector.png');
    await page.screenshot({ path: secPath });
    console.log('[Screenshot Generator] Saved:', secPath);

    // Also copy to screenshots dir
    const mainScreenshotsDir = path.resolve('screenshots');
    if (!fs.existsSync(mainScreenshotsDir)) fs.mkdirSync(mainScreenshotsDir, { recursive: true });
    fs.copyFileSync(heroPath, path.join(mainScreenshotsDir, 'hero-topology-overview.png'));
    fs.copyFileSync(splitPath, path.join(mainScreenshotsDir, 'split-code-editor.png'));
    fs.copyFileSync(secPath, path.join(mainScreenshotsDir, 'security-finops-inspector.png'));

    console.log('[Screenshot Generator] All screenshots generated successfully!');
  } finally {
    await browser.close();
  }
}

run().catch((e) => {
  console.error('[Screenshot Generator] Error:', e);
  process.exit(1);
});
