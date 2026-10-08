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

const versions = [
  '8.14.0',
  '9.3.0',
  '9.4.3',
  '10.2.4',
  '10.9.1'
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox']
  });

  for (const v of versions) {
    const page = await browser.newPage();
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/mermaid@${v}/dist/mermaid.min.js"></script>
        </head>
        <body>
          <div id="test-div"></div>
        </body>
      </html>
    `);

    const testCode = async (code) => {
      return await page.evaluate(async (code) => {
        try {
          if (window.mermaid.parseAsync) {
            await window.mermaid.parseAsync(code);
          } else if (window.mermaid.parse) {
            window.mermaid.parse(code);
          }
          return 'OK';
        } catch(e) {
          return e.message.split('\n')[0];
        }
      }, code);
    };

    const r1 = await testCode(fig1);
    const r2 = await testCode(fig2);
    const r3 = await testCode(fig3);
    const r4 = await testCode(fig4);

    console.log(`v${v} -> Fig 1: ${r1} | Fig 2: ${r2} | Fig 3: ${r3} | Fig 4: ${r4}`);
    await page.close();
  }
  await browser.close();
}
run().catch(e => console.error(e));
