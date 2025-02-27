"use client";

interface FlagDisplayProps {
  isBeta: boolean;
  isExperimental: boolean;
  hasCursorRooms: boolean;
}

export function FlagDisplay({
  isBeta,
  isExperimental,
  hasCursorRooms,
}: FlagDisplayProps) {
  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Feature Flags Test Page</h1>

      <div className="space-y-4">
        <div className="rounded border p-4">
          <h2 className="font-semibold">Beta Mode</h2>
          <p className="mt-2">
            Status:{" "}
            <span className={isBeta ? "text-green-600" : "text-red-600"}>
              {isBeta ? "Enabled" : "Disabled"}
            </span>
          </p>
        </div>

        <div className="rounded border p-4">
          <h2 className="font-semibold">Experimental UI</h2>
          <p className="mt-2">
            Status:{" "}
            <span
              className={isExperimental ? "text-green-600" : "text-red-600"}
            >
              {isExperimental ? "Enabled" : "Disabled"}
            </span>
          </p>
        </div>

        <div className="rounded border p-4">
          <h2 className="font-semibold">New Cursor Rooms</h2>
          <p className="mt-2">
            Status:{" "}
            <span
              className={hasCursorRooms ? "text-green-600" : "text-red-600"}
            >
              {hasCursorRooms ? "Enabled" : "Disabled"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
