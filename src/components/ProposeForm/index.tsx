import type { SubmitHandler } from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import TextField from "./FormFields/TextField";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../Button";
import { RichTextArea } from "./FormFields/RichText";
import SessionsInput from "./FormFields/SessionsInput";
import useCreateEvent from "src/hooks/useCreateEvent";
import LoginButton from "../LoginButton";
import { useSignMessage } from "wagmi";
import ConfirmationModal from "../ConfirmationModal";
import { useState } from "react";
import { useUser } from "src/context/UserContext";
import Signature from "../EventPage/Signature";
import FieldLabel from "../StrongText";
import isNicknameSet from "src/utils/isNicknameSet";
import Checkbox from "./FormFields/Checkbox";
import type { User } from "@prisma/client";

const SessionSchema = z.object({
  dateTime: z.date(),
  duration: z.number().min(0.1, "Invalid duration"),
  count: z.number(),
});

export type Session = z.infer<typeof SessionSchema>;

const validationSchema = z.object({
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
  location: z.string(),
  nickname: z.string(),
  gCalEvent: z.boolean(),
});

export type ClientEventInput = z.infer<typeof validationSchema>;

type ModalMessage = "error" | "success" | "info";

const getColor = (type: ModalMessage) => {
  switch (type) {
    case "error":
      return "text-red-600";
    case "info":
      return "text-blue-600";
    case "success":
      return "text-green-600";
  }
};

const ModalContent = ({
  message,
  type,
}: {
  message?: string;
  type: ModalMessage;
}) => {
  return <div className={getColor(type)}>{message && <p>{message}</p>}</div>;
};

const ProposeForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ClientEventInput>({
    resolver: zodResolver(validationSchema),
    defaultValues: { gCalEvent: true },
  });
  const { create } = useCreateEvent();
  const { fetchedUser: user } = useUser();
  const { signMessageAsync } = useSignMessage();

  const [openModalFlag, setOpenModalFlag] = useState(false);
  const [modal, setModal] = useState<{
    isError: boolean;
    message: string;
  }>({
    isError: false,
    message: "",
  });

  const openModal = () => setOpenModalFlag(true);
  const closeModal = () => setOpenModalFlag(false);

  // @todo
  const onSubmit: SubmitHandler<ClientEventInput> = async (data) => {
    const signature = await signMessageAsync({ message: JSON.stringify(data) });
    try {
      // display success modal
      await create({ event: data, signature, address: user.address });
      setModal({
        isError: false,
        message: "Success!",
      });
      openModal();
    } catch {
      // display error modal
      setModal({
        isError: true,
        message: "There was an error!",
      });
      openModal();
    }
  };

  return (
    <>
      <ConfirmationModal
        isOpen={openModalFlag}
        onClose={closeModal}
        content={
          <ModalContent
            message={modal.message}
            type={modal.isError ? "error" : "success"}
          />
        }
        title="Propose Event"
      />

      <form
        onSubmit={handleSubmit(onSubmit)}
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
            />
          )}
        />

        {/* Sessions Input */}
        <Controller
          name="sessions"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <SessionsInput handleChange={field.onChange} />
          )}
        />

        {/* Limit */}
        <TextField
          name="limit"
          fieldName="Limit"
          register={register}
          errors={errors}
          required={false}
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

        {/* google calendar event creation checkbox */}
        <Checkbox
          name="gCalEvent"
          fieldName="Create a Google Calendar Event?"
          register={register}
          infoText="If checked, a google calendar event will be created and an option to receive an invite will be given to anyone who wants to RSVP"
        />

        {/* nickname */}
        {user && isNicknameSet(user.nickname) && (
          <div>
            <FieldLabel>Proposing as</FieldLabel>
            <Signature user={user as User} />
          </div>
        )}
        {(!user || !isNicknameSet(user?.nickname) || !user.isSignedIn) && (
          <TextField
            name="nickname"
            fieldName="How would you like to be known as?"
            register={register}
            errors={errors}
            required={false}
            infoText="This name is for display (and sharing) purposes only"
          />
        )}

        {!user.isSignedIn ? (
          <LoginButton />
        ) : (
          <Button buttonText="Submit" type="submit" />
        )}
      </form>
    </>
  );
};

export default ProposeForm;
