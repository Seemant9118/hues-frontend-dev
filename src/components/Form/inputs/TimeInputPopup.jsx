import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import MinMaxForm from "./MinMaxForm";


const TimeInputPopup = ({ input, setDroppedInputs, idx }) => {
  const [format, setFormat] = useState(input?.format || "Duration");
  const [stepSize, setstepSize] = useState(0);

  const stepSizeSetter = (e) => {};

  return (
    <div className="flex gap-2 items-center pt-3 pb-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button size={"md"} variant={"lightBlue"} className="gap-4">
            Set Input Type
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-fit ml-36 flex flex-col gap-2">
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                className="text-Blue border-Blue"
                value={"Duration"}
                id={"Duration"}
              />
              <Label htmlFor={"Duration"}>Duration</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                className="text-Blue border-Blue"
                value={"Time"}
                id={"Time"}
              />
              <Label htmlFor={"Duration"}>Time</Label>
            </div>
          </RadioGroup>

          {format === "Duration" && (
            <div className="flex flex-col gap-2 border-t-[1px] border-b-[1px] border-BlueOutline py-2">
              <label
                htmlFor="minValue"
                className="text-xs text-Blue font-normal leading-normal"
              >
                Step Size
              </label>
              <input
                onBlur={(e) => stepSizeSetter(e)}
                className="text-xs leading-6 w-20 h-7 flex px-2 items-center bg-white border-[1px] border-BlueOutline rounded focus-within:outline-none"
                type="number"
                id="minValue"
                value={stepSize || 0}
                onChange={(e) => stepSizeSetter(e)}
              />
            </div>
          )}

          <MinMaxForm setDroppedInputs={setDroppedInputs} idx={idx} input={input} />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button size={"md"} variant={"lightBlue"} className="gap-4">
            Time Format
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-fit ml-36 flex flex-col gap-2">
          {format === "Duration" ? (
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
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="text-Blue border-Blue"
                  value={"HH:MM:SS"}
                  id={"HH:MM:SS"}
                />
                <Label htmlFor={"HH:MM:SS"}>HH:MM:SS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="text-Blue border-Blue"
                  value={"HH:MM"}
                  id={"HH:MM"}
                />
                <Label htmlFor={"HH:MM"}>HH:MM</Label>
              </div>
            </RadioGroup>
          ) : (
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
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="text-Blue border-Blue"
                  value={"12 hour clock"}
                  id={"12 hour clock"}
                />
                <Label htmlFor={"12 hour clock"}>12 hour clock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="text-Blue border-Blue"
                  value={"24 hour clock"}
                  id={"24 hour clock"}
                />
                <Label htmlFor={"24 hour clock"}>24</Label>
              </div>
            </RadioGroup>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimeInputPopup;
