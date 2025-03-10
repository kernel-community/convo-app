import { Navbar } from "src/components/Navbar";
import Footer from "src/components/Footer";
import type { ReactNode } from "react";

interface MainProps {
  children: ReactNode;
  className?: string;
  isBeta?: boolean;
}

const Main = ({ isBeta = false, children, className = "" }: MainProps) => {
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
