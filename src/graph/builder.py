"""NetworkX Graph Topology Builder for Azure Cloud Topology Engine."""

from __future__ import annotations
from typing import Any, Dict, List, Optional, Set
import networkx as nx
from src.schema.ir_models import CanonicalTopology, AzureResource, TopologyEdge, RelationType


class TopologyGraphBuilder:
    """Constructs and queries directed hierarchical graph representations of Azure architectures."""

    def __init__(self, topology: CanonicalTopology):
        self.topology = topology
        self.graph = nx.DiGraph()
        self._build_graph()

    def _build_graph(self) -> None:
        """Populate NetworkX graph with nodes and directed edges."""
        # 1. Add all resources as nodes with metadata
        for res in self.topology.resources:
            self.graph.add_node(
                res.id,
                resource_type=res.type,
                name=res.name,
                location=res.location,
                container_level=res.container_level.value if hasattr(res.container_level, "value") else str(res.container_level or "none"),
                parent_id=res.parent_id,
                resource_obj=res,
            )

        # 2. Add explicit containment edges from parent_id
        for res in self.topology.resources:
            if res.parent_id and res.parent_id in self.graph:
                self.graph.add_edge(
                    res.parent_id,
                    res.id,
                    relation_type=RelationType.CONTAINMENT.value,
                    weight=1.0,
                )

        # 3. Add explicit relation edges from topology
        for edge in self.topology.edges:
            if edge.source in self.graph and edge.target in self.graph:
                self.graph.add_edge(
                    edge.source,
                    edge.target,
                    relation_type=edge.relation_type.value if hasattr(edge.relation_type, "value") else str(edge.relation_type),
                    weight=2.0,
                    properties=edge.properties,
                )

    def get_topological_sort(self) -> List[str]:
        """Return topological order for dependency provisioning."""
        try:
            return list(nx.topological_sort(self.graph))
        except nx.NetworkXUnfeasible:
            # Graph has cycles; break cycle edges for ordering
            dag = nx.DiGraph(self.graph)
            while not nx.is_directed_acyclic_graph(dag):
                cycles = list(nx.simple_cycles(dag))
                if not cycles:
                    break
                dag.remove_edge(cycles[0][0], cycles[0][1])
            return list(nx.topological_sort(dag))

    def get_container_hierarchy(self) -> Dict[str, Any]:
        """Construct nested tree of containers (RG -> VNet -> Subnet -> Leaf)."""
        tree: Dict[str, Any] = {"root": []}
        res_by_id = {r.id: r for r in self.topology.resources}

        def build_subtree(parent_id: Optional[str]) -> List[Dict[str, Any]]:
            children = [r for r in self.topology.resources if r.parent_id == parent_id]
            node_list = []
            for child in children:
                node_list.append({
                    "id": child.id,
                    "name": child.name,
                    "type": child.type,
                    "containerLevel": child.container_level.value if hasattr(child.container_level, "value") else str(child.container_level or "none"),
                    "children": build_subtree(child.id),
                })
            return node_list

        tree["root"] = build_subtree(None)
        return tree

    def get_connected_subgraph(self, resource_id: str, depth: int = 2) -> Set[str]:
        """Find all nodes directly or indirectly connected within given depth."""
        if resource_id not in self.graph:
            return set()
        
        undirected = self.graph.to_undirected()
        lengths = nx.single_source_shortest_path_length(undirected, resource_id, cutoff=depth)
        return set(lengths.keys())
