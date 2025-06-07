"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Main from "src/layouts/Main";
import CommunityNetworkGraph from "./components/CommunityNetworkGraph";
import { useUser } from "src/context/UserContext";
import { useUser as useClerkUser } from "@clerk/nextjs";
import BetaBadge from "src/components/ui/beta-badge";

// Wrap the main component in Suspense to handle useSearchParams properly in Next.js 15.3
function NookPageContent() {
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

  // Effect to sync URL parameters with tab state - Remove activeTab from dependencies to prevent loops
  useEffect(() => {
    // Only update if the tab parameter actually changed
    if (
      tabParam &&
      ["network", "map"].includes(tabParam) &&
      tabParam !== activeTab
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]); // Removed activeTab dependency to prevent infinite loops

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
  // Optimize to prevent infinite logging by only updating when the actual ID changes
  useEffect(() => {
    if (fetchedUser && fetchedUser.id) {
      // Only log and update if the user ID actually changed
      setCurrentUserId((prevUserId) => {
        if (prevUserId !== fetchedUser.id) {
          console.log("Setting user ID from context:", fetchedUser.id);
          return fetchedUser.id;
        }
        return prevUserId;
      });

      setUserName((prevUserName) => {
        const newUserName = fetchedUser.nickname || "Anonymous";
        if (prevUserName !== newUserName) {
          return newUserName;
        }
        return prevUserName;
      });
    } else if (!loading) {
      // Only log if we're not loading and don't have a user ID
      setCurrentUserId((prevUserId) => {
        if (prevUserId !== undefined) {
          console.log("No user ID in context");
          return undefined;
        }
        return prevUserId;
      });

      setUserName((prevUserName) => {
        if (prevUserName !== "") {
          return "";
        }
        return prevUserName;
      });
    }
  }, [fetchedUser?.id, fetchedUser?.nickname, loading]); // More specific dependencies

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

export default function NookPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NookPageContent />
    </Suspense>
  );
}
