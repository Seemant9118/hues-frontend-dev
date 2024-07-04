'use client';

import Loading from '@/components/ui/Loading';
import { useStep } from '@/context/StepsContext';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import EnterpriseOnboarding from './multi-step-forms/EnterpriseOnboarding';
import IndexForm from './multi-step-forms/IndexForm';
import OTPVerificationForm from './multi-step-forms/OTPVerificationForm';
import UserOnboarding from './multi-step-forms/UserOnboarding';

export default function Login() {
  const { currStep, setCurrStep } = useStep();

  const [isThirdPartyLogin, setIsThirdPartyLogin] = useState(false);

  return (
    <>
      <Suspense fallback={Loading}>
        {/* Header */}
        <div className="bg-transparent px-10 py-5 shadow-[0_4px_6px_0_#3288ED1A]">
          <Link href={'/'}>
            <Image
              src={'/hues_logo_2.png'}
              height={30}
              width={100}
              placeholder="blur"
              alt="Logo"
              blurDataURL="/hues_logo.png"
            />
          </Link>
        </div>
        {/* Body */}
        <div className="flex h-[92vh] items-center justify-center">
          {/* Login Form - Step 1 */}
          {currStep === 1 && (
            <IndexForm
              setIsThirdPartyLogin={setIsThirdPartyLogin}
              currStep={currStep}
              setCurrStep={setCurrStep}
            />
          )}

          {/* Login Form - Step 2 - If logIn with Mobile - OTPVerificationForm */}
          {currStep === 2 && (
            <OTPVerificationForm
              currStep={currStep}
              setCurrStep={setCurrStep}
            />
          )}

          {/* Login Form - Step 3 - Final Profile Details & Pan Verification form */}
          {currStep === 3 && (
            <UserOnboarding
              isThirdPartyLogin={isThirdPartyLogin}
              currStep={currStep}
              setCurrStep={setCurrStep}
            />
          )}
          {/* {currStep === 4 && <CompleteKyc />} */}

          {currStep === 4 && <EnterpriseOnboarding />}
        </div>
      </Suspense>
    </>
  );
}
