'use client';

import { gstAPIs } from '@/api/gstAPI/gstApi';
import { formattedMonthDate } from '@/appUtils/helperFunctions';
import AuthenticationExpired from '@/components/gst/AuthenticationExpired';
import GSTOTPDialog from '@/components/gst/GSTOTPDialog';
import MultiStepForm from '@/components/shared/MultiStepForm/MultiStepForm';
import { Badge } from '@/components/ui/badge';
import {
  requestGSTOTP,
  verifyGSTOTP,
} from '@/services/GST_Services/GST_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import FinishStep from './steps/FinishStep';
import PurchasesStep from './steps/PurchasesStep';
import SalesStep from './steps/SalesStep';
import SummaryStep from './steps/SummaryStep';
import TwoAVsTwoBStep from './steps/TwoAVsTwoBStep';
import GstOffsetStep from './steps/GstOffsetStep';

export default function Gstr3bForm({ period }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [authExpiredModalOpen, setAuthExpiredModalOpen] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);

  // [RE-AUTHENTICATION_FLOW]
  const requestOTPMutation = useMutation({
    mutationFn: requestGSTOTP,
    onSuccess: () => {
      toast.success('OTP sent successfully to your registered contact');
      setAuthExpiredModalOpen(false);
      setShowOTPDialog(true);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to send OTP. Please try again.',
      );
    },
  });

  const handleGenerateOTP = () => {
    requestOTPMutation.mutate();
  };

  const verifyOTPMutation = useMutation({
    mutationFn: verifyGSTOTP,
    onSuccess: () => {
      toast.success('Authentication successful!');
      setShowOTPDialog(false);
      // Invalidate auth status
      queryClient.invalidateQueries({
        queryKey: [gstAPIs.checkAuth.endpointKey],
      });
      // Also invalidate the sync queries so they refetch
      queryClient.invalidateQueries({
        queryKey: [gstAPIs.syncInvoicesWithGSTR1.endpointKey],
      });
      queryClient.invalidateQueries({
        queryKey: [gstAPIs.syncInvoicesWithGSTR2A.endpointKey],
      });
      queryClient.invalidateQueries({
        queryKey: [gstAPIs.getGSTR3BAutoPop.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Invalid OTP. Please try again.',
      );
    },
  });

  const handleVerifyOTP = (otp) => {
    verifyOTPMutation.mutate({ otp });
  };

  const handleGstError = (error) => {
    const errorCode = error?.response?.data?.error;

    if (errorCode === 'RET11407') {
      toast.error('GST session expired. Please re-authenticate.');
      setAuthExpiredModalOpen(true);
    } else {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    }
  };

  const [formData, setFormData] = useState({
    period,
    isFetched: false,
    fetchTime: null,
    salesData: [],
    purchaseData: [],
    twoAVsTwoBData: [],
    summaryData: null,
    handleGstError, // Pass the handler to step components
  });

  const [errors, setErrors] = useState({});

  const steps = [
    {
      key: 'sales',
      label: 'Sales',
      component: SalesStep,
    },
    {
      key: 'purchases',
      label: 'Purchases',
      component: PurchasesStep,
    },
    {
      key: '2avs2b',
      label: '2A vs 2B',
      component: TwoAVsTwoBStep,
    },
    {
      key: 'gst-offset',
      label: 'GST Offset',
      component: GstOffsetStep,
    },
    {
      key: 'summary',
      label: 'Filing Summary',
      component: SummaryStep,
    },
    {
      key: 'finish',
      label: 'Finish',
      component: FinishStep,
    },
  ];

  const handleSubmit = () => {
    // console.log('Final Submit:', action, formData);
  };

  const handleCancel = () => {
    router.push('/dashboard/statutory/gst');
  };

  const gstBreadCrumbs = [
    {
      id: 1,
      name: 'GST',
      path: '/dashboard/statutory/gst',
      show: true,
    },
    {
      id: 2,
      name: 'GSTR-3B Filing',
      path: `/dashboard/statutory/gst/gstr3b?period=${encodeURIComponent(period)}`,
      show: true,
    },
  ];

  return (
    <>
      <MultiStepForm
        steps={steps}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        breadcrumbs={gstBreadCrumbs}
        onBack={() => router.push('/dashboard/statutory/gst')}
        headerExtra={
          <Badge className="w-fit whitespace-nowrap">
            {period && formattedMonthDate(period)}{' '}
          </Badge>
        }
      />

      <AuthenticationExpired
        open={authExpiredModalOpen}
        onClose={() => setAuthExpiredModalOpen(false)}
        handleGenerateOTP={handleGenerateOTP}
        requestOTPMutation={requestOTPMutation}
        module="GSTR-3B"
      />

      <GSTOTPDialog
        open={showOTPDialog}
        onOpenChange={setShowOTPDialog}
        onVerify={handleVerifyOTP}
        isVerifying={verifyOTPMutation.isPending}
      />
    </>
  );
}
