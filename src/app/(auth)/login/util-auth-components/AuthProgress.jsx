import { useAuthProgress } from '@/context/AuthProgressContext';
import { LocalStorageService } from '@/lib/utils';
import { ChevronRight, CreditCard, PackageCheck, User } from 'lucide-react';
import React, { useEffect } from 'react';

const AuthProgress = () => {
  const { authProgress, updateAuthProgress } = useAuthProgress();

  const isPanVerifiedFromStorage = LocalStorageService.get('isPanVerified');
  const isAadharVerifiedFromStorage =
    LocalStorageService.get('isAadharVerified');

  useEffect(() => {
    updateAuthProgress('isPanVerified', isPanVerifiedFromStorage ?? false);
    updateAuthProgress(
      'isAadharVerified',
      isAadharVerifiedFromStorage ?? false,
    );
    updateAuthProgress(
      'isConfirmation',
      isPanVerifiedFromStorage && isAadharVerifiedFromStorage,
    );
  }, [isPanVerifiedFromStorage, isPanVerifiedFromStorage]);

  const AuthProgressData = [
    {
      id: 1,
      icon: <CreditCard size={14} />,
      title: 'PAN Verification',
      time: '3 min',
      isDone: authProgress.isPanVerified,
    },
    {
      id: 2,
      icon: <User size={14} />,
      title: 'Aadhar Verification',
      time: '2 min',
      isDone: authProgress.isAadharVerified,
    },
    {
      id: 3,
      icon: <PackageCheck size={14} />,
      title: 'Confirmation',
      time: '1 min',
      isDone: authProgress.isConfirmation,
    },
  ];
  return (
    <div className="flex w-full items-center justify-center">
      {AuthProgressData?.map((data) => (
        <div key={data.id} className="flex items-center gap-1 text-xs">
          {data.id !== 1 && <ChevronRight size={14} />}
          <div
            className={
              data.isDone
                ? 'flex items-center gap-1 font-bold text-primary'
                : 'flex items-center gap-1 font-bold text-gray-400'
            }
          >
            {data.icon}
            {data.title}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthProgress;
