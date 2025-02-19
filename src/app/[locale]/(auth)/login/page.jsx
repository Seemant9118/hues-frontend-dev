'use client';

import Loading from '@/components/ui/Loading';
import { Suspense } from 'react';
import MobileLoginPage from './mobileLogin/page';

export default function Login() {
  return (
    <>
      <Suspense fallback={Loading}>
        {/* Initial Page in auth */}
        <MobileLoginPage />
      </Suspense>
    </>
  );
}
