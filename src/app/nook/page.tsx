"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Main from "src/layouts/Main";
import CommunityNetworkGraph from "./components/CommunityNetworkGraph";
import { useUser } from "src/context/UserContext";
import { useUser as useClerkUser } from "@clerk/nextjs";
import BetaBadge from "src/components/ui/beta-badge";

export default function NookPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [userName, setUserName] = useState<string>("");
  const { isSignedIn, isLoaded } = useClerkUser();

  // Array of fun, whimsical greetings
  const getRandomGreeting = (name: string) => {
    return name ? `Hi ${name}, welcome to the nook` : `nook`;
  };

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
        // // Use Clerk's authentication state instead of custom session check
        // if (!isSignedIn || !isLoaded) {
        //   // Redirect to 404 if not authenticated
        //   router.push("/404");
        //   return;
        // }

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
  }, [router, isSignedIn, isLoaded]);

  // Set currentUserId from UserContext when fetchedUser is available
  useEffect(() => {
    if (fetchedUser && fetchedUser.id) {
      console.log("Setting user ID from context:", fetchedUser.id);
      setCurrentUserId(fetchedUser.id);
      setUserName(fetchedUser.nickname || "Anonymous");
    } else if (!loading) {
      // Fallback behavior - could be removed once we have real users
      console.log("No user ID in context");
      setCurrentUserId(undefined);
      setUserName("");
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
          <h1 className="font-primary text-4xl font-bold text-primary">
            {getRandomGreeting(userName)}
          </h1>
          <BetaBadge />
        </div>
        {/* <p className="mx-auto max-w-2xl font-secondary text-lg text-muted-foreground">
          What am I, if not, in relation with you?
        </p> */}
      </div>

      {/* No data prop needed - component now fetches its own data */}
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
