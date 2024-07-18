import { DatePickerWithPresets } from "./ui/date-picker-presets";

export const DateTimeStartAndEnd = () => {
  return (
    <div className="flex gap-3">
      <DatePickerWithPresets />
      <DatePickerWithPresets />
    </div>
  );
};
