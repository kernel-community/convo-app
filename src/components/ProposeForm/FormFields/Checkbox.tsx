import type { UseFormRegister } from "react-hook-form";
import type { ClientEventInput } from "..";
import FieldLabel from "src/components/StrongText";

const Checkbox = ({
  name,
  fieldName,
  register,
  infoText,
}: {
  name: keyof ClientEventInput;
  fieldName: string;
  register: UseFormRegister<ClientEventInput>;
  infoText?: string;
}) => {
  return (
    <div className="flex flex-row items-center gap-4">
      <FieldLabel styles="max-w-sm">
        {fieldName}
        <div className="font-primary text-sm font-light lowercase">
          {infoText}
        </div>
      </FieldLabel>
      <input
        className="h-5 w-5 cursor-pointer rounded-md border-gray-300
        ring-gray-300 focus:border-primary focus:ring-primary"
        type="checkbox"
        id="gCalEvent"
        {...register(name)}
      />
    </div>
  );
};

export default Checkbox;
