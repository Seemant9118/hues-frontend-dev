import React from "react";
import { cn } from "@/lib/utils";

const SubHeader = ({ name, children, className }) => {
  return (
    <div className={cn("flex justify-between items-center gap-2.5 sticky top-0 right-0 left-0 bg-white pt-4 ", className)}>
      <h2 className="text-zinc-900 font-bold text-2xl">{name}</h2>
      {children}
    </div>
  );
};

export default SubHeader;
