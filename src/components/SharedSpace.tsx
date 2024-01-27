/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import { useCursors } from "src/context/CursorsContext";
import OtherCursor from "src/components/OtherCursor";
import SelfCursor from "src/components/SelfCursor";

export default function SharedSpace({ children }: { children: ReactNode }) {
  const { others, self } = useCursors();
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  // const svgRef = useRef<SVGSVGElement>(null);
  // const svgParentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    // Add the class 'overflow-hidden' on body to prevent scrolling
    document.body.classList.add("overflow-hidden");
    // Scroll to top
    window.scrollTo(0, 0);
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  // const count = Object.keys(others).length + (self ? 1 : 0);

  return (
    <>
      {/* <div
        ref={svgParentRef}
        className="z-10 top-0 left-0 w-full bg-stone-200 overflow-clip"
      >
        {count > 0 && (
          <div className="pointer-events-none flex items-center">
            <span className="text-2xl">{count}&times;</span>
            <span className="text-5xl">🎈</span>
          </div>
        )}
      </div> */}
      {children}
      {Object.keys(others).map((id) => (
        <div key={id}>
          <OtherCursor
            id={id}
            windowDimensions={windowDimensions}
            fill="#06f"
          />
        </div>
      ))}
      {self?.pointer === "touch" && (
        <SelfCursor windowDimensions={windowDimensions} />
      )}
    </>
  );
}
