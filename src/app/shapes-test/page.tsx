"use client";

import React, { useState } from "react";
import ShapesGrid from "src/components/ShapesGrid";

export default function ShapesTestPage() {
  const [size, setSize] = useState(500);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl font-bold">Shapes Grid Component</h1>

      <div className="flex flex-col items-center gap-8 md:flex-row">
        <div className="flex w-full flex-col gap-4 md:w-64">
          <div>
            <label htmlFor="size" className="mb-1 block text-sm font-medium">
              Size: {size}px
            </label>
            <input
              id="size"
              type="range"
              min="200"
              max="800"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="rotation"
              className="mb-1 block text-sm font-medium"
            >
              Rotation: {rotation}°
            </label>
            <input
              id="rotation"
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => setRotation(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="mt-4 text-sm">
            <p className="mb-2">Instructions:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Adjust size with the slider</li>
              <li>Rotate using the rotation slider</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <ShapesGrid size={size} rotation={rotation} />
        </div>
      </div>
    </div>
  );
}
