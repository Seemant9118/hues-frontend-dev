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

const SelectInputPopup = ({ input, setDroppedInputs, idx }) => {
  const [questionConfigs, setQuestionConfigs] = useState({
    options: input.options ? input.options : [],
    columnCount: input.columnCount || 3,
    align: input.align || "vertical",
  });

  const [showOptions, setShowOptions] = useState(false);
  const [showOptionInput, setShowOptionInput] = useState(true);
  const optionInputRef = useRef(null);

  const optionHandler = (e) => {
    e?.preventDefault();
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
          className="px-4 h-7 bg-primary/90 rounded-none text-white border-b-[1px] border-primary/20 hover:bg-primary"
          onClick={() => {
            setShowOptions(true);
            setShowOptionInput(true);
            optionHandler();
          }}
        >
          +Add Options
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button className="px-4 h-7 gap-4 bg-primary/10 rounded-none text-primary border-b-[1px] border-primary/20 hover:bg-primary/20">
              <p>Align Options Vertically</p>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="max-w-fit ml-20 px-4 py-2">
            <RadioGroup
              onValueChange={(value) => {
                setQuestionConfigs((prev) => ({
                  ...prev,
                  align: value,
                }));

                setDroppedInputs((prev) => {
                  const updated = [...prev];
                  updated[idx].align = value;
                  return updated;
                });
              }}
              defaultValue={input.align || "vertical"}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="w-3 h-3 text-primary border-primary"
                  value="vertical"
                  id="vertical"
                />
                <Label
                  className="text-zinc-800 text-xs leading-normal font-normal"
                  htmlFor="vertical"
                >
                  Align Options Vertically
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="w-3 h-3 text-primary border-primary"
                  value="horizontal"
                  id="horizontal"
                />
                <Label
                  className="text-zinc-800 text-xs leading-normal font-normal"
                  htmlFor="horizontal"
                >
                  Align Options Horizontally
                </Label>
              </div>
              <div className="flex justify-center-center flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    className="w-3 h-3 text-primary border-primary"
                    value="grid"
                    id="grid"
                  />
                  <Label
                    className="text-zinc-800 text-xs leading-normal font-normal"
                    htmlFor="grid"
                  >
                    Align as grid with
                  </Label>
                </div>
              </div>
            </RadioGroup>
            <div className="flex items-center space-x-2">
              <input
                className="h-7 w-14 pl-2 border-[1px] border-primary/30 rounded disabled:text-slate-400 focus-within:outline-none"
                type="number"
                name="columnCount"
                id="columnCount"
                disabled={questionConfigs.align !== "grid"}
                value={questionConfigs.columnCount}
                onChange={(e) => {
                  if (Number(e.target.value) <= 0) return;
                  setQuestionConfigs((prev) => ({
                    ...prev,
                    columnCount: Number(e.target.value),
                  }));
                }}
              />
              <Label
                className="text-zinc-800 text-xs leading-normal font-normal"
                htmlFor="columnCount"
              >
                Columns
              </Label>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {showOptions && (
        <div className="flex gap-2 items-center flex-wrap py-2">
          <Label className="peer pr-4 pl-3 flex items-center gap-1 h-7 rounded bg-primary/10 border-[1px] border-primary/30 text-primary cursor-pointer">
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
            <div className="pr-4 pl-3 flex items-center justify-center gap-1 h-7 rounded border-[1px] border-BlueOutline bg-BlueLight">
              <X
                className="text-primary cursor-pointer"
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
                className="text-primary cursor-pointer"
                size={"16"}
                onClick={() => {
                  const options = input.options.filter((_, i) => i !== index);

                  setQuestionConfigs((prev) => ({
                    ...prev,
                    options: options,
                  }));

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

export default SelectInputPopup;
