"""FastAPI Application Entrypoint for Azure Cloud Topology Engine."""

from __future__ import annotations
import argparse
from typing import Any, Dict, List, Optional
import uvicorn
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.schema.ir_models import CanonicalTopology
from src.schema.azure_catalog import get_catalog_list
from src.codegen.emitter import TerraformEmitter
from src.parsers.hcl_parser import HCLParser
from src.graph.builder import TopologyGraphBuilder
from src.graph.layout import TopologyAutoLayout
from src.security.checkov_runner import CheckovPolicyEngine
from src.security.blast_radius import BlastRadiusAnalyzer
from src.finops.infracost_client import InfracostClient


app = FastAPI(
    title="Azure Cloud Topology Engine API",
    description="AI-Powered Terraform Visualizer, Checkov Policy Scanner, and FinOps Copilot",
    version="1.0.0",
)

# CORS middleware for web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ParseRequest(BaseModel):
    hcl: str
    projectName: Optional[str] = "Imported Topology"


class BlastRadiusRequest(BaseModel):
    topology: CanonicalTopology


@app.get("/healthz")
def health_check():
    return {"status": "ok", "service": "Azure Cloud Topology Engine"}


@app.get("/api/catalog")
def get_catalog():
    """Retrieve full catalog of supported Azure services and properties."""
    return {"catalog": get_catalog_list()}


@app.post("/api/codegen")
def generate_terraform_code(topology: CanonicalTopology):
    """Transform Canonical IR into modular HashiCorp Terraform (.tf) files."""
    emitter = TerraformEmitter(topology)
    return emitter.generate_all()


@app.post("/api/parse")
def parse_terraform_code(req: ParseRequest):
    """Parse raw Terraform HCL string into Canonical IR."""
    try:
        topology = HCLParser.parse_hcl_string(req.hcl, project_name=req.projectName or "Imported Topology")
        # Automatically evaluate policies and layout on import
        topology = CheckovPolicyEngine.scan_topology(topology)
        infracost = InfracostClient()
        topology = infracost.estimate_topology_costs(topology)
        topology = TopologyAutoLayout.apply_layout(topology)
        return topology
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse Terraform HCL: {str(e)}")


@app.post("/api/security/scan")
def scan_security_policies(topology: CanonicalTopology):
    """Execute Checkov Azure CIS policy scans and compute blast-radius."""
    annotated_topology = CheckovPolicyEngine.scan_topology(topology)
    summary = CheckovPolicyEngine.get_summary_metrics(annotated_topology)
    blast_radius = BlastRadiusAnalyzer.calculate_blast_radius(annotated_topology)
    return {
        "topology": annotated_topology,
        "summary": summary,
        "blastRadius": blast_radius,
    }


@app.post("/api/finops/cost")
def estimate_finops_costs(topology: CanonicalTopology):
    """Calculate Infracost / Azure Retail Prices monthly spend."""
    infracost = InfracostClient()
    annotated_topology = infracost.estimate_topology_costs(topology)
    summary = infracost.get_summary_finops(annotated_topology)
    return {
        "topology": annotated_topology,
        "summary": summary,
    }


from src.copilot.prompt_engine import ArchitectureCopilot
from src.copilot.remediator import SecurityRemediator
from src.parsers.state_parser import TerraformStateParser
from src.parsers.azure_importer import AzureResourceGraphImporter


class CopilotGenerateRequest(BaseModel):
    prompt: str
    currentTopology: Optional[CanonicalTopology] = None


class CopilotRemediateRequest(BaseModel):
    topology: CanonicalTopology
    finding: Dict[str, Any]


class ImportStateRequest(BaseModel):
    stateJson: str
    projectName: Optional[str] = "Imported State"


class ImportAzureRequest(BaseModel):
    queryResultsJson: str
    subscriptionId: Optional[str] = "Live Azure Subscription"


@app.post("/api/copilot/generate")
def copilot_generate_architecture(req: CopilotGenerateRequest):
    """Synthesize complete multi-tier Azure architecture from natural language."""
    topology = ArchitectureCopilot.generate_topology_from_prompt(req.prompt, req.currentTopology)
    return {"topology": topology}


@app.post("/api/copilot/remediate")
def copilot_remediate_finding(req: CopilotRemediateRequest):
    """Apply 1-click automated remediation for Checkov policy findings."""
    resource_id = req.finding.get("resourceId") or req.finding.get("resource_id", "")
    rule_id = req.finding.get("ruleId") or req.finding.get("rule_id", "")
    remediated = SecurityRemediator.remediate_finding(req.topology, resource_id, rule_id)
    remediated = CheckovPolicyEngine.scan_topology(remediated)
    infracost = InfracostClient()
    remediated = infracost.estimate_topology_costs(remediated)
    return {"topology": remediated}


@app.post("/api/import/state")
def import_terraform_state(req: ImportStateRequest):
    """Ingest terraform.tfstate or tfplan.json into Canonical IR."""
    try:
        topology = TerraformStateParser.parse_state_json(req.stateJson, req.projectName or "Imported State")
        topology = CheckovPolicyEngine.scan_topology(topology)
        infracost = InfracostClient()
        topology = infracost.estimate_topology_costs(topology)
        return topology
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to import state: {str(e)}")


@app.post("/api/import/azure")
def import_azure_resource_graph(req: ImportAzureRequest):
    """Ingest Azure Resource Graph query results into Canonical IR."""
    try:
        topology = AzureResourceGraphImporter.import_arg_query_results(
            req.queryResultsJson, req.subscriptionId or "Live Azure Subscription"
        )
        topology = CheckovPolicyEngine.scan_topology(topology)
        infracost = InfracostClient()
        topology = infracost.estimate_topology_costs(topology)
        return topology
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to import Azure resources: {str(e)}")


@app.post("/api/graph/layout")
def apply_topology_layout(topology: CanonicalTopology):
    """Calculate hierarchical 2D coordinates for canvas rendering."""
    return TopologyAutoLayout.apply_layout(topology)


# WebSocket connection manager for live multi-tab & canvas-to-editor sync
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()


@app.websocket("/ws/sync")
async def websocket_sync_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            # Broadcast state changes to all connected editor/canvas clients
            await manager.broadcast({"event": "topology_updated", "data": data})
    except WebSocketDisconnect:
        manager.disconnect(websocket)


def run_cli():
    parser = argparse.ArgumentParser(description="Azure Cloud Topology Engine API Runner")
    parser.add_argument("--host", default="0.0.0.0", help="Host address")
    parser.add_argument("--port", type=int, default=8000, help="Port number")
    parser.add_argument("--reload", action="store_true", help="Enable live reload")
    args = parser.parse_args()

    uvicorn.run("src.main:app", host=args.host, port=args.port, reload=args.reload)


if __name__ == "__main__":
    run_cli()
