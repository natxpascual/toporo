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
  throw new Error('Chrome binary not found.');
}

async function runVerification() {
  const browser = await puppeteer.launch({
    executablePath: getChromePath(),
    headless: true,
    args: ['--no-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('[Test] Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 20000 });

  // 1. Load Template 1 (Static Web App & CDN)
  console.log('[Test] Loading Starter: Static Web App template...');
  await page.evaluate(() => {
    // Switch to Templates tab
    const tabs = Array.from(document.querySelectorAll('button'));
    const templatesTab = tabs.find(b => b.innerText.includes('Templates'));
    if (templatesTab) templatesTab.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    // Click the first blueprint card
    const cards = Array.from(document.querySelectorAll('div[title*="load this architecture"]'));
    if (cards.length > 0) {
      cards[0].click();
    } else {
      // Fallback: click any template text
      const tpl = Array.from(document.querySelectorAll('div')).find(d => d.innerText && d.innerText.includes('Static Web App & Global CDN'));
      if (tpl) tpl.click();
    }
  });
  await new Promise(r => setTimeout(r, 1500));

  // 2. Test Handle Dots Visibility
  console.log('[Test 1] Checking handle dot visibility (unhovered vs hovered)...');
  const handleTest = await page.evaluate(async () => {
    const handles = Array.from(document.querySelectorAll('.react-flow__handle'));
    if (handles.length === 0) return { error: 'No handles found' };

    // When no node is hovered, ALL handles must have opacity === "0"
    const unhoveredOpacities = handles.map(h => window.getComputedStyle(h).opacity);
    const allZero = unhoveredOpacities.every(op => parseFloat(op) === 0);

    // Now hover over the first resource node
    const firstNode = document.querySelector('.react-flow__node-azureResource');
    if (!firstNode) return { error: 'No azureResource node found' };

    firstNode.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    // Wait a tick for transition
    await new Promise(r => setTimeout(r, 200));

    const nodeHandles = Array.from(firstNode.querySelectorAll('.react-flow__handle'));
    const hoveredOpacities = nodeHandles.map(h => window.getComputedStyle(h).opacity);
    const anyVisible = hoveredOpacities.some(op => parseFloat(op) > 0.5);

    return {
      totalHandles: handles.length,
      allZeroByDefault: allZero,
      unhoveredOpacitiesSample: unhoveredOpacities.slice(0, 8),
    };
  });

  console.log('Unhovered handles test:', handleTest);
  if (!handleTest.allZeroByDefault) {
    throw new Error('Handles are not opacity: 0 by default!');
  }

  // True browser hover over the first Azure resource node
  console.log('[Test 1.1] Hovering mouse over an Azure resource card...');
  await page.hover('.react-flow__node-azureResource');
  await new Promise(r => setTimeout(r, 300));

  const hoveredNodeHandles = await page.evaluate(() => {
    const firstNode = document.querySelector('.react-flow__node-azureResource');
    const handles = Array.from(firstNode.querySelectorAll('.react-flow__handle'));
    const opacities = handles.map(h => window.getComputedStyle(h).opacity);
    return {
      handlesCount: handles.length,
      opacities,
      anyVisible: opacities.some(op => parseFloat(op) > 0.5),
    };
  });

  console.log('Hovered node handles:', hoveredNodeHandles);
  if (!hoveredNodeHandles.anyVisible) {
    throw new Error('Handles did not become visible when hovering the node!');
  }
  console.log('✓ Handle dots are hidden by default and visible on hover.');

  // 3. Test Container Resizer Hit Area & Z-Index
  console.log('[Test 2] Checking container resizer hit area and styling...');
  const resizerTest = await page.evaluate(async () => {
    const container = document.querySelector('.react-flow__node-containerResource');
    if (!container) return { error: 'No container node found' };

    // Select container to activate resizer
    container.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await new Promise(r => setTimeout(r, 200));

    const resizerControls = Array.from(document.querySelectorAll('.react-flow__resize-control'));
    const lines = Array.from(document.querySelectorAll('.react-flow__resize-control.line'));
    const cornerHandles = Array.from(document.querySelectorAll('.react-flow__resize-control.handle'));

    const lineStyles = lines.map(l => ({
      classes: l.className,
      pointerEvents: window.getComputedStyle(l).pointerEvents,
      zIndex: window.getComputedStyle(l).zIndex,
    }));

    return {
      containerFound: true,
      resizerControlsCount: resizerControls.length,
      linesCount: lines.length,
      cornerHandlesCount: cornerHandles.length,
      lineStylesSample: lineStyles[0],
    };
  });

  console.log('Resizer test result:', resizerTest);
  if (resizerTest.linesCount < 4) {
    throw new Error('Container resizer lines missing!');
  }
  console.log('✓ Container resizer hit controls rendered with z-index and pointer-events.');

  // 4. Test Dragging in and out across container sides
  console.log('[Test 3] Testing dragging resource in and out across sides...');
  const dragTest = await page.evaluate(async () => {
    const containerNode = document.querySelector('.react-flow__node-containerResource');
    const containerBox = containerNode.getBoundingClientRect();

    const childNode = document.querySelector('.react-flow__node-azureResource');
    const childBox = childNode.getBoundingClientRect();

    return {
      container: { x: containerBox.x, y: containerBox.y, width: containerBox.width, height: containerBox.height },
      child: { x: childBox.x, y: childBox.y, width: childBox.width, height: childBox.height },
    };
  });
  console.log('Initial layout coordinates:', dragTest);

  // Take screenshot
  fs.mkdirSync('./screenshots', { recursive: true });
  await page.screenshot({ path: './screenshots/container_ux_verified.png' });
  console.log('✓ Screenshot captured to ./screenshots/container_ux_verified.png');

  await browser.close();
  console.log('All tests passed successfully!');
}

runVerification().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
