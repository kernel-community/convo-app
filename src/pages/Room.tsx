"use client";

import type { ReactNode } from "react";
import { RoomProvider } from "src/utils/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";
import LiveCursorChat from "src/components/LiveCursorChat";

export function Room({ children }: { children: ReactNode }) {
  return (
    <RoomProvider
      id="my-room"
      initialPresence={() => ({
        cursor: null,
        message: "",
      })}
    >
      <LiveCursorChat>{children}</LiveCursorChat>
    </RoomProvider>
  );
}
