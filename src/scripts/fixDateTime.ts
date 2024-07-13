import { DateTime } from "luxon";

const convertTimeToZone = ({
  dt,
  sourceZone,
  targetZone,
}: {
  dt: string;
  sourceZone: string;
  targetZone: string;
}) => {
  return DateTime.fromISO(dt, { zone: sourceZone })
    .setZone(targetZone)
    .toISO()
    ?.toString();
};
console.log(
  convertTimeToZone({
    dt: "2024-08-07T16:30:00",
    sourceZone: "America/New_York",
    targetZone: "utc",
  })
);
