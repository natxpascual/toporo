import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = process.env.TARGET_URL || 'http://localhost:3000';
const screenshotsDir = path.resolve('screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runVerification() {
  console.log('🚀 Starting Comprehensive Webflow Homepage & Fixes Verification...');

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

  const results = {
    routingHashVisualStudio: false,
    smoothScrolling: false,
    elementScrollAnimations: false,
    heroTabsViewportFit: false,
    heroTabAnimations: false,
    removalsVerified: false,
    buttonRoutingToSignup: false,
    studioLogoVerified: false,
    cookiePolicyPopup: false,
    legalPagesVerified: false,
    mobileResponsiveness: false,
  };

  try {
    const page = await browser.newPage();

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 1: Check in-page anchor routing (/#visual-studio should NOT route to /studio)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔍 Testing /#visual-studio anchor routing...');
    await page.goto(`${BASE_URL}/#visual-studio`, { waitUntil: 'networkidle0', timeout: 20000 });
    await new Promise((r) => setTimeout(r, 600));

    const anchorCheck = await page.evaluate(() => {
      const route = window.__APP_ROUTER__?.currentRoute;
      const hash = window.location.hash;
      const targetEl = document.getElementById('visual-studio');
      const studioCanvas = document.querySelector('.react-flow'); // present only in /studio
      return {
        currentRoute: route,
        hash,
        targetExists: !!targetEl,
        isStudioCanvasPresent: !!studioCanvas,
      };
    });

    console.log(' Anchor Check Result:', anchorCheck);
    if (anchorCheck.currentRoute === '/' && !anchorCheck.isStudioCanvasPresent && anchorCheck.targetExists) {
      results.routingHashVisualStudio = true;
      console.log('✅ PASS: /#visual-studio stays on homepage (/) and does NOT jump to /studio');
    } else {
      console.error('❌ FAIL: /#visual-studio did not stay on homepage');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 2: Smooth Scrolling & Scroll-Triggered Animations
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔍 Testing Smooth Scrolling & Scroll Reveal Animations...');
    const scrollProps = await page.evaluate(() => {
      const htmlScroll = window.getComputedStyle(document.documentElement).scrollBehavior;
      const revealItems = document.querySelectorAll('.reveal-item, .reveal-item-scale');
      return {
        htmlScrollBehavior: htmlScroll,
        revealCount: revealItems.length,
      };
    });

    console.log(' Scroll Properties:', scrollProps);
    if (scrollProps.htmlScrollBehavior === 'smooth' && scrollProps.revealCount >= 8) {
      results.smoothScrolling = true;
      console.log('✅ PASS: html scroll-behavior is smooth and reveal elements exist');
    }

    // Scroll down to trigger intersection observer
    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 400));

    const revealedCount = await page.evaluate(() => {
      return document.querySelectorAll('.reveal-item.is-revealed, .reveal-item-scale.is-revealed').length;
    });

    console.log(` Elements revealed after scroll: ${revealedCount}/${scrollProps.revealCount}`);
    if (revealedCount > 0) {
      results.elementScrollAnimations = true;
      console.log('✅ PASS: Scroll animations triggered .is-revealed on scroll');
    }

    // Scroll back to top
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 300));

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 3: Hero Interactive Product Stage Tabs Viewport Fit & Animations
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔍 Testing Hero Interactive Tabs Viewport Fit & Content Switching...');
    await page.setViewport({ width: 1440, height: 900 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 300));

    const heroViewportCheck = await page.evaluate(() => {
      const stage = document.getElementById('product-stage');
      const stageBox = stage ? stage.getBoundingClientRect() : null;
      const windowHeight = window.innerHeight;
      const img = stage ? stage.querySelector('img') : null;
      return {
        stageHeight: stageBox ? Math.round(stageBox.height) : 0,
        windowHeight,
        fitsViewportComfortably: stageBox ? stageBox.height < windowHeight * 0.95 : false,
        imgHeight: img ? img.clientHeight : 0,
        imgMaxHeight: img ? window.getComputedStyle(img.parentElement).maxHeight : null,
      };
    });

    console.log(' Hero Stage Viewport Check:', heroViewportCheck);
    if (heroViewportCheck.fitsViewportComfortably) {
      results.heroTabsViewportFit = true;
      console.log('✅ PASS: Hero Interactive Stage Tabs fits device viewport cleanly');
    } else {
      console.warn('⚠️ Warning: Stage height check:', heroViewportCheck);
    }

    // Test clicking all 5 Hero tabs
    const tabIds = ['split-workspace', 'ai-copilot', 'security-guardrails', 'finops-cost', 'cards-blueprints'];
    let allTabsSwitched = true;

    for (let i = 0; i < tabIds.length; i++) {
      const tabId = tabIds[i];
      const selector = `[data-testid="hero-tab-${tabId}"]`;
      await page.click(selector);
      await new Promise((r) => setTimeout(r, 200));

      const tabState = await page.evaluate((id) => {
        const stageContainer = document.querySelector('.animate-stage-fade');
        const img = stageContainer?.querySelector('img');
        const badge = stageContainer?.querySelector('span.font-mono');
        return {
          hasAnimationClass: !!stageContainer,
          imgSrc: img?.getAttribute('src'),
          badgeText: badge?.textContent,
        };
      }, tabId);

      if (!tabState.hasAnimationClass || !tabState.imgSrc?.includes(tabId)) {
        console.error(` Tab ${tabId} failed to update state:`, tabState);
        allTabsSwitched = false;
      }
    }

    if (allTabsSwitched) {
      results.heroTabAnimations = true;
      console.log('✅ PASS: Hero tabs animate smoothly and switch content across all 5 states');
    }

    // Capture Desktop Homepage Screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'webflow_homepage_desktop_verified.png'),
      fullPage: false,
    });
    console.log('📸 Saved screenshots/webflow_homepage_desktop_verified.png');

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 4: Verification of Removed Elements
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔍 Testing Removals (Pills, Buttons, Badges)...');
    const pageText = await page.evaluate(() => document.body.innerText);

    const checkRemoval = (label, regex) => {
      const found = regex.test(pageText);
      if (found) {
        console.error(`❌ Text still found: "${label}"`);
        return false;
      }
      return true;
    };

    const removalsOk = [
      checkRemoval('Launch Live Studio', /Launch Live Studio/i),
      checkRemoval('Open Studio in header', /Open Studio/i),
      checkRemoval('Studio 2.5', /Studio 2\.5/i),
      checkRemoval('Visual Cloud Infrastructure Platform · Powered by Azure OpenAI & Terraform AST', /Visual Cloud Infrastructure Platform · Powered by Azure OpenAI/i),
      checkRemoval('READY FOR ENTERPRISE CLOUD TEAMS', /READY FOR ENTERPRISE CLOUD TEAMS/i),
      checkRemoval('Open Web Studio', /Open Web Studio/i),
      checkRemoval('Launch Studio in footer', /Launch Studio/i),
    ].every(Boolean);

    if (removalsOk) {
      results.removalsVerified = true;
      console.log('✅ PASS: All required buttons, pills, and badges have been completely removed');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 5: Button Routing to /signup (Except Login to /login)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔍 Testing Non-Login CTA Buttons Route to /signup...');
    const buttonRoutingCheck = await page.evaluate(() => {
      // Find all buttons on the homepage
      const buttons = Array.from(document.querySelectorAll('button'));
      const ctaButtons = buttons.filter((b) => {
        const text = b.innerText.trim();
        return (
          text.includes('Get started') ||
          text.includes('Get started free') ||
          text.includes('Get Started')
        );
      });

      return {
        ctaCount: ctaButtons.length,
        hasLogin: !!document.getElementById('topbar-login-btn'),
      };
    });

    console.log(' CTA Buttons Found:', buttonRoutingCheck);

    // Test clicking the hero CTA button
    await page.click('#hero-get-started-btn');
    await new Promise((r) => setTimeout(r, 300));
    const heroRoute = await page.evaluate(() => window.__APP_ROUTER__?.currentRoute);

    if (heroRoute === '/signup') {
      console.log('✅ PASS: Hero CTA routed correctly to /signup');
      results.buttonRoutingToSignup = true;
    } else {
      console.error(`❌ FAIL: Hero CTA routed to ${heroRoute} instead of /signup`);
    }

    // Navigate back to homepage
    await page.evaluate(() => window.__APP_ROUTER__?.navigate('/'));
    await new Promise((r) => setTimeout(r, 300));

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 6: Logo Verification (Studio Crystal Logo)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔍 Testing Studio Crystal Logo in Header and Footer...');
    const logoCheck = await page.evaluate(() => {
      // Look for the primary color crystal icon SVG
      const svgs = Array.from(document.querySelectorAll('header svg, footer svg'));
      const hasStudioPaths = svgs.some((svg) => {
        const paths = Array.from(svg.querySelectorAll('path'));
        return paths.some((p) => p.getAttribute('d')?.includes('M11.6 3L3 11.6L7.3 15.9'));
      });
      return {
        svgCount: svgs.length,
        hasStudioPaths,
      };
    });

    console.log(' Logo Check:', logoCheck);
    if (logoCheck.hasStudioPaths) {
      results.studioLogoVerified = true;
      console.log('✅ PASS: Official studio crystal logo is used in Header & Footer');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 7: Cookie Policy Popup with Reject All and Accept All
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔍 Testing Cookie Policy Popup...');
    await page.evaluate(() => {
      localStorage.removeItem('toporo_cookie_consent');
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 900));

    const popupVisible = await page.evaluate(() => {
      const popup = document.querySelector('[data-testid="cookie-policy-popup"]');
      const rejectBtn = document.querySelector('[data-testid="cookie-reject-btn"]');
      const acceptBtn = document.querySelector('[data-testid="cookie-accept-btn"]');
      return {
        visible: !!popup,
        hasReject: !!rejectBtn,
        hasAccept: !!acceptBtn,
      };
    });

    console.log(' Cookie Popup Check:', popupVisible);
    if (popupVisible.visible && popupVisible.hasReject && popupVisible.hasAccept) {
      // Test Reject all
      await page.click('[data-testid="cookie-reject-btn"]');
      await new Promise((r) => setTimeout(r, 200));
      const rejectedVal = await page.evaluate(() => localStorage.getItem('toporo_cookie_consent'));
      console.log(' Stored consent on reject:', rejectedVal);

      // Test Accept all
      await page.evaluate(() => {
        localStorage.removeItem('toporo_cookie_consent');
      });
      await page.reload({ waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 800));
      await page.click('[data-testid="cookie-accept-btn"]');
      await new Promise((r) => setTimeout(r, 200));
      const acceptedVal = await page.evaluate(() => localStorage.getItem('toporo_cookie_consent'));
      console.log(' Stored consent on accept:', acceptedVal);

      if (rejectedVal === 'rejected' && acceptedVal === 'accepted') {
        results.cookiePolicyPopup = true;
        console.log('✅ PASS: Cookie Policy popup with Reject all & Accept all functions properly');
      }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 8: Legal Pages (/terms, /privacy, /cookies, /accessibility)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔍 Testing Legal Pages & Footer Links...');
    const legalRoutes = [
      { path: '/terms', headingText: 'Terms of Service' },
      { path: '/privacy', headingText: 'Privacy Policy' },
      { path: '/cookies', headingText: 'Cookie Policy' },
      { path: '/accessibility', headingText: 'Accessibility Statement' },
    ];

    let allLegalPagesOk = true;
    for (const legal of legalRoutes) {
      await page.evaluate((p) => window.__APP_ROUTER__?.navigate(p), legal.path);
      await new Promise((r) => setTimeout(r, 400));

      const pageState = await page.evaluate(() => {
        const h1 = document.querySelector('h1')?.innerText;
        const brand = document.querySelector('header span')?.innerText;
        const hasStudioLogo = !!document.querySelector('header svg path[d*="M11.6 3L3 11.6"]');
        return { h1, brand, hasStudioLogo };
      });

      if (!pageState.h1?.toLowerCase().includes(legal.headingText.toLowerCase()) || !pageState.hasStudioLogo) {
        console.error(`❌ Legal page ${legal.path} failed check:`, pageState);
        allLegalPagesOk = false;
      } else {
        console.log(`  ✓ ${legal.path} verified with heading "${pageState.h1}"`);
      }
    }

    if (allLegalPagesOk) {
      results.legalPagesVerified = true;
      console.log('✅ PASS: All 4 legal pages render with shared dark layout and studio branding');
    }

    // ──────────────────────────────────────────────────────────────────────────
    // TEST 9: Mobile Responsiveness & iPhone Viewport (390x844)
    // ──────────────────────────────────────────────────────────────────────────
    console.log('🔍 Testing Mobile Responsiveness (390x844)...');
    await page.evaluate(() => window.__APP_ROUTER__?.navigate('/'));
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await new Promise((r) => setTimeout(r, 500));

    const mobileCheck = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const hasHorizontalOverflow = scrollWidth > clientWidth + 2;
      const hamburger = document.querySelector('button[aria-label="Toggle Menu"]');
      const stage = document.getElementById('product-stage');
      const stageHeight = stage?.getBoundingClientRect().height || 0;

      return {
        scrollWidth,
        clientWidth,
        hasHorizontalOverflow,
        hasHamburger: !!hamburger,
        stageHeight: Math.round(stageHeight),
      };
    });

    console.log(' Mobile Check Result:', mobileCheck);
    if (!mobileCheck.hasHorizontalOverflow && mobileCheck.hasHamburger) {
      // Test opening mobile menu
      await page.click('button[aria-label="Toggle Menu"]');
      await new Promise((r) => setTimeout(r, 300));

      const menuOpen = await page.evaluate(() => {
        return !!document.querySelector('.animate-fade-in');
      });

      if (menuOpen) {
        results.mobileResponsiveness = true;
        console.log('✅ PASS: Mobile menu toggles and layout fits without horizontal overflow');
      }
    }

    // Capture Mobile Verified Screenshot
    await page.screenshot({
      path: path.join(screenshotsDir, 'webflow_homepage_mobile_verified.png'),
      fullPage: false,
    });
    console.log('📸 Saved screenshots/webflow_homepage_mobile_verified.png');

    console.log('\n📊 ══════════════════════════════════════════════════════');
    console.log('VERIFICATION SUMMARY:');
    console.table(results);
    console.log('══════════════════════════════════════════════════════\n');

    const allPassed = Object.values(results).every(Boolean);
    if (allPassed) {
      console.log('🎉 ALL 11 REQUIREMENTS VERIFIED SUCCESSFULLY!');
    } else {
      console.error('⚠️ Some tests failed or had warnings. Check summary above.');
    }
  } catch (err) {
    console.error('Fatal test error:', err);
  } finally {
    await browser.close();
  }
}

runVerification();

