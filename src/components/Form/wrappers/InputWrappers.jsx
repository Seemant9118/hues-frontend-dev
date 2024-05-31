import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const InputWrapper = forwardRef(({ children, className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "py-4 px-8 flex flex-col bg-white shadow-[0px_2px_8px_0px_rgba(21,151,212,0.16)]",
        className
      )}
    >
      {children}
    </div>
  );
});

export default InputWrapper;
