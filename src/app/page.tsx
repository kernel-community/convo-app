"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Layout and context providers
import Main from "../layouts/Main";
import CursorsContextProvider from "src/context/CursorsContext";
import SharedSpace from "src/components/SharedSpace";

// Home components
import {
  Header,
  ConvoInputArea,
  CreateButton,
  EventFormSection,
  EventsSection,
} from "src/components/Home";
import type { DateTimeRange, GeneratedEventData } from "src/components/Home";

// Utils
import { getLocalTimezoneOffset } from "src/utils/getLocalTimezoneOffset";
import { formatWithTimezone } from "src/utils/formatWithTimezone";

// Main Home component
const Home = () => {
  // Time and timezone handling
  const tzOffset = getLocalTimezoneOffset();
  const currentDate = new Date();
  const NOW = formatWithTimezone(currentDate, tzOffset);

  // State management
  const [text, setText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showTextArea, setShowTextArea] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState<string>("");
  const [generatedDescription, setGeneratedDescription] = useState<string>("");
  const [dateTimeStartAndEnd, setDateTimeStartAndEnd] =
    useState<DateTimeRange | null>(null);
  const [generatedLocation, setGeneratedLocation] = useState<string | null>(
    null
  );

  const formRef = useRef<HTMLDivElement>(null);
  const userStartedTyping = !!text.trim() && !showForm;
  const host = process.env.NEXT_PUBLIC_PARTYKIT_SERVER_HOST || "";

  // Handle the create button click
  const handleCreateClick = useCallback(() => {
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

    // Call API to generate event data
    fetch("/api/client-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        now: NOW,
        tzOffset,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data: GeneratedEventData) => {
        setGeneratedTitle(data.title);
        setDateTimeStartAndEnd(data.dateTime);
        setGeneratedDescription(data.description);
        setGeneratedLocation(data.location);
        setShowForm(true);
      })
      .catch((error) => {
        console.error("Error processing data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // Wait for form to be rendered before scrolling
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }, [text, showTextArea, showForm, NOW, tzOffset]);

  // Keyboard shortcut handling
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !showForm) {
        e.preventDefault();
        handleCreateClick();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [showForm, handleCreateClick]);

  return (
    <CursorsContextProvider host={host} roomId="home">
      <SharedSpace>
        <Main>
          <div className="flex flex-col items-center gap-6">
            {/* Header section */}
            <Header
              userStartedTyping={userStartedTyping}
              showTextArea={showTextArea}
              showForm={showForm}
            />

            <div className="flex w-full max-w-2xl flex-col items-center space-y-2 font-secondary">
              {/* Text input area */}
              <ConvoInputArea
                showTextArea={showTextArea}
                showForm={showForm}
                text={text}
                setText={setText}
                setShowForm={setShowForm}
                setGeneratedTitle={setGeneratedTitle}
                setDateTimeStartAndEnd={setDateTimeStartAndEnd}
              />

              {/* Create button */}
              <CreateButton
                showForm={showForm}
                showTextArea={showTextArea}
                text={text}
                isLoading={isLoading}
                handleCreateClick={handleCreateClick}
              />

              {/* Event form */}
              <EventFormSection
                showForm={showForm}
                formRef={formRef}
                generatedDescription={generatedDescription}
                text={text}
                generatedTitle={generatedTitle}
                dateTimeStartAndEnd={dateTimeStartAndEnd}
                generatedLocation={generatedLocation}
              />
            </div>

            {/* Events section */}
            <EventsSection />
          </div>
        </Main>
      </SharedSpace>
    </CursorsContextProvider>
  );
};

export default Home;
