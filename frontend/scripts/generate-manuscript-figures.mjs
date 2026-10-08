import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer-core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '../../');
const outputDir = path.join(workspaceRoot, 'manuscripts/figures');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

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

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// -------------------------------------------------------------
// FIGURE 1: Conceptual Framework (IPO Model)
// -------------------------------------------------------------
function generateFigure1ConceptualFrameworkSVG() {
  const width = 1100;
  const height = 710;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="boxShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#2563eb" />
    </marker>
    <marker id="feedbackArrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#dc2626" />
    </marker>
  </defs>

  <rect width="${width}" height="${height}" fill="#ffffff"/>

  <!-- THREE MAIN COLUMNS -->

  <!-- 1. INPUT BOX -->
  <g filter="url(#boxShadow)">
    <rect x="50" y="30" width="300" height="580" rx="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
    <path d="M 50 42 Q 50 30 62 30 L 338 30 Q 350 30 350 42 L 350 75 L 50 75 Z" fill="#1e293b"/>
    <text x="200" y="60" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">INPUT</text>

    <!-- Subsections -->
    <g transform="translate(68, 95)" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" fill="#1e293b">
      <text y="0" font-weight="700" fill="#0284c7">DOMAIN &amp; USER REQUIREMENTS</text>
      <text y="20" fill="#334155">• DevOps practitioner requirements</text>
      <text y="38" fill="#334155">• IaC declarative workflow needs</text>
      <text y="56" fill="#334155">• Cognitive pain points in HCL</text>

      <text y="92" font-weight="700" fill="#0284c7">TECHNICAL STANDARDS &amp; DATA</text>
      <text y="112" fill="#334155">• Azure Resource Graph schemas</text>
      <text y="130" fill="#334155">• HashiCorp Terraform syntax rules</text>
      <text y="148" fill="#334155">• CIS Azure Foundations Benchmark</text>
      <text y="166" fill="#334155">• Infracost &amp; Azure Retail API rates</text>
      <text y="184" fill="#334155">• Azure OpenAI (GPT-4o) parameters</text>

      <text y="220" font-weight="700" fill="#0284c7">DEVELOPMENT TOOLS &amp; STACK</text>
      <text y="240" fill="#334155">• React 18, React Flow 12, Vite</text>
      <text y="258" fill="#334155">• Monaco Editor &amp; Zustand</text>
      <text y="276" fill="#334155">• FastAPI, Python 3.12, Pydantic</text>
      <text y="294" fill="#334155">• python-hcl2 AST &amp; Jinja2</text>
      <text y="312" fill="#334155">• Checkov &amp; NetworkX graph</text>
      <text y="330" fill="#334155">• Docker &amp; Azure App Service</text>

      <text y="366" font-weight="700" fill="#0284c7">EVALUATION METRICS</text>
      <text y="386" fill="#334155">• ISO/IEC 25010 Quality Model</text>
      <text y="404" fill="#334155">• 5-point Likert survey checklist</text>
      <text y="422" fill="#334155">• Pre- &amp; post-task timing logs</text>
      <text y="440" fill="#334155">• Descriptive statistics (WM, SD)</text>
      <text y="458" fill="#334155">• Post-evaluation interview data</text>
    </g>
  </g>

  <!-- Connective Arrow 1 to 2 -->
  <line x1="365" y1="320" x2="385" y2="320" stroke="#2563eb" stroke-width="3" marker-end="url(#arrow)"/>

  <!-- 2. PROCESS BOX -->
  <g filter="url(#boxShadow)">
    <rect x="400" y="30" width="300" height="580" rx="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
    <path d="M 400 42 Q 400 30 412 30 L 688 30 Q 700 30 700 42 L 700 75 L 400 75 Z" fill="#1e293b"/>
    <text x="550" y="60" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">PROCESS</text>

    <!-- Subsections -->
    <g transform="translate(418, 95)" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" fill="#1e293b">
      <text y="0" font-weight="700" fill="#2563eb">PHASE 1: REQUIREMENTS &amp; DESIGN</text>
      <text y="20" fill="#334155">• Needs analysis &amp; workflow design</text>
      <text y="38" fill="#334155">• Canonical IR schema design</text>
      <text y="56" fill="#334155">• System architecture specification</text>

      <text y="92" font-weight="700" fill="#2563eb">PHASE 2: CORE DEVELOPMENT</text>
      <text y="112" fill="#334155">• Canvas modeling &amp; Monaco editor</text>
      <text y="130" fill="#334155">• Bidirectional AST synchronization</text>
      <text y="148" fill="#334155">• Multi-source reverse-engineering</text>
      <text y="166" fill="#334155">• Checkov CIS &amp; blast radius engine</text>
      <text y="184" fill="#334155">• Infracost &amp; Retail API FinOps</text>
      <text y="202" fill="#334155">• Azure OpenAI (GPT-4o) copilot</text>

      <text y="238" font-weight="700" fill="#2563eb">PHASE 3: TESTING &amp; VERIFICATION</text>
      <text y="258" fill="#334155">• Automated AST roundtrip tests</text>
      <text y="276" fill="#334155">• Security &amp; FinOps unit suites</text>
      <text y="294" fill="#334155">• System deployment on Azure</text>

      <text y="330" font-weight="700" fill="#2563eb">PHASE 4: EMPIRICAL EVALUATION</text>
      <text y="350" fill="#334155">• Cloud staging deployment</text>
      <text y="368" fill="#334155">• Practitioner hands-on testing (N=20)</text>
      <text y="386" fill="#334155">• ISO/IEC 25010 survey administration</text>
      <text y="404" fill="#334155">• Post-evaluation interviews</text>

      <text y="440" font-weight="700" fill="#2563eb">PHASE 5: STATISTICAL ANALYSIS</text>
      <text y="460" fill="#334155">• Data validation &amp; descriptive stats</text>
      <text y="478" fill="#334155">• Thematic qualitative synthesis</text>
    </g>
  </g>

  <!-- Connective Arrow 2 to 3 -->
  <line x1="715" y1="320" x2="735" y2="320" stroke="#2563eb" stroke-width="3" marker-end="url(#arrow)"/>

  <!-- 3. OUTPUT BOX -->
  <g filter="url(#boxShadow)">
    <rect x="750" y="30" width="300" height="580" rx="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
    <path d="M 750 42 Q 750 30 762 30 L 1038 30 Q 1050 30 1050 42 L 1050 75 L 750 75 Z" fill="#1e293b"/>
    <text x="900" y="60" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">OUTPUT</text>

    <!-- Subsections -->
    <g transform="translate(768, 95)" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" fill="#1e293b">
      <text y="0" font-weight="700" fill="#16a34a">SOFTWARE ARTIFACT</text>
      <text y="20" fill="#334155">• Azure Cloud Topology Engine</text>
      <text y="38" fill="#334155">• Bidirectional canvas &amp; editor</text>
      <text y="56" fill="#334155">• Multi-source reverse-engineering</text>
      <text y="74" fill="#334155">• Real-time CIS compliance scanner</text>
      <text y="92" fill="#334155">• Graph blast-radius visualizer</text>
      <text y="110" fill="#334155">• Infracost pre-deploy cost engine</text>
      <text y="128" fill="#334155">• GPT-4o AI architecture copilot</text>
      <text y="146" fill="#334155">• Production Docker &amp; IaC deployment</text>

      <text y="182" font-weight="700" fill="#16a34a">EMPIRICAL FINDINGS</text>
      <text y="202" fill="#334155">• ISO/IEC 25010 descriptive ratings</text>
      <text y="220" fill="#334155">• Quantitative efficiency gains</text>
      <text y="238" fill="#334155">• Qualitative practitioner insights</text>
      <text y="256" fill="#334155">• Statistically sound conclusions</text>

      <text y="292" font-weight="700" fill="#16a34a">SCHOLARLY CONTRIBUTIONS</text>
      <text y="312" fill="#334155">• Peer-reviewed research manuscript</text>
      <text y="330" fill="#334155">• Validated Canonical IR schema</text>
      <text y="348" fill="#334155">• Reproducible open-source artifact</text>
      <text y="366" fill="#334155">• Recommendations for cloud DevOps</text>
    </g>
  </g>

  <!-- FEEDBACK LOOP (Bottom Curved Path) -->
  <g>
    <path d="M 900 610 L 900 665 L 200 665 L 200 615" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="8,5" marker-end="url(#feedbackArrow)"/>
    <rect x="425" y="650" width="250" height="30" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
    <text x="550" y="670" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#b91c1c" text-anchor="middle">FEEDBACK LOOP (Iterative Refinement)</text>
  </g>
</svg>`;
}

// -------------------------------------------------------------
// FIGURE 2: Project Schedule (Five-Month Gantt Chart)
// -------------------------------------------------------------
function generateFigure2ProjectScheduleSVG() {
  const width = 1200;
  const height = 780;

  const leftMargin = 330;
  const rightMargin = 1140;
  const chartWidth = rightMargin - leftMargin; // 810px
  const weekWidth = chartWidth / 22; // ~36.81px per week

  const months = [
    { name: 'JUNE 2026', weeks: ['W1', 'W2', 'W3', 'W4'], count: 4 },
    { name: 'JULY 2026', weeks: ['W5', 'W6', 'W7', 'W8', 'W9'], count: 5 },
    { name: 'AUGUST 2026', weeks: ['W10', 'W11', 'W12', 'W13'], count: 4 },
    { name: 'SEPTEMBER 2026', weeks: ['W14', 'W15', 'W16', 'W17'], count: 4 },
    { name: 'OCTOBER 2026', weeks: ['W18', 'W19', 'W20', 'W21', 'W22'], count: 5 },
  ];

  const phases = [
    {
      title: 'PHASE 1: INITIATION & FOUNDATION (JUNE 2026)',
      color: '#1e3a8a',
      bg: '#eff6ff',
      tasks: [
        { name: 'Project Charter, Scoping & Repository Baseline', startW: 0, durW: 2, color: '#3b82f6', sprint: 'Sprint 1 Prep' },
        { name: 'Canonical IR Schema Definition & Pydantic Validation', startW: 1, durW: 2, color: '#2563eb', sprint: 'Sprint 1' },
        { name: 'AST Parser (python-hcl2) & Jinja2 Emitter Prototype', startW: 2, durW: 2, color: '#1d4ed8', sprint: 'Sprint 1' },
      ],
      milestone: { name: 'M1: Schema Baseline & Architecture Specification Complete', week: 4 },
    },
    {
      title: 'PHASE 2: VISUAL CANVAS & BIDIRECTIONAL SYNC (JULY 2026)',
      color: '#0e7490',
      bg: '#ecfeff',
      tasks: [
        { name: 'React Flow 12 Visual Canvas & Custom Node Card Views', startW: 4, durW: 2.5, color: '#06b6d4', sprint: 'Sprint 2' },
        { name: 'Monaco Editor Integration & Centralized Zustand Store', startW: 5.5, durW: 2.5, color: '#0891b2', sprint: 'Sprint 2' },
        { name: 'Bidirectional State Synchronization & AST Roundtrip Sync', startW: 7, durW: 2, color: '#0e7490', sprint: 'Sprint 2' },
      ],
      milestone: { name: 'M2: Bidirectional AST State Synchronization Operational', week: 9 },
    },
    {
      title: 'PHASE 3: MULTI-SOURCE REVERSE ENGINEERING (AUGUST 2026)',
      color: '#4338ca',
      bg: '#eef2ff',
      tasks: [
        { name: 'Multi-Source File Ingestion (.tf, .tfstate, tfplan.json)', startW: 9, durW: 2.5, color: '#6366f1', sprint: 'Sprint 3' },
        { name: 'Live Azure Resource Graph (ARG) Explorer Subsystem', startW: 10.5, durW: 2.5, color: '#4f46e5', sprint: 'Sprint 3' },
        { name: 'NetworkX Hierarchical Layout & Auto-Arrangement Engine', startW: 11.5, durW: 1.5, color: '#4338ca', sprint: 'Sprint 3' },
      ],
      milestone: { name: 'M3: Reverse Engineering Ingestion Pipeline Verified', week: 13 },
    },
    {
      title: 'PHASE 4: SECURITY, FINOPS, AI COPILOT & STAGING (SEPTEMBER 2026)',
      color: '#047857',
      bg: '#ecfdf5',
      tasks: [
        { name: 'Checkov CIS Azure Benchmark Static Scanner & Blast Radius', startW: 13, durW: 2, color: '#10b981', sprint: 'Sprint 4' },
        { name: 'Infracost API & Azure Retail Prices Real-Time FinOps Engine', startW: 14, durW: 2, color: '#059669', sprint: 'Sprint 4' },
        { name: 'Azure OpenAI (GPT-4o) Copilot & 1-Click Remediation Patches', startW: 15, durW: 2, color: '#047857', sprint: 'Sprint 5' },
        { name: 'Docker Containerization & Azure App Service Cloud Staging', startW: 16, durW: 1, color: '#065f46', sprint: 'Sprint 5' },
      ],
      milestone: { name: 'M4: Feature-Complete System Deployed to Cloud Staging', week: 17 },
    },
    {
      title: 'PHASE 5: EVALUATION, STATISTICS & DEFENSE (OCTOBER 2026)',
      color: '#92400e',
      bg: '#fffbeb',
      tasks: [
        { name: 'DevOps Practitioner Orientation & Hands-On Staging Setup', startW: 17, durW: 1, color: '#f59e0b', sprint: 'Eval Prep' },
        { name: 'Two-Week Hands-On Practitioner Evaluation Sessions (N=20)', startW: 18, durW: 2.5, color: '#d97706', sprint: 'Evaluation' },
        { name: 'ISO/IEC 25010 Questionnaire Checklists & Post-Interviews', startW: 19, durW: 2, color: '#b45309', sprint: 'Evaluation' },
        { name: 'Descriptive Statistical Treatment (WM, GWM, SD Analysis)', startW: 20.5, durW: 1.5, color: '#92400e', sprint: 'Post-Eval' },
        { name: 'Cross-Chapter Manuscript Audit & Final Capstone Defense', startW: 21, durW: 1, color: '#78350f', sprint: 'Defense' },
      ],
      milestone: { name: 'M5: Artifact Evaluated, Statistical Analysis & Capstone Defense', week: 22 },
    },
  ];

  let monthHeaders = '';
  let gridLines = '';
  let currentX = leftMargin;

  months.forEach((m, idx) => {
    const mWidth = m.count * weekWidth;
    monthHeaders += `
      <rect x="${currentX}" y="45" width="${mWidth}" height="28" fill="${idx % 2 === 0 ? '#1e293b' : '#334155'}" stroke="#475569" stroke-width="1"/>
      <text x="${currentX + mWidth / 2}" y="64" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.8">${m.name}</text>
    `;

    for (let w = 0; w < m.count; w++) {
      const wx = currentX + w * weekWidth;
      monthHeaders += `
        <rect x="${wx}" y="73" width="${weekWidth}" height="20" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.5"/>
        <text x="${wx + weekWidth / 2}" y="87" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">${m.weeks[w]}</text>
      `;
    }
    currentX += mWidth;
  });

  for (let w = 0; w <= 22; w++) {
    const x = leftMargin + w * weekWidth;
    const isMonthBoundary = [0, 4, 9, 13, 17, 22].includes(w);
    gridLines += `
      <line x1="${x}" y1="93" x2="${x}" y2="${height - 25}" stroke="${isMonthBoundary ? '#94a3b8' : '#e2e8f0'}" stroke-width="${isMonthBoundary ? '1.5' : '1'}" stroke-dasharray="${isMonthBoundary ? 'none' : '3,3'}"/>
    `;
  }

  let currentY = 102;
  let rowsSVG = '';

  phases.forEach((phase) => {
    rowsSVG += `
      <rect x="30" y="${currentY}" width="${width - 60}" height="24" fill="${phase.bg}" stroke="${phase.color}" stroke-width="1" rx="4"/>
      <text x="40" y="${currentY + 16}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="800" fill="${phase.color}">${escapeXml(phase.title)}</text>
    `;
    currentY += 28;

    phase.tasks.forEach((task) => {
      const bx = leftMargin + task.startW * weekWidth;
      const bw = task.durW * weekWidth;

      rowsSVG += `
        <line x1="30" y1="${currentY + 22}" x2="${width - 30}" y2="${currentY + 22}" stroke="#f1f5f9" stroke-width="1"/>
        <text x="45" y="${currentY + 15}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#1e293b">${escapeXml(task.name)}</text>
        <rect x="250" y="${currentY + 3}" width="70" height="16" rx="8" fill="#e2e8f0"/>
        <text x="285" y="${currentY + 15}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" fill="#475569" text-anchor="middle">${escapeXml(task.sprint)}</text>
        <rect x="${bx}" y="${currentY + 2}" width="${bw}" height="18" rx="4" fill="${task.color}" filter="url(#barShadow)"/>
        <text x="${bx + bw / 2}" y="${currentY + 15}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" fill="#ffffff" text-anchor="middle">${task.durW}w</text>
      `;
      currentY += 24;
    });

    const mx = leftMargin + phase.milestone.week * weekWidth;
    rowsSVG += `
      <text x="45" y="${currentY + 14}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" font-style="italic" font-weight="700" fill="${phase.color}">◆ ${escapeXml(phase.milestone.name)}</text>
      <polygon points="${mx},${currentY + 2} ${mx + 7},${currentY + 9} ${mx},${currentY + 16} ${mx - 7},${currentY + 9}" fill="${phase.color}" stroke="#ffffff" stroke-width="1.5"/>
    `;
    currentY += 24;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="barShadow" x="-5%" y="-10%" width="110%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="#ffffff"/>

  <!-- Title Header -->
  <rect x="30" y="10" width="${width - 60}" height="32" rx="6" fill="#0f172a"/>
  <text x="${width / 2}" y="32" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">PROJECT SCHEDULE: FIVE-MONTH GANTT CHART (JUNE TO OCTOBER 2026)</text>

  <!-- Month and Week Headers -->
  <rect x="30" y="45" width="${leftMargin - 30}" height="48" fill="#1e293b" stroke="#475569" stroke-width="1"/>
  <text x="${(30 + leftMargin) / 2}" y="74" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#ffffff" text-anchor="middle">WORK PACKAGE &amp; TASKS</text>
  ${monthHeaders}

  <!-- Grid Lines -->
  ${gridLines}

  <!-- Rows -->
  ${rowsSVG}

  <!-- Bottom Legend -->
  <rect x="30" y="${height - 24}" width="${width - 60}" height="20" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" rx="4"/>
  <text x="50" y="${height - 10}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" font-weight="600" fill="#475569">Note: Total Duration = 22 Calendar Weeks (June 1 - October 31, 2026) • Sprints 1 to 5 encompass 2-week iterations followed by staging evaluation and defense.</text>
</svg>`;
}

// -------------------------------------------------------------
// FIGURE 3: Work Breakdown Structure (WBS)
// -------------------------------------------------------------
function generateFigure3WorkBreakdownStructureSVG() {
  const width = 1200;
  const height = 820;

  const packages = [
    {
      code: '1.0',
      title: 'Project Management & Initiation',
      color: '#1e3a8a',
      bg: '#eff6ff',
      col: 0,
      row: 0,
      sub: ['1.1 Project Charter & Scope Baseline', '1.2 Branching Rules & Repository Setup', '1.3 Local Dev Containers & Environment'],
    },
    {
      code: '2.0',
      title: 'Requirements & Domain Modeling',
      color: '#0e7490',
      bg: '#ecfeff',
      col: 1,
      row: 0,
      sub: ['2.1 Cloud Practitioner Requirements', '2.2 CIS Azure Benchmark Taxonomy', '2.3 ISO/IEC 25010 Quality Model Mapping'],
    },
    {
      code: '3.0',
      title: 'System Architecture & Design',
      color: '#4338ca',
      bg: '#eef2ff',
      col: 2,
      row: 0,
      sub: ['3.1 Three-Tier Architecture Specs', '3.2 UML Use Cases & DFD Levels 0/1', '3.3 Canonical IR Schema Specification'],
    },
    {
      code: '4.0',
      title: 'Core Platform Development',
      color: '#047857',
      bg: '#ecfdf5',
      col: 3,
      row: 0,
      sub: ['4.1 React Flow 12 Canvas & Monaco Sync', '4.2 AST Compiler & Jinja2 Emitters', '4.3 Multi-Source Ingestion Parsers', '4.4 Checkov CIS Scanner & Blast Radius', '4.5 Infracost & Azure Retail FinOps', '4.6 Azure OpenAI (GPT-4o) Copilot'],
    },
    {
      code: '5.0',
      title: 'Verification & Quality Assurance',
      color: '#b45309',
      bg: '#fffbeb',
      col: 0,
      row: 1,
      sub: ['5.1 Automated Pytest AST Roundtrip Tests', '5.2 Lossless Bidirectional State Tests', '5.3 CIS Security Benchmark Validation'],
    },
    {
      code: '6.0',
      title: 'Deployment & Cloud Staging',
      color: '#c2410c',
      bg: '#fff7ed',
      col: 1,
      row: 1,
      sub: ['6.1 Multi-Stage Docker Containerization', '6.2 Azure App Service Linux Deploy', '6.3 System-Assigned Managed Identities'],
    },
    {
      code: '7.0',
      title: 'Empirical Evaluation & Statistics',
      color: '#7c3aed',
      bg: '#faf5ff',
      col: 2,
      row: 1,
      sub: ['7.1 Practitioner Staging Onboarding (N=20)', '7.2 ISO/IEC 25010 Questionnaire Surveys', '7.3 Descriptive Statistics (WM, GWM, SD)', '7.4 Qualitative Practitioner Interviews'],
    },
    {
      code: '8.0',
      title: 'Capstone Reporting & Defense',
      color: '#be123c',
      bg: '#fff1f2',
      col: 3,
      row: 1,
      sub: ['8.1 Academic Manuscript Synthesis', '8.2 Cross-Chapter Consistency Audit', '8.3 Defense Demonstration & Presentation'],
    },
  ];

  const colWidth = 265;
  const colGap = 20;
  const startX = 40;
  const row0Y = 130;
  const row1Y = 480;

  let cardsSVG = '';
  let linesSVG = '';

  const rootCenterX = width / 2;
  const rootBottomY = 75;

  packages.forEach((pkg) => {
    const x = startX + pkg.col * (colWidth + colGap);
    const y = pkg.row === 0 ? row0Y : row1Y;
    const cardHeight = pkg.row === 0 ? 315 : 295;
    const cardCenterX = x + colWidth / 2;

    if (pkg.row === 0) {
      linesSVG += `
        <path d="M ${rootCenterX} ${rootBottomY} L ${rootCenterX} 100 L ${cardCenterX} 100 L ${cardCenterX} ${y}" fill="none" stroke="#64748b" stroke-width="1.8"/>
        <circle cx="${cardCenterX}" cy="${y}" r="3" fill="#64748b"/>
      `;
    } else {
      linesSVG += `
        <path d="M ${cardCenterX} ${row0Y + 315} L ${cardCenterX} ${y}" fill="none" stroke="#64748b" stroke-width="1.8" stroke-dasharray="4,4"/>
        <circle cx="${cardCenterX}" cy="${y}" r="3" fill="#64748b"/>
      `;
    }

    let subItemsSVG = '';
    pkg.sub.forEach((s, sIdx) => {
      subItemsSVG += `
        <rect x="${x + 12}" y="${y + 55 + sIdx * 38}" width="${colWidth - 24}" height="32" rx="6" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
        <text x="${x + 22}" y="${y + 75 + sIdx * 38}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="600" fill="#1e293b">${escapeXml(s)}</text>
      `;
    });

    cardsSVG += `
      <g filter="url(#wbsShadow)">
        <rect x="${x}" y="${y}" width="${colWidth}" height="${cardHeight}" rx="10" fill="${pkg.bg}" stroke="${pkg.color}" stroke-width="1.8"/>
        <rect x="${x}" y="${y}" width="${colWidth}" height="42" rx="10" fill="${pkg.color}"/>
        <rect x="${x}" y="${y + 25}" width="${colWidth}" height="17" fill="${pkg.color}"/>
        <rect x="${x + 10}" y="${y + 9}" width="32" height="24" rx="5" fill="#ffffff"/>
        <text x="${x + 26}" y="${y + 25}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="${pkg.color}" text-anchor="middle">${escapeXml(pkg.code)}</text>
        <text x="${x + 50}" y="${y + 26}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#ffffff">${escapeXml(pkg.title)}</text>
        ${subItemsSVG}
      </g>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="wbsShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="#ffffff"/>

  ${linesSVG}

  <g filter="url(#wbsShadow)">
    <rect x="${rootCenterX - 280}" y="20" width="560" height="55" rx="12" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <text x="${rootCenterX}" y="43" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle" letter-spacing="1.5">RESEARCH &amp; DEVELOPMENT TAXONOMY</text>
    <text x="${rootCenterX}" y="63" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="15" font-weight="800" fill="#ffffff" text-anchor="middle">AZURE CLOUD TOPOLOGY ENGINE: WORK BREAKDOWN STRUCTURE (WBS)</text>
  </g>

  ${cardsSVG}
</svg>`;
}

// -------------------------------------------------------------
// FIGURE 4: Proposed System Architecture
// -------------------------------------------------------------
function generateFigure4SystemArchitectureSVG() {
  const width = 1100;
  const height = 980;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="archShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="flowArrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
      <polygon points="0 0, 8 3.5, 0 7" fill="#2563eb"/>
    </marker>
    <marker id="syncArrow" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
      <polygon points="0 0, 8 3.5, 0 7" fill="#059669"/>
    </marker>
  </defs>

  <rect width="${width}" height="${height}" fill="#ffffff"/>

  <!-- TIER 1: CLIENT PRESENTATION LAYER -->
  <g filter="url(#archShadow)">
    <rect x="50" y="30" width="1000" height="260" rx="12" fill="#f8fafc" stroke="#3b82f6" stroke-width="2"/>
    <path d="M 50 42 Q 50 30 62 30 L 1038 30 Q 1050 30 1050 42 L 1050 70 L 50 70 Z" fill="#1e40af"/>
    <text x="550" y="55" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">TIER 1: CLIENT PRESENTATION LAYER (BROWSER SINGLE-PAGE APPLICATION)</text>

    <!-- Sub-boxes in Tier 1 -->
    <g transform="translate(75, 85)">
      <!-- 1.1 Visual Canvas -->
      <rect x="0" y="0" width="280" height="185" rx="8" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
      <rect x="0" y="0" width="280" height="32" rx="8" fill="#dbeafe"/>
      <rect x="0" y="22" width="280" height="10" fill="#dbeafe"/>
      <text x="140" y="21" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#1e3a8a" text-anchor="middle">Visual Topology Canvas</text>
      <text x="15" y="50" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#0284c7">React Flow 12 (@xyflow/react)</text>
      <text x="15" y="70" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Drag-and-drop Azure nodes</text>
      <text x="15" y="88" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Hierarchical scoping containers</text>
      <text x="15" y="106" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Real-time CIS badge overlays</text>
      <text x="15" y="124" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Infracost monthly cost badges</text>
      <text x="15" y="142" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• NetworkX blast radius highlights</text>
      <text x="15" y="160" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Interactive edge connections</text>

      <!-- 1.2 State Store -->
      <rect x="330" y="0" width="280" height="185" rx="8" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
      <rect x="330" y="0" width="280" height="32" rx="8" fill="#dbeafe"/>
      <rect x="330" y="22" width="280" height="10" fill="#dbeafe"/>
      <text x="470" y="21" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#1e3a8a" text-anchor="middle">Centralized State Store</text>
      <text x="345" y="50" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#0284c7">Zustand Reactive Store</text>
      <text x="345" y="70" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Canonical IR active document</text>
      <text x="345" y="88" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Debounced change dispatching</text>
      <text x="345" y="106" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Undo / Redo history buffer</text>
      <text x="345" y="124" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Selection &amp; highlight tracking</text>
      <text x="345" y="142" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Ingestion &amp; export dispatchers</text>
      <text x="345" y="160" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Sync lock (loop suppression)</text>

      <!-- 1.3 Code Editor -->
      <rect x="660" y="0" width="280" height="185" rx="8" fill="#ffffff" stroke="#93c5fd" stroke-width="1.5"/>
      <rect x="660" y="0" width="280" height="32" rx="8" fill="#dbeafe"/>
      <rect x="660" y="22" width="280" height="10" fill="#dbeafe"/>
      <text x="800" y="21" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#1e3a8a" text-anchor="middle">Declarative Code Editor</text>
      <text x="675" y="50" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#0284c7">Monaco Editor (@monaco-editor/react)</text>
      <text x="675" y="70" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Bidirectional text synchronization</text>
      <text x="675" y="88" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Terraform HCL syntax highlight</text>
      <text x="675" y="106" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Diagnostic error squiggles</text>
      <text x="675" y="124" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• 1-click auto-remediation patches</text>
      <text x="675" y="142" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Side-by-side split screen view</text>
      <text x="675" y="160" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Direct code snippet export</text>
    </g>
  </g>

  <!-- Flow Arrows Tier 1 to Tier 2 -->
  <g>
    <path d="M 300 290 L 300 350" stroke="#059669" stroke-width="2.5" marker-end="url(#syncArrow)"/>
    <text x="310" y="325" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="#059669">REST / JSON</text>
    
    <path d="M 550 350 L 550 290" stroke="#2563eb" stroke-width="2.5" marker-end="url(#flowArrow)"/>
    <text x="560" y="325" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="#2563eb">Canonical IR</text>

    <path d="M 800 290 L 800 350" stroke="#059669" stroke-width="2.5" marker-end="url(#syncArrow)"/>
    <text x="810" y="325" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="#059669">AST Updates</text>
  </g>

  <!-- TIER 2: SERVER COMPILER AND APPLICATION SERVICES -->
  <g filter="url(#archShadow)">
    <rect x="50" y="350" width="1000" height="340" rx="12" fill="#f8fafc" stroke="#2563eb" stroke-width="2"/>
    <path d="M 50 362 Q 50 350 62 350 L 1038 350 Q 1050 350 1050 362 L 1050 390 L 50 390 Z" fill="#1e3a8a"/>
    <text x="550" y="375" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">TIER 2: SERVER COMPILER &amp; ANALYTICAL SERVICES (FASTAPI / PYTHON 3.12)</text>

    <!-- Sub-boxes in Tier 2 -->
    <g transform="translate(75, 405)">
      <!-- 2.1 Compiler and Bidirectional Sync -->
      <rect x="0" y="0" width="280" height="265" rx="8" fill="#ffffff" stroke="#bfdbfe" stroke-width="1.5"/>
      <rect x="0" y="0" width="280" height="30" rx="8" fill="#eff6ff"/>
      <rect x="0" y="20" width="280" height="10" fill="#eff6ff"/>
      <text x="140" y="20" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#1e40af" text-anchor="middle">Bidirectional Compiler &amp; AST</text>
      <text x="15" y="48" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#2563eb">python-hcl2 &amp; Jinja2 Emitters</text>
      <text x="15" y="68" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• HCL to Canonical IR parsing</text>
      <text x="15" y="86" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Modular Jinja2 template emission</text>
      <text x="15" y="104" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Pydantic schema validation</text>
      <text x="15" y="122" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Terraform state (.tfstate) parser</text>
      <text x="15" y="140" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Compiled plan (tfplan.json) reader</text>
      <text x="15" y="158" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Graph AST tree reconstruction</text>
      <text x="15" y="176" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• NetworkX layout calculator</text>
      <text x="15" y="194" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Preserves comments &amp; variables</text>
      <text x="15" y="212" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Roundtrip validation guarantees</text>

      <!-- 2.2 Analytical Engines -->
      <rect x="330" y="0" width="280" height="265" rx="8" fill="#ffffff" stroke="#bfdbfe" stroke-width="1.5"/>
      <rect x="330" y="0" width="280" height="30" rx="8" fill="#eff6ff"/>
      <rect x="330" y="20" width="280" height="10" fill="#eff6ff"/>
      <text x="470" y="20" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#1e40af" text-anchor="middle">Security &amp; FinOps Analyzers</text>
      <text x="345" y="48" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#2563eb">Checkov &amp; Infracost Engine</text>
      <text x="345" y="68" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• CIS Azure Foundations v2.0.0</text>
      <text x="345" y="86" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Static policy rule checks</text>
      <text x="345" y="104" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• NetworkX blast radius calculator</text>
      <text x="345" y="122" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Dependency graph propagation</text>
      <text x="345" y="140" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Pre-deployment Infracost runs</text>
      <text x="345" y="158" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Azure Retail Prices REST cache</text>
      <text x="345" y="176" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Hourly &amp; monthly cost calculation</text>
      <text x="345" y="194" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Subnet &amp; resource badge payload</text>
      <text x="345" y="212" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Severity ranking (HIGH, MED, LOW)</text>

      <!-- 2.3 Generative AI Copilot -->
      <rect x="660" y="0" width="280" height="265" rx="8" fill="#ffffff" stroke="#bfdbfe" stroke-width="1.5"/>
      <rect x="660" y="0" width="280" height="30" rx="8" fill="#eff6ff"/>
      <rect x="660" y="20" width="280" height="10" fill="#eff6ff"/>
      <text x="800" y="20" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#1e40af" text-anchor="middle">Generative AI Copilot</text>
      <text x="675" y="48" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#2563eb">Azure OpenAI Service (GPT-4o)</text>
      <text x="675" y="68" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Natural language prompt intake</text>
      <text x="675" y="86" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Canonical IR schema prompt inject</text>
      <text x="675" y="104" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Validated JSON topology output</text>
      <text x="675" y="122" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• 1-click remediation code patch</text>
      <text x="675" y="140" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Contextual security explanations</text>
      <text x="675" y="158" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• FinOps architectural tips</text>
      <text x="675" y="176" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• System-assigned identity tokens</text>
      <text x="675" y="194" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• Hallucination suppression rules</text>
      <text x="675" y="212" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#475569">• JSON schema response format</text>
    </g>
  </g>

  <!-- Flow Arrows Tier 2 to Tier 3 -->
  <g>
    <path d="M 300 690 L 300 740" stroke="#059669" stroke-width="2.5" marker-end="url(#syncArrow)"/>
    <text x="310" y="718" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="#059669">ARM Queries</text>

    <path d="M 550 740 L 550 690" stroke="#2563eb" stroke-width="2.5" marker-end="url(#flowArrow)"/>
    <text x="560" y="718" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="#2563eb">Price Quotes</text>

    <path d="M 800 690 L 800 740" stroke="#059669" stroke-width="2.5" marker-end="url(#syncArrow)"/>
    <text x="810" y="718" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="700" fill="#059669">GPT-4o Inference</text>
  </g>

  <!-- TIER 3: EXTERNAL CLOUD PLATFORMS AND SERVICES -->
  <g filter="url(#archShadow)">
    <rect x="50" y="740" width="1000" height="190" rx="12" fill="#f8fafc" stroke="#10b981" stroke-width="2"/>
    <path d="M 50 752 Q 50 740 62 740 L 1038 740 Q 1050 740 1050 752 L 1050 780 L 50 780 Z" fill="#065f46"/>
    <text x="550" y="765" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">TIER 3: EXTERNAL CLOUD SERVICES &amp; RUNTIME INFRASTRUCTURE</text>

    <!-- Sub-boxes in Tier 3 -->
    <g transform="translate(75, 795)">
      <!-- S1 -->
      <rect x="0" y="0" width="175" height="115" rx="8" fill="#ffffff" stroke="#86efac" stroke-width="1.2"/>
      <text x="12" y="24" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#166534">Azure OpenAI</text>
      <text x="12" y="42" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#475569">GPT-4o Service</text>
      <text x="12" y="58" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Generative inference</text>
      <text x="12" y="74" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Contextual patches</text>
      <text x="12" y="90" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• JSON strict schemas</text>

      <!-- S2 -->
      <rect x="195" y="0" width="175" height="115" rx="8" fill="#ffffff" stroke="#86efac" stroke-width="1.2"/>
      <text x="207" y="24" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#166534">Infracost Cloud</text>
      <text x="207" y="42" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#475569">FinOps REST API</text>
      <text x="207" y="58" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Plan payload specs</text>
      <text x="207" y="74" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Cost calculations</text>
      <text x="207" y="90" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Monthly estimates</text>

      <!-- S3 -->
      <rect x="390" y="0" width="175" height="115" rx="8" fill="#ffffff" stroke="#86efac" stroke-width="1.2"/>
      <text x="402" y="24" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#166534">Azure Retail Prices</text>
      <text x="402" y="42" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#475569">Public Pricing API</text>
      <text x="402" y="58" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Regional SKU rates</text>
      <text x="402" y="74" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Pay-as-you-go data</text>
      <text x="402" y="90" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Meter rate tables</text>

      <!-- S4 -->
      <rect x="585" y="0" width="175" height="115" rx="8" fill="#ffffff" stroke="#86efac" stroke-width="1.2"/>
      <text x="597" y="24" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#166534">Resource Graph</text>
      <text x="597" y="42" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#475569">Subscription Scanner</text>
      <text x="597" y="58" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Live inventory JSON</text>
      <text x="597" y="74" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Ingestion queries</text>
      <text x="597" y="90" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Subscriptions explorer</text>

      <!-- S5 -->
      <rect x="780" y="0" width="170" height="115" rx="8" fill="#ffffff" stroke="#86efac" stroke-width="1.2"/>
      <text x="792" y="24" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="700" fill="#166534">Azure App Service</text>
      <text x="792" y="42" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#475569">Linux Containers &amp; Vault</text>
      <text x="792" y="58" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Docker staging host</text>
      <text x="792" y="74" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Key Vault secret mgmt</text>
      <text x="792" y="90" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b">• Managed identities</text>
    </g>
  </g>
</svg>`;
}

// -------------------------------------------------------------
// FIGURE 5: Use Case Diagram (UML Standard)
// -------------------------------------------------------------
function generateFigure5UseCaseDiagramSVG() {
  const width = 1120;
  const height = 740;

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

  const devopsAnchorX = devopsCard.x + devopsCard.width;
  const aiAnchorX = aiCard.x;

  let ucElements = '';
  let userLines = '';
  let aiLines = '';

  const userUCs = useCases.filter((u) => u.user);
  const totalUser = userUCs.length;

  useCases.forEach((uc) => {
    const cx = 555;
    const cy = uc.y;
    const rx = 180;
    const ry = 20;

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

  userUCs.forEach((uc, idx) => {
    const cx = 555;
    const rx = 180;
    const cy = uc.y;
    const startY = devopsCard.y + 70 + (idx * ((devopsCard.height - 90) / (totalUser - 1)));

    userLines += `
      <line x1="${devopsAnchorX}" y1="${startY}" x2="${cx - rx}" y2="${cy}" stroke="#475569" stroke-width="1.6"/>
      <circle cx="${devopsAnchorX}" cy="${startY}" r="2.5" fill="#2563eb"/>
      <circle cx="${cx - rx}" cy="${cy}" r="2.5" fill="#475569"/>
    `;
  });

  const uc03 = useCases.find((u) => u.id === 'UC03');
  const aiStart03Y = aiCard.y + 80;
  aiLines += `
    <line x1="${aiAnchorX}" y1="${aiStart03Y}" x2="${555 + 180}" y2="${uc03.y}" stroke="#7c3aed" stroke-width="1.6" stroke-dasharray="5,4"/>
    <circle cx="${aiAnchorX}" cy="${aiStart03Y}" r="2.5" fill="#7c3aed"/>
    <circle cx="${555 + 180}" cy="${uc03.y}" r="2.5" fill="#7c3aed"/>
  `;

  const uc09 = useCases.find((u) => u.id === 'UC09');
  const aiStart09Y = aiCard.y + 150;
  aiLines += `
    <line x1="${aiAnchorX}" y1="${aiStart09Y}" x2="${555 + 180}" y2="${uc09.y}" stroke="#7c3aed" stroke-width="1.6" stroke-dasharray="5,4"/>
    <circle cx="${aiAnchorX}" cy="${aiStart09Y}" r="2.5" fill="#7c3aed"/>
    <circle cx="${555 + 180}" cy="${uc09.y}" r="2.5" fill="#7c3aed"/>
  `;

  const uc11 = useCases.find((u) => u.id === 'UC11');
  const aiStart11Y = aiCard.y + 220;
  aiLines += `
    <line x1="${aiAnchorX}" y1="${aiStart11Y}" x2="${555 + 180}" y2="${uc11.y}" stroke="#7c3aed" stroke-width="1.6"/>
    <circle cx="${aiAnchorX}" cy="${aiStart11Y}" r="2.5" fill="#7c3aed"/>
    <circle cx="${555 + 180}" cy="${uc11.y}" r="2.5" fill="#7c3aed"/>
  `;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="cardShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="#ffffff"/>

  <!-- SYSTEM BOUNDARY BOX -->
  <rect x="295" y="30" width="520" height="660" rx="14" fill="#f8fafc" stroke="#2563eb" stroke-width="2.2"/>
  <rect x="295" y="30" width="520" height="38" rx="14" fill="#2563eb"/>
  <rect x="295" y="52" width="520" height="16" fill="#2563eb"/>
  <text x="555" y="55" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">SYSTEM BOUNDARY: AZURE CLOUD TOPOLOGY ENGINE</text>

  <!-- ACTOR 1: DevOps Professional (Left Card) -->
  <g filter="url(#cardShadow)">
    <rect x="${devopsCard.x}" y="${devopsCard.y}" width="${devopsCard.width}" height="${devopsCard.height}" rx="10" fill="#ffffff" stroke="#94a3b8" stroke-width="1.8"/>
    <rect x="${devopsCard.x}" y="${devopsCard.y}" width="${devopsCard.width}" height="32" rx="10" fill="#1e293b"/>
    <rect x="${devopsCard.x}" y="${devopsCard.y + 18}" width="${devopsCard.width}" height="14" fill="#1e293b"/>
    <text x="${devopsCard.x + devopsCard.width / 2}" y="${devopsCard.y + 21}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">PRIMARY ACTOR</text>

    <!-- Stick Figure DevOps Icon -->
    <g transform="translate(${devopsCard.x + 85}, ${devopsCard.y + 40})">
      <circle cx="17.5" cy="12" r="10" fill="none" stroke="#2563eb" stroke-width="2.2"/>
      <line x1="17.5" y1="22" x2="17.5" y2="46" stroke="#2563eb" stroke-width="2.2"/>
      <line x1="0" y1="32" x2="35" y2="32" stroke="#2563eb" stroke-width="2.2"/>
      <line x1="17.5" y1="46" x2="3" y2="70" stroke="#2563eb" stroke-width="2.2"/>
      <line x1="17.5" y1="46" x2="32" y2="70" stroke="#2563eb" stroke-width="2.2"/>
    </g>

    <text x="${devopsCard.x + devopsCard.width / 2}" y="${devopsCard.y + 130}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">DevOps Professional</text>
    <text x="${devopsCard.x + devopsCard.width / 2}" y="${devopsCard.y + 148}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="600" fill="#64748b" text-anchor="middle">(Practitioner / Evaluator)</text>
    <line x1="${devopsCard.x + 20}" y1="${devopsCard.y + 160}" x2="${devopsCard.x + devopsCard.width - 20}" y2="${devopsCard.y + 160}" stroke="#e2e8f0" stroke-width="1"/>
    
    <text x="${devopsCard.x + 18}" y="${devopsCard.y + 180}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#334155">• Visual topology modeling</text>
    <text x="${devopsCard.x + 18}" y="${devopsCard.y + 198}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#334155">• HCL text editing</text>
    <text x="${devopsCard.x + 18}" y="${devopsCard.y + 216}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#334155">• Ingests .tf, .tfstate, ARG</text>
    <text x="${devopsCard.x + 18}" y="${devopsCard.y + 234}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#334155">• Reviews CIS &amp; FinOps</text>
    <text x="${devopsCard.x + 18}" y="${devopsCard.y + 252}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#334155">• Applies 1-click patches</text>
  </g>

  <!-- ACTOR 2: AI Architecture Copilot (Right Card) -->
  <g filter="url(#cardShadow)">
    <rect x="${aiCard.x}" y="${aiCard.y}" width="${aiCard.width}" height="${aiCard.height}" rx="10" fill="#ffffff" stroke="#7c3aed" stroke-width="1.8"/>
    <rect x="${aiCard.x}" y="${aiCard.y}" width="${aiCard.width}" height="32" rx="10" fill="#7c3aed"/>
    <rect x="${aiCard.x}" y="${aiCard.y + 18}" width="${aiCard.width}" height="14" fill="#7c3aed"/>
    <text x="${aiCard.x + aiCard.width / 2}" y="${aiCard.y + 21}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">SECONDARY ACTOR</text>

    <!-- AI Copilot Robot Icon -->
    <g transform="translate(${aiCard.x + 90}, ${aiCard.y + 40})">
      <rect x="0" y="5" width="30" height="24" rx="6" fill="#faf5ff" stroke="#7c3aed" stroke-width="2.2"/>
      <circle cx="8" cy="16" r="3" fill="#7c3aed"/>
      <circle cx="22" cy="16" r="3" fill="#7c3aed"/>
      <line x1="15" y1="0" x2="15" y2="5" stroke="#7c3aed" stroke-width="2"/>
      <circle cx="15" cy="0" r="2" fill="#7c3aed"/>
      <line x1="15" y1="29" x2="15" y2="48" stroke="#7c3aed" stroke-width="2.2"/>
      <line x1="0" y1="36" x2="30" y2="36" stroke="#7c3aed" stroke-width="2.2"/>
      <line x1="15" y1="48" x2="3" y2="68" stroke="#7c3aed" stroke-width="2.2"/>
      <line x1="15" y1="48" x2="27" y2="68" stroke="#7c3aed" stroke-width="2.2"/>
    </g>

    <text x="${aiCard.x + aiCard.width / 2}" y="${aiCard.y + 130}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#0f172a" text-anchor="middle">AI Architecture Copilot</text>
    <text x="${aiCard.x + aiCard.width / 2}" y="${aiCard.y + 148}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="600" fill="#7c3aed" text-anchor="middle">Azure OpenAI (GPT-4o)</text>
    <line x1="${aiCard.x + 20}" y1="${aiCard.y + 160}" x2="${aiCard.x + aiCard.width - 20}" y2="${aiCard.y + 160}" stroke="#e2e8f0" stroke-width="1"/>
    
    <text x="${aiCard.x + 18}" y="${aiCard.y + 180}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#334155">• Natural language synthesis</text>
    <text x="${aiCard.x + 18}" y="${aiCard.y + 198}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#334155">• Canonical IR construction</text>
    <text x="${aiCard.x + 18}" y="${aiCard.y + 216}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#334155">• Auto-remediation patching</text>
    <text x="${aiCard.x + 18}" y="${aiCard.y + 234}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#334155">• Security context explanations</text>
  </g>

  <!-- ASSOCIATION LINES -->
  ${userLines}
  ${aiLines}

  <!-- USE CASES -->
  ${ucElements}

  <!-- LEGEND -->
  <g transform="translate(320, 650)">
    <line x1="0" y1="16" x2="35" y2="16" stroke="#475569" stroke-width="1.6"/>
    <circle cx="17.5" cy="16" r="2.5" fill="#2563eb"/>
    <text x="45" y="20" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="#334155">Primary Association</text>

    <line x1="230" y1="16" x2="265" y2="16" stroke="#7c3aed" stroke-width="1.6" stroke-dasharray="5,4"/>
    <circle cx="247.5" cy="16" r="2.5" fill="#7c3aed"/>
    <text x="275" y="20" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="#334155">AI-Assisted Collaboration</text>
  </g>
</svg>`;
}

// -------------------------------------------------------------
// FIGURE 7: Data Flow Diagram Level 0 (Context Diagram)
// -------------------------------------------------------------
function generateFigure7DFDLevel0SVG() {
  const width = 1140;
  const height = 740;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow0" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0f172a" flood-opacity="0.09"/>
    </filter>
    <marker id="arr" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
      <polygon points="0 0, 8 3.5, 0 7" fill="#2563eb"/>
    </marker>
    <marker id="arrAzure" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
      <polygon points="0 0, 8 3.5, 0 7" fill="#059669"/>
    </marker>
    <marker id="arrAi" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
      <polygon points="0 0, 8 3.5, 0 7" fill="#7c3aed"/>
    </marker>
    <marker id="arrFin" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
      <polygon points="0 0, 8 3.5, 0 7" fill="#d97706"/>
    </marker>
    <marker id="arrRet" markerWidth="9" markerHeight="9" refX="7" refY="3.5" orient="auto">
      <polygon points="0 0, 8 3.5, 0 7" fill="#e11d48"/>
    </marker>
  </defs>

  <rect width="${width}" height="${height}" fill="#ffffff"/>

  <!-- Title Banner -->
  <rect x="40" y="15" width="${width - 80}" height="35" rx="8" fill="#0f172a"/>
  <text x="${width / 2}" y="38" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">DATA FLOW DIAGRAM: LEVEL 0 CONTEXT DIAGRAM</text>

  <!-- Central System Process (0.0) -->
  <g filter="url(#shadow0)">
    <circle cx="490" cy="380" r="140" fill="#eff6ff" stroke="#2563eb" stroke-width="3"/>
    <circle cx="490" cy="380" r="130" fill="none" stroke="#93c5fd" stroke-width="1.5" stroke-dasharray="4,4"/>
    <text x="490" y="325" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#2563eb" text-anchor="middle">PROCESS 0.0</text>
    <text x="490" y="352" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#1e3a8a" text-anchor="middle">Azure Cloud</text>
    <text x="490" y="377" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#1e3a8a" text-anchor="middle">Topology Engine</text>
    <text x="490" y="402" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#475569" text-anchor="middle">Central System Process</text>
    
    <rect x="405" y="420" width="170" height="24" rx="12" fill="#1e40af"/>
    <text x="490" y="436" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="700" fill="#ffffff" text-anchor="middle">Bidirectional AST &amp; Security</text>
  </g>

  <!-- External Entity 1: DevOps Professional (Left) -->
  <g filter="url(#shadow0)">
    <rect x="40" y="270" width="200" height="220" rx="10" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
    <rect x="40" y="270" width="200" height="42" rx="10" fill="#1e293b"/>
    <rect x="40" y="295" width="200" height="17" fill="#1e293b"/>
    <text x="140" y="297" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle">EXTERNAL ENTITY</text>
    <text x="140" y="335" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="15" font-weight="800" fill="#0f172a" text-anchor="middle">DevOps Professional</text>
    <text x="140" y="355" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="600" fill="#64748b" text-anchor="middle">(User / Evaluator)</text>
    <line x1="60" y1="372" x2="220" y2="372" stroke="#e2e8f0" stroke-width="1"/>
    <text x="140" y="395" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#334155" text-anchor="middle">• Visual canvas modeling</text>
    <text x="140" y="415" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#334155" text-anchor="middle">• HCL editor authoring</text>
    <text x="140" y="435" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#334155" text-anchor="middle">• Natural language prompts</text>
    <text x="140" y="455" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#334155" text-anchor="middle">• Reviewing CIS &amp; FinOps</text>
  </g>

  <!-- Flow Arrows: User to System -->
  <path d="M 240 340 C 290 340, 310 350, 350 350" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="250" y="315" width="100" height="22" rx="4" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
  <text x="300" y="329" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" fill="#1e40af" text-anchor="middle">Edits, HCL, Prompts</text>

  <path d="M 350 410 C 310 410, 290 420, 240 420" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="250" y="425" width="100" height="22" rx="4" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1"/>
  <text x="300" y="439" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" font-weight="700" fill="#1e40af" text-anchor="middle">Canvas, Badges, Code</text>

  <!-- External Entity 2: Azure Cloud / ARG API (Top Right) -->
  <g filter="url(#shadow0)">
    <rect x="800" y="80" width="300" height="110" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
    <rect x="800" y="80" width="300" height="32" rx="10" fill="#16a34a"/>
    <rect x="800" y="96" width="300" height="16" fill="#16a34a"/>
    <text x="950" y="101" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">EXTERNAL CLOUD SERVICE</text>
    <text x="950" y="132" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#14532d" text-anchor="middle">Microsoft Azure / Resource Graph API</text>
    <text x="950" y="152" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="600" fill="#166534" text-anchor="middle">• Live Subscription State &amp; Inventory JSON</text>
    <text x="950" y="170" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#4b5563" text-anchor="middle">Live Cloud Infrastructure Ingestion</text>
  </g>

  <!-- Arrows: System to ARG -->
  <path d="M 590 280 C 660 210, 710 160, 800 145" fill="none" stroke="#059669" stroke-width="2" marker-end="url(#arrAzure)"/>
  <rect x="645" y="175" width="135" height="18" rx="4" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
  <text x="712" y="187" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#065f46" text-anchor="middle">Subscription Query Request</text>

  <path d="M 800 165 C 720 180, 670 250, 605 310" fill="none" stroke="#059669" stroke-width="2" marker-end="url(#arrAzure)"/>
  <rect x="655" y="245" width="130" height="18" rx="4" fill="#ecfdf5" stroke="#a7f3d0" stroke-width="1"/>
  <text x="720" y="257" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#065f46" text-anchor="middle">Resource Inventory JSON</text>

  <!-- External Entity 3: Azure OpenAI Service (Middle Right) -->
  <g filter="url(#shadow0)">
    <rect x="800" y="235" width="300" height="115" rx="10" fill="#faf5ff" stroke="#7c3aed" stroke-width="2"/>
    <rect x="800" y="235" width="300" height="32" rx="10" fill="#7c3aed"/>
    <rect x="800" y="251" width="300" height="16" fill="#7c3aed"/>
    <text x="950" y="256" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">EXTERNAL AI PLATFORM</text>
    <text x="950" y="287" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#4c1d95" text-anchor="middle">Azure OpenAI Service (GPT-4o)</text>
    <text x="950" y="307" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="600" fill="#6d28d9" text-anchor="middle">• Managed Identity Auth &amp; JSON Schema</text>
    <text x="950" y="325" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#4b5563" text-anchor="middle">Generative Synthesis &amp; Code Remediation</text>
  </g>

  <!-- Arrows: System to AOAI -->
  <path d="M 630 360 C 690 350, 740 310, 800 295" fill="none" stroke="#7c3aed" stroke-width="2" marker-end="url(#arrAi)"/>
  <rect x="655" y="318" width="135" height="18" rx="4" fill="#faf5ff" stroke="#ddd6fe" stroke-width="1"/>
  <text x="722" y="330" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#5b21b6" text-anchor="middle">Prompt Context + Schema</text>

  <path d="M 800 315 C 740 330, 690 375, 630 385" fill="none" stroke="#7c3aed" stroke-width="2" marker-end="url(#arrAi)"/>
  <rect x="660" y="365" width="135" height="18" rx="4" fill="#faf5ff" stroke="#ddd6fe" stroke-width="1"/>
  <text x="727" y="377" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#5b21b6" text-anchor="middle">Canonical IR JSON &amp; Patches</text>

  <!-- External Entity 4: Infracost Cloud API (Lower Right) -->
  <g filter="url(#shadow0)">
    <rect x="800" y="390" width="300" height="115" rx="10" fill="#fffbeb" stroke="#d97706" stroke-width="2"/>
    <rect x="800" y="390" width="300" height="32" rx="10" fill="#d97706"/>
    <rect x="800" y="406" width="300" height="16" fill="#d97706"/>
    <text x="950" y="411" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">EXTERNAL FINOPS ENGINE</text>
    <text x="950" y="442" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#78350f" text-anchor="middle">Infracost Cloud API</text>
    <text x="950" y="462" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="600" fill="#92400e" text-anchor="middle">• Pre-Deployment Cost Estimation Engine</text>
    <text x="950" y="480" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#4b5563" text-anchor="middle">Terraform Plan Spec to Monthly Cost</text>
  </g>

  <!-- Arrows: System to Infracost -->
  <path d="M 625 415 C 690 425, 735 440, 800 445" fill="none" stroke="#d97706" stroke-width="2" marker-end="url(#arrFin)"/>
  <rect x="660" y="418" width="130" height="18" rx="4" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
  <text x="725" y="430" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#92400e" text-anchor="middle">Terraform Plan Payloads</text>

  <path d="M 800 465 C 735 460, 690 445, 625 435" fill="none" stroke="#d97706" stroke-width="2" marker-end="url(#arrFin)"/>
  <rect x="660" y="458" width="130" height="18" rx="4" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
  <text x="725" y="470" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#92400e" text-anchor="middle">Monthly Breakdown JSON</text>

  <!-- External Entity 5: Azure Retail Prices API (Bottom Right) -->
  <g filter="url(#shadow0)">
    <rect x="800" y="545" width="300" height="115" rx="10" fill="#fff1f2" stroke="#e11d48" stroke-width="2"/>
    <rect x="800" y="545" width="300" height="32" rx="10" fill="#e11d48"/>
    <rect x="800" y="561" width="300" height="16" fill="#e11d48"/>
    <text x="950" y="566" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">EXTERNAL PRICING CATALOG</text>
    <text x="950" y="597" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#881337" text-anchor="middle">Microsoft Azure Retail Prices API</text>
    <text x="950" y="617" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="600" fill="#9f1239" text-anchor="middle">• Regional Pay-As-You-Go Meter Rates</text>
    <text x="950" y="635" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#4b5563" text-anchor="middle">Public Metered SKU Rates &amp; Catalog</text>
  </g>

  <!-- Arrows: System to Retail Prices -->
  <path d="M 590 480 C 650 540, 710 590, 800 600" fill="none" stroke="#e11d48" stroke-width="2" marker-end="url(#arrRet)"/>
  <rect x="655" y="525" width="135" height="18" rx="4" fill="#fff1f2" stroke="#fecdd3" stroke-width="1"/>
  <text x="722" y="537" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#9f1239" text-anchor="middle">Metered SKU Rate Query</text>

  <path d="M 800 620 C 710 615, 645 565, 575 510" fill="none" stroke="#e11d48" stroke-width="2" marker-end="url(#arrRet)"/>
  <rect x="655" y="575" width="135" height="18" rx="4" fill="#fff1f2" stroke="#fecdd3" stroke-width="1"/>
  <text x="722" y="587" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#9f1239" text-anchor="middle">Retail Price Rate Records</text>

  <!-- Legend Bottom -->
  <rect x="40" y="690" width="${width - 80}" height="32" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <text x="${width / 2}" y="710" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#475569" text-anchor="middle">DFD Level 0 Convention: Circles represent processes (0.0 Central System), rounded rectangles represent external human and cloud entities, and arrows denote directional data flows.</text>
</svg>`;
}

// -------------------------------------------------------------
// FIGURE 8: Data Flow Diagram Level 1 (System Decomposition)
// -------------------------------------------------------------
function generateFigure8DFDLevel1SVG() {
  const width = 1200;
  const height = 900;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="dShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.08"/>
    </filter>
    <marker id="flowArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <polygon points="0 0, 7 3, 0 6" fill="#334155"/>
    </marker>
    <marker id="blueArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <polygon points="0 0, 7 3, 0 6" fill="#2563eb"/>
    </marker>
    <marker id="greenArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <polygon points="0 0, 7 3, 0 6" fill="#059669"/>
    </marker>
    <marker id="purpleArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <polygon points="0 0, 7 3, 0 6" fill="#7c3aed"/>
    </marker>
    <marker id="amberArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <polygon points="0 0, 7 3, 0 6" fill="#d97706"/>
    </marker>
  </defs>

  <rect width="${width}" height="${height}" fill="#ffffff"/>

  <!-- Title Banner -->
  <rect x="40" y="15" width="${width - 80}" height="32" rx="6" fill="#0f172a"/>
  <text x="${width / 2}" y="36" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="1">DATA FLOW DIAGRAM: LEVEL 1 SYSTEM DECOMPOSITION</text>

  <!-- External Entities -->
  <!-- Entity 1: DevOps Professional (Top Left) -->
  <g filter="url(#dShadow)">
    <rect x="40" y="65" width="200" height="70" rx="8" fill="#f8fafc" stroke="#475569" stroke-width="1.8"/>
    <text x="140" y="92" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#1e293b" text-anchor="middle">EXTERNAL ENTITY</text>
    <text x="140" y="112" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#2563eb" text-anchor="middle">DevOps Professional</text>
    <text x="140" y="126" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#64748b" text-anchor="middle">User / Evaluator</text>
  </g>

  <!-- Entity 2: Azure Resource Graph (Top Right) -->
  <g filter="url(#dShadow)">
    <rect x="960" y="65" width="200" height="70" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.8"/>
    <text x="1060" y="92" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#14532d" text-anchor="middle">EXTERNAL CLOUD</text>
    <text x="1060" y="112" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12.5" font-weight="700" fill="#15803d" text-anchor="middle">Azure Resource Graph</text>
    <text x="1060" y="126" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#166534" text-anchor="middle">Live Cloud Subscriptions</text>
  </g>

  <!-- Entity 3: Infracost and Retail APIs (Bottom Left) -->
  <g filter="url(#dShadow)">
    <rect x="40" y="780" width="210" height="75" rx="8" fill="#fffbeb" stroke="#d97706" stroke-width="1.8"/>
    <text x="145" y="805" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#78350f" text-anchor="middle">EXTERNAL SERVICES</text>
    <text x="145" y="825" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12.5" font-weight="700" fill="#b45309" text-anchor="middle">Infracost &amp; Retail APIs</text>
    <text x="145" y="842" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#92400e" text-anchor="middle">Cost &amp; Meter Pricing Engines</text>
  </g>

  <!-- Entity 4: Azure OpenAI Service (Bottom Right) -->
  <g filter="url(#dShadow)">
    <rect x="960" y="780" width="200" height="75" rx="8" fill="#faf5ff" stroke="#7c3aed" stroke-width="1.8"/>
    <text x="1060" y="805" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#4c1d95" text-anchor="middle">EXTERNAL AI PLATFORM</text>
    <text x="1060" y="825" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12.5" font-weight="700" fill="#6d28d9" text-anchor="middle">Azure OpenAI (GPT-4o)</text>
    <text x="1060" y="842" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9.5" fill="#5b21b6" text-anchor="middle">Architecture Synthesis</text>
  </g>

  <!-- ================= 6 CORE PROCESSES ================= -->

  <!-- Process 1.0: Visual Modeling and State Sync -->
  <g filter="url(#dShadow)">
    <circle cx="210" cy="240" r="65" fill="#eff6ff" stroke="#2563eb" stroke-width="2.2"/>
    <text x="210" y="215" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#2563eb" text-anchor="middle">1.0</text>
    <text x="210" y="235" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#1e3a8a" text-anchor="middle">Visual Modeling</text>
    <text x="210" y="250" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#1e3a8a" text-anchor="middle">&amp; State Sync</text>
    <text x="210" y="268" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" fill="#475569" text-anchor="middle">React Flow &amp; Zustand</text>
  </g>

  <!-- Process 2.0: Canonical IR Compilation and AST -->
  <g filter="url(#dShadow)">
    <circle cx="600" cy="180" r="65" fill="#eff6ff" stroke="#2563eb" stroke-width="2.2"/>
    <text x="600" y="155" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#2563eb" text-anchor="middle">2.0</text>
    <text x="600" y="175" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#1e3a8a" text-anchor="middle">Canonical IR</text>
    <text x="600" y="190" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#1e3a8a" text-anchor="middle">Compilation &amp; AST</text>
    <text x="600" y="208" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" fill="#475569" text-anchor="middle">python-hcl2 &amp; Jinja2</text>
  </g>

  <!-- Process 3.0: Multi-Source Reverse Engineering -->
  <g filter="url(#dShadow)">
    <circle cx="980" cy="240" r="65" fill="#eff6ff" stroke="#2563eb" stroke-width="2.2"/>
    <text x="980" y="215" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#2563eb" text-anchor="middle">3.0</text>
    <text x="980" y="235" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#1e3a8a" text-anchor="middle">Multi-Source</text>
    <text x="980" y="250" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#1e3a8a" text-anchor="middle">Reverse Eng.</text>
    <text x="980" y="268" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" fill="#475569" text-anchor="middle">Files &amp; Azure Graph</text>
  </g>

  <!-- Process 4.0: Policy-as-Code and Blast Radius -->
  <g filter="url(#dShadow)">
    <circle cx="230" cy="560" r="65" fill="#faf5ff" stroke="#7c3aed" stroke-width="2.2"/>
    <text x="230" y="535" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#7c3aed" text-anchor="middle">4.0</text>
    <text x="230" y="555" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#4c1d95" text-anchor="middle">Policy-as-Code &amp;</text>
    <text x="230" y="570" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#4c1d95" text-anchor="middle">Blast Radius</text>
    <text x="230" y="588" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" fill="#6d28d9" text-anchor="middle">Checkov &amp; NetworkX</text>
  </g>

  <!-- Process 5.0: FinOps Cost Calculation -->
  <g filter="url(#dShadow)">
    <circle cx="600" cy="620" r="65" fill="#fffbeb" stroke="#d97706" stroke-width="2.2"/>
    <text x="600" y="595" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#d97706" text-anchor="middle">5.0</text>
    <text x="600" y="615" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#78350f" text-anchor="middle">FinOps Cost</text>
    <text x="600" y="630" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#78350f" text-anchor="middle">Calculation</text>
    <text x="600" y="648" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" fill="#92400e" text-anchor="middle">Infracost &amp; Retail DB</text>
  </g>

  <!-- Process 6.0: AI Architecture Copilot -->
  <g filter="url(#dShadow)">
    <circle cx="950" cy="560" r="65" fill="#ecfdf5" stroke="#059669" stroke-width="2.2"/>
    <text x="950" y="535" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#059669" text-anchor="middle">6.0</text>
    <text x="950" y="555" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#065f46" text-anchor="middle">AI Architecture</text>
    <text x="950" y="570" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#065f46" text-anchor="middle">Copilot</text>
    <text x="950" y="588" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" fill="#047857" text-anchor="middle">GPT-4o &amp; Patch Engine</text>
  </g>

  <!-- ================= 4 DATA STORES (DS1 - DS4) ================= -->

  <!-- DS1: Canonical IR State Store (Center) -->
  <g filter="url(#dShadow)">
    <line x1="470" y1="360" x2="730" y2="360" stroke="#0f172a" stroke-width="2"/>
    <line x1="470" y1="415" x2="730" y2="415" stroke="#0f172a" stroke-width="2"/>
    <line x1="470" y1="360" x2="470" y2="415" stroke="#0f172a" stroke-width="2"/>
    <rect x="472" y="362" width="256" height="51" fill="#f8fafc"/>
    <rect x="475" y="365" width="45" height="45" fill="#1e293b" rx="4"/>
    <text x="497" y="392" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">DS1</text>
    <text x="530" y="385" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Canonical IR State Store</text>
    <text x="530" y="401" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" fill="#64748b">Zustand &amp; Active Topology Graph</text>
  </g>

  <!-- DS2: Azure Resource Catalog and Templates (Middle Left) -->
  <g filter="url(#dShadow)">
    <line x1="120" y1="375" x2="330" y2="375" stroke="#0f172a" stroke-width="2"/>
    <line x1="120" y1="425" x2="330" y2="425" stroke="#0f172a" stroke-width="2"/>
    <line x1="120" y1="375" x2="120" y2="425" stroke="#0f172a" stroke-width="2"/>
    <rect x="122" y="377" width="206" height="46" fill="#f8fafc"/>
    <rect x="125" y="380" width="40" height="40" fill="#1e293b" rx="4"/>
    <text x="145" y="405" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">DS2</text>
    <text x="175" y="397" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#0f172a">Azure Resource Catalog</text>
    <text x="175" y="413" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" fill="#64748b">Jinja2 Modular Emitter Templates</text>
  </g>

  <!-- DS3: CIS Compliance Rule Repository (Bottom Left) -->
  <g filter="url(#dShadow)">
    <line x1="120" y1="695" x2="350" y2="695" stroke="#0f172a" stroke-width="2"/>
    <line x1="120" y1="745" x2="350" y2="745" stroke="#0f172a" stroke-width="2"/>
    <line x1="120" y1="695" x2="120" y2="745" stroke="#0f172a" stroke-width="2"/>
    <rect x="122" y="697" width="226" height="46" fill="#f8fafc"/>
    <rect x="125" y="700" width="40" height="40" fill="#581c87" rx="4"/>
    <text x="145" y="725" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">DS3</text>
    <text x="175" y="717" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#0f172a">CIS Compliance Rules</text>
    <text x="175" y="733" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" fill="#64748b">Checkov Azure Foundations Benchmark</text>
  </g>

  <!-- DS4: Pricing Cache and Rate DB (Bottom Center) -->
  <g filter="url(#dShadow)">
    <line x1="470" y1="735" x2="720" y2="735" stroke="#0f172a" stroke-width="2"/>
    <line x1="470" y1="785" x2="720" y2="785" stroke="#0f172a" stroke-width="2"/>
    <line x1="470" y1="735" x2="470" y2="785" stroke="#0f172a" stroke-width="2"/>
    <rect x="472" y="737" width="246" height="46" fill="#f8fafc"/>
    <rect x="475" y="740" width="40" height="40" fill="#78350f" rx="4"/>
    <text x="495" y="765" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#ffffff" text-anchor="middle">DS4</text>
    <text x="525" y="757" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#0f172a">Pricing Cache &amp; Rate DB</text>
    <text x="525" y="773" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="9" fill="#64748b">Infracost &amp; Azure Retail Local Cache</text>
  </g>

  <!-- ================= DATA FLOW PATHWAYS ================= -->

  <!-- User to P1 (Visual Modeling) -->
  <path d="M 170 135 L 190 175" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#blueArr)"/>
  <path d="M 150 175 L 130 135" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#blueArr)"/>
  <text x="110" y="160" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#1e40af">Canvas Edits</text>

  <!-- P1 to DS1 (Canonical IR) -->
  <path d="M 275 255 C 360 275, 420 330, 480 365" fill="none" stroke="#334155" stroke-width="1.8" marker-end="url(#flowArr)"/>
  <path d="M 480 380 C 420 355, 350 300, 275 270" fill="none" stroke="#334155" stroke-width="1.8" marker-end="url(#flowArr)"/>
  <text x="350" y="315" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#334155">Read/Write Topology</text>

  <!-- P1 to P2 (Canonical IR Payload) -->
  <path d="M 270 215 C 360 170, 450 165, 535 175" fill="none" stroke="#2563eb" stroke-width="1.8" marker-end="url(#blueArr)"/>
  <text x="380" y="180" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#2563eb">IR Payload</text>

  <!-- P2 to P1 (Emitted HCL and AST) -->
  <path d="M 540 195 C 450 205, 360 215, 275 230" fill="none" stroke="#2563eb" stroke-width="1.8" marker-end="url(#blueArr)"/>
  <text x="380" y="222" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#2563eb">Emitted HCL &amp; AST</text>

  <!-- P2 to DS2 (Templates) -->
  <path d="M 545 210 C 460 250, 360 310, 280 375" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#flowArr)"/>
  <text x="420" y="275" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" fill="#475569">Emitter Templates</text>

  <!-- User / ARG to P3 (Reverse Eng) -->
  <path d="M 1030 135 L 1005 178" fill="none" stroke="#059669" stroke-width="2" marker-end="url(#greenArr)"/>
  <text x="1040" y="160" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#059669">Live Query JSON</text>

  <path d="M 240 95 C 450 60, 750 80, 930 195" fill="none" stroke="#334155" stroke-width="1.8" marker-end="url(#flowArr)"/>
  <text x="600" y="80" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#334155">Upload .tf / .tfstate</text>

  <!-- P3 to DS1 (Reconstructed IR) -->
  <path d="M 925 270 C 850 310, 780 345, 715 365" fill="none" stroke="#334155" stroke-width="1.8" marker-end="url(#flowArr)"/>
  <text x="825" y="325" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#334155">Reconstructed IR</text>

  <!-- DS1 to P4 (Topology Payload) -->
  <path d="M 485 415 C 400 450, 320 500, 280 525" fill="none" stroke="#7c3aed" stroke-width="1.8" marker-end="url(#purpleArr)"/>
  <text x="350" y="465" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#7c3aed">Topology Graph</text>

  <!-- P4 to DS3 (CIS Rules) -->
  <path d="M 230 625 L 230 690" fill="none" stroke="#7c3aed" stroke-width="1.8" marker-end="url(#purpleArr)"/>
  <text x="235" y="660" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#7c3aed">CIS Rules</text>

  <!-- P4 to P1 (Compliance Badges and Blast Radius) -->
  <path d="M 215 495 L 210 305" fill="none" stroke="#7c3aed" stroke-width="1.8" marker-end="url(#purpleArr)"/>
  <text x="130" y="470" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#7c3aed">CIS Badges &amp; Blast Radius</text>

  <!-- P4 to P6 (Security Violations) -->
  <path d="M 295 565 C 480 570, 720 570, 885 565" fill="none" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4,4" marker-end="url(#purpleArr)"/>
  <text x="540" y="555" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#7c3aed">Security Violations Context</text>

  <!-- DS1 to P5 (Resource Spec) -->
  <path d="M 600 418 L 600 555" fill="none" stroke="#d97706" stroke-width="1.8" marker-end="url(#amberArr)"/>
  <text x="605" y="485" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#d97706">Resource SKUs</text>

  <!-- P5 to DS4 (Pricing Cache) -->
  <path d="M 600 685 L 600 730" fill="none" stroke="#d97706" stroke-width="1.8" marker-end="url(#amberArr)"/>
  <text x="605" y="710" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#d97706">Rate Cards</text>

  <!-- P5 to InfraAPI -->
  <path d="M 535 645 C 380 680, 260 730, 210 780" fill="none" stroke="#d97706" stroke-width="1.8" marker-end="url(#amberArr)"/>
  <text x="320" y="735" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#d97706">Live Price Queries</text>

  <!-- P5 to P1 (Cost Badges) -->
  <path d="M 545 595 C 400 520, 310 400, 245 295" fill="none" stroke="#d97706" stroke-width="1.8" marker-end="url(#amberArr)"/>
  <text x="330" y="430" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#d97706">Cost Badges &amp; Totals</text>

  <!-- P6 to AOAI -->
  <path d="M 985 620 L 1025 780" fill="none" stroke="#059669" stroke-width="2" marker-end="url(#greenArr)"/>
  <path d="M 1045 780 L 1005 620" fill="none" stroke="#059669" stroke-width="2" marker-end="url(#greenArr)"/>
  <text x="1035" y="700" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#059669">Prompts &amp; IR JSON</text>

  <!-- P6 to DS1 (Synthesized Nodes and Patches) -->
  <path d="M 890 535 C 800 480, 750 440, 715 415" fill="none" stroke="#059669" stroke-width="1.8" marker-end="url(#greenArr)"/>
  <text x="790" y="475" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="8.5" font-weight="700" fill="#059669">Synthesized Nodes</text>

  <!-- Bottom Legend -->
  <rect x="40" y="865" width="${width - 80}" height="25" rx="4" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <text x="${width / 2}" y="882" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10" font-weight="600" fill="#475569" text-anchor="middle">DFD Level 1 Legend: 6 Process Bubbles (1.0 to 6.0) • 4 Persistent Data Stores (DS1 to DS4) • 4 External Entities • Bidirectional and Unidirectional Data Flow Pathways</text>
</svg>`;
}

// -------------------------------------------------------------
// FIGURE 10: Agile Method (Circular Continuous Cycle)
// -------------------------------------------------------------
function generateFigure10AgileMethodSVG() {
  const width = 1000;
  const height = 860;
  const cx = 500;
  const cy = 430;
  const rCircle = 320;

  const phases = [
    {
      num: '1',
      title: 'Planning & Backlog',
      sub: ['• Define sprint objectives', '• Groom & prioritize backlog', '• Capacity & risk assessment'],
      angleDeg: -90,
      color: '#1e40af',
      accent: '#3b82f6',
      bg: '#eff6ff',
    },
    {
      num: '2',
      title: 'Requirements Analysis',
      sub: ['• Canonical IR schemas', '• Azure resource definitions', '• Practitioner user stories'],
      angleDeg: -30,
      color: '#0e7490',
      accent: '#06b6d4',
      bg: '#ecfeff',
    },
    {
      num: '3',
      title: 'Architecture & Design',
      sub: ['• Visual canvas data contract', '• Bidirectional AST model', '• Security & FinOps pipelines'],
      angleDeg: 30,
      color: '#4338ca',
      accent: '#6366f1',
      bg: '#eef2ff',
    },
    {
      num: '4',
      title: 'Implementation & Coding',
      sub: ['• React Flow visual cards', '• FastAPI compiler services', '• Checkov & GPT-4o engine'],
      angleDeg: 90,
      color: '#047857',
      accent: '#10b981',
      bg: '#ecfdf5',
    },
    {
      num: '5',
      title: 'Testing & Verification',
      sub: ['• Automated Pytest suites', '• Lossless AST roundtrip tests', '• Policy compliance scans'],
      angleDeg: 150,
      color: '#b45309',
      accent: '#f59e0b',
      bg: '#fffbeb',
    },
    {
      num: '6',
      title: 'Review & Retrospective',
      sub: ['• Working software demo', '• Milestone acceptance', '• Process adaptation & lessons'],
      angleDeg: 210,
      color: '#be123c',
      accent: '#f43f5e',
      bg: '#fff1f2',
    },
  ];

  let nodesSVG = '';
  let arrowsSVG = '';

  phases.forEach((p, idx) => {
    const rad = (p.angleDeg * Math.PI) / 180;
    const nx = cx + rCircle * Math.cos(rad);
    const ny = cy + rCircle * Math.sin(rad);

    const nextIdx = (idx + 1) % phases.length;
    const nextAngle = (phases[nextIdx].angleDeg * Math.PI) / 180;
    const startArcAngle = rad + 0.32;
    const endArcAngle = nextAngle - 0.32;

    const ax1 = cx + (rCircle + 8) * Math.cos(startArcAngle);
    const ay1 = cy + (rCircle + 8) * Math.sin(startArcAngle);
    const ax2 = cx + (rCircle + 8) * Math.cos(endArcAngle);
    const ay2 = cy + (rCircle + 8) * Math.sin(endArcAngle);

    arrowsSVG += `
      <path d="M ${ax1} ${ay1} A ${rCircle + 8} ${rCircle + 8} 0 0 1 ${ax2} ${ay2}" 
            fill="none" stroke="${p.accent}" stroke-width="3.5" stroke-dasharray="6,4"
            marker-end="url(#arrow-${p.num})"/>
    `;

    const cardW = 210;
    const cardH = 110;
    const cardX = nx - cardW / 2;
    const cardY = ny - cardH / 2;

    let subText = '';
    p.sub.forEach((line, lIdx) => {
      subText += `<text x="${cardX + 16}" y="${cardY + 54 + lIdx * 17}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="10.5" fill="#334155">${escapeXml(line)}</text>`;
    });

    nodesSVG += `
      <g filter="url(#nodeShadow)">
        <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="12" 
              fill="${p.bg}" stroke="${p.color}" stroke-width="2"/>
        <circle cx="${cardX + 22}" cy="${cardY + 22}" r="14" fill="${p.color}"/>
        <text x="${cardX + 22}" y="${cardY + 27}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="middle">${p.num}</text>
        <text x="${cardX + 44}" y="${cardY + 27}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12.5" font-weight="700" fill="${p.color}">${escapeXml(p.title)}</text>
        <line x1="${cardX + 14}" y1="${cardY + 38}" x2="${cardX + cardW - 14}" y2="${cardY + 38}" stroke="${p.accent}" stroke-width="1.2" stroke-opacity="0.4"/>
        ${subText}
      </g>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="nodeShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
    <filter id="centerShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#1e3a8a" flood-opacity="0.25"/>
    </filter>
    <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    ${phases
      .map(
        (p) => `
      <marker id="arrow-${p.num}" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="${p.accent}" />
      </marker>`
      )
      .join('')}
  </defs>

  <rect width="${width}" height="${height}" fill="#ffffff"/>
  <circle cx="${cx}" cy="${cy}" r="${rCircle}" fill="none" stroke="#e2e8f0" stroke-width="2"/>
  ${arrowsSVG}

  <g filter="url(#centerShadow)">
    <circle cx="${cx}" cy="${cy}" r="115" fill="url(#centerGrad)" stroke="#38bdf8" stroke-width="3"/>
    <circle cx="${cx}" cy="${cy}" r="105" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="${cx}" y="${cy - 35}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle" letter-spacing="1.5">CONTINUOUS CYCLE</text>
    <text x="${cx}" y="${cy - 8}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">AGILE SPRINT</text>
    <text x="${cx}" y="${cy + 16}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#94a3b8" text-anchor="middle">2-Week Iterations</text>
    <rect x="${cx - 75}" y="${cy + 34}" width="150" height="24" rx="12" fill="#1e3a8a" stroke="#60a5fa" stroke-width="1"/>
    <text x="${cx}" y="${cy + 50}" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#bfdbfe" text-anchor="middle">5 Sprints • 10 Weeks Total</text>
  </g>

  ${nodesSVG}
</svg>`;
}

// -------------------------------------------------------------
// FIGURE 12: Distribution of Respondents by Professional Experience
// -------------------------------------------------------------
function generateFigure12RespondentDistributionSVG() {
  const width = 850;
  const height = 480;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="barShadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.1"/>
    </filter>
  </defs>

  <rect width="${width}" height="${height}" fill="#ffffff"/>

  <text x="425" y="45" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#0f172a" text-anchor="middle">DISTRIBUTION OF RESPONDENTS BY PROFESSIONAL EXPERIENCE</text>
  <text x="425" y="70" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#64748b" text-anchor="middle">Total Sample Size: N = 20 Cloud Infrastructure Engineers &amp; DevOps Professionals</text>

  <g transform="translate(180, 110)">
    <line x1="0" y1="0" x2="0" y2="240" stroke="#cbd5e1" stroke-width="1.5"/>
    <line x1="0" y1="240" x2="560" y2="240" stroke="#cbd5e1" stroke-width="1.5"/>

    <line x1="112" y1="0" x2="112" y2="240" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4,4"/>
    <line x1="224" y1="0" x2="224" y2="240" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4,4"/>
    <line x1="336" y1="0" x2="336" y2="240" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4,4"/>
    <line x1="448" y1="0" x2="448" y2="240" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4,4"/>
    <line x1="560" y1="0" x2="560" y2="240" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4,4"/>

    <text x="0" y="260" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">0%</text>
    <text x="112" y="260" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">10%</text>
    <text x="224" y="260" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">20%</text>
    <text x="336" y="260" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">30%</text>
    <text x="448" y="260" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">40%</text>
    <text x="560" y="260" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11" fill="#64748b" text-anchor="middle">50%</text>

    <!-- BAR 1: 3 to 5 years (7, 35.0%) -->
    <g filter="url(#barShadow)">
      <text x="-15" y="45" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#1e293b" text-anchor="end">3 to 5 years</text>
      <rect x="0" y="20" width="392" height="42" rx="6" fill="#3b82f6"/>
      <text x="375" y="46" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="end">35.00% (n = 7)</text>
    </g>

    <!-- BAR 2: 6 to 10 years (8, 40.0%) -->
    <g filter="url(#barShadow)">
      <text x="-15" y="115" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#1e293b" text-anchor="end">6 to 10 years</text>
      <rect x="0" y="90" width="448" height="42" rx="6" fill="#1d4ed8"/>
      <text x="431" y="116" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="end">40.00% (n = 8)</text>
    </g>

    <!-- BAR 3: More than 10 years (5, 25.0%) -->
    <g filter="url(#barShadow)">
      <text x="-15" y="185" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#1e293b" text-anchor="end">More than 10 years</text>
      <rect x="0" y="160" width="280" height="42" rx="6" fill="#60a5fa"/>
      <text x="263" y="186" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" fill="#ffffff" text-anchor="end">25.00% (n = 5)</text>
    </g>
  </g>

  <!-- Summary Card -->
  <rect x="230" y="390" width="390" height="36" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
  <text x="425" y="413" font-family="Inter, system-ui, -apple-system, sans-serif" font-size="11.5" font-weight="600" fill="#334155" text-anchor="middle">100% of participants meet the minimum 3-year enterprise cloud criterion</text>
</svg>`;
}

// -------------------------------------------------------------
// MAIN EXECUTION
// -------------------------------------------------------------
async function main() {
  console.log('Generating SVG figures...');
  const fig1SVG = generateFigure1ConceptualFrameworkSVG();
  const fig2SVG = generateFigure2ProjectScheduleSVG();
  const fig3SVG = generateFigure3WorkBreakdownStructureSVG();
  const fig4SVG = generateFigure4SystemArchitectureSVG();
  const fig5SVG = generateFigure5UseCaseDiagramSVG();
  const fig7SVG = generateFigure7DFDLevel0SVG();
  const fig8SVG = generateFigure8DFDLevel1SVG();
  const fig10SVG = generateFigure10AgileMethodSVG();
  const fig12SVG = generateFigure12RespondentDistributionSVG();

  const files = [
    { name: 'figure-1-conceptual-framework', svg: fig1SVG, width: 1100, height: 710 },
    { name: 'figure-2-project-schedule', svg: fig2SVG, width: 1200, height: 780 },
    { name: 'figure-3-work-breakdown-structure', svg: fig3SVG, width: 1200, height: 820 },
    { name: 'figure-4-system-architecture', svg: fig4SVG, width: 1100, height: 980 },
    { name: 'figure-5-use-case-diagram', svg: fig5SVG, width: 1120, height: 740 },
    { name: 'figure-7-dfd-level-0', svg: fig7SVG, width: 1140, height: 740 },
    { name: 'figure-8-dfd-level-1', svg: fig8SVG, width: 1200, height: 900 },
    { name: 'figure-10-agile-method', svg: fig10SVG, width: 1000, height: 860 },
    { name: 'figure-12-respondent-distribution', svg: fig12SVG, width: 850, height: 480 },
  ];

  for (const f of files) {
    const svgPath = path.join(outputDir, `${f.name}.svg`);
    fs.writeFileSync(svgPath, f.svg, 'utf8');
    console.log(`Saved: ${svgPath}`);
  }

  console.log('Launching headless Chrome to render 300-DPI PNGs...');
  const chromePath = getChromePath();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  for (const f of files) {
    console.log(`Rendering PNG for ${f.name}...`);
    await page.setViewport({
      width: f.width,
      height: f.height,
      deviceScaleFactor: 2,
    });

    const svgPath = path.join(outputDir, `${f.name}.svg`);
    const pngPath = path.join(outputDir, `${f.name}.png`);
    const fileUrl = `file://${svgPath}`;

    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    await page.screenshot({
      path: pngPath,
      omitBackground: false,
    });
    console.log(`Rendered: ${pngPath}`);
  }

  await browser.close();

  // Clean up old legacy file names if present
  const legacyFiles = [
    'figure-1-agile-method.svg',
    'figure-1-agile-method.png',
    'figure-2-conceptual-framework.svg',
    'figure-2-conceptual-framework.png',
    'figure-3-system-architecture.svg',
    'figure-3-system-architecture.png',
    'figure-4-use-case-diagram.svg',
    'figure-4-use-case-diagram.png',
    'figure-8-respondent-distribution.svg',
    'figure-8-respondent-distribution.png',
  ];
  for (const legacy of legacyFiles) {
    const p = path.join(outputDir, legacy);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`Removed obsolete legacy file: ${legacy}`);
    }
  }

  console.log('All figures generated successfully in manuscripts/figures/ with updated numbering!');
}

main().catch((err) => {
  console.error('Error generating figures:', err);
  process.exit(1);
});
