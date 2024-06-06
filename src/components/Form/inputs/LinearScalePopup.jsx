import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import MinMaxForm from './MinMaxForm';

const LinearScalePopup = ({ input, setDroppedInputs, idx }) => {
  // const [format, setFormat] = useState(input?.format || 'Duration');
  // const [stepSize, setstepSize] = useState(0);

  // const stepSizeSetter = () => {};

  return (
    <div className="flex items-center gap-2 pb-2 pt-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button size={'md'} variant={'lightBlue'} className="gap-4">
            Set Range
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

      <Popover>
        <PopoverTrigger asChild>
          <Button size={'md'} variant={'lightBlue'} className="gap-4">
            Set Label
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

export default LinearScalePopup;
