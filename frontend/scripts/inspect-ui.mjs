import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

// Locate Chrome binary across common macOS & Linux paths
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
    '/usr/bin/chromium-browser',
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome/Chromium binary not found. Please set CHROME_PATH environment variable.');
}

// Parse simple CLI args
const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const found = args.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const targetUrl = getArg('url', 'http://localhost:3000');
const screenshotPath = getArg('screenshot', './screenshots/topology_ui_inspection.png');
const shouldAssert = args.includes('--assert') || args.includes('--assert-ui');

async function inspect() {
  const chromePath = getChromePath();
  console.log(`[Headless Inspector] Using browser: ${chromePath}`);
  console.log(`[Headless Inspector] Navigating to: ${targetUrl}`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // Listen to console logs / errors from the frontend
    const consoleLogs = [];
    page.on('console', (msg) => {
      consoleLogs.push({ type: msg.type(), text: msg.text() });
    });
    const pageErrors = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 20000 });

    const title = await page.title();
    console.log(`[Headless Inspector] Page Title: "${title}"`);

    // Run automated UI inspection
    const uiMetrics = await page.evaluate(() => {
      // Check top navigation & theme elements
      const hasAppSwitcher = Boolean(document.querySelector('header svg circle'));
      const headerTitle = document.querySelector('header')?.innerText || '';
      const hasLozenges = document.querySelectorAll('.lozenge, [class*="lozenge"], [class*="badge-"]').length;
      
      // Check catalog sidebar
      const hasCatalog = Boolean(document.querySelector('input[placeholder*="components"]'));
      
      // Check React Flow canvas
      const nodeCount = document.querySelectorAll('.react-flow__node').length;
      const edgeCount = document.querySelectorAll('.react-flow__edge').length;
      const hasContainer = document.querySelectorAll('.react-flow__node-containerResource').length;
      
      // Check Monaco editor
      const hasEditor = Boolean(document.querySelector('.monaco-editor') || document.querySelector('[data-mode-id]'));
      
      // Check status bar
      const hasStatusBar = Boolean(document.querySelector('.status-dot'));

      return {
        hasAppSwitcher,
        headerContainsBrand: headerTitle.includes('Topology Studio'),
        lozengeCount: hasLozenges,
        hasCatalog,
        nodeCount,
        edgeCount,
        containerCount: hasContainer,
        hasEditor,
        hasStatusBar,
      };
    });

    console.log('[Headless Inspector] Inspection Metrics:', JSON.stringify(uiMetrics, null, 2));

    // Ensure output directory exists for screenshot
    const resolvedScreenshot = path.resolve(screenshotPath);
    const dir = path.dirname(resolvedScreenshot);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await page.screenshot({ path: resolvedScreenshot, fullPage: false });
    console.log(`[Headless Inspector] Screenshot saved to: ${resolvedScreenshot}`);

    if (shouldAssert) {
      if (pageErrors.length > 0) {
        throw new Error(`Client runtime errors encountered: ${pageErrors.join('; ')}`);
      }
      if (!uiMetrics.headerContainsBrand) {
        throw new Error('Assertion failed: Header does not contain Topology Studio branding.');
      }
      if (uiMetrics.nodeCount === 0) {
        console.warn('[Warning] No initial nodes rendered on canvas (may be empty canvas).');
      }
      console.log('[Headless Inspector] All assertions PASSED successfully!');
    }

    return { title, uiMetrics, screenshotPath: resolvedScreenshot, pageErrors };
  } finally {
    await browser.close();
  }
}

inspect()
  .then(() => {
    console.log('[Headless Inspector] Run completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Headless Inspector] Run failed:', err);
    process.exit(1);
  });
