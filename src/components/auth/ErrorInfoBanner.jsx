import { Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const ErrorInfoBanner = ({ govermentDoc = 'PAN/Aadhaar/GSTIN/CIN/UDYAM' }) => {
  const router = useRouter();
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-500">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
      <p className="leading-relaxed">
        Verification of <b>{govermentDoc}</b> using government resources may
        sometimes fail due to service unavailability. If onboarding isn&apos;t
        completed, please{' '}
        <span
          className="cursor-pointer font-medium underline underline-offset-2"
          onClick={() => {
            router.push(`/support`);
          }}
        >
          contact support
        </span>
        .
      </p>
    </div>
  );
};

export default ErrorInfoBanner;
