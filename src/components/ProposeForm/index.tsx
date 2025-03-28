import type { FieldErrorsImpl, SubmitHandler } from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import TextField from "./FormFields/TextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { RichTextArea } from "./FormFields/RichText";
import { upsertConvo } from "src/utils/upsertConvo";
import LoginButton from "../LoginButton";
import { useEffect, useMemo, useState } from "react";
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

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, defaultValues, isSubmitted },
    control,
  } = useForm<ClientEventInput>({
    resolver: zodResolver(clientEventInputValidationScheme),
    defaultValues: useMemo(() => {
      // If we have an event, use its values
      if (event) return event;

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
      };
    }, [event, user]),
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => reset(event), [event]);

  const [openModalFlag, setOpenModalFlag] = useState<boolean>(false);

  const [convoToCreateData, setConvoToCreateData] =
    useState<ClientEventInput>();

  const [loading, setLoading] = useState<boolean>(false);

  // @help better handling required here
  // display on the ui
  const onInvalid = (errors: Partial<FieldErrorsImpl<ClientEventInput>>) => {
    console.log("INVALID submission");
    console.error(errors);
  };
  const createConvo = async () => {
    setLoading(true);
    if (!convoToCreateData) {
      console.error("convo to create data not found");
      return;
    }
    try {
      const result = await upsertConvo(convoToCreateData, user?.id);
      if (!result) throw "No response returned from upsert operation";
      push(`/rsvp/${result.hash}`);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };
  const onSubmit: SubmitHandler<ClientEventInput> = async (data) => {
    setOpenModalFlag(true);
    setConvoToCreateData(data);
  };
  return (
    <>
      <ConfirmConvoCredenza
        openModalFlag={openModalFlag}
        setOpenModalFlag={setOpenModalFlag}
        convoToCreateData={convoToCreateData}
        user={user}
        action={createConvo}
        isLoading={loading}
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
          rules={{ required: true }}
          render={({ field }) => (
            <RichTextArea
              handleChange={field.onChange}
              errors={errors}
              name={field.name}
              fieldName="Description"
              value={defaultValues?.description}
            />
          )}
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
            infoText="Would you like to limit the number of RSVPs to this Convo? (optional - set 0 for No Limit)"
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

        {user && user.email && (
          <div>
            <FieldLabel>Email</FieldLabel>
            <div className="mt-2 flex flex-row items-center gap-3">
              {/* <Signature user={user as User} /> */}
              {user.email}
            </div>
          </div>
        )}

        {/* nickname */}
        <div>
          <FieldLabel>Proposing as</FieldLabel>
          <div className="mt-2 flex flex-row items-center gap-3">
            {user.isSignedIn ? (
              <Signature user={user as User} />
            ) : (
              <div className="font-secondary">You are not signed in</div>
            )}
          </div>
        </div>

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
