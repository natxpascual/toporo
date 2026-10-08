import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const manuscriptPath = path.resolve(__dirname, '../../manuscripts/03-draft-chapter-3.md');

const content = fs.readFileSync(manuscriptPath, 'utf8');
const parts = content.split('```mermaid');
const fig1 = parts[1].split('```')[0].trim();
const fig2 = parts[2].split('```')[0].trim();
const fig3 = parts[3].split('```')[0].trim();
const fig4 = parts[4].split('```')[0].trim();

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('about:blank');
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://unpkg.com/vditor@3.11.2/dist/js/mermaid/mermaid.min.js"></script>
      </head>
      <body>
        <div id="container"></div>
      </body>
    </html>
  `);

  const testFig = async (code, name) => {
    return await page.evaluate(async (code, name) => {
      try {
        window.mermaid.initialize({
          securityLevel: 'loose',
          altFontFamily: 'sans-serif',
          fontFamily: 'sans-serif',
          startOnLoad: false,
          flowchart: { htmlLabels: true, useMaxWidth: true }
        });
        const res = await window.mermaid.render('test-' + name, code);
        return { status: 'OK', svgLen: res.svg ? res.svg.length : 0 };
      } catch (err) {
        return { status: 'ERROR', message: err.message, stack: err.stack };
      }
    }, code, name);
  };

  console.log('Fig 1:', await testFig(fig1, 'fig1'));
  console.log('Fig 2:', await testFig(fig2, 'fig2'));
  console.log('Fig 3:', await testFig(fig3, 'fig3'));
  console.log('Fig 4:', await testFig(fig4, 'fig4'));

  await browser.close();
}

run().catch(console.error);
