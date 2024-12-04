import type { FieldErrorsImpl, UseFormRegister } from "react-hook-form";
import FieldLabel from "src/components/StrongText";
import type { BotInput } from "src/types";

const TextField = ({
  name,
  fieldName,
  register,
  infoText,
  errors,
  placeholder,
  className,
  required,
  value,
}: {
  name: keyof BotInput;
  fieldName?: string;
  register: UseFormRegister<BotInput>;
  infoText?: string;
  errors?: Partial<FieldErrorsImpl<BotInput>>;
  placeholder?: string;
  className?: string;
  required?: boolean;
  value?: string;
}) => {
  const isError = errors && errors[name];
  return (
    <div>
      <FieldLabel styles="my-auto">
        {fieldName}
        <div className="font-primary text-sm font-light lowercase">
          {infoText}
        </div>
      </FieldLabel>
      <div className="flex flex-col">
        <input
          type="text"
          className={`
          rounded-lg
          bg-background
          ${` ` + className + ` `}
          ${
            isError
              ? `
            border-red-300 ring-red-300
            focus:border-red-500 focus:ring-red-500`
              : `
            border-gray-300 ring-gray-300
            focus:border-primary focus:ring-primary dark:border-primary-dark`
          }
          `}
          placeholder={placeholder}
          {...register(name, { required })}
          value={value}
          disabled={!!value}
        />
        <div className="font-primary text-sm lowercase text-red-400">
          {/*
            if errors is defined and error for this field is set, then
            display message, otherwise null
           */}
          {isError ? errors[name]?.message : null}
        </div>
      </div>
    </div>
  );
};

export default TextField;
