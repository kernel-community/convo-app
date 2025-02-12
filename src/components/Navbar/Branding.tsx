"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MoveUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ConvoLogo from "public/images/logo.svg";

export const Branding = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleInteraction = (isActive: boolean) => {
    // On desktop (md and up), use hover
    if (window.matchMedia("(min-width: 768px)").matches) {
      setIsHovered(isActive);
    }
  };

  const handleTap = () => {
    // On mobile, toggle the state on tap
    if (!window.matchMedia("(min-width: 768px)").matches) {
      setIsTapped(!isTapped);
    }
  };

  const isActive = isHovered || isTapped;

  return (
    <div className="flex flex-row items-center gap-2">
      <Link
        href="/"
        className="hover:underline hover:decoration-dotted hover:underline-offset-4"
      >
        <span className="font-brand text-lg sm:text-2xl sm:text-xl">
          Convo.Cafe
        </span>
      </Link>
      <motion.div
        onHoverStart={() => handleInteraction(true)}
        onHoverEnd={() => handleInteraction(false)}
        onTap={handleTap}
        className="relative flex cursor-pointer items-center gap-2 md:cursor-pointer"
      >
        <motion.div
          animate={{ rotate: isActive ? 360 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <Image src={ConvoLogo} alt="Convo Logo" width={25} height={25} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20, width: 0 }}
          animate={{
            opacity: isActive ? 1 : 0,
            x: isActive ? 0 : -20,
            width: isActive ? "auto" : 0,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          }}
          className="flex flex-row items-center gap-1 overflow-hidden whitespace-nowrap"
        >
          <span className="font-primary text-sm italic sm:text-base">for</span>
          <div className="relative inline-flex font-primary">
            <motion.a
              href="https://kernel.community/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm italic underline decoration-dotted underline-offset-4 sm:text-base"
              whileHover="hover"
            >
              Kernel
              {isMounted && (
                <>
                  {/* Desktop arrow - appears on hover */}
                  <motion.div
                    className="absolute -right-5 hidden md:block"
                    initial={{ x: -10, opacity: 0 }}
                    variants={{
                      hover: {
                        x: 0,
                        opacity: 1,
                        transition: {
                          x: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.1 },
                        },
                      },
                    }}
                  >
                    <MoveUpRight className="h-2 w-2 sm:h-4 sm:w-4" />
                  </motion.div>
                </>
              )}
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
