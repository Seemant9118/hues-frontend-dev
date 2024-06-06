import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import MinMaxForm from './MinMaxForm';

const TimeInputPopup = ({ input, setDroppedInputs, idx }) => {
  const [format, setFormat] = useState(input?.format || 'Duration');
  const [stepSize] = useState(0);

  const stepSizeSetter = () => {};

  return (
    <div className="flex items-center gap-2 pb-2 pt-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-7 gap-2 rounded-none border-b-[1px] border-primary/20 bg-primary/10 px-4 text-primary hover:bg-primary/20">
            Set Input Type
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ml-36 flex max-w-fit flex-col gap-2">
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
              <RadioGroupItem value={'Duration'} id={'Duration'} />
              <Label htmlFor={'Duration'}>Duration</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={'Time'} id={'Time'} />
              <Label htmlFor={'Duration'}>Time</Label>
            </div>
          </RadioGroup>

          {format === 'Duration' && (
            <div className="flex flex-col gap-2 border-b-[1px] border-t-[1px] border-primary/20 py-2">
              <label
                htmlFor="minValue"
                className="text-xs font-normal leading-normal text-primary"
              >
                Step Size
              </label>
              <input
                onBlur={(e) => stepSizeSetter(e)}
                className="flex h-7 w-20 items-center rounded border-[1px] border-primary/20 bg-white px-2 text-xs leading-6 focus-within:outline-none"
                type="number"
                id="minValue"
                value={stepSize || 0}
                onChange={(e) => stepSizeSetter(e)}
              />
            </div>
          )}

          <MinMaxForm
            setDroppedInputs={setDroppedInputs}
            idx={idx}
            input={input}
          />
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-7 gap-2 rounded-none border-b-[1px] border-primary/20 bg-primary/10 px-4 text-primary hover:bg-primary/20">
            Time Format
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ml-36 flex max-w-fit flex-col gap-2">
          {format === 'Duration' ? (
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
                <RadioGroupItem value={'HH:MM:SS'} id={'HH:MM:SS'} />
                <Label htmlFor={'HH:MM:SS'}>HH:MM:SS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={'HH:MM'} id={'HH:MM'} />
                <Label htmlFor={'HH:MM'}>HH:MM</Label>
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
                <RadioGroupItem value={'12 hour clock'} id={'12 hour clock'} />
                <Label htmlFor={'12 hour clock'}>12 hour clock</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={'24 hour clock'} id={'24 hour clock'} />
                <Label htmlFor={'24 hour clock'}>24</Label>
              </div>
            </RadioGroup>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TimeInputPopup;
