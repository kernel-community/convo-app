import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { datetime, RRule, RRuleSet, rrulestr } from "rrule";
import { Checkbox } from "./ui/checkbox";
import { DatePickerWithPresets } from "./ui/date-picker-presets";

export const RecurrenceRuleInput = () => {
  const mockRrule = new RRule({
    freq: RRule.WEEKLY,
    interval: 5,
    byweekday: [RRule.MO, RRule.FR],
    dtstart: datetime(2012, 2, 1, 10, 30),
    until: datetime(2012, 12, 31),
  });
  const [rrule, setRrule] = useState<string>(mockRrule.toText());
  const [isRepeating, setIsRepeating] = useState<boolean>(false);

  const [formattedRrule, setFormattedRrule] = useState<string>(
    `Make this Convo recurring?`
  );

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">{formattedRrule}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-min">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Create your Schedule</h4>
              {/* <p className="text-sm text-muted-foreground">
              Set a recurring schedule for this Convo
            </p> */}
            </div>
            <div className="flex flex-col gap-6">
              <RadioGroup defaultValue="daily" className="flex flex-row gap-3">
                <div className="flex flex-col items-center space-x-2">
                  <RadioGroupItem value="daily" id="t1" />
                  <Label htmlFor="t1">Daily</Label>
                </div>
                <div className="flex flex-col items-center space-x-2">
                  <RadioGroupItem value="weekly" id="t2" />
                  <Label htmlFor="t2">Weekly</Label>
                </div>
                <div className="flex flex-col items-center space-x-2">
                  <RadioGroupItem value="monthly" id="t3" />
                  <Label htmlFor="t3">Monthly</Label>
                </div>
                <div className="flex flex-col items-center space-x-2">
                  <RadioGroupItem value="yearly" id="t4" />
                  <Label htmlFor="t4">Yearly</Label>
                </div>
              </RadioGroup>
              <div>
                <p>Ends</p>
                <RadioGroup
                  defaultValue="daily"
                  className="flex flex-col gap-3"
                >
                  <div className="flex flex-row items-center space-x-2">
                    <RadioGroupItem value="never" id="r1" />
                    <Label htmlFor="r1">Never</Label>
                  </div>
                  <div className="flex flex-row items-center space-x-2">
                    <RadioGroupItem value="on" id="r2" />
                    <Label htmlFor="r2">On</Label>
                    <DatePickerWithPresets />
                  </div>
                  <div className="flex flex-row items-center space-x-2">
                    <RadioGroupItem
                      value="monthly"
                      id="r3"
                      className="w-max flex-grow"
                    />
                    <Label htmlFor="r3">After</Label>
                    <Input type="number" />
                    <div>occurrences</div>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
