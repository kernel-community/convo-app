"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MoveUpRight } from "lucide-react";
import Link from "next/link";

export const Branding = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
      <Link
        href="/"
        className="hover:underline hover:decoration-dotted hover:underline-offset-4"
      >
        <span className="font-brand text-2xl sm:text-xl">Convo.Cafe</span>
      </Link>
      <span className="flex flex-row items-center gap-1 ">
        <span className="font-primary text-sm italic sm:text-base">for</span>
        <div className="relative inline-flex font-primary">
          <motion.a
            href="https://kernel.community/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm italic underline decoration-dotted underline-offset-4 sm:text-base"
            whileHover="hover"
          >
            Kernel.Community
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
      </span>
    </div>
  );
};
