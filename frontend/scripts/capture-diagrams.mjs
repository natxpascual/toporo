import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const extHtmlPath = path.resolve(process.env.HOME, '.vscode/extensions/zaaack.markdown-editor-0.1.21/media/index.html');
const manuscriptPath = path.resolve('manuscripts/03-draft-chapter-3.md');
const content = fs.readFileSync(manuscriptPath, 'utf8');

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 2000 });
  await page.goto('file://' + extHtmlPath);
  await page.evaluate((md) => {
    window.postMessage({ command: 'update', content: md, theme: 'dark', type: 'init' }, '*');
  }, content);

  await new Promise(r => setTimeout(r, 5000));

  // Find the mermaid diagrams
  const svgs = await page.$$('div[data-type="mermaid"] svg, .language-mermaid svg');
  console.log('Found SVGs:', svgs.length);

  for (let i = 0; i < svgs.length; i++) {
    const svgHtml = await page.evaluate(el => el.outerHTML, svgs[i]);
    fs.writeFileSync(`frontend/scripts/fig-${i + 1}-raw.svg`, svgHtml);
    const box = await svgs[i].boundingBox();
    console.log(`Fig ${i + 1} box:`, box);
    if (box && box.width > 0 && box.height > 0) {
      await page.screenshot({
        path: `frontend/scripts/fig-${i + 1}-screenshot.png`,
        clip: box
      });
      console.log(`Saved screenshot for Fig ${i + 1}`);
    }
  }

  await browser.close();
}
run();
