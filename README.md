# Azure Cloud Topology Engine
> **An AI-Powered Terraform Visualizer, Checkov Policy Guardrail, and FinOps Copilot for Microsoft Azure**

The **Azure Cloud Topology Engine** is a high-performance visual cloud management and Infrastructure-as-Code (IaC) engineering platform designed specifically for Microsoft Azure and HashiCorp Terraform.

---

## 🌟 Key Features

1. **Visual Drag-and-Drop Canvas (React Flow 12)**:
   - Interactive design canvas with custom Azure glassmorphic node cards, official Azure icons, connection ports, minimap, and nested hierarchical containers (Resource Groups $\to$ Virtual Networks $\to$ Subnets).
2. **Bidirectional Terraform HCL Synchronization (Monaco Editor)**:
   - Real-time two-way synchronization: Moving or configuring visual nodes updates Terraform code instantly; typing in the Monaco code editor updates visual topology nodes.
3. **Policy-as-Code & Security Guardrails (Checkov / Azure CIS)**:
   - Real-time static analysis and CIS compliance checks displaying visual node risk tags (`CRITICAL` / `HIGH` / `MEDIUM` / `LOW`) and topology-aware blast-radius calculations.
4. **Real-Time FinOps Cost Estimation (Infracost / Azure Retail Prices)**:
   - Live monthly cost badges per resource, subnet expenditure subtotals, and total architecture budget forecasts.
5. **AI Architecture Copilot (Azure OpenAI GPT-4o)**:
   - Natural language prompt-to-architecture synthesis and 1-click automated security vulnerability remediation.
6. **Multi-Source Cloud Reverse-Engineering**:
   - Ingests Terraform scripts (`.tf`), Terraform state (`.tfstate`), execution plans (`tfplan.json`), or live Azure subscriptions (via Azure Resource Graph).

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite 6, TypeScript 5.7, `@xyflow/react` (React Flow 12), `@monaco-editor/react`, Zustand 5, TailwindCSS 3.4, Lucide Icons.
- **Backend**: Python 3.14+, FastAPI 0.115+, Uvicorn, Pydantic 2.10, Jinja2, `python-hcl2`, NetworkX 3.4.
- **Security & FinOps**: Checkov 3.2 (Azure CIS benchmarks), Infracost REST API, Azure Retail Prices API.
- **AI & Cloud**: Azure OpenAI Service (GPT-4o), Azure SDK for Python (`azure-mgmt-resource`, `azure-identity`).
- **Cloud Infrastructure**: Azure App Service (Linux Web App for Containers), Azure Functions v2, Azure Container Registry (ACR), Terraform (`deploy/`).

---

## 🚀 Quickstart

### Prerequisites
- **Python**: 3.14+ (Installed & available in PATH)
- **Node.js**: v24+
- **npm**: 11+

### 1. Backend Microservice Setup

<details open>
<summary><b>PowerShell (Windows)</b></summary>

```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -e .

# Run FastAPI server
python -m src.main --host 0.0.0.0 --port 8000 --reload
```
</details>

<details>
<summary><b>Bash (Linux / macOS)</b></summary>

```bash
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -e .

# Run FastAPI server
python -m src.main --host 0.0.0.0 --port 8000 --reload
```
</details>

API Documentation and Swagger UI will be available at: `http://localhost:8000/docs`

### 2. Frontend Visual Studio Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` (or `http://localhost:5173`) in your browser to launch the visual studio.

---

## 🧪 Running Automated Tests

**PowerShell (Windows):**
```powershell
$env:PYTHONPATH="."
.\.venv\Scripts\pytest -v tests/
# Or directly:
python -m pytest -v tests/
```

**Bash (Linux / macOS):**
```bash
PYTHONPATH=. .venv/bin/pytest -v tests/
```

---

## ☁️ Azure Cloud Deployment via Terraform
```bash
cd deploy
terraform init
terraform plan
terraform apply -auto-approve
```

---

## 📂 Project Structure

```text
.
├── deploy/                 # Production Azure Infrastructure IaC (ACR, App Service, Functions)
├── frontend/               # React 18 + Vite + React Flow 12 + Monaco Editor SPA
│   ├── src/
│   │   ├── components/     # Canvas, Editor, Header, Sidebar, Inspector, Copilot, Import
│   │   ├── store/          # Zustand State Management & Bidirectional Sync
│   │   ├── services/       # REST & WebSocket API clients
│   │   └── index.css       # Design System Tokens & Glassmorphic Styles
├── src/                    # Backend API Microservice (FastAPI / Azure Functions ASGI)
│   ├── schema/             # Canonical Intermediate Representation (IR) & Catalog
│   ├── codegen/            # Jinja2 Modular Terraform HCL Generator
│   ├── parsers/            # HCL Parser, State Parser & Azure Resource Graph Importer
│   ├── graph/              # NetworkX Topology Builder & Auto-Layout Engine
│   ├── security/           # Checkov Azure CIS Policy Runner & Blast Radius Analyzer
│   ├── finops/             # Infracost Client & Azure Retail Prices Cost Models
│   └── copilot/            # Azure OpenAI GPT-4o Architecture Copilot & Remediation
├── samples/                # Sample Azure Architectures (.tf, .tfstate)
└── tests/                  # Automated Pytest Suite (Roundtrip, Codegen, Security, FinOps)
```

---

## 📜 Academic Research & Attribution

This project is developed as part of a Master of Science in Information Technology (GSIT) Capstone Research Study evaluating visual cloud infrastructure modeling, policy-as-code automation, and AI-assisted cloud engineering based on the **ISO/IEC 25010** software quality model.
