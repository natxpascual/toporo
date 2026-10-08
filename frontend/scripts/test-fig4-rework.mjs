import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';

function getChromePath() {
  const candidatePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ];
  for (const p of candidatePaths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome binary not found.');
}

function generateReworkedFigure4SVG() {
  const width = 1120;
  const height = 730;

  const useCases = [
    { id: 'UC01', label: 'Model Visual Azure Topology', y: 95, user: true, ai: false },
    { id: 'UC02', label: 'Synchronize Monaco HCL Bidirectionally', y: 145, user: true, ai: false },
    { id: 'UC03', label: 'Synthesize Architecture from Prompt', y: 195, user: true, ai: true },
    { id: 'UC04', label: 'Ingest Raw Terraform Scripts (.tf)', y: 245, user: true, ai: false },
    { id: 'UC05', label: 'Ingest Terraform State (.tfstate)', y: 295, user: true, ai: false },
    { id: 'UC06', label: 'Ingest Compiled Plan (tfplan.json)', y: 345, user: true, ai: false },
    { id: 'UC07', label: 'Reverse-Engineer Azure Resource Graph', y: 395, user: true, ai: false },
    { id: 'UC08', label: 'Execute Checkov CIS Benchmark Scan', y: 445, user: true, ai: false },
    { id: 'UC09', label: 'Apply 1-Click Security Remediation', y: 495, user: true, ai: true },
    { id: 'UC10', label: 'Inspect FinOps Monthly Cost Forecast', y: 545, user: true, ai: false },
    { id: 'UC11', label: 'Generate Remediation Patch via GPT-4o', y: 595, user: false, ai: true },
  ];

  const devopsCard = { x: 35, y: 200, width: 205, height: 290 };
  const aiCard = { x: 875, y: 245, width: 210, height: 280 };

  const devopsAnchorX = devopsCard.x + devopsCard.width; // 240
  const aiAnchorX = aiCard.x; // 875

  let ucElements = '';
  let userLines = '';
  let aiLines = '';

  const userUCs = useCases.filter(u => u.user);
  const totalUser = userUCs.length; // 10

  useCases.forEach((uc) => {
    const cx = 555;
    const cy = uc.y;
    const rx = 180;
    const ry = 20;

    // Oval Fill and Stroke
    const isShared = uc.user && uc.ai;
    const isAiOnly = !uc.user && uc.ai;
    const strokeColor = isAiOnly ? '#7c3aed' : (isShared ? '#2563eb' : '#3b82f6');
    const badgeColor = isAiOnly ? '#6d28d9' : '#1e3a8a';
    const bgFill = isAiOnly ? '#faf5ff' : '#eff6ff';

    ucElements += `
      <g>
        <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${bgFill}" stroke="${strokeColor}" stroke-width="1.8"/>
        <text x="${cx}" y="${cy + 4}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="600" fill="${badgeColor}" text-anchor="middle">${uc.id}: ${uc.label}</text>
      </g>
    `;
  });

  // Generate User Lines (fan out neatly from right edge of DevOps card)
  userUCs.forEach((uc, idx) => {
    const cx = 555;
    const rx = 180;
    const cy = uc.y;
    const startY = devopsCard.y + 70 + (idx * ((devopsCard.height - 90) / (totalUser - 1)));

    userLines += `
      <!-- Line to ${uc.id} -->
      <line x1="${devopsAnchorX}" y1="${startY}" x2="${cx - rx}" y2="${cy}" stroke="#475569" stroke-width="1.6"/>
      <circle cx="${devopsAnchorX}" cy="${startY}" r="2.5" fill="#2563eb"/>
      <circle cx="${cx - rx}" cy="${cy}" r="2.5" fill="#475569"/>
    `;
  });

  // AI Lines
  // UC03 (Shared, prompt synthesis)
  const uc03 = useCases.find(u => u.id === 'UC03');
  const aiStart03Y = aiCard.y + 80;
  aiLines += `
    <!-- AI Line to UC03 (Assists / Secondary) -->
    <line x1="${aiAnchorX}" y1="${aiStart03Y}" x2="${555 + 180}" y2="${uc03.y}" stroke="#7c3aed" stroke-width="1.6" stroke-dasharray="5,4"/>
    <circle cx="${aiAnchorX}" cy="${aiStart03Y}" r="2.5" fill="#7c3aed"/>
    <circle cx="${555 + 180}" cy="${uc03.y}" r="2.5" fill="#7c3aed"/>
  `;

  // UC09 (Shared, 1-Click Remediation)
  const uc09 = useCases.find(u => u.id === 'UC09');
  const aiStart09Y = aiCard.y + 140;
  aiLines += `
    <!-- AI Line to UC09 (Assists / Secondary) -->
    <line x1="${aiAnchorX}" y1="${aiStart09Y}" x2="${555 + 180}" y2="${uc09.y}" stroke="#7c3aed" stroke-width="1.6" stroke-dasharray="5,4"/>
    <circle cx="${aiAnchorX}" cy="${aiStart09Y}" r="2.5" fill="#7c3aed"/>
    <circle cx="${555 + 180}" cy="${uc09.y}" r="2.5" fill="#7c3aed"/>
  `;

  // UC11 (AI primary, GPT-4o patch generation)
  const uc11 = useCases.find(u => u.id === 'UC11');
  const aiStart11Y = aiCard.y + 200;
  aiLines += `
    <!-- AI Line to UC11 (Primary Automated Action) -->
    <line x1="${aiAnchorX}" y1="${aiStart11Y}" x2="${555 + 180}" y2="${uc11.y}" stroke="#7c3aed" stroke-width="1.8"/>
    <circle cx="${aiAnchorX}" cy="${aiStart11Y}" r="2.5" fill="#7c3aed"/>
    <circle cx="${555 + 180}" cy="${uc11.y}" r="2.5" fill="#7c3aed"/>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="ucShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.09"/>
    </filter>
    <linearGradient id="devopsGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <linearGradient id="aiGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#6d28d9"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="#ffffff"/>

  <!-- ================= 1. SYSTEM BOUNDARY (RENDERED FIRST) ================= -->
  <g filter="url(#ucShadow)">
    <!-- Boundary Container -->
    <rect x="290" y="35" width="530" height="615" rx="14" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
    <!-- Boundary Header Bar -->
    <rect x="290" y="35" width="530" height="36" rx="14" fill="#1e293b"/>
    <rect x="290" y="56" width="530" height="15" fill="#1e293b"/>
    <text x="555" y="59" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12.5" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">SYSTEM BOUNDARY: AZURE CLOUD TOPOLOGY ENGINE</text>
  </g>

  <!-- ================= 2. ASSOCIATION LINES (CROSSING THROUGH BOUNDARY) ================= -->
  ${userLines}
  ${aiLines}

  <!-- ================= 3. USE CASE OVALS ================= -->
  ${ucElements}

  <!-- ================= 4. ACTOR 1: DEVOPS PROFESSIONAL (ICON CARD) ================= -->
  <g filter="url(#ucShadow)">
    <!-- Card Frame -->
    <rect x="${devopsCard.x}" y="${devopsCard.y}" width="${devopsCard.width}" height="${devopsCard.height}" rx="14" fill="#ffffff" stroke="#93c5fd" stroke-width="2"/>
    <!-- Accent Top Bar -->
    <path d="M ${devopsCard.x} ${devopsCard.y + 12} A 12 12 0 0 1 ${devopsCard.x + 12} ${devopsCard.y} L ${devopsCard.x + devopsCard.width - 12} ${devopsCard.y} A 12 12 0 0 1 ${devopsCard.x + devopsCard.width} ${devopsCard.y + 12} L ${devopsCard.x + devopsCard.width} ${devopsCard.y + 6} L ${devopsCard.x} ${devopsCard.y + 6} Z" fill="#2563eb"/>

    <!-- Avatar Circle (60px) -->
    <g transform="translate(${devopsCard.x + devopsCard.width / 2}, ${devopsCard.y + 52})">
      <circle cx="0" cy="0" r="30" fill="url(#devopsGrad)"/>
      <!-- User Vector Icon -->
      <!-- Head -->
      <circle cx="0" cy="-7" r="9" fill="#ffffff"/>
      <!-- Shoulders / Torso -->
      <path d="M -17 17 C -17 6, -9 2, 0 2 C 9 2, 17 6, 17 17 Z" fill="#ffffff"/>
      <!-- Terminal / Code Badge -->
      <circle cx="14" cy="12" r="9" fill="#0284c7" stroke="#ffffff" stroke-width="1.8"/>
      <path d="M 11 9.5 L 14 12 L 11 14.5" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="15.5" y1="14.5" x2="18" y2="14.5" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
    </g>

    <!-- Actor Label -->
    <text x="${devopsCard.x + devopsCard.width / 2}" y="${devopsCard.y + 104}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">DevOps Professional</text>
    
    <!-- Subtitle Pill Badge -->
    <rect x="${devopsCard.x + 28}" y="${devopsCard.y + 114}" width="${devopsCard.width - 56}" height="20" rx="10" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
    <text x="${devopsCard.x + devopsCard.width / 2}" y="${devopsCard.y + 128}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="#1d4ed8" text-anchor="middle">Primary Human Actor</text>

    <!-- Divider -->
    <line x1="${devopsCard.x + 20}" y1="${devopsCard.y + 145}" x2="${devopsCard.x + devopsCard.width - 20}" y2="${devopsCard.y + 145}" stroke="#e2e8f0" stroke-width="1"/>

    <!-- Operational Responsibilities -->
    <g transform="translate(${devopsCard.x + 18}, ${devopsCard.y + 165})" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#475569">
      <text x="0" y="0" font-weight="600">• Visual Azure Modeling</text>
      <text x="0" y="20" font-weight="600">• Bi-Directional HCL Code</text>
      <text x="0" y="40" font-weight="600">• Multi-Source Ingestion</text>
      <text x="0" y="60" font-weight="600">• Policy &amp; CIS Audit</text>
      <text x="0" y="80" font-weight="600">• FinOps Cost Inspection</text>
      <text x="0" y="100" font-weight="600">• Remediation Triggering</text>
    </g>
  </g>

  <!-- ================= 5. ACTOR 2: AI COPILOT SYSTEM (ICON CARD) ================= -->
  <g filter="url(#ucShadow)">
    <!-- Card Frame -->
    <rect x="${aiCard.x}" y="${aiCard.y}" width="${aiCard.width}" height="${aiCard.height}" rx="14" fill="#ffffff" stroke="#c4b5fd" stroke-width="2"/>
    <!-- Accent Top Bar -->
    <path d="M ${aiCard.x} ${aiCard.y + 12} A 12 12 0 0 1 ${aiCard.x + 12} ${aiCard.y} L ${aiCard.x + aiCard.width - 12} ${aiCard.y} A 12 12 0 0 1 ${aiCard.x + aiCard.width} ${aiCard.y + 12} L ${aiCard.x + aiCard.width} ${aiCard.y + 6} L ${aiCard.x} ${aiCard.y + 6} Z" fill="#7c3aed"/>

    <!-- Avatar Circle (60px) -->
    <g transform="translate(${aiCard.x + aiCard.width / 2}, ${aiCard.y + 52})">
      <circle cx="0" cy="0" r="30" fill="url(#aiGrad)"/>
      <!-- AI Sparkle Vector Icon -->
      <!-- Main 4-point sparkle -->
      <path d="M 0 -17 Q 0 -3 14 0 Q 0 3 0 17 Q 0 3 -14 0 Q 0 -3 0 -17 Z" fill="#ffffff"/>
      <!-- Small Top-Right Sparkle -->
      <path d="M 12 -12 Q 12 -8 16 -6 Q 12 -4 12 0 Q 12 -4 8 -6 Q 12 -8 12 -12 Z" fill="#e9d5ff"/>
      <!-- Small Bottom-Left Sparkle -->
      <path d="M -11 6 Q -11 9 -14 11 Q -11 13 -11 16 Q -11 13 -8 11 Q -11 9 -11 6 Z" fill="#e9d5ff"/>
      <!-- Center Core Dot -->
      <circle cx="0" cy="0" r="2.8" fill="#6d28d9"/>
    </g>

    <!-- Actor Label -->
    <text x="${aiCard.x + aiCard.width / 2}" y="${aiCard.y + 104}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">AI Copilot System</text>
    
    <!-- Subtitle Pill Badge -->
    <rect x="${aiCard.x + 22}" y="${aiCard.y + 114}" width="${aiCard.width - 44}" height="20" rx="10" fill="#faf5ff" stroke="#ddd6fe" stroke-width="1"/>
    <text x="${aiCard.x + aiCard.width / 2}" y="${aiCard.y + 128}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="#6d28d9" text-anchor="middle">System Automated Actor</text>

    <!-- Divider -->
    <line x1="${aiCard.x + 20}" y1="${aiCard.y + 145}" x2="${aiCard.x + aiCard.width - 20}" y2="${aiCard.y + 145}" stroke="#e2e8f0" stroke-width="1"/>

    <!-- Operational Responsibilities -->
    <g transform="translate(${aiCard.x + 18}, ${aiCard.y + 168})" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#475569">
      <text x="0" y="0" font-weight="600">• Azure OpenAI Service</text>
      <text x="0" y="20" font-weight="600">• Natural Language Synthesis</text>
      <text x="0" y="40" font-weight="600">• Canonical IR JSON Emitter</text>
      <text x="0" y="60" font-weight="600">• CIS Remediation Patches</text>
      <text x="0" y="80" font-weight="600">• Non-Blocking Async Gen</text>
    </g>
  </g>

  <!-- Legend at Bottom -->
  <g transform="translate(330, 680)">
    <rect x="0" y="0" width="450" height="32" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
    <!-- Solid Line Legend -->
    <line x1="20" y1="16" x2="55" y2="16" stroke="#475569" stroke-width="1.8"/>
    <circle cx="37.5" cy="16" r="2.5" fill="#475569"/>
    <text x="65" y="20" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="#334155">Direct Association</text>

    <!-- Dashed Line Legend -->
    <line x1="230" y1="16" x2="265" y2="16" stroke="#7c3aed" stroke-width="1.8" stroke-dasharray="4,3"/>
    <circle cx="247.5" cy="16" r="2.5" fill="#7c3aed"/>
    <text x="275" y="20" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="#334155">AI-Assisted Collaboration</text>
  </g>
</svg>`;
}

async function test() {
  const svg = generateReworkedFigure4SVG();
  fs.writeFileSync('frontend/scripts/test-fig4-reworked.svg', svg);
  console.log('Saved test-fig4-reworked.svg');

  const browser = await puppeteer.launch({
    executablePath: getChromePath(),
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1120, height: 730, deviceScaleFactor: 2 });
  await page.goto('file://' + path.resolve('frontend/scripts/test-fig4-reworked.svg'), { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'frontend/scripts/test-fig4-reworked.png' });
  await browser.close();
  console.log('Rendered test-fig4-reworked.png');
}

test().catch(console.error);
