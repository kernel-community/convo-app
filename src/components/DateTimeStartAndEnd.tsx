import FieldLabel from "./StrongText";
import { Button } from "./ui/button";
import { DatePicker } from "./ui/date-picker";
import { TimePicker12H } from "./ui/time-picker-12-hour";

export const DateTimeStartAndEnd = () => {
  return (
    <div>
      <FieldLabel>
        When?
        <div className="font-primary text-sm font-light lowercase">
          {
            "Define start and end times and optionally a recurring schedule for your Convo"
          }
        </div>
      </FieldLabel>
      <div className="grid grid-cols-1 items-center gap-6 rounded-xl bg-primary-light p-4 sm:gap-10 sm:p-6">
        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <FieldLabel>Start Date and Time</FieldLabel>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <DatePicker />
            <TimePicker12H
              date={new Date()}
              setDate={() => {
                console.log(`hello`);
              }}
            />
          </div>
        </div>
        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <FieldLabel>End Date and Time</FieldLabel>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <DatePicker />
            <TimePicker12H
              date={new Date()}
              setDate={() => {
                console.log(`hello`);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
