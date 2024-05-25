import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const dateFormats = ["DD:MM:YY", "MM:YY:DD", "YY:MM:DD", "YY:MM", "YY", "MM"];

const DateInputPopup = ({ input, setDroppedInputs, idx }) => {
  const [format, setFormat] = useState(input?.format || "DD:MM:YY");

  return (
    <div className="flex gap-2 items-center pt-3 pb-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button size={"xs"} className={"p-1 rounded"} variant={"blue_outline"}>
            Set Input Type
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-fit ml-40">
          <RadioGroup
            onValueChange={(value) => {
              setFormat(value);
              setDroppedInputs((prev) => {
                const updated = [...prev];
                updated[idx].format = value;
                return updated;
              });
            }}
            defaultValue={format}
          >
            {dateFormats.map((format) => (
              <div className="flex items-center space-x-2" key={format}>
                <RadioGroupItem
                  className="text-primary border-primary"
                  value={format}
                  id={format}
                />
                <Label htmlFor={format}>{format}</Label>
              </div>
            ))}
          </RadioGroup>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateInputPopup;
