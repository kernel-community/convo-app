"use client";

import { ConnectButton } from "./ConnectButton";

// Client component for interactive elements in the navbar
export function ClientNavbar() {
  return (
    <div className="inline-flex flex-row items-center gap-4">
      {/* <Items /> */}
      <ConnectButton />
    </div>
  );
}
