"use client";

import { useState, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import Link from "next/link";

export function DataLossBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const bannerKey = `data-loss-banner-1`;

  useEffect(() => {
    // Check if the banner has been dismissed before
    const isDismissed = localStorage.getItem(bannerKey) === "dismissed";
    setIsVisible(!isDismissed);
  }, [bannerKey]);

  const dismissBanner = () => {
    // Mark banner as dismissed in localStorage
    localStorage.setItem(bannerKey, "dismissed");
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-sm text-amber-800">
            <p>
              Due to a critical error on April 29, 2025, some data has been
              lost. We are working to recover and rebuild as much as possible.
              You may notice missing or incomplete entries. Thank you for your
              understanding.{" "}
              <Link
                href="/blog/critical-error-april29"
                className="font-medium text-amber-700 underline hover:text-amber-900"
              >
                <span className="inline-flex items-center gap-1">
                  Read more <ArrowRight size={16} />
                </span>
              </Link>
            </p>
          </div>
          <button
            onClick={dismissBanner}
            className="ml-4 rounded-md p-1.5 text-amber-600 hover:bg-amber-100 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
            aria-label="Dismiss banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
