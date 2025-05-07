import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';

const CommentBox = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full rounded-md border px-2 py-1"
    >
      <div
        className={
          isOpen
            ? 'flex items-center justify-between gap-2'
            : 'flex items-center justify-between gap-2'
        }
      >
        {!isOpen && (
          <section className="flex w-full animate-fadeInUp items-center justify-between">
            Comments
          </section>
        )}
        {isOpen && <h1 className="text-sm font-bold">{'Comments'}</h1>}
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" debounceTime="0">
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="animate-fadeInUp space-y-2"></CollapsibleContent>
    </Collapsible>
  );
};

export default CommentBox;
