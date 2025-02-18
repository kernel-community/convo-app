"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MoveUpRight } from "lucide-react";
import Link from "next/link";
import { HeartEmoji } from "./ui/emojis";
const Footer = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div
      className={`
    w-full py-5
    font-primary
    `}
    >
      <div className="flex flex-row items-center justify-center gap-1 italic">
        Built{" "}
        <Link
          href="/frens"
          className="flex flex-row  items-center font-secondary underline decoration-dotted underline-offset-4"
        >
          with frens{" "}
          <HeartEmoji width={33} height={33} className="-ml-1 -mr-2" />
        </Link>
        <span>
          at{" "}
          <div className="relative inline-flex font-primary">
            <motion.a
              href="https://kernel.community/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm italic underline decoration-dotted underline-offset-4 sm:text-base"
              whileHover="hover"
            >
              Kernel
            </motion.a>
          </div>
        </span>
      </div>
    </div>
  );
};

export default Footer;
