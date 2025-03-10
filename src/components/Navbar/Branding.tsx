"use client";
import Link from "next/link";
import { LogoAnimation } from "./LogoAnimation";

// Props interface for the Branding component
interface BrandingProps {
  isBeta: boolean;
}

// Client component that receives the beta status from its parent
export function Branding({ isBeta }: BrandingProps) {
  return (
    <div className="flex flex-row items-center gap-2">
      <div className="flex flex-col">
        <Link
          href="/"
          className="hover:underline hover:decoration-dotted hover:underline-offset-4"
        >
          <div className="flex flex-col items-end">
            <span className="font-brand text-base sm:text-[1.5rem]">
              Convo.Cafe
            </span>
          </div>
        </Link>
        {isBeta && (
          <span className="text-right text-sm font-light italic text-emerald-600">
            in beta
          </span>
        )}
      </div>

      <LogoAnimation />
    </div>
  );
}
