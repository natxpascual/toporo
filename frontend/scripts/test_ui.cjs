const puppeteer = require('puppeteer-core');
const path = require('path');

const ARTIFACTS_DIR = '/Users/natpascual/.gemini/antigravity-ide/brain/8c702d26-b707-4374-8f1a-9857d0d18b73';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function runTests() {
  console.log('🚀 Launching Google Chrome via Puppeteer-Core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1500, height: 950 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const testResults = [];

  try {
    console.log('🌐 Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
    await page.waitForSelector('.monaco-editor', { timeout: 10000 });
    console.log('✅ Canvas & Monaco Editor loaded.');

    await new Promise(r => setTimeout(r, 1000));

    // Helper to find line number of a search string in Monaco
    const getLineNumberForString = async (searchStr) => {
      return await page.evaluate((search) => {
        const store = window.useTopologyStore.getState();
        const mainTf = store.generatedCode?.['main.tf'] || '';
        const lines = mainTf.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(search)) {
            return i + 1;
          }
        }
        return -1;
      }, searchStr);
    };

    // Helper to simulate setting cursor position in Monaco Editor
    const setMonacoCursor = async (lineNumber) => {
      return await page.evaluate((line) => {
        // Monaco editor instance
        const monacoEditors = window.monaco ? window.monaco.editor.getEditors() : [];
        if (monacoEditors.length > 0) {
          const editor = monacoEditors[0];
          editor.focus();
          editor.setPosition({ lineNumber: line, column: 5 });
          return { success: true, position: editor.getPosition() };
        }
        return { success: false, reason: 'No Monaco editor found' };
      }, lineNumber);
    };

    // 1. Test Placing Cursor inside `azurerm_linux_virtual_machine`
    const vmLine = await getLineNumberForString('azurerm_linux_virtual_machine');
    console.log(`📍 Found VM block at line: ${vmLine}`);
    await setMonacoCursor(vmLine + 1);
    await new Promise(r => setTimeout(r, 300));

    const vmHoveredId = await page.evaluate(() => window.useTopologyStore.getState().hoveredResourceId);
    console.log(`Cursor at line ${vmLine + 1} -> hoveredResourceId: ${vmHoveredId}`);

    testResults.push({
      test: 'Cursor on VM block highlights vm_web on Canvas',
      status: vmHoveredId === 'vm_web' ? 'PASSED' : 'FAILED',
      details: `hoveredResourceId: ${vmHoveredId}`,
    });

    // 2. Test Placing Cursor inside `azurerm_storage_account`
    const stLine = await getLineNumberForString('azurerm_storage_account');
    console.log(`📍 Found Storage Account block at line: ${stLine}`);
    await setMonacoCursor(stLine + 2);
    await new Promise(r => setTimeout(r, 300));

    const stHoveredId = await page.evaluate(() => window.useTopologyStore.getState().hoveredResourceId);
    console.log(`Cursor at line ${stLine + 2} -> hoveredResourceId: ${stHoveredId}`);

    testResults.push({
      test: 'Cursor on Storage block highlights st_assets on Canvas',
      status: stHoveredId === 'st_assets' ? 'PASSED' : 'FAILED',
      details: `hoveredResourceId: ${stHoveredId}`,
    });

    // 3. Test Placing Cursor inside `azurerm_subnet` container
    const snetLine = await getLineNumberForString('azurerm_subnet');
    console.log(`📍 Found Subnet block at line: ${snetLine}`);
    await setMonacoCursor(snetLine + 1);
    await new Promise(r => setTimeout(r, 300));

    const snetHoveredId = await page.evaluate(() => window.useTopologyStore.getState().hoveredResourceId);
    console.log(`Cursor at line ${snetLine + 1} -> hoveredResourceId: ${snetHoveredId}`);

    testResults.push({
      test: 'Cursor on Subnet container block highlights snet_app on Canvas',
      status: snetHoveredId === 'snet_app' ? 'PASSED' : 'FAILED',
      details: `hoveredResourceId: ${snetHoveredId}`,
    });

    // 4. Test Placing Cursor on terraform {} header (non-resource block)
    await setMonacoCursor(5);
    await new Promise(r => setTimeout(r, 300));

    const nonResHoveredId = await page.evaluate(() => window.useTopologyStore.getState().hoveredResourceId);
    console.log(`Cursor at line 5 (terraform block) -> hoveredResourceId: ${nonResHoveredId}`);

    testResults.push({
      test: 'Cursor outside resource blocks clears highlight (null)',
      status: nonResHoveredId === null ? 'PASSED' : 'FAILED',
      details: `hoveredResourceId: ${nonResHoveredId}`,
    });

    // 5. Place cursor back on VM and capture screenshot showing the active highlight on Canvas
    await setMonacoCursor(vmLine + 2);
    await new Promise(r => setTimeout(r, 500));

    const screenshotFinal = path.join(ARTIFACTS_DIR, '03_cursor_code_block_highlight_verified.png');
    await page.screenshot({ path: screenshotFinal });
    testResults.push({
      test: 'Visual Verification Screenshot (Code Cursor + Canvas Glow)',
      status: 'CAPTURED',
      screenshot: '03_cursor_code_block_highlight_verified.png',
    });

    console.log('\n================== AUTOMATED TEST RESULTS ==================');
    console.table(testResults);
    console.log('============================================================\n');

  } catch (err) {
    console.error('❌ Test error:', err);
  } finally {
    await browser.close();
    console.log('🏁 Browser closed.');
  }
}

runTests();
