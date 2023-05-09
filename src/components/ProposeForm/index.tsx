import type { SubmitHandler } from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import TextField from "./FormFields/TextField";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../Button";
import { RichTextArea } from "./FormFields/RichText";
import SessionsInput from "./FormFields/SessionsInput";
import useCreateEvent from "src/hooks/useCreateEvent";
import useWallet from "src/hooks/useWallet";
import LoginButton from "../LoginButton";
import { useSignMessage } from "wagmi";
import ConfirmationModal from "../ConfirmationModal";
import { useState } from "react";
import useUser from "src/hooks/useUser";
import Signature from "../EventPage/Signature";
import FieldLabel from "../StrongText";
import isNicknameSet from "src/utils/isNicknameSet";

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
  });
  const { create } = useCreateEvent();
  const { isSignedIn, wallet } = useWallet();
  const { user } = useUser({ address: wallet });
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
      const created = await create({ event: data, signature, address: wallet });
      setModal({
        isError: false,
        message: "Success!",
      });
      console.log({ created });
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

        {/* nickname */}
        {user && isNicknameSet(user.nickname) && (
          <div>
            <FieldLabel>Proposing as</FieldLabel>
            <Signature sign={user.nickname} />
          </div>
        )}
        {!user ||
          (!isNicknameSet(user?.nickname) && (
            <TextField
              name="nickname"
              fieldName="How would you like to be known as?"
              register={register}
              errors={errors}
              required={false}
              infoText="This name is for display (and sharing) purposes only"
            />
          ))}

        {/* @todo @angelagilhotra */}
        {/* Access */}
        {!isSignedIn ? (
          <LoginButton />
        ) : (
          <Button buttonText="Submit" type="submit" />
        )}
      </form>
    </>
  );
};

export default ProposeForm;
