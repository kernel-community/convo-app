import { LocationType } from "@prisma/client";

export const parseConvoLocation = (locationType: LocationType) => {
  if (locationType === LocationType.ONLINE) {
    return "online";
  }
  if (locationType === LocationType.MAP) {
    return "in person";
  }
  if (locationType === LocationType.CUSTOM) {
    return "on earth";
  }
  return "unknown";
};
