import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const InputWithLabel = ({
  name,
  id,
  onChange,
  value,
  type,
  required,
  disabled,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {name} {required && <span className="text-red-600">*</span>}
      </Label>
      <Input
        className="rounded-sm"
        type={type}
        value={value}
        onChange={onChange}
        id={id}
        required={required}
        disabled={disabled}
      />
    </div>
  );
};

export default InputWithLabel;
