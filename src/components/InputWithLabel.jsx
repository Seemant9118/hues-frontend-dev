import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const InputWithLabel = ({ name, id, onChange, value,required }) => {
  return (
    <div className="flex flex-col gap-2">
      <Label className="capitalize" htmlFor={id}>
        {name}
      </Label>
      <Input className="rounded" value={value} onChange={onChange} id={id} required={required} />
    </div>
  );
};

export default InputWithLabel;
