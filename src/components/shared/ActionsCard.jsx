import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Eye,
  HeartHandshake,
  Check,
  CheckCheck,
  Pencil,
  Undo,
  X,
} from 'lucide-react';

const iconMap = {
  negotiate: Eye,
  negotiateByBehalf: HeartHandshake,
  accept: Check,
  acceptByBehalf: CheckCheck,
  revise: Pencil,
  withdraw: Undo,
  cancel: X,
};

const renderIcon = (Icon) => {
  if (!Icon) return null;
  // If it's a JSX element / React element
  if (
    typeof Icon === 'object' &&
    Icon.$$typeof === Symbol.for('react.element')
  ) {
    return Icon;
  }
  // Otherwise it's a component (function or forwardRef object)
  const IconComponent = Icon;
  return <IconComponent size={16} className="text-neutral-500" />;
};

const ActionsCard = ({
  recommendedActions = [],
  ancillaryActions = [],
  cancelAction = null,
}) => {
  if (
    recommendedActions.length === 0 &&
    ancillaryActions.length === 0 &&
    !cancelAction
  ) {
    return null;
  }

  return (
    <div className="flex w-full flex-col gap-6 rounded-md border border-neutral-200 bg-white p-6">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
          Actions
        </span>
      </div>

      {recommendedActions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Recommended Actions
          </span>
          {recommendedActions.map((action) => {
            if (action.render) {
              return (
                <React.Fragment key={action.label || action.key}>
                  {action.render()}
                </React.Fragment>
              );
            }
            return (
              <Button
                size="sm"
                key={action.label}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon}
                {action.label === 'Invoice' ? 'Log Invoice' : action.label}
              </Button>
            );
          })}
        </div>
      )}

      {ancillaryActions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Ancillary Actions
          </span>
          {ancillaryActions.map((action) => {
            if (action.render) {
              return (
                <React.Fragment key={action.label || action.key}>
                  {action.render()}
                </React.Fragment>
              );
            }
            const Icon = iconMap[action.key] || action.icon;
            return (
              <Button
                size="sm"
                key={action.key || action.label}
                onClick={action.onClick}
                disabled={action.disabled}
                variant="outline"
              >
                <span className="font-semibold text-neutral-700">
                  {action.label}
                </span>
                {renderIcon(Icon)}
              </Button>
            );
          })}
        </div>
      )}

      {cancelAction && (
        <div className="flex justify-center border-t border-neutral-100 pt-4">
          <button
            onClick={cancelAction.onClick}
            className="py-2 text-center text-sm font-semibold text-red-600 transition-all hover:text-red-700"
          >
            {cancelAction.label || 'Cancel Order'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActionsCard;
