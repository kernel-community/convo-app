import type { FieldErrorsImpl, UseFormRegister } from "react-hook-form";
import FieldLabel from "../../StrongText";
import { ClientEventInput } from "src/types";

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
  name: keyof ClientEventInput;
  fieldName?: string;
  register: UseFormRegister<ClientEventInput>;
  infoText?: string;
  errors?: Partial<FieldErrorsImpl<ClientEventInput>>;
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
          border-0
          bg-muted
          transition-all
          focus:border-2
          focus:border-primary
          ${` ` + className + ` `}
          ${
            isError
              ? `
            bg-red-50
            focus:border-red-500 focus:ring-red-500`
              : `
            focus:border-primary focus:ring-primary`
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
