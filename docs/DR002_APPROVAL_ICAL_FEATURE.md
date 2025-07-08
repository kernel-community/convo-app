# DR002: RSVP Approval iCal Feature

**Context**: Users who received RSVP approval emails had no easy way to add approved events to their calendars, requiring manual event creation and increasing friction in the user experience.

**Consequences**:
- Improved user experience with seamless calendar integration
- Reduced manual work for users adding events to calendars
- Increased complexity in email generation logic
- Additional testing required for calendar compatibility across platforms

---

## Overview

When an RSVP request is approved by an event organizer, the user now receives an iCal event attachment in their approval email. This allows them to easily add the event to their calendar with all the correct details.

## How It Works

### Before (Previous Behavior)
- User requests to RSVP to an event that requires approval
- Organizer approves the request
- User receives "Your RSVP was approved" email
- ❌ **No calendar attachment** - user had to manually add event to calendar

### After (New Behavior)
- User requests to RSVP to an event that requires approval
- Organizer approves the request
- User receives "Your RSVP was approved" email
- ✅ **iCal attachment included** - user can click to add event directly to calendar
- ✅ **Email mentions the attachment** in a helpful "Quick tips" section

## Technical Implementation

### Files Modified

1. **`src/utils/email/send.ts`**
   - Added `approvalRsvpType` parameter to `sendEventEmail` function
   - Added logic to generate iCal when `type === "approval-approved"` and `approvalRsvpType` is provided

2. **`src/lib/queue/email.ts`**
   - Added `approvalRsvpType` to `EmailJobData` interface

3. **`src/lib/queue/workers/email.ts`**
   - Updated email worker to handle the new parameter
   - Added iCal generation logic for approval-approved emails

4. **`src/app/api/approval/rsvp/route.ts`**
   - Modified the approval email sending to pass the user's RSVP type
   - Added type safety for valid RSVP types only

5. **`src/components/Email/templates/ApprovalApproved.tsx`**
   - Added "Quick tips" section mentioning the calendar attachment
   - Improved user experience and discoverability

### Key Logic

```typescript
// When sending approval-approved email
if (type === "approval-approved" && approvalRsvpType) {
  rsvpType = approvalRsvpType; // Use the actual RSVP type for iCal generation
}
```

The system now:
1. Takes the user's original RSVP request type (GOING/MAYBE/NOT_GOING)
2. Uses that type to generate an appropriate iCal event
3. Attaches the iCal file to the approval email
4. Informs the user about the attachment in the email content

### Email Types and iCal Generation

| Email Type | iCal Generated? | Notes |
|------------|----------------|-------|
| `approval-requested` | ❌ No | Notification to organizers only |
| `approval-approved` | ✅ **Yes** | **NEW**: Uses the approved RSVP type |
| `approval-rejected` | ❌ No | No calendar event needed |
| `invite-going` | ✅ Yes | Existing behavior |
| `invite-maybe` | ✅ Yes | Existing behavior |
| `invite-not-going` | ✅ Yes (CANCEL) | Existing behavior |

## User Experience

### Email Content
The approval email now includes a helpful section:

```
Quick tips:
• Add this to your calendar using the attached .ics file
• You'll get a reminder 1 hour before the event
• Need to change your RSVP? No worries, just visit the event page
```

### Calendar Integration
- **GOING** approval → iCal with PARTSTAT=ACCEPTED
- **MAYBE** approval → iCal with PARTSTAT=TENTATIVE
- **NOT_GOING** approval → iCal with PARTSTAT=DECLINED

## Testing

To test this feature:

1. Create an event that requires approval (`requiresApproval: true`)
2. Have a user request RSVP (with type GOING, MAYBE, or NOT_GOING)
3. Approve the request as an organizer
4. Check that the approval email contains an .ics attachment
5. Verify the iCal file has correct event details and RSVP status

## Backward Compatibility

✅ **Fully backward compatible**
- Existing approval emails without `approvalRsvpType` work as before (no iCal)
- All other email types unchanged
- No database schema changes required
- Queue system enhanced but compatible

## Security & Validation

- Only valid RSVP types (`GOING`, `MAYBE`, `NOT_GOING`) are accepted
- TypeScript type safety prevents invalid values
- Graceful fallback if `approvalRsvpType` is not provided
- No risk of generating invalid iCal files

## Benefits

1. **Better User Experience**: Users can easily add approved events to their calendars
2. **Reduced Friction**: No manual event creation needed
3. **Consistent with Existing Flow**: Regular RSVP emails already include iCal attachments
4. **Calendar Reminders**: Users automatically get calendar-based notifications
5. **Professional Integration**: Works with all major calendar applications (Google Calendar, Outlook, Apple Calendar, etc.)