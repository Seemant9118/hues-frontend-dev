import { pinSettings } from '@/api/pinsettings/pinsettingApi';
import {
  createPIN,
  generateOTP,
  resetPIN,
  updatePIN,
  verifyOTP,
} from '@/services/Pin_Setting_Services/Pin_Settings_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoveLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  StepConfirmPIN,
  StepCreatePIN,
  StepEnterCurrentPIN,
  StepEnterOTP,
  StepSuccess,
} from './HelperComponentsPINSettings';

const GeneratePINModal = ({ isPINAvailable }) => {
  const translations = useTranslations('components.generate_pin_modal');
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(null);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [otp, setOtp] = useState('');
  const [steps, setSteps] = useState({
    create_pin: 1,
    update_pin: 1,
    forgot_pin: 1,
  });

  useEffect(() => {
    if (!isOpen) {
      setSteps({ create_pin: 1, update_pin: 1, forgot_pin: 1 });
      setMode(null);
      setPin('');
      setNewPin('');
      setConfirmPin('');
      setOtp('');
    }
  }, [isOpen]);

  const createPinMutation = useMutation({
    mutationKey: [pinSettings.createPIN.endpointKey],
    mutationFn: createPIN,
    onSuccess: () => {
      toast.success(translations('success_messages.pin_created'));
      setSteps((prev) => ({ ...prev, create_pin: 3 }));
      queryClient.invalidateQueries(pinSettings.checkPINStatus.endpointKey);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || translations('error_messages.common'),
      );
    },
  });

  const updatePinMutation = useMutation({
    mutationKey: [pinSettings.updatePIN.endpointKey],
    mutationFn: updatePIN,
    onSuccess: () => {
      toast.success(translations('success_messages.pin_updated'));
      setSteps((prev) => ({ ...prev, update_pin: 4 }));
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
      toast.success(translations('success_messages.otp_sent'));
      setMode('forgot');
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || translations('error_messages.common'),
      );
    },
  });

  const verifyOtpMutation = useMutation({
    mutationKey: [pinSettings.verifyOTP.endpointKey],
    mutationFn: verifyOTP,
    onSuccess: () => {
      toast.success(translations('success_messages.otp_verified'));
      setSteps((prev) => ({ ...prev, forgot_pin: 2 }));
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || translations('error_messages.common'),
      );
    },
  });

  const resetPinMutation = useMutation({
    mutationKey: [pinSettings.resetPIN.endpointKey],
    mutationFn: resetPIN,
    onSuccess: () => {
      toast.success(translations('success_messages.pin_updated'));
      setSteps((prev) => ({ ...prev, forgot_pin: 4 }));
      queryClient.invalidateQueries(pinSettings.checkPINStatus.endpointKey);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || translations('error_messages.common'),
      );
    },
  });

  const stepComponents = {
    create: {
      1: (
        <StepCreatePIN
          newPin={newPin}
          setNewPin={setNewPin}
          setSteps={setSteps}
          mode={mode}
          translations={translations}
        />
      ),
      2: (
        <StepConfirmPIN
          pin={pin}
          newPin={newPin}
          confirmPin={confirmPin}
          setConfirmPin={setConfirmPin}
          mode={mode}
          isPINAvailable={isPINAvailable}
          createPinMutation={createPinMutation}
          updatePinMutation={updatePinMutation}
          resetPinMutation={resetPinMutation}
          translations={translations}
        />
      ),
      3: (
        <StepSuccess
          message={translations('success_messages.pin_created')}
          translations={translations}
        />
      ),
    },
    update: {
      1: (
        <StepEnterCurrentPIN
          pin={pin}
          setPin={setPin}
          setSteps={setSteps}
          generateOtpMutation={generateOtpMutation}
          translations={translations}
        />
      ),
      2: (
        <StepCreatePIN
          newPin={newPin}
          setNewPin={setNewPin}
          setSteps={setSteps}
          mode={mode}
          translations={translations}
        />
      ),
      3: (
        <StepConfirmPIN
          pin={pin}
          newPin={newPin}
          confirmPin={confirmPin}
          setConfirmPin={setConfirmPin}
          mode={mode}
          isPINAvailable={isPINAvailable}
          createPinMutation={createPinMutation}
          updatePinMutation={updatePinMutation}
          resetPinMutation={resetPinMutation}
          translations={translations}
        />
      ),
      4: (
        <StepSuccess
          message={translations('success_messages.pin_updated')}
          translations={translations}
        />
      ),
    },
    forgot: {
      1: (
        <StepEnterOTP
          otp={otp}
          setOtp={setOtp}
          verifyOtpMutation={verifyOtpMutation}
          translations={translations}
        />
      ),
      2: (
        <StepCreatePIN
          newPin={newPin}
          setNewPin={setNewPin}
          setSteps={setSteps}
          mode={mode}
          translations={translations}
        />
      ),
      3: (
        <StepConfirmPIN
          pin={pin}
          newPin={newPin}
          confirmPin={confirmPin}
          setConfirmPin={setConfirmPin}
          mode={mode}
          isPINAvailable={isPINAvailable}
          createPinMutation={createPinMutation}
          updatePinMutation={updatePinMutation}
          resetPinMutation={resetPinMutation}
          translations={translations}
        />
      ),
      4: (
        <StepSuccess
          message={translations('success_messages.pin_updated')}
          translations={translations}
        />
      ),
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex w-full items-center justify-between gap-2 rounded-md border p-4">
        <div className="flex flex-col items-start gap-1 text-sm">
          <p className="font-bold">
            {isPINAvailable
              ? translations('update_pin')
              : translations('create_pin')}
          </p>
          <p className="text-gray-400">{translations('pin_description')}</p>
        </div>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="blue_outline"
            onClick={() => setMode(isPINAvailable ? 'update' : 'create')}
          >
            {isPINAvailable
              ? translations('buttons.update')
              : translations('buttons.create')}
          </Button>
        </DialogTrigger>
      </div>

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
    </Dialog>
  );
};

export default GeneratePINModal;
