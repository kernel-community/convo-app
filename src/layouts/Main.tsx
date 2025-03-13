"use client";

import { Navbar } from "src/components/Navbar";
import Footer from "src/components/Footer";
import type { ReactNode } from "react";
import { useBetaMode } from "src/hooks/useBetaMode";

interface MainProps {
  children: ReactNode;
  className?: string;
}

const Main = ({ children, className = "" }: MainProps) => {
  const isBeta = useBetaMode();
  return (
    <div className="relative flex min-h-screen flex-col overflow-y-auto selection:bg-highlight selection:text-primary">
      <Navbar isBeta={isBeta} />
      <main
        className={`${
          className.includes("h-full") ? "" : "my-12 sm:my-24"
        } flex-1`}
      >
        <div className={`container mx-auto ${className}`}>{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default Main;
