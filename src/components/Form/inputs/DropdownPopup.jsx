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
import MinMaxForm from './MinMaxForm';

const DropdownPopup = ({
  input,
  setDroppedInputs,
  idx,
  showOptions,
  setShowOptions,
}) => {
  const [questionConfigs, setQuestionConfigs] = useState({
    options: input.options || [],
    format: input.format || 'vertical',
  });
  const [showOptionInput, setShowOptionInput] = useState(true);
  const optionInputRef = useRef(null);

  const optionHandler = (e) => {
    e.preventDefault();
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
          className="h-7 rounded-none border-b-[1px] border-primary/20 bg-primary px-4 text-white hover:bg-primary/90"
          onClick={() => {
            setShowOptions(true);
            setShowOptionInput(true);
          }}
        >
          +Add Options
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button className="h-7 gap-4 rounded-none border-b-[1px] border-primary/20 bg-primary/10 px-4 text-primary hover:bg-primary/20">
              <p>Select Format</p>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="ml-32 max-w-fit px-4 py-2">
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
              defaultValue={input.format || 'single'}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="h-3 w-3 border-primary text-primary/80"
                  value="single"
                  id="single"
                />
                <Label
                  className="text-xs font-normal leading-normal text-zinc-800"
                  htmlFor="single"
                >
                  Single Select
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  className="h-3 w-3 border-primary text-primary/80"
                  value="multi"
                  id="multi"
                />
                <Label
                  className="text-xs font-normal leading-normal text-zinc-800"
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
            <Button className="h-7 gap-2 rounded-none border-b-[1px] border-primary/20 bg-primary/10 px-4 text-primary hover:bg-primary/20">
              Limit On Selection
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="ml-28 max-w-fit">
            <MinMaxForm
              setFormData={setDroppedInputs}
              idx={idx}
              input={input}
            />
          </PopoverContent>
        </Popover>
      </div>
      {showOptions && (
        <div className="flex flex-wrap items-center gap-2 py-2">
          <Label className="peer flex h-7 cursor-pointer items-center gap-1 rounded border-[1px] border-primary/20 bg-primary/10 pl-3 pr-4 text-primary">
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
            <div className="flex h-7 items-center justify-center gap-1 rounded border-[1px] border-primary/20 pl-3 pr-4">
              <X
                className="text-primary"
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
                className="text-primary"
                size={'16'}
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

export default DropdownPopup;
