import { useState } from 'react';
import EnterpriseFinal from './enterprise-multiple-step-forms/EnterpriseFinal';
import EnterpriseIndex from './enterprise-multiple-step-forms/EnterpriseIndex';
import EnterpriseSecond from './enterprise-multiple-step-forms/EnterpriseSecond';

const EnterpriseOnboarding = () => {
  const [enterpriseCurrStep, setEnterpriseCurrStep] = useState(1);
  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    name: '',
    type: '',
    address: '',
    email: '',
    gstNumber: '',
    udyam: '',
    panNumber: '',
    doi: '',
    isDeclerationConsent: false,
    LLPIN: '',
    CIN: '',
  });

  return (
    <>
      {enterpriseCurrStep === 1 && (
        <EnterpriseIndex
          setEnterpriseCurrStep={setEnterpriseCurrStep}
          enterpriseOnboardData={enterpriseOnboardData}
          setEnterpriseOnboardData={setEnterpriseOnboardData}
        />
      )}
      {enterpriseCurrStep === 2 && (
        <EnterpriseSecond
          setEnterpriseCurrStep={setEnterpriseCurrStep}
          enterpriseOnboardData={enterpriseOnboardData}
          setEnterpriseOnboardData={setEnterpriseOnboardData}
        />
      )}
      {enterpriseCurrStep === 3 && (
        <EnterpriseFinal
          setEnterpriseCurrStep={setEnterpriseCurrStep}
          enterpriseOnboardData={enterpriseOnboardData}
          setEnterpriseOnboardData={setEnterpriseOnboardData}
        />
      )}
    </>
  );
};

export default EnterpriseOnboarding;
