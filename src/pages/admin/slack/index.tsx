import type { NextPage } from "next";
import Main from "src/layouts/Main";
import Button from "src/components/Button";
import { useState } from "react";
import type { FieldErrorsImpl, SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "src/components/SlackAdminPage/TextField";
import ConfirmationModal from "src/components/ConfirmationModal";
import { ModalContent } from "src/components/ProposeForm";

const botInputSchema = z.object({
  botToken: z.string().min(1),
  channelId: z.string().min(1),
});
export type BotInput = z.infer<typeof botInputSchema>;

const Slack: NextPage = () => {
  const onSubmit: SubmitHandler<BotInput> = async (data) => {
    try {
      const r = (
        await (
          await fetch("/api/actions/slack/addBot", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(data),
          })
        ).json()
      ).data;
      // display success modal
      setModal({
        isError: false,
        message: `Success! ${JSON.stringify(r)}`,
      });
      openModal();
      return r;
    } catch (err) {
      setModal({
        isError: true,
        message: "There was an error!",
      });
      openModal();
      throw err;
    }
  };
  const onInvalid = (errors: Partial<FieldErrorsImpl<BotInput>>) => {
    console.error("INVALID submission", errors);
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BotInput>({
    resolver: zodResolver(botInputSchema),
  });
  const [openModalFlag, setOpenModalFlag] = useState<boolean>(false);
  const [modal, setModal] = useState<{
    isError: boolean;
    message: string;
  }>({
    isError: false,
    message: "",
  });
  const openModal = () => setOpenModalFlag(true);
  const closeModal = () => setOpenModalFlag(false);
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
        title="Slack Bot Update"
      />
      <Main>
        <div className="flex flex-col items-center justify-center">
          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="flex w-96 flex-col gap-3"
          >
            <TextField
              name="botToken"
              fieldName="Bot Token"
              register={register}
              errors={errors}
              required={false}
            />
            <TextField
              name="channelId"
              fieldName="Channel ID"
              register={register}
              errors={errors}
              required={false}
            />
            <Button buttonText="Submit" type="submit" />
          </form>
        </div>
      </Main>
    </>
  );
};
export default Slack;
