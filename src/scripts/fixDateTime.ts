import { DateTime } from "luxon";

const convertTimeToZone = ({
  inISO,
  sourceZone,
  targetZone,
}: {
  inISO: string;
  sourceZone: string;
  targetZone: string;
}) => {
  return DateTime.fromISO(inISO, { zone: sourceZone })
    .setZone(targetZone)
    .toISO()
    ?.toString();
};
console.log(
  convertTimeToZone({
    inISO: "2024-08-07T16:30:00",
    sourceZone: "America/New_York",
    targetZone: "utc",
  })
);
