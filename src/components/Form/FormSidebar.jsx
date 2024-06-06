import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { inputFields } from '@/globals/formbulder/constants';
import SidebarField from './SidebarField';

const FormSidebar = () => {
  return (
    <aside className="sticky bottom-0 left-0 top-0 w-[200px] bg-white">
      <div className="bg-primary px-8 py-2 text-xs text-white">
        Append fields / structures to your form
      </div>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="mb-4">
          <AccordionTrigger className="h-8 border-b-[1px] border-zinc-500 bg-primary py-[6px] pl-8 pr-4 text-sm font-bold tracking-[0.14px] text-white">
            Input Fields
          </AccordionTrigger>
          <AccordionContent>
            {inputFields.map(
              (field) =>
                field.name !== 'Notes' && (
                  <SidebarField key={field.id} item={field} />
                ),
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};

export default FormSidebar;
