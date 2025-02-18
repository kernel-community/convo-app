"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Main from "../layouts/Main";
import { FancyHighlight } from "../components/FancyHighlight";
import { AnimatedTextArea } from "../components/AnimatedTextArea";
import { Button } from "src/components/ui/button";
import ProposeForm from "src/components/ProposeForm";
import { DateTime } from "luxon";
import { ScrambleText } from "src/components/ScrambleText";
import { generateTitle } from "src/utils/generateTitle";
import { generateDescription } from "src/utils/generateDescription";
import { parseDateTime } from "src/utils/parseDateTime";
import { parseLocation } from "src/utils/parseLocation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Events } from "src/components/Events";
import { getLocalTimezoneOffset } from "src/utils/getLocalTimezoneOffset";
import { formatWithTimezone } from "src/utils/formatWithTimezone";
// import WeekView from "src/components/WeekView";

const Home = () => {
  const tzOffset = getLocalTimezoneOffset();
  const currentDate = new Date();
  console.log("page.tsx time debug:", {
    rawDate: currentDate,
    rawISOString: currentDate.toISOString(),
    tzOffset,
  });
  // Format current time in local timezone
  const NOW = formatWithTimezone(currentDate, tzOffset);

  const [text, setText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showTextArea, setShowTextArea] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const [generatedDescription, setGeneratedDescription] = useState<string>("");
  const [dateTimeStartAndEnd, setDateTimeStartAndEnd] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [generatedLocation, setGeneratedLocation] = useState<string | null>(
    null
  );
  const formRef = useRef<HTMLDivElement>(null);

  const handleCreateClick = async () => {
    if (!showTextArea) {
      // First click - show text area
      setShowTextArea(true);
      return;
    }

    if (!text.trim()) {
      // No text entered - hide text area
      setShowTextArea(false);
      setText("");
      return;
    }

    // Text entered - show form
    setIsLoading(true);
    try {
      // Generate title and parse datetime before showing form
      let title: string;
      let dateTime: { start: string; end: string } | null = null;
      let description: string;
      let location: string | null = null;
      if (text.length > 30) {
        const [titleResult, descriptionResult, dateTimeResult, locationResult] =
          await Promise.all([
            generateTitle(text),
            generateDescription(text),
            parseDateTime(text, NOW, tzOffset),
            parseLocation(text),
          ]);
        title = titleResult.title;
        dateTime = dateTimeResult;
        description = descriptionResult.description;
        location = locationResult;
      } else {
        const [dateTimeResult, locationResult] = await Promise.all([
          parseDateTime(text, NOW, tzOffset),
          parseLocation(text),
        ]);
        title = text;
        dateTime = dateTimeResult;
        location = locationResult;
        description = text;
      }
      setGeneratedTitle(title);
      setDateTimeStartAndEnd(dateTime);
      setGeneratedDescription(description);
      setGeneratedLocation(location);
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
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="flex-inline flex flex-col gap-1 font-primary text-6xl sm:flex-row">
              <div>Start a</div>
              <FancyHighlight className="mx-2 inline-block font-brand">
                {userStartedTyping || !showTextArea || showForm ? (
                  "Convo"
                ) : (
                  <ScrambleText />
                )}
              </FancyHighlight>
            </div>
          </div>
          <div className="flex w-full max-w-2xl flex-col items-center space-y-2 font-secondary">
            <AnimatePresence mode="wait">
              {showTextArea && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.2 }}
                    className="mb-2"
                  >
                    Describe your convo, including date & time, & what you hope
                    it to feel like...
                  </motion.div>
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
                    className={`w-full resize-none rounded-lg border p-6 focus:outline-none ${
                      showForm ? "border-4 border-muted" : ""
                    }`}
                    isCollapsed={showForm}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {!showForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex w-full justify-center"
                >
                  <Button
                    className={`w-1/3 rounded-br-[50px] rounded-tl-[50px] p-4 font-secondary text-lg hover:border-secondary sm:p-8 sm:text-2xl ${
                      showTextArea ? (text.trim() ? "" : "bg-warn") : ""
                    }`}
                    onClick={handleCreateClick}
                    isLoading={isLoading}
                    variant={"default"}
                  >
                    {showTextArea
                      ? text.trim()
                        ? "Create"
                        : "Cancel"
                      : "Create"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
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
                  className="mt-8 overflow-visible"
                >
                  <div className="mt-8">
                    <ProposeForm
                      event={{
                        description: generatedDescription || text,
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
                        location: generatedLocation || "Somewhere Online",
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
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="w-full max-w-2xl">
            <Events
              type="upcoming"
              take={20}
              showFilterPanel
              title="all upcoming"
            />
          </div>
          <span className="group flex cursor-pointer items-center gap-2 text-xl">
            <Link
              className="transform underline decoration-dotted underline-offset-4 transition-all duration-200 sm:translate-x-6 sm:group-hover:translate-x-0"
              href="/all"
            >
              View all
            </Link>
            <span className="transform transition-all duration-200 sm:-translate-x-2 sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">
              <ArrowRight className="h-4 w-4" />
            </span>
          </span>
        </div>
      </Main>
    </>
  );
};

export default Home;
