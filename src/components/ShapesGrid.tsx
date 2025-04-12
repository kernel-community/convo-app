import React from "react";
import { motion } from "framer-motion";
import { cn } from "src/lib/utils";

interface ShapesGridProps {
  className?: string;
  size?: number;
  rotation?: number;
}

// Animation variants
const shapeAnimations = {
  hover: {
    scale: 1.05,
    transition: { duration: 0.3 },
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
};

// Shape components without hover effects
const Circle = ({ className }: { className: string }) => (
  <motion.div
    className={cn("aspect-square rounded-full", className)}
    whileTap="tap"
    whileHover="hover"
    variants={shapeAnimations}
  />
);

const TopRoundedSquare = ({ className }: { className: string }) => (
  <motion.div
    className={cn("aspect-square", className)}
    style={{
      borderTopLeftRadius: "50%",
      borderTopRightRadius: "50%",
      borderBottomLeftRadius: "12px",
      borderBottomRightRadius: "12px",
    }}
    whileTap="tap"
    whileHover="hover"
    variants={shapeAnimations}
  />
);

const TopLeftRoundedSquare = ({ className }: { className: string }) => (
  <motion.div
    className={cn("aspect-square", className)}
    style={{
      borderTopLeftRadius: "50%",
      borderTopRightRadius: "12px",
      borderBottomLeftRadius: "12px",
      borderBottomRightRadius: "12px",
    }}
    whileTap="tap"
    whileHover="hover"
    variants={shapeAnimations}
  />
);

const BottomLeftRoundedSquare = ({ className }: { className: string }) => (
  <motion.div
    className={cn("aspect-square", className)}
    style={{
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "12px",
      borderBottomLeftRadius: "50%",
      borderBottomRightRadius: "12px",
    }}
    whileTap="tap"
    whileHover="hover"
    variants={shapeAnimations}
  />
);

const TopRightRoundedSquare = ({ className }: { className: string }) => (
  <motion.div
    className={cn("aspect-square", className)}
    style={{
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "50%",
      borderBottomLeftRadius: "12px",
      borderBottomRightRadius: "12px",
    }}
    whileTap="tap"
    whileHover="hover"
    variants={shapeAnimations}
  />
);

const HalfCircleRight = ({ className }: { className: string }) => (
  <motion.div
    className={cn("w-full rounded-l-full", className)}
    style={{
      borderTopLeftRadius: "12px",
      borderTopRightRadius: "50%",
      borderBottomLeftRadius: "12px",
      borderBottomRightRadius: "50%",
    }}
    whileTap="tap"
    whileHover="hover"
    variants={shapeAnimations}
  />
);

const Petal = ({ className }: { className: string }) => (
  <motion.div
    className={cn("w-full rounded-l-full", className)}
    style={{
      borderTopLeftRadius: "50%",
      borderTopRightRadius: "12px",
      borderBottomLeftRadius: "12px",
      borderBottomRightRadius: "50%",
    }}
    whileTap="tap"
    whileHover="hover"
    variants={shapeAnimations}
  />
);

// Flower shape
export const Flower = ({ className }: { className: string }) => {
  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center",
        className
      )}
    >
      <motion.div
        className="h-full w-full"
        style={{
          WebkitMask:
            "url(/images/flower-vector.svg) no-repeat center / contain",
          mask: "url(/images/flower-vector.svg) no-repeat center / contain",
          backgroundColor: "currentColor",
        }}
        whileTap="tap"
        whileHover="hover"
        variants={shapeAnimations}
      />
    </div>
  );
};

export const ShapesGrid: React.FC<ShapesGridProps> = ({
  className,
  size = 500,
  rotation = 0,
}) => {
  return (
    <motion.div
      className={cn(
        "grid grid-cols-3 grid-rows-4 gap-2 bg-gray-100 p-3",
        className
      )}
      style={{
        width: size,
        height: size * 1.3,
        transform: `rotate(${rotation}deg)`,
      }}
      animate={{ rotate: rotation }}
      transition={{ duration: 0.5 }}
    >
      {/* Row 1 */}
      <Circle className="bg-pink-300" />
      <TopRoundedSquare className="bg-orange-400" />
      <TopLeftRoundedSquare className="bg-green-400" />

      {/* Row 2 */}
      <HalfCircleRight className="bg-green-800" />
      <BottomLeftRoundedSquare className="bg-indigo-500" />
      <Flower className="text-green-800" />

      {/* Row 3 */}
      <TopRightRoundedSquare className="bg-green-300" />
      <Circle className="bg-yellow-300" />
      <TopRightRoundedSquare className="bg-indigo-400" />

      {/* Row 4 */}
      <Petal className="bg-indigo-500" />
      <Flower className="text-yellow-300" />
      <BottomLeftRoundedSquare className="bg-green-400" />
    </motion.div>
  );
};

export default ShapesGrid;
