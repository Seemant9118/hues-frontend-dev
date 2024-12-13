'use client';

import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import { getEnterpriseById } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import EnterpriseDetailsFirst from '../multi-step-forms/enterpriseDetailsComponents/EnterpriseDetailsFirst';
import EnterpriseDetailsSecond from '../multi-step-forms/enterpriseDetailsComponents/EnterpriseDetailsSecond';

const EnterpriseDetails = () => {
  const panNumber = LocalStorageService.get('enterprisePanNumber');
  const logIninvitationData = LocalStorageService.get('invitationData');
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const enterpriseIdByDirectorInvite = LocalStorageService.get(
    'enterpriseIdByDirectorInvite',
  );
  const [enterpriseDetailsCurrStep, setEnterpriseDetailsCurrStep] = useState(1);

  const { data: enterpriseData } = useQuery({
    queryKey: [
      enterpriseUser.getEnterprise.endpointKey,
      enterpriseIdByDirectorInvite || enterpriseId,
    ],
    queryFn: () =>
      getEnterpriseById(enterpriseIdByDirectorInvite || enterpriseId),
    select: (data) => data?.data?.data,
    enabled: Boolean(enterpriseIdByDirectorInvite || enterpriseId),
  });

  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    name: '',
    type: '',
    email: '',
    panNumber: panNumber || '',
    address: '',
    gstNumber: '',
    udyam: '',
    doi: '',
    isDeclerationConsent: null,
    LLPIN: '',
    CIN: '',
  });

  useEffect(() => {
    if (enterpriseData) {
      const {
        name,
        type,
        email,
        panNumber: enterprisePan,
        address,
        gstNumber,
        udyam,
        doi,
        isDeclerationConsent,
        llpin,
        cin,
      } = enterpriseData;

      setEnterpriseOnboardData((prevState) => ({
        ...prevState,
        name:
          name ||
          logIninvitationData?.data?.invitation?.toEnterprise?.name ||
          '',
        type: type || '',
        email:
          email ||
          logIninvitationData?.data?.invitation?.toEnterprise?.email ||
          '',
        panNumber:
          enterprisePan ||
          logIninvitationData?.data?.invitation?.toEnterprise?.panNumber ||
          panNumber ||
          '',
        address:
          address ||
          logIninvitationData?.data?.invitation?.toEnterprise?.address ||
          '',
        gstNumber:
          gstNumber ||
          logIninvitationData?.data?.invitation?.toEnterprise?.gstNumber ||
          '',
        udyam: udyam || '',
        doi: doi || '',
        isDeclerationConsent: isDeclerationConsent || '',
        LLPIN: llpin || '',
        CIN: cin || '',
      }));
    }
  }, [enterpriseData, panNumber]);

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
