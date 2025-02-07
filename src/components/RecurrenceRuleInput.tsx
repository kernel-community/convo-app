import { useEffect, useState, useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { datetime, RRule } from "rrule";
import FieldLabel from "./StrongText";
import { Checkbox } from "./ui/checkbox";
import { PopoverClose } from "@radix-ui/react-popover";
import { DatePicker } from "./ui/date-picker";
type RecurrenceType = "never" | "on" | "after";
type RecurrencePeriod = "daily" | "weekly" | "monthly" | "yearly";
type RecurrenceRuleInputProps = {
  handleChange: (value: string | undefined) => void;
  value?: string;
};
export const RecurrenceRuleInput = ({
  handleChange,
  value,
}: RecurrenceRuleInputProps) => {
  // Helper function to convert RRule frequency to period
  const getPeriodFromFreq = (freq?: number): RecurrencePeriod | undefined => {
    if (!freq) return undefined;
    switch (freq) {
      case RRule.DAILY:
        return "daily";
      case RRule.WEEKLY:
        return "weekly";
      case RRule.MONTHLY:
        return "monthly";
      case RRule.YEARLY:
        return "yearly";
      default:
        return undefined;
    }
  };

  // Initialize RRule parsing only if value exists
  const initialRRule = value ? RRule.fromString(value) : undefined;

  const [rrule, setRrule] = useState<string | undefined>(value);
  const [formattedRrule, setFormattedRrule] = useState<string | undefined>(
    initialRRule?.toText()
  );
  const [endsOnDate, setEndsOnDate] = useState<Date | undefined>(
    initialRRule?.options.until || undefined
  );

  // Set initial recurrence values based on the parsed RRule
  const [recurrenceConfig, setRecurrenceConfig] = useState<
    RecurrenceType | undefined
  >(
    initialRRule
      ? initialRRule.options.until
        ? "on"
        : initialRRule.options.count
        ? "after"
        : "never"
      : undefined
  );
  const [occurrences, setOccurrences] = useState<number | null>(
    initialRRule?.options.count || null
  );
  const [period, setPeriod] = useState<RecurrencePeriod | undefined>(
    initialRRule ? getPeriodFromFreq(initialRRule.options.freq) : undefined
  );
  const [noRepeat, setNoRepeat] = useState<boolean>(false);
  const resetState = useCallback((newValue?: string) => {
    if (newValue) {
      try {
        const parsed = RRule.fromString(newValue);
        setRrule(newValue);
        setEndsOnDate(parsed.options.until || undefined);
        setFormattedRrule(parsed.toText());
        setPeriod(getPeriodFromFreq(parsed.options.freq));
        setOccurrences(parsed.options.count || null);
        setRecurrenceConfig(
          parsed.options.until ? "on" : parsed.options.count ? "after" : "never"
        );
        setNoRepeat(false);
      } catch (error) {
        console.error("Error parsing RRule:", error);
        resetState(); // Reset to default state if parsing fails
      }
    } else {
      setRrule(undefined);
      setEndsOnDate(undefined);
      setFormattedRrule(undefined);
      setPeriod(undefined);
      setOccurrences(null);
      setRecurrenceConfig(undefined);
      setNoRepeat(true);
    }
  }, []);

  // // Update value effect now uses resetState
  // useEffect(() => {
  //   resetState(value);
  // }, [value, resetState]);

  // update the parent state
  useEffect(() => {
    handleChange(rrule);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rrule]);

  // Effect 1: Handle noRepeat toggle
  useEffect(() => {
    if (noRepeat) {
      // Clear all values when switching to no-repeat
      setRrule(undefined);
      setEndsOnDate(undefined);
      setFormattedRrule(undefined);
      setPeriod(undefined);
      setOccurrences(0);
      setRecurrenceConfig(undefined);
    } else if (!period) {
      // Set defaults when switching to repeat
      setPeriod(undefined);
      setRecurrenceConfig(undefined);
    }
  }, [noRepeat, period]);

  // Effect 2: Ensure period and recurrenceConfig stay in sync
  useEffect(() => {
    if (!noRepeat) {
      if (period && !recurrenceConfig) {
        setRecurrenceConfig(undefined);
      }
      if (!period && recurrenceConfig) {
        setPeriod(undefined);
      }
    }
  }, [period, recurrenceConfig, noRepeat]);

  // update the formatted rrule state
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
            endsOnDate.getDate(),
            0,
            0,
            0
          )
        : undefined,
      count: occurrences,
    });
    setFormattedRrule(rrule.toText());
    setRrule(rrule.toString());
  }, [recurrenceConfig, occurrences, period, endsOnDate, noRepeat]);

  // update the occurrences and ends on date state
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
        <PopoverContent
          className={`w-[325px] transition-all duration-200 ease-in-out ${
            noRepeat ? "h-[170px]" : "h-[400px]"
          }`}
        >
          <div
            className={`grid gap-4 transition-opacity duration-200 ${
              noRepeat ? "opacity-100" : "opacity-100"
            }`}
          >
            <div>
              <FieldLabel>Create your Schedule</FieldLabel>
            </div>
            {!noRepeat && (
              <div className="flex flex-col gap-6">
                <RadioGroup
                  value={period || "daily"}
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
                        value={occurrences || ""}
                        onChange={(evt) => {
                          const val = parseInt(evt.target.value);
                          setOccurrences(isNaN(val) ? 0 : val);
                        }}
                        disabled={!(recurrenceConfig === "after")}
                      />
                      <div>occurrences</div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}
            <hr />
            <div
              className="flex cursor-pointer items-center space-x-2"
              onClick={() => setNoRepeat((c) => !c)}
            >
              <Checkbox id="norepeat" checked={noRepeat} />
              <FieldLabel>Doesn&apos;t repeat</FieldLabel>
            </div>
            <div className="flex w-full flex-row gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => resetState(value)}
                className="w-full"
              >
                Reset
              </Button>
              <PopoverClose asChild>
                <Button variant="default" size="sm" className="w-full">
                  Confirm
                </Button>
              </PopoverClose>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
