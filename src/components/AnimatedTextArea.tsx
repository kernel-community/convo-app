import { useEffect, useState } from "react";

const placeholders = [
  "Just finished this mind-bending sci-fi book about parallel universes, and I can't stop thinking about it. Anyone up for a cozy evening chat about multiverses over hot chocolate?",
  "My grandma's secret pasta recipe has been passed down for generations, and I'd love to host a virtual cooking session. Warning: There will be stories about my Italian childhood!",
  "Found this incredible hiking trail with a hidden waterfall. Looking for fellow adventurers to explore it this weekend. Bonus points if you know good trail snacks!",
  "Recently started learning to play the ukulele, and I'm hosting a tiny living room concert. Complete beginners welcome - we can laugh at our mistakes together!",
  "I've been experimenting with urban gardening on my tiny balcony. Want to join me for a session on growing herbs and maybe swap some seedlings? Plants and tea provided!",
  "Just watched a documentary about space that blew my mind. Looking for curious minds to discuss black holes and maybe plan a stargazing night?",
  "Started a small book club with a twist - we read the first chapter together and make wild predictions about the ending. Snacks and wild theories encouraged!",
  "My latest baking experiment: fusion desserts! Want to join a weekend session where we combine unexpected flavors? Current mission: Matcha-Tiramisu!",
  "Photography enthusiasts: Found some quirky street art in hidden alleys. Planning a photo walk to capture the city's secret spots. All skill levels welcome!",
  "Working on a creative writing project and need fresh perspectives. Think: time-traveling coffee shop meets local folklore. Brainstorming session with tea and cookies?",
  "Discovered an old vinyl collection and setting up a retro music appreciation evening. Come share stories behind your favorite classics while we spin some records!",
  "Building a mini robot from recycled materials and could use some creative minds. No engineering experience needed - just bring your imagination and stay for pizza!",
  "Starting a cozy crafting circle where we learn different cultural art forms each month. This week: Japanese origami and the stories behind each fold. Tea and paper provided!",
  "Amateur astronomer here organizing a meteor shower watch party! Bringing telescopes, warm blankets, and homemade hot cider. Join us for a night under the stars?",
  "Found some fascinating local ghost stories and planning a historical walking tour of the neighborhood. Ending with spooky story sharing at a charming café!",
];

const scrambleText = (text: string | undefined, progress: number): string => {
  if (!text) return "";
  return text
    .split("")
    .map((char) => {
      // Keep spaces and special characters intact
      if (char === " " || char === "?" || char === ".") return char;
      // Use a smoother easing function
      const easeInOutCubic =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      const scrambleChance = Math.sin(easeInOutCubic * Math.PI);
      return Math.random() > scrambleChance
        ? char
        : String.fromCharCode(97 + Math.floor(Math.random() * 26));
    })
    .join("");
};

export const AnimatedTextArea = ({
  className,
  value,
  onChange,
}: {
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayText, setDisplayText] = useState(placeholders[0]);
  const [isScrambling, setIsScrambling] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % placeholders.length;
      setCurrentIndex(nextIndex);

      // Start scrambling animation
      setIsScrambling(true);
      let scrambleCount = 0;
      const totalSteps = 40; // More steps for smoother animation

      const scrambleInterval = setInterval(() => {
        if (scrambleCount < totalSteps) {
          const progress = scrambleCount / totalSteps;
          // Use a single smooth transition
          setDisplayText(
            scrambleText(
              progress < 0.5
                ? placeholders[currentIndex]
                : placeholders[nextIndex],
              progress
            )
          );
          scrambleCount++;
        } else {
          clearInterval(scrambleInterval);
          setDisplayText(placeholders[nextIndex]);
          setIsScrambling(false);
        }
      }, 35);
    }, 10000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <textarea
      placeholder={displayText}
      className={`placeholder:text-muted-foreground/50 ${className}`}
      value={value}
      onChange={onChange}
    />
  );
};
