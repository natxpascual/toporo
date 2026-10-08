import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const manuscriptPath = path.resolve(__dirname, '../../manuscripts/03-draft-chapter-3.md');

const content = fs.readFileSync(manuscriptPath, 'utf8');
const parts = content.split('```mermaid');
const blocks = parts.slice(1).map(p => p.split('```')[0].trim());

async function testVditor() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(`
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.4.0/dist/mermaid.esm.min.mjs';
      window.mermaid = mermaid;
      mermaid.initialize({
        securityLevel: 'loose',
        altFontFamily: 'sans-serif',
        fontFamily: 'sans-serif',
        startOnLoad: false,
        flowchart: { htmlLabels: true, useMaxWidth: true }
      });
    </script>
  `);
  await page.waitForFunction('typeof window.mermaid !== "undefined"');

  const figNums = [1, 2, 3, 4];
  for (let i = 0; i < blocks.length; i++) {
    const res = await page.evaluate(async (code, idx) => {
      try {
        await window.mermaid.render('vditor_' + idx, code);
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }, blocks[i], i);
    console.log(`Figure ${figNums[i]}:`, res);
  }
  await browser.close();
}

testVditor().catch(e => console.error(e));
