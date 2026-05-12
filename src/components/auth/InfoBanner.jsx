import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const InfoBanner = ({
  text,
  variant = 'default', // default | danger | warning
  showSupportLink = true,
}) => {
  const router = useRouter();

  const variants = {
    default: {
      wrapper: 'border-primary bg-blue-50 text-primary',
      icon: 'text-blue-600',
    },
    danger: {
      wrapper: 'border-red-300 bg-red-50 text-red-500',
      icon: 'text-red-500',
    },
    warning: {
      wrapper: 'border-yellow-300 bg-yellow-50 text-yellow-700',
      icon: 'text-yellow-700',
    },
  };

  const current = variants[variant] || variants.default;

  return (
    <div
      className={`flex items-start gap-2 rounded-sm border px-4 py-2 text-sm ${current.wrapper}`}
    >
      <Info size={14} className={`mt-1 shrink-0 ${current.icon}`} />

      <p className="leading-relaxed">
        {text}{' '}
        {showSupportLink && (
          <>
            <span
              className="cursor-pointer font-medium underline underline-offset-2"
              onClick={() => router.push('/support')}
            >
              contact support
            </span>
            .
          </>
        )}
      </p>
    </div>
  );
};

export default InfoBanner;
