import { useState } from 'react';
import { toast } from 'sonner';
// import { Error } from "../../../../assets/formIcons";

const MinMaxForm = ({ setFormData, idx, input }) => {
  const [min, setMin] = useState(input.minLength || 0);
  const [max, setMax] = useState(input.maxLength || 100);
  const [limitError, setLimitError] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();

    if (limitError) {
      return toast.error(limitError);
    }
    setFormData((prev) => {
      const updated = [...prev];
      updated[idx].minLength = min;
      updated[idx].maxLength = max;
      return updated;
    });
  };

  const minMaxSetter = (e, type) => {
    setLimitError('');
    const value = Number(e.target.value);

    if (type === 'min') {
      setMin(value);
    } else {
      setMax(value);
    }

    setLimitError('');
    if (type === 'max') {
      if (value < min) {
        setLimitError('Max value should be greater than Min value');
      }
      return;
    }
    if (type === 'min') {
      if (value > max) {
        setLimitError('Min value should be less than Max value');
      }
    }
  };

  return (
    <>
      <form onSubmit={submitHandler} className="flex justify-center gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="minValue"
            className="text-xs font-normal leading-normal text-primary"
          >
            Min Value
          </label>
          <input
            onBlur={(e) => minMaxSetter(e, 'min')}
            className="flex h-7 w-20 items-center rounded border-[1px] border-primary/10 bg-white px-2 text-xs leading-6 focus-within:outline-none"
            type="number"
            id="minValue"
            value={min || 0}
            onChange={(e) => minMaxSetter(e, 'min')}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className="text-xs font-normal leading-normal text-primary"
            htmlFor="maxValue"
          >
            Max Value
          </label>
          <input
            onBlur={(e) => minMaxSetter(e, 'max')}
            className="flex h-7 w-20 items-center rounded border-[1px] border-primary/10 bg-white px-2 text-xs leading-6 focus-within:outline-none"
            type="number"
            id="maxValue"
            value={max || 100}
            onChange={(e) => minMaxSetter(e, 'max')}
          />
        </div>
        <button className="hidden">submit</button>
      </form>
      {limitError !== '' && (
        <p className="flex items-center justify-center gap-2 px-4">
          {/* <Error /> */}
          <span className="text-xs font-light leading-normal text-[#B83333]">
            {limitError}
          </span>
        </p>
      )}
    </>
  );
};

export default MinMaxForm;
