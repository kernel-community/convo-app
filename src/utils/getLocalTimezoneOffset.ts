export function getLocalTimezoneOffset(): string {
  const date = new Date();
  const offset = -date.getTimezoneOffset();
  const hours = Math.floor(Math.abs(offset) / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (Math.abs(offset) % 60).toString().padStart(2, "0");
  return `${offset >= 0 ? "+" : "-"}${hours}:${minutes}`;
}
