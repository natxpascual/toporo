import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const rootDir = '/Users/natpascual/Library/CloudStorage/OneDrive-Personal/Documents/02. GSIT - Masters/00_CAPSTONE';
const extHtmlPath = path.resolve(process.env.HOME, '.vscode/extensions/zaaack.markdown-editor-0.1.21/media/index.html');
const manuscriptPath = path.resolve(rootDir, 'manuscripts/03-draft-chapter-3.md');
const content = fs.readFileSync(manuscriptPath, 'utf8');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 6000 });
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('file://' + extHtmlPath);

  // Send the chapter 3 markdown content
  await page.evaluate((md) => {
    window.postMessage({
      command: 'update',
      content: md,
      theme: 'dark',
      type: 'init'
    }, '*');
  }, content);

  // Wait for rendering
  await new Promise(r => setTimeout(r, 4000));

  // Check for any error elements in Vditor
  const details = await page.evaluate(() => {
    const svgs = document.querySelectorAll('div[data-type="mermaid"] svg, .language-mermaid svg');
    const list = [];
    svgs.forEach((svg, idx) => {
      const allTextNodes = Array.from(svg.querySelectorAll('text, span, div, p')).map(el => el.textContent.trim()).filter(Boolean);
      const errors = allTextNodes.filter(t => t.toLowerCase().includes('error') || t.toLowerCase().includes('unsupported') || t.toLowerCase().includes('syntax'));
      list.push({
        figNumber: idx + 1,
        id: svg.id,
        errors,
        allTextCount: allTextNodes.length,
        firstTexts: allTextNodes.slice(0, 10)
      });
    });

    const errorDivs = Array.from(document.querySelectorAll('.vditor-reset--error')).map(e => e.innerText);
    return { list, errorDivs };
  });

  // Check Fig 3 specifically
  const fig3Info = await page.evaluate(() => {
    const svgs = document.querySelectorAll('div[data-type="mermaid"] svg, .language-mermaid svg');
    const svg3 = svgs[2];
    if (!svg3) return { found: false };
    return {
      found: true,
      id: svg3.id,
      viewBox: svg3.getAttribute('viewBox'),
      width: svg3.getAttribute('width'),
      height: svg3.getAttribute('height'),
      style: svg3.getAttribute('style'),
      innerHTMLSnippet: svg3.innerHTML.slice(0, 500),
      outerHTMLSnippet: svg3.outerHTML.slice(0, 500),
      rectsCount: svg3.querySelectorAll('rect').length,
      textsCount: svg3.querySelectorAll('text').length,
      pathsCount: svg3.querySelectorAll('path').length,
      clientRect: svg3.getBoundingClientRect()
    };
  });
  console.log('FIG 3 INFO:', JSON.stringify(fig3Info, null, 2));

  for (let i = 0; i < details.list.length; i++) {
    const svgEl = (await page.$$('div[data-type="mermaid"] svg, .language-mermaid svg'))[i];
    if (svgEl) {
      const box = await svgEl.boundingBox();
      if (box && box.width > 0 && box.height > 0) {
        await page.screenshot({
          path: path.resolve(rootDir, `frontend/scripts/current-fig-${i + 1}.png`),
          clip: box
        });
        console.log(`Captured current-fig-${i + 1}.png`);
      }
    }
  }

  console.log('Diagram details:', JSON.stringify(details, null, 2));

  await browser.close();
}

run().catch(console.error);
