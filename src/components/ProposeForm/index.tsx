import type { SubmitHandler } from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import TextField from "./FormFields/TextField";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../Button";
import { RichTextArea } from "./FormFields/RichText";
import SessionsInput from "./FormFields/SessionsInput";

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
});

export type ValidationSchema = z.infer<typeof validationSchema>;
export type FormKeys = keyof ValidationSchema;

const ProposeForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });

  // @todo remove
  console.log(errors);

  // @todo
  const onSubmit: SubmitHandler<ValidationSchema> = (data) =>
    console.log("data:", data);

  return (
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
        render={({ field }) => <SessionsInput handleChange={field.onChange} />}
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

      {/* @todo @angelagilhotra */}
      {/* Access */}

      <Button buttonText="Submit" type="submit" />
    </form>
  );
};

export default ProposeForm;
