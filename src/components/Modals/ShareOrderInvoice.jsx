import { getInitialsNames, getRandomBgColor } from '@/appUtils/helperFunctions';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { Check, Share2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';

const ShareOrderInvoice = ({
  heading = 'Share',
  email,
  setEmail,
  mutationFn,
  mutationKey,
  successMsg,
}) => {
  const [open, setOpen] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const [bgColor, setBgColor] = useState('');

  useEffect(() => {
    const bgColorClass = getRandomBgColor();
    setBgColor(bgColorClass);
  }, []);

  // api call
  const shareOrderMutation = useMutation({
    mutationKey: [mutationKey],
    mutationFn,
    onSuccess: () => {
      toast.success(successMsg || 'Shared Successfully');
      setIsShared(true);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Share2 size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-6">
        <DialogTitle>{heading}</DialogTitle>

        <div className="mt-5 flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex w-full flex-col gap-2">
              <Label htmlFor="email">Share by Email</Label>
              <Input
                name="email"
                type="text"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <div className="flex items-end">
              <Button
                className={cn(
                  isShared ? 'font-bold text-green-600' : '',
                  'rounded-sm',
                )}
                disabled={
                  shareOrderMutation.isLoading ||
                  isShared ||
                  email?.length === 0
                }
                onClick={() => {
                  shareOrderMutation.mutate(email);
                }}
                variant={isShared ? 'outline' : ''}
              >
                {shareOrderMutation.isLoading && <Loading />}
                {!shareOrderMutation.isLoading &&
                  (isShared ? <Check size={16} /> : 'Send')}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`${bgColor} flex h-10 w-10 items-center justify-center rounded-full p-2 text-sm text-white`}
          >
            {getInitialsNames('Seemant Kamlapuri')}
          </div>
          <span className="text-sm font-bold">{'Seemant Kamlapuri'}</span>
        </div>

        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareOrderInvoice;
