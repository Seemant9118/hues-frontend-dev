import { OTPInput } from 'input-otp';
import { BadgeCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import Slot from '../ui/Slot';

const IS_PIN_AVAILABLE = true; // Change this based on your actual logic

const GeneratePINModal = () => {
  const [mode, setMode] = useState(null); // 'create', 'update', 'forgot'
  const [steps, setSteps] = useState({
    create_pin: 1,
    update_pin: 1,
    forgot_pin: 1,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [isHide, setIsHide] = useState(true);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSteps({ create_pin: 1, update_pin: 1, forgot_pin: 1 });
      setMode(null);
      setPin('');
      setNewPin('');
      setConfirmPin('');
      setEmail('');
      setIsHide(true);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Manage PIN
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>PIN Management</DialogTitle>

        {/* Mode Selection - ctas */}
        {!mode && (
          <div className="flex flex-col items-center gap-4">
            {!IS_PIN_AVAILABLE && (
              <Button
                size="sm"
                className="w-full"
                onClick={() => setMode('create')}
              >
                Create a PIN
              </Button>
            )}
            {IS_PIN_AVAILABLE && (
              <>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setMode('update')}
                >
                  Update PIN
                </Button>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => setMode('forgot')}
                >
                  Forgot PIN
                </Button>
              </>
            )}
          </div>
        )}

        {/* 1.CREATE PIN MODE */}
        {mode === 'create' && steps.create_pin === 1 && (
          <StepCreatePIN
            pin={pin}
            setPin={setPin}
            setSteps={setSteps}
            setIsHide={setIsHide}
            isHide={isHide}
          />
        )}
        {mode === 'create' && steps.create_pin === 2 && (
          <StepConfirmPIN
            pin={pin}
            confirmPin={confirmPin}
            setConfirmPin={setConfirmPin}
            setSteps={setSteps}
            setIsHide={setIsHide}
            isHide={isHide}
          />
        )}
        {mode === 'create' && steps.create_pin === 3 && (
          <StepSuccess message="PIN successfully created!" />
        )}

        {/* 2.UPDATE PIN MODE */}
        {mode === 'update' && steps.update_pin === 1 && (
          <StepEnterCurrentPIN
            pin={pin}
            setPin={setPin}
            setSteps={setSteps}
            isHide={isHide}
            setIsHide={setIsHide}
          />
        )}
        {mode === 'update' && steps.update_pin === 2 && (
          <StepCreatePIN
            pin={newPin}
            setPin={setNewPin}
            setSteps={setSteps}
            setIsHide={setIsHide}
            isHide={isHide}
          />
        )}
        {mode === 'update' && steps.update_pin === 3 && (
          <StepConfirmPIN
            pin={newPin}
            confirmPin={confirmPin}
            setConfirmPin={setConfirmPin}
            setSteps={setSteps}
            setIsHide={setIsHide}
            isHide={isHide}
          />
        )}
        {mode === 'update' && steps.update_pin === 4 && (
          <StepSuccess message="PIN successfully updated!" />
        )}

        {/* 3.FORGOT PIN MODE */}
        {mode === 'forgot' && steps.forgot_pin === 1 && (
          <StepEnterEmail
            email={email}
            setEmail={setEmail}
            setSteps={setSteps}
          />
        )}
        {mode === 'forgot' && steps.forgot_pin === 2 && (
          <StepVerifyEmail setSteps={setSteps} />
        )}
        {mode === 'forgot' && steps.forgot_pin === 3 && (
          <StepCreatePIN
            pin={newPin}
            setPin={setNewPin}
            setSteps={setSteps}
            setIsHide={setIsHide}
            isHide={isHide}
          />
        )}
        {mode === 'forgot' && steps.forgot_pin === 4 && (
          <StepConfirmPIN
            pin={newPin}
            confirmPin={confirmPin}
            setConfirmPin={setConfirmPin}
            setSteps={setSteps}
            setIsHide={setIsHide}
            isHide={isHide}
          />
        )}
        {mode === 'forgot' && steps.forgot_pin === 5 && (
          <StepSuccess message="PIN successfully updated!" />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GeneratePINModal;

/* STEP HELPER COMPONENTS */
const StepCreatePIN = ({ pin, setPin, setSteps, setIsHide, isHide }) => (
  <div className="flex flex-col items-center gap-4">
    <h1 className="text-xl font-bold">Create a New PIN</h1>
    <p className="w-full text-center text-sm text-[#A5ABBD]">
      Set a PIN to add more security
    </p>

    {/* OTP Input with slots */}
    <OTPInput
      name="new_pin"
      onChange={setPin}
      maxLength={4}
      value={pin}
      containerClassName="group flex items-center has-[:disabled]:opacity-30"
      render={({ slots }) => (
        <div className="flex gap-4">
          {slots.map((slot) => (
            <Slot key={slot} {...slot} hiddenPin={isHide} />
          ))}
        </div>
      )}
    />

    <span
      className="hover-underline cursor-pointer"
      onClick={() => setIsHide((prev) => !prev)}
    >
      {isHide ? 'Show' : 'Hide'}
    </span>

    <Button
      size="sm"
      className="w-full"
      onClick={() => {
        setSteps((s) => ({
          ...s,
          create_pin: 2,
          update_pin: 3,
          forgot_pin: 4,
        }));
        setIsHide((prev) => !prev);
      }}
      disabled={pin.length < 4}
    >
      Next
    </Button>
  </div>
);

const StepConfirmPIN = ({
  pin,
  confirmPin,
  setConfirmPin,
  setSteps,
  setIsHide,
  isHide,
}) => (
  <div className="flex flex-col items-center gap-4">
    <h1 className="text-xl font-bold">Confirm PIN</h1>
    <p className="w-full text-center text-sm text-[#A5ABBD]">
      Confirm PIN to proceed safely
    </p>
    {/* OTP Input with slots */}
    <OTPInput
      name="new_pin"
      onChange={setConfirmPin}
      maxLength={4}
      value={confirmPin}
      containerClassName="group flex items-center has-[:disabled]:opacity-30"
      render={({ slots }) => (
        <div className="flex gap-4">
          {slots.map((slot) => (
            <Slot key={slot} {...slot} hiddenPin={isHide} />
          ))}
        </div>
      )}
    />

    <span
      className="hover-underline cursor-pointer"
      onClick={() => setIsHide((prev) => !prev)}
    >
      {isHide ? 'Show' : 'Hide'}
    </span>
    <Button
      size="sm"
      className="w-full"
      onClick={() => {
        pin === confirmPin
          ? setSteps((s) => ({
              ...s,
              create_pin: 3,
              update_pin: 4,
              forgot_pin: 5,
            }))
          : toast.error('PINs do not match!');
        setIsHide((prev) => !prev);
      }}
      disabled={confirmPin.length < 4}
    >
      Confirm
    </Button>
  </div>
);

const StepEnterCurrentPIN = ({ pin, setPin, setSteps, isHide, setIsHide }) => (
  <div className="flex flex-col items-center gap-4">
    <h1 className="text-xl font-bold">Enter Current PIN</h1>
    <p className="w-full text-center text-sm text-[#A5ABBD]">
      Enter your current PIN to proceed
    </p>
    {/* OTP Input with slots */}
    <OTPInput
      name="new_pin"
      onChange={setPin}
      maxLength={4}
      value={pin}
      containerClassName="group flex items-center has-[:disabled]:opacity-30"
      render={({ slots }) => (
        <div className="flex gap-4">
          {slots.map((slot) => (
            <Slot key={slot} {...slot} hiddenPin={isHide} />
          ))}
        </div>
      )}
    />

    <span
      className="cursor-pointer text-sm font-bold hover:underline"
      onClick={() => setIsHide((prev) => !prev)}
    >
      {isHide ? 'Show' : 'Hide'}
    </span>
    <Button
      size="sm"
      className="w-full"
      onClick={() => {
        setSteps((s) => ({ ...s, update_pin: 2 }));
        setIsHide((prev) => !prev);
      }}
      disabled={pin.length < 4}
    >
      Next
    </Button>
  </div>
);

const StepEnterEmail = ({ email, setEmail, setSteps }) => (
  <div className="flex flex-col items-center gap-4">
    <h1 className="text-xl font-bold">Enter your Registered mail id?</h1>
    <p className="w-full text-center text-sm text-[#A5ABBD]">
      Enter the mail address used to register to Hues
    </p>
    <Input
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Enter your email"
    />
    <Button
      size="sm"
      className="w-full"
      onClick={() => setSteps((s) => ({ ...s, forgot_pin: 2 }))}
      disabled={!email}
    >
      Proceed
    </Button>
  </div>
);

const StepVerifyEmail = ({ setSteps }) => (
  <div className="flex flex-col items-center gap-4">
    <h1 className="text-xl font-bold">Verify Email Id</h1>
    <p className="w-full text-center text-sm text-[#A5ABBD]">
      A verification link in sent to your email address. Check your inbox and
      verify your account to proceed
    </p>
    <Button
      size="sm"
      className="w-full"
      onClick={() => setSteps((s) => ({ ...s, forgot_pin: 3 }))}
    >
      Continue
    </Button>
  </div>
);

const StepSuccess = ({ message }) => (
  <div className="flex flex-col items-center gap-4">
    <BadgeCheck size={60} className="text-primary" />
    <h1 className="text-xl font-bold">{message}</h1>
    <p className="w-full text-center text-sm text-[#A5ABBD]">
      You can now use it to authorize actions securely
    </p>
  </div>
);
