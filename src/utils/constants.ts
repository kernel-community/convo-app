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

export const BETA_USERS = [
  "angela.gilhotra@gmail.com",
  // Add more beta users as needed
];

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
