import type { CSSProperties } from "react";

/**
 * A reusable background component for blog pages
 * Displays the hearth.svg as a full-page background with blur effect
 */
export default function BlogBackground() {
  // Define the background style with the SVG
  const backgroundStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "600%",
    backgroundImage: `url('/images/hearth.svg')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity: 0.1,
    zIndex: -1,
    pointerEvents: "none", // Ensures the background doesn't interfere with clicks
    filter: "blur(10px)", // Adding blur effect
  };

  return <div style={backgroundStyle} aria-hidden="true" />;
}
