"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { DateTime } from "luxon";
import { EventType, LocationType, RSVP_TYPE, EmailType } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { nanoid } from "nanoid";
import { RichTextArea } from "src/components/ProposeForm/FormFields/RichText";

// Schema to validate the prefill form
const prefillFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDateTime: z.string().min(1, "Start date is required"),
  endDateTime: z.string().min(1, "End date is required"),
  location: z.string().default(""),
  locationType: z
    .enum([LocationType.ONLINE, LocationType.MAP, LocationType.CUSTOM])
    .default(LocationType.ONLINE),
  limit: z.string().default("0"),
  rrule: z.string().optional(),
  type: z
    .enum([
      EventType.JUNTO,
      EventType.UNLISTED,
      EventType.INTERVIEW,
      EventType.TEST,
    ])
    .default(EventType.JUNTO),
  hash: z.string().default(() => nanoid(10)),
  proposerIds: z.string().optional(),
});

// Schema for RSVP form
const rsvpFormSchema = z
  .object({
    eventId: z.string().min(1, "Event ID is required"),
    attendeeId: z.string().optional(),
    attendeeEmail: z.string().email().optional(),
    rsvpType: z.nativeEnum(RSVP_TYPE).default(RSVP_TYPE.GOING),
  })
  .refine((data) => data.attendeeId || data.attendeeEmail, {
    message: "Either attendee ID or email is required",
    path: ["attendeeId"],
  });

// Schema for Reminder (Email) form
const reminderFormSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  eventId: z.string().min(1, "Event ID is required"),
  reminderId: z.string().min(1, "Reminder ID is required"),
  type: z.nativeEnum(EmailType).default(EmailType.REMINDER24HR),
  sent: z.boolean().default(false),
  delivered: z.boolean().default(false),
  bounced: z.boolean().default(false),
  cancelled: z.boolean().default(false),
});

// Schema for Slack Message form
const slackMessageFormSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  slackId: z.string().min(1, "Slack ID is required"),
  ts: z.string().min(1, "Timestamp is required"),
});

type PrefillFormData = z.infer<typeof prefillFormSchema>;
type RsvpFormData = z.infer<typeof rsvpFormSchema>;
type ReminderFormData = z.infer<typeof reminderFormSchema>;
type SlackMessageFormData = z.infer<typeof slackMessageFormSchema>;

export default function PrefillConvoPage() {
  // ====== EVENT FORM STATE ======
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    eventId?: string;
  }>({
    success: false,
    message: "",
  });

  // ====== RSVP FORM STATE ======
  const [isRsvpLoading, setIsRsvpLoading] = useState(false);
  const [rsvpResult, setRsvpResult] = useState<{
    success: boolean;
    message: string;
    id?: string;
  }>({
    success: false,
    message: "",
  });

  // ====== REMINDER FORM STATE ======
  const [isReminderLoading, setIsReminderLoading] = useState(false);
  const [reminderResult, setReminderResult] = useState<{
    success: boolean;
    message: string;
    id?: string;
  }>({
    success: false,
    message: "",
  });

  // ====== SLACK MESSAGE FORM STATE ======
  const [isSlackMessageLoading, setIsSlackMessageLoading] = useState(false);
  const [slackMessageResult, setSlackMessageResult] = useState<{
    success: boolean;
    message: string;
    id?: string;
  }>({
    success: false,
    message: "",
  });

  // Add a state to toggle between email and ID input
  const [useEmailForRsvp, setUseEmailForRsvp] = useState(true);

  // Form for Event Creation
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PrefillFormData>({
    resolver: zodResolver(prefillFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startDateTime:
        DateTime.now().plus({ hours: 1 }).toISO()?.slice(0, 16) || "",
      endDateTime:
        DateTime.now().plus({ hours: 2 }).toISO()?.slice(0, 16) || "",
      location: "",
      locationType: LocationType.ONLINE,
      limit: "0",
      rrule: "",
      type: EventType.JUNTO,
      hash: nanoid(10),
      proposerIds: "",
    },
  });

  // Form for RSVP Creation
  const {
    register: registerRsvp,
    handleSubmit: handleSubmitRsvp,
    control: controlRsvp,
    reset: resetRsvp,
    setValue: setRsvpValue,
    watch: watchRsvp,
    formState: { errors: rsvpErrors },
  } = useForm<RsvpFormData>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      eventId: "",
      attendeeId: "",
      attendeeEmail: "",
      rsvpType: RSVP_TYPE.GOING,
    },
  });

  // Form for Reminder (Email) Creation
  const {
    register: registerReminder,
    handleSubmit: handleSubmitReminder,
    control: controlReminder,
    reset: resetReminder,
    setValue: setReminderValue,
    formState: { errors: reminderErrors },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      userId: "",
      eventId: "",
      reminderId: nanoid(10), // Generate a random ID
      type: EmailType.REMINDER24HR,
      sent: false,
      delivered: false,
      bounced: false,
      cancelled: false,
    },
  });

  // Form for Slack Message Creation
  const {
    register: registerSlackMessage,
    handleSubmit: handleSubmitSlackMessage,
    reset: resetSlackMessage,
    setValue: setSlackMessageValue,
    formState: { errors: slackMessageErrors },
  } = useForm<SlackMessageFormData>({
    resolver: zodResolver(slackMessageFormSchema),
    defaultValues: {
      eventId: "",
      slackId: "",
      ts: DateTime.now().toISO() || "",
    },
  });

  // When an event is successfully created, populate the RSVP form with the event ID
  const updateFormsWithEventId = (eventId: string) => {
    setRsvpValue("eventId", eventId);
    setReminderValue("eventId", eventId);
    setSlackMessageValue("eventId", eventId);
  };

  // Form submission handler for Event Creation
  const onSubmit = async (data: PrefillFormData) => {
    setIsLoading(true);
    setResult({ success: false, message: "" });

    try {
      // Parse proposerIds string into an array of objects
      const proposers = data.proposerIds
        ? data.proposerIds.split(",").map((id) => ({ userId: id.trim() }))
        : [];

      // Format dates correctly
      const startDateTime = new Date(data.startDateTime);
      const endDateTime = new Date(data.endDateTime);

      // Create the event object to send to the API
      const eventData = {
        title: data.title,
        descriptionHtml: data.description,
        startDateTime,
        endDateTime,
        location: data.location,
        locationType: data.locationType,
        limit: parseInt(data.limit),
        hash: data.hash,
        rrule: data.rrule || null,
        type: data.type,
        proposers,
        // Include the timezone
        creationTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await fetch("/api/prefill/convo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event: eventData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create event");
      }

      const responseData = await response.json();
      setResult({
        success: true,
        message: "Event created successfully!",
        eventId: responseData.id,
      });

      // Pre-fill other forms with the new event ID
      if (responseData.id) {
        updateFormsWithEventId(responseData.id);
      }

      reset(); // Reset form after successful submission
    } catch (error) {
      console.error("Error creating event:", error);
      setResult({
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission handler for RSVP Creation
  const onRsvpSubmit = async (data: RsvpFormData) => {
    setIsRsvpLoading(true);
    setRsvpResult({ success: false, message: "" });

    try {
      const response = await fetch("/api/prefill/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rsvp: data }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create RSVP");
      }

      const responseData = await response.json();
      setRsvpResult({
        success: true,
        message: "RSVP created successfully!",
        id: responseData.id,
      });

      // Don't reset the eventId field to make it easier to add multiple RSVPs for the same event
      const eventId = data.eventId;
      const useEmail = useEmailForRsvp;
      resetRsvp();
      setRsvpValue("eventId", eventId);
      setUseEmailForRsvp(useEmail);
    } catch (error) {
      console.error("Error creating RSVP:", error);
      setRsvpResult({
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsRsvpLoading(false);
    }
  };

  // Form submission handler for Reminder Creation
  const onReminderSubmit = async (data: ReminderFormData) => {
    setIsReminderLoading(true);
    setReminderResult({ success: false, message: "" });

    try {
      const response = await fetch("/api/prefill/reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reminder: data }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create reminder");
      }

      const responseData = await response.json();
      setReminderResult({
        success: true,
        message: "Reminder created successfully!",
        id: responseData.id,
      });

      // Keep the eventId and userId but reset other fields
      const { eventId, userId } = data;
      resetReminder();
      setReminderValue("eventId", eventId);
      setReminderValue("userId", userId);
      setReminderValue("reminderId", nanoid(10)); // Generate a new unique ID
    } catch (error) {
      console.error("Error creating reminder:", error);
      setReminderResult({
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsReminderLoading(false);
    }
  };

  // Form submission handler for Slack Message Creation
  const onSlackMessageSubmit = async (data: SlackMessageFormData) => {
    setIsSlackMessageLoading(true);
    setSlackMessageResult({ success: false, message: "" });

    try {
      const response = await fetch("/api/prefill/slack-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slackMessage: data }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create slack message");
      }

      const responseData = await response.json();
      setSlackMessageResult({
        success: true,
        message: "Slack message created successfully!",
        id: responseData.id,
      });

      // Keep the eventId but reset other fields
      const eventId = data.eventId;
      resetSlackMessage();
      setSlackMessageValue("eventId", eventId);
      setSlackMessageValue("ts", DateTime.now().toISO() || "");
    } catch (error) {
      console.error("Error creating slack message:", error);
      setSlackMessageResult({
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSlackMessageLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* EVENT CREATION FORM */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-bold">Create Event</h2>

        {result.message && (
          <div
            className={`mb-4 border p-2 ${
              result.success
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <p>{result.message}</p>
            {result.success && result.eventId && (
              <p className="mt-1">
                Event ID: {result.eventId} -
                <a href={`/rsvp/${result.eventId}`} className="ml-1 underline">
                  View Event
                </a>
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Controller
              name="description"
              control={control}
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <RichTextArea
                  handleChange={(content) => {
                    // Set empty string if content is just empty HTML tags or whitespace
                    const strippedContent = content
                      .replace(/<[^>]*>/g, "")
                      .trim();
                    field.onChange(strippedContent ? content : "");
                  }}
                  errors={errors}
                  name={field.name}
                  fieldName="Description (HTML)"
                  required={true}
                  value={field.value}
                  infoText="Enter event description with formatting"
                />
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDateTime">Start Date & Time</Label>
              <Input
                id="startDateTime"
                type="datetime-local"
                {...register("startDateTime")}
              />
              {errors.startDateTime && (
                <p className="text-sm text-red-500">
                  {errors.startDateTime.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="endDateTime">End Date & Time</Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                {...register("endDateTime")}
              />
              {errors.endDateTime && (
                <p className="text-sm text-red-500">
                  {errors.endDateTime.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
            </div>

            <div>
              <Label htmlFor="locationType">Location Type</Label>
              <Controller
                name="locationType"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as LocationType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LocationType.ONLINE}>
                        ONLINE
                      </SelectItem>
                      <SelectItem value={LocationType.MAP}>MAP</SelectItem>
                      <SelectItem value={LocationType.CUSTOM}>
                        CUSTOM
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="limit">Attendee Limit (0 for no limit)</Label>
              <Input id="limit" type="number" min="0" {...register("limit")} />
            </div>

            <div>
              <Label htmlFor="type">Event Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) =>
                      field.onChange(value as EventType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={EventType.JUNTO}>JUNTO</SelectItem>
                      <SelectItem value={EventType.UNLISTED}>
                        UNLISTED
                      </SelectItem>
                      <SelectItem value={EventType.INTERVIEW}>
                        INTERVIEW
                      </SelectItem>
                      <SelectItem value={EventType.TEST}>TEST</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="rrule">Recurrence Rule (optional)</Label>
            <Input id="rrule" {...register("rrule")} />
            <p className="text-xs text-gray-500">
              Example: FREQ=WEEKLY;INTERVAL=1;BYDAY=MO
            </p>
          </div>

          <div>
            <Label htmlFor="hash">Hash (for URL)</Label>
            <Input id="hash" {...register("hash")} />
          </div>

          <div>
            <Label htmlFor="proposerIds">Proposer IDs (comma separated)</Label>
            <Input id="proposerIds" {...register("proposerIds")} />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Event..." : "Create Event"}
          </Button>
        </form>
      </div>

      <hr className="my-6" />

      {/* RSVP CREATION FORM */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-bold">Create RSVP</h2>

        {rsvpResult.message && (
          <div
            className={`mb-4 border p-2 ${
              rsvpResult.success
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <p>{rsvpResult.message}</p>
            {rsvpResult.success && rsvpResult.id && (
              <p className="mt-1">RSVP ID: {rsvpResult.id}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmitRsvp(onRsvpSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="eventId">Event ID</Label>
            <Input id="eventId" {...registerRsvp("eventId")} />
            {rsvpErrors.eventId && (
              <p className="text-sm text-red-500">
                {rsvpErrors.eventId.message}
              </p>
            )}
          </div>

          <div className="mb-2 flex items-center space-x-2">
            <input
              type="checkbox"
              id="useEmail"
              checked={useEmailForRsvp}
              onChange={() => setUseEmailForRsvp(!useEmailForRsvp)}
              className="h-4 w-4"
            />
            <Label htmlFor="useEmail" className="font-normal">
              Use email instead of user ID
            </Label>
          </div>

          {useEmailForRsvp ? (
            <div>
              <Label htmlFor="attendeeEmail">Attendee Email</Label>
              <Input
                id="attendeeEmail"
                type="email"
                placeholder="user@example.com"
                {...registerRsvp("attendeeEmail")}
              />
              {rsvpErrors.attendeeEmail && (
                <p className="text-sm text-red-500">
                  {rsvpErrors.attendeeEmail.message}
                </p>
              )}
            </div>
          ) : (
            <div>
              <Label htmlFor="attendeeId">Attendee ID</Label>
              <Input id="attendeeId" {...registerRsvp("attendeeId")} />
              {rsvpErrors.attendeeId && (
                <p className="text-sm text-red-500">
                  {rsvpErrors.attendeeId.message}
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="rsvpType">RSVP Type</Label>
            <Controller
              name="rsvpType"
              control={controlRsvp}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as RSVP_TYPE)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select RSVP type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RSVP_TYPE.GOING}>GOING</SelectItem>
                    <SelectItem value={RSVP_TYPE.MAYBE}>MAYBE</SelectItem>
                    <SelectItem value={RSVP_TYPE.NOT_GOING}>
                      NOT_GOING
                    </SelectItem>
                    <SelectItem value={RSVP_TYPE.REMINDER72HR}>
                      REMINDER72HR
                    </SelectItem>
                    <SelectItem value={RSVP_TYPE.REMINDER72HRPROPOSER}>
                      REMINDER72HRPROPOSER
                    </SelectItem>
                    <SelectItem value={RSVP_TYPE.OFF_WAITLIST}>
                      OFF_WAITLIST
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={isRsvpLoading}>
            {isRsvpLoading ? "Creating RSVP..." : "Create RSVP"}
          </Button>
        </form>
      </div>

      <hr className="my-6" />

      {/* REMINDER (EMAIL) CREATION FORM */}
      <div className="mb-10">
        <h2 className="mb-4 text-xl font-bold">Create Reminder (Email)</h2>

        {reminderResult.message && (
          <div
            className={`mb-4 border p-2 ${
              reminderResult.success
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <p>{reminderResult.message}</p>
            {reminderResult.success && reminderResult.id && (
              <p className="mt-1">Reminder ID: {reminderResult.id}</p>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmitReminder(onReminderSubmit)}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="eventId-reminder">Event ID</Label>
            <Input id="eventId-reminder" {...registerReminder("eventId")} />
            {reminderErrors.eventId && (
              <p className="text-sm text-red-500">
                {reminderErrors.eventId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input id="userId" {...registerReminder("userId")} />
            {reminderErrors.userId && (
              <p className="text-sm text-red-500">
                {reminderErrors.userId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="reminderId">
              Reminder ID (Resend scheduled email id)
            </Label>
            <Input id="reminderId" {...registerReminder("reminderId")} />
            {reminderErrors.reminderId && (
              <p className="text-sm text-red-500">
                {reminderErrors.reminderId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="emailType">Email Type</Label>
            <Controller
              name="type"
              control={controlReminder}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as EmailType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select email type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EmailType.CREATE}>CREATE</SelectItem>
                    <SelectItem value={EmailType.INVITE}>INVITE</SelectItem>
                    <SelectItem value={EmailType.UPDATE}>UPDATE</SelectItem>
                    <SelectItem value={EmailType.REMINDER24HR}>
                      REMINDER24HR
                    </SelectItem>
                    <SelectItem value={EmailType.REMINDER1HR}>
                      REMINDER1HR
                    </SelectItem>
                    <SelectItem value={EmailType.REMINDER1MIN}>
                      REMINDER1MIN
                    </SelectItem>
                    <SelectItem value={EmailType.REMINDER1HRPROPOSER}>
                      REMINDER1HRPROPOSER
                    </SelectItem>
                    <SelectItem value={EmailType.REMINDER72HR}>
                      REMINDER72HR
                    </SelectItem>
                    <SelectItem value={EmailType.REMINDER72HRPROPOSER}>
                      REMINDER72HRPROPOSER
                    </SelectItem>
                    <SelectItem value={EmailType.OFF_WAITLIST}>
                      OFF_WAITLIST
                    </SelectItem>
                    <SelectItem value={EmailType.WAITLISTED}>
                      WAITLISTED
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sent"
                {...registerReminder("sent")}
                className="h-4 w-4"
              />
              <Label htmlFor="sent" className="font-normal">
                Sent
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="delivered"
                {...registerReminder("delivered")}
                className="h-4 w-4"
              />
              <Label htmlFor="delivered" className="font-normal">
                Delivered
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="bounced"
                {...registerReminder("bounced")}
                className="h-4 w-4"
              />
              <Label htmlFor="bounced" className="font-normal">
                Bounced
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="cancelled"
                {...registerReminder("cancelled")}
                className="h-4 w-4"
              />
              <Label htmlFor="cancelled" className="font-normal">
                Cancelled
              </Label>
            </div>
          </div>

          <Button type="submit" disabled={isReminderLoading}>
            {isReminderLoading ? "Creating Reminder..." : "Create Reminder"}
          </Button>
        </form>
      </div>

      <hr className="my-6" />

      {/* SLACK MESSAGE CREATION FORM */}
      <div>
        <h2 className="mb-4 text-xl font-bold">Create Slack Message</h2>

        {slackMessageResult.message && (
          <div
            className={`mb-4 border p-2 ${
              slackMessageResult.success
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <p>{slackMessageResult.message}</p>
            {slackMessageResult.success && slackMessageResult.id && (
              <p className="mt-1">Message ID: {slackMessageResult.id}</p>
            )}
          </div>
        )}

        <form
          onSubmit={handleSubmitSlackMessage(onSlackMessageSubmit)}
          className="space-y-4"
        >
          <div>
            <Label htmlFor="eventId-slack">Event ID</Label>
            <Input id="eventId-slack" {...registerSlackMessage("eventId")} />
            {slackMessageErrors.eventId && (
              <p className="text-sm text-red-500">
                {slackMessageErrors.eventId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="slackId">Slack ID</Label>
            <Input id="slackId" {...registerSlackMessage("slackId")} />
            {slackMessageErrors.slackId && (
              <p className="text-sm text-red-500">
                {slackMessageErrors.slackId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="ts">Timestamp (ts)</Label>
            <Input id="ts" {...registerSlackMessage("ts")} />
            {slackMessageErrors.ts && (
              <p className="text-sm text-red-500">
                {slackMessageErrors.ts.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSlackMessageLoading}>
            {isSlackMessageLoading
              ? "Creating Message..."
              : "Create Slack Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
