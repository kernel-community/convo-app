import { Navbar } from "src/components/Navbar";
import Footer from "src/components/Footer";
import type { ReactNode } from "react";

interface MainProps {
  children: ReactNode;
  className?: string;
}

const Main = ({ children, className = "" }: MainProps) => {
  return (
    <div className="dark:text-primary-dark relative flex h-screen min-h-screen flex-col overflow-y-auto selection:bg-highlight selection:text-primary">
      <Navbar />
      <main
        className={`${
          className.includes("h-full") ? "" : "my-12 sm:my-24"
        } flex-1 ${className}`}
      >
        {children}
      </main>
    </div>
  );
};

export default Main;
