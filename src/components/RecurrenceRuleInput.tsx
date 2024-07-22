import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { datetime, RRule } from "rrule";
import { DatePicker } from "./ui/date-picker";
import FieldLabel from "./StrongText";
import { Checkbox } from "./ui/checkbox";

export const RecurrenceRuleInput = () => {
  const [endsOnDate, setEndsOnDate] = useState<Date | undefined>();

  const [formattedRrule, setFormattedRrule] = useState<string | undefined>();

  type RecurrenceType = "never" | "on" | "after";
  type RecurrencePeriod = "daily" | "weekly" | "monthly" | "yearly";

  const [recurrenceConfig, setRecurrenceConfig] = useState<
    RecurrenceType | undefined
  >(undefined);
  const [occurrences, setOccurrences] = useState<number>(0);
  const [period, setPeriod] = useState<RecurrencePeriod | undefined>(undefined);
  const [noRepeat, setNoRepeat] = useState<boolean>(true);

  useEffect(() => {
    if (period || occurrences || endsOnDate || recurrenceConfig) {
      setNoRepeat(false);
    }
  }, [recurrenceConfig, occurrences, period, endsOnDate]);

  useEffect(() => {
    if (noRepeat) {
      setPeriod(undefined);
      setOccurrences(0);
      setRecurrenceConfig(undefined);
    }
  }, [noRepeat]);

  useEffect(() => {
    if (period && !recurrenceConfig) {
      setRecurrenceConfig("never");
    }
    if (!period && recurrenceConfig) {
      setPeriod("daily");
    }
  }, [period, recurrenceConfig, noRepeat]);

  useEffect(() => {
    if (!period) {
      setFormattedRrule(undefined);
      return;
    }
    let freq;
    switch (period) {
      case "daily": {
        freq = RRule.DAILY;
        break;
      }
      case "monthly": {
        freq = RRule.MONTHLY;
        break;
      }
      case "weekly": {
        freq = RRule.WEEKLY;
        break;
      }
      case "yearly": {
        freq = RRule.YEARLY;
        break;
      }
    }
    const rrule = new RRule({
      freq,
      interval: 1,
      until: endsOnDate
        ? datetime(
            endsOnDate.getFullYear(),
            endsOnDate.getMonth() + 1,
            endsOnDate.getDate()
          )
        : undefined,
      count: occurrences,
    });
    setFormattedRrule(rrule.toText());
  }, [recurrenceConfig, occurrences, period, endsOnDate, noRepeat]);

  useEffect(() => {
    switch (recurrenceConfig) {
      case "never": {
        setOccurrences(0);
        setEndsOnDate(undefined);
        break;
      }
      case "after": {
        setEndsOnDate(undefined);
        break;
      }
      case "on": {
        setOccurrences(0);
        break;
      }
    }
  }, [recurrenceConfig, noRepeat]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="bg-accent font-primary">
            {formattedRrule || `convert to recurring convo?`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-min">
          <div className="grid gap-4">
            <div>
              <FieldLabel>Create your Schedule</FieldLabel>
            </div>
            <div className="flex flex-col gap-6">
              <RadioGroup
                defaultValue="daily"
                className="flex flex-row justify-between gap-3 [&>*]:space-x-2 [&>*]:space-y-2"
              >
                <div className="flex flex-col items-center">
                  <RadioGroupItem
                    value="daily"
                    id="t1"
                    onClick={() => setPeriod("daily")}
                    checked={period === "daily"}
                  />
                  <Label htmlFor="t1">Daily</Label>
                </div>
                <div className="flex flex-col items-center space-x-2">
                  <RadioGroupItem
                    value="weekly"
                    id="t2"
                    onClick={() => setPeriod("weekly")}
                    checked={period === "weekly"}
                  />
                  <Label htmlFor="t2">Weekly</Label>
                </div>
                <div className="flex flex-col items-center space-x-2">
                  <RadioGroupItem
                    value="monthly"
                    id="t3"
                    onClick={() => setPeriod("monthly")}
                    checked={period === "monthly"}
                  />
                  <Label htmlFor="t3">Monthly</Label>
                </div>
                <div className="flex flex-col items-center space-x-2">
                  <RadioGroupItem
                    value="yearly"
                    id="t4"
                    onClick={() => setPeriod("yearly")}
                    checked={period === "yearly"}
                  />
                  <Label htmlFor="t4">Yearly</Label>
                </div>
              </RadioGroup>
              <div className="flex flex-col gap-2">
                <FieldLabel>Ends</FieldLabel>
                <RadioGroup className="flex flex-col gap-3">
                  <div className="flex flex-row items-center space-x-2">
                    <RadioGroupItem
                      value="never"
                      id="r1"
                      onClick={() => {
                        setRecurrenceConfig("never");
                      }}
                      checked={recurrenceConfig === "never"}
                    />
                    <Label htmlFor="r1">Never</Label>
                  </div>
                  <div className="flex flex-row items-center space-x-2">
                    <RadioGroupItem
                      value="on"
                      id="r2"
                      onClick={() => {
                        setRecurrenceConfig("on");
                      }}
                      checked={recurrenceConfig === "on"}
                    />
                    <Label htmlFor="r2">On</Label>
                    <DatePicker
                      setDate={setEndsOnDate}
                      date={endsOnDate}
                      fromDate={new Date()}
                      disabled={!(recurrenceConfig === "on")}
                    />
                  </div>
                  <div className="flex flex-row items-center space-x-2">
                    <RadioGroupItem
                      value="after"
                      id="r3"
                      className="w-max flex-grow"
                      onClick={() => {
                        setRecurrenceConfig("after");
                      }}
                      checked={recurrenceConfig === "after"}
                    />
                    <Label htmlFor="r3">After</Label>
                    <Input
                      type="number"
                      value={occurrences}
                      onChange={(evt) =>
                        setOccurrences(evt.target.value as unknown as number)
                      }
                      disabled={!(recurrenceConfig === "after")}
                    />
                    <div>occurrences</div>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <hr />
            <div
              className="flex cursor-pointer items-center space-x-2"
              onClick={() => setNoRepeat((c) => !c)}
            >
              <Checkbox id="norepeat" checked={noRepeat} />
              <FieldLabel>Doesn&apos;t repeat</FieldLabel>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
