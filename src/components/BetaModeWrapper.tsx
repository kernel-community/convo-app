import type { ReactNode } from "react";
import { betaMode } from "src/lib/flags";
import { BetaModeProvider } from "./BetaModeProvider";

interface BetaModeWrapperProps {
  children: ReactNode;
}

export async function BetaModeWrapper({ children }: BetaModeWrapperProps) {
  // Fetch beta mode status on the server
  const isBetaMode = await betaMode();

  // Pass it to the client component
  return (
    <BetaModeProvider isBetaMode={isBetaMode}>{children}</BetaModeProvider>
  );
}
