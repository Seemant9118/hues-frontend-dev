import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import MinMaxForm from "./MinMaxForm";

const Short_LongTextPopup = ({ input, setDroppedInputs, idx }) => {
  return (
    <div className="flex gap-2 items-center pt-3 pb-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button className="px-4 h-7 bg-primary/10 rounded-none text-primary border-b-[1px] border-primary/20 hover:bg-primary/20">
            Set{" "}
            {input.name === "Short text"
              ? "Character"
              : input.name === "Long text"
              ? "Word"
              : "Number"}{" "}
            Limit
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-fit ml-28">
          <h2 className="text-xs leading-normal text-primary font-semibold">
            Edit{" "}
            {input.name === "Short text"
              ? "Character"
              : input.name === "Long text"
              ? "Word"
              : "Number"}{" "}
            Limit
          </h2>
          <div className="p-4 flex flex-col gap-2">
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

export default Short_LongTextPopup;
