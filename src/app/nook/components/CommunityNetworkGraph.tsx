/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import * as d3 from "d3";
import type { User, NodeType, Connection } from "../utils/types";
import UserSearch from "./UserSearch";
import Profile from "./Profile";
import { useNetworkData } from "../hooks/useNetworkData";
// import GraphLegend from "./GraphLegend";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Color constants using CSS variables from globals.css
const COLORS = {
  // Node colors
  USER_NODE: "var(--primary)", // Green for users
  FELLOW_INDICATOR: "var(--info)", // Purple/blue for fellow indicator

  // Link colors
  LINK_GRADIENT_START: "var(--secondary)",
  LINK_GRADIENT_END: "var(--secondary-muted)",
  LINK_DEFAULT_OPACITY: 0.4,
  LINK_FADED_OPACITY: 0.05,
  HIGH_WEIGHT_LINK: "var(--highlight)", // Highlight color for high-weight links
  VERY_HIGH_WEIGHT_LINK: "var(--highlight-active)", // Brighter highlight for very high weight links

  // Selection colors
  SELECTED_NODE_STROKE: "var(--highlight-active)", // Orange/yellow highlight
  CONNECTED_NODE_STROKE: "var(--highlight)", // Lighter orange/yellow
  DEFAULT_NODE_STROKE: "var(--background)", // White/background color
  NON_SELECTED_NODE_OPACITY: 0.3,

  // UI elements
  VIEWPORT_BORDER: "var(--border)",

  // Tooltip colors
  TOOLTIP_TITLE: "var(--foreground)",
  TOOLTIP_TEXT: "var(--muted-foreground)",
  TOOLTIP_SECONDARY: "var(--muted-foreground)",
  TOOLTIP_TAG_BG: "var(--accent)",
  TOOLTIP_TAG_TEXT: "var(--accent-foreground)",
  TOOLTIP_STATUS_BG: "var(--info-disabled)",
  TOOLTIP_STATUS_TEXT: "var(--info-foreground)",
  TOOLTIP_LINK: "var(--secondary)",

  // Text colors
  LABEL_USER: "var(--foreground)",
};

// Scale factor for selected nodes
const SELECTED_NODE_SCALE = 9;

// Performance optimization constants
const MAX_VISIBLE_LINKS = 1000; // Only render this many links at once for better performance
const NODE_CHARGE_FORCE = -300; // Stronger repulsion between nodes for better visualization
const MOBILE_NODE_CHARGE_FORCE = -150; // Less repulsion on mobile for tighter layout
const COLLISION_RADIUS = 25; // Prevent nodes from overlapping too much
const MOBILE_COLLISION_RADIUS = 20; // Smaller collision radius on mobile
const ALPHA_DECAY = 0.0228; // Default D3 value
const ALPHA_MIN = 0.001; // Default D3 value
const ZOOM_EXTENT = [0.2, 6] as [number, number]; // Min/max zoom levels
const MOBILE_ZOOM_EXTENT = [0.1, 4] as [number, number]; // Adjusted zoom range for mobile
const ANIMATION_DURATION = 250; // Default animation duration
const TRANSITION_DELAY = 150; // Default transition delay
const VELOCITY_DECAY = 0.4; // Default D3 value

// Extend SimulationNodeDatum to include properties needed for our visualizations
interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  profile?: {
    image?: string;
    keywords?: string[];
    bio?: string;
    currentAffiliation?: string;
    city?: string;
    url?: string;
  };
  _fixedX?: number;
  _fixedY?: number;
}

interface CommunityNetworkGraphProps {
  data?: {
    nodes: User[];
    links: { source: string; target: string; weight?: number }[];
  };
  currentUserId?: string; // Prop for passing currently logged in user ID
}

const CommunityNetworkGraph: React.FC<CommunityNetworkGraphProps> = ({
  data: propData, // Rename to avoid confusion
  currentUserId, // Get the current user ID from props
}) => {
  // ALL HOOKS MUST BE AT THE TOP - before any conditional returns
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<User | null>(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [directConnections, setDirectConnections] = useState<Connection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isInitialRenderDone, setIsInitialRenderDone] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<{
    nodes: User[];
    links: { source: string; target: string; weight?: number }[];
  }>({ nodes: [], links: [] });
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // Reference to track whether the initial animation is finished
  const isStabilized = useRef(false);
  // Reference to track if we've already loaded from URL to prevent loops
  const initialLoadComplete = useRef(false);
  const simulationStabilizedRef = useRef(false);
  // Reference to store peripheral nodes
  const peripheralNodesRef = useRef<User[]>([]);
  // Reference to track the currently selected node ID (updated immediately)
  const selectedNodeIdRef = useRef<string | null>(null);
  // Define simulation reference to use in drag functions
  const simulationRef = useRef<d3.Simulation<
    d3.SimulationNodeDatum,
    undefined
  > | null>(null);
  // Keep zoom reference for consistent zooming
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Use the real data from API with fallback to prop data
  const { data: apiData, isLoading, error, isRefetching } = useNetworkData();

  // Use API data if available, fallback to prop data only
  const data = apiData || propData || { nodes: [], links: [] };

  // Add initial debug log for component props
  console.log("CommunityNetworkGraph initializing with:", {
    currentUserId,
    nodesCount: data.nodes.length,
    linksCount: data.links.length,
    isLoading,
    isRefetching,
    dataSource: apiData ? "API" : propData ? "props" : "empty",
  });

  // Create memoized data structures for faster lookups
  const dataNodesMap = useMemo(() => {
    const map = new Map();
    data.nodes.forEach((node) => map.set(node.id, node));
    return map;
  }, [data.nodes]);

  // Function to safely get node or link ID regardless of whether it's a string or object
  const safeGetId = useCallback((item: any) => {
    if (!item) return null;
    return typeof item === "string" ? item : item.id;
  }, []);

  // Calculate node connections count in advance for faster access
  const nodeConnectionsMap = useMemo(() => {
    const connectionsMap = new Map<string, number>();

    data.links.forEach((link) => {
      const sourceId = safeGetId(link.source);
      const targetId = safeGetId(link.target);

      connectionsMap.set(sourceId, (connectionsMap.get(sourceId) || 0) + 1);
      connectionsMap.set(targetId, (connectionsMap.get(targetId) || 0) + 1);
    });

    return connectionsMap;
  }, [safeGetId, data.links]);

  // Function to calculate node radius based on connection count
  const getNodeRadius = useCallback(
    (node: any): number => {
      // Base radius - smaller on mobile
      const isMobile = window.innerWidth < 768;
      const baseRadius = isMobile ? 4 : 6;

      // Get connections count from our precomputed map
      const connections = nodeConnectionsMap.get(node.id) || 0;

      // Scale radius logarithmically based on connections count (capped for visual consistency)
      if (connections === 0) return baseRadius;
      const scaleFactor = Math.log(connections + 1) / (isMobile ? 4 : 3);
      return baseRadius + Math.min(isMobile ? 3 : 4, scaleFactor);
    },
    [nodeConnectionsMap]
  );

  // Function to filter data to only show the selected node and its connections
  const filterDataForNode = useCallback(
    (nodeId: string | null) => {
      // Only log if in development mode to reduce noise
      if (process.env.NODE_ENV === "development") {
        console.log("filterDataForNode called with nodeId:", nodeId);
      }

      if (!nodeId) {
        // If no node is selected and we have a current user, use that
        if (currentUserId) {
          if (process.env.NODE_ENV === "development") {
            console.log(
              "No nodeId provided, using currentUserId:",
              currentUserId
            );
          }
          return filterDataForNode(currentUserId);
        }

        // Otherwise return empty data
        if (process.env.NODE_ENV === "development") {
          console.log(
            "No nodeId or currentUserId available, returning empty data"
          );
        }
        return { nodes: [], links: [] };
      }

      // Get the selected node
      const selectedNodeData = data.nodes.find((node) => node.id === nodeId);
      if (!selectedNodeData) {
        console.error(
          `Node with ID ${nodeId} not found in data.nodes array of length ${data.nodes.length}`
        );

        // Only log detailed debug info in development
        if (process.env.NODE_ENV === "development") {
          console.log(
            "First 5 node IDs in data:",
            data.nodes.slice(0, 5).map((n) => n.id)
          );
          console.log(
            "All node IDs:",
            data.nodes.map((n) => n.id)
          );
        }

        // Special case for user with UUID if not found in the regular data
        if (
          nodeId === currentUserId &&
          nodeId === "e55075ef-3076-4019-bb46-854ab2662da1"
        ) {
          if (process.env.NODE_ENV === "development") {
            console.log("Creating placeholder node for logged-in user");
          }
          // Create a placeholder node for this user
          const placeholderNode = {
            id: nodeId,
            name: "Your Profile",
            type: "user" as NodeType,
            convo: {
              eventsCreated: 0,
              rsvps: 0,
            },
            profile: {
              image: "https://randomuser.me/api/portraits/women/65.jpg",
              keywords: ["new user"],
              bio: "Welcome to your network!",
              currentAffiliation: "",
            },
          };

          return {
            nodes: [placeholderNode],
            links: [],
          };
        }

        return { nodes: [], links: [] };
      }

      // Find all direct connections to this node
      const connectedLinks = data.links.filter((link) => {
        const sourceId = safeGetId(link.source);
        const targetId = safeGetId(link.target);
        return sourceId === nodeId || targetId === nodeId;
      });

      // Get IDs of all connected nodes
      const connectedNodeIds = new Set<string>();
      connectedLinks.forEach((link) => {
        const sourceId = safeGetId(link.source);
        const targetId = safeGetId(link.target);
        if (sourceId === nodeId) {
          connectedNodeIds.add(targetId);
        } else {
          connectedNodeIds.add(sourceId);
        }
      });

      // Filter nodes to include only the selected node and its connections
      const filteredNodes = [
        selectedNodeData,
        ...data.nodes.filter((node) => connectedNodeIds.has(node.id)),
      ];

      const result = {
        nodes: filteredNodes,
        links: connectedLinks,
      };

      // Only log in development to reduce noise
      if (process.env.NODE_ENV === "development") {
        console.log(`Found node: ${selectedNodeData.name}`);
        console.log(
          `Connections: ${connectedLinks.length} links, ${connectedNodeIds.size} nodes`
        );
        console.log(
          `Result: ${result.nodes.length} nodes, ${result.links.length} links`
        );
      }

      return result;
    },
    [data.nodes, data.links, safeGetId, currentUserId]
  );

  // Function to update node sizes based on selection state
  const updateNodeSizes = useCallback(
    (selectedNodeId: string | null) => {
      // Update the reference immediately
      selectedNodeIdRef.current = selectedNodeId;

      // Skip DOM updates during initial render
      if (!isInitialRenderDone) return;

      // Update all node sizes based on selection state
      d3.selectAll(".node-group circle")
        .transition()
        .duration(600)
        .attr("r", (d: any) => {
          // If there's a selected node and this is it, show it larger
          if (selectedNodeId && d.id === selectedNodeId) {
            return getNodeRadius(d) * SELECTED_NODE_SCALE;
          }
          // Otherwise show normal size
          return getNodeRadius(d);
        });

      // Also update clipPaths and images
      d3.selectAll(".node-group").each(function (d: any) {
        const isSelected = selectedNodeId && d.id === selectedNodeId;
        const newRadius = isSelected
          ? getNodeRadius(d) * SELECTED_NODE_SCALE
          : getNodeRadius(d);

        // Update the clip path if it exists
        d3.select(`#clip-${d.id} circle`)
          .transition()
          .duration(600)
          .attr("r", newRadius);

        // Update the image if it exists
        if (d.profile?.image) {
          d3.select(this)
            .select("image")
            .transition()
            .duration(600)
            .attr("x", -newRadius)
            .attr("y", -newRadius)
            .attr("width", newRadius * 2)
            .attr("height", newRadius * 2)
            .style("opacity", 1); // Ensure image remains visible
        }

        // If this is the selected node, bring it to front
        if (isSelected) {
          d3.select(this).raise();

          // Also bring the corresponding label to front
          d3.selectAll(".text-labels text")
            .filter((textData: any) => textData.id === d.id)
            .raise();
        }
      });
    },
    [getNodeRadius, isInitialRenderDone]
  );

  const updateUrlWithNodeId = useCallback(
    (nodeId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      const currentId = params.get("id");

      // Only update URL if the ID actually changed
      if (nodeId !== currentId) {
        if (nodeId) {
          params.set("id", nodeId);
        } else {
          params.delete("id");
        }

        // Use window.history directly to avoid triggering searchParams updates
        const newUrl = `${pathname}?${params.toString()}`;
        window.history.replaceState(null, "", newUrl);
      }
    },
    [pathname, searchParams]
  );

  // Memoized function to update connections for a node
  const updateNodeConnections = useCallback(
    (nodeId: string | null) => {
      // Only log in development to reduce noise
      if (process.env.NODE_ENV === "development") {
        console.log("updateNodeConnections called with nodeId:", nodeId);
      }

      // Update the reference immediately for visual feedback
      selectedNodeIdRef.current = nodeId;

      // Fade out current view before changing data
      d3.select(svgRef.current)
        .transition()
        .duration(TRANSITION_DELAY)
        .style("opacity", 0.5)
        .on("end", () => {
          // If nodeId is null, reset the selection
          if (nodeId === null) {
            if (process.env.NODE_ENV === "development") {
              console.log("Resetting selection (nodeId is null)");
            }
            setSelectedNode(null);
            setDirectConnections([]);
            setConnectionCount(0);
            setIsProfileDialogOpen(false);

            // Filter data for initial user if available
            if (currentUserId) {
              if (process.env.NODE_ENV === "development") {
                console.log(
                  `Will attempt to use currentUserId instead: ${currentUserId}`
                );
              }
              const initialData = filterDataForNode(currentUserId);
              if (process.env.NODE_ENV === "development") {
                console.log(
                  `Setting filtered data with currentUserId (${currentUserId}):`,
                  {
                    nodes: initialData.nodes.length,
                    links: initialData.links.length,
                  }
                );
              }
              setFilteredData(initialData);
            } else {
              console.log("No currentUserId available, setting empty data");
              setFilteredData({ nodes: [], links: [] });
            }

            // Fade back in after data change
            setTimeout(() => {
              d3.select(svgRef.current)
                .transition()
                .duration(ANIMATION_DURATION)
                .style("opacity", 1);
            }, 50);

            return;
          }

          console.log(`Looking up node data for ID: ${nodeId}`);
          const nodeData = dataNodesMap.get(nodeId) as User;
          if (!nodeData) {
            console.error(`Node with ID ${nodeId} not found in dataNodesMap`);
            console.log("dataNodesMap size:", dataNodesMap.size);
            console.log("dataNodesMap has nodeId?", dataNodesMap.has(nodeId));
            console.log(
              "First 5 keys in dataNodesMap:",
              [...dataNodesMap.keys()].slice(0, 5)
            );
            return;
          }

          console.log(`Found node data for ${nodeId}:`, nodeData.name);
          setSelectedNode(nodeData);
          setIsProfileDialogOpen(true);

          // Filter data to only show this node and its connections
          console.log(`Filtering data for node ${nodeId}`);
          const newFilteredData = filterDataForNode(nodeId);
          console.log(
            `Setting filtered data with ${newFilteredData.nodes.length} nodes and ${newFilteredData.links.length} links`
          );
          setFilteredData(newFilteredData);

          // Get connections for this node - handling bidirectional links
          // Use a Map for faster lookups
          const connectionMap = new Map<string, any>();

          // Process all links in a single pass
          data.links.forEach((link: any) => {
            const sourceId = safeGetId(link.source);
            const targetId = safeGetId(link.target);

            if (sourceId === nodeId) {
              connectionMap.set(targetId, link);
            } else if (targetId === nodeId) {
              connectionMap.set(sourceId, link);
            }
          });

          console.log(
            `Found ${connectionMap.size} direct connections for node ${nodeId}`
          );

          // Extract unique connected nodes
          const connections = Array.from(connectionMap.entries()).map(
            ([connectedId, linkData]) => {
              // Find the connected node
              const connectedNode = dataNodesMap.get(connectedId);

              if (!connectedNode) {
                console.warn(
                  `Connected node ${connectedId} not found in dataNodesMap`
                );
                return null;
              }

              return {
                id: connectedId,
                name: connectedNode.name,
                weight: linkData.weight || 5, // Get weight from link data or default to 5
                type: connectedNode.type as NodeType,
                description: linkData.description, // Include the detailed similarity description
              };
            }
          );

          // Filter out nulls and sort by name
          const validConnections = connections.filter(Boolean) as Connection[];

          // Sort by weight (descending), then by name
          validConnections.sort((a, b) => {
            if (b.weight !== a.weight) return b.weight - a.weight;
            return a.name.localeCompare(b.name);
          });

          console.log(
            `Setting ${validConnections.length} valid connections for Profile component`
          );
          setConnectionCount(validConnections.length);
          setDirectConnections(validConnections);

          // Fade back in after data change
          setTimeout(() => {
            d3.select(svgRef.current)
              .transition()
              .duration(ANIMATION_DURATION)
              .style("opacity", 1);
          }, 50);
        });
    },
    [safeGetId, dataNodesMap, data.links, currentUserId, filterDataForNode]
  );

  // Handle search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filteredNodes = data.nodes.filter((node) =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) as User[];

    setSearchResults(filteredNodes);
  }, [searchTerm, data.nodes]);

  // Initial load effect - check for URL parameters or load current user's node
  useEffect(() => {
    // Skip if we've already done initial load to prevent loops
    if (initialLoadComplete.current) return;

    // Only log in development to reduce noise
    if (process.env.NODE_ENV === "development") {
      console.log("Initial load effect running with:", {
        searchParams: searchParams.toString(),
        currentUserId,
      });
    }

    // First check URL for a node ID
    const nodeIdFromUrl = searchParams.get("id");

    if (nodeIdFromUrl) {
      if (process.env.NODE_ENV === "development") {
        console.log(`Using node ID from URL: ${nodeIdFromUrl}`);
      }
      updateNodeConnections(nodeIdFromUrl);
    } else if (currentUserId) {
      if (process.env.NODE_ENV === "development") {
        console.log(`No node ID in URL, using current user: ${currentUserId}`);
      }
      updateNodeConnections(currentUserId);
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log("No node ID in URL or current user ID available");
      }
      updateNodeConnections(null);
    }

    // Mark initial load as complete
    initialLoadComplete.current = true;
  }, [currentUserId, updateNodeConnections, searchParams]);

  // Update URL when selected node changes - only when selectedNode changes, not searchParams
  useEffect(() => {
    if (selectedNode) {
      updateUrlWithNodeId(selectedNode.id);
    } else if (initialLoadComplete.current) {
      // Only clear URL if initial load is done
      updateUrlWithNodeId(null);
    }
  }, [selectedNode, updateUrlWithNodeId]);

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      // Re-render the graph when window size changes
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
      // Reset the svg
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
      // Force re-render by resetting render state
      setIsInitialRenderDone(false);
    };

    // Debounce resize handler for better performance
    let resizeTimer: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 250);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Create and update the force-directed graph
  useEffect(() => {
    // Only log in development to reduce noise
    if (process.env.NODE_ENV === "development") {
      console.log("Graph rendering effect triggered with:", {
        hasContainer: !!containerRef.current,
        hasSvg: !!svgRef.current,
        filteredNodes: filteredData.nodes.length,
        filteredLinks: filteredData.links.length,
      });
    }

    if (!svgRef.current || !containerRef.current) {
      console.error("Missing required refs:", {
        svgRef: !!svgRef.current,
        containerRef: !!containerRef.current,
      });
      return;
    }

    // Detect if we're on a mobile device
    const isMobile = window.innerWidth < 768;

    // Apply appropriate parameters based on device type
    const chargeForce = isMobile ? MOBILE_NODE_CHARGE_FORCE : NODE_CHARGE_FORCE;
    const collisionRadius = isMobile
      ? MOBILE_COLLISION_RADIUS
      : COLLISION_RADIUS;
    const zoomRange = isMobile ? MOBILE_ZOOM_EXTENT : ZOOM_EXTENT;

    // If there are no nodes to render, still mark as rendered so loading state disappears
    if (filteredData.nodes.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.warn("No nodes to render in filteredData");
      }
      setIsInitialRenderDone(true); // Mark as complete even with no nodes
      return;
    }

    // Only log in development to reduce noise
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Rendering graph with ${filteredData.nodes.length} nodes and ${filteredData.links.length} links`
      );
    }

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create tooltip container once
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "12px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("box-shadow", "0 2px 5px rgba(0,0,0,0.1)")
      .style("z-index", 1000)
      .style("width", "220px") // Set constant width
      .style("max-width", "220px") // Ensure consistent width
      .style("word-wrap", "break-word"); // Enable text wrapping for long text;

    // Variable to track if simulation is finished
    simulationStabilizedRef.current = false;

    // Set up the SVG container with responsive dimensions
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: 100%;");

    // Find high-weight connections for each node for node radius calculation
    const nodeHighWeightConnectionsMap = new Map<string, boolean>();

    // Pre-calculate nodes with high-weight connections
    filteredData.links.forEach((link: any) => {
      const weight = link.weight || 1;
      if (weight > 5) {
        const sourceId =
          typeof link.source === "object" && link.source
            ? link.source.id
            : link.source;
        const targetId =
          typeof link.target === "object" && link.target
            ? link.target.id
            : link.target;

        if (sourceId) nodeHighWeightConnectionsMap.set(sourceId, true);
        if (targetId) nodeHighWeightConnectionsMap.set(targetId, true);
      }
    });

    // Create defs for clip paths and filters
    const defs = svg.append("defs");

    // Add blur filter for peripheral nodes
    const blurFilter = defs
      .append("filter")
      .attr("id", "blur-effect")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    blurFilter
      .append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", "2")
      .attr("result", "blur");

    // Add a pulsing glow effect filter for the current user's node
    const currentUserGlowFilter = defs
      .append("filter")
      .attr("id", "current-user-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    // Simple glow effect
    currentUserGlowFilter
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", "3")
      .attr("result", "blur");

    // Create a subtle color for the glow
    currentUserGlowFilter
      .append("feFlood")
      .attr("flood-color", "#6366f1")
      .attr("flood-opacity", "0.6")
      .attr("result", "color");

    // Combine the blur with the color
    currentUserGlowFilter
      .append("feComposite")
      .attr("in", "color")
      .attr("in2", "blur")
      .attr("operator", "in")
      .attr("result", "coloredBlur");

    // Merge the glow with the original graphic
    const merge = currentUserGlowFilter.append("feMerge");
    merge.append("feMergeNode").attr("in", "coloredBlur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Create additional visual indicator for current user
    function applyCurrentUserIndicator(
      nodeGroup: d3.Selection<any, unknown, null, undefined>,
      radius: number
    ) {
      // Add a single dashed circle for the current user
      nodeGroup
        .append("circle")
        .attr("r", radius * 1.3)
        .attr("fill", "none")
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "3,3")
        .attr("opacity", 0.8)
        .style("pointer-events", "none");

      // Add "You" label
      nodeGroup
        .append("text")
        .attr("y", -radius - 12)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "bold")
        .attr("fill", "#6366f1")
        .attr("opacity", 0.9)
        .style("pointer-events", "none")
        .text("You");
    }

    // Create clip paths for each node with profile image
    filteredData.nodes.forEach((node: any) => {
      if (node.profile?.image) {
        // Create clip path with the appropriate radius based on node status
        const baseRadius = getNodeRadius(node);
        const isSelected = node.id === selectedNodeIdRef.current;
        const isHighWeightNode =
          node.id && nodeHighWeightConnectionsMap.has(node.id);

        let clipRadius;
        if (isSelected) {
          clipRadius = baseRadius * SELECTED_NODE_SCALE;
        } else if (isHighWeightNode) {
          clipRadius = baseRadius * 3;
        } else {
          clipRadius = baseRadius;
        }

        defs
          .append("clipPath")
          .attr("id", `clip-${node.id}`)
          .append("circle")
          .attr("r", clipRadius);
      }
    });

    // No need for arrow markers and link glow filters since links are invisible

    // Setup zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent(zoomRange)
      .on("zoom", (event) => {
        mainGroup.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Main group for all elements (will be zoomed)
    const mainGroup = svg.append("g").attr("class", "main-group");

    // Add a background rect for zoom/pan handling
    mainGroup
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all");

    // Use color constants for node types
    const nodeColors = {
      user: COLORS.USER_NODE,
    };

    // Initialize nodes with a more deliberate radial layout
    filteredData.nodes.forEach((node: any, i: number) => {
      // If this is the first node (index 0) or the selected node, position it in the center
      if (
        i === 0 ||
        (selectedNodeIdRef.current && node.id === selectedNodeIdRef.current)
      ) {
        node.x = width / 2;
        node.y = height / 2;
        // Fix the central node in place initially
        if (
          selectedNodeIdRef.current &&
          node.id === selectedNodeIdRef.current
        ) {
          node.fx = width / 2;
          node.fy = height / 2;
          // Release fixed position after a delay
          setTimeout(() => {
            node.fx = null;
            node.fy = null;
          }, 1000);
        }
      } else {
        // Position other nodes in a circle around the center
        const angle = (i / (filteredData.nodes.length - 1)) * 2 * Math.PI;
        // Radius adjusts based on screen size - smaller for mobile
        const radiusMultiplier = isMobile ? 0.2 : 0.3;
        const radius = Math.min(width, height) * radiusMultiplier;
        node.x = width / 2 + Math.cos(angle) * radius;
        node.y = height / 2 + Math.sin(angle) * radius;
      }
    });

    // Create force simulation with optimized settings for radial layout
    const simulation = d3
      .forceSimulation(filteredData.nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(filteredData.links)
          .id((d: any) => d.id)
          // Dynamic distance based on weight: higher weight = closer nodes
          .distance((d: any) => {
            const weight = d.weight || 1;
            // Inverse relationship: higher weight = shorter distance
            return Math.max(100, 150 - weight * 10); // Minimum distance to prevent overlap
          })
          // Make stronger connections have more influence
          .strength((d: any) => {
            const weight = d.weight || 1;
            // Higher weight = stronger influence, but limited range for stability
            return Math.min(0.7, 0.2 + (weight / 10) * 0.5);
          })
      )
      // Stronger charge force for more regular spacing
      .force(
        "charge",
        d3
          .forceManyBody()
          .strength((d: any) => {
            // Different repulsion for central node vs others
            if (
              selectedNodeIdRef.current &&
              d.id === selectedNodeIdRef.current
            ) {
              return chargeForce * 1.8; // Slightly reduced from 2x
            }
            return chargeForce * 1.3; // Slightly reduced from 1.5x
          })
          .distanceMax(300) // Limit the range of repulsive force
          .theta(0.8) // Slightly lower theta for better accuracy
      )
      // Add a radial force to organize nodes around the central node
      .force(
        "radial",
        d3
          .forceRadial(
            (d: any) => {
              // The selected node should be at the center
              if (
                selectedNodeIdRef.current &&
                d.id === selectedNodeIdRef.current
              ) {
                return 0; // Central node at radius 0
              }
              // Higher weight connections should be closer to the central node
              const connections = data.links.filter((link: any) => {
                const sourceId = safeGetId(link.source);
                const targetId = safeGetId(link.target);
                return (
                  (sourceId === d.id &&
                    targetId === selectedNodeIdRef.current) ||
                  (targetId === d.id && sourceId === selectedNodeIdRef.current)
                );
              });

              // If this node is connected to the selected node, position based on weight
              if (connections.length > 0) {
                // Safely check if the first connection exists before accessing its weight
                const connection = connections[0];
                const weight =
                  connection && connection.weight ? connection.weight : 1;
                // Higher weight = closer to center (smaller radius)
                return Math.max(100, 200 - weight * 10);
              }

              // Default radius for unconnected nodes
              return 250;
            },
            width / 2,
            height / 2 // Center of the radial layout
          )
          .strength(0.15)
      ) // Reduced strength for gentler radial force (was 0.25)
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05)) // Reduced centering force (was 0.08)
      // Improved collision detection
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d: any) => {
            const radius = getNodeRadius(d);
            return d.id === selectedNodeIdRef.current
              ? radius * SELECTED_NODE_SCALE + collisionRadius // Padding for selected node
              : radius * 2.5; // Extra spacing between regular nodes
          })
          .strength(0.7)
      ) // Reduced strength for smoother collision response (was 0.8)
      .alphaDecay(ALPHA_DECAY)
      .alphaMin(ALPHA_MIN)
      .velocityDecay(VELOCITY_DECAY)
      .alphaTarget(0);

    console.log("Simulation created with:", {
      nodes: filteredData.nodes.length,
      links: filteredData.links.length,
      alpha: simulation.alpha(),
    });

    // Store simulation in ref for potential use outside this effect
    simulationRef.current = simulation;

    // For single node with no connections, ensure we don't get stuck in loading state
    let timer: NodeJS.Timeout | undefined;
    if (filteredData.nodes.length === 1 && filteredData.links.length === 0) {
      console.log(
        "Single node with no connections - using quick initialization"
      );
      // Force a quick completion for lone nodes
      simulation.alpha(0.01);

      // Set a backup timer to ensure loading state is removed
      timer = setTimeout(() => {
        if (!isInitialRenderDone) {
          console.log("Backup timer triggered to complete rendering");
          setIsInitialRenderDone(true);
          simulationStabilizedRef.current = true;

          // Position the single node in the center
          if (filteredData.nodes.length === 1) {
            const node = filteredData.nodes[0] as any;
            node.x = width / 2;
            node.y = height / 2;

            // Update the node position visually
            d3.selectAll(".node-group").attr(
              "transform",
              `translate(${width / 2},${height / 2})`
            );

            // Update any labels
            d3.selectAll(".text-labels text")
              .attr("x", width / 2)
              .attr("y", height / 2 + 20)
              .style("opacity", 1);
          }
        }
      }, 1000); // 1 second timeout
    }

    // Create link, node, and label groups
    const linksGroup = mainGroup.append("g").attr("class", "links");
    const nodesGroup = mainGroup.append("g").attr("class", "nodes");
    const labelsGroup = mainGroup.append("g").attr("class", "text-labels");

    // Simple dummy path function for links since they're invisible
    function linkArc() {
      // Just return an empty path - links are invisible
      return "M0,0L0,0";
    }

    // Create links (invisible but necessary for the force simulation)
    const link = linksGroup
      .selectAll("path")
      .data(filteredData.links)
      .join("path")
      .attr("stroke", "transparent") // Make links invisible
      .attr("stroke-opacity", 0) // Zero opacity
      .attr("stroke-width", 0) // Zero width
      .attr("marker-end", "")
      .attr("fill", "none")
      .attr("d", linkArc);

    // Create nodes
    const node = nodesGroup
      .selectAll("g")
      .data(filteredData.nodes)
      .join("g")
      .attr("class", "node-group")
      .call((selection) => {
        // Apply drag behavior with proper typing
        d3
          .drag<SVGGElement, any>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on(
            "end",
            dragended
          )(selection as any);
      })
      .on("click", function (event, d: any) {
        event.stopPropagation(); // Prevent event bubbling
        updateNodeConnections(d.id);
      });

    // Add circles to each node
    node
      .append("circle")
      .attr("r", (d: any) => {
        // If this is the selected node, make it larger
        if (d.id === selectedNodeIdRef.current) {
          return getNodeRadius(d) * SELECTED_NODE_SCALE;
        }
        // If this node has high weight connections (> 5), make it 3x larger
        else if (nodeHighWeightConnectionsMap.has(d.id)) {
          return getNodeRadius(d) * 3;
        }
        // Default radius
        return getNodeRadius(d);
      })
      .attr(
        "fill",
        (d: any) =>
          nodeColors[d.type as keyof typeof nodeColors] || COLORS.USER_NODE
      )
      .attr("stroke", (d: any) => {
        // Special stroke for selected node
        return d.id === selectedNodeIdRef.current
          ? COLORS.SELECTED_NODE_STROKE
          : COLORS.DEFAULT_NODE_STROKE;
      })
      .attr("stroke-width", (d: any) =>
        d.id === selectedNodeIdRef.current ? 2 : 1.5
      );

    // Add image for nodes that have profile images
    node.each(function (d: any) {
      if (d.profile?.image) {
        let radius;
        if (d.id === selectedNodeIdRef.current) {
          radius = getNodeRadius(d) * SELECTED_NODE_SCALE;
        } else if (nodeHighWeightConnectionsMap.has(d.id)) {
          radius = getNodeRadius(d) * 3;
        } else {
          radius = getNodeRadius(d);
        }

        // Create the image element for profile
        const imageElement = d3
          .select(this)
          .append("image")
          .attr("clip-path", `url(#clip-${d.id})`)
          .attr("xlink:href", d.profile.image)
          .attr("x", -radius)
          .attr("y", -radius)
          .attr("width", radius * 2)
          .attr("height", radius * 2)
          .style("opacity", 1) // Show all images
          .attr("pointer-events", "none");

        // Add a subtle highlight border for current user
        if (d.id === currentUserId) {
          // Add a "You" indicator for the current user
          d3.select(this)
            .append("circle")
            .attr("r", radius + 3) // Slightly larger than the node
            .attr("fill", "none")
            .attr("stroke", "#6366f1")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "3,3")
            .attr("opacity", 0.8)
            .style("pointer-events", "none");

          // Add "You" label if not a peripheral node
          if (
            d.id === selectedNodeIdRef.current ||
            filteredData.nodes.some((n) => n.id === d.id)
          ) {
            d3.select(this)
              .append("text")
              .attr("y", -radius - 12) // Position above the node
              .attr("text-anchor", "middle")
              .attr("font-size", "11px")
              .attr("font-weight", "bold")
              .attr("fill", "#6366f1")
              .attr("opacity", 0.9)
              .style("pointer-events", "none")
              .text("You");
          }
        }
      }
    });

    // Add tooltip behavior to nodes
    node
      .on("mouseenter", function (event: any, d: any) {
        const isSelectedNode = selectedNode && d.id === selectedNode.id;
        const isHighWeightNode = nodeHighWeightConnectionsMap.has(d.id);

        // Don't change size of selected node or high-weight node
        if (!isSelectedNode && !isHighWeightNode) {
          d3.select(this)
            .select("circle")
            .transition()
            .duration(300)
            .attr("r", getNodeRadius(d) * 1.2);

          // Update image clip path and size on hover
          if (d.profile?.image) {
            const newRadius = getNodeRadius(d) * 1.2;

            // Update clip path
            d3.select(`#clip-${d.id} circle`)
              .transition()
              .duration(300)
              .attr("r", newRadius);

            // Update image size
            d3.select(this)
              .select("image")
              .transition()
              .duration(300)
              .attr("x", -newRadius)
              .attr("y", -newRadius)
              .attr("width", newRadius * 2)
              .attr("height", newRadius * 2);
          }
        }

        // Show label
        labelsGroup
          .selectAll("text")
          .filter((labelData: any) => labelData.id === d.id)
          .transition()
          .duration(200)
          .style("opacity", 1);

        // Show tooltip
        tooltip.transition().duration(200).style("opacity", 0.9);

        const tooltipContent = `
        <div style="font-weight: bold; margin-bottom: 6px; font-size: 14px;">${
          d.name
        }</div>
        ${
          d.profile?.currentAffiliation
            ? `<div style="margin-bottom: 8px; color: #555;">${d.profile.currentAffiliation}</div>`
            : ""
        }
        ${
          d.profile?.bio
            ? `<div style="margin-top: 8px; font-size: 12px; line-height: 1.4;">${d.profile.bio}</div>`
            : ""
        }
      `;

        tooltip.html(tooltipContent);

        // Calculate position to keep tooltip within viewport
        const tooltipWidth = 220; // Must match the width set in the tooltip styles
        const tooltipNode = tooltip.node();
        const tooltipHeight = tooltipNode
          ? tooltipNode.getBoundingClientRect().height
          : 100; // Default height if node is null
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Default position
        let left = event.pageX + 15;
        let top = event.pageY - 15;

        // Check right boundary and adjust if needed
        if (left + tooltipWidth > windowWidth - 20) {
          left = event.pageX - tooltipWidth - 15;
        }

        // Check bottom boundary and adjust if needed
        if (top + tooltipHeight > windowHeight - 20) {
          top = windowHeight - tooltipHeight - 20;
        }

        // Ensure top is never negative
        top = Math.max(20, top);

        // Set final position
        tooltip.style("left", left + "px").style("top", top + "px");
      })
      .on("mouseleave", function (event: any, d: any) {
        const isSelectedNode = selectedNode && d.id === selectedNode.id;
        const isHighWeightNode = nodeHighWeightConnectionsMap.has(d.id);

        // Don't change size of selected node or high-weight node
        if (!isSelectedNode && !isHighWeightNode) {
          d3.select(this)
            .select("circle")
            .transition()
            .duration(300)
            .attr("r", getNodeRadius(d));

          // Reset image size on mouse leave
          if (d.profile?.image) {
            const normalRadius = getNodeRadius(d);

            // Update clip path
            d3.select(`#clip-${d.id} circle`)
              .transition()
              .duration(300)
              .attr("r", normalRadius);

            // Update image size
            d3.select(this)
              .select("image")
              .transition()
              .duration(300)
              .attr("x", -normalRadius)
              .attr("y", -normalRadius)
              .attr("width", normalRadius * 2)
              .attr("height", normalRadius * 2);
          }
        }

        // Hide label unless it's the selected node
        labelsGroup
          .selectAll("text")
          .filter((labelData: any) => labelData.id === d.id && !isSelectedNode)
          .transition()
          .duration(200)
          .style("opacity", 0);

        // Hide tooltip with delay
        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Create labels
    const labels = labelsGroup
      .selectAll("text")
      .data(filteredData.nodes)
      .join("text")
      .attr("text-anchor", "middle")
      .attr("fill", COLORS.LABEL_USER)
      .attr("pointer-events", "none")
      .style("opacity", 0)
      .text((d: any) => d.name);

    // Enhanced drag functions with visual feedback
    function dragstarted(
      this: SVGGElement,
      event: d3.D3DragEvent<SVGGElement, any, any>,
      d: any
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;

      // Visual indication of dragging state
      d3.select(this)
        .select("circle")
        .attr("stroke-width", 2.5)
        .attr("stroke-opacity", 0.9);
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, any, any>, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(
      this: SVGGElement,
      event: d3.D3DragEvent<SVGGElement, any, any>,
      d: any
    ) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;

      // Reset visual state
      d3.select(this)
        .select("circle")
        .attr("stroke-width", d.id === selectedNodeIdRef.current ? 2 : 1.5)
        .attr("stroke-opacity", 1);
    }

    // Add performance optimization with requestAnimationFrame for smoother rendering
    let animationFrameId: number | null = null;
    let tickCounter = 0;

    // Optimize the tick function with frame throttling
    simulation.on("tick", () => {
      // Only update DOM every other tick for better performance
      tickCounter++;
      if (tickCounter % 2 !== 0) return;

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame(() => {
        // Update node positions (skip link path updates since they're invisible)
        node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

        // Always ensure selected node stays on top during simulation
        if (selectedNodeIdRef.current) {
          d3.selectAll(".node-group")
            .filter((d: any) => d.id === selectedNodeIdRef.current)
            .raise();
        }

        // Update label positions - position below nodes
        labels
          .attr("x", (d: any) => d.x)
          .attr("y", (d: any) => {
            // Position below the node, accounting for its radius
            const isSelected = selectedNodeIdRef.current === d.id;
            const isHighWeightNode =
              d.id && nodeHighWeightConnectionsMap.has(d.id);

            let radius;
            if (isSelected) {
              radius = getNodeRadius(d) * SELECTED_NODE_SCALE;
            } else if (isHighWeightNode) {
              radius = getNodeRadius(d) * 3;
            } else {
              radius = getNodeRadius(d);
            }

            return d.y + radius + 12; // 12px offset below the node
          });

        // Keep nodes within viewport bounds (with padding)
        filteredData.nodes.forEach((d: any) => {
          const isSelected = selectedNodeIdRef.current === d.id;

          // If this is the selected node, keep it more centered
          if (isSelected) {
            // Allow some movement but keep it generally centered
            const centerPull = 0.15; // Reduced from 0.2 for smoother centering
            d.x = d.x + (width / 2 - d.x) * centerPull;
            d.y = d.y + (height / 2 - d.y) * centerPull;
          }

          const isHighWeightNode =
            d.id && nodeHighWeightConnectionsMap.has(d.id);

          let effectiveRadius;
          if (isSelected) {
            effectiveRadius = getNodeRadius(d) * SELECTED_NODE_SCALE;
          } else if (isHighWeightNode) {
            effectiveRadius = getNodeRadius(d) * 3;
          } else {
            effectiveRadius = getNodeRadius(d);
          }

          const padding = 50; // Extra padding to keep nodes away from the edge

          d.x = Math.max(
            effectiveRadius + padding,
            Math.min(width - effectiveRadius - padding, d.x)
          );
          d.y = Math.max(
            effectiveRadius + padding,
            Math.min(height - effectiveRadius - padding, d.y)
          );
        });
      });
    });

    // The start of the simulation
    console.log("Starting force simulation...");
    simulation.alpha(1).restart();

    // Create peripheral nodes with a short delay (700ms) after main graph starts
    setTimeout(() => {
      createPeripheralNodes();
    }, 300);

    // Handle stabilization at the end of simulation
    simulation.on("end", () => {
      // Mark initial rendering as complete
      setIsInitialRenderDone(true);
      simulationStabilizedRef.current = true;
      console.log("Simulation ended, graph rendering complete");

      // Keep labels visible for selected node
      if (selectedNodeIdRef.current) {
        labelsGroup
          .selectAll("text")
          .filter((d: any) => d.id === selectedNodeIdRef.current)
          .style("opacity", 1);
      }

      // Always show label for central/selected node
      if (filteredData.nodes.length > 0) {
        const centralNodeId =
          selectedNodeIdRef.current || filteredData.nodes[0]?.id || "";
        labelsGroup
          .selectAll("text")
          .filter((d: any) => d.id === centralNodeId)
          .style("opacity", 1);
      }
    });

    // Function to create peripheral nodes
    function createPeripheralNodes() {
      // Skip if there aren't enough nodes in the data
      if (data.nodes.length <= filteredData.nodes.length) return;

      // Get the IDs of nodes already shown in the graph
      const shownNodeIds = new Set(filteredData.nodes.map((node) => node.id));

      // Get available nodes that aren't already in the graph
      const availableNodes = data.nodes.filter(
        (node) => !shownNodeIds.has(node.id)
      );

      // If no available nodes, return
      if (availableNodes.length === 0) return;

      // Log availability
      console.log(
        `Found ${availableNodes.length} nodes available for peripheral display`
      );

      // Determine how many nodes to show: minimum 7, maximum 10
      const minNodes = 7;
      const maxNodes = 10;

      if (availableNodes.length < minNodes) {
        console.warn(
          `Not enough available nodes for minimum requirement of ${minNodes}. Using all ${availableNodes.length} available nodes.`
        );
      }

      // Use between 7 and 10 nodes, or all available if less than 7
      const numPeripheralNodes = Math.min(
        maxNodes,
        Math.max(minNodes, availableNodes.length)
      );

      // Select random nodes
      const randomNodes: User[] = [];
      const usedIndices = new Set<number>();

      // Try to get exactly numPeripheralNodes, but accept whatever we can get
      // with a maximum of 100 attempts to avoid infinite loop
      let attempts = 0;
      while (
        randomNodes.length < numPeripheralNodes &&
        usedIndices.size < availableNodes.length &&
        attempts < 100
      ) {
        attempts++;
        const randomIndex = Math.floor(Math.random() * availableNodes.length);
        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          const node = availableNodes[randomIndex];
          if (node) {
            // Check if node exists
            randomNodes.push(node);
          }
        }
      }

      // If we couldn't get minimum nodes, log a warning
      if (randomNodes.length < minNodes && availableNodes.length >= minNodes) {
        console.warn(
          `Could only get ${randomNodes.length} peripheral nodes despite having ${availableNodes.length} available nodes.`
        );
      }

      // If we didn't get any nodes, return
      if (randomNodes.length === 0) return;

      // Store in the ref for access in cleanup
      peripheralNodesRef.current = randomNodes;

      // Create a group for peripheral nodes (and ensure it's on top by calling raise())
      const peripheralGroup = mainGroup
        .append("g")
        .attr("class", "peripheral-nodes")
        .raise(); // Ensure it's on top of other elements

      // Calculate positions around the edge of the viewport with increased padding
      const edgePadding = Math.min(width, height) * 0.08; // 8% padding from edge
      const distanceFromCenter = Math.min(width, height) * 0.5; // Distance from center used for animation

      // Generate random positions instead of circular arrangement
      const positions = randomNodes.map(() => {
        // Create random position anywhere within the visible area
        // Use a distance range between 30% and 60% from center for variety
        const randomDistance =
          Math.min(width, height) * (0.3 + Math.random() * 0.3);
        const randomAngle = Math.random() * 2 * Math.PI; // Random angle

        // Calculate position from random distance and angle
        const x = width / 2 + randomDistance * Math.cos(randomAngle);
        const y = height / 2 + randomDistance * Math.sin(randomAngle);

        // Ensure position is within bounds
        const safePadding = 50; // Padding from edge
        const safeX = Math.max(safePadding, Math.min(width - safePadding, x));
        const safeY = Math.max(safePadding, Math.min(height - safePadding, y));

        return {
          x: safeX,
          y: safeY,
          angle: randomAngle, // Store the angle for animation reference
        };
      });

      // Create node groups
      const peripheralNodeElements = peripheralGroup
        .selectAll("g")
        .data(randomNodes)
        .join("g")
        .attr("class", "peripheral-node-group")
        .attr("transform", (_, i) => {
          if (!positions[i]) return `translate(0,0)`;
          const x = positions[i]?.x ?? 0;
          const y = positions[i]?.y ?? 0;
          return `translate(${x},${y})`;
        })
        .style("cursor", "pointer")
        .on("click", function (event, d: any) {
          event.stopPropagation();
          updateNodeConnections(d.id);
        });

      // Add circles to each node with increased visibility
      peripheralNodeElements
        .append("circle")
        .attr("r", (d: User) => getNodeRadius(d) * 4) // Changed from 8x to 4x size
        .attr(
          "fill",
          (d: User) =>
            nodeColors[(d.type as keyof typeof nodeColors) || "user"] ||
            COLORS.USER_NODE
        )
        .attr("stroke", "#ffffff") // White stroke for better visibility
        .attr("stroke-width", 2.5) // Thicker stroke
        .style("opacity", 0) // Start invisible
        .attr("filter", "url(#blur-effect)") // Apply only blur effect to all peripheral nodes
        .transition()
        .duration(400) // Reduced from 1000ms to 400ms for faster appearance
        .style("opacity", 0.2); // Reduced from 0.3 to 0.2 (20% opacity)

      // Add images to nodes that have profile images
      peripheralNodeElements.each(function (d: User) {
        if (d?.profile?.image) {
          const radius = getNodeRadius(d) * 4; // Changed from 8x to 4x size

          // Create clip path for the image
          defs
            .append("clipPath")
            .attr("id", `peripheral-clip-${d.id}`)
            .append("circle")
            .attr("r", radius);

          d3.select(this)
            .append("image")
            .attr("clip-path", `url(#peripheral-clip-${d.id})`)
            .attr("xlink:href", d.profile.image)
            .attr("x", -radius)
            .attr("y", -radius)
            .attr("width", radius * 2)
            .attr("height", radius * 2)
            .style("opacity", 0)
            .attr("filter", "url(#blur-effect)") // Always keep blur effect for peripheral nodes
            .transition()
            .duration(400) // Reduced from 1000ms to 400ms for faster appearance
            .style("opacity", 0.2); // Reduced from 0.3 to 0.2 (20% opacity)

          // Add a highlight for current user's peripheral node
          if (d.id === currentUserId) {
            d3.select(this)
              .append("circle")
              .attr("r", radius + 3) // Slightly larger than the node
              .attr("fill", "none")
              .attr("stroke", "#6366f1")
              .attr("stroke-width", 1.5)
              .attr("stroke-dasharray", "3,3")
              .attr("opacity", 0.8)
              .style("pointer-events", "none")
              .transition()
              .duration(400)
              .attr("opacity", 0.8);

            // Add "You" label for peripheral nodes too
            d3.select(this)
              .append("text")
              .attr("y", -radius - 12)
              .attr("text-anchor", "middle")
              .attr("font-size", "11px")
              .attr("font-weight", "bold")
              .attr("fill", "#6366f1")
              .attr("opacity", 0)
              .style("pointer-events", "none")
              .text("You")
              .transition()
              .duration(400)
              .attr("opacity", 0.9);
          }
        }
      });

      // Add continuous floating animation around the graph
      peripheralNodeElements.each(function (d, i) {
        if (!positions[i]) return;

        const baseX = positions[i]?.x ?? 0;
        const baseY = positions[i]?.y ?? 0;
        const nodeSelection = d3.select(this);

        (function animateNode() {
          // Calculate new random position near the original position
          const randomOffsetX = Math.random() * 60 - 30; // Random offset between -30 and +30 pixels
          const randomOffsetY = Math.random() * 60 - 30;
          const duration = 15000 + Math.random() * 10000; // Movement duration (15-25 seconds)

          // New coordinates that stay near the original position
          const newX = baseX + randomOffsetX;
          const newY = baseY + randomOffsetY;

          // Ensure we stay within bounds
          const safePadding = 50;
          const safeX = Math.max(
            safePadding,
            Math.min(width - safePadding, newX)
          );
          const safeY = Math.max(
            safePadding,
            Math.min(height - safePadding, newY)
          );

          nodeSelection
            .transition()
            .duration(duration)
            .ease(d3.easeSinInOut)
            .attr("transform", `translate(${safeX},${safeY})`)
            .on("end", animateNode); // Continue floating forever
        })();
      });

      // Add tooltip behavior to peripheral nodes
      peripheralNodeElements
        .on("mouseenter", function (event: any, d: User) {
          // Show tooltip
          tooltip.transition().duration(200).style("opacity", 0.9);

          // Check if necessary properties exist
          const name = d?.name || "Unknown";
          const affiliation = d?.profile?.currentAffiliation || "";
          const bio = d?.profile?.bio || "";

          const tooltipContent = `
          <div style="font-weight: bold; margin-bottom: 6px; font-size: 14px;">${name}</div>
          ${
            affiliation
              ? `<div style="margin-bottom: 8px; color: #555;">${affiliation}</div>`
              : ""
          }
          ${
            bio
              ? `<div style="margin-top: 8px; font-size: 12px; line-height: 1.4;">${bio}</div>`
              : ""
          }
          <div style="margin-top: 8px; font-style: italic; color: #666;">Click to view profile</div>
        `;

          tooltip.html(tooltipContent);

          // Calculate position to keep tooltip within viewport
          const tooltipWidth = 220;
          const tooltipNode = tooltip.node();
          const tooltipHeight = tooltipNode
            ? tooltipNode.getBoundingClientRect().height
            : 100;
          const windowWidth = window.innerWidth;
          const windowHeight = window.innerHeight;

          // Default position
          let left = event.pageX + 15;
          let top = event.pageY - 15;

          // Check right boundary and adjust if needed
          if (left + tooltipWidth > windowWidth - 20) {
            left = event.pageX - tooltipWidth - 15;
          }

          // Check bottom boundary and adjust if needed
          if (top + tooltipHeight > windowHeight - 20) {
            top = windowHeight - tooltipHeight - 20;
          }

          // Ensure top is never negative
          top = Math.max(20, top);

          // Set final position
          tooltip.style("left", left + "px").style("top", top + "px");

          // Highlight effect
          d3.select(this)
            .select("circle")
            .transition()
            .duration(300)
            .attr("stroke", COLORS.SELECTED_NODE_STROKE)
            .attr("stroke-width", 3);
        })
        .on("mouseleave", function () {
          // Hide tooltip
          tooltip.transition().duration(500).style("opacity", 0);

          // Remove highlight
          d3.select(this)
            .select("circle")
            .transition()
            .duration(300)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 2.5);
        });

      console.log(
        `Added ${randomNodes.length} peripheral nodes around the graph`
      );
    }

    /**
     * Apply special visual indicator for the current user
     */
    return () => {
      console.log("Cleaning up graph resources");
      // Clean up timer if it exists
      if (timer) clearTimeout(timer);

      // Cancel any pending animation frames
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Stop simulation if component unmounts to prevent memory leaks
      if (simulationRef.current) {
        simulationRef.current.stop();
      }

      // Clean up peripheral nodes data
      peripheralNodesRef.current = [];

      // Remove tooltip when component unmounts
      d3.select(".tooltip").remove();
    };
  }, [filteredData, getNodeRadius, safeGetId, updateNodeConnections]);

  // NOW WE CAN HAVE CONDITIONAL RETURNS AFTER ALL HOOKS ARE DEFINED

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading network data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-destructive">Failed to load network data</p>
          <p className="text-sm text-muted-foreground">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!data.nodes.length) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-muted-foreground">
            No network data available
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later for connections
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] w-full rounded-lg bg-white shadow">
      <div className="grid h-full grid-cols-1 gap-0">
        {/* Graph - takes full space now */}
        <div
          ref={containerRef}
          className="rounded relative h-full w-full overflow-hidden border bg-gray-50 transition-all"
        >
          <svg ref={svgRef} className="h-full w-full"></svg>
          {/* Search bar positioned inside graph view */}
          <UserSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchResults={searchResults}
            allUsers={data.nodes as User[]}
            onSelectUser={(userId: string) => {
              updateNodeConnections(userId);
              setSearchTerm("");
              setSearchResults([]);
            }}
            currentUser={
              currentUserId
                ? (dataNodesMap.get(currentUserId) as User)
                : undefined
            }
            currentUserId={currentUserId}
          />
          {/* Profile dialog */}
          <Profile
            selectedNode={selectedNode || undefined}
            connectionCount={connectionCount}
            directConnections={directConnections}
            onSelectConnection={(nodeId) => {
              updateNodeConnections(nodeId);
            }}
            currentUserId={currentUserId}
            currentUser={
              currentUserId
                ? (dataNodesMap.get(currentUserId) as User)
                : undefined
            }
            isOpen={isProfileDialogOpen}
            onClose={() => setIsProfileDialogOpen(false)}
          />
          {!isInitialRenderDone && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
              <div className="text-lg text-gray-600">
                Loading network graph...
              </div>
            </div>
          )}
          {/* Empty state message - no nodes */}
          {isInitialRenderDone && filteredData.nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <div className="mb-3 text-4xl">🕸️</div>
              <div className="mb-2 text-xl font-semibold text-primary">
                This network is socially distancing
              </div>
              <div className="max-w-md text-base text-gray-500">
                Looks like these nodes are playing hide and seek! Search for
                someone or select a connection to coax them out of hiding.
              </div>
            </div>
          )}
          {/* Lonely node message - single node with no connections */}
          {isInitialRenderDone &&
            filteredData.nodes.length === 1 &&
            filteredData.links.length === 0 && (
              <div className="absolute bottom-4 left-4 right-4 flex flex-col items-center justify-center rounded-lg bg-white bg-opacity-90 p-4 text-center shadow-sm">
                <div className="mb-2 text-2xl">🏝️</div>
                <div className="mb-1 text-lg font-medium text-primary">
                  Welcome to your personal island!
                </div>
                <div className="max-w-md text-sm text-gray-500">
                  You&apos;re a network pioneer! Start connecting with others to
                  build your web of relationships.
                </div>
              </div>
            )}

          {/* Mobile optimizations */}
          <div className="absolute left-0 right-0 top-14 mx-auto text-center md:hidden">
            <div className="inline-block rounded-full bg-white/90 px-3 py-1 text-xs text-gray-600 shadow-sm backdrop-blur-sm">
              Pinch to zoom, drag to move
            </div>
          </div>
        </div>
      </div>
      {/* Legend */}
      {/* <GraphLegend /> */}
      <svg className="invisible absolute" width="0" height="0">
        <defs>
          <filter
            id="current-user-glow"
            x="-75%"
            y="-75%"
            width="250%"
            height="250%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="#6366f1" floodOpacity="0.6" result="color" />
            <feComposite
              in="color"
              in2="blur"
              operator="in"
              result="blur-color"
            />
            <feComposite in="blur-color" in2="SourceGraphic" operator="over" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default CommunityNetworkGraph;
