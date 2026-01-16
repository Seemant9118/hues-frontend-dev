'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export default function ActionsDropdown({
  actions = [],
  disabled = false,
  label = 'Actions',
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
          {label}
          {open ? (
            <ChevronUp className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-1 h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.key}
            className={`flex gap-2 font-semibold ${action.className || ''}`}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon && <action.icon size={16} />}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
