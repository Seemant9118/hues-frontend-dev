import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { inputFields } from "@/globals/formbulder/constants";
import SidebarField from "./SidebarField";

const FormSidebar = () => {
  return (
    <aside className=" bg-white w-[200px] sticky top-0 left-0 bottom-0">
      <div className="text-xs py-2 px-8 bg-primary text-white">
        Append fields / structures to your form
      </div>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="mb-4">
          <AccordionTrigger className="pl-8 pr-4 py-[6px] h-8 border-b-[1px] border-zinc-500 bg-primary text-white font-bold text-sm tracking-[0.14px]">
            Input Fields
          </AccordionTrigger>
          <AccordionContent>
            {inputFields.map(
              (field) =>
                field.name !== "Notes" && (
                  <SidebarField key={field.id} item={field} />
                )
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};

export default FormSidebar;
