import type { FieldErrorsImpl, UseFormRegister } from "react-hook-form";
import FieldLabel from "../../StrongText";
import type { RsvpInput } from "../EventWrapper";
import type { ChangeEvent } from "react";

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
  onChange,
  label,
  hideLabel = false,
  disabled = false,
}: {
  name: keyof RsvpInput;
  fieldName?: string;
  register: UseFormRegister<RsvpInput>;
  infoText?: string;
  errors?: Partial<FieldErrorsImpl<RsvpInput>>;
  placeholder?: string;
  className?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  hideLabel?: boolean;
  disabled?: boolean;
}) => {
  const isError = errors && errors[name];
  return (
    <div>
      {!hideLabel && (
        <FieldLabel styles="my-auto">
          {label || fieldName}
          <div className="font-primary text-sm font-light lowercase">
            {infoText}
          </div>
        </FieldLabel>
      )}
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
            ${disabled ? `bg-gray-200` : ``}
          `}
          placeholder={placeholder}
          {...register(name, { required, onChange })}
          value={value}
          disabled={disabled || !!value}
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
