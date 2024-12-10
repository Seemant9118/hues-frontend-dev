'use client';

import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import React, { useState } from 'react';
import EnterpriseDetailsFirst from '../multi-step-forms/enterpriseDetailsComponents/EnterpriseDetailsFirst';
import EnterpriseDetailsSecond from '../multi-step-forms/enterpriseDetailsComponents/EnterpriseDetailsSecond';

const EnterpriseDetails = () => {
  const logIninvitationData = LocalStorageService.get('invitationData');
  const panNumber = LocalStorageService.get('enterprisePanNumber');
  const [enterpriseDetailsCurrStep, setEnterpriseDetailsCurrStep] = useState(1);
  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    name: logIninvitationData?.data?.invitation?.toEnterprise?.name || '',
    type: '',
    email: logIninvitationData?.data?.invitation?.toEnterprise?.email || '',
    panNumber:
      logIninvitationData?.data?.invitation?.toEnterprise?.panNumber ||
      panNumber ||
      '',
    address: logIninvitationData?.data?.invitation?.toEnterprise?.address || '',
    gstNumber:
      logIninvitationData?.data?.invitation?.toEnterprise?.gstNumber || '',
    udyam: '',
    doi: '',
    isDeclerationConsent: null,
    LLPIN: '',
    CIN: '',
  });

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        {enterpriseDetailsCurrStep === 1 && (
          <EnterpriseDetailsFirst
            setEnterpriseDetailsCurrStep={setEnterpriseDetailsCurrStep}
            enterpriseOnboardData={enterpriseOnboardData}
            setEnterpriseOnboardData={setEnterpriseOnboardData}
          />
        )}
        {enterpriseDetailsCurrStep === 2 && (
          <EnterpriseDetailsSecond
            setEnterpriseDetailsCurrStep={setEnterpriseDetailsCurrStep}
            enterpriseOnboardData={enterpriseOnboardData}
            setEnterpriseOnboardData={setEnterpriseOnboardData}
          />
        )}
      </div>
    </UserProvider>
  );
};

export default EnterpriseDetails;
