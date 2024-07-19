import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { datetime, RRule, RRuleSet, rrulestr } from "rrule";
import { Checkbox } from "./ui/checkbox";
import { DatePicker } from "./ui/date-picker";
import FieldLabel from "./StrongText";

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
    `Repeats every day at 5pm`
  );

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="border border-primary bg-accent">
            {formattedRrule}
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
              <div className="flex flex-col gap-2">
                <p className="font-medium">Ends</p>
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
                    <DatePicker />
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
