import { betaMode, experimentalUI, newCursorRooms } from "src/lib/flags";
import { FlagDisplay } from "./FlagDisplay";

export default async function TestFlagsPage() {
  // Test all flags on the server
  const [isBeta, isExperimental, hasCursorRooms] = await Promise.all([
    betaMode(),
    experimentalUI(),
    newCursorRooms(),
  ]);

  // Pass the evaluated flags to the client component
  return (
    <FlagDisplay
      isBeta={isBeta}
      isExperimental={isExperimental}
      hasCursorRooms={hasCursorRooms}
    />
  );
}
