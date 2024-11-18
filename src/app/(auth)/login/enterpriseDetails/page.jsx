'use client';

import { LocalStorageService } from '@/lib/utils';
import React, { useState } from 'react';
import EnterpriseDetailsFirst from '../multi-step-forms/enterpriseDetailsComponents/EnterpriseDetailsFirst';
import EnterpriseDetailsSecond from '../multi-step-forms/enterpriseDetailsComponents/EnterpriseDetailsSecond';

const EnterpriseDetails = () => {
  const panNumber = LocalStorageService.get('enterprisePanNumber');
  const [enterpriseDetailsCurrStep, setEnterpriseDetailsCurrStep] = useState(1);
  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    name: '',
    type: '',
    address: '',
    email: '',
    gstNumber: '',
    udyam: '',
    panNumber: panNumber ?? '',
    doi: '',
    isDeclerationConsent: null,
    LLPIN: '',
    CIN: '',
  });

  return (
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
  );
};

export default EnterpriseDetails;
