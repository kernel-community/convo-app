/**
 * Helper functions for working with RRule (recurrence rules)
 */

/**
 * Cleans up an RRULE string by removing any DTSTART component
 * This is necessary because we set the DTSTART explicitly when creating RRule objects
 */
export function cleanupRruleString(rruleString: string): string {
  // Remove any DTSTART component as we'll set it explicitly
  return rruleString.replace(/DTSTART:[^\n]+\n?/i, "");
}
