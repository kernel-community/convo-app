import type { FieldErrorsImpl, SubmitHandler } from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import TextField from "./FormFields/TextField";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { RichTextArea } from "./FormFields/RichText";
import SessionsInput from "./FormFields/SessionsInput";
import useCreateEvent from "src/hooks/useCreateEvent";
import useUpdateEvent from "src/hooks/useUpdateEvent";
import LoginButton from "../LoginButton";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "src/context/UserContext";
import Signature from "../EventPage/Signature";
import FieldLabel from "../StrongText";
import type { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { ConfirmConvoCredenza } from "./ConfirmConvo";

const SessionSchema = z.object({
  dateTime: z.date(),
  duration: z.number().min(0.1, "Invalid duration"),
  count: z.number(),
  id: z.string().optional(),
});

export type Session = z.infer<typeof SessionSchema>;

export const validationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  sessions: z.array(SessionSchema),
  limit: z
    .string()
    .refine((val) => !Number.isNaN(parseInt(val, 10)), {
      message: "Please enter a number",
    })
    .refine((val) => Number(parseInt(val, 10)) >= 0, {
      message: "Please enter a positive integer",
    }),
  location: z.string().min(1, "Location is required"),
  nickname: z.string().optional(),
  gCalEvent: z.boolean().default(true),
  hash: z.string().optional(),
  email: z.string().optional(),
});

export type ClientEventInput = z.infer<typeof validationSchema>;

const ProposeForm = ({ event }: { event?: ClientEventInput }) => {
  const { fetchedUser: user } = useUser();
  const { push } = useRouter();
  const isEditing = !!event;
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors, defaultValues },
    control,
  } = useForm<ClientEventInput>({
    resolver: zodResolver(validationSchema),
    defaultValues: useMemo(() => {
      const DEFAULT_EVENT: Partial<ClientEventInput> = event || {
        sessions: [
          {
            dateTime: new Date(),
            duration: 1,
            count: 0,
          },
        ],
        nickname: user.nickname,
        gCalEvent: true,
        email: user.email ?? "",
      };
      return DEFAULT_EVENT;
    }, [event, user]),
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => reset(event), [event]);

  const { create } = useCreateEvent();
  const { update } = useUpdateEvent();

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
      if (isEditing) {
        const updated = await update({
          event: convoToCreateData,
        });
        if (!updated) throw "undefined response returned from `updated`";
        if (!updated[0]) throw "empty array returned from `updated`";
        push(`/rsvp/${updated[0]?.hash}`);
      } else {
        const created = await create({
          event: convoToCreateData,
          userId: user.id,
        });
        if (!created) throw "undefined response returned";
        if (!created[0]) throw "empty array returned";
        push(`/rsvp/${created[0]?.hash}`);
      }
      // display success modal
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
    setLoading(false);
  };
  const onSubmit: SubmitHandler<ClientEventInput> = async (data) => {
    setConvoToCreateData(() => data); // ensures immediate update to state
    setOpenModalFlag(true);
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
        isEditing={isEditing}
      />
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className={`align-center flex flex-col gap-6`}
      >
        {/* Title */}
        <TextField
          name="title"
          fieldName="Title"
          register={register}
          errors={errors}
          required={false}
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

        {/* Sessions Input */}
        <Controller
          name="sessions"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <SessionsInput
              handleChange={field.onChange}
              preFillSessions={
                defaultValues?.sessions as ClientEventInput["sessions"]
              }
            />
          )}
        />

        {/* Limit */}
        <TextField
          name="limit"
          fieldName="Limit"
          register={register}
          errors={errors}
          required={false}
          infoText="Enter 0 for no limit"
        />

        {/* Location */}
        <TextField
          name="location"
          fieldName="Location"
          infoText="enter a valid url or address for IRL events"
          register={register}
          errors={errors}
          required={false}
        />

        {/**
         * google calendar event creation checkbox
         * if isEditing -> display an info message saying that the google calendar event will be updated
         * @todo @angelagilhotra display an option to delete the google calendar event
         */}
        {isEditing && (
          <>
            {event.gCalEvent && (
              <div>
                Google calendar event associated with this event will be
                updated.
              </div>
            )}
            {/*
             * @note
             * No option to create a google calendar event if one doesn't exist already
             * because there might be a mismatch in RSVPs - anyone RSVP'd before won't be
             * added by default (cuz we don't have their email)
             */}
          </>
        )}

        {user && user.email && (
          <div>
            <FieldLabel>
              Email
              <div className="font-primary text-sm font-light lowercase">
                You will receive the google calendar event invite on the
                following email
              </div>
            </FieldLabel>
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
            <Signature user={user as User} />
          </div>
        </div>

        {!user.isSignedIn ? (
          <LoginButton />
        ) : (
          <Button type="submit">Submit</Button>
        )}
      </form>
    </>
  );
};

export default ProposeForm;
