"""Auto-layout and container positioning engine for Azure Cloud Topology Engine."""

from typing import Dict, List, Tuple
from src.schema.ir_models import CanonicalTopology, AzureResource, NodePosition, NodeDimensions, ContainerLevel


class TopologyAutoLayout:
    """Calculates responsive hierarchical 2D coordinates for nested containers and nodes."""

    CONTAINER_PADDING = 30.0
    CONTAINER_HEADER_HEIGHT = 45.0
    NODE_WIDTH = 260.0
    NODE_HEIGHT = 110.0
    GAP_X = 40.0
    GAP_Y = 30.0

    @classmethod
    def apply_layout(cls, topology: CanonicalTopology) -> CanonicalTopology:
        """Computes positions and sizes for all resources in topology."""
        res_map: Dict[str, AzureResource] = {r.id: r for r in topology.resources}

        # 1. Identify root containers (Resources with parent_id = None)
        root_nodes = [r for r in topology.resources if not r.parent_id]
        
        current_x = 50.0
        current_y = 50.0
        max_row_height = 0.0

        for idx, root in enumerate(root_nodes):
            w, h = cls._layout_node_recursive(root, topology, res_map, current_x, current_y)
            root.position = NodePosition(x=current_x, y=current_y)
            root.dimensions = NodeDimensions(width=w, height=h)

            current_x += w + cls.GAP_X
            max_row_height = max(max_row_height, h)

            # Wrap after 2 large root containers
            if (idx + 1) % 2 == 0:
                current_x = 50.0
                current_y += max_row_height + cls.GAP_Y
                max_row_height = 0.0

        return topology

    @classmethod
    def _layout_node_recursive(
        cls,
        node: AzureResource,
        topology: CanonicalTopology,
        res_map: Dict[str, AzureResource],
        offset_x: float,
        offset_y: float,
    ) -> Tuple[float, float]:
        """Compute dimensions and child positions for a container or leaf node."""
        children = [r for r in topology.resources if r.parent_id == node.id]

        # Leaf node
        if not children:
            node.dimensions = NodeDimensions(width=cls.NODE_WIDTH, height=cls.NODE_HEIGHT)
            return cls.NODE_WIDTH, cls.NODE_HEIGHT

        # Container node (RG, VNet, or Subnet)
        child_offset_x = offset_x + cls.CONTAINER_PADDING
        child_offset_y = offset_y + cls.CONTAINER_HEADER_HEIGHT + cls.CONTAINER_PADDING

        cols = 2 if len(children) > 1 else 1
        current_row_w = 0.0
        current_row_h = 0.0
        total_w = 0.0
        total_h = 0.0

        for idx, child in enumerate(children):
            c_col = idx % cols
            c_row = idx // cols

            cw, ch = cls._layout_node_recursive(
                child,
                topology,
                res_map,
                child_offset_x + c_col * (cls.NODE_WIDTH + cls.GAP_X),
                child_offset_y + c_row * (cls.NODE_HEIGHT + cls.GAP_Y),
            )

            child.position = NodePosition(
                x=child_offset_x + c_col * (cls.NODE_WIDTH + cls.GAP_X),
                y=child_offset_y + c_row * (cls.NODE_HEIGHT + cls.GAP_Y),
            )
            child.dimensions = NodeDimensions(width=cw, height=ch)

            current_row_w += cw + cls.GAP_X
            current_row_h = max(current_row_h, ch)

            if (idx + 1) % cols == 0 or idx == len(children) - 1:
                total_w = max(total_w, current_row_w)
                total_h += current_row_h + cls.GAP_Y
                current_row_w = 0.0
                current_row_h = 0.0

        container_w = max(total_w + cls.CONTAINER_PADDING * 2, cls.NODE_WIDTH + 80.0)
        container_h = total_h + cls.CONTAINER_HEADER_HEIGHT + cls.CONTAINER_PADDING * 2

        node.dimensions = NodeDimensions(width=container_w, height=container_h)
        return container_w, container_h
