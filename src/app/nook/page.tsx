"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Main from "src/layouts/Main";
import CommunityNetworkGraph from "./CommunityNetworkGraph";
import { checkSessionAuth } from "src/lib/checkSessionAuth";
import BetaBadge from "src/components/ui/beta-badge";

export default function NookPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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

        <div className="rounded-lg border border-border bg-background shadow-sm">
          <CommunityNetworkGraph />
        </div>

        <div className="mt-8 text-center">
          <p className="font-secondary text-muted-foreground">
            The network graph visualizes how community members are connected
            through shared events and conversations.
          </p>
        </div>
      </div>
    </Main>
  );
}
