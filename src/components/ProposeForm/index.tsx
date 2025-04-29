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
import { useEffect, useMemo, useState, useRef } from "react";
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
import { X } from "lucide-react";
import { ProposerSearchCombobox } from "../ProposerSearchCombobox";

// Define a simple type for the proposer object in the list
type ProposerInfo = {
  id: string;
  nickname: string | null;
  image?: string | null;
  email?: string | null;
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
      };
    }, [event, user]),
  });

  // Initialize proposersList state ONCE based on user sign-in or event data
  useEffect(() => {
    const eventContextId = event?.id ?? "new";
    const key = `${user.isSignedIn}-${eventContextId}`;

    if (
      isInitializedRef.current &&
      initializationContextKeyRef.current === key
    ) {
      console.log(
        "[ProposeForm useEffect user/event] Skipping initialization, already set for key:",
        key
      );
      return;
    }

    console.log(
      "[ProposeForm useEffect user/event] Running INITIALIZATION for key:",
      key
    );

    // Use an async IIFE (Immediately Invoked Function Expression) to handle async fetch
    (async () => {
      let initialList: ProposerInfo[] = [];
      let fetchedFromApi = false; // Flag to track if we fetched data

      if (event && event.proposers && event.proposers.length > 0) {
        console.log(
          "[ProposeForm useEffect user/event] Initializing from EVENT data (fetching details):",
          event.proposers
        );
        const proposerIds = event.proposers
          .map((p) => p.userId)
          .filter((id) => !!id);

        if (proposerIds.length > 0) {
          try {
            const response = await fetch(
              `/api/query/users-by-ids?ids=${proposerIds.join(",")}`
            );
            if (!response.ok) {
              throw new Error(`API error: ${response.statusText}`);
            }
            const data = await response.json();
            // Ensure data.users is an array before assigning
            initialList = Array.isArray(data?.users) ? data.users : [];
            fetchedFromApi = true;
            console.log(
              "[ProposeForm useEffect user/event] Fetched user details:",
              initialList
            );
          } catch (error) {
            console.error(
              "[ProposeForm useEffect user/event] Failed to fetch proposer details:",
              error
            );
            // Decide fallback behavior: empty list, or list with just IDs?
            // Falling back to an empty list for now.
            initialList = [];
          }
        } else {
          // Event has proposers array, but it's empty or only null/empty IDs
          initialList = [];
        }
      } else if (user.isSignedIn) {
        console.log(
          "[ProposeForm useEffect user/event] Initializing with signed-in user."
        );
        initialList = [
          {
            id: user.id ?? "",
            nickname: user.nickname ?? null,
            image: (user as any).image ?? null,
            email: user.email ?? "",
          },
        ];
      } // If not signed in and no event data, initialList remains []

      console.log(
        "[ProposeForm useEffect user/event] Setting initial proposer list:",
        initialList
      );
      setProposersList(initialList);
      // Only set form value if we didn't just fetch (avoids potential race conditions if API is slow)
      // Or, adjust setValue dependency array if needed
      if (!fetchedFromApi) {
        setValue(
          "proposers",
          initialList.map((p) => ({ userId: p.id }))
        );
      }

      // Mark as initialized and store the context key
      isInitializedRef.current = true;
      initializationContextKeyRef.current = key;
      console.log(
        "[ProposeForm useEffect user/event] Initialization complete for key:",
        key
      );
    })(); // Immediately invoke the async function

    // Watch user sign-in status and the event object itself
    // We only include setValue in deps for the non-async path to avoid issues.
    // The list is set via setProposersList, which triggers the other effect for form value sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.isSignedIn, event]); // Removed setValue from deps

  // Update form value whenever proposersList changes (This handles sync after fetch)
  useEffect(() => {
    console.log(
      "[ProposeForm useEffect proposersList] Running. List:",
      proposersList
    );
    const validProposerIds = proposersList
      .map((p) => p.id)
      .filter((id) => !!id);
    console.log(
      "[ProposeForm useEffect proposersList] Setting form value:",
      validProposerIds.map((id) => ({ userId: id }))
    );
    setValue(
      "proposers",
      validProposerIds.map((id) => ({ userId: id }))
    );
  }, [proposersList, setValue]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    console.log(
      "[ProposeForm useEffect reset] Running. Resetting form with event:",
      event
    );
    reset(event);
  }, [event, reset]); // Added reset dependency explicitly

  const [openModalFlag, setOpenModalFlag] = useState<boolean>(false);

  const [convoToCreateData, setConvoToCreateData] =
    useState<ClientEventInput>();

  const [loading, setLoading] = useState<boolean>(false);

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
  const createConvo = async () => {
    setLoading(true);
    if (!convoToCreateData) {
      console.error("convo to create data not found");
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
      if (!result) throw "No response returned from upsert operation";
      push(`/rsvp/${result.hash}`);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const onSubmit: SubmitHandler<ClientEventInput> = async (data) => {
    // The 'proposers' field in 'data' should now be up-to-date
    // because we used setValue in the useEffect hook listening to proposersList
    console.log("Form data on submit:", data); // Debug log
    setOpenModalFlag(true);
    setConvoToCreateData(data); // Use the data directly from react-hook-form
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
