import FieldLabel from "./StrongText";

const TextField = ({
  name,
  fieldName,
  handleChange,
  infoText,
  danger,
  dangerReason,
  placeholder,
  className,
}: {
  name: string;
  fieldName?: string;
  handleChange: any;
  infoText?: string;
  danger?: boolean;
  dangerReason?: string;
  placeholder?: string;
  className?: string;
}) => {
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
          name={name}
          className={`
          rounded-lg
          ${` ` + className + ` `}
          ${
            danger
              ? `
            border-red-300 ring-red-300
            focus:border-red-500 focus:ring-red-500`
              : `
            border-gray-300 ring-gray-300
            focus:border-primary focus:ring-primary`
          }
          `}
          onChange={handleChange}
          required
          placeholder={placeholder}
        />
        <div className="font-primary text-sm lowercase text-red-400">
          {dangerReason}
        </div>
      </div>
    </div>
  );
};

export default TextField;
