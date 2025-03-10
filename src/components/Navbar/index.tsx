import { Branding } from "./Branding";
import { ClientNavbar } from "./ClientNavbar";

// Server component that evaluates the beta flag
export async function Navbar({ isBeta }: { isBeta: boolean }) {
  return (
    <div
      className={`
        z-10
        flex w-full flex-row items-center justify-between gap-8
        p-3 font-secondary
      `}
    >
      <div className="inline-flex flex-row items-center">
        {/* Pass the evaluated flag to the client component */}
        <Branding isBeta={isBeta} />
      </div>

      {/* Client component for interactive elements */}
      <ClientNavbar />
    </div>
  );
}
