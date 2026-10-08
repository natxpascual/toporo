- **project**:
  - **title**: Azure Cloud Topology Engine: An AI-Powered Terraform Visualizer and Security Copilot
  - **executive_overview**:
    - **description**: The Azure Cloud Topology Engine is a high-performance, developer-centric visual cloud management and Infrastructure-as-Code (IaC) engineering platform designed specifically for Microsoft Azure and HashiCorp Terraform. The platform bridges the gap between visual architecture modeling and production-grade code engineering by providing an interactive drag-and-drop canvas with real-time bidirectional Terraform code generation, multi-source cloud reverse-engineering, integrated Policy-as-Code (Checkov), live FinOps cost estimation (Infracost / Azure Retail Prices), and an AI Copilot for natural language architecture synthesis and automated security remediation.
    - **purpose_and_core_value_proposition**:
      - **Visual Architecture Designer with Auto-IaC Generation**: A drag-and-drop diagramming canvas where placing, configuring, and connecting Azure cloud components automatically generates clean, modular, production-ready HashiCorp Terraform (.tf) code in real time in a synchronized split-view editor.
      - **Reverse Engineering & Cloud Import**: Ingests existing Terraform scripts (.tf), state files (.tfstate), execution plans (tfplan.json), or live Azure subscriptions (via Azure Resource Graph) to automatically reconstruct interactive visual architecture maps and editable IaC templates.
      - **Policy-as-Code & Security Guardrails**: Integrates static analysis, compliance checks (Checkov / Azure CIS benchmarks), and topology-aware blast-radius analysis into the visual design stage to catch security misconfigurations before deployment.
      - **Real-Time Cost Estimation (Infracost / FinOps)**: Direct integration with Infracost and Azure Retail Prices API to display resource-level monthly cost badges and aggregate topology spend cards dynamically before provisioning.
      - **AI Copilot & Architecture Synthesis**: Azure OpenAI (GPT-4o) integration to generate complete multi-tier architectures from natural language prompts, suggest optimized configuration parameters, and perform 1-click automated security and cost refactoring.
    - **target_infrastructure_scope**:
      - **supported_iac_format**: HashiCorp Terraform (HCL): .tf, .tf.json, .tfstate, and tfplan.json
      - **primary_cloud_target**: Microsoft Azure: Resource Groups, Virtual Networks (VNets), Subnets, Virtual Machines, App Services, Azure Functions, Storage Accounts, Key Vaults, Azure Kubernetes Service (AKS), Azure SQL Databases, Cosmos DB, Application Gateways, and Network Security Groups (NSGs).
      - **topology_hierarchy**:
        - Groups/Containers: Subnets inside VNets; VNets inside Resource Groups
        - Edges (Connections): Network peering, Private Endpoints, IAM roles, route tables, and service associations
    - **business_model_and_operating_economics**:
      - **business_model**: Open-Core / Freemium SaaS Model (Free Community Tier for individual developers + Team/Enterprise SaaS for real-time collaboration, live Azure tenant sync, and CI/CD gate automation).
      - **target_audience**: Cloud Architects, DevOps & SRE Engineers, DevSecOps Consultants, and Enterprise IT Leaders.
      - **pricing_strategy**: Value-driven competitive pricing (~$35-$45/user/month for Pro Teams, aligned with enterprise cloud tooling standards).
      - **target_margin**: ~80-85% gross margin leveraging serverless backend execution and client-side graph virtualization.
  - **system_architecture_and_security_boundaries**:
    - **diagram**:
        ┌─────────────────────────────────────────────────────────────────────────┐
        │                 AZURE APP SERVICE (LINUX WEB APP FOR CONTAINERS)        │
        │                                                                         │
        │  ┌───────────────────────────────┐     ┌─────────────────────────────┐  │
        │  │ Visual Drag-and-Drop Canvas   │ ◄─► │ Split Monaco Code Editor    │  │
        │  │ (React Flow 12 / Azure Nodes) │     │ (Bidirectional HCL Sync)    │  │
        │  └───────────────────────────────┘     └─────────────────────────────┘  │
        └────────────────────────────────────┬────────────────────────────────────┘
                                             │ HTTPS / WebSocket API (JSON IR)
                                             ▼
        ┌─────────────────────────────────────────────────────────────────────────┐
        │            AZURE FUNCTIONS MICROSERVICE (PYTHON V2 / FASTAPI ASGI)       │
        │                                                                         │
        │  ┌───────────────────────────────┐     ┌─────────────────────────────┐  │
        │  │ Canonical IR & Graph Engine   │ ◄─► │ Bidirectional HCL Generator │  │
        │  │ (NetworkX Topology Model)     │     │ & Parser (python-hcl2)      │  │
        │  └───────────────┬───────────────┘     └─────────────────────────────┘  │
        │                  │                                                      │
        │  ┌───────────────┴───────────────┐     ┌─────────────────────────────┐  │
        │  │ Policy Engine (Checkov / CIS) │     │ FinOps Engine (Infracost)   │  │
        │  └───────────────────────────────┘     └─────────────────────────────┘  │
        └──────────────────┬────────────────────────────────────┬─────────────────┘
                           │ (System-Assigned Managed Identity) │
            ┌──────────────┴──────────────┐      ┌──────────────┴──────────────┐
            ▼                             ▼      ▼                             ▼
    ┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
    │ Azure OpenAI (GPT-4o)│  │ Infracost Cloud  │  │ Azure Pricing    │  │ Azure Resource   │
    │ (Copilot Generator)  │  │ API (FinOps)     │  │ Retail API       │  │ Graph (Live ARG) │
    └──────────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘
    - **deployment_architecture**:
      - **Frontend**: Multi-stage Docker container (Vite -> NGINX Alpine) built and pushed to **Azure Container Registry (ACR)** and deployed on **Azure App Service (Linux Web App for Containers)**.
      - **Backend API Microservice**: Containerized Python 3.14 / FastAPI ASGI application deployed as a serverless **Azure Function App** with System-Assigned Managed Identity.
      - **Infrastructure-as-Code**: The hosting cloud topology (ACR, App Service, Function App, App Insights, Managed Identity) is codified in modular Terraform scripts in `deploy/`.
    - **architectural_guardrails**:
      - Canonical Intermediate Representation (IR): Single source of truth JSON schema defining Azure resources, properties, parent-child container hierarchies, and inter-resource edge bindings.
      - Bidirectional Sync: Node modifications on canvas immediately re-render Terraform HCL in Monaco; code modifications in Monaco re-render visual canvas nodes.
      - Automated Policy Guardrails: Every IR mutation triggers asynchronous Checkov scans to display immediate inline security badges.
      - Cloud-Connected FinOps: Resource SKU changes invoke Infracost / Azure Retail Prices endpoints for millisecond cost calculations.
      - Managed Identity Security: Azure Functions securely authenticates with Azure OpenAI and Azure Resource Graph without hardcoded credentials.
  - **technology_stack_specification**:
    - Item 1:
      - **subsystem**: Core Backend Runtime
      - **technology**: Python
      - **version_spec**: 3.14+ (Implemented on Python 3.14.7)
      - **purpose**: Backend runtime for AST compilation, graph processing, security linting, and AI integrations
    - Item 2:
      - **subsystem**: Web Framework & API Server
      - **technology**: FastAPI / Uvicorn
      - **version_spec**: FastAPI ^0.115.x / Uvicorn ^0.34.x
      - **purpose**: Asynchronous API server, WebSocket real-time canvas-to-editor sync, and service orchestration
    - Item 3:
      - **subsystem**: IaC Parser & HCL Code Generator
      - **technology**: python-hcl2 + Jinja2 Code Emitter
      - **version_spec**: python-hcl2 ^4.3.x / jinja2 ^3.1.x
      - **purpose**: Parsing HCL into Canonical IR and generating formatted, modular Terraform .tf code
    - Item 4:
      - **subsystem**: Graph & Topology Engine
      - **technology**: NetworkX
      - **version_spec**: ^3.4.x
      - **purpose**: Dependency resolution, topological sorting, container nesting (RG -> VNet -> Subnet), and blast-radius graph modeling
    - Item 5:
      - **subsystem**: Policy-as-Code & Security Engine
      - **technology**: Checkov (Bridgecrew)
      - **version_spec**: ^3.2.x
      - **purpose**: Comprehensive static analysis and Azure CIS benchmark policy enforcement against generated IaC
    - Item 6:
      - **subsystem**: FinOps & Cost Estimation
      - **technology**: Infracost API & Azure Retail Prices Client
      - **version_spec**: Infracost REST API / httpx ^0.28.x
      - **purpose**: Real-time monthly cost calculation per resource, subnet, and entire Azure architecture
    - Item 7:
      - **subsystem**: Live Cloud Importer
      - **technology**: Azure SDK for Python (azure-mgmt-resource, azure-identity)
      - **version_spec**: azure-mgmt-resource ^23.x / azure-identity ^1.19.x
      - **purpose**: Querying Azure Resource Graph (ARG) to reverse-engineer live Azure cloud subscriptions into visual IaC
    - Item 8:
      - **subsystem**: AI & Copilot Engine
      - **technology**: Azure OpenAI Service (GPT-4o) via OpenAI Python SDK
      - **version_spec**: openai ^1.60.x
      - **purpose**: Prompt-to-Architecture generation, natural language configuration suggestions, and 1-click automated security fixes
    - Item 9:
      - **subsystem**: Frontend Visual Canvas & Runtime
      - **technology**: Node.js 24+ / React 18+ / Vite / @xyflow/react (React Flow 12)
      - **version_spec**: Node v24.x, React ^18.3.x, @xyflow/react ^12.4.x, Vite ^6.1.x
      - **purpose**: Interactive drag-and-drop canvas with custom Azure node cards, nested containers (Combos), and port connections
    - Item 10:
      - **subsystem**: Split-View Code Editor
      - **technology**: Monaco Editor (@monaco-editor/react)
      - **version_spec**: ^4.7.x
      - **purpose**: VS Code-grade code editor for real-time viewing and editing of generated Terraform HCL code
    - Item 11:
      - **subsystem**: State Management & Styling
      - **technology**: Zustand + TailwindCSS + Lucide Icons
      - **version_spec**: Zustand ^5.0.x / Tailwind ^3.4.x / Lucide ^0.475.x
      - **purpose**: High-performance reactive state management and modern dark-themed dashboard UI matching Brainboard design aesthetic
  - **software_bill_of_materials**:
    - **python_backend_and_engines**:
      - python (3.14.7+)
      - fastapi (^0.115.0) - MIT
      - uvicorn (^0.34.0) - BSD-3-Clause
      - pydantic (^2.10.0) - MIT
      - python-hcl2 (^4.3.0) - MIT
      - jinja2 (^3.1.4) - BSD-3-Clause
      - networkx (^3.4.0) - BSD-3-Clause
      - checkov (^3.2.0) - Apache-2.0
      - azure-mgmt-resource (^23.0.0) - MIT
      - azure-identity (^1.19.0) - MIT
      - httpx (^0.28.0) - BSD-3-Clause
      - openai (^1.60.0) - Apache-2.0
      - pytest (^8.3.0) - MIT
    - **frontend_and_canvas_layer**:
      - node (v24.14.x+)
      - react (^18.3.1) - MIT
      - react-dom (^18.3.1) - MIT
      - @xyflow/react (^12.4.4) - MIT
      - @monaco-editor/react (^4.7.0) - MIT
      - zustand (^5.0.3) - MIT
      - lucide-react (^0.475.0) - ISC
      - tailwindcss (^3.4.17) - MIT
      - clsx (^2.1.1) / tailwind-merge (^3.0.1) - MIT
      - vite (^6.1.0) - MIT
      - typescript (^5.7.3) - Apache-2.0
  - **monorepo_directory_tree**:
    /
    ├── PROJECT.md                      # Primary architectural & operational specification
    ├── PLAN.md                         # Detailed project execution plan
    ├── pyproject.toml                  # Python dependencies & build configuration
    ├── README.md                       # Quickstart and developer setup guide
    ├── Dockerfile.api                  # Azure Functions / API Backend Docker container
    ├── deploy/                         # Terraform scripts to deploy the platform to Azure
    │   ├── main.tf                     # ACR, App Service, Azure Functions, App Insights
    │   ├── variables.tf
    │   └── outputs.tf
    │
    ├── src/                            # Backend API Microservice (Azure Functions / FastAPI)
    │   ├── __init__.py
    │   ├── function_app.py             # Azure Functions v2 entrypoint (AsgiFunctionApp wrapper)
    │   ├── main.py                     # Standalone FastAPI application entrypoint & CLI runner
    │   │
    │   ├── schema/                     # Canonical Intermediate Representation (IR)
    │   │   ├── __init__.py
    │   │   ├── ir_models.py            # Pydantic models for Azure resources, ports & edges
    │   │   └── azure_catalog.py        # Metadata registry of supported Azure resource types
    │   │
    │   ├── codegen/                    # Terraform HCL Code Generation
    │   │   ├── __init__.py
    │   │   └── emitter.py              # Transforms Canonical IR into formatted .tf files
    │   │
    │   ├── parsers/                    # Reverse-Engineering & Ingestion Engine
    │   │   ├── __init__.py
    │   │   ├── hcl_parser.py           # Ingests .tf files and transforms to Canonical IR
    │   │   ├── state_parser.py         # Ingests .tfstate / tfplan.json to Canonical IR
    │   │   └── azure_importer.py       # Queries Azure Resource Graph (ARG) to Canonical IR
    │   │
    │   ├── graph/                      # NetworkX Topology & Auto-Layout
    │   │   ├── __init__.py
    │   │   ├── builder.py              # Builds directed hierarchical graph from IR
    │   │   └── layout.py               # Computes container coordinates (RG -> VNet -> Subnet)
    │   │
    │   ├── security/                   # Policy-as-Code & Guardrails
    │   │   ├── __init__.py
    │   │   ├── checkov_runner.py       # Checkov policy evaluator on generated HCL/IR
    │   │   └── blast_radius.py         # Correlates security findings with network topology
    │   │
    │   ├── finops/                     # Cost Estimation Engine
    │   │   ├── __init__.py
    │   │   ├── infracost_client.py     # Infracost Cloud API client
    │   │   └── pricing_fallback.py     # Azure Retail Prices API client & cache
    │   │
    │   └── copilot/                    # AI Architecture Copilot (GPT-4o)
    │       ├── __init__.py
    │       ├── prompt_engine.py        # Natural language to Canonical IR generator
    │       └── remediator.py           # Automated security and cost refactoring engine
    │
    ├── frontend/                       # Interactive Visualizer & Monaco SPA
    │   ├── Dockerfile                  # Multi-stage NGINX container for Azure App Service
    │   ├── nginx.conf                  # SPA routing and reverse-proxy config
    │   ├── package.json
    │   ├── vite.config.ts
    │   ├── index.html
    │   └── src/
    │       ├── App.tsx                 # Main application layout & pane management
    │       ├── main.tsx
    │       ├── index.css               # Design system tokens & glassmorphic styles
    │       ├── components/
    │       │   ├── canvas/             # React Flow canvas, Azure custom nodes, containers, toolbar
    │       │   ├── editor/             # Monaco split-view editor with bidirectional sync
    │       │   ├── header/             # Header bar, stats badges, FinOps summary, export triggers
    │       │   ├── sidebar/            # Azure Resource Catalog & drag palette
    │       │   ├── inspector/          # Property config panel, Checkov alerts & Infracost cards
    │       │   ├── copilot/            # AI chat & prompt-to-architecture modal
    │       │   ├── import/             # Terraform .tf, .tfstate, and Azure ARG import modals
    │       │   └── icons/              # Official Azure SVG icons catalog
    │       ├── services/               # REST API & WebSocket sync client
    │       └── store/                  # Zustand store for Canvas <-> Monaco synchronization
    │
    ├── tests/                          # Automated test suite (10/10 Passing)
    │   ├── test_ir_sync.py             # Roundtrip tests: IR -> HCL -> IR
    │   ├── test_codegen.py             # Terraform generation validity tests
    │   ├── test_parsers.py             # HCL, state, and ARG import tests
    │   ├── test_security.py            # Checkov integration & blast radius tests
    │   └── test_finops.py              # Infracost & pricing calculation tests
    │
    └── samples/                        # Sample Azure Terraform architectures
        ├── basic_vnet.tf
        ├── hub_spoke_network.tf
        ├── secure_microservices.tf
        └── sample_tfstate.json
  - **approved_ui_ux_design_specifications**:
    - **canvas_and_topology_graph**:
      - Drag-and-Drop Palette: Left sidebar categorized by Azure services (Compute, Networking, Storage, Databases, Security).
      - Custom Azure Node Cards: Dark-themed glassmorphism cards with official Azure SVG icons, resource type badges, security status indicators, and monthly cost badges.
      - Hierarchical Container Nodes: Dynamic nested bounding boxes for Resource Groups, Virtual Networks, and Subnets with custom drop zones.
      - Connection Handles: Color-coded connection ports (Subnet Association, Private Link, Peering, Managed Identity).
    - **split_view_monaco_editor**:
      - Real-time Bidirectional Sync: Code changes in Monaco update canvas nodes; moving/configuring canvas nodes emits instant Terraform HCL updates.
      - Syntax Highlighting & Validation: Terraform syntax highlighting with error markers from Checkov.
    - **inspector_and_finops_panel**:
      - Resource Property Form: Interactive configuration fields for SKUs, CIDR blocks, OS types, and authentication settings.
      - Checkov Policy Drawer: Displays active security violations with severity tags (HIGH, MEDIUM, LOW) and 1-click AI fix buttons.
      - Infracost Breakdown: Itemized resource expenditure and monthly total forecast.
  - **implementation_milestones_and_qa_plan**:
    - Item 1:
      - **phase**: Phase 1: Canonical IR & Bidirectional HCL Generator
      - **status**: COMPLETED (Verified with automated test suite)
      - **tasks**:
        - [x] Define Pydantic schema for Canonical Azure Resource IR (`src/schema/ir_models.py`).
        - [x] Implement Jinja2-based Terraform HCL code generator (`src/codegen/emitter.py`).
        - [x] Build HCL parser (python-hcl2) mapping Terraform files to Canonical IR (`src/parsers/hcl_parser.py`).
        - [x] Validate lossless roundtrip synchronization in `tests/test_ir_sync.py`.
    - Item 2:
      - **phase**: Phase 2: Visual Canvas & Reverse Engineering
      - **status**: COMPLETED (Verified in UI build & test suite)
      - **tasks**:
        - [x] Setup React Flow 12 canvas with drag-and-drop Azure component palette.
        - [x] Implement nested container nodes (Resource Group -> VNet -> Subnet).
        - [x] Integrate split Monaco Editor with real-time bidirectional synchronization.
        - [x] Build reverse-engineering importers for `.tf`, `.tfstate`, and live Azure Resource Graph (ARG).
    - Item 3:
      - **phase**: Phase 3: Policy-as-Code & Live FinOps Guardrails
      - **status**: COMPLETED (Verified in tests & UI inspector)
      - **tasks**:
        - [x] Integrate Checkov engine for real-time security scanning of generated IaC (`src/security/checkov_runner.py`).
        - [x] Implement Infracost API client and Azure Retail Prices fallback for live cost badges (`src/finops/`).
        - [x] Correlate security findings with graph topology to compute blast-radius visual heatmaps (`src/security/blast_radius.py`).
    - Item 4:
      - **phase**: Phase 4: AI Architecture Copilot (GPT-4o)
      - **status**: COMPLETED (Verified with prompt synthesis and 1-click remediation)
      - **tasks**:
        - [x] Build prompt-to-architecture generator (Natural language -> Canonical IR -> Canvas + Code in `src/copilot/prompt_engine.py`).
        - [x] Implement 1-click AI security remediation and architecture refactoring (`src/copilot/remediator.py`).
    - Item 5:
      - **phase**: Phase 5: Cloud Deployment & ISO/IEC 25010 Evaluation
      - **status**: READY FOR DEPLOYMENT & EVALUATION
      - **tasks**:
        - [x] Multi-stage Docker containerization for Frontend (NGINX Alpine) and Backend (FastAPI / Azure Functions).
        - [x] Terraform provisioning configuration in `deploy/` (ACR, App Service, Functions, App Insights).
        - [ ] Execute ISO/IEC 25010 acceptability evaluation across 20 purposively sampled DevOps professionals.

