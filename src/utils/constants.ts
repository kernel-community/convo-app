import { quoteProps } from "prettier.config.cjs";

export const DEFAULT_USER_NICKNAME = "Anonymous";

export const CALENDAR_IDS = {
  convoProd: "c_jbo7pqegjcra855vidt3iio044@group.calendar.google.com",
  test: "c_7d2de4652f6f664a70a5297dcabb04c8020f9a4e1f09f679f8d185b4b109357d@group.calendar.google.com",
  interviews: "c_9i24ls2obk0lh5feigb860m22s@group.calendar.google.com",
};

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

// List of filenames for default profile pictures
const DEFAULT_PROFILE_PICTURE_FILENAMES: string[] = [
  "4v1rhy4v1rhy4v1r.jpeg",
  "7r2t1l7r2t1l7r2t.jpeg",
  "8e99yu8e99yu8e99.jpeg",
  "9dorof9dorof9dor.jpeg",
  "a8aww4a8aww4a8aw.jpeg",
  "bwbmy3bwbmy3bwbm.jpeg",
  "de79gqde79gqde79.jpeg",
  "dvlklkdvlklkdvlk.jpeg",
  "fhh1y0fhh1y0fhh1.jpeg",
  "i24m68i24m68i24m.jpeg",
  "n0oyuon0oyuon0oy.jpeg",
  "sgvqphsgvqphsgvq.jpeg",
  "ywt6wdywt6wdywt6.jpeg",
  "bc09unbc09unbc09.jpeg",
  "g03m0sg03m0sg03m.jpeg",
  "8b8mem8b8mem8b8m.jpeg",
  "e4s9qbe4s9qbe4s9.jpeg",
  "yxe6xmyxe6xmyxe6.jpeg",
  "no8bdfno8bdfno8b.jpeg",
  "ivc8vjivc8vjivc8.jpeg",
  "ht5a2dht5a2dht5a.jpeg",
  "6vt7vx6vt7vx6vt7.jpeg",
  "6j4wxl6j4wxl6j4w.jpeg",
  "rq7m18rq7m18rq7m.jpeg",
  "y41w1ky41w1ky41w.jpeg",
  "kznjsfkznjsfkznj.jpeg",
  "66bowkr6bowkr6bow.jpeg",
  "esmfg2esmfg2esmf.jpeg",
  "lurz99lurz99lurz.jpeg",
  "g5gr80g5gr80g5gr.jpeg",
  "172kgw172kgw172k.jpeg",
  "43o9j043o9j043o9.jpeg",
  "dzroj9dzroj9dzro.jpeg",
  "eo38jaeo38jaeo38.jpeg",
  "maptk7maptk7mapt.jpeg",
  "ldo4z9ldo4z9ldo4.jpeg",
  "y4ne8gy4ne8gy4ne.jpeg",
  "nli2iinli2iinli2.jpeg",
  "i9iy5ei9iy5ei9iy.jpeg",
  "5vz0k05vz0k05vz0.jpeg",
  "fjx9gvfjx9gvfjx9.jpeg",
  "dqdcltdqdcltdqd.jpeg",
  "pdb65cpdb65cpdb6.jpeg",
  "1x2nl61x2nl61x2n.jpeg",
  "md4yi3md4yi3md4y.jpeg",
  "w59qgfw59qgfw59q.jpeg",
  "dkgztodkgztodkgz.jpeg",
  "jr7li5jr7li5jr7l.jpeg",
  "igyel1igyel1igye.jpeg",
];

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
