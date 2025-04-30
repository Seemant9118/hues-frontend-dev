import { pinSettings } from '@/api/pinsettings/pinsettingApi';
import { checkPINStatus } from '@/services/Pin_Setting_Services/Pin_Settings_Services';
import { useQuery } from '@tanstack/react-query';
import { OTPInput } from 'input-otp';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import Slot from '../ui/Slot';

const PINVerifyModal = ({
  open,
  setOpen,
  order,
  customerRemarks,
  socialLinks,
  bankAccountId,
  handleCreateFn,
  isPINError,
}) => {
  const translations = useTranslations('components.generate_invoice_modal_otp');
  const router = useRouter();
  const [pin, setPin] = useState('');

  const { data: pinStatus } = useQuery({
    queryKey: [pinSettings.checkPINStatus.endpointKey],
    queryFn: () => checkPINStatus(),
    select: (data) => data.data.data,
    enabled: !!open,
  });

  const handleChangeOtp = (value) => setPin(value);

  const handleVerifiyOTP = (e) => {
    e.preventDefault();
    if (pin.length < 4) {
      toast.error('Enter a valid PIN');
    } else {
      const updatedOrder = {
        ...order,
        customerRemarks,
        socialLinks,
        bankAccountId,
        pin,
      };
      handleCreateFn(updatedOrder);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
                    onClick={() => router.push('/settings?tab=pinSettings')}
                  >
                    {translations('infoText.info2')}
                  </span>
                </>
              )}
            </p>
          </div>

          <OTPInput
            name="otp"
            onChange={handleChangeOtp}
            maxLength={4}
            value={pin}
            containerClassName="group flex items-center has-[:disabled]:opacity-30"
            render={({ slots }) => (
              <div className="flex gap-4">
                {slots.map((slot) => (
                  <Slot key={uuidv4()} {...slot} />
                ))}
              </div>
            )}
          />
          <Button size="sm" type="submit" className="w-full">
            {translations('ctas.verify')}
          </Button>

          {isPINError && (
            <p
              className="cursor-pointer text-sm font-semibold hover:underline"
              onClick={() => router.push('/settings?tab=pinSettings')}
            >
              {translations('errorMsg.pin_error')}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PINVerifyModal;
