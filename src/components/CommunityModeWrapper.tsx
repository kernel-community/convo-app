"use client";

import React from "react";
import { useCommunity } from "src/context/CommunityContext";
import type { CommunityFeatureFlag } from "src/lib/communityFlags";

interface CommunityModeWrapperProps {
  featureFlag: CommunityFeatureFlag;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders content based on community feature flags
 * Similar to BetaModeWrapper but for community-specific features
 */
export function CommunityModeWrapper({
  featureFlag,
  fallback = null,
  children,
}: CommunityModeWrapperProps) {
  const { community, isLoading } = useCommunity();

  // If still loading the community, show nothing
  if (isLoading) {
    return null;
  }

  // If no community or features are found, show fallback
  if (!community || !community.features) {
    return <>{fallback}</>;
  }

  // Parse the features from JSON
  const features = community.features as Record<string, unknown>;

  // Check if the specific feature is enabled
  const isFeatureEnabled =
    typeof features[featureFlag] === "boolean"
      ? (features[featureFlag] as boolean)
      : false;

  // Render children only if feature is enabled
  return isFeatureEnabled ? <>{children}</> : <>{fallback}</>;
}

interface CommunityFeatureProps {
  children: (flags: Record<string, boolean>, community: any) => React.ReactNode;
}

/**
 * Higher-order component that provides all community feature flags to its children
 * More flexible than CommunityModeWrapper by providing all flags at once
 */
export function CommunityFeatures({ children }: CommunityFeatureProps) {
  const { community, isLoading } = useCommunity();

  if (isLoading || !community) {
    return null;
  }

  // Get feature flags from community
  const features = (community.features as Record<string, unknown>) || {};

  // Convert to boolean flags
  const flags = Object.entries(features).reduce((acc, [key, value]) => {
    acc[key] = typeof value === "boolean" ? value : false;
    return acc;
  }, {} as Record<string, boolean>);

  // Pass flags and community to render function
  return <>{children(flags, community)}</>;
}
