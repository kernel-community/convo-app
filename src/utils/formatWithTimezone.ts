export function formatWithTimezone(date: Date, timezoneOffset: string): string {
  // Parse the timezone offset
  const [sign, hours, minutes] =
    timezoneOffset.match(/([+-])(\d{2}):(\d{2})/)?.slice(1) || [];
  if (!sign || !hours || !minutes) {
    throw new Error(
      `Invalid timezone offset format. Expected format: "+HH:MM" or "-HH:MM"`
    );
  }

  console.log("formatWithTimezone debug:", {
    inputDate: date,
    inputDateISO: date.toISOString(),
    timezoneOffset,
    sign,
    hours,
    minutes,
  });

  // Get UTC time
  const utcTime = date.getTime();

  // Calculate target timezone offset in milliseconds
  const targetOffsetMs =
    (parseInt(hours) * 60 + parseInt(minutes)) *
    (sign === "+" ? -1 : 1) *
    60000;

  console.log("offset calculation:", {
    utcTime,
    targetOffsetMs,
    resultTime: utcTime + targetOffsetMs,
  });

  // Create date in target timezone
  const targetDate = new Date(utcTime + targetOffsetMs);

  console.log("target date:", {
    targetDate,
    targetDateISO: targetDate.toISOString(),
  });

  // Format the date components
  const year = targetDate.getUTCFullYear();
  const month = String(targetDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getUTCDate()).padStart(2, "0");
  const hrs = String(targetDate.getUTCHours()).padStart(2, "0");
  const mins = String(targetDate.getUTCMinutes()).padStart(2, "0");
  const secs = String(targetDate.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hrs}:${mins}:${secs}${timezoneOffset}`;
}
