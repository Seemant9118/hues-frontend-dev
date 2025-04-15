import { OTPInput } from 'input-otp';
import { BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import Slot from '../ui/Slot';

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
      <OTPInput
        name="new_pin"
        onChange={(value) => setNewPin(value)}
        maxLength={4}
        value={newPin}
        containerClassName="group flex items-center has-[:disabled]:opacity-30"
        render={({ slots }) => (
          <div className="flex gap-4">
            {slots.map((slot) => (
              <Slot key={uuidv4} {...slot} />
            ))}
          </div>
        )}
      />
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
  confirmPin,
  setConfirmPin,
  mode,
  isPINAvailable,
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
      <OTPInput
        name="confirm_pin"
        onChange={(value) => setConfirmPin(value)}
        maxLength={4}
        value={confirmPin}
        containerClassName="group flex items-center has-[:disabled]:opacity-30"
        render={({ slots }) => (
          <div className="flex gap-4">
            {slots.map((slot) => (
              <Slot key={uuidv4()} {...slot} />
            ))}
          </div>
        )}
      />
      <Button
        size="sm"
        className="w-full"
        onClick={handleConfirm}
        disabled={confirmPin.length < 4}
      >
        {translations('helper_components.buttons.confirm')}
      </Button>
    </div>
  );
};

export const StepEnterCurrentPIN = ({
  pin,
  setPin,
  setSteps,
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
      <OTPInput
        name="current_pin"
        onChange={(value) => setPin(value)}
        maxLength={4}
        value={pin}
        containerClassName="group flex items-center has-[:disabled]:opacity-30"
        render={({ slots }) => (
          <div className="flex gap-4">
            {slots.map((slot) => (
              <Slot key={uuidv4} {...slot} />
            ))}
          </div>
        )}
      />
      <Button
        size="sm"
        className="w-full"
        onClick={() => setSteps((prev) => ({ ...prev, update_pin: 2 }))}
        disabled={pin.length < 4}
      >
        {translations('helper_components.buttons.next')}
      </Button>
      <span
        className="cursor-pointer text-sm font-bold hover:underline"
        onClick={() => generateOtpMutation.mutate()}
      >
        {translations('helper_components.messages.forgot_pin')}
      </span>
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
      <OTPInput
        name="otp"
        onChange={(value) => setOtp(value)}
        maxLength={4}
        value={otp}
        containerClassName="group flex items-center has-[:disabled]:opacity-30"
        render={({ slots }) => (
          <div className="flex gap-4">
            {slots.map((slot) => (
              <Slot key={uuidv4} {...slot} />
            ))}
          </div>
        )}
      />
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
