import { cn } from "@/lib/utils";
import React from "react";

const Wrapper = ({ children, className }) => {
  return (
    <div
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
