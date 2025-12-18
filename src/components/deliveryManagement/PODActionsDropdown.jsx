'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  PencilLine,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function PODActionsDropdown({
  onAccept,
  onModify,
  onReject,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="font-bold"
          disabled={disabled}
        >
          Actions
          {open ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          className="flex gap-2 font-semibold text-green-600"
          onClick={onAccept}
        >
          <CheckCircle size={16} />
          Accept as Delivered
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex gap-2 font-semibold"
          onClick={onModify}
        >
          <PencilLine size={16} />
          Modify & Accept
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex gap-2 font-semibold text-red-600"
          onClick={onReject}
        >
          <X size={16} />
          Reject Delivery
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
