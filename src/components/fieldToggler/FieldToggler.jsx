import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export default function FieldToggler({
  section,
  enabled,
  onToggle,
  error,
  renderFields,
}) {
  return (
    <div className="group flex flex-col gap-2 transition-all duration-300">
      {/* Label and Toggle Row */}
      <div className="flex items-center gap-3">
        <Checkbox
          checked={enabled}
          onCheckedChange={(checked) => onToggle(!!checked)}
          className={cn(
            'h-4 w-4 rounded border-muted-foreground/30 transition-all data-[state=checked]:bg-primary',
            error && !enabled && 'border-red-500',
          )}
        />

        <div className="flex flex-col">
          <span
            className={cn(
              'cursor-pointer select-none text-[13px] font-bold transition-colors',
              enabled ? 'text-foreground' : 'text-muted-foreground/70',
            )}
            onClick={() => onToggle(!enabled)}
          >
            {section.label}
            {section.isRequired && (
              <span className="ml-0.5 text-red-500">*</span>
            )}
          </span>
        </div>
      </div>

      {/* Field Content - only takes space when enabled */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          enabled ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="pb-2 pl-7 pt-1">
          {renderFields(section.fields, !enabled)}
        </div>
      </div>

      {error && !enabled && (
        <p className="pl-7 text-[11px] font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}
