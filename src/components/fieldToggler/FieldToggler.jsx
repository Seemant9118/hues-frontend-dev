import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function FieldToggler({
  section,
  enabled,
  onToggle,
  error,
  renderFields,
}) {
  return (
    <Card className={cn(error && 'border-red-500', 'transition-colors')}>
      <CardContent className="space-y-4 p-4">
        {/* Toggle Header */}
        <div className="flex items-start gap-3">
          <Checkbox
            checked={enabled}
            onCheckedChange={(checked) => onToggle(!!checked)}
            className={cn('mt-1', error && !enabled && 'border-red-500')}
          />

          <div
            className={cn(
              'space-y-1',
              enabled ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <div className="flex items-center gap-1 text-sm font-medium leading-none">
              {section.label}
              {section.isRequired && <span className="text-red-500">*</span>}
            </div>
            {section.description && (
              <p className="text-xs text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>
        </div>

        {error && !enabled && (
          <p className="pl-7 text-sm font-medium text-red-500">{error}</p>
        )}

        {/* Dynamic Fields */}
        {enabled && (
          <div className="space-y-4 pl-7">{renderFields(section.fields)}</div>
        )}
      </CardContent>
    </Card>
  );
}
