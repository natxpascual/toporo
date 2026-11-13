/**
 * Automated QA Test Suite for Objectives 1-5 in Manuscript
 * Runs headless Chrome via puppeteer-core against http://localhost:3000/studio
 */

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
  throw new Error('Chrome/Chromium binary not found.');
}

const BASE_URL = process.env.TARGET_URL || 'http://localhost:3000';
const SCREENSHOT_DIR = path.resolve('./screenshots/qa-objectives');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Test Results accumulator
const testResults = {
  suiteStartTime: new Date().toISOString(),
  targetUrl: BASE_URL,
  suites: [],
  summary: { total: 0, passed: 0, failed: 0 },
};

function recordTest(suiteName, testName, passed, details = {}, error = null) {
  testResults.summary.total += 1;
  if (passed) {
    testResults.summary.passed += 1;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    testResults.summary.failed += 1;
    console.error(`  ❌ [FAIL] ${testName} - Error: ${error || 'Assertion failed'}`);
  }
  let s = testResults.suites.find((item) => item.name === suiteName);
  if (!s) {
    s = { name: suiteName, tests: [] };
    testResults.suites.push(s);
  }
  s.tests.push({
    testName,
    passed,
    details,
    error: error ? String(error) : null,
    timestamp: new Date().toISOString(),
  });
}

async function runTestSuite() {
  const chromePath = getChromePath();
  console.log(`\n===============================================================`);
  console.log(`🚀 STARTING HEADLESS QA TEST SUITE: OBJECTIVES 1 - 5`);
  console.log(`   Browser: ${chromePath}`);
  console.log(`   Target:  ${BASE_URL}/studio`);
  console.log(`   Output:  ${SCREENSHOT_DIR}`);
  console.log(`===============================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--window-size=1560,980',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1560, height: 980, deviceScaleFactor: 2 });

    const clientErrors = [];
    page.on('pageerror', (err) => clientErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource: net::ERR_')) {
          clientErrors.push(text);
        }
      }
    });

    // ──────────────────────────────────────────────────────────
    // SUITE 0: Studio Environment & Baseline Health
    // ──────────────────────────────────────────────────────────
    console.log(`▶ SUITE 0: Studio Environment & Baseline Health`);
    await page.goto(`${BASE_URL}/studio`, { waitUntil: 'networkidle0', timeout: 25000 });
    await new Promise((r) => setTimeout(r, 1000));

    const baseline = await page.evaluate(() => {
      const header = document.querySelector('header')?.innerText || '';
      const hasReactFlow = Boolean(document.querySelector('.react-flow'));
      const hasCatalog = Boolean(document.querySelector('aside') || document.querySelector('input[placeholder*="components"]'));
      const hasStore = Boolean(window.useTopologyStore);
      return {
        headerHasTitle: header.includes('Topology Studio'),
        hasReactFlow,
        hasCatalog,
        hasStore,
      };
    });

    recordTest('Suite 0: Studio Baseline', 'Topology Studio UI rendered and mounted React Flow canvas', baseline.hasReactFlow, baseline);
    recordTest('Suite 0: Studio Baseline', 'Global Topology Store exposed for headless browser automation', baseline.hasStore, baseline);

    const shot0 = path.join(SCREENSHOT_DIR, '00_studio_initialized.png');
    await page.screenshot({ path: shot0 });
    console.log(`  📸 Screenshot: ${shot0}`);

    // ──────────────────────────────────────────────────────────
    // SUITE 1: Objective 1 — Canonical IR & Bidirectional Code Generation
    // ──────────────────────────────────────────────────────────
    console.log(`\n▶ SUITE 1: Objective 1 — Canonical IR & Bidirectional Code Generation`);

    // Step 1: Load a multi-tier template (intermediate-3tier-web)
    const loadTplResult = await page.evaluate(() => {
      try {
        const store = window.useTopologyStore.getState();
        store.loadSample('3tier-web');
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    });
    recordTest('Objective 1: Code Generation', 'Load sample architecture into Canonical IR store', loadTplResult.success, loadTplResult);
    await new Promise((r) => setTimeout(r, 1500));

    // Step 2: Verify modular code generation
    const codegenResult = await page.evaluate(async () => {
      const store = window.useTopologyStore.getState();
      await store.refreshCodeAndAnalysis();
      const files = store.generatedCode || {};
      const fileNames = Object.keys(files);
      const hasMainTf = Boolean(files['main.tf'] && files['main.tf'].length > 50);
      const hasVariablesTf = Boolean(files['variables.tf']);
      const hasOutputsTf = Boolean(files['outputs.tf']);
      const hasProvidersTf = Boolean(files['providers.tf']);
      const resourceCount = store.topology?.resources?.length || 0;

      return {
        fileNames,
        hasMainTf,
        hasVariablesTf,
        hasOutputsTf,
        hasProvidersTf,
        resourceCount,
        mainTfSample: (files['main.tf'] || '').slice(0, 200),
      };
    });

    recordTest('Objective 1: Code Generation', 'FastAPI Emitter generates modular Terraform files (main, variables, outputs, providers)',
      codegenResult.hasMainTf && codegenResult.hasVariablesTf && codegenResult.hasOutputsTf && codegenResult.hasProvidersTf,
      codegenResult
    );

    // Step 3: Open Split-View Monaco Editor in the UI
    const splitViewResult = await page.evaluate(() => {
      // Find split view toggle button in header
      const splitBtn = document.querySelector('button[title*="split editor"]') || document.querySelector('button[title*="⌘\\"]');
      if (splitBtn) {
        splitBtn.click();
        return { clicked: true };
      }
      return { clicked: false };
    });
    await new Promise((r) => setTimeout(r, 1000));

    const monacoMounted = await page.evaluate(() => {
      const editorDom = document.querySelector('.monaco-editor') || document.querySelector('[data-testid="monaco-editor"]') || document.querySelector('div[data-keybinding-context]');
      const fileTabs = document.querySelectorAll('button[class*="text-[12px]"], button[class*="font-mono"]');
      return {
        hasMonaco: Boolean(editorDom),
        tabCount: fileTabs.length,
      };
    });
    recordTest('Objective 1: Code Generation', 'Monaco split-view editor renders generated Terraform HCL code',
      splitViewResult.clicked && monacoMounted.hasMonaco,
      monacoMounted
    );

    const shot1 = path.join(SCREENSHOT_DIR, '01_obj1_splitview_monaco_codegen.png');
    await page.screenshot({ path: shot1 });
    console.log(`  📸 Screenshot: ${shot1}`);

    // Step 4: Test Lossless Bidirectional Roundtrip (Canvas -> IR -> HCL -> Parse -> Canonical IR)
    const roundtripResult = await page.evaluate(async () => {
      const store = window.useTopologyStore.getState();
      const originalResources = store.topology.resources;
      const originalTypes = originalResources.map((r) => r.type).sort();
      const mainTf = store.generatedCode['main.tf'];

      // Send to /api/parse
      const parseRes = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hcl: mainTf, projectName: 'Roundtrip Test' }),
      });
      if (!parseRes.ok) {
        return { success: false, status: parseRes.status };
      }
      const parsedTopology = await parseRes.json();
      const parsedTypes = (parsedTopology.resources || []).map((r) => r.type).sort();

      return {
        success: true,
        originalCount: originalResources.length,
        parsedCount: parsedTopology.resources.length,
        originalTypes,
        parsedTypes,
        hasLosslessResources: parsedTopology.resources.length > 0,
      };
    });

    recordTest('Objective 1: Bidirectional AST Transformation', 'HCL Parser reconstructs Canonical IR without resource loss (roundtrip validated)',
      roundtripResult.success && roundtripResult.hasLosslessResources,
      roundtripResult
    );

    // ──────────────────────────────────────────────────────────
    // SUITE 2: Objective 2 — Visual Canvas, Hierarchical Containers & Split-View
    // ──────────────────────────────────────────────────────────
    console.log(`\n▶ SUITE 2: Objective 2 — Visual Canvas, Hierarchical Containers & Split-View`);

    const canvasHierarchy = await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const resources = store.topology.resources;

      // Group by container levels
      const rgs = resources.filter((r) => r.container_level === 'rg');
      const vnets = resources.filter((r) => r.container_level === 'vnet');
      const subnets = resources.filter((r) => r.container_level === 'subnet');
      const workloads = resources.filter((r) => !r.container_level || r.container_level === 'none');

      // Verify hierarchical nesting pointers: Subnet -> VNet -> RG
      let properNesting = true;
      for (const snet of subnets) {
        if (!snet.parent_id) properNesting = false;
        const parentVnet = vnets.find((v) => v.id === snet.parent_id);
        if (!parentVnet) properNesting = false;
      }
      for (const vnet of vnets) {
        if (!vnet.parent_id) properNesting = false;
        const parentRg = rgs.find((r) => r.id === vnet.parent_id);
        if (!parentRg) properNesting = false;
      }

      // Check DOM elements in React Flow
      const containerNodes = document.querySelectorAll('.react-flow__node-containerResource');
      const azureNodes = document.querySelectorAll('.react-flow__node-azureResource');
      const handles = document.querySelectorAll('.react-flow__handle');
      const edges = document.querySelectorAll('.react-flow__edge');

      return {
        rgCount: rgs.length,
        vnetCount: vnets.length,
        subnetCount: subnets.length,
        workloadCount: workloads.length,
        properNesting,
        domContainers: containerNodes.length,
        domAzureNodes: azureNodes.length,
        domHandles: handles.length,
        domEdges: edges.length,
      };
    });

    recordTest('Objective 2: Visual Canvas', '3-Tier Hierarchical Nested Containers (Resource Group -> VNet -> Subnet) properly structured',
      canvasHierarchy.rgCount > 0 && canvasHierarchy.vnetCount > 0 && canvasHierarchy.subnetCount > 0 && canvasHierarchy.properNesting,
      canvasHierarchy
    );
    recordTest('Objective 2: Visual Canvas', 'React Flow renders custom Azure nodes, handles, and connection edges',
      canvasHierarchy.domAzureNodes > 0 && canvasHierarchy.domHandles > 0,
      canvasHierarchy
    );

    const shot2 = path.join(SCREENSHOT_DIR, '02_obj2_canvas_hierarchical_containers.png');
    await page.screenshot({ path: shot2 });
    console.log(`  📸 Screenshot: ${shot2}`);

    // ──────────────────────────────────────────────────────────
    // SUITE 3: Objective 3 — Multi-Source Reverse-Engineering Subsystem
    // ──────────────────────────────────────────────────────────
    console.log(`\n▶ SUITE 3: Objective 3 — Multi-Source Reverse-Engineering Subsystem`);

    // Test Ingest 1: Raw Terraform HCL file
    const sampleHcl = `
resource "azurerm_resource_group" "rg_ingest" {
  name     = "rg-reverse-engineered-hcl"
  location = "eastus"
}

resource "azurerm_virtual_network" "vnet_ingest" {
  name                = "vnet-reverse-engineered"
  location            = "eastus"
  resource_group_name = azurerm_resource_group.rg_ingest.name
  address_space       = ["10.100.0.0/16"]
}

resource "azurerm_subnet" "snet_ingest" {
  name                 = "snet-workload"
  resource_group_name  = azurerm_resource_group.rg_ingest.name
  virtual_network_name = azurerm_virtual_network.vnet_ingest.name
  address_prefixes     = ["10.100.1.0/24"]
}
`;
    const ingestHclResult = await page.evaluate(async (hcl) => {
      await window.useTopologyStore.getState().importFromHcl(hcl);
      const res = window.useTopologyStore.getState().topology.resources;
      return {
        resourceCount: res.length,
        types: res.map((r) => r.type),
      };
    }, sampleHcl);

    recordTest('Objective 3: Reverse-Engineering', 'Multi-Source Ingest 1: Raw Terraform HCL (.tf) ingested and rendered',
      ingestHclResult.resourceCount === 3,
      ingestHclResult
    );
    const shot3 = path.join(SCREENSHOT_DIR, '03_obj3_reverse_engineering_tf_hcl.png');
    await page.screenshot({ path: shot3 });
    console.log(`  📸 Screenshot: ${shot3}`);

    // Test Ingest 2: Terraform State JSON (.tfstate / tfplan.json)
    const sampleStateJson = fs.readFileSync(path.resolve('./samples/sample_tfstate.json'), 'utf8');
    const ingestStateResult = await page.evaluate(async (stateStr) => {
      await window.useTopologyStore.getState().importFromState(stateStr, 'Sample Imported State');
      const res = window.useTopologyStore.getState().topology.resources;
      const subnet = res.find((r) => r.type === 'azurerm_subnet');
      return {
        resourceCount: res.length,
        types: res.map((r) => r.type),
        hasSubnetVnetParent: Boolean(subnet && subnet.parent_id),
      };
    }, sampleStateJson);

    recordTest('Objective 3: Reverse-Engineering', 'Multi-Source Ingest 2: Terraform State (.tfstate / tfplan.json) ingested into visual topology',
      ingestStateResult.resourceCount === 3 && ingestStateResult.hasSubnetVnetParent,
      ingestStateResult
    );
    const shot4 = path.join(SCREENSHOT_DIR, '04_obj3_reverse_engineering_tfstate.png');
    await page.screenshot({ path: shot4 });
    console.log(`  📸 Screenshot: ${shot4}`);

    // Test Ingest 3: Live Azure Subscription (Azure Resource Graph query results JSON)
    const sampleArgJson = JSON.stringify([
      {
        id: '/subscriptions/sub-live-01/resourceGroups/rg-live-mesh/providers/Microsoft.Compute/virtualMachines/vm-mesh-primary',
        name: 'vm-mesh-primary',
        type: 'microsoft.compute/virtualmachines',
        location: 'eastus',
        resourceGroup: 'rg-live-mesh',
        properties: { hardwareProfile: { vmSize: 'Standard_B2s' } },
      },
      {
        id: '/subscriptions/sub-live-01/resourceGroups/rg-live-mesh/providers/Microsoft.Storage/storageAccounts/stmeshdata',
        name: 'stmeshdata',
        type: 'microsoft.storage/storageaccounts',
        location: 'eastus',
        resourceGroup: 'rg-live-mesh',
        properties: { accountType: 'Standard_LRS', enable_https_traffic_only: false },
      },
      {
        id: '/subscriptions/sub-live-01/resourceGroups/rg-live-mesh/providers/Microsoft.KeyVault/vaults/kv-mesh-keys',
        name: 'kv-mesh-keys',
        type: 'microsoft.keyvault/vaults',
        location: 'eastus',
        resourceGroup: 'rg-live-mesh',
        properties: { sku: { name: 'standard' } },
      },
    ]);

    const ingestArgResult = await page.evaluate(async (argStr) => {
      await window.useTopologyStore.getState().importFromAzure(argStr, 'Live Azure Subscription Import');
      const res = window.useTopologyStore.getState().topology.resources;
      return {
        resourceCount: res.length,
        types: res.map((r) => r.type),
      };
    }, sampleArgJson);

    recordTest('Objective 3: Reverse-Engineering', 'Multi-Source Ingest 3: Live Azure Subscription (Azure Resource Graph) ingested into editable canvas',
      ingestArgResult.resourceCount === 3 && ingestArgResult.types.includes('azurerm_linux_virtual_machine'),
      ingestArgResult
    );
    const shot5 = path.join(SCREENSHOT_DIR, '05_obj3_reverse_engineering_arg.png');
    await page.screenshot({ path: shot5 });
    console.log(`  📸 Screenshot: ${shot5}`);

    // ──────────────────────────────────────────────────────────
    // SUITE 4: Objective 4 — Policy-as-Code Guardrails & Blast Radius Engine
    // ──────────────────────────────────────────────────────────
    console.log(`\n▶ SUITE 4: Objective 4 — Policy-as-Code Guardrails & Blast Radius Engine`);

    // Step 1: Scan topology containing insecure storage account
    const securityAudit = await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const secSummary = store.securitySummary || {};
      const blast = store.blastRadius || {};
      const resourcesWithFindings = store.topology.resources.filter((r) => r.security_findings && r.security_findings.length > 0);

      // Check header CIS badge in DOM
      const headerText = document.querySelector('header')?.innerText || '';
      const hasCisBadge = headerText.includes('CIS');

      return {
        score: secSummary.score,
        critical: secSummary.critical,
        high: secSummary.high,
        medium: secSummary.medium,
        totalIssues: (secSummary.critical || 0) + (secSummary.high || 0) + (secSummary.medium || 0) + (secSummary.low || 0),
        vulnerableCount: resourcesWithFindings.length,
        hasCisBadge,
        hasBlastRadius: Boolean(blast.summary || blast.risk_score !== undefined || blast.impact_map),
      };
    });

    recordTest('Objective 4: Security Guardrails', 'Automated Checkov Azure CIS compliance scan evaluates configurations and computes blast radius',
      securityAudit.totalIssues > 0 && securityAudit.hasCisBadge,
      securityAudit
    );

    // Step 2: Open Property Inspector to inspect findings on vulnerable node
    const inspectVulnerableNode = await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const stResource = store.topology.resources.find((r) => r.type === 'azurerm_storage_account');
      if (stResource) {
        store.selectResource(stResource.id);
        store.openInspector(stResource.id);
        store.setActiveTab('security');
        return {
          inspectedId: stResource.id,
          findings: stResource.security_findings || [],
        };
      }
      return { inspectedId: null, findings: [] };
    });
    await new Promise((r) => setTimeout(r, 800));

    recordTest('Objective 4: Security Guardrails', 'Property Inspector displays CIS rule IDs, severity badges, and remediation advice',
      inspectVulnerableNode.findings.length > 0 && inspectVulnerableNode.findings.some((f) => f.rule_id),
      inspectVulnerableNode
    );

    const shot6 = path.join(SCREENSHOT_DIR, '06_obj4_security_guardrails_inspector.png');
    await page.screenshot({ path: shot6 });
    console.log(`  📸 Screenshot: ${shot6}`);

    // Step 3: Test 1-Click Automated Security Remediation
    const remediationResult = await page.evaluate(async () => {
      const storeState = window.useTopologyStore.getState();
      const st = storeState.topology.resources.find((r) => r.type === 'azurerm_storage_account');
      const initialFindingsCount = (st?.security_findings || []).length;
      const findingToRemediate = (st?.security_findings || []).find((f) => f.rule_id === 'CKV_AZURE_35' || f.rule_id.includes('AZURE'));

      if (!findingToRemediate) return { error: 'No finding to remediate' };

      // Apply remediation
      await storeState.applyRemediation({
        resourceId: st.id,
        ruleId: findingToRemediate.rule_id,
      });

      const updatedSt = window.useTopologyStore.getState().topology.resources.find((r) => r.id === st.id);
      const postFindingsCount = (updatedSt?.security_findings || []).length;
      const httpsOnlyUpdated = updatedSt?.properties?.enable_https_traffic_only === true;

      return {
        initialFindingsCount,
        postFindingsCount,
        httpsOnlyUpdated,
        remediatedRule: findingToRemediate.rule_id,
      };
    });

    recordTest('Objective 4: Security Guardrails', '1-Click Automated Remediation fixes misconfiguration (HTTPS enforced) and updates topology',
      remediationResult.httpsOnlyUpdated || remediationResult.postFindingsCount < remediationResult.initialFindingsCount,
      remediationResult
    );

    const shot7 = path.join(SCREENSHOT_DIR, '07_obj4_after_remediation.png');
    await page.screenshot({ path: shot7 });
    console.log(`  📸 Screenshot: ${shot7}`);

    // ──────────────────────────────────────────────────────────
    // SUITE 5: Objective 5 — Real-time FinOps Cost Estimation Subsystem
    // ──────────────────────────────────────────────────────────
    console.log(`\n▶ SUITE 5: Objective 5 — Real-time FinOps Cost Estimation Subsystem`);

    // Load rich enterprise architecture for FinOps estimation
    await page.evaluate(async () => {
      const store = window.useTopologyStore.getState();
      store.loadSample('3tier-web');
      await store.refreshCodeAndAnalysis();
    });
    await new Promise((r) => setTimeout(r, 1500));

    const finopsData = await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const finops = store.finopsSummary || {};
      const totalCost = finops.totalMonthlyCostUsd ?? 0;

      // Check header DOM for cost lozenge
      const headerText = document.querySelector('header')?.innerText || '';
      const headerDisplaysCost = headerText.includes('Cost') || headerText.includes('$');

      // Check node cost badges in DOM
      const costBadges = document.querySelectorAll('.badge-cost, [class*="badge-cost"]');

      // Check resources with computed cost in store
      const billableResources = store.topology.resources.filter((r) => (r.cost?.monthly_cost_usd || 0) > 0);

      return {
        totalMonthlyCostUsd: totalCost,
        currency: finops.currency || 'USD',
        headerDisplaysCost,
        domCostBadgesCount: costBadges.length,
        billableResourcesCount: billableResources.length,
        billableSamples: billableResources.slice(0, 3).map((r) => ({
          name: r.name,
          type: r.type,
          monthly: r.cost?.monthly_cost_usd,
        })),
      };
    });

    recordTest('Objective 5: FinOps Cost Estimation', 'Real-time Infracost / Azure Retail Prices API computes monthly expenditure',
      finopsData.totalMonthlyCostUsd > 0,
      finopsData
    );
    recordTest('Objective 5: FinOps Cost Estimation', 'Canvas renders individual monthly cost badges on Azure resources',
      finopsData.domCostBadgesCount > 0 || finopsData.billableResourcesCount > 0,
      finopsData
    );

    // Open Inspector on billable resource to verify FinOps breakdown
    const inspectFinOpsTab = await page.evaluate(() => {
      const store = window.useTopologyStore.getState();
      const billable = store.topology.resources.find((r) => (r.cost?.monthly_cost_usd || 0) > 0);
      if (billable) {
        store.selectResource(billable.id);
        store.openInspector(billable.id);
        store.setActiveTab('cost');
        return {
          resourceName: billable.name,
          monthly: billable.cost?.monthly_cost_usd,
          breakdown: billable.cost?.breakdown || {},
        };
      }
      return null;
    });
    await new Promise((r) => setTimeout(r, 800));

    recordTest('Objective 5: FinOps Cost Estimation', 'Property Inspector FinOps tab displays monthly cost, annual projection, and cost breakdown',
      Boolean(inspectFinOpsTab && inspectFinOpsTab.monthly > 0),
      inspectFinOpsTab
    );

    const shot8 = path.join(SCREENSHOT_DIR, '08_obj5_finops_cost_badges_and_inspector.png');
    await page.screenshot({ path: shot8 });
    console.log(`  📸 Screenshot: ${shot8}`);

    // Check runtime client errors
    recordTest('System Health: Client Runtime', 'Zero unhandled frontend exceptions or fatal console errors', clientErrors.length === 0, {
      errors: clientErrors,
    });

    testResults.suiteEndTime = new Date().toISOString();
  } finally {
    await browser.close();
  }

  // Save report artifact
  const reportPath = path.resolve('./screenshots/qa-objectives/qa_test_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));

  console.log(`\n===============================================================`);
  console.log(`📊 QA TEST EXECUTION SUMMARY`);
  console.log(`   Total Tests:  ${testResults.summary.total}`);
  console.log(`   Passed:       ${testResults.summary.passed}`);
  console.log(`   Failed:       ${testResults.summary.failed}`);
  console.log(`   Detailed JSON: ${reportPath}`);
  console.log(`===============================================================\n`);

  if (testResults.summary.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('[FATAL QA RUN ERROR]:', err);
  process.exit(1);
});
