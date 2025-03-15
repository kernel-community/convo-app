// Common types used across Home components

export type DateTimeRange = {
  start: string;
  end: string;
};

export type GeneratedEventData = {
  title: string;
  dateTime: DateTimeRange;
  description: string;
  location: string | null;
};
