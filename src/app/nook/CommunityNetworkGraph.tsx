/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// Define types for our data structures
interface User {
  id: string;
  name: string;
  eventsCreated: number;
  rsvps: number;
}

interface Link {
  source: string | { id: string };
  target: string | { id: string };
  value: number;
}

const CommunityNetworkGraph = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [connectionCount, setConnectionCount] = useState<number>(0);
  const [directConnections, setDirectConnections] = useState<
    Array<{ id: string; name: string; strength: number }>
  >([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);

  // Sample data with 10 nodes
  const data = {
    nodes: [
      { id: "user1", name: "Emma", eventsCreated: 5, rsvps: 12 },
      { id: "user2", name: "Liam", eventsCreated: 2, rsvps: 8 },
      { id: "user3", name: "Olivia", eventsCreated: 7, rsvps: 15 },
      { id: "user4", name: "Noah", eventsCreated: 1, rsvps: 6 },
      { id: "user5", name: "Ava", eventsCreated: 3, rsvps: 9 },
      { id: "user6", name: "Ethan", eventsCreated: 0, rsvps: 4 },
      { id: "user7", name: "Sophia", eventsCreated: 4, rsvps: 10 },
      { id: "user8", name: "Mason", eventsCreated: 2, rsvps: 7 },
      { id: "user9", name: "Isabella", eventsCreated: 6, rsvps: 14 },
      { id: "user10", name: "Logan", eventsCreated: 1, rsvps: 5 },
    ],
    links: [
      // Core community 1
      { source: "user1", target: "user2", value: 5 },
      { source: "user1", target: "user3", value: 4 },
      { source: "user1", target: "user9", value: 6 },
      { source: "user2", target: "user3", value: 3 },
      { source: "user3", target: "user9", value: 5 },

      // Core community 2
      { source: "user4", target: "user5", value: 4 },
      { source: "user4", target: "user10", value: 2 },
      { source: "user5", target: "user10", value: 3 },

      // Core community 3
      { source: "user6", target: "user7", value: 4 },
      { source: "user6", target: "user8", value: 3 },
      { source: "user7", target: "user8", value: 5 },

      // Cross-community connections
      { source: "user5", target: "user1", value: 1 },
      { source: "user8", target: "user4", value: 1 },
      { source: "user9", target: "user6", value: 2 },

      // Bidirectional connection example
      { source: "user2", target: "user7", value: 4 },
      { source: "user7", target: "user2", value: 3 },
    ],
  };

  // Function to safely get node or link ID regardless of whether it's a string or object
  const safeGetId = (item: any) => {
    if (!item) return null;
    return typeof item === "string" ? item : item.id;
  };

  // Handle search term changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filteredUsers = data.nodes.filter((user: User) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(filteredUsers);
  }, [searchTerm, data.nodes]);

  // Memoized function to update connections for a user
  const updateUserConnections = React.useCallback(
    (userId: string) => {
      const userData = data.nodes.find((n) => n.id === userId);
      if (!userData) return;

      setSelectedUser(userData);

      // Get connections for this user - handling bidirectional links
      // Use a Map for faster lookups
      const connectionMap = new Map();

      // Process all links in a single pass
      data.links.forEach((link) => {
        const sourceId = safeGetId(link.source);
        const targetId = safeGetId(link.target);

        if (sourceId === userId) {
          // Update or create connection entry
          const existingStrength = connectionMap.get(targetId) || 0;
          connectionMap.set(targetId, Math.max(existingStrength, link.value));
        } else if (targetId === userId) {
          // Update or create connection entry
          const existingStrength = connectionMap.get(sourceId) || 0;
          connectionMap.set(sourceId, Math.max(existingStrength, link.value));
        }
      });

      // Convert map to array and add user data
      const uniqueConnections: { id: any; name: string; strength: number }[] =
        [];

      connectionMap.forEach((strength, connectedId) => {
        const connectedUser = data.nodes.find(
          (node) => node.id === connectedId
        );
        if (connectedUser) {
          uniqueConnections.push({
            id: connectedId,
            name: connectedUser.name,
            strength,
          });
        }
      });

      // Sort by strength
      const sortedConnections = uniqueConnections.sort(
        (a, b) => b.strength - a.strength
      );

      setConnectionCount(sortedConnections.length);
      setDirectConnections(sortedConnections);
    },
    [data.links, data.nodes]
  );

  // Create and update the force-directed graph
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Use memoized dimensions to prevent unnecessary recalculations
    const width = 600;
    const height = 400;

    // Create SVG container
    const svgContainer = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%");

    const svg = svgContainer.append("g");

    // Add a border to better visualize the viewport area
    svg
      .append("circle")
      .attr("class", "viewport-border")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", Math.min(width, height) * 0.45)
      .attr("fill", "none")
      .attr("stroke", "#E5E7EB")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "5,5");

    // Add click handler to clear selection when clicking on background
    svg
      .append("rect")
      .attr("class", "background-click-handler")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .lower()
      .on("click", () => {
        setSelectedUser(null);
        setConnectionCount(0);
        setDirectConnections([]);
      });

    // Function to calculate node radius based on activity
    const getNodeRadius = (d: any) => {
      // Total activity = events created + RSVPs
      const totalActivity = (d.eventsCreated || 0) + (d.rsvps || 0);
      // Scale radius between 3 and 12 based on activity
      return 5 + Math.sqrt(totalActivity) * 1.5;
    };

    // Simplified community detection algorithm for faster initial loading
    const detectCommunities = (
      nodes: any[],
      links: { source: string; target: string; value: number }[]
    ) => {
      // Start with each node in its own community
      interface Community {
        id: string | number;
        members: (string | number)[];
      }
      const communities: Record<string | number, Community> = {};
      nodes.forEach((node: { id: string | number }) => {
        communities[node.id] = { id: node.id, members: [node.id] };
      });

      // Use a Map for faster lookups
      const communityLookup = new Map();
      nodes.forEach((node) => communityLookup.set(node.id, node.id));

      // Process only the strongest connections first (limit to top 75%)
      const sortedLinks = [...links].sort((a, b) => b.value - a.value);
      const topLinks = sortedLinks.slice(
        0,
        Math.ceil(sortedLinks.length * 0.75)
      );

      // Merge communities based on strong connections
      topLinks.forEach((link) => {
        const sourceId = safeGetId(link.source);
        const targetId = safeGetId(link.target);

        // Skip if they're already in the same community
        if (
          !sourceId ||
          !targetId ||
          communityLookup.get(sourceId) === communityLookup.get(targetId)
        )
          return;

        // Only merge on strong connections
        if (link.value >= 3) {
          const sourceCommunityId = communityLookup.get(sourceId);
          const targetCommunityId = communityLookup.get(targetId);

          const sourceCommunity = communities[sourceCommunityId];
          const targetCommunity = communities[targetCommunityId];

          if (!sourceCommunity || !targetCommunity) return;

          // Always merge smaller into larger for efficiency
          if (
            sourceCommunity.members.length >= targetCommunity.members.length
          ) {
            // Update the lookup map for all members of target community
            targetCommunity.members.forEach((memberId) => {
              communityLookup.set(memberId, sourceCommunityId);
            });

            // Merge members
            sourceCommunity.members = [
              ...sourceCommunity.members,
              ...targetCommunity.members,
            ];
            // We don't need to update the communities object for all members
            // since we're using the lookup map for faster access
          } else {
            // Update the lookup map for all members of source community
            sourceCommunity.members.forEach((memberId) => {
              communityLookup.set(memberId, targetCommunityId);
            });

            // Merge members
            targetCommunity.members = [
              ...targetCommunity.members,
              ...sourceCommunity.members,
            ];
          }
        }
      });

      // Create final community map using the lookup map
      const uniqueCommunityIds = new Set(communityLookup.values());
      const communityIdMap = new Map(
        [...uniqueCommunityIds].map((id, index) => [id, index])
      );

      const communityMap: Record<string | number, number> = {};
      nodes.forEach((node) => {
        const communityId = communityLookup.get(node.id);
        communityMap[node.id] = communityIdMap.get(communityId) || 0;
      });

      return {
        nodeMap: communityMap,
        count: uniqueCommunityIds.size,
      };
    };

    // Detect communities
    const communities = detectCommunities(data.nodes, data.links);

    // Color scale for communities
    const colorScale = d3
      .scaleOrdinal<string>(d3.schemeCategory10)
      .domain(d3.range(communities.count).map(String));

    // Create the force simulation with optimized settings
    // Cast nodes to the required SimulationNodeDatum type for D3

    // Initialize nodes in the center of the viewport
    data.nodes.forEach((node: any) => {
      node.x = width / 2 + (Math.random() - 0.5) * 20; // Add small random offset to prevent overlap
      node.y = height / 2 + (Math.random() - 0.5) * 20;
    });

    const simulation = d3
      .forceSimulation(data.nodes as d3.SimulationNodeDatum[])
      // Optimize link distance for faster stabilization
      .force(
        "link",
        d3
          .forceLink(
            data.links as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[]
          )
          .id((d: any) => d.id)
          .distance(80)
      )
      // Reduce strength for faster stabilization
      .force("charge", d3.forceManyBody().strength(-80))
      // Use center force for initial positioning
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.1))
      // Use positioning forces to keep disjointed graphs in the viewport
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1))
      .force(
        "collision",
        d3.forceCollide().radius((d) => getNodeRadius(d) + 2)
      )
      // Set a higher initial alpha and decay rate for faster stabilization
      .alpha(0.5)
      .alphaDecay(0.05);

    // Create links in the bottom layer
    const linkGroup = svg.append("g").attr("class", "links");
    const link = linkGroup
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value) * 1.2)
      .attr("stroke", (d: any) => {
        const sourceId = safeGetId(d.source);
        const targetId = safeGetId(d.target);

        // If source and target are in the same community, use the community color
        if (communities.nodeMap[sourceId] === communities.nodeMap[targetId]) {
          const communityId = communities.nodeMap[sourceId];
          const color = d3.color(
            colorScale(communityId !== undefined ? String(communityId) : "0")
          );
          // Convert the color to a string representation
          return color ? color.darker(0.5).toString() : "#6366F1";
        }

        // Otherwise, use a neutral color
        return "#6366F1";
      })
      .attr("stroke-opacity", 0.6);

    // Create nodes in the middle layer
    const nodeGroup = svg.append("g").attr("class", "nodes");
    const node = nodeGroup
      .selectAll(".node")
      .data(data.nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(
        d3
          .drag<SVGGElement, any>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("click", (event: MouseEvent, d: any) => {
        event.stopPropagation();
        updateUserConnections(d.id);
      });

    // Add circles to nodes
    node
      .append("circle")
      .attr("r", getNodeRadius)
      .attr("fill", (d) => {
        const communityId = communities.nodeMap[d.id];
        return colorScale(
          communityId !== undefined ? String(communityId) : "0"
        );
      }) // Color by community
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Add tooltip for hover info
    node
      .append("title")
      .text(
        (d) =>
          `${d.name}\nEvents Created: ${d.eventsCreated}\nRSVPs: ${d.rsvps}`
      );

    // Create text labels in the top layer
    const labelGroup = svg.append("g").attr("class", "text-labels");
    const labels = labelGroup
      .selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
      .attr("dx", 15)
      .attr("dy", 4)
      .text((d) => d.name)
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("fill", "#333")
      .style("opacity", 0) // Hidden by default
      .style("pointer-events", "none") // Don't interfere with mouse events
      .style("text-shadow", "0px 0px 3px white"); // Add a white halo for better visibility

    // Add hover behavior to show/hide names
    node
      .on("mouseenter", function (event, d) {
        // Find the corresponding text element in the labelGroup
        labelGroup
          .selectAll("text")
          .filter((textData: any) => textData.id === d.id)
          .transition()
          .duration(200)
          .style("opacity", "1");
      })
      .on("mouseleave", function (event, d) {
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
        // Update link positions
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        // Update node positions
        node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

        // Update label positions
        labels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);

        // Keep nodes within viewport bounds
        data.nodes.forEach((d: any) => {
          d.x = Math.max(
            getNodeRadius(d),
            Math.min(width - getNodeRadius(d), d.x)
          );
          d.y = Math.max(
            getNodeRadius(d),
            Math.min(height - getNodeRadius(d), d.y)
          );
        });
      }

      tickCount++;

      // Stop simulation early if we've reached a reasonable state
      if (tickCount > maxInitialTicks && simulation.alpha() < 0.03) {
        simulation.stop();
      }
    });

    // Drag functions
    function dragstarted(
      event: { active: any },
      d: { fx: any; x: any; fy: any; y: any }
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: { x: any; y: any }, d: { fx: any; fy: any }) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: { active: any }, d: { fx: null; fy: null }) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Set up a cleanup function to prevent memory leaks
    return () => {
      simulation.stop();
    };
  }, []);

  // Update visual state when selected user changes
  useEffect(() => {
    if (!svgRef.current) return;

    const svgElement = d3.select(svgRef.current);
    if (!svgElement.empty()) {
      const link = svgElement.selectAll("line");
      const node = svgElement.selectAll(".node");
      const labelGroup = svgElement.select(".text-labels");

      if (selectedUser) {
        // Pre-compute connected users for faster lookups
        const connectedUserSet = new Set();

        data.links.forEach((link) => {
          const sourceId = safeGetId(link.source);
          const targetId = safeGetId(link.target);

          if (sourceId === selectedUser.id) {
            connectedUserSet.add(targetId);
          } else if (targetId === selectedUser.id) {
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
            return sourceId === selectedUser.id || targetId === selectedUser.id
              ? "#ff6600"
              : "#6366F1";
          })
          .attr("stroke-opacity", (d: any) => {
            const sourceId = safeGetId(d.source);
            const targetId = safeGetId(d.target);
            return sourceId === selectedUser.id || targetId === selectedUser.id
              ? 1
              : 0.2;
          });

        // Highlight connected nodes - use the pre-computed set for faster lookups
        node
          .select("circle")
          .transition()
          .duration(400) // Shorter duration for faster response
          .attr("stroke", (d: any) => {
            if (d.id === selectedUser.id) return "#ff6600";
            return connectedUserSet.has(d.id) ? "#ff9955" : "#fff";
          })
          .attr("stroke-width", (d: any) => {
            if (d.id === selectedUser.id) return 3;
            return connectedUserSet.has(d.id) ? 2 : 1.5;
          });

        // Lower opacity for non-connected nodes - use the pre-computed set for faster lookups
        node
          .transition()
          .duration(400) // Shorter duration for faster response
          .attr("opacity", (d: any) => {
            if (d.id === selectedUser.id) return 1;
            return connectedUserSet.has(d.id) ? 1 : 0.3;
          });

        // Show names for selected and connected users, hide others
        labelGroup.selectAll("text").each(function (d: any) {
          const isSelectedOrConnected =
            d.id === selectedUser.id || connectedUserIds.includes(d.id);

          // Get the text element
          const textElement = d3.select(this);

          if (isSelectedOrConnected) {
            // For selected user and connections, always show name
            textElement
              .transition()
              .duration(400)
              .style("opacity", 1)
              .style(
                "font-weight",
                d.id === selectedUser.id ? "bold" : "normal"
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
          .attr("stroke", "#6366F1")
          .attr("stroke-opacity", 0.6);

        node
          .select("circle")
          .transition()
          .duration(800)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5);

        node.transition().duration(800).attr("opacity", 1);

        // Hide all names when no user is selected and restore hover behavior
        labelGroup
          .selectAll("text")
          .style("opacity", 0)
          .style("font-weight", "normal")
          .attr("data-keep-visible", null); // Clear the keep-visible flag for all
      }
    }
  }, [selectedUser]);

  return (
    <div className="w-full rounded-lg bg-white p-4 shadow">
      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search users..."
          className="rounded w-full border border-gray-300 p-2 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchResults.length > 0 && (
          <div className="rounded absolute z-10 mt-1 max-h-60 w-full overflow-y-auto border border-gray-300 bg-white shadow-lg">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="cursor-pointer p-2 hover:bg-indigo-50"
                onClick={() => {
                  updateUserConnections(user.id);
                  setSearchTerm("");
                  setSearchResults([]);
                }}
              >
                {user.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="rounded flex-grow border p-2">
          <svg ref={svgRef} className="h-80 w-full"></svg>
        </div>
        {selectedUser && (
          <div className="rounded border bg-gray-50 p-4 md:w-72">
            <h3 className="mb-3 border-b pb-2 text-lg font-bold">Profile</h3>

            <div className="space-y-4">
              <div className="rounded bg-indigo-100 p-3">
                <p className="text-xl font-bold text-indigo-800">
                  {selectedUser.name}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Activity Metrics
                </p>
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <div className="rounded bg-indigo-50 p-3">
                    <p className="text-xs text-gray-500">Events Created</p>
                    <p className="text-xl font-bold text-indigo-600">
                      {selectedUser.eventsCreated}
                    </p>
                  </div>
                  <div className="rounded bg-indigo-50 p-3">
                    <p className="text-xs text-gray-500">RSVPs</p>
                    <p className="text-xl font-bold text-indigo-600">
                      {selectedUser.rsvps}
                    </p>
                  </div>
                  <div className="rounded bg-indigo-50 p-3">
                    <p className="text-xs text-gray-500">Direct Connections</p>
                    <p className="text-xl font-bold text-indigo-600">
                      {connectionCount}
                    </p>
                  </div>
                </div>
              </div>

              {directConnections.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Connections
                  </p>
                  <div className="rounded mt-2 overflow-hidden border border-gray-200 bg-white">
                    <ul className="divide-y divide-gray-200">
                      {directConnections.map((connection) => (
                        <li
                          key={connection.id}
                          className="p-2 hover:bg-indigo-50"
                        >
                          <button
                            className="flex w-full items-center justify-between text-left text-sm"
                            onClick={() => updateUserConnections(connection.id)}
                          >
                            <span className="font-medium text-indigo-600 underline">
                              {connection.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              Strength: {connection.strength}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>• Larger circles = More activity (Events Created + RSVPs)</p>
        <p>• Different colors = Automatically detected communities</p>
        <p>• Connections = Co-attendance at events</p>
        <p>• Hover over a node to see the user&apos;s name</p>
        <p>
          • When a user is selected, their name and connections are always
          visible
        </p>
        <p>• Click on a user to view their profile</p>
        <p>• Use the search bar to find and select specific users</p>
      </div>
    </div>
  );
};

export default CommunityNetworkGraph;
