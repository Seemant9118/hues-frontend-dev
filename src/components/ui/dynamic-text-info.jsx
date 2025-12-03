// components/ui/dynamic-text-info.tsx

import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const variants = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  danger: {
    icon: Info,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

export function DynamicTextInfo({
  variant = 'info',
  title,
  description,
  className,
}) {
  const style = variants[variant];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        'my-3 flex w-full items-center gap-3 rounded-sm border px-4 py-2',
        style.bg,
        style.border,
        className,
      )}
    >
      <Icon size={20} className={cn(style.text)} />

      <div className="flex flex-col">
        {title && <p className={cn('font-semibold', style.text)}>{title}</p>}

        {description && (
          <p className={cn('text-sm', style.text)}>{description}</p>
        )}
      </div>
    </div>
  );
}
