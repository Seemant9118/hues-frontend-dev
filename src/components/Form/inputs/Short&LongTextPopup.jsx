import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import MinMaxForm from './MinMaxForm';

const ShortLongTextPopup = ({ input, setDroppedInputs, idx }) => {
  return (
    <div className="flex items-center gap-2 pb-2 pt-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-7 rounded-none border-b-[1px] border-primary/20 bg-primary/10 px-4 text-primary hover:bg-primary/20">
            Set{' '}
            {input.name === 'Short text'
              ? 'Character'
              : input.name === 'Long text'
                ? 'Word'
                : 'Number'}{' '}
            Limit
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ml-28 max-w-fit">
          <h2 className="text-xs font-semibold leading-normal text-primary">
            Edit{' '}
            {input.name === 'Short text'
              ? 'Character'
              : input.name === 'Long text'
                ? 'Word'
                : 'Number'}{' '}
            Limit
          </h2>
          <div className="flex flex-col gap-2 p-4">
            <MinMaxForm
              setFormData={setDroppedInputs}
              idx={idx}
              input={input}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ShortLongTextPopup;
