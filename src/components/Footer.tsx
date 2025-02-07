"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MoveUpRight } from "lucide-react";
const Footer = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className={`
    bg-kernel
    w-full py-5
    font-primary
    `}
    >
      <div className="flex flex-row items-center justify-center gap-1 italic">
        Built{" "}
        <span>
          with{" "}
          <div className="relative inline-flex font-primary">
            <motion.a
              href="https://github.com/Kernel-Community/convo-app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm italic underline decoration-dotted underline-offset-4 sm:text-base"
              whileHover="hover"
            >
              frens{" "}
              <Heart className="ml-1 h-2 w-2 text-red-500 sm:h-3 sm:w-3" />
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
    </div>
  );
};

export default Footer;
