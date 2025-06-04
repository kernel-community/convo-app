export const DEFAULT_USER_NICKNAME = "Anonymous";

export const STAGING = "staging.convo.cafe";
export const DEFAULT_HOST = "www.convo.cafe";

// SENDING EVENT CALENDAR INVITE EMAILS
export const EVENT_ORGANIZER_NAME = "Convo Cafe";
export const EVENT_ORGANIZER_EMAIL = "hedwig@convo.cafe";

export const DESKTOP = "(min-width: 768px)";

export const KERNEL_SMOLBRAIN_API =
  process.env.NEXT_PUBLIC_KERNEL_SMOLBRAIN_API;
export const KERNEL_SMOLBRAIN_APP_NAME =
  process.env.NEXT_PUBLIC_KERNEL_SMOLBRAIN_APP_NAME;

export const QUOTES = [
  {
    quote:
      "Even the abandoned places have a language. They speak in silence. They bloom with echoes.",
    by: "Unknown",
  },
  {
    quote:
      "The art of conversation is the art of hearing as well as of being heard.",
    by: "William Hazlitt",
  },
  {
    quote:
      "The most important thing in communication is hearing what isn't said.",
    by: "Peter Drucker",
  },
  {
    quote:
      "Conversation about the weather is the last refuge of the unimaginative.",
    by: "Oscar Wilde",
  },
  {
    quote:
      "The true spirit of conversation consists in building on another's observation, not overturning it.",
    by: "Edward G. Bulwer-Lytton",
  },
  {
    quote: "What am I, if not, in relation with you?",
    by: "Kernel Community",
  },
  {
    quote: "Not all those who wander are lost.",
    by: "J.R.R. Tolkien",
  },
  {
    quote:
      "but he who is not afraid of my darkness, will find banks full of roses",
    by: "Friedrich Nietzsche",
  },
];

export const FRENS = [
  {
    name: "Angela",
    url: "https://x.com/probablyangg",
    contribution: ["dev", "design", "product"],
    image: "",
  },
  {
    name: "Kernel",
    url: "https://kernel.community/",
    contribution: ["sponsor", "kernel"],
    image: "",
  },
  {
    name: "Vivek",
    url: "https://x.com/vsinghdothings",
    contribution: ["kernel", "product", "dev"],
    image: "",
  },
  {
    name: "Andy",
    url: "https://x.com/cryptowanderer",
    contribution: ["everything", "kernel"],
    image: "",
  },
  {
    name: "Aliya",
    url: "https://x.com/aliyajypsy",
    contribution: ["kernel", "product"],
    image: "",
  },
  {
    name: "Ricy",
    url: "",
    contribution: ["frontend"],
    image: "",
  },
  {
    name: "Alanah",
    url: "",
    contribution: ["design", "logo", "colors"],
    image: "",
  },
  {
    name: "Ash",
    url: "",
    contribution: ["design", "emojis", "logo", "product"],
    image: "",
  },
  {
    name: "Kanika",
    url: "",
    contribution: ["frontend"],
    image: "",
  },
  {
    name: "Aviraj",
    url: "",
    contribution: ["backend"],
    image: "",
  },
  {
    name: "Abhimanyu",
    url: "",
    contribution: ["backend"],
    image: "",
  },
  {
    name: "Claude",
    url: "https://claude.ai",
    contribution: ["everything"],
    image: "",
  },
];

// Base path for default profile picture assets
const DEFAULT_PROFILE_PICTURE_BASE_PATH =
  "https://kernelconvo.s3.us-east-2.amazonaws.com/characters/";

// Define the number of default profile pictures
const NUM_DEFAULT_PROFILE_PICTURES = 86;

// Generate filenames like 'char1.jpeg', 'char2.jpeg', ...
const DEFAULT_PROFILE_PICTURE_FILENAMES: string[] = Array.from(
  { length: NUM_DEFAULT_PROFILE_PICTURES },
  (_, i) => `char${i + 1}.jpeg`
);

// Array of default profile pictures
export const DEFAULT_PROFILE_PICTURES: string[] =
  DEFAULT_PROFILE_PICTURE_FILENAMES.map(
    (filename) => `${DEFAULT_PROFILE_PICTURE_BASE_PATH}${filename}`
  );

// Function to get a deterministic default profile picture based on user ID
export const getDefaultProfilePicture = (
  userId: string | undefined | null
): string => {
  if (!userId || DEFAULT_PROFILE_PICTURES.length === 0) {
    // Return the first one if no ID or array is empty
    return DEFAULT_PROFILE_PICTURES[0] || ""; // Fallback to empty string if array is somehow empty
  }

  // FNV-1a 32-bit hash function for better distribution
  let hash = 0x811c9dc5; // FNV offset basis

  for (let i = 0; i < userId.length; i++) {
    hash ^= userId.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  // Ensure hash is a positive integer for modulo operation
  hash = hash >>> 0;

  const index = hash % DEFAULT_PROFILE_PICTURES.length;
  return DEFAULT_PROFILE_PICTURES[index] ?? DEFAULT_PROFILE_PICTURES[0] ?? ""; // Use existing fallback
};
