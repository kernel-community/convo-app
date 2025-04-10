// components/MapView.tsx
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Define TypeScript interfaces
interface MapViewProps {
  markers?: Marker[];
  initialCenter?: [number, number];
  showUserLocation?: boolean;
  zoom?: number;
  className?: string;
}

export interface Marker {
  id: string | number;
  longitude: number;
  latitude: number;
  title?: string;
  color?: string;
  nodes?: string[]; // Array of node IDs in this location
}

const MapView: React.FC<MapViewProps> = ({
  markers = [],
  initialCenter = [0, 0],
  showUserLocation = false,
  zoom = 1,
  className = "",
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  // We only need the setter function for user location
  const [, setUserLocation] = useState<[number, number] | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Handle resize when map becomes visible (e.g., in tabs)
  useEffect(() => {
    // If map exists and container exists, trigger a resize
    if (map.current && mapContainer.current) {
      // Use setTimeout to ensure the map has had time to render
      const resizeTimer = setTimeout(() => {
        if (map.current) {
          map.current.resize();
          console.log("Map resized after visibility change");
        }
      }, 200);

      return () => clearTimeout(resizeTimer);
    }
  }, [mapLoaded]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Set access token - hardcode for development to ensure it's available
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYW5nZyIsImEiOiJjbTY4bnY0eGkwNXRiMmpuMzVrczRtcXgwIn0.AoGABuGZQtn-McazrkClOA";

    // Create map instance with global view settings
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [0, 0], // Center at [0,0] for global view
      zoom: 1, // Start fully zoomed out
      maxBounds: [
        [-180, -85],
        [180, 85],
      ], // Set max bounds to show the entire world
      renderWorldCopies: true, // Show multiple copies of the world
    });

    // Set map as loaded
    setMapLoaded(true);

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Wait for map to load
    map.current.on("load", () => {
      setMapLoaded(true);
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [initialCenter, zoom]);

  // Get user location if enabled
  useEffect(() => {
    if (!showUserLocation || !mapLoaded || !map.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);

        // Center map on user location
        map.current?.flyTo({
          center: [longitude, latitude],
          zoom: 13,
        });

        // Add user location marker
        const userMarkerElement = document.createElement("div");
        userMarkerElement.className = "user-marker";
        userMarkerElement.style.backgroundColor = "#4285F4";
        userMarkerElement.style.width = "20px";
        userMarkerElement.style.height = "20px";
        userMarkerElement.style.borderRadius = "50%";
        userMarkerElement.style.border = "3px solid white";
        userMarkerElement.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.25)";

        if (map.current) {
          new mapboxgl.Marker(userMarkerElement)
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setHTML("<h3>You are here</h3>"))
            .addTo(map.current);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  }, [mapLoaded, showUserLocation]);

  // Add custom markers
  useEffect(() => {
    // Early return if map is not loaded or not available
    if (!mapLoaded || !map.current) return;

    console.log("Adding markers:", markers); // Debug log

    // Wait for the style to be fully loaded before adding markers
    if (map.current && !map.current.isStyleLoaded()) {
      console.log("Style not loaded yet, waiting...");

      // Listen for the style.load event
      const onStyleLoad = () => {
        console.log("Style loaded, now adding markers");
        if (map.current) {
          addMarkersToMap();
        }
      };

      map.current.once("style.load", onStyleLoad);

      // Also set a timeout as a fallback
      setTimeout(() => {
        if (map.current) {
          console.log("Style loaded check after timeout");
          if (map.current.isStyleLoaded()) {
            console.log("Style loaded after timeout, adding markers");
            addMarkersToMap();
          } else {
            console.log(
              "Style still not loaded after timeout, forcing marker addition"
            );
            // Force add markers even if style isn't loaded
            addMarkersToMap();
          }
        }
      }, 2000);
    } else {
      // Style is already loaded, add markers directly
      console.log("Style already loaded, adding markers immediately");
      addMarkersToMap();
    }

    // Define the function to add markers to the map
    function addMarkersToMap() {
      // Safety check - make sure map.current is still available
      if (!map.current) return;

      console.log("Executing addMarkersToMap function");

      // Create bounds to fit all markers
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidBounds = false;

      // Remove any existing sources and layers
      try {
        if (
          map.current &&
          map.current.getStyle() &&
          map.current.getSource("markers-source")
        ) {
          if (map.current.getLayer("markers-circle")) {
            map.current.removeLayer("markers-circle");
          }
          map.current.removeSource("markers-source");
        }
      } catch (error) {
        console.log("Note: Could not remove existing sources/layers", error);
      }

      // Add all markers as a GeoJSON source
      if (markers.length > 0 && map.current) {
        try {
          // Create a GeoJSON data source with all marker points
          map.current.addSource("markers-source", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: markers.map((marker) => {
                // Extend bounds with this marker
                bounds.extend([marker.longitude, marker.latitude]);
                hasValidBounds = true;

                return {
                  type: "Feature",
                  properties: {
                    id: marker.id,
                    title: marker.title,
                    color: marker.color || "#FF0000",
                    description: `${marker.latitude.toFixed(
                      4
                    )}, ${marker.longitude.toFixed(4)}`,
                    nodes: marker.nodes || [],
                    nodeCount: marker.nodes ? marker.nodes.length : 0,
                  },
                  geometry: {
                    type: "Point",
                    coordinates: [marker.longitude, marker.latitude],
                  },
                };
              }),
            },
          });

          // Add a circle layer for the markers
          map.current.addLayer({
            id: "markers-circle",
            type: "circle",
            source: "markers-source",
            paint: {
              "circle-radius": 12,
              "circle-color": ["get", "color"],
              "circle-opacity": 0.8,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#ffffff",
            },
          });

          // Add popups when clicking on markers
          map.current.on(
            "click",
            "markers-circle",
            (e: mapboxgl.MapLayerMouseEvent) => {
              if (!e.features || e.features.length === 0 || !map.current)
                return;

              const feature = e.features[0];
              if (!feature || !feature.geometry || !feature.properties) return;

              // Type assertion for Point geometry
              const geometry = feature.geometry as GeoJSON.Point;
              const coordinates = geometry.coordinates.slice() as [
                number,
                number
              ];
              const title = feature.properties.title as string;
              const color = feature.properties.color as string;
              const description = feature.properties.description as string;

              // Create popup HTML
              const nodes = (feature.properties.nodes as string[]) || [];
              const nodeCount = (feature.properties.nodeCount as number) || 0;

              // Create popup HTML with node information
              const popupHTML = `
              <div style="padding: 10px; text-align: center; border-radius: 8px;">
                <h3 style="margin: 0 0 8px 0; color: ${color}; font-weight: bold; font-size: 16px;">${title}</h3>
                <div style="font-size: 12px; color: #666;">${description}</div>
                <div style="font-size: 12px; margin-top: 8px; font-weight: bold;">${nodeCount} ${
                nodeCount === 1 ? "Node" : "Nodes"
              } at this location</div>
                ${
                  nodeCount > 0
                    ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">${
                        Array.isArray(nodes) ? nodes.slice(0, 3).join(", ") : ""
                      }${
                        nodeCount > 3 ? " and ${nodeCount - 3} more..." : ""
                      }</div>`
                    : ""
                }
              </div>
            `;

              // Create and show the popup
              new mapboxgl.Popup({
                closeButton: false,
                className: "custom-popup",
              })
                .setLngLat(coordinates)
                .setHTML(popupHTML)
                .addTo(map.current);
            }
          );

          // Change cursor to pointer when hovering over markers
          map.current.on("mouseenter", "markers-circle", () => {
            if (map.current) map.current.getCanvas().style.cursor = "pointer";
          });

          map.current.on("mouseleave", "markers-circle", () => {
            if (map.current) map.current.getCanvas().style.cursor = "";
          });

          console.log("Added GeoJSON markers successfully");

          // Fit map to bounds if we have markers
          if (hasValidBounds && map.current) {
            setTimeout(() => {
              if (map.current && map.current.isStyleLoaded()) {
                try {
                  // Fit bounds with padding
                  map.current.fitBounds(bounds, {
                    padding: 100,
                    maxZoom: 2, // Lower maxZoom to ensure a more zoomed out view
                  });
                  console.log("Bounds fitted successfully");
                } catch (error) {
                  console.error("Error fitting bounds:", error);
                }
              }
            }, 1000); // Increased timeout
          }
        } catch (error) {
          console.error("Error adding GeoJSON markers:", error);
        }
      }
    } // End of addMarkersToMap function

    // Cleanup function to remove event listeners and layers
    return () => {
      if (map.current) {
        // Try to remove any style.load event listeners
        try {
          // Use a named function reference to avoid ESLint warning
          const noOp = function () {
            /* no operation */
          };
          map.current.off("style.load", noOp);
        } catch (error) {
          // Ignore errors when removing event listeners
          console.log("Note: Could not remove style.load listeners");
        }

        // TypeScript requires us to be more specific with the event handlers
        // So we'll just try to remove the layer and source directly
        try {
          if (map.current.getLayer("markers-circle")) {
            map.current.removeLayer("markers-circle");
          }

          if (map.current.getSource("markers-source")) {
            map.current.removeSource("markers-source");
          }
        } catch (error) {
          console.error("Error cleaning up map resources:", error);
        }
      }
    };
  }, [markers, mapLoaded]);

  return (
    <div
      ref={mapContainer}
      className={`relative h-96 w-full overflow-hidden rounded-lg ${className}`}
    />
  );
};

export default MapView;
