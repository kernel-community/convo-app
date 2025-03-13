import React from "react";
import { betaMode } from "src/lib/flags";

interface BetaModeWrapperProps {
  children: (isBetaMode: boolean) => React.ReactNode;
}

// This is a server component that fetches the beta mode status
export async function BetaModeWrapper({ children }: BetaModeWrapperProps) {
  // Fetch beta mode status on the server
  const isBetaMode = await betaMode();

  // Pass the beta mode value to the render prop function
  return <>{children(isBetaMode)}</>;
}
