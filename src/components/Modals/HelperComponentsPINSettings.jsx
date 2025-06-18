import { BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import Loading from '../ui/Loading';

/* STEP HELPER COMPONENTS */
export const StepCreatePIN = ({
  newPin,
  setNewPin,
  setSteps,
  mode,
  translations,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-xl font-bold">
        {translations('helper_components.titles.create_pin')}
      </h1>
      <p className="w-full text-center text-sm text-[#A5ABBD]">
        {translations('helper_components.descriptions.create_pin')}
      </p>
      <InputOTP
        name="new_pin"
        onChange={(value) => setNewPin(value)}
        maxLength={4}
        value={newPin}
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
        className="w-full"
        onClick={() => {
          if (mode === 'create') {
            setSteps((prev) => ({ ...prev, [`${mode}_pin`]: 2 }));
          } else {
            setSteps((prev) => ({ ...prev, [`${mode}_pin`]: 3 }));
          }
        }}
        disabled={newPin.length < 4}
      >
        {translations('helper_components.buttons.next')}
      </Button>
    </div>
  );
};
export const StepConfirmPIN = ({
  pin,
  newPin,
  setNewPin,
  confirmPin,
  setConfirmPin,
  mode,
  setSteps,
  isPINAvailable,
  updatePINErrors,
  setUpdatePINErrors,
  createPinMutation,
  updatePinMutation,
  resetPinMutation,
  translations,
}) => {
  const handleConfirm = () => {
    if (newPin !== confirmPin) {
      toast.error(translations('helper_components.messages.pin_mismatch'));
      return;
    }

    if (mode === 'create' || mode === 'update') {
      if (isPINAvailable) {
        updatePinMutation.mutate({ previousPin: pin, pin: confirmPin });
      } else {
        createPinMutation.mutate({ pin: confirmPin });
      }
    } else {
      resetPinMutation.mutate({ pin: confirmPin });
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-xl font-bold">
        {translations('helper_components.titles.confirm_pin')}
      </h1>
      <p className="w-full text-center text-sm text-[#A5ABBD]">
        {translations('helper_components.descriptions.confirm_pin')}
      </p>
      <InputOTP
        name="confirm_pin"
        onChange={(value) => setConfirmPin(value)}
        maxLength={4}
        value={confirmPin}
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
        className="w-full"
        onClick={handleConfirm}
        disabled={confirmPin.length < 4}
      >
        {translations('helper_components.buttons.confirm')}
      </Button>

      {updatePINErrors === 'REUSED_PIN' && (
        <button
          className="cursor-pointer text-sm font-bold hover:underline"
          onClick={() => {
            setSteps((prev) => ({ ...prev, update_pin: 2, forgot_pin: 2 }));
            setConfirmPin('');
            setNewPin('');
            setUpdatePINErrors(null);
          }}
        >
          {translations('helper_components.messages.try_new_pin')}
        </button>
      )}
    </div>
  );
};

export const StepEnterCurrentPIN = ({
  pin,
  setPin,
  verifyPINErrors,
  verifyPinMutation,
  generateOtpMutation,
  translations,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-xl font-bold">
        {translations('helper_components.titles.enter_current_pin')}
      </h1>
      <p className="w-full text-center text-sm text-[#A5ABBD]">
        {translations('helper_components.descriptions.enter_current_pin')}
      </p>
      <InputOTP
        name="current_pin"
        onChange={(value) => setPin(value)}
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
        className="w-full"
        onClick={() => verifyPinMutation.mutate({ pin })}
        disabled={pin.length < 4 || verifyPinMutation?.isPending}
      >
        {verifyPinMutation?.isPending ? (
          <Loading />
        ) : (
          translations('helper_components.buttons.verify')
        )}
      </Button>
      {verifyPINErrors === 'INVALID_PIN' && (
        <button
          className="cursor-pointer text-sm font-bold hover:underline"
          onClick={() => generateOtpMutation.mutate()}
        >
          {translations('helper_components.messages.forgot_pin')}
        </button>
      )}
    </div>
  );
};

export const StepEnterOTP = ({
  otp,
  setOtp,
  verifyOtpMutation,
  translations,
}) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-xl font-bold">
        {translations('helper_components.titles.enter_otp')}
      </h1>
      <p className="w-full text-center text-sm text-[#A5ABBD]">
        {translations('helper_components.descriptions.enter_otp')}
      </p>

      <InputOTP
        name="otp"
        onChange={(value) => setOtp(value)}
        maxLength={4}
        value={otp}
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
        className="w-full"
        onClick={() => verifyOtpMutation.mutate({ otp })}
        disabled={otp.length < 4}
      >
        {translations('helper_components.buttons.verify')}
      </Button>
    </div>
  );
};
export const StepSuccess = ({ message, translations }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      <BadgeCheck size={60} className="text-primary" />
      <h1 className="text-xl font-bold">{message}</h1>
      <p className="w-full text-center text-sm text-[#A5ABBD]">
        {translations('helper_components.descriptions.success_message')}
      </p>
    </div>
  );
};
