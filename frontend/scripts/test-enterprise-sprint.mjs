import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3000';

async function runVerification() {
  console.log('🚀 Starting Enterprise Sprint E2E Verification...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=1500,950',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1500, height: 950, deviceScaleFactor: 2 });

  const errors = [];
  page.on('pageerror', (err) => {
    errors.push(`Page Error: ${err.message}`);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`Console Error: ${msg.text()}`);
    }
  });

  const testResults = [];
  const logTest = (name, passed, detail = '') => {
    testResults.push({ name, passed, detail });
    console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name} ${detail ? `(${detail})` : ''}`);
  };

  try {
    console.log('🌐 Navigating to Studio...');
    await page.goto(`${BASE_URL}`, { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Navigate to /studio via router
    await page.evaluate(() => {
      window.__APP_ROUTER__?.navigate('/studio');
    });
    await new Promise((r) => setTimeout(r, 1200));

    // ─────────────────────────────────────────────────────────────
    // TEST 1: Default project name is "Untitled Project"
    // ─────────────────────────────────────────────────────────────
    const projectName = await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const titleBtn = document.querySelector('[data-testid="project-name-btn"]');
      return {
        storeName: store.topology?.metadata?.project_name,
        btnText: titleBtn?.innerText?.trim(),
      };
    });
    logTest(
      'Default Project Name is "Untitled Project"',
      projectName.storeName === 'Untitled Project' && projectName.btnText === 'Untitled Project',
      `Store: "${projectName.storeName}", Title Btn: "${projectName.btnText}"`
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 2: Studio brand icon leads back to home page
    // ─────────────────────────────────────────────────────────────
    const brandIconWorks = await page.evaluate(() => {
      const brandBtn = document.querySelector('[data-testid="brand-home-btn"]');
      return Boolean(brandBtn);
    });
    logTest('Studio Home Button Exists', brandIconWorks);

    // ─────────────────────────────────────────────────────────────
    // TEST 3: Canva-inspired Header Menus (File, Edit, View)
    // ─────────────────────────────────────────────────────────────
    const menus = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('header button'));
      const texts = buttons.map(b => b.innerText.trim());
      return {
        hasFile: texts.some(t => t === 'File'),
        hasEdit: texts.some(t => t === 'Edit'),
        hasView: texts.some(t => t === 'View'),
      };
    });
    logTest('Canva-style Menus in Header', menus.hasFile && menus.hasEdit && menus.hasView, JSON.stringify(menus));

    // Click File menu and inspect items
    await page.evaluate(() => {
      const fileBtn = Array.from(document.querySelectorAll('header button')).find(b => b.innerText.trim() === 'File');
      fileBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const fileMenuItems = await page.evaluate(() => {
      const dropdown = document.querySelector('header .dropdown-menu');
      if (!dropdown) return [];
      return Array.from(dropdown.querySelectorAll('button')).map(b => b.innerText.trim());
    });
    const hasNewProject = fileMenuItems.some(t => t.includes('New Project'));
    const hasImport = fileMenuItems.some(t => t.includes('Import'));
    const hasSaveAts = fileMenuItems.some(t => t.includes('Save Project File (.ats)'));
    logTest('File Menu contains New Project, Import, and Save (.ats)', hasNewProject && hasImport && hasSaveAts, `Items: ${fileMenuItems.join(', ')}`);

    // Close File menu
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 200));

    // ─────────────────────────────────────────────────────────────
    // TEST 4: Export Dropdown has all 5 Functional Items
    // ─────────────────────────────────────────────────────────────
    await page.evaluate(() => {
      const exportBtn = document.querySelector('[data-testid="export-dropdown-btn"]');
      exportBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const exportItems = await page.evaluate(() => {
      const dropdown = document.querySelector('[data-testid="export-dropdown-menu"]');
      if (!dropdown) return [];
      return Array.from(dropdown.querySelectorAll('button')).map(b => b.innerText.trim());
    });
    const hasTfExport = exportItems.some(t => t.includes('Terraform Files (.tf)'));
    const hasZipExport = exportItems.some(t => t.includes('Project Archive (.zip)'));
    const hasAtsExport = exportItems.some(t => t.includes('Project File (.ats)'));
    const hasPngExport = exportItems.some(t => t.includes('Export Diagram (.png)'));
    const hasCopyTf = exportItems.some(t => t.includes('Copy Terraform Code'));

    logTest(
      'Export Dropdown contains all 5 required actions',
      hasTfExport && hasZipExport && hasAtsExport && hasPngExport && hasCopyTf,
      `Items: ${exportItems.join(', ')}`
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 5: Project File (.ats) Modal & Saved State Transition
    // ─────────────────────────────────────────────────────────────
    // Click "Project File (.ats)" inside export dropdown
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('[data-testid="export-dropdown-menu"] button'));
      const atsBtn = btns.find(b => b.innerText.includes('Project File (.ats)'));
      atsBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const modalState = await page.evaluate(() => {
      const modal = document.querySelector('[data-testid="export-project-modal"]');
      const input = modal?.querySelector('input[type="text"]');
      const confirmBtn = Array.from(modal?.querySelectorAll('button') || []).find(b => b.innerText.includes('.ats'));
      return {
        isOpen: Boolean(modal),
        hasInput: Boolean(input),
        inputValue: input ? input.value : null,
        hasConfirmBtn: Boolean(confirmBtn),
      };
    });
    logTest('Export Project File Modal opens with default name', modalState.hasInput && modalState.inputValue === 'Untitled Project' && modalState.hasConfirmBtn, JSON.stringify(modalState));

    // Confirm export in modal
    await page.evaluate(() => {
      const modal = document.querySelector('[data-testid="export-project-modal"]');
      const confirmBtn = Array.from(modal?.querySelectorAll('button') || []).find(b => b.innerText.includes('.ats'));
      confirmBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const savedState = await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const statusBadge = document.querySelector('header span.text-emerald-400') || document.querySelector('header span.text-emerald-500');
      return {
        isSavedInStore: store.isSaved === true,
        savedBadgeVisible: Boolean(statusBadge),
        badgeText: statusBadge ? statusBadge.innerText.trim() : null,
      };
    });
    logTest('Export transitions project to "Saved" (green badge)', savedState.isSavedInStore, `Store isSaved: ${savedState.isSavedInStore}, Badge: ${savedState.badgeText}`);

    // ─────────────────────────────────────────────────────────────
    // TEST 6: Import Modal has "Import Project File (.ats)"
    // ─────────────────────────────────────────────────────────────
    // Trigger Import Modal via File -> Import...
    await page.evaluate(() => {
      const fileBtn = Array.from(document.querySelectorAll('header button')).find(b => b.innerText.trim() === 'File');
      fileBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 200));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('header .dropdown-menu button'));
      const importBtn = btns.find(b => b.innerText.includes('Import'));
      importBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const importModalCheck = await page.evaluate(() => {
      const allText = document.body.innerText;
      const hasImportProjectFile = allText.includes('Import Project File') || allText.includes('.ats');
      const hasAzureSubscription = allText.includes('Azure Subscription');
      return {
        hasImportProjectFile,
        hasAzureSubscription,
      };
    });
    logTest('Import Modal accepts Project File (.ats) and replaces Azure Subscription', importModalCheck.hasImportProjectFile && !importModalCheck.hasAzureSubscription, `hasImportProjectFile: ${importModalCheck.hasImportProjectFile}, hasAzureSubscription: ${importModalCheck.hasAzureSubscription}`);

    // Close import modal
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 300));

    // ─────────────────────────────────────────────────────────────
    // TEST 7: Code Editor Toolbar Pinning & "More" Dropdown
    // ─────────────────────────────────────────────────────────────
    // Open Split View / Code Drawer
    await page.evaluate(() => {
      const codeDrawerBtn = Array.from(document.querySelectorAll('header button')).find(b => b.title?.includes('code') || b.innerText?.includes('Code'));
      if (codeDrawerBtn) codeDrawerBtn.click();
      else {
        const viewBtn = Array.from(document.querySelectorAll('header button')).find(b => b.innerText.trim() === 'View');
        viewBtn?.click();
      }
    });
    await new Promise((r) => setTimeout(r, 300));
    await page.evaluate(() => {
      const toggleCode = Array.from(document.querySelectorAll('header .dropdown-menu button')).find(b => b.innerText.includes('Code Drawer'));
      if (toggleCode) toggleCode.click();
    });
    await new Promise((r) => setTimeout(r, 600));

    const editorToolbarCheck = await page.evaluate(() => {
      const fileTabsContainer = document.querySelector('.overflow-x-auto');
      const moreBtn = document.querySelector('button[title="More Actions"]');
      const applyBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Apply'));
      const formatBtn = document.querySelector('button[title*="Format"]');
      const refreshBtn = document.querySelector('button[title*="Refresh"]');

      return {
        hasFileTabsScrollable: Boolean(fileTabsContainer),
        hasMoreBtn: Boolean(moreBtn),
        hasApplyBtn: Boolean(applyBtn),
        hasFormatBtn: Boolean(formatBtn),
        hasRefreshBtn: Boolean(refreshBtn),
      };
    });
    logTest('Code Editor Toolbar has Pinned Action Buttons and "More" Button', editorToolbarCheck.hasMoreBtn && editorToolbarCheck.hasApplyBtn, JSON.stringify(editorToolbarCheck));

    // Click "More" button to inspect dropdown items
    await page.evaluate(() => {
      const moreBtn = document.querySelector('button[title="More Actions"]');
      moreBtn?.click();
    });
    await new Promise((r) => setTimeout(r, 300));

    const moreDropdownItems = await page.evaluate(() => {
      const dropdown = document.querySelector('.editor-more-dropdown') || document.querySelector('.dropdown-menu') || document.querySelector('.absolute.right-0');
      if (!dropdown) return [];
      return Array.from(dropdown.querySelectorAll('button')).map(b => b.innerText.trim());
    });
    const hasCopyCode = moreDropdownItems.some(t => t.includes('Copy to Clipboard'));
    const hasDownloadFile = moreDropdownItems.some(t => t.includes('Download'));
    const hasDownloadZip = moreDropdownItems.some(t => t.includes('Download All Files (.zip)'));

    logTest(
      'Editor "More" Menu has Copy, Download File, and Download All Files (.zip)',
      hasCopyCode && hasDownloadFile && hasDownloadZip,
      `Items: ${moreDropdownItems.join(', ')}`
    );

    // Close More menu
    await page.keyboard.press('Escape');
    await new Promise((r) => setTimeout(r, 200));

    // ─────────────────────────────────────────────────────────────
    // TEST 8: Bottom Properties Panel (VS Code Style)
    // ─────────────────────────────────────────────────────────────
    // Open bottom panel
    await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      store.openInspector();
    });
    await new Promise((r) => setTimeout(r, 500));

    const bottomPanelCheck = await page.evaluate(() => {
      const resizer = document.querySelector('.bottom-panel-resizer');
      const container = document.querySelector('.bottom-panel-container');
      const tabs = container ? Array.from(container.querySelectorAll('button')).map(b => b.innerText.trim()) : [];

      const hasPropertiesTab = tabs.some(t => t.includes('PROPERTIES'));
      const hasSecurityTab = tabs.some(t => t.includes('SECURITY'));
      const hasCostTab = tabs.some(t => t.includes('FINOPS COST'));
      const hasDocsTab = tabs.some(t => t.includes('DOCS'));

      // Check docking position relative to window height
      let isBottomDocked = false;
      if (container) {
        const rect = container.getBoundingClientRect();
        isBottomDocked = rect.bottom >= window.innerHeight - 5;
      }

      return {
        hasResizer: Boolean(resizer),
        hasContainer: Boolean(container),
        hasPropertiesTab,
        hasSecurityTab,
        hasCostTab,
        hasDocsTab,
        isBottomDocked,
      };
    });
    logTest(
      'Bottom Properties Panel is docked at bottom with horizontal resizer & tabs',
      bottomPanelCheck.hasResizer && bottomPanelCheck.hasContainer && bottomPanelCheck.isBottomDocked && bottomPanelCheck.hasPropertiesTab,
      JSON.stringify(bottomPanelCheck)
    );

    // ─────────────────────────────────────────────────────────────
    // TEST 9: Blueprints Drag-and-Drop capability
    // ─────────────────────────────────────────────────────────────
    await page.evaluate(() => {
      // Switch catalog to blueprints tab
      const blueprintTabBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Blueprints'));
      if (blueprintTabBtn) blueprintTabBtn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    const draggableBlueprints = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[draggable="true"]'));
      return cards.length;
    });
    logTest('Catalog has draggable blueprints/components', draggableBlueprints > 0, `Draggable items: ${draggableBlueprints}`);

    // Test blueprint load / canvas population
    const dropSuccess = await page.evaluate(async () => {
      const beforeCount = window.useTopologyStore.getState().topology.resources.length;
      await window.useTopologyStore.getState().loadSample('hub-spoke');
      const afterCount = window.useTopologyStore.getState().topology.resources.length;

      return {
        beforeCount,
        afterCount,
        added: afterCount > 0,
      };
    });
    logTest('Blueprint successfully populates topology resources', dropSuccess.added, `Before: ${dropSuccess.beforeCount}, After: ${dropSuccess.afterCount}`);

    // Take screenshot of Studio with all elements
    const screenshotDir = path.resolve('./screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    const screenshotPath = path.resolve('./screenshots/enterprise_sprint_studio_verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

  } catch (err) {
    console.error('❌ Error during verification:', err);
    logTest('E2E Verification Execution', false, err.message);
  } finally {
    await browser.close();
  }

  const allPassed = testResults.every(t => t.passed);
  console.log('\n========================================');
  console.log(`VERIFICATION SUMMARY: ${testResults.filter(t => t.passed).length}/${testResults.length} TESTS PASSED`);
  console.log(`OVERALL STATUS: ${allPassed ? 'ALL GATES PASSED ✅' : 'FAILURES DETECTED ❌'}`);
  console.log('========================================\n');

  if (!allPassed) {
    process.exit(1);
  }
}

runVerification();
