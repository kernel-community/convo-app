/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { data } from "../utils/mock";
import type { User, Project, NodeType } from "../utils/types";
import UserSearch from "./UserSearch";
import Profile from "./Profile";
import GraphLegend from "./GraphLegend";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

// Color constants using CSS variables from globals.css
const COLORS = {
  // Node colors
  USER_NODE: "var(--primary)", // Green for users
  PROJECT_NODE: "var(--secondary)", // Blue for projects
  FELLOW_INDICATOR: "var(--info)", // Purple/blue for fellow indicator

  // Link colors
  LINK_GRADIENT_START: "var(--secondary)",
  LINK_GRADIENT_END: "var(--secondary-muted)",
  LINK_DEFAULT_OPACITY: 0.6,
  LINK_FADED_OPACITY: 0.1,

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
  LABEL_PROJECT: "var(--secondary)",
  LABEL_USER: "var(--foreground)",
};

// Scale factor for selected nodes (adjust this value to experiment with different sizes)
const SELECTED_NODE_SCALE = 3;

const CommunityNetworkGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<User | Project | null>(null);
  const [connectionCount, setConnectionCount] = useState(0);
  const [directConnections, setDirectConnections] = useState<
    Array<{ id: string; name: string; strength: number; type: NodeType }>
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<(User | Project)[]>([]);
  // const [showLegend, setShowLegend] = useState(false); // Uncomment when legend feature is implemented
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Function to safely get node or link ID regardless of whether it's a string or object
  const safeGetId = useCallback((item: any) => {
    if (!item) return null;
    return typeof item === "string" ? item : item.id;
  }, []);

  // Handle search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filteredNodes = data.nodes.filter((node) =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) as (User | Project)[];

    setSearchResults(filteredNodes);
  }, [searchTerm]); // Only need to re-run when search term changes

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

        // Use router.replace to update URL without full navigation
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      }
    },
    [router, searchParams, pathname]
  );

  // Add this effect to clean up tooltips when URL parameters change
  useEffect(() => {
    // Clean up any tooltips when URL changes
    d3.select(".tooltip").transition().duration(200).style("opacity", 0);
  }, [searchParams]);

  // Memoized function to update connections for a node
  const updateNodeConnections = useCallback(
    (nodeId: string | null) => {
      // If nodeId is null, reset the selection
      if (nodeId === null) {
        setSelectedNode(null);
        setDirectConnections([]);
        setConnectionCount(0);

        // Reset all nodes and links to full opacity
        d3.selectAll(".node-group")
          .transition()
          .duration(300)
          .style("opacity", 1);

        // Reset all links to full opacity
        d3.selectAll(".links path")
          .transition()
          .duration(300)
          .style("opacity", 0.6);

        return;
      }

      const nodeData = data.nodes.find((n) => n.id === nodeId) as
        | User
        | Project;
      if (!nodeData) return;

      setSelectedNode(nodeData);

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

      // Extract unique connected nodes
      const connections = Array.from(connectionMap.entries()).map(
        ([connectedId]) => {
          // Find the connected node
          const connectedNode = data.nodes.find(
            (node) => node.id === connectedId
          );

          if (!connectedNode) return null;

          return {
            id: connectedId,
            name: connectedNode.name,
            strength: 1, // We could calculate this based on number of connections
            type: connectedNode.type as NodeType,
          };
        }
      );

      // Filter out nulls and sort by name
      const validConnections = connections.filter(Boolean) as Array<{
        id: string;
        name: string;
        strength: number;
        type: NodeType;
      }>;

      // Sort by name
      validConnections.sort((a, b) => a.name.localeCompare(b.name));

      setConnectionCount(validConnections.length);
      setDirectConnections(validConnections);

      // Get array of connected node IDs for easy lookup
      const connectedNodeIds = validConnections.map((conn) => conn.id);

      // Update visual appearance based on selection
      // Reduce opacity of non-connected nodes
      d3.selectAll(".node-group")
        .transition()
        .duration(300)
        .style("opacity", (d: any) => {
          // Selected node and its connections stay at full opacity
          return d.id === nodeId || connectedNodeIds.includes(d.id)
            ? 1
            : COLORS.NON_SELECTED_NODE_OPACITY;
        });

      // Hide links that don't involve the selected node
      d3.selectAll(".links path")
        .transition()
        .duration(300)
        .style("opacity", (d: any) => {
          const sourceId = safeGetId(d.source);
          const targetId = safeGetId(d.target);
          return sourceId === nodeId || targetId === nodeId
            ? COLORS.LINK_DEFAULT_OPACITY
            : COLORS.LINK_FADED_OPACITY;
        });
      // Update URL after D3 operations are complete
      setTimeout(() => {
        if (nodeId !== null) {
          const nodeData = data.nodes.find((n) => n.id === nodeId) as
            | User
            | Project;
          if (nodeData) {
            setSelectedNode(nodeData);
          }
        }
      }, 0);
    },
    [safeGetId]
  );

  // Define simulation reference to use in drag functions
  const simulationRef = useRef<d3.Simulation<
    d3.SimulationNodeDatum,
    undefined
  > | null>(null);

  // Function to calculate node radius based on activity
  const getNodeRadius = useCallback((node: any): number => {
    if (node.type === "project") {
      // Projects have a fixed, larger radius
      return 10;
    } else {
      // For users, calculate based on activity
      const totalActivity =
        (node.convo?.eventsCreated || 0) + (node.convo?.rsvps || 0);
      return 5 + Math.sqrt(totalActivity) * 1.5;
    }
  }, []);

  // Create and update the force-directed graph
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up the SVG container with responsive dimensions
    const width = svgRef.current.clientWidth;
    const height = 600; // Fixed height for better layout control

    const svg = d3
      .select(svgRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;")
      .attr("font-family", "system-ui, sans-serif")
      .attr("text-anchor", "middle");

    // Add a background rect for zoom/pan handling
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .lower()
      .on("click", () => {
        updateNodeConnections(null);
      });

    // Use color constants for node types
    const nodeColors = {
      user: COLORS.USER_NODE,
      project: COLORS.PROJECT_NODE,
    };

    // Create the force simulation with optimized settings
    // Cast nodes to the required SimulationNodeDatum type for D3

    // Initialize nodes in the center of the viewport
    data.nodes.forEach((node: any) => {
      node.x = width / 2 + (Math.random() - 0.5) * 20; // Add small random offset to prevent overlap
      node.y = height / 2 + (Math.random() - 0.5) * 20;
    });

    // Create force simulation
    const simulation = d3
      .forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      .force(
        "link",
        d3
          .forceLink(data.links)
          .id((d: any) => d.id)
          .distance(70)
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .alphaDecay(0.05);

    // Store simulation in ref for potential use outside this effect
    simulationRef.current = simulation;

    // Set up a gradient for links
    const defs = svg.append("defs");

    // Create gradient for links
    const gradient = defs
      .append("linearGradient")
      .attr("id", "link-gradient")
      .attr("gradientUnits", "userSpaceOnUse");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", COLORS.LINK_GRADIENT_START);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", COLORS.LINK_GRADIENT_END);

    // Add drop shadow filter for nodes
    const filter = defs
      .append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "130%");

    filter
      .append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 3)
      .attr("result", "blur");

    filter
      .append("feOffset")
      .attr("in", "blur")
      .attr("dx", 1)
      .attr("dy", 1)
      .attr("result", "offsetBlur");

    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "offsetBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Function to create curved paths between nodes
    const linkArc = (d: any) => {
      const dx = d.target.x - d.source.x;
      const dy = d.target.y - d.source.y;
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Curve radius
      return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
    };

    // Create links in the bottom layer with curved paths
    const linkGroup = svg.append("g").attr("class", "links");
    const link = linkGroup
      .selectAll("path")
      .data(data.links)
      .enter()
      .append("path")
      .attr("stroke", "url(#link-gradient)")
      .attr("fill", "none")
      .attr("stroke-width", () => 1.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-opacity", COLORS.LINK_DEFAULT_OPACITY)
      .style("mix-blend-mode", "multiply");

    // Create nodes in the middle layer
    const nodeGroup = svg.append("g").attr("class", "nodes");
    const node = nodeGroup
      .selectAll(".node")
      .data(data.nodes)
      .enter()
      .append("g")
      .attr("class", "node-group")
      .call(
        d3
          .drag<SVGGElement, any>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", (event: any, d: any) => {
        event.stopPropagation();
        updateNodeConnections(d.id);
        d3.select(".tooltip").transition().duration(200).style("opacity", 0);
      });

    // Project nodes are now identified by their blue color

    // Add visual indicator for fellows
    node
      .filter((d: any) => d.type === "user" && d.isFellow === true)
      .append("circle")
      .attr("r", 3)
      .attr("cx", (d: any) => -getNodeRadius(d) - 2)
      .attr("fill", COLORS.FELLOW_INDICATOR)
      .attr("stroke", COLORS.DEFAULT_NODE_STROKE)
      .attr("stroke-width", 1);

    // Get the currently selected node ID from URL parameter
    const selectedNodeId = searchParams.get("id");

    // Add circles to nodes with modern styling
    node
      .append("circle")
      .attr("r", (d: any) => {
        // Make the selected node scaled in size based on URL parameter
        return selectedNodeId && d.id === selectedNodeId
          ? getNodeRadius(d) * SELECTED_NODE_SCALE
          : getNodeRadius(d);
      })
      .attr("fill", (d: any) => {
        return nodeColors[d.type as keyof typeof nodeColors] || "#9C27B0"; // Fallback color for unknown types
      })
      .attr("stroke", "none")
      .style("filter", "none")
      .style("cursor", "pointer")
      .transition()
      .duration(800)
      .ease(d3.easeBounceOut)
      .attr("r", (d: any) => {
        // Maintain the scaled size for selected node after transition
        return selectedNodeId && d.id === selectedNodeId
          ? getNodeRadius(d) * SELECTED_NODE_SCALE
          : getNodeRadius(d);
      });

    // Remove any existing tooltips to prevent duplicates
    d3.selectAll("body > .tooltip").remove();

    // Create modern tooltip with transitions
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("font-family", "system-ui, sans-serif")
      .style("font-size", "12px")
      .style("background", "white")
      .style("color", "#333")
      .style("border-radius", "8px")
      .style("padding", "0")
      .style("box-shadow", "0 4px 12px rgba(0, 0, 0, 0.15)")
      .style("transition", "opacity 0.3s");

    // Add hover behavior with tooltip
    node
      .on("mouseenter", function (event: any, d: any) {
        // Don't change the size of the selected node on hover
        if (!selectedNodeId || d.id !== selectedNodeId) {
          d3.select(this)
            .select("circle")
            .transition()
            .duration(300)
            .attr("r", (d: any) => getNodeRadius(d) * 1.2);
        }

        let tooltipContent = "";

        if (d.type === "project") {
          // Project node tooltip
          tooltipContent = `
            <div style="padding: 12px; width: 250px;">
              <div style="font-weight: 600; font-size: 14px; color: ${
                COLORS.TOOLTIP_TITLE
              };">${d.name}</div>
              <div style="margin-top: 4px; font-size: 12px; color: ${
                COLORS.TOOLTIP_TEXT
              };">Project</div>
              ${
                d.description
                  ? `<div style="margin-top: 6px; font-size: 12px; color: ${
                      COLORS.TOOLTIP_TEXT
                    }; overflow: hidden; text-overflow: ellipsis;">${
                      d.description.length > 120
                        ? d.description.substring(0, 120) + "..."
                        : d.description
                    }</div>`
                  : ""
              }
              ${
                d.keywords || (d.profile && d.profile.keywords)
                  ? `<div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
                ${(d.keywords || (d.profile && d.profile.keywords) || [])
                  .map(
                    (keyword: string) =>
                      `<span style="background: ${COLORS.TOOLTIP_TAG_BG}; color: ${COLORS.TOOLTIP_TAG_TEXT}; font-size: 10px; padding: 2px 8px; border-radius: 12px;">${keyword}</span>`
                  )
                  .join("")}
              </div>`
                  : ""
              }
              ${
                d.status
                  ? `<div style="margin-top: 6px; font-size: 11px;"><span style="background: ${COLORS.TOOLTIP_STATUS_BG}; color: ${COLORS.TOOLTIP_STATUS_TEXT}; padding: 2px 8px; border-radius: 12px;">${d.status}</span></div>`
                  : ""
              }
              ${
                d.url
                  ? `<div style="margin-top: 6px; font-size: 12px;"><a href="${d.url}" target="_blank" style="color: ${COLORS.TOOLTIP_LINK}; text-decoration: none;">View Project</a></div>`
                  : ""
              }
            </div>
          `;
        } else {
          // User node tooltip
          tooltipContent = `
            <div style="padding: 12px; width: 250px;">
              <div style="font-weight: 600; font-size: 14px; color: ${
                COLORS.TOOLTIP_TITLE
              };">${d.name}</div>
              ${
                d.bio || (d.profile && d.profile.bio)
                  ? `<div style="margin-top: 6px; font-size: 12px; color: ${
                      COLORS.TOOLTIP_TEXT
                    }; overflow: hidden; text-overflow: ellipsis;">${
                      (d.bio || (d.profile && d.profile.bio) || "").length > 120
                        ? (d.bio || (d.profile && d.profile.bio)).substring(
                            0,
                            120
                          ) + "..."
                        : d.bio || (d.profile && d.profile.bio)
                    }</div>`
                  : ""
              }
              ${
                d.keywords || (d.profile && d.profile.keywords)
                  ? `<div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;">
                ${(d.keywords || (d.profile && d.profile.keywords) || [])
                  .map(
                    (keyword: string) =>
                      `<span style="background: ${COLORS.TOOLTIP_TAG_BG}; color: ${COLORS.TOOLTIP_TAG_TEXT}; font-size: 10px; padding: 2px 8px; border-radius: 12px;">${keyword}</span>`
                  )
                  .join("")}
              </div>`
                  : ""
              }
              ${
                d.city ||
                d.currentAffiliation ||
                (d.profile && (d.profile.city || d.profile.currentAffiliation))
                  ? `<div style="display: flex; align-items: center; margin-top: 6px; font-size: 11px; color: ${
                      COLORS.TOOLTIP_SECONDARY
                    };">
                ${
                  d.city || (d.profile && d.profile.city)
                    ? `<span style="display: flex; align-items: center; margin-right: 8px;">
                  <svg style="width: 12px; height: 12px; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  ${d.city || (d.profile && d.profile.city)}
                </span>`
                    : ""
                }
                ${(() => {
                  // Find project connections for this user
                  const projectConnections = data.links
                    .filter((link) => {
                      const sourceId =
                        typeof link.source === "string"
                          ? link.source
                          : (link.source as { id: string }).id;
                      const targetId =
                        typeof link.target === "string"
                          ? link.target
                          : (link.target as { id: string }).id;
                      return (
                        (sourceId === d.id && targetId.startsWith("project")) ||
                        (targetId === d.id && sourceId.startsWith("project"))
                      );
                    })
                    .map((link) => {
                      const sourceId =
                        typeof link.source === "string"
                          ? link.source
                          : (link.source as { id: string }).id;
                      const targetId =
                        typeof link.target === "string"
                          ? link.target
                          : (link.target as { id: string }).id;
                      const projectId = sourceId.startsWith("project")
                        ? sourceId
                        : targetId;
                      const linkType = link.type || "member";

                      // Find the project node
                      const project = data.nodes.find(
                        (node) => node.id === projectId
                      );
                      if (!project) return null;

                      return {
                        name: project.name,
                        type: linkType,
                        id: projectId,
                      };
                    })
                    .filter(Boolean) as Array<{
                    name: string;
                    type: string;
                    id: string;
                  }>;

                  if (projectConnections.length > 0) {
                    return projectConnections
                      .map(
                        (projectConn) =>
                          `<span style="display: flex; align-items: center; margin-bottom: 4px;">
                        <svg style="width: 12px; height: 12px; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                        ${projectConn.name} <span style="font-size: 9px; margin-left: 4px; opacity: 0.7;">(${projectConn.type})</span>
                      </span>`
                      )
                      .join("");
                  } else if (
                    d.currentAffiliation ||
                    (d.profile && d.profile.currentAffiliation)
                  ) {
                    return `<span style="display: flex; align-items: center;">
                      <svg style="width: 12px; height: 12px; margin-right: 4px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                      </svg>
                      ${
                        d.currentAffiliation ||
                        (d.profile && d.profile.currentAffiliation)
                      }
                    </span>`;
                  } else {
                    return "";
                  }
                })()}
              </div>`
                  : ""
              }
            </div>
          `;
        }

        tooltip
          .html(tooltipContent)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px")
          .transition()
          .duration(200)
          .style("opacity", 0.95);
      })
      .on("mouseleave", function (event: any, d: any) {
        // Don't change the size of the selected node on mouseout
        if (!selectedNodeId || d.id !== selectedNodeId) {
          d3.select(this)
            .select("circle")
            .transition()
            .duration(300)
            .attr("r", (d: any) => getNodeRadius(d));
        }

        tooltip.transition().duration(500).style("opacity", 0);
      });

    // Create text labels in the top layer
    const labelGroup = svg.append("g").attr("class", "text-labels");
    const labels = labelGroup
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text((d) => d.name)
      .style("font-family", "system-ui, sans-serif")
      .style("font-size", (d) => (d.type === "project" ? "11px" : "10px"))
      .style("font-weight", (d) => (d.type === "project" ? "600" : "normal"))
      .style("pointer-events", "none")
      .style("opacity", 0.8)
      .style(
        "text-shadow",
        "0 1px 2px rgba(255,255,255,0.8), 0 -1px 1px rgba(255,255,255,0.8), 1px 0 1px rgba(255,255,255,0.8), -1px 0 1px rgba(255,255,255,0.8)"
      )
      .style("fill", (d) =>
        d.type === "project" ? COLORS.LABEL_PROJECT : COLORS.LABEL_USER
      );

    // Add hover behavior to show/hide names
    node
      .on("mouseenter", function (event, d: any) {
        // Find the corresponding text element in the labelGroup
        labelGroup
          .selectAll("text")
          .filter((textData: any) => textData.id === d.id)
          .transition()
          .duration(200)
          .style("opacity", "1");
      })
      .on("mouseleave", function (event, d: any) {
        // Find the corresponding text element in the labelGroup
        labelGroup
          .selectAll("text")
          .filter((textData: any) => textData.id === d.id)
          .transition()
          .duration(200)
          .style("opacity", function (this: any) {
            // If the element has the keep-visible data attribute, don't hide it
            if (d3.select(this).attr("data-keep-visible") === "true") {
              return "1";
            }
            return "0";
          });
      });

    // Optimize the tick function to reduce calculations
    // Limit the number of ticks during initial rendering
    let tickCount = 0;
    const maxInitialTicks = 100; // Limit initial ticks for faster rendering

    simulation.on("tick", () => {
      // Only update visuals every other tick during initial stabilization
      if (tickCount > maxInitialTicks || tickCount % 2 === 0) {
        // Update link positions with curved paths
        link.attr("d", linkArc);

        // Update node positions
        node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

        // Update label positions
        labels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);

        // Keep nodes within viewport bounds
        data.nodes.forEach((d: any) => {
          const selectedNodeId = searchParams.get("id");
          const effectiveRadius =
            selectedNodeId && d.id === selectedNodeId
              ? getNodeRadius(d) * 2
              : getNodeRadius(d);

          d.x = Math.max(
            effectiveRadius,
            Math.min(width - effectiveRadius, d.x)
          );
          d.y = Math.max(
            effectiveRadius,
            Math.min(height - effectiveRadius, d.y)
          );
        });
      }

      tickCount++;

      // Stop simulation early if we've reached a reasonable state
      if (tickCount > maxInitialTicks && simulation.alpha() < 0.03) {
        simulation.stop();
      }
    });

    // Enhanced drag functions with visual feedback
    function dragstarted(
      event: { active: any; sourceEvent: any },
      d: { fx: any; x: any; fy: any; y: any; id?: string }
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;

      // Visual feedback when dragging starts
      d3.select(event.sourceEvent.target)
        .transition()
        .duration(200)
        .style("opacity", 0.8);

      // Ensure we don't change the radius of the selected node
      const selectedNodeId = searchParams.get("id");
      if (selectedNodeId && d.id === selectedNodeId) {
        d3.select(event.sourceEvent.target).attr(
          "r",
          getNodeRadius(d) * SELECTED_NODE_SCALE
        );
      }
    }

    function dragged(event: { x: any; y: any }, d: { fx: any; fy: any }) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(
      event: { active: any; sourceEvent: any },
      d: { fx: null; fy: null; id?: string }
    ) {
      if (!event.active) simulation.alphaTarget(0);

      // Animate node settling after drag
      d3.select(event.sourceEvent.target)
        .transition()
        .duration(500)
        .style("opacity", 1);

      // Ensure we maintain the 2x size for selected nodes after drag
      const selectedNodeId = searchParams.get("id");
      if (selectedNodeId && d.id === selectedNodeId) {
        d3.select(event.sourceEvent.target).attr(
          "r",
          getNodeRadius(d) * SELECTED_NODE_SCALE
        );
      }

      // Release node after dragging
      d.fx = null;
      d.fy = null;
    }

    // Set up a cleanup function to prevent memory leaks
    return () => {
      simulation.stop();
    };
  }, [safeGetId, getNodeRadius]); // Added getNodeRadius to dependencies

  // Update visual state when selected node changes
  useEffect(() => {
    if (!svgRef.current) return;

    const svgElement = d3.select(svgRef.current);
    if (!svgElement.empty()) {
      const link = svgElement.selectAll("line");
      const node = svgElement.selectAll(".node-group");
      const labelGroup = svgElement.select(".text-labels");

      if (selectedNode) {
        // Pre-compute connected users for faster lookups
        const connectedUserSet = new Set();

        data.links.forEach((link) => {
          const sourceId = safeGetId(link.source);
          const targetId = safeGetId(link.target);

          if (sourceId === selectedNode.id) {
            connectedUserSet.add(targetId);
          } else if (targetId === selectedNode.id) {
            connectedUserSet.add(sourceId);
          }
        });

        // Convert to array for compatibility with existing code
        const connectedUserIds = Array.from(connectedUserSet);

        // Use shorter transition duration for faster response
        link
          .transition()
          .duration(400)
          .attr("stroke", (d: any) => {
            const sourceId = safeGetId(d.source);
            const targetId = safeGetId(d.target);
            return sourceId === selectedNode.id || targetId === selectedNode.id
              ? COLORS.SELECTED_NODE_STROKE
              : COLORS.LINK_GRADIENT_START;
          })
          .style("stroke-opacity", (d: any) => {
            const sourceId = safeGetId(d.source);
            const targetId = safeGetId(d.target);
            return sourceId === selectedNode.id || targetId === selectedNode.id
              ? 1
              : 0.2;
          });

        // Highlight connected nodes - use the pre-computed set for faster lookups
        node
          .select("circle")
          .transition()
          .duration(400) // Shorter duration for faster response
          .attr("r", (d: any) => {
            // Make selected node scaled in size
            if (d.id === selectedNode.id)
              return getNodeRadius(d) * SELECTED_NODE_SCALE;
            return getNodeRadius(d);
          })
          .attr("stroke", (d: any) => {
            if (d.id === selectedNode.id) return COLORS.SELECTED_NODE_STROKE;
            return connectedUserSet.has(d.id)
              ? COLORS.CONNECTED_NODE_STROKE
              : COLORS.DEFAULT_NODE_STROKE;
          })
          .attr("stroke-width", (d: any) => {
            if (d.id === selectedNode.id) return 3;
            return connectedUserSet.has(d.id) ? 2 : 1.5;
          });

        // Lower opacity for non-connected nodes - use the pre-computed set for faster lookups
        node
          .transition()
          .duration(400) // Shorter duration for faster response
          .style("opacity", (d: any) => {
            // Always keep the selected node at full opacity
            if (d.id === selectedNode.id) return 1;
            // Connected nodes at full opacity, others faded
            return connectedUserSet.has(d.id)
              ? 1
              : COLORS.NON_SELECTED_NODE_OPACITY;
          });

        // Show names for selected and connected users, hide others
        labelGroup.selectAll("text").each(function (d: any) {
          const isSelectedOrConnected =
            d.id === selectedNode.id || connectedUserIds.includes(d.id);

          // Get the text element
          const textElement = d3.select(this);

          if (isSelectedOrConnected) {
            // For selected user and connections, always show name
            textElement
              .transition()
              .duration(400)
              .style("opacity", "1")
              .style(
                "font-weight",
                d.id === selectedNode.id ? "bold" : "normal"
              );

            // Add a data attribute to mark this as a text to keep visible
            textElement.attr("data-keep-visible", "true");
          } else {
            // For other nodes, reset to default behavior (hide name, show on hover)
            textElement.style("opacity", 0).style("font-weight", "normal");

            // Remove the keep-visible data attribute
            textElement.attr("data-keep-visible", null);
          }
        });
      } else {
        // Reset all styles when no user is selected
        link
          .transition()
          .duration(800)
          .attr("stroke", COLORS.LINK_GRADIENT_START)
          .style("stroke-opacity", COLORS.LINK_DEFAULT_OPACITY);

        node
          .select("circle")
          .transition()
          .duration(800)
          .attr("r", (d: any) => getNodeRadius(d)) // Reset radius to original size
          .attr("stroke", COLORS.DEFAULT_NODE_STROKE)
          .attr("stroke-width", 1.5);

        // Reset all node styles
        node.attr("data-selected", null);

        node.transition().duration(800).style("opacity", 1);

        // Hide all names when no user is selected and restore hover behavior
        labelGroup
          .selectAll("text")
          .style("opacity", 0)
          .style("font-weight", "normal")
          .attr("data-keep-visible", null); // Clear the keep-visible flag for all
      }
    }
  }, [selectedNode, safeGetId, updateNodeConnections, getNodeRadius]);

  useEffect(() => {
    // Get the 'id' parameter from the URL
    const userId = searchParams.get("id");

    if (userId) {
      // Find the node with this ID
      const nodeData = data.nodes.find((n) => n.id === userId);
      if (nodeData) {
        // Update connections using the existing function
        updateNodeConnections(userId);
      }
    }
  }, [searchParams, updateNodeConnections]);

  // Update URL when selected node changes
  useEffect(() => {
    if (selectedNode) {
      updateUrlWithNodeId(selectedNode.id);
    } else {
      updateUrlWithNodeId(null);
    }
  }, [selectedNode, updateUrlWithNodeId, updateNodeConnections]);

  return (
    <div className="w-full rounded-lg bg-white p-4 shadow">
      {/* Search bar */}
      <UserSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchResults={searchResults}
        allUsers={data.nodes as Array<User | Project>}
        onSelectUser={(userId: string) => {
          updateNodeConnections(userId);
          setSearchTerm("");
          setSearchResults([]);
        }}
      />
      <div className="grid h-[600px] grid-cols-1 gap-4 md:h-[700px] md:grid-cols-3">
        {/* Graph - takes 2/3 of the space on desktop */}
        <div className="rounded h-full overflow-hidden border p-2 md:col-span-2">
          <svg ref={svgRef} className="h-full w-full"></svg>
        </div>
        {/* Profile - takes 1/3 of the space on desktop, always displayed with default state handled inside the component */}
        <div className="profile-container h-full w-full overflow-y-auto">
          <Profile
            selectedNode={selectedNode || undefined}
            connectionCount={connectionCount}
            directConnections={directConnections}
            onSelectConnection={(nodeId) => {
              updateNodeConnections(nodeId);
            }}
          />
        </div>
      </div>
      {/* Legend */}
      <GraphLegend />
    </div>
  );
};

export default CommunityNetworkGraph;
