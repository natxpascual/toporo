import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = process.env.TARGET_URL || 'http://localhost:3000';
const screenshotsDir = path.resolve('screenshots');

async function verify() {
  console.log('🚀 Running Webflow Dark-Mode Homepage & Studio Fixes E2E Verification...');

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

    // 1. Navigate to Homepage (/)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 20000 });
    await page.evaluate(() => window.__APP_ROUTER__?.navigate('/'));
    await new Promise((r) => setTimeout(r, 800));

    // Verify all images on homepage loaded with real dimensions
    const homepageCheck = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      const imgStatuses = imgs.map((img) => ({
        src: img.getAttribute('src'),
        loaded: img.complete && img.naturalWidth > 800,
        width: img.naturalWidth,
        height: img.naturalHeight,
      }));
      const heroTabs = document.querySelectorAll('[data-testid^="hero-tab-"]').length;
      const bg = window.getComputedStyle(document.querySelector('div.min-h-screen')).backgroundColor;
      return {
        totalImages: imgs.length,
        allImagesLoaded: imgs.length >= 5 && imgStatuses.every((i) => i.loaded),
        imgStatuses,
        heroTabs,
        bg,
      };
    });

    console.log('✅ Homepage Check:', JSON.stringify(homepageCheck, null, 2));
    if (!homepageCheck.allImagesLoaded || homepageCheck.heroTabs !== 5) {
      throw new Error(`Homepage verification failed: ${JSON.stringify(homepageCheck)}`);
    }

    // Capture Homepage Hero Screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'webflow_dark_homepage_hero.png'),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(screenshotsDir, 'webflow_dark_homepage_full.png'),
      fullPage: true,
    });
    console.log('📸 Captured webflow_dark_homepage_hero.png & webflow_dark_homepage_full.png');

    // 2. Navigate to Studio (/studio) and verify all 3 Studio fixes
    await page.evaluate(() => window.__APP_ROUTER__?.navigate('/studio'));
    await new Promise((r) => setTimeout(r, 1000));

    // Open Properties Panel first, then enable Code Editor
    await page.evaluate(async () => {
      const store = window.useTopologyStore.getState();
      await store.loadSample('hub-spoke');
      store.openInspector();
    });
    await new Promise((r) => setTimeout(r, 600));

    // Click Code Editor toggle in Header while Properties Panel is open
    await page.evaluate(() => {
      const codeBtn = Array.from(document.querySelectorAll('header button')).find(
        (b) => b.title?.includes('Code Drawer') || b.innerText?.includes('Code')
      );
      codeBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 700));

    const studioFixesCheck = await page.evaluate(() => {
      const header = document.querySelector('header');
      const toolbox = document.querySelector('[data-testid="studio-toolbox"]');
      const inspector = document.querySelector('.bottom-panel-container');
      const editor = document.querySelector('[data-testid="code-editor-window"]');

      const hRect = header?.getBoundingClientRect();
      const tRect = toolbox?.getBoundingClientRect();
      const iRect = inspector?.getBoundingClientRect();
      const eRect = editor?.getBoundingClientRect();

      return {
        toolboxDockedBelowMenu: Boolean(hRect && tRect && Math.abs(tRect.top - hRect.bottom) <= 2),
        inspectorStayedOpenWhenCodeEnabled: Boolean(inspector && editor),
        inspectorSpansToCodeEditorEdge: Boolean(iRect && eRect && Math.abs(iRect.right - eRect.left) <= 4),
        metrics: {
          headerBottom: hRect?.bottom,
          toolboxTop: tRect?.top,
          inspectorRight: iRect ? Math.round(iRect.right) : null,
          editorLeft: eRect ? Math.round(eRect.left) : null,
        },
      };
    });

    console.log('✅ Studio Fixes Check:', JSON.stringify(studioFixesCheck, null, 2));
    if (
      !studioFixesCheck.toolboxDockedBelowMenu ||
      !studioFixesCheck.inspectorStayedOpenWhenCodeEnabled ||
      !studioFixesCheck.inspectorSpansToCodeEditorEdge
    ) {
      throw new Error(`Studio fixes verification failed: ${JSON.stringify(studioFixesCheck)}`);
    }

    console.log('🎉 ALL WEBFLOW HOMEPAGE & STUDIO CHECKS PASSED 100%!');
  } finally {
    await browser.close();
  }
}

verify().catch((e) => {
  console.error('❌ Verification failed:', e);
  process.exit(1);
});

