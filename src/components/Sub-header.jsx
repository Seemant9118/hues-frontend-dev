import React from "react";
import { cn } from "@/lib/utils";

const SubHeader = ({ name, children, className }) => {
  return (
    <div className={cn("flex justify-between items-center gap-2.5", className)}>
      <h2 className="text-zinc-900 font-bold text-2xl">{name}</h2>
      {children}
    </div>
  );
};

export default SubHeader;
