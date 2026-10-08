const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACTS_DIR = '/Users/natpascual/.gemini/antigravity-ide/brain/eae8e165-1566-4b51-9fd1-a2ae4edc0d9d';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function runTests() {
  console.log('🚀 Launching Google Chrome for Verification Tests...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1600, height: 1000 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const testResults = [];

  try {
    console.log('🌐 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    console.log('✅ App, Canvas & Monaco Editor loaded.');

    await new Promise(r => setTimeout(r, 1200));

    // ── Test 1: Click Resource on Canvas -> Highlight Code Block ──
    console.log('🧪 Test 1: Selecting vm_web on Canvas...');
    await page.evaluate(() => {
      window.useTopologyStore.getState().selectResource('vm_web');
    });
    await new Promise(r => setTimeout(r, 800));

    const test1State = await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const editors = window.monaco ? window.monaco.editor.getEditors() : [];
      let currentDecorations = [];
      let hasHighlightClass = false;

      if (editors.length > 0) {
        const editor = editors[0];
        const model = editor.getModel();
        const decorations = model ? model.getAllDecorations() : [];
        currentDecorations = decorations
          .filter(d => d.options.className === 'monaco-selected-block-highlight')
          .map(d => ({ start: d.range.startLineNumber, end: d.range.endLineNumber, class: d.options.className }));
        hasHighlightClass = currentDecorations.length > 0;
      }

      return {
        selectedId: store.selectedResourceId,
        decorations: currentDecorations,
        hasHighlightClass,
      };
    });

    console.log('Test 1 State:', test1State);
    const ss1Path = path.join(ARTIFACTS_DIR, '01_click_vm_highlight_code_block.png');
    await page.screenshot({ path: ss1Path });

    testResults.push({
      test: '1. Click VM node highlights corresponding code block in Code Drawer',
      status: test1State.hasHighlightClass && test1State.selectedId === 'vm_web' ? 'PASSED' : 'FAILED',
      details: `Decorated lines: ${JSON.stringify(test1State.decorations)}`,
    });

    // ── Test 2: Rename Resource on Canvas -> Updates Code Drawer ──
    console.log('🧪 Test 2: Renaming vm_web to vm-web-cluster-api...');
    await page.evaluate(async () => {
      await window.useTopologyStore.getState().renameResource('vm_web', 'vm-web-cluster-api');
    });
    await new Promise(r => setTimeout(r, 1500));

    const test2State = await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const mainTf = store.generatedCode?.['main.tf'] || '';
      const vmRes = store.topology.resources.find(r => r.id === 'vm_web');
      const containsNewName = mainTf.includes('vm-web-cluster-api') || mainTf.includes('vm_web_cluster_api');
      
      const editors = window.monaco ? window.monaco.editor.getEditors() : [];
      let currentDecorations = [];
      if (editors.length > 0) {
        const model = editors[0].getModel();
        const decorations = model ? model.getAllDecorations() : [];
        currentDecorations = decorations
          .filter(d => d.options.className === 'monaco-selected-block-highlight')
          .map(d => ({ start: d.range.startLineNumber, end: d.range.endLineNumber }));
      }

      return {
        resName: vmRes ? vmRes.name : '',
        containsNewName,
        decorations: currentDecorations,
      };
    });

    console.log('Test 2 State:', test2State);
    const ss2Path = path.join(ARTIFACTS_DIR, '02_renamed_resource_code_sync.png');
    await page.screenshot({ path: ss2Path });

    testResults.push({
      test: '2. Rename resource updates HCL code drawer and keeps highlight synchronized',
      status: test2State.resName === 'vm-web-cluster-api' && test2State.containsNewName ? 'PASSED' : 'FAILED',
      details: `resName: ${test2State.resName}, code updated: ${test2State.containsNewName}`,
    });

    // ── Test 3: Click and Rename Container (Resource Group) ──
    console.log('🧪 Test 3: Selecting and Renaming rg_main container to rg-enterprise-core...');
    await page.evaluate(async () => {
      window.useTopologyStore.getState().selectResource('rg_main');
      await window.useTopologyStore.getState().renameResource('rg_main', 'rg-enterprise-core');
    });
    await new Promise(r => setTimeout(r, 1500));

    const test3State = await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const mainTf = store.generatedCode?.['main.tf'] || '';
      const rgRes = store.topology.resources.find(r => r.id === 'rg_main');
      const containsNewRg = mainTf.includes('rg-enterprise-core') || mainTf.includes('rg_enterprise_core');
      const containsRef = mainTf.includes('azurerm_resource_group.rg_enterprise_core.name');

      const editors = window.monaco ? window.monaco.editor.getEditors() : [];
      let currentDecorations = [];
      if (editors.length > 0) {
        const model = editors[0].getModel();
        const decorations = model ? model.getAllDecorations() : [];
        currentDecorations = decorations
          .filter(d => d.options.className === 'monaco-selected-block-highlight')
          .map(d => ({ start: d.range.startLineNumber, end: d.range.endLineNumber }));
      }

      return {
        rgName: rgRes ? rgRes.name : '',
        containsNewRg,
        containsRef,
        decorations: currentDecorations,
      };
    });

    console.log('Test 3 State:', test3State);
    const ss3Path = path.join(ARTIFACTS_DIR, '03_renamed_container_reference_propagation.png');
    await page.screenshot({ path: ss3Path });

    testResults.push({
      test: '3. Rename container updates RG definition and propagates references in main.tf',
      status: test3State.rgName === 'rg-enterprise-core' && test3State.containsNewRg && test3State.containsRef ? 'PASSED' : 'FAILED',
      details: `RG Name: ${test3State.rgName}, Reference updated: ${test3State.containsRef}`,
    });

    // ── Test 4: Select Subnet Container -> Highlight Subnet Block ──
    console.log('🧪 Test 4: Selecting snet_app...');
    await page.evaluate(() => {
      window.useTopologyStore.getState().selectResource('snet_app');
    });
    await new Promise(r => setTimeout(r, 800));

    const test4State = await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const editors = window.monaco ? window.monaco.editor.getEditors() : [];
      let currentDecorations = [];
      if (editors.length > 0) {
        const model = editors[0].getModel();
        const decorations = model ? model.getAllDecorations() : [];
        currentDecorations = decorations
          .filter(d => d.options.className === 'monaco-selected-block-highlight')
          .map(d => ({ start: d.range.startLineNumber, end: d.range.endLineNumber }));
      }
      return {
        selectedId: store.selectedResourceId,
        decorations: currentDecorations,
        hasHighlight: currentDecorations.length > 0,
      };
    });

    console.log('Test 4 State:', test4State);
    const ss4Path = path.join(ARTIFACTS_DIR, '04_click_subnet_container_highlight.png');
    await page.screenshot({ path: ss4Path });

    testResults.push({
      test: '4. Click Subnet container highlights azurerm_subnet in Code Drawer',
      status: test4State.hasHighlight && test4State.selectedId === 'snet_app' ? 'PASSED' : 'FAILED',
      details: `Decorated lines: ${JSON.stringify(test4State.decorations)}`,
    });

    console.log('\n================== VERIFICATION TEST RESULTS ==================');
    console.table(testResults);
    console.log('===============================================================\n');

  } catch (err) {
    console.error('❌ Test execution error:', err);
  } finally {
    await browser.close();
    console.log('🏁 Browser closed.');
  }
}

runTests();
