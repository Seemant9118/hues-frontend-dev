import { useRef } from "react";

import { ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { inputFields } from "@/globals/formbulder/constants";
import { copyHandler } from "@/lib/utils";
import DateInputPopup from "./inputs/DateInputPopup";
import DropdownPopup from "./inputs/DropdownPopup";
import LinearScalePopup from "./inputs/LinearScalePopup";
import SelectInputPopup from "./inputs/SelectInputPopup";
import Short_LongTextPopup from "./inputs/Short&LongTextPopup";
import TimeInputPopup from "./inputs/TimeInputPopup";
import UploadInputPopup from "./inputs/UploadInputPopup";
import InputWrapper from "./wrappers/InputWrappers";

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
}) => {
  // const [showOptions, setShowOptions] = useState(true);
  const inputRef = useRef(null);
  const { icon: Icon } = input;

  const questionHandler = (e) => {
    e.preventDefault();
    if (inputRef.current?.value) {
      inputHandler(idx, inputRef.current?.value);
    }
  };

  return (
    <InputWrapper>
      <div className="h-8 flex justify-between items-center self-stretch overflow-hidden">
        <div className="flex gap-2 items-center py-1">
          <span className="text-zinc-800 text-xs leading-6">{idx + 1}.</span>
          <Select
            value={input.name + "?" + input.type}
            onValueChange={(value) => selectHandler(value, idx)}
          >
            <SelectTrigger className="flex items-center gap-2 px-2 bg-[#F6F3FF] text-primary text-[10px] rounded focus:ring-0 h-7">
              {Icon && <Icon size={16} />}
              <SelectValue defaultValue={input.name} />
            </SelectTrigger>
            <SelectContent>
              {inputFields.map((item) => (
                <SelectItem key={item.id} value={item.name + "?" + item.type}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <form onSubmit={questionHandler}>
            <input
              onBlur={questionHandler}
              name="text"
              className="text-sm leading-6 text-zinc-800 min-w-[300px] placeholder:text-slate-400e focus-within:outline-none"
              placeholder="Enter Question"
              maxLength={input.maxLength}
              minLength={input.minLength}
              ref={inputRef}
              defaultValue={input.question}
            />
          </form>
        </div>
        <div className="flex gap-4 items-center">
          <div className="flex gap-2">
            {/* <label
              htmlFor="static"
              className="text-DarkText text-xs leading-6 font-normal"
            >
              Static
            </label>
            <Switch
              id="static"
              defaultChecked={input.static}
              onCheckedChange={(checked) => {
                setDroppedInputs((prev: any) => {
                  const updated = [...prev];
                  updated[idx].static = checked;
                  return updated;
                });
              }}
              className="h-6 text-Purple data-[state=checked]:bg-Purple"
            /> */}
          </div>
          {input.name !== "Notes" && (
            <div className="flex gap-2">
              <label
                htmlFor="required"
                className="text-zinc-800 text-xs leading-6 font-normal"
              >
                Required
              </label>
              <Switch
                id="required"
                defaultChecked={input.required}
                onCheckedChange={(checked) => {
                  setDroppedInputs((prev) => {
                    const updated = [...prev];
                    updated[idx].required = checked;
                    return updated;
                  });
                }}
                className="h-6 text-primary data-[state=checked]:bg-primary"
              />
            </div>
          )}
          <Button
            onClick={() => copyHandler(input.question)}
            className=" bg-transparent hover:bg-white w-4 h-4"
            size={"icon"}
          >
            <Copy className="text-primary cursor-pointer" size={"16px"} />
          </Button>
          <Button
            onClick={() => deleteHandler(idx)}
            className=" bg-transparent hover:bg-white w-4 h-4"
            size={"icon"}
          >
            <Trash2 className="text-primary cursor-pointer" size={"16px"} />
          </Button>
          <div className="flex items-center justify-center gap-1">
            {idx !== droppedInputs.length - 1 && (
              <Button
                className=" bg-transparent hover:bg-white w-5 h-5"
                size={"icon"}
                onClick={() => upAndDownHandler(idx, idx + 1)}
              >
                <ChevronDown
                  className="text-primary cursor-pointer"
                  size={"18px"}
                />
              </Button>
            )}
            {idx !== 0 && (
              <Button
                onClick={() => upAndDownHandler(idx, idx - 1)}
                className=" bg-transparent hover:bg-white w-4 h-4"
                size={"icon"}
              >
                <ChevronUp
                  className="text-primary cursor-pointer"
                  size={"18px"}
                />
              </Button>
            )}
          </div>
        </div>
      </div>
      {(input.name === "Short text" ||
        input.name === "Long text" ||
        input.name === "Number") && (
        <Short_LongTextPopup
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}
      {(input.name === "Single Select" || input.name === "Multi Select") && (
        <SelectInputPopup
          showOptions={showOptions}
          setShowOptions={setShowOptions}
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}
      {input.name === "Date Picker" && (
        <DateInputPopup
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}
      {input.name === "Upload" && (
        <UploadInputPopup
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}
      {input.name === "Time" && (
        <TimeInputPopup
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}
      {input.name === "Linear Scale" && (
        <LinearScalePopup
          input={input}
          setDroppedInputs={setDroppedInputs}
          idx={idx}
        />
      )}
      {input.name === "Dropdown" && (
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
