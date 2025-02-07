"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Main from "../layouts/Main";
import { FancyHighlight } from "../components/FancyHighlight";
import { AnimatedTextArea } from "../components/AnimatedTextArea";
import { Button } from "src/components/ui/button";
import ProposeForm from "src/components/ProposeForm";
import type { ClientEventInput } from "src/types";
import { DateTime } from "luxon";
import { ScrambleText } from "src/components/ScrambleText";
import { generateTitle } from "src/utils/generateTitle";
// import WeekView from "src/components/WeekView";

const Home = () => {
  const [text, setText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const [dateTimeStartAndEnd, setDateTimeStartAndEnd] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const handleShowForm = async () => {
    setIsLoading(true);
    try {
      // Generate title and parse datetime before showing form
      const { title, dateTime } = await generateTitle(text);
      setGeneratedTitle(title);
      setDateTimeStartAndEnd(dateTime);
      console.log({ dateTime });
      setShowForm(true);
    } finally {
      setIsLoading(false);
    }

    // Wait for form to be rendered before scrolling
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const userStartedTyping = text.trim() && !showForm;

  return (
    <>
      <Main>
        <div className="container mx-auto py-4">
          {/* <WeekView /> */}
          <div className="h-4" />

          <div className="flex flex-col items-center">
            <div className="mb-12 text-center">
              <div className="flex-inline flex flex-col gap-1 font-primary text-4xl sm:flex-row">
                <div>Start a</div>
                <FancyHighlight className="mx-2 inline-block font-brand">
                  {userStartedTyping || showForm ? "Convo" : <ScrambleText />}
                </FancyHighlight>
              </div>
            </div>
            <div className="w-full max-w-2xl space-y-2 font-secondary">
              <div className="">Start typing...</div>
              <AnimatedTextArea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onClick={() => {
                  if (showForm) {
                    // Reset all form state immediately when clicking the collapsed textarea
                    setShowForm(false);
                    setGeneratedTitle("");
                    setDateTimeStartAndEnd(null);
                  }
                }}
                className="w-full resize-none rounded-lg border p-6 focus:outline-none"
                isCollapsed={showForm}
              />
              {/* <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: userStartedTyping ? 1 : 0,
                  height: userStartedTyping ? "auto" : 0,
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="overflow-hidden"
              > */}
              <Button
                className="w-full"
                onClick={handleShowForm}
                isLoading={isLoading}
                variant={"default"}
              >
                Create
              </Button>
              {/* </motion.div> */}

              <AnimatePresence mode="wait">
                {showForm && (
                  <motion.div
                    ref={formRef}
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      height: "auto",
                      transition: {
                        height: { duration: 0.3 },
                        opacity: { duration: 0.3, delay: 0.1 },
                      },
                    }}
                    exit={{
                      opacity: 0,
                      y: 20,
                      height: 0,
                      transition: {
                        height: { duration: 0.3, delay: 0.1 },
                        opacity: { duration: 0.2 },
                      },
                    }}
                    className="mt-8 overflow-hidden"
                  >
                    <ProposeForm
                      event={
                        {
                          description: text,
                          title:
                            generatedTitle ||
                            text.split("\n")[0] ||
                            "Untitled Convo",
                          dateTimeStartAndEnd: dateTimeStartAndEnd
                            ? {
                                start: new Date(dateTimeStartAndEnd.start),
                                end: new Date(dateTimeStartAndEnd.end),
                              }
                            : {
                                start: DateTime.now()
                                  .plus({ hours: 1 })
                                  .startOf("hour")
                                  .toJSDate(),
                                end: DateTime.now()
                                  .plus({ hours: 2 })
                                  .startOf("hour")
                                  .toJSDate(),
                              },
                          limit: "0",
                          location: "Online",
                          nickname: "Anonymous",
                          gCalEvent: true,
                          sessions: [
                            {
                              dateTime: dateTimeStartAndEnd
                                ? new Date(dateTimeStartAndEnd.start)
                                : DateTime.now().startOf("hour").toJSDate(),
                              duration: 1,
                              count: 1,
                            },
                          ],
                          recurrenceRule: undefined,
                        } as ClientEventInput
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Main>
    </>
  );
};

export default Home;
