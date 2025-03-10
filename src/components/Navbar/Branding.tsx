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
      <Link
        href="/"
        className="hover:underline hover:decoration-dotted hover:underline-offset-4"
      >
        <div className="flex flex-col items-end">
          <span className="font-brand text-lg sm:text-[1.5rem]">
            Convo.Cafe
          </span>
          {isBeta && (
            <span className="text-right text-xs font-light italic text-emerald-600">
              in beta
            </span>
          )}
        </div>
      </Link>
      <LogoAnimation />
    </div>
  );
}
