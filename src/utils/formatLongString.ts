export default function formatLongString(
  str?: string | null,
  endPrefix?: number,
  endSuffix?: number
): string {
  if (!str) return "";
  if (str.length <= (endPrefix || 0) + (endSuffix || 0)) return str;
  const prefix = str.substring(0, endPrefix || 8);
  const suffix =
    endSuffix === 0 ? "" : str.substring(str.length - (endSuffix || 4));
  return `${prefix}...${suffix}`;
}
