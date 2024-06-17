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

const dateFormats = ['DD:MM:YY', 'MM:YY:DD', 'YY:MM:DD', 'YY:MM', 'YY', 'MM'];

const DateInputPopup = ({ input, setDroppedInputs, idx }) => {
  const [format, setFormat] = useState(input?.format || 'DD:MM:YY');

  return (
    <div className="flex items-center gap-2 pb-2 pt-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-7 gap-2 rounded-none border-b-[1px] border-primary/20 bg-primary/10 px-4 text-primary hover:bg-primary/20">
            Set Input Type
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ml-40 max-w-fit">
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
            {dateFormats.map((dateFormat) => (
              <div className="flex items-center space-x-2" key={dateFormat}>
                <RadioGroupItem
                  className="border-primary text-primary"
                  value={dateFormat}
                  id={dateFormat}
                />
                <Label htmlFor={dateFormat}>{dateFormat}</Label>
              </div>
            ))}
          </RadioGroup>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateInputPopup;
