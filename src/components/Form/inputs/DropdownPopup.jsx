import { ChevronDown, X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import MinMaxForm from "./MinMaxForm";

const DropdownPopup = ({
  input,
  setDroppedInputs,
  idx,
  showOptions,
  setShowOptions,
}) => {
  const [questionConfigs, setQuestionConfigs] = useState({
    options: input.options || [],
    format: input.format || "vertical",
  });
  const [showOptionInput, setShowOptionInput] = useState(true);
  const optionInputRef = useRef(null);

  const optionHandler = (e) => {
    e.preventDefault();
    if (!optionInputRef.current) return;
    if (optionInputRef.current?.value === "") return;
    const option = optionInputRef.current.value;
    setQuestionConfigs((prev) => ({
      ...prev,
      options: [...prev.options, option],
    }));
    setDroppedInputs((prev) => {
      const updated = [...prev];
      updated[idx].options = [...questionConfigs.options, option];

      return updated;
    });
    optionInputRef.current.value = "";
  };

  return (
    <>
      <div className="flex gap-2 items-center pt-3 pb-2">
        <Button
          className="px-4 h-7 bg-primary rounded-none text-white border-b-[1px] border-primary/20 hover:bg-primary/90"
          onClick={() => {
            setShowOptions(true);
            setShowOptionInput(true);
          }}
        >
          +Add Options
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button className="px-4 h-7 gap-4 bg-primary/10 rounded-none text-primary border-b-[1px] border-primary/20 hover:bg-primary/20">
              <p>Select Format</p>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="max-w-fit ml-32 px-4 py-2">
            <RadioGroup
              onValueChange={(value) => {
                setQuestionConfigs((prev) => ({
                  ...prev,
                  format: value,
                }));

                setDroppedInputs((prev) => {
                  const updated = [...prev];
                  updated[idx].format = value;
                  return updated;
                });
              }}
              defaultValue={input.format || "single"}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="w-3 h-3 text-primary/80 border-primary"
                  value="single"
                  id="single"
                />
                <Label
                  className="text-zinc-800 text-xs leading-normal font-normal"
                  htmlFor="single"
                >
                  Single Select
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="w-3 h-3  text-primary/80 border-primary"
                  value="multi"
                  id="multi"
                />
                <Label
                  className="text-zinc-800 text-xs leading-normal font-normal"
                  htmlFor="multi"
                >
                  Multi Select
                </Label>
              </div>
            </RadioGroup>
          </PopoverContent>
        </Popover>
        <Popover>
          <PopoverTrigger asChild>
            <Button className="px-4 h-7 bg-primary/10 rounded-none text-primary border-b-[1px] border-primary/20 hover:bg-primary/20 gap-2">
              Limit On Selection
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="max-w-fit ml-28">
            <MinMaxForm
              setFormData={setDroppedInputs}
              idx={idx}
              input={input}
            />
          </PopoverContent>
        </Popover>
      </div>
      {showOptions && (
        <div className="flex gap-2 items-center flex-wrap py-2">
          <Label className="peer pr-4 pl-3 flex items-center gap-1 h-7 rounded bg-primary/10 border-[1px] border-primary/20 text-primary cursor-pointer">
            <Checkbox
              id="others"
              className="w-4 h-4 rounded-full bg-[#D9D9D9] border-[#D9D9D9] data-[state=checked]:bg-primary data-[state=checked]:border-primary "
              checked={input.others}
              onCheckedChange={(checked) => {
                setDroppedInputs((prev) => {
                  const updated = [...prev];
                  updated[idx].others = checked;
                  return updated;
                });
              }}
            />
            Others
          </Label>

          {showOptionInput && (
            <div className="pr-4 pl-3 flex items-center justify-center gap-1 h-7 rounded border-[1px] border-primary/20 ">
              <X
                className="text-primary"
                size={"16"}
                onClick={() => setShowOptionInput(false)}
              />
              <Separator className="h-3 bg-zinc-800" orientation="vertical" />
              <form onSubmit={optionHandler}>
                <input
                  placeholder="Enter option value"
                  type="text"
                  className="placeholder:text-slate-400 bg-transparent min-w-[100px] border-none outline-none text-xs font-normal leading-normal"
                  ref={optionInputRef}
                />
              </form>
            </div>
          )}
          {questionConfigs?.options.map((option, index) => (
            <div
              key={index}
              className="pr-4 pl-3 flex items-center justify-center gap-1 h-7 rounded border-[1px] border-primary/20 bg-primary/10"
            >
              <X
                className="text-primary"
                size={"16"}
                onClick={() => {
                  const options = input.options.filter((_, i) => i !== index);

                  setDroppedInputs((prev) => {
                    const updated = [...prev];
                    updated[idx].options = options;
                    return updated;
                  });
                }}
              />
              <Separator className="h-3 bg-zinc-800" orientation="vertical" />
              <p className="bg-transparent min-w-fit text-zinc-800 text-xs font-normal leading-normal">
                {option}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DropdownPopup;
