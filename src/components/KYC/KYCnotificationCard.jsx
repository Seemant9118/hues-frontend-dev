import React from 'react';
import { Button } from '../ui/button';

const KYCnotificationCard = ({ isExpireKYC }) => {
  return (
    <div
      className={
        isExpireKYC
          ? 'mx-10 flex items-center justify-between rounded-md bg-[#FFFF] px-5 py-2 shadow-[0_4px_6px_0_#3288ED1A]'
          : 'mx-10 flex items-center justify-between rounded-md border border-[#F8BA05] bg-[#F8BA0533] px-5 py-2'
      }
    >
      <span className={isExpireKYC ? '' : 'font-bold text-[#CE9D0C]'}>
        {isExpireKYC
          ? 'Your KYC request expired. Please continue to verify your details'
          : 'Your KYC request is still valid. Please continue to verify your details'}
      </span>
      <Button
        className="w-34 h-9"
        variant={isExpireKYC ? 'default' : 'warning'}
      >
        Verify KYC
      </Button>
    </div>
  );
};

export default KYCnotificationCard;
