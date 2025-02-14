export function formatWithTimezone(date: Date, timezoneOffset: string): string {
  // Parse the timezone offset
  const [sign, hours, minutes] =
    timezoneOffset.match(/([+-])(\d{2}):(\d{2})/)?.slice(1) || [];
  if (!sign || !hours || !minutes) {
    throw new Error(
      "Invalid timezone offset format. Expected format: \"+HH:MM\" or \"-HH:MM\""
    );
  }

  // Calculate offset in minutes
  const offsetMinutes =
    (parseInt(hours) * 60 + parseInt(minutes)) * (sign === "+" ? -1 : 1);

  // Create a new date by adjusting for the timezone
  const localDate = new Date(
    date.getTime() + (date.getTimezoneOffset() + offsetMinutes) * 60000
  );

  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  const hrs = String(localDate.getHours()).padStart(2, "0");
  const mins = String(localDate.getMinutes()).padStart(2, "0");
  const secs = String(localDate.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hrs}:${mins}:${secs}${timezoneOffset}`;
}
