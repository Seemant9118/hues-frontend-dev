import { pinSettings } from '@/api/pinsettings/pinsettingApi';
import {
  checkPINStatus,
  createPIN,
  generateOTP,
  resetPIN,
  verifyOTP,
} from '@/services/Pin_Setting_Services/Pin_Settings_Services';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoveLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  StepConfirmPIN,
  StepCreatePIN,
  StepEnterOTP,
  StepSuccess,
} from '../Modals/HelperComponentsPINSettings';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import Loading from '../ui/Loading';

const PINVerifyModalOfflineOrder = ({
  open,
  setOpen,
  order,
  isPendingInvoice,
  handleCreateFn,
  isPINError,
  setIsPINError,
}) => {
  const queryClient = useQueryClient();
  const translations = useTranslations('components.generate_invoice_modal_otp');
  const translationsUpdatePIN = useTranslations(
    'components.generate_pin_modal',
  );
  // const router = useRouter();
  const [isActiveUpdatePinMode, setIsActivateUpdatePinMode] = useState(false);
  const [mode, setMode] = useState(null);
  const [pin, setPin] = useState(''); // for verify, current pin
  const [newPin, setNewPin] = useState(''); // new pin
  const [confirmNewPin, setConfirmNewPin] = useState(''); // confir new pin
  const [PINErrors, setPINErrors] = useState(null);
  const [steps, setSteps] = useState({
    create_pin: 1,
    forgot_pin: 1,
  });
  const [otp, setOtp] = useState(''); // otp for forgot
  const [updateSuccessMessage, setUpdateSuccessMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setSteps({ create_pin: 1, forgot_pin: 1 });
      setMode(null);
      setPin('');
      setNewPin('');
      setConfirmNewPin('');
      setOtp('');
      setIsActivateUpdatePinMode(false);
      setIsPINError(false);
      setUpdateSuccessMessage('');
      setPINErrors(null);
    }
  }, [open]);

  const { data: pinStatus } = useQuery({
    queryKey: [pinSettings.checkPINStatus.endpointKey],
    queryFn: () => checkPINStatus(),
    select: (data) => data.data.data,
    enabled: !!open,
  });

  const createPin = () => {
    setIsActivateUpdatePinMode(true);
    setMode('create'); // by default update
    setPin(''); // clear current written pin
  };

  const createPinMutation = useMutation({
    mutationKey: [pinSettings.createPIN.endpointKey],
    mutationFn: createPIN,
    onSuccess: () => {
      setSteps({ create_pin: 1, forgot_pin: 1 });
      setMode(null);
      setPin('');
      setNewPin('');
      setConfirmNewPin('');
      setOtp('');
      setIsActivateUpdatePinMode(false);
      setIsPINError(false);
      toast.success(translationsUpdatePIN('success_messages.pin_created'));
      queryClient.invalidateQueries(pinSettings.checkPINStatus.endpointKey);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || translations('error_messages.common'),
      );
    },
  });

  const generateOtpMutation = useMutation({
    mutationKey: [pinSettings.generateOTP.endpointKey],
    mutationFn: generateOTP,
    onSuccess: () => {
      toast.success(translationsUpdatePIN('success_messages.otp_sent'));
      setIsActivateUpdatePinMode(true);
      setMode('forgot'); // by default update
      setPin(''); // clear current written pin
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          translationsUpdatePIN('error_messages.common'),
      );
    },
  });

  const verifyOtpMutation = useMutation({
    mutationKey: [pinSettings.verifyOTP.endpointKey],
    mutationFn: verifyOTP,
    onSuccess: () => {
      toast.success(translationsUpdatePIN('success_messages.otp_verified'));
      setSteps((prev) => ({ ...prev, forgot_pin: 2 }));
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          translationsUpdatePIN('error_messages.common'),
      );
    },
  });

  const resetPinMutation = useMutation({
    mutationKey: [pinSettings.resetPIN.endpointKey],
    mutationFn: resetPIN,
    onSuccess: () => {
      toast.success(translationsUpdatePIN('success_messages.pin_updated'));
      setSteps({ create_pin: 1, forgot_pin: 1 });
      setMode(null);
      setPin('');
      setNewPin('');
      setConfirmNewPin('');
      setOtp('');
      setIsActivateUpdatePinMode(false);
      setIsPINError(false);
      // state for pin update successfully now input new pin
      setUpdateSuccessMessage(
        'Your PIN has been updated. Use the new PIN to proceed.',
      );
    },
    onError: (error) => {
      if (error?.response?.data?.error === 'REUSED_PIN') {
        setPINErrors(error?.response?.data?.error);
        toast.error('Try a new PIN — this one’s already in use.');
      } else {
        toast.error(
          error?.response?.data?.message ||
            translationsUpdatePIN('error_messages.common'),
        );
      }
    },
  });

  const handleChangeOtp = (value) => {
    const numericValue = value.replace(/\D/g, ''); // Remove non-digit characters
    setPin(numericValue);
  };

  const handleVerifiyOTP = (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      toast.error('Enter a valid PIN');
    } else {
      const updatedOrder = {
        orderId: order?.orderId || '',
        pin,
        invoiceType: order?.invoiceType || '',
      };
      handleCreateFn(updatedOrder);
    }
  };

  const stepComponents = {
    create: {
      1: (
        <StepCreatePIN
          newPin={newPin}
          setNewPin={setNewPin}
          setSteps={setSteps}
          mode={mode}
          translations={translationsUpdatePIN}
        />
      ),
      2: (
        <StepConfirmPIN
          pin={pin}
          newPin={newPin}
          confirmPin={confirmNewPin}
          setConfirmPin={setConfirmNewPin}
          mode={mode}
          isPINAvailable={false}
          createPinMutation={createPinMutation}
          translations={translationsUpdatePIN}
        />
      ),
      3: (
        <StepSuccess
          message={translations('success_messages.pin_created')}
          translations={translationsUpdatePIN}
        />
      ),
    },
    forgot: {
      1: (
        <StepEnterOTP
          otp={otp}
          setOtp={setOtp}
          verifyOtpMutation={verifyOtpMutation}
          translations={translationsUpdatePIN}
        />
      ),
      2: (
        <StepCreatePIN
          newPin={newPin}
          setNewPin={setNewPin}
          setSteps={setSteps}
          mode={mode}
          translations={translationsUpdatePIN}
        />
      ),
      3: (
        <StepConfirmPIN
          pin={pin}
          newPin={newPin}
          setNewPin={setNewPin}
          confirmPin={confirmNewPin}
          setConfirmPin={setConfirmNewPin}
          updatePINErrors={PINErrors}
          setUpdatePINErrors={setPINErrors}
          mode={mode}
          setSteps={setSteps}
          isPINAvailable={pinStatus?.pinExists}
          resetPinMutation={resetPinMutation}
          translations={translationsUpdatePIN}
        />
      ),
    },
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isActiveUpdatePinMode && (
        <DialogContent className="max-h-[40rem] overflow-hidden">
          <DialogTitle>Enter a PIN</DialogTitle>
          <form
            onSubmit={handleVerifiyOTP}
            className="z-20 flex flex-col items-center justify-center gap-5 p-5"
          >
            <div className="flex w-full flex-col gap-2">
              <h2 className="w-full text-center text-2xl font-bold">
                {translations('infoText.title')}
              </h2>
              <p className="text-center text-sm">
                {pinStatus?.pinExists ? (
                  translations('infoText.pin_exist_info')
                ) : (
                  <>
                    {translations('infoText.pin_not_exist_info')}{' '}
                    <span
                      className="cursor-pointer text-primary underline hover:text-black"
                      onClick={() => createPin()}
                    >
                      {translations('infoText.info2')}
                    </span>
                  </>
                )}
              </p>
            </div>
            <InputOTP
              name="otp"
              onChange={handleChangeOtp}
              maxLength={4}
              value={pin}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
            <Button
              size="sm"
              type="submit"
              className="w-full"
              disabled={isPendingInvoice}
              tabIndex={0}
            >
              {isPendingInvoice ? <Loading /> : translations('ctas.verify')}
            </Button>

            {isPINError && (
              <button
                className="cursor-pointer text-sm font-semibold hover:underline"
                onClick={() => {
                  generateOtpMutation.mutate();
                }}
              >
                {translations('errorMsg.pin_error')}
              </button>
            )}

            {updateSuccessMessage && (
              <p className="text-sm font-semibold">{updateSuccessMessage}</p>
            )}
          </form>
        </DialogContent>
      )}

      {isActiveUpdatePinMode && (
        <DialogContent>
          <DialogTitle>
            {mode && steps[`${mode}_pin`] > 1 && (
              <MoveLeft
                size={18}
                className="cursor-pointer"
                onClick={() =>
                  setSteps((prev) => ({
                    ...prev,
                    [`${mode}_pin`]: prev[`${mode}_pin`] - 1,
                  }))
                }
              />
            )}
          </DialogTitle>
          {mode && stepComponents[mode][steps[`${mode}_pin`]]}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default PINVerifyModalOfflineOrder;
