"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ScramblePair = {
  title: string;
  placeholder: string;
};

const scramblePairs: ScramblePair[] = [
  {
    title: "Convo",
    placeholder:
      "Just finished this mind-bending sci-fi book about parallel universes, and I can't stop thinking about it. Anyone up for a cozy evening chat about multiverses over hot chocolate?",
  },
  {
    title: "Cooking Night",
    placeholder:
      "My grandma's secret pasta recipe has been passed down for generations, and I'd love to host a virtual cooking session. Warning: There will be stories about my Italian childhood!",
  },
  {
    title: "Hiking Group",
    placeholder:
      "Found this incredible hiking trail with a hidden waterfall. Looking for fellow adventurers to explore it this weekend. Bonus points if you know good trail snacks!",
  },
  {
    title: "Music Jam",
    placeholder:
      "Recently started learning to play the ukulele, and I'm hosting a tiny living room concert. Complete beginners welcome - we can laugh at our mistakes together!",
  },
  {
    title: "Garden Club",
    placeholder:
      "I've been experimenting with urban gardening on my tiny balcony. Want to join me for a session on growing herbs and maybe swap some seedlings? Plants and tea provided!",
  },
  {
    title: "Space Talk",
    placeholder:
      "Just watched a documentary about space that blew my mind. Looking for curious minds to discuss black holes and maybe plan a stargazing night?",
  },
  {
    title: "Book Club",
    placeholder:
      "Started a small book club with a twist - we read the first chapter together and make wild predictions about the ending. Snacks and wild theories encouraged!",
  },
  {
    title: "Baking Class",
    placeholder:
      "My latest baking experiment: fusion desserts! Want to join a weekend session where we combine unexpected flavors? Current mission: Matcha-Tiramisu!",
  },
  {
    title: "Photo Walk",
    placeholder:
      "Photography enthusiasts: Found some quirky street art in hidden alleys. Planning a photo walk to capture the city's secret spots. All skill levels welcome!",
  },
  {
    title: "Writers Room",
    placeholder:
      "Working on a creative writing project and need fresh perspectives. Think: time-traveling coffee shop meets local folklore. Brainstorming session with tea and cookies?",
  },
  {
    title: "Vinyl Night",
    placeholder:
      "Discovered an old vinyl collection and setting up a retro music appreciation evening. Come share stories behind your favorite classics while we spin some records!",
  },
  {
    title: "Maker Space",
    placeholder:
      "Building a mini robot from recycled materials and could use some creative minds. No engineering experience needed - just bring your imagination and stay for pizza!",
  },
  {
    title: "Art Workshop",
    placeholder:
      "Starting a cozy crafting circle where we learn different cultural art forms each month. This week: Japanese origami and the stories behind each fold. Tea and paper provided!",
  },
  {
    title: "Star Party",
    placeholder:
      "Amateur astronomer here organizing a meteor shower watch party! Bringing telescopes, warm blankets, and homemade hot cider. Join us for a night under the stars?",
  },
];

type ScrambleContextType = {
  currentPair: ScramblePair;
  isScrambling: boolean;
  progress: number;
};

const ScrambleContext = createContext<ScrambleContextType | undefined>(
  undefined
);

export const ScrambleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScrambling, setIsScrambling] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isScrambling) {
        setIsScrambling(true);
        let currentProgress = 0;
        const scrambleInterval = setInterval(() => {
          currentProgress += 0.05;
          if (currentProgress >= 1) {
            clearInterval(scrambleInterval);
            setCurrentIndex((prev) => (prev + 1) % scramblePairs.length);
            setProgress(0);
            setIsScrambling(false);
          } else {
            setProgress(currentProgress);
          }
        }, 30);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isScrambling]);

  return (
    <ScrambleContext.Provider
      value={{
        currentPair: scramblePairs[currentIndex] || {
          title: "Convo",
          placeholder: "Convo",
        },
        isScrambling,
        progress,
      }}
    >
      {children}
    </ScrambleContext.Provider>
  );
};

export const useScramble = () => {
  const context = useContext(ScrambleContext);
  if (context === undefined) {
    throw new Error("useScramble must be used within a ScrambleProvider");
  }
  return context;
};
