"use client";
import * as React from "react";

export function useMediaQuery(query: string): boolean | undefined {
  const [value, setValue] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const onChange = (event: MediaQueryListEvent) => {
        setValue(event.matches);
      };

      const result = window.matchMedia(query);
      setValue(result.matches);
      result.addEventListener("change", onChange);

      return () => result.removeEventListener("change", onChange);
    } else {
      setValue(undefined);
    }
  }, [query]);

  return value;
}
