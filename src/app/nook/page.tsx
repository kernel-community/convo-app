"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import Main from "src/layouts/Main";
import CommunityNetworkGraph from "./CommunityNetworkGraph";
import { checkSessionAuth } from "src/lib/checkSessionAuth";
import BetaBadge from "src/components/ui/beta-badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "src/components/ui/tabs";
import MapView from "./components/map/MapView";
import { motion } from "framer-motion";
import { locations } from "./utils/mock";
import type { Marker } from "./components/map/MapView";

// Array of colors for different locations
const locationColors = [
  "#FF5733", // Orange-red
  "#33FF57", // Green
  "#3357FF", // Blue
  "#F033FF", // Purple
  "#FF33F0", // Pink
  "#33FFF0", // Cyan
  "#F0FF33", // Yellow
  "#FF8C33", // Orange
  "#8C33FF", // Violet
  "#33FF8C", // Mint
];

// Function to generate a color based on location ID for consistent coloring
const getLocationColor = (id: number): string => {
  // Use modulo to cycle through colors if we have more locations than colors
  const index = id % locationColors.length;
  // Ensure we return a valid string
  return locationColors[index] || "#FF5733";
};

export default function NookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  // Get the tab from URL params or default to "network"
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam && ["network", "map"].includes(tabParam) ? tabParam : "network"
  );

  // Effect to sync URL parameters with tab state
  useEffect(() => {
    // If URL has tab parameter, update active tab state
    if (
      tabParam &&
      ["network", "map"].includes(tabParam) &&
      tabParam !== activeTab
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam, activeTab]);

  useEffect(() => {
    const checkBetaAccess = async () => {
      try {
        // First check if user is authenticated
        const isAuthenticated = await checkSessionAuth();
        if (!isAuthenticated) {
          // Redirect to 404 if not authenticated
          router.push("/404");
          return;
        }

        // Check if user has beta access
        const response = await fetch("/api/beta-access/check", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          // Redirect to 404 if API call fails
          router.push("/404");
          return;
        }

        const data = await response.json();
        if (!data.hasBetaAccess) {
          // Redirect to 404 if user doesn't have beta access
          router.push("/404");
          return;
        }

        // User has beta access
        setLoading(false);
      } catch (error) {
        console.error("Error checking beta access:", error);
        // Redirect to 404 on any error
        router.push("/404");
      }
    };

    checkBetaAccess();
  }, [router]);

  // Show loading state while checking beta access
  if (loading) {
    return (
      <Main>
        <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
          <div className="animate-pulse text-center">
            <p className="text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Main>
    );
  }

  return (
    <Main>
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <h1 className="font-primary text-4xl font-bold text-primary">
              nook
            </h1>
            <BetaBadge />
          </div>
          <p className="mx-auto max-w-2xl font-secondary text-lg text-muted-foreground">
            What am I, if not, in relation with you?
          </p>
        </div>

        <Tabs
          value={activeTab}
          defaultValue="network"
          className="w-full"
          onValueChange={(value) => {
            setActiveTab(value);
            // Update URL with the new tab parameter
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", value);
            // Use router.replace to update URL without full navigation
            router.replace(`${pathname}?${params.toString()}`);
          }}
        >
          <div className="mb-4 flex justify-center">
            <div className="relative w-[400px] rounded-lg bg-gray-100 p-1">
              {/* TabsList provides the RovingFocusGroup context */}
              <TabsList className="relative z-10 grid grid-cols-2 bg-transparent">
                <TabsTrigger
                  value="network"
                  className="relative z-20 rounded-md px-4 py-2 text-gray-600 data-[state=active]:bg-transparent data-[state=active]:text-black"
                >
                  Network Graph
                </TabsTrigger>
                <TabsTrigger
                  value="map"
                  className="relative z-20 rounded-md px-4 py-2 text-gray-600 data-[state=active]:bg-transparent data-[state=active]:text-black"
                >
                  Global Map
                </TabsTrigger>
              </TabsList>

              {/* Animated background using Framer Motion */}
              <motion.div
                className="absolute left-1 top-1 h-[calc(100%-2px)] w-[calc(50%-2px)] rounded-md bg-white shadow-sm"
                animate={{
                  x: activeTab === "network" ? 0 : "100%",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            </div>
          </div>

          <TabsContent
            value="network"
            className="rounded-lg bg-white p-6 shadow-sm"
            style={{
              animation: "fadeIn 0.5s ease-in-out",
            }}
          >
            <CommunityNetworkGraph />
            <div className="mt-4 text-center">
              <p className="font-secondary text-muted-foreground">
                The network graph visualizes how community members are connected
                through shared events and conversations.
              </p>
            </div>
          </TabsContent>

          <TabsContent
            value="map"
            className="h-[500px] rounded-lg bg-white p-6 shadow-sm"
            style={{
              animation: "fadeIn 0.5s ease-in-out",
            }}
          >
            <MapView
              markers={locations.map((location) => {
                // Ensure we have valid data for each marker
                const id = typeof location.id === "number" ? location.id : 1;
                const longitude = location.longitude;
                const latitude = location.latitude;
                const title = location.name || "Unknown Location";
                const color = getLocationColor(id);
                const nodes = location.nodes || [];

                // Create a properly typed marker object
                const marker: Marker = {
                  id,
                  longitude,
                  latitude,
                  title,
                  color: color as string, // Type assertion to ensure TypeScript sees this as a string
                  nodes,
                };

                return marker;
              })}
            />
            <div className="mt-4 text-center">
              <p className="font-secondary text-muted-foreground">
                This map shows the global distribution of our community members
                across different locations.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add animation keyframes for content transition */}
        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </Main>
  );
}
