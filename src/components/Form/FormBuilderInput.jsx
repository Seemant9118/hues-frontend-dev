import { useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { inputFields } from '@/globals/formbulder/constants';
import { cn, copyHandler } from '@/lib/utils';
import { Label } from '../ui/label';
import DateInputPopup from './inputs/DateInputPopup';
import DropdownPopup from './inputs/DropdownPopup';
import SelectInputPopup from './inputs/SelectInputPopup';
import ShortLongTextPopup from './inputs/Short&LongTextPopup';
import TimeInputPopup from './inputs/TimeInputPopup';
import UploadInputPopup from './inputs/UploadInputPopup';
import InputWrapper from './wrappers/InputWrappers';

const FormBuilderInput = ({
  input,
  idx,
  setDroppedInputs,
  deleteHandler,
  droppedInputs,
  showOptions,
  setShowOptions,
  inputHandler,
  upAndDownHandler,
  selectHandler,
  isFocussed,
}) => {
  // const [showOptions, setShowOptions] = useState(true);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const { icon: Icon } = input;

  const questionHandler = (e) => {
    e.preventDefault();
    if (inputRef.current?.value) {
      inputHandler(idx, inputRef.current?.value);
    }
  };

  useEffect(() => {
    if (isFocussed) {
      containerRef.current.scrollIntoView({
        behavior: 'smooth',
      });
    }
  }, [isFocussed]);

  return (
    <InputWrapper
      ref={containerRef}
      className={isFocussed ? 'bg-primary/10' : ''}
    >
      <div
        className={cn(
          'flex h-8 items-center justify-between self-stretch overflow-hidden',
        )}
      >
        <div className="flex grow items-center gap-2 py-1">
          <span className="text-xs leading-6 text-zinc-800">{idx + 1}.</span>
          <Select
            value={`${input.name}?${input.type}`}
            onValueChange={(value) => selectHandler(value, idx)}
          >
            <SelectTrigger className="flex h-7 max-w-fit items-center gap-2 rounded bg-[#F6F3FF] px-2 text-[10px] text-primary focus:ring-0">
              {Icon && <Icon size={16} />}
              <SelectValue defaultValue={input.name} />
            </SelectTrigger>
            <SelectContent>
              {inputFields.map((item) => (
                <SelectItem key={item.id} value={`${item.name}?${item.type}`}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <form onSubmit={questionHandler} className="grow px-2">
            <input
              onBlur={questionHandler}
              name="text"
              className="w-full text-sm leading-6 text-zinc-800 placeholder:text-slate-400 focus-within:outline-none"
              placeholder="Enter Question"
              maxLength={input.maxLength}
              minLength={input.minLength}
              ref={inputRef}
              defaultValue={input.question}
            />
          </form>
        </div>
        <div className="flex items-center gap-2">
          {input.name !== 'Notes' && (
            <div className="flex gap-2">
              <Label
                htmlFor={`required${idx}`}
                className="text-xs font-normal leading-6 text-zinc-800"
              >
                Required
              </Label>
              <Switch
                id={`required${idx}`}
                defaultChecked={input.required}
                onCheckedChange={(checked) => {
                  setDroppedInputs((prev) => {
                    const updated = [...prev];
                    updated[idx].required = checked;
                    return updated;
                  });
                }}
              />
            </div>
          )}
          <Button
            onClick={() => copyHandler(input.question)}
            variant={'ghost'}
            size={'icon'}
          >
            <Copy className="text-primary" size={'16px'} />
          </Button>
          <Button
            onClick={() => deleteHandler(idx)}
            variant={'ghost'}
            size={'icon'}
          >
            <Trash2 className="text-primary" size={'16px'} />
          </Button>
          {idx !== droppedInputs.length - 1 && (
            <Button
              variant={'ghost'}
              size={'icon'}
              onClick={() => upAndDownHandler(idx, idx + 1)}
            >
              <ChevronDown className="text-primary" size={'18px'} />
            </Button>
          )}
          {idx !== 0 && (
            <Button
              onClick={() => upAndDownHandler(idx, idx - 1)}
              variant={'ghost'}
              size={'icon'}
            >
              <ChevronUp className="text-primary" size={'18px'} />
            </Button>
          )}
        </div>
      </div>
      {(input.name === 'Short text' ||
        input.name === 'Long text' ||
        input.name === 'Number') && (
        <ShortLongTextPopup
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}
      {(input.name === 'Single Select' || input.name === 'Multi Select') && (
        <SelectInputPopup
          showOptions={showOptions}
          setShowOptions={setShowOptions}
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}
      {input.name === 'Date Picker' && (
        <DateInputPopup
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}
      {input.name === 'Upload' && (
        <UploadInputPopup
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}
      {input.name === 'Time' && (
        <TimeInputPopup
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}

      {input.name === 'Dropdown' && (
        <DropdownPopup
          setShowOptions={setShowOptions}
          showOptions={showOptions}
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}
    </InputWrapper>
  );
};

export default FormBuilderInput;
