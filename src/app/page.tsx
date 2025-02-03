"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Main from "../layouts/Main";
import Link from "next/link";
import { FancyHighlight } from "../components/FancyHighlight";
import { AnimatedTextArea } from "../components/AnimatedTextArea";
import { Button } from "src/components/ui/button";

const Home = () => {
  const [text, setText] = useState("");

  return (
    <>
      <Main>
        <div className="flex h-full items-center justify-center">
          <div className="flex w-full flex-col items-center gap-6 p-4 sm:w-max">
            <div className="font-heading text-5xl font-bold lg:text-7xl">
              Start a
              <Link href="/propose">
                <FancyHighlight className="mx-3 inline-block">
                  Convo
                </FancyHighlight>
                .
              </Link>
            </div>
            <motion.div className="w-full space-y-2">
              <AnimatedTextArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`w-full resize-none rounded-lg border p-6 transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary ${
                  text.trim() ? "min-h-[180px]" : "min-h-[280px]"
                }`}
              />
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: text.trim() ? 1 : 0,
                  height: text.trim() ? "auto" : 0,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="overflow-hidden"
              >
                <Link href="/propose">
                  <Button className="w-full">Create</Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Main>
    </>
  );
};

export default Home;
