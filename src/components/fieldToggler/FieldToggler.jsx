import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function FieldToggler({
  section,
  enabled,
  onToggle,
  renderFields,
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        {/* Toggle Header */}
        <div className="flex items-start gap-3">
          <Checkbox
            checked={enabled}
            onCheckedChange={(checked) => onToggle(!!checked)}
            className="mt-1"
          />

          <div
            className={cn(
              'space-y-1',
              enabled ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            <div className="text-sm font-medium leading-none">
              {section.label}
            </div>
            {section.description && (
              <p className="text-xs text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Fields */}
        {enabled && (
          <div className="space-y-4 pl-7">{renderFields(section.fields)}</div>
        )}
      </CardContent>
    </Card>
  );
}
