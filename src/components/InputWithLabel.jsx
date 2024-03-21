import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const InputWithLabel = ({ name, id, onChange, value, type, required }) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {name} {required == true && (<span className="text-red-600">*</span>)}
      </Label>
      <Input className="rounded" type={type} value={value} onChange={onChange} id={id} required={required} />
    </div>
  );
};

export default InputWithLabel;
