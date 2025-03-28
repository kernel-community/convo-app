export function formatWithTimezone(date: Date, timezoneOffset: string): string {
  // Parse the timezone offset
  const [sign, hours, minutes] =
    timezoneOffset.match(/([+-])(\d{2}):(\d{2})/)?.slice(1) || [];
  if (!sign || !hours || !minutes) {
    throw new Error(
      `Invalid timezone offset format. Expected format: "+HH:MM" or "-HH:MM"`
    );
  }

  // Get UTC time
  const utcTime = date.getTime();

  // Calculate target timezone offset in milliseconds
  // For -08:00, we want to subtract 8 hours from UTC time
  // For +08:00, we want to add 8 hours to UTC time
  const targetOffsetMs =
    (parseInt(hours) * 60 + parseInt(minutes)) *
    (sign === "-" ? -1 : 1) *
    60000;
  // Create date in target timezone
  const targetDate = new Date(utcTime + targetOffsetMs);

  // Format the date components
  const year = targetDate.getUTCFullYear();
  const month = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getUTCDate()).padStart(2, "0");
  const hrs = String(targetDate.getUTCHours()).padStart(2, "0");
  const mins = String(targetDate.getUTCMinutes()).padStart(2, "0");
  const secs = String(targetDate.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hrs}:${mins}:${secs}${timezoneOffset}`;
}
