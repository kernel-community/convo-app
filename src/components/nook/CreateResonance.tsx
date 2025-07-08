"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { cn } from "src/lib/utils";
import toast from "react-hot-toast";

export interface CreateResonanceProps {
  className?: string;
}

export const CreateResonance: React.FC<CreateResonanceProps> = ({
  className,
}) => {
  const [resonanceText, setResonanceText] = useState("");
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState(50);
  const [isSliding, setIsSliding] = useState(false);
  const [showSubmittedState, setShowSubmittedState] = useState(false);
  const [submittedEmojis, setSubmittedEmojis] = useState({
    weather: "",
    energy: "",
  });

  const weatherOptions = [
    { emoji: "☀️", label: "sunny" },
    { emoji: "☁️", label: "cloudy" },
    { emoji: "🌧️", label: "rainy" },
  ];

  const getEnergyEmoji = (energy: number) => {
    if (energy <= 20) return "😊";
    if (energy <= 50) return "😃";
    if (energy <= 80) return "💃";
    return "⚡";
  };

  const handleSubmit = async () => {
    if (!resonanceText.trim()) return;

    const resonanceData = {
      text: resonanceText,
      weather: selectedWeather,
      energy: energyLevel,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/nook/resonance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resonanceData),
      });

      if (response.ok) {
        console.log("Resonance submitted successfully");

        // Show friendly success message
        const weatherEmoji = selectedWeather || "✨";
        const energyEmoji = getEnergyEmoji(energyLevel);

        // Store emojis for the submitted state display
        setSubmittedEmojis({ weather: weatherEmoji, energy: energyEmoji });

        // Show the submitted state
        setShowSubmittedState(true);

        // Reset form and hide submitted state after 4 seconds
        setTimeout(() => {
          setResonanceText("");
          setSelectedWeather(null);
          setEnergyLevel(50);
          setShowSubmittedState(false);
        }, 4000);
      } else {
        console.error("Failed to submit resonance");
        toast.error(
          "Oops! Something went wrong. Please try sharing your resonance again."
        );
      }
    } catch (error) {
      console.error("Error submitting resonance:", error);
      toast.error(
        "Oops! Something went wrong. Please try sharing your resonance again."
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "bg-card mx-auto w-full max-w-2xl rounded-lg border p-4 shadow-sm sm:p-6",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {showSubmittedState ? (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-[300px] items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="mb-4 text-6xl sm:text-8xl"
              >
                ({submittedEmojis.weather}, {submittedEmojis.energy})
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="font-primary text-sm text-muted-foreground sm:text-base"
              >
                Resonance captured ✨
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="mb-4 font-primary text-xl sm:mb-6 sm:text-3xl">
              Create Resonance
            </h2>

            <div className="space-y-4 font-primary sm:space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="Share what's resonating with you..."
                  value={resonanceText}
                  onChange={(e) => setResonanceText(e.target.value)}
                  className="h-auto min-h-[50px] border-2 p-3 text-base transition-colors focus:border-primary sm:min-h-[60px] sm:p-4 sm:text-lg"
                />
              </div>

              <div className="flex flex-col space-y-4 border-t pt-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                  <span className="text-sm font-medium text-muted-foreground">
                    personal weather
                  </span>
                  <div className="flex justify-center space-x-2 sm:justify-start">
                    {weatherOptions.map((option) => (
                      <motion.button
                        key={option.emoji}
                        onClick={() =>
                          setSelectedWeather(
                            selectedWeather === option.emoji
                              ? null
                              : option.emoji
                          )
                        }
                        className={cn(
                          "relative rounded-full border-2 p-2 text-xl transition-all sm:p-2 sm:text-2xl",
                          selectedWeather === option.emoji
                            ? "bg-primary/20 scale-105 border-primary shadow-lg"
                            : "hover:border-muted-foreground/20 border-transparent hover:bg-muted"
                        )}
                        whileHover={{
                          scale: selectedWeather === option.emoji ? 1.05 : 1.1,
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {option.emoji}
                        {selectedWeather === option.emoji && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary sm:h-4 sm:w-4"
                          >
                            <span className="text-xs text-primary-foreground">
                              ✓
                            </span>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-1 items-center space-x-3 sm:max-w-xs sm:space-x-4">
                  <span className="whitespace-nowrap text-sm font-medium text-muted-foreground">
                    energy
                  </span>
                  <div className="relative flex-1">
                    <Slider
                      value={energyLevel}
                      onChange={(value) => {
                        setEnergyLevel(value);
                        setIsSliding(true);
                        setTimeout(() => setIsSliding(false), 1000);
                      }}
                      min={0}
                      max={100}
                      step={1}
                      showInput={false}
                      className="flex-1"
                    />
                    <AnimatePresence>
                      {isSliding && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.5 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -top-12 left-[40%] z-10 flex -translate-x-1/2 transform items-center space-x-1 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground shadow-lg"
                        >
                          <span className="text-sm">
                            {getEnergyEmoji(energyLevel)}
                          </span>
                          <span>{energyLevel}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="min-w-[2rem] text-center text-sm text-muted-foreground">
                    {energyLevel}
                  </span>
                </div>
              </div>

              <motion.button
                onClick={handleSubmit}
                disabled={!resonanceText.trim()}
                className={cn(
                  "w-full rounded-lg px-4 py-3 text-sm font-medium transition-all sm:px-6 sm:text-base",
                  "hover:bg-primary/90 bg-primary text-primary-foreground",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Share Resonance
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
