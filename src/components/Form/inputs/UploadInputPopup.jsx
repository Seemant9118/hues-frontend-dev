import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import MinMaxForm from './MinMaxForm';

const uploadFormats = ['JPEG', 'PDF', 'Document', 'PNG'];

const UploadInputPopup = ({ input, setDroppedInputs, idx }) => {
  const [formats, setFormats] = useState(input.formats || ['JPEG']);

  const checkHandler = (check, value) => {
    if (formats.includes(value)) {
      const filtered = formats.filter((format) => format !== value);
      setFormats(filtered);
      setDroppedInputs((prev) => {
        const updated = [...prev];
        updated[idx].formats = filtered;
        return updated;
      });
    } else {
      setFormats((prev) => [...prev, value]);
      setDroppedInputs((prev) => {
        const updated = [...prev];
        updated[idx].formats = [...formats, value];
        return updated;
      });
    }
  };

  return (
    <div className="flex items-center gap-2 pb-2 pt-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-7 gap-2 rounded-none border-b-[1px] border-primary/20 bg-primary/10 px-4 text-primary hover:bg-primary/20">
            Set File Format
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ml-36 flex max-w-fit flex-col gap-2">
          {uploadFormats.map((format) => (
            <div className="flex items-center gap-4" key={format}>
              <Checkbox
                onCheckedChange={(check) => checkHandler(check, format)}
                checked={formats.includes(format)}
                id={format}
              />
              <Label htmlFor={format}>{format}</Label>
            </div>
          ))}
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-7 gap-2 rounded-none border-b-[1px] border-primary/20 bg-primary/10 px-4 text-primary hover:bg-primary/20">
            File Size
            <ChevronDown />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ml-36 flex max-w-fit flex-col gap-2">
          <MinMaxForm
            setDroppedInputs={setDroppedInputs}
            idx={idx}
            input={input}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default UploadInputPopup;
