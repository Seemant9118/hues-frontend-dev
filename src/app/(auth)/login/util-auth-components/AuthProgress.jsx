import { useAuthProgress } from '@/context/AuthProgressContext';
import { LocalStorageService } from '@/lib/utils';
import {
  BadgeCheck,
  ChevronRight,
  CreditCard,
  PackageCheck,
  User,
} from 'lucide-react';
import React, { useEffect } from 'react';

const AuthProgress = ({ isCurrAuthStep }) => {
  const { authProgress, updateAuthProgress } = useAuthProgress();

  const isPanVerifiedFromStorage = LocalStorageService.get('isPanVerified');
  const isAadharVerifiedFromStorage =
    LocalStorageService.get('isAadhaarVerified');

  useEffect(() => {
    updateAuthProgress('isPanVerified', isPanVerifiedFromStorage ?? false);
    updateAuthProgress(
      'isAadhaarVerified',
      isAadharVerifiedFromStorage ?? false,
    );
    updateAuthProgress('isConfirmation', false);
  }, [isPanVerifiedFromStorage, isAadharVerifiedFromStorage]);

  const AuthProgressData = [
    {
      id: 1,
      icon: <CreditCard size={14} />,
      title: 'PAN Verification',
      isCurr: isCurrAuthStep === 'isPanVerificationStep',
      isDone: authProgress.isPanVerified,
    },
    {
      id: 2,
      icon: <User size={14} />,
      title: 'Aadhar Verification',
      isCurr: isCurrAuthStep === 'isAadharVerificationStep',
      isDone: authProgress.isAadhaarVerified,
    },
    {
      id: 3,
      icon: <PackageCheck size={14} />,
      title: 'Confirmation',
      isCurr: isCurrAuthStep === 'isConfirmationStep',
      isDone: authProgress.isConfirmation,
    },
  ];

  return (
    <div className="flex w-full items-center justify-center">
      {AuthProgressData?.map((data) => (
        <div key={data.id} className="flex items-center gap-1 text-xs">
          {data.id !== 1 && <ChevronRight size={14} />}
          <div
            className={`flex items-center gap-1 font-bold ${
              data.isDone
                ? 'text-green-600'
                : data.isCurr
                  ? 'text-primary'
                  : 'text-gray-400'
            }`}
          >
            {data.icon}
            {data.title}
            {data.isDone && <BadgeCheck className="text-green-600" size={16} />}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthProgress;
