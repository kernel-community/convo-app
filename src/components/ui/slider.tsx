"use client";

import { motion } from "framer-motion";
import * as React from "react";
import { Input } from "./input";
import { cn } from "src/lib/utils";

export interface SliderProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showInput?: boolean;
  className?: string;
  inputClassName?: string;
  thumbClassName?: string;
  trackClassName?: string;
  rangeClassName?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      value,
      onChange,
      min = 2, // Default minimum value of 2
      max = 100,
      step = 1,
      showInput = true,
      inputClassName,
      thumbClassName,
      trackClassName,
      rangeClassName,
      ...props
    },
    ref
  ) => {
    const trackRef = React.useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // Constants for sizing
    const THUMB_SIZE = 16; // 16px (h-4 w-4)
    const THUMB_RADIUS = THUMB_SIZE / 2;

    // Convert between value and percentage
    const valueToPercent = (val: number) => {
      return ((val - min) / (max - min)) * 100;
    };

    const percentToValue = (percent: number) => {
      const rawValue = min + (percent / 100) * (max - min);
      return Math.max(min, Math.round(rawValue / step) * step);
    };

    // Current percentage based on value
    const percentage = valueToPercent(value);

    // Calculate constrained thumb position to ensure it stays within the track
    const getConstrainedPosition = (percent: number) => {
      // For 0%, align with the left edge
      if (percent <= 0) return `0%`;

      // For 100%, align with the right edge, constrained to stay within bounds
      if (percent >= 100) return `calc(100% - ${THUMB_RADIUS}px)`;

      // For other values, use standard percentage positioning
      return `${percent}%`;
    };

    // Adjust filled track width to align perfectly with thumb center
    let trackFillWidth = `${percentage}%`;

    if (percentage > 0 && percentage < 100) {
      trackFillWidth = `calc(${percentage}% + 4px)`;
    } else if (percentage >= 100) {
      trackFillWidth = "100%";
    }

    // Ensure the current value is never below min
    React.useEffect(() => {
      if (value < min) {
        onChange(min);
      }
    }, [value, min, onChange]);

    // Handle input value changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    };

    // Handle track click
    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const position = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const percent = Math.max(0, Math.min(100, (position / rect.width) * 100));

      // Ensure the value doesn't exceed bounds
      const newValue = Math.min(max, Math.max(min, percentToValue(percent)));
      onChange(newValue);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    };

    // Handle thumb interactions
    const handlePointerDown = (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (!trackRef.current) return;

        moveEvent.preventDefault();
        const rect = trackRef.current.getBoundingClientRect();
        // Calculate position making sure it stays within the track boundaries
        const position = Math.max(
          0,
          Math.min(rect.width, moveEvent.clientX - rect.left)
        );
        const percent = Math.max(
          0,
          Math.min(100, (position / rect.width) * 100)
        );

        // Ensure the value doesn't exceed bounds
        const newValue = Math.min(max, Math.max(min, percentToValue(percent)));
        onChange(newValue);
      };

      const handlePointerUp = () => {
        setIsDragging(false);
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };

      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    };

    return (
      <div
        className={cn("flex items-center space-x-4", className)}
        ref={ref}
        {...props}
      >
        <div className="relative flex-1">
          {/* Track container - explicitly set height */}
          <div
            ref={trackRef}
            className={cn(
              "relative h-2 w-full cursor-pointer rounded-full bg-muted",
              trackClassName
            )}
            onClick={handleTrackClick}
          >
            {/* Filled track */}
            <motion.div
              className={cn(
                "absolute left-0 top-0 h-full bg-primary",
                percentage === 100 ? "rounded-full" : "rounded-l-full",
                rangeClassName
              )}
              style={{ width: trackFillWidth }}
              initial={{
                width: min === 0 ? 0 : `calc(${valueToPercent(min)}% + 4px)`,
              }}
              animate={{ width: trackFillWidth }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />

            {/* Thumb */}
            <motion.div
              className={cn(
                "absolute z-10 h-4 w-4 cursor-grab select-none rounded-full bg-primary shadow-md",
                isDragging && "cursor-grabbing",
                thumbClassName
              )}
              style={{
                // Calculate constrained position based on percentage
                left: getConstrainedPosition(percentage),
                top: "-50%",
                transform: "translate(-50%, -50%)",
                touchAction: "none",
              }}
              animate={{
                scale: isAnimating ? [1, 1.2, 1] : 1,
              }}
              transition={{ scale: { duration: 0.3 } }}
              onPointerDown={handlePointerDown}
            />
          </div>
        </div>

        {showInput && (
          <Input
            type="number"
            min={min}
            max={max}
            value={value.toString()}
            onChange={handleInputChange}
            className={cn("w-20", inputClassName)}
          />
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
