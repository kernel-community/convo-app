// This is only when count is set to 0 for some reason. whenever count is 0 or until is 0, these need to be set as null or undefined to be porsed correctly
export const cleanupRruleString = (rruleString: string): string => {
  const ruleParts = rruleString.split(";").filter((part) => {
    if (part.startsWith("COUNT=")) {
      const count = parseInt(part.split("=").at(1) || "0");
      return count > 0;
    }
    return true;
  });
  return ruleParts.join(";");
};
