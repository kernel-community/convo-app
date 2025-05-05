import type {
  FieldErrorsImpl,
  SubmitHandler,
  FieldErrors,
} from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import TextField from "./FormFields/TextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { RichTextArea } from "./FormFields/RichText";
import { upsertConvo } from "src/utils/upsertConvo";
import LoginButton from "../LoginButton";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useUser } from "src/context/UserContext";
import { useBetaMode } from "src/hooks/useBetaMode";
import Signature from "../EventPage/Signature";
import FieldLabel from "../StrongText";
import type { User } from "@prisma/client";
import { EventType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ConfirmConvoCredenza } from "./ConfirmConvo";
import type { ClientEventInput } from "src/types";
import { clientEventInputValidationScheme } from "src/types";
import { RecurrenceRuleInput } from "../RecurrenceRuleInput";
import { DateTimeStartAndEnd } from "../DateTimeStartAndEnd";
import { DateTime } from "luxon";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import BetaBadge from "../ui/beta-badge";
import { SadEmoji } from "../ui/emojis";
import { Input } from "../ui/input";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { ProposerSearchCombobox } from "../ProposerSearchCombobox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "src/lib/utils";

// Define a simple type for the proposer object in the list
type ProposerInfo = {
  id: string;
  nickname: string | null;
  image?: string | null;
  email?: string | null;
};

// Common timezones array for dropdown
const commonTimezones = [
  // North America
  "America/Adak", // Hawaii-Aleutian (UTC-10/UTC-9)
  "America/Anchorage", // Alaska (UTC-9/UTC-8)
  "America/Los_Angeles", // Pacific Time (UTC-8/UTC-7)
  "America/Phoenix", // Mountain Time - no DST (UTC-7)
  "America/Denver", // Mountain Time (UTC-7/UTC-6)
  "America/Chicago", // Central Time (UTC-6/UTC-5)
  "America/New_York", // Eastern Time (UTC-5/UTC-4)
  "America/Halifax", // Atlantic Time (UTC-4/UTC-3)
  "America/St_Johns", // Newfoundland (UTC-3:30/UTC-2:30)

  // Caribbean/Central America
  "America/Puerto_Rico", // Atlantic Standard Time (UTC-4)
  "America/Panama", // Eastern Standard Time (UTC-5)

  // South America
  "America/Santiago", // Chile (UTC-4/UTC-3)
  "America/Sao_Paulo", // Brazil (UTC-3)
  "America/Argentina/Buenos_Aires", // Argentina (UTC-3)
  "America/Bogota", // Colombia (UTC-5)

  // Europe
  "Atlantic/Reykjavik", // Iceland (UTC+0)
  "Europe/London", // United Kingdom (UTC+0/UTC+1)
  "Europe/Dublin", // Ireland (UTC+0/UTC+1)
  "Europe/Lisbon", // Portugal (UTC+0/UTC+1)
  "Europe/Paris", // France, Central European Time (UTC+1/UTC+2)
  "Europe/Berlin", // Germany (UTC+1/UTC+2)
  "Europe/Madrid", // Spain (UTC+1/UTC+2)
  "Europe/Rome", // Italy (UTC+1/UTC+2)
  "Europe/Amsterdam", // Netherlands (UTC+1/UTC+2)
  "Europe/Brussels", // Belgium (UTC+1/UTC+2)
  "Europe/Athens", // Greece (UTC+2/UTC+3)
  "Europe/Helsinki", // Finland (UTC+2/UTC+3)
  "Europe/Istanbul", // Turkey (UTC+3)
  "Europe/Moscow", // Russia - Moscow (UTC+3)

  // Africa
  "Africa/Cairo", // Egypt (UTC+2)
  "Africa/Lagos", // Nigeria (UTC+1)
  "Africa/Johannesburg", // South Africa (UTC+2)
  "Africa/Nairobi", // Kenya (UTC+3)
  "Africa/Casablanca", // Morocco (UTC+0/UTC+1)

  // Asia
  "Asia/Dubai", // UAE (UTC+4)
  "Asia/Riyadh", // Saudi Arabia (UTC+3)
  "Asia/Tehran", // Iran (UTC+3:30/UTC+4:30)
  "Asia/Karachi", // Pakistan (UTC+5)
  "Asia/Kolkata", // India (UTC+5:30)
  "Asia/Kathmandu", // Nepal (UTC+5:45)
  "Asia/Dhaka", // Bangladesh (UTC+6)
  "Asia/Bangkok", // Thailand (UTC+7)
  "Asia/Singapore", // Singapore (UTC+8)
  "Asia/Jakarta", // Indonesia (UTC+7)
  "Asia/Shanghai", // China (UTC+8)
  "Asia/Seoul", // South Korea (UTC+9)
  "Asia/Tokyo", // Japan (UTC+9)
  "Asia/Taipei", // Taiwan (UTC+8)
  "Asia/Manila", // Philippines (UTC+8)

  // Australia and Oceania
  "Australia/Perth", // Western Australia (UTC+8)
  "Australia/Darwin", // Northern Territory (UTC+9:30)
  "Australia/Brisbane", // Queensland (UTC+10)
  "Australia/Adelaide", // South Australia (UTC+9:30/UTC+10:30)
  "Australia/Sydney", // New South Wales (UTC+10/UTC+11)
  "Australia/Melbourne", // Victoria (UTC+10/UTC+11)
  "Australia/Hobart", // Tasmania (UTC+10/UTC+11)
  "Pacific/Auckland", // New Zealand (UTC+12/UTC+13)
  "Pacific/Fiji", // Fiji (UTC+12/UTC+13)
  "Pacific/Honolulu", // Hawaii (UTC-10)
  "Pacific/Guam", // Guam (UTC+10)

  // Additional North American Timezones for Canadian provinces
  "America/Vancouver", // British Columbia (UTC-8/UTC-7)
  "America/Edmonton", // Alberta (UTC-7/UTC-6)
  "America/Regina", // Saskatchewan - no DST (UTC-6)
  "America/Winnipeg", // Manitoba (UTC-6/UTC-5)
  "America/Toronto", // Ontario (UTC-5/UTC-4)
  "America/Montreal", // Quebec (UTC-5/UTC-4)

  // Special/Misc
  "UTC", // Coordinated Universal Time
];

// Format timezone name for display
const formatTimezoneDisplay = (tzName: string | null | undefined): string => {
  if (!tzName) return "Select timezone...";

  try {
    const now = DateTime.now().setZone(tzName);
    const offset = now.toFormat("ZZZZ");
    // Format: "America/New_York (GMT-04:00)"
    return `${tzName.replace("_", " ")} (${offset})`;
  } catch (e) {
    return tzName;
  }
};

// Timezone combobox component
const TimeZoneCombobox = ({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (value: string) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Don't override the value with local timezone - use the actual value passed in
  const displayValue = value;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {displayValue
            ? formatTimezoneDisplay(displayValue)
            : formatTimezoneDisplay(localTimezone)}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false} loop={true}>
          <CommandInput
            placeholder="Search timezone..."
            className="h-9"
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>No timezone found.</CommandEmpty>
            <CommandGroup>
              {commonTimezones
                .filter((timezone) =>
                  timezone.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((timezone) => (
                  <CommandItem
                    key={timezone}
                    value={timezone}
                    onSelect={() => {
                      onChange(timezone);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        displayValue === timezone ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {formatTimezoneDisplay(timezone)}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const ProposeForm = ({
  event,
  showRecurrenceInput = true,
}: {
  event?: ClientEventInput;
  showRecurrenceInput?: boolean;
}) => {
  const { fetchedUser: user } = useUser();
  const isBetaMode = useBetaMode();
  console.log("Beta mode enabled:", isBetaMode);
  const { push } = useRouter();

  // State for managing the list of proposers added to the event
  const [proposersList, setProposersList] = useState<ProposerInfo[]>([]);
  // State for the ID selected in the combobox, before clicking "Add"
  const [selectedProposerIdToAdd, setSelectedProposerIdToAdd] = useState<
    string | null
  >(null);
  // State to hold the full details of the selected user (needed for adding to list)
  const [selectedProposerDetails, setSelectedProposerDetails] =
    useState<ProposerInfo | null>(null);
  // Ref to track if the initial proposer list has been set
  const isInitializedRef = useRef<boolean>(false);
  // Ref to store the key representing the context (user/event) for the last initialization
  const initializationContextKeyRef = useRef<string | null>(null);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, defaultValues, isSubmitted },
    control,
    setValue,
  } = useForm<ClientEventInput>({
    resolver: zodResolver(clientEventInputValidationScheme),
    defaultValues: useMemo(() => {
      // If we have an event, use its values (assuming it includes proposers)
      if (event) {
        // TODO: Need to fetch full User info for proposers if event only has IDs
        return event;
      }

      // Otherwise, create default values
      const now = DateTime.now().startOf("hour").toJSDate();
      const twoHoursFromNow = DateTime.now()
        .plus({ hours: 2 })
        .startOf("hour")
        .toJSDate();
      const threeHoursFromNow = DateTime.now()
        .plus({ hours: 3 })
        .startOf("hour")
        .toJSDate();

      const initialProposers = user.isSignedIn ? [{ userId: user.id }] : [];
      const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      return {
        sessions: [
          {
            dateTime: now,
            duration: 1,
            count: 0,
          },
        ],
        nickname: user.nickname,
        gCalEvent: true,
        email: user.email ?? "",
        dateTimeStartAndEnd: {
          start: twoHoursFromNow,
          end: threeHoursFromNow,
        },
        recurrenceRule: "",
        limit: "0",
        proposers: initialProposers, // Initialize with current user if signed in
        creationTimezone: localTimezone, // Initialize with browser's local timezone
      };
    }, [event, user]),
  });

  // Memoize fetching proposers to avoid unnecessary rerenders and API calls
  const fetchProposersData = useCallback(async (proposerIds: string[]) => {
    if (proposerIds.length === 0) return [];

    try {
      const response = await fetch(
        `/api/query/users-by-ids?ids=${proposerIds.join(",")}`
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data = await response.json();
      return Array.isArray(data?.users) ? data.users : [];
    } catch (error) {
      console.error("Failed to fetch proposer details:", error);
      return [];
    }
  }, []);

  // Initialize proposersList state ONCE based on user sign-in or event data
  useEffect(() => {
    // Skip if already initialized with this data
    const eventContextId = event?.id ?? "new";
    const key = `${user.isSignedIn}-${eventContextId}`;

    if (
      isInitializedRef.current &&
      initializationContextKeyRef.current === key
    ) {
      return;
    }

    // Use an immediately invoked async function
    (async () => {
      let initialList: ProposerInfo[] = [];

      if (event && event.proposers && event.proposers.length > 0) {
        // Extract valid proposer IDs
        const proposerIds = event.proposers
          .map((p) => p.userId)
          .filter((id) => !!id);

        if (proposerIds.length > 0) {
          // Fetch proposer details
          initialList = await fetchProposersData(proposerIds);
        }
      } else if (user.isSignedIn) {
        // Use current user as the only proposer
        initialList = [
          {
            id: user.id ?? "",
            nickname: user.nickname ?? null,
            image: (user as any).image ?? null,
            email: user.email ?? "",
          },
        ];
      }

      // Update state only if there are changes
      setProposersList(initialList);

      // Set form values directly with proposer IDs
      setValue(
        "proposers",
        initialList.map((p) => ({ userId: p.id }))
      );

      // Mark as initialized
      isInitializedRef.current = true;
      initializationContextKeyRef.current = key;
    })();
  }, [
    user.isSignedIn,
    user.id,
    user.nickname,
    user.email,
    event,
    fetchProposersData,
    setValue,
  ]);

  // Memoized function to update form value when proposersList changes
  const updateFormProposers = useCallback(() => {
    // Only update form value if we have a non-empty list and form is initialized
    if (proposersList.length > 0 && formInitializedRef.current) {
      const validProposerIds = proposersList
        .map((p) => p.id)
        .filter((id) => !!id);

      setValue(
        "proposers",
        validProposerIds.map((id) => ({ userId: id }))
      );
    }
  }, [proposersList, setValue]);

  // Update form value when proposersList changes
  useEffect(() => {
    updateFormProposers();
  }, [updateFormProposers]);

  // Use a ref to track if the form was already initialized to prevent resets on tab focus changes
  const formInitializedRef = useRef(false);

  useEffect(() => {
    if (!formInitializedRef.current && event) {
      // Only reset the form once when it first loads with event data
      console.log("Initial form reset with event data");
      reset(event);
      formInitializedRef.current = true;
    }
  }, [event, reset]);

  const [openModalFlag, setOpenModalFlag] = useState<boolean>(false);

  const [convoToCreateData, setConvoToCreateData] =
    useState<ClientEventInput>();

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  // Function to handle selection from the combobox
  const handleSelectProposerFromCombobox = (
    userObject: ProposerInfo | null
  ) => {
    console.log(
      "[ProposeForm handleSelectProposer] Received userObject:",
      userObject
    );
    setSelectedProposerIdToAdd(userObject?.id ?? null);
    setSelectedProposerDetails(userObject);
    console.log(
      "[ProposeForm handleSelectProposer] Set state - ID:",
      userObject?.id ?? null,
      "Details:",
      userObject
    );
  };

  // Function to confirm adding the selected proposer to the list
  const handleConfirmAddProposer = () => {
    console.log(
      "[ProposeForm handleConfirmAdd] Clicked. Current details:",
      selectedProposerDetails
    );
    if (!selectedProposerDetails) {
      return;
    }

    // Check if user is already in the list
    if (proposersList.some((p) => p.id === selectedProposerDetails.id)) {
      console.log("[ProposeForm handleConfirmAdd] User already in list.");
    } else {
      console.log(
        "[ProposeForm handleConfirmAdd] Adding user to list:",
        selectedProposerDetails
      );
      setProposersList((prev) => [...prev, selectedProposerDetails]);
    }

    // Clear selection after adding
    console.log("[ProposeForm handleConfirmAdd] Clearing selection state.");
    setSelectedProposerIdToAdd(null);
    setSelectedProposerDetails(null);
  };

  // Function to remove a proposer
  const handleRemoveProposer = (idToRemove: string) => {
    console.log("[ProposeForm handleRemoveProposer] Removing ID:", idToRemove);
    if (user.isSignedIn && idToRemove === user.id) {
      console.log(
        "[ProposeForm handleRemoveProposer] Cannot remove primary proposer."
      );
      return;
    }
    setProposersList((prev) => {
      const newList = prev.filter((proposer) => proposer.id !== idToRemove);
      console.log("[ProposeForm handleRemoveProposer] New list:", newList);
      return newList;
    });
  };

  // @help better handling required here
  // display on the ui
  const onInvalid = (errors: FieldErrors<ClientEventInput>) => {
    console.log("INVALID submission");
    console.error(errors);
  };

  // We handle timezone conversion in the onSubmit handler

  const onSubmit: SubmitHandler<ClientEventInput> = async (data) => {
    console.log("Form data before timezone conversion:", data);

    // Create a copy of the data to modify
    const processedData = { ...data };

    // Ensure we have a valid timezone
    const timezone =
      processedData.creationTimezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Store the timezone in IANA format
    processedData.creationTimezone = timezone;

    // Convert dateTimeStartAndEnd dates to UTC based on selected timezone
    if (processedData.dateTimeStartAndEnd && timezone) {
      // Enhanced timezone diagnostics
      console.log(`Converting dates from timezone: ${timezone} to UTC`);
      console.log(`Timezone details:`);
      console.log(`- IANA name: ${timezone}`);

      // Check if timezone is in DST
      const now = DateTime.now().setZone(timezone);
      console.log(`- Current time in this zone: ${now.toString()}`);
      console.log(`- Is this timezone in DST? ${now.isInDST}`);
      console.log(`- UTC offset: ${now.offset / 60} hours`);

      // Get the exact offset for the selected dates
      const selectedDateStart = DateTime.fromJSDate(
        processedData.dateTimeStartAndEnd.start
      ).setZone(timezone);
      console.log(`- Selected date DST status: ${selectedDateStart.isInDST}`);
      console.log(
        `- Selected date UTC offset: ${selectedDateStart.offset / 60} hours`
      );

      // The issue is that the Date objects don't have timezone info, so we need to interpret them correctly
      // First, get the raw date values without timezone interpretation
      const rawStart = processedData.dateTimeStartAndEnd.start;
      const rawEnd = processedData.dateTimeStartAndEnd.end;

      // Create DateTime objects in the local timezone first
      const localTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log(`Browser's local timezone: ${localTZ}`);

      // Extract the date components in local time
      const startYear = rawStart.getFullYear();
      const startMonth = rawStart.getMonth() + 1; // Month is 0-indexed
      const startDay = rawStart.getDate();
      const startHour = rawStart.getHours();
      const startMinute = rawStart.getMinutes();

      const endYear = rawEnd.getFullYear();
      const endMonth = rawEnd.getMonth() + 1; // Month is 0-indexed
      const endDay = rawEnd.getDate();
      const endHour = rawEnd.getHours();
      const endMinute = rawEnd.getMinutes();

      console.log(
        `Raw date components: ${startYear}-${startMonth}-${startDay} ${startHour}:${startMinute}`
      );

      // Create DateTime objects with the correct timezone interpretation
      const startLocal = DateTime.fromObject(
        {
          year: startYear,
          month: startMonth,
          day: startDay,
          hour: startHour,
          minute: startMinute,
        },
        { zone: timezone }
      );

      const endLocal = DateTime.fromObject(
        {
          year: endYear,
          month: endMonth,
          day: endDay,
          hour: endHour,
          minute: endMinute,
        },
        { zone: timezone }
      );

      console.log(
        `Original start: ${startLocal.toISO()} (${startLocal.toFormat(
          "yyyy-MM-dd hh:mm a"
        )})`
      );
      console.log(
        `Original timezone: ${startLocal.zoneName}, Offset: ${
          startLocal.offset / 60
        } hours`
      );
      console.log(
        `Original end: ${endLocal.toISO()} (${endLocal.toFormat(
          "yyyy-MM-dd hh:mm a"
        )})`
      );
      console.log(
        `Original timezone: ${endLocal.zoneName}, Offset: ${
          endLocal.offset / 60
        } hours`
      );

      // Convert to UTC
      const startUTC = startLocal.toUTC();
      const endUTC = endLocal.toUTC();

      // Log the UTC conversion results
      console.log(
        `UTC start: ${startUTC.toISO()} (${startUTC.toFormat(
          "yyyy-MM-dd HH:mm:ss"
        )})`
      );
      console.log(
        `UTC end: ${endUTC.toISO()} (${endUTC.toFormat("yyyy-MM-dd HH:mm:ss")})`
      );
      console.log(`UTC offset: ${startUTC.offset / 60} hours (should be 0)`);

      // Calculate and log the actual time difference
      const hoursDiff =
        (startUTC.toMillis() - startLocal.toMillis()) / (1000 * 60 * 60);
      console.log(`Hours difference from local to UTC: ${hoursDiff}`);
      console.log(
        `Expected hours difference based on offset: ${-startLocal.offset / 60}`
      );
      console.log(
        `Conversion matches expected? ${
          Math.abs(hoursDiff + startLocal.offset / 60) < 0.01 ? "Yes" : "No"
        }`
      );

      console.log(
        `Converted start: ${startUTC.toString()}, UTC timezone: ${
          startUTC.zoneName
        }`
      );
      console.log(
        `Converted end: ${endUTC.toString()}, UTC timezone: ${endUTC.zoneName}`
      );

      // Update the data with UTC dates
      processedData.dateTimeStartAndEnd = {
        start: startUTC.toJSDate(),
        end: endUTC.toJSDate(),
      };
    }

    console.log("Form data after timezone conversion:", processedData);
    setOpenModalFlag(true);
    setConvoToCreateData(processedData);
  };

  const createConvo = async () => {
    setLoading(true);
    setErrorMessage(undefined); // Clear any previous errors

    if (!convoToCreateData) {
      setErrorMessage("Event data not found. Please try again.");
      setLoading(false);
      return;
    }

    // Check if the event date is in the past
    if (new Date(convoToCreateData.dateTimeStartAndEnd.start) < new Date()) {
      setErrorMessage("Events cannot be scheduled in the past.");
      setLoading(false);
      return;
    }

    // Ensure proposers are included in the data sent
    const dataToSend = {
      ...convoToCreateData,
      proposers: proposersList.map((p) => ({ userId: p.id })), // Use the state list
    };
    console.log("Data being sent to upsertConvo:", dataToSend); // Debug log

    try {
      const result = await upsertConvo(dataToSend, user?.id); // Pass updated data
      if (!result)
        throw new Error("No response returned from upsert operation");
      push(`/rsvp/${result.hash}`);
    } catch (err) {
      console.error("Error creating event:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "An unexpected error occurred. Please try again."
      );
      setLoading(false);
    }
  };

  console.log(
    "[ProposeForm Render] State Before Return - ID:",
    selectedProposerIdToAdd,
    "Details:",
    selectedProposerDetails
  );

  return (
    <>
      <ConfirmConvoCredenza
        openModalFlag={openModalFlag}
        setOpenModalFlag={setOpenModalFlag}
        convoToCreateData={convoToCreateData}
        user={user}
        action={createConvo}
        isLoading={loading}
        fullProposersList={proposersList}
        errorMessage={errorMessage}
      />
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className={`align-center flex flex-col gap-6`}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      >
        {/* Title */}
        <TextField
          name="title"
          fieldName="Title"
          register={register}
          errors={errors}
          required={false}
          autoFocus={true}
        />

        {/* Description */}
        <Controller
          name="description"
          control={control}
          rules={{ required: "Description is required" }}
          render={({ field }) => {
            return (
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
                fieldName="Description"
                required={true}
                value={defaultValues?.description}
                infoText="What is your event about? For IRL events, please include the location address. This helps people decide whether to attend before they RSVP."
              />
            );
          }}
        />

        {/* component for start datetime */}
        <Controller
          name="dateTimeStartAndEnd"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <DateTimeStartAndEnd
              handleChange={field.onChange}
              value={defaultValues?.dateTimeStartAndEnd}
            />
          )}
        />

        {/* Timezone Selection */}
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="timezone" className="font-secondary">
              Timezone
            </Label>
            <Controller
              name="creationTimezone"
              control={control}
              render={({ field }) => {
                return (
                  <TimeZoneCombobox
                    value={field.value}
                    onChange={field.onChange}
                  />
                );
              }}
            />
            <p className="text-sm text-muted-foreground">
              This timezone will be used for displaying event times to
              attendees.
            </p>
          </div>
        </div>

        {/* component/dropdown for recurrence rule */}
        {showRecurrenceInput && (
          <Controller
            name="recurrenceRule"
            control={control}
            rules={{ required: false }}
            render={({ field }) => (
              <RecurrenceRuleInput
                handleChange={field.onChange}
                value={defaultValues?.recurrenceRule}
              />
            )}
          />
        )}

        {/* Limit */}
        <div className="space-y-4">
          <TextField
            name="limit"
            fieldName="Limit"
            register={register}
            errors={errors}
            required={false}
            type="number"
            infoText="Set the maximum number of attendees (set 0 for No Limit). If a limit is set, attendees trying to RSVP after it's full will be added to a waitlist."
          />
        </div>

        {/* Location */}
        <TextField
          name="location"
          fieldName="Location"
          infoText="enter a valid url or address for IRL events"
          register={register}
          errors={errors}
          required={false}
        />

        {/* Event Type - Only visible to beta users */}
        {isBetaMode && (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center">
                <Label htmlFor="type" className="font-secondary">
                  Event Type
                </Label>
                <BetaBadge />
              </div>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || EventType.JUNTO}
                    onValueChange={(value) =>
                      field.onChange(value as EventType)
                    }
                    defaultValue={EventType.JUNTO}
                  >
                    <SelectTrigger className="w-full">
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
        )}

        {/* Email field remains the same - tied to the logged-in user */}
        {user && user.email && (
          <div>
            <FieldLabel>Email</FieldLabel>
            <div className="mt-2 flex flex-row items-center gap-3">
              {user.email}
            </div>
          </div>
        )}

        {/* Proposers Section */}
        <div>
          <FieldLabel>Host(s)</FieldLabel>
          <div className="mt-2 flex flex-col gap-2">
            {/* Display current list of proposers */}
            <div className="mt-2 flex flex-col gap-2">
              {proposersList.map((proposer) => (
                <div
                  key={proposer.id}
                  className="flex items-center gap-2 rounded-md border bg-muted p-1"
                >
                  <Signature
                    user={
                      proposer as User /* Cast needed for Signature, ensure ProposerInfo matches User */
                    }
                  />
                  {/* Add remove button, but don't allow removing the primary user */}
                  {user.isSignedIn && proposer.id !== user.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-auto p-1"
                      onClick={() => handleRemoveProposer(proposer.id)}
                      aria-label={`Remove ${proposer.nickname || "proposer"}`}
                    >
                      <X size={16} />
                    </Button>
                  )}
                  {/* Show a lock or similar for the primary user - Optional */}
                  {/* {user.isSignedIn && proposer.id === user.id && (
                    <Lock size={16} className="ml-auto text-muted-foreground" />
                  )} */}
                </div>
              ))}
              {proposersList.length === 0 && !user.isSignedIn && (
                <div className="font-secondary text-sm text-muted-foreground">
                  Sign in to propose
                </div>
              )}
            </div>

            {/* Add Proposer Combobox and Button */}
            {user.isSignedIn && (
              <div className="mt-4 flex items-start gap-2">
                {" "}
                {/* Changed to items-start */}
                <div className="flex-grow">
                  {" "}
                  {/* Allow combobox to take space */}
                  <ProposerSearchCombobox
                    // Pass the current selection state (ID is used for checkmark)
                    selectedUserId={selectedProposerIdToAdd}
                    // Use the correct prop name and pass the updated handler
                    onSelectUser={handleSelectProposerFromCombobox}
                    // Provide existing proposer IDs to filter them out
                    existingProposerIds={
                      new Set(proposersList.map((p) => p.id))
                    }
                  />
                  {/* Optional: add help text specific to combobox */}
                  <p className="mt-1 text-sm text-muted-foreground">
                    Type 2+ characters to search for users by nickname.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleConfirmAddProposer}
                  variant="outline"
                  disabled={!selectedProposerIdToAdd} // Disable if no user is selected
                  className="shrink-0" // Prevent button from shrinking
                >
                  Add Proposer
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* nickname
        <div>
          <FieldLabel>Proposing as</FieldLabel>
          <div className="mt-2 flex flex-row items-center gap-3">
            {user.isSignedIn ? (
              <Signature user={user as User} />
            ) : (
              <div className="font-secondary">You are not signed in</div>
            )}
          </div>
        </div> */}

        {/* Error Summary */}
        {isSubmitted && Object.keys(errors).length > 0 && (
          <div className="rounded-md bg-red-50 p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <SadEmoji width={30} height={30} />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Please fix the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc space-y-1 pl-5">
                    {errors.description && (
                      <li>{errors.description.message?.toString()}</li>
                    )}
                    {/* Add other specific errors as needed */}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {!user.isSignedIn ? (
          <LoginButton
            disabled={isSubmitted && Object.keys(errors).length > 0}
          />
        ) : (
          <Button type="submit" isLoading={loading}>
            Submit
          </Button>
        )}
      </form>
    </>
  );
};

export default ProposeForm;
