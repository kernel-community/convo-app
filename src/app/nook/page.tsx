"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import Main from "src/layouts/Main";
import CommunityNetworkGraph from "./components/CommunityNetworkGraph";
import { checkSessionAuth } from "src/lib/checkSessionAuth";
import BetaBadge from "src/components/ui/beta-badge";
import { useUser } from "src/context/UserContext";

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
  const { fetchedUser } = useUser();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(
    undefined
  );
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

  // Set currentUserId from UserContext when fetchedUser is available
  useEffect(() => {
    if (fetchedUser && fetchedUser.id) {
      console.log("Setting user ID from context:", fetchedUser.id);
      setCurrentUserId(fetchedUser.id);
    } else if (!loading) {
      // Fallback to "user1" for testing if user context doesn't have an ID
      console.log("No user ID in context, using fallback: user1");
      setCurrentUserId("user1");
    }
  }, [fetchedUser, loading]);

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
      <div className="mb-8 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <h1 className="font-primary text-4xl font-bold text-primary">nook</h1>
          <BetaBadge />
        </div>
        <p className="mx-auto max-w-2xl font-secondary text-lg text-muted-foreground">
          What am I, if not, in relation with you?
        </p>
      </div>

      {/* The data prop is optional and defaults to mockData in the component */}
      <CommunityNetworkGraph currentUserId={currentUserId} />

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
    </Main>
  );
}
