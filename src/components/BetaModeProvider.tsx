"use client";

import type { ReactNode } from "react";
import { BetaModeContext } from "src/app/providers";

interface BetaModeProviderProps {
  isBetaMode: boolean;
  children: ReactNode;
}

export function BetaModeProvider({
  isBetaMode,
  children,
}: BetaModeProviderProps) {
  return (
    <BetaModeContext.Provider value={isBetaMode}>
      {children}
    </BetaModeContext.Provider>
  );
}
