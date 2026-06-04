'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronUp, MoreVertical } from 'lucide-react';
import { useState } from 'react';

export default function ActionsDropdown({
  actions = [],
  disabled = false,
  label = 'Actions',
  variant = 'default',
  isThreeDots = false,
  isHide = false,
}) {
  const [open, setOpen] = useState(false);

  const visibleActions = (actions || []).filter(
    (action) => !!action && !action.isHide,
  );

  if (isHide || visibleActions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant={variant}
          className={`font-bold`}
          disabled={disabled}
        >
          {isThreeDots ? (
            <>
              <span className="sr-only">Open actions menu</span>
              <MoreVertical className="h-4 w-4" />
            </>
          ) : (
            <>
              {label}
              {open ? (
                <ChevronUp className="ml-1 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-1 h-4 w-4" />
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-fit">
        {visibleActions.map((action) => (
          <DropdownMenuItem
            key={action.key}
            className={`flex items-center justify-center gap-2 font-semibold ${action.className || ''}`}
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
