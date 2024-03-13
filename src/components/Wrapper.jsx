import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

const Wrapper = ({ children, className, id }) => {
  return (
    <div
      id={id}
      className={cn(
        "flex flex-col gap-4 h-full overflow-y-auto p-2 grow scrollBarStyles",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Wrapper;
