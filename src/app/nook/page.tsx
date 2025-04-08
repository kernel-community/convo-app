"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import MapView from "./map/MapView";
import { motion } from "framer-motion";

export default function NookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("network");

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
          defaultValue="network"
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
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
              markers={[
                {
                  id: 1,
                  longitude: -122.4194,
                  latitude: 37.7749,
                  title: "San Francisco",
                  color: "#FF5733",
                },
                {
                  id: 2,
                  longitude: -0.1278,
                  latitude: 51.5074,
                  title: "London",
                  color: "#33FF57",
                },
                {
                  id: 3,
                  longitude: 139.6917,
                  latitude: 35.6895,
                  title: "Tokyo",
                  color: "#3357FF",
                },
                {
                  id: 4,
                  longitude: 2.3522,
                  latitude: 48.8566,
                  title: "Paris",
                  color: "#F033FF",
                },
                {
                  id: 5,
                  longitude: 77.209,
                  latitude: 28.6139,
                  title: "New Delhi",
                  color: "#FF33F0",
                },
              ]}
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
