import { ChevronDown, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const SelectInputPopup = ({ input, setDroppedInputs, idx }) => {
  const [questionConfigs, setQuestionConfigs] = useState({
    options: input.options ? input.options : [],
    columnCount: input.columnCount || 3,
    align: input.align || 'vertical',
  });

  const [showOptions, setShowOptions] = useState(false);
  const [showOptionInput, setShowOptionInput] = useState(true);
  const optionInputRef = useRef(null);

  const optionHandler = (e) => {
    e?.preventDefault();
    if (!optionInputRef.current) return;
    if (optionInputRef.current?.value === '') return;
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
    optionInputRef.current.value = '';
  };

  return (
    <>
      <div className="flex items-center gap-2 pb-2 pt-3">
        <Button
          className="h-7 rounded-none border-b-[1px] border-primary/20 bg-primary/90 px-4 text-white hover:bg-primary"
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
            <Button className="h-7 gap-4 rounded-none border-b-[1px] border-primary/20 bg-primary/10 px-4 text-primary hover:bg-primary/20">
              <p>Align Options Vertically</p>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="ml-20 max-w-fit px-4 py-2">
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
              defaultValue={input.align || 'vertical'}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="h-3 w-3 border-primary text-primary"
                  value="vertical"
                  id="vertical"
                />
                <Label
                  className="text-xs font-normal leading-normal text-zinc-800"
                  htmlFor="vertical"
                >
                  Align Options Vertically
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="h-3 w-3 border-primary text-primary"
                  value="horizontal"
                  id="horizontal"
                />
                <Label
                  className="text-xs font-normal leading-normal text-zinc-800"
                  htmlFor="horizontal"
                >
                  Align Options Horizontally
                </Label>
              </div>
              <div className="justify-center-center flex flex-col space-y-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    className="h-3 w-3 border-primary text-primary"
                    value="grid"
                    id="grid"
                  />
                  <Label
                    className="text-xs font-normal leading-normal text-zinc-800"
                    htmlFor="grid"
                  >
                    Align as grid with
                  </Label>
                </div>
              </div>
            </RadioGroup>
            <div className="flex items-center space-x-2">
              <input
                className="h-7 w-14 rounded border-[1px] border-primary/30 pl-2 focus-within:outline-none disabled:text-slate-400"
                type="number"
                name="columnCount"
                id="columnCount"
                disabled={questionConfigs.align !== 'grid'}
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
                className="text-xs font-normal leading-normal text-zinc-800"
                htmlFor="columnCount"
              >
                Columns
              </Label>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      {showOptions && (
        <div className="flex flex-wrap items-center gap-2 py-2">
          <Label className="peer flex h-7 cursor-pointer items-center gap-1 rounded border-[1px] border-primary/30 bg-primary/10 pl-3 pr-4 text-primary">
            <Checkbox
              id="others"
              className="h-4 w-4 rounded-full border-[#D9D9D9] bg-[#D9D9D9] data-[state=checked]:border-primary data-[state=checked]:bg-primary"
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
            <div className="border-BlueOutline bg-BlueLight flex h-7 items-center justify-center gap-1 rounded border-[1px] pl-3 pr-4">
              <X
                className="cursor-pointer text-primary"
                size={'16'}
                onClick={() => setShowOptionInput(false)}
              />
              <Separator className="h-3 bg-zinc-800" orientation="vertical" />
              <form onSubmit={optionHandler}>
                <input
                  placeholder="Enter option value"
                  type="text"
                  className="min-w-[100px] border-none bg-transparent text-xs font-normal leading-normal outline-none placeholder:text-slate-400"
                  ref={optionInputRef}
                />
              </form>
            </div>
          )}
          {questionConfigs?.options.map((option, index) => (
            <div
              key={option}
              className="flex h-7 items-center justify-center gap-1 rounded border-[1px] border-primary/20 bg-primary/10 pl-3 pr-4"
            >
              <X
                className="cursor-pointer text-primary"
                size={'16'}
                onClick={() => {
                  const options = input.options.filter((_, i) => i !== index);

                  setQuestionConfigs((prev) => ({
                    ...prev,
                    options,
                  }));

                  setDroppedInputs((prev) => {
                    const updated = [...prev];
                    updated[idx].options = options;
                    return updated;
                  });
                }}
              />
              <Separator className="h-3 bg-zinc-800" orientation="vertical" />
              <p className="min-w-fit bg-transparent text-xs font-normal leading-normal text-zinc-800">
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
