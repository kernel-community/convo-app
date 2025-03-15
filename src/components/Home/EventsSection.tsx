import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Events } from "src/components/Events";

export const EventsSection: React.FC = () => (
  <>
    <div className="w-full max-w-2xl">
      <Events type="upcoming" take={20} showFilterPanel title="all upcoming" />
    </div>
    <span className="group flex cursor-pointer items-center gap-2 text-xl">
      <Link
        className="transform underline decoration-dotted underline-offset-4 transition-all duration-200 sm:translate-x-6 sm:group-hover:translate-x-0"
        href="/all"
      >
        View all
      </Link>
      <span className="transform transition-all duration-200 sm:-translate-x-2 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
        <ArrowRight className="h-4 w-4" />
      </span>
    </span>
  </>
);

export default EventsSection;
