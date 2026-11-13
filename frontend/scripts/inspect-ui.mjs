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
    '/usr/bin/chromium-browser',
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome/Chromium binary not found. Please set CHROME_PATH environment variable.');
}

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const prefix = `--${name}=`;
  const found = args.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
};

const baseUrl = getArg('url', 'http://localhost:3000');
const screenshotPath = getArg('screenshot', './screenshots/brandsite_inspection.png');
const shouldAssert = args.includes('--assert') || args.includes('--assert-ui');

async function inspect() {
  const chromePath = getChromePath();
  console.log(`[Headless Inspector] Using browser: ${chromePath}`);
  console.log(`[Headless Inspector] Target base URL: ${baseUrl}`);

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

    const pageErrors = [];
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    // ──────────────────────────────────────────────────────────
    // 1. Inspect BrandSite (SolarWinds NPM feels)
    // ──────────────────────────────────────────────────────────
    console.log('[Headless Inspector] Navigating to Brandsite: /');
    await page.goto(baseUrl, { waitUntil: 'networkidle0', timeout: 20000 });

    const brandMetrics = await page.evaluate(() => {
      const brandLogo = document.body.innerText.includes('Toporo');
      const headline = document.querySelector('h1')?.innerText || '';
      const topbarLoginBtn = Boolean(document.getElementById('topbar-login-btn'));
      const topbarGetStartedBtn = Boolean(document.getElementById('topbar-get-started-btn'));
      const heroGetStartedBtn = Boolean(document.getElementById('hero-get-started-btn'));
      const heroStartDemoBtn = Boolean(document.getElementById('hero-start-demo-btn'));
      const screenshotsSection = Boolean(document.getElementById('screenshots'));

      return {
        brandLogo,
        headline,
        topbarLoginBtn,
        topbarGetStartedBtn,
        heroGetStartedBtn,
        heroStartDemoBtn,
        screenshotsSection,
      };
    });

    console.log('[Headless Inspector] Brandsite Metrics:', JSON.stringify(brandMetrics, null, 2));

    const resolvedScreenshot = path.resolve(screenshotPath);
    const dir = path.dirname(resolvedScreenshot);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: resolvedScreenshot, fullPage: false });
    console.log(`[Headless Inspector] Brandsite screenshot saved to: ${resolvedScreenshot}`);

    // ──────────────────────────────────────────────────────────
    // 2. Click "Get Started" and Inspect Signup Page (Atlassian ID feels)
    // ──────────────────────────────────────────────────────────
    console.log('[Headless Inspector] Testing transition: Click "Get Started" -> Signup');
    await page.click('#topbar-get-started-btn');
    await new Promise((r) => setTimeout(r, 600));

    const signupMetrics = await page.evaluate(() => {
      const heading = document.querySelector('h1')?.innerText || '';
      const emailInput = Boolean(document.getElementById('signup-email'));
      const passwordInput = Boolean(document.getElementById('signup-password'));
      const googleSso = Boolean(document.getElementById('signup-google-sso-btn'));
      const githubSso = Boolean(document.getElementById('signup-github-sso-btn'));
      const otherSsoCount = document.querySelectorAll('button[id*="apple"], button[id*="slack"], button[id*="microsoft"]').length;

      return {
        heading,
        emailInput,
        passwordInput,
        googleSso,
        githubSso,
        isOnlyGoogleAndGithub: otherSsoCount === 0,
      };
    });
    console.log('[Headless Inspector] Signup Page Metrics:', JSON.stringify(signupMetrics, null, 2));
    await page.screenshot({ path: path.resolve('./screenshots/signup_page_inspection.png') });

    // ──────────────────────────────────────────────────────────
    // 3. Inspect Login Page
    // ──────────────────────────────────────────────────────────
    console.log('[Headless Inspector] Testing transition: Navigate to /login');
    await page.evaluate(() => {
      window.__APP_ROUTER__?.navigate('/login');
    });
    await new Promise((r) => setTimeout(r, 600));

    const loginMetrics = await page.evaluate(() => {
      const heading = document.querySelector('h1')?.innerText || '';
      const usernameInput = Boolean(document.getElementById('login-username'));
      const passwordInput = Boolean(document.getElementById('login-password'));
      const googleSso = Boolean(document.getElementById('login-google-sso-btn'));
      const githubSso = Boolean(document.getElementById('login-github-sso-btn'));
      const otherSsoCount = document.querySelectorAll('button[id*="apple"], button[id*="slack"], button[id*="microsoft"]').length;

      return {
        heading,
        usernameInput,
        passwordInput,
        googleSso,
        githubSso,
        isOnlyGoogleAndGithub: otherSsoCount === 0,
      };
    });
    console.log('[Headless Inspector] Login Page Metrics:', JSON.stringify(loginMetrics, null, 2));
    await page.screenshot({ path: path.resolve('./screenshots/login_page_inspection.png') });

    // ──────────────────────────────────────────────────────────
    // 4. Navigate to Topology Studio (/studio)
    // ──────────────────────────────────────────────────────────
    console.log('[Headless Inspector] Testing transition: Navigate to /studio');
    await page.evaluate(() => {
      window.__APP_ROUTER__?.navigate('/studio');
    });
    await new Promise((r) => setTimeout(r, 800));

    const studioMetrics = await page.evaluate(() => {
      const headerBtn = Boolean(document.querySelector('[data-testid="brand-home-btn"]'));
      const hasCatalog = Boolean(document.querySelector('input[placeholder*="components"]'));
      const hasStatusBar = Boolean(document.querySelector('.status-dot'));
      const hasReactFlow = Boolean(document.querySelector('.react-flow'));

      return {
        headerContainsBrand: headerBtn,
        hasCatalog,
        hasStatusBar,
        hasReactFlow,
      };
    });
    console.log('[Headless Inspector] Studio Metrics:', JSON.stringify(studioMetrics, null, 2));
    await page.screenshot({ path: path.resolve('./screenshots/topology_ui_inspection.png') });

    // ──────────────────────────────────────────────────────────
    // Assertions
    // ──────────────────────────────────────────────────────────
    if (shouldAssert) {
      if (pageErrors.length > 0) {
        throw new Error(`Client runtime errors encountered: ${pageErrors.join('; ')}`);
      }
      if (!brandMetrics.topbarGetStartedBtn || !brandMetrics.topbarLoginBtn) {
        throw new Error('Brandsite assertion failed: Missing Topbar Login or Get Started buttons.');
      }
      if (!brandMetrics.heroGetStartedBtn || brandMetrics.heroStartDemoBtn) {
        throw new Error('Brandsite assertion failed: Hero must have "Start building" and must NOT have "Open Sandbox".');
      }
      if (!signupMetrics.googleSso || !signupMetrics.githubSso || !signupMetrics.isOnlyGoogleAndGithub) {
        throw new Error('Signup assertion failed: SSO must be limited to Google and GitHub only.');
      }
      if (!loginMetrics.googleSso || !loginMetrics.githubSso || !loginMetrics.isOnlyGoogleAndGithub) {
        throw new Error('Login assertion failed: SSO must be limited to Google and GitHub only.');
      }
      if (!studioMetrics.headerContainsBrand || !studioMetrics.hasReactFlow) {
        throw new Error('Studio assertion failed: Missing Studio header branding or React Flow canvas.');
      }

      console.log('✅ [Headless Inspector] ALL ASSERTIONS PASSED FOR BRANDSITE, SIGNUP, LOGIN, AND STUDIO!');
    }

    return { brandMetrics, signupMetrics, loginMetrics, studioMetrics };
  } finally {
    await browser.close();
  }
}

inspect()
  .then(() => {
    console.log('[Headless Inspector] Complete test run passed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[Headless Inspector] Failed:', err);
    process.exit(1);
  });
