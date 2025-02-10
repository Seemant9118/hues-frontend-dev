'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ConfirmAction = ({
  deleteCta,
  cancelCta,
  infoText,
  id,
  type,
  invalidateKey,
  mutationKey,
  mutationFunc,
  successMsg,
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationKey: [mutationKey],
    mutationFn: mutationFunc,
    onSuccess: () => {
      toast.success(successMsg);
      setOpen(false);
      queryClient.invalidateQueries([invalidateKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        <button
          className={cn(
            'relative flex w-full cursor-pointer select-none items-center justify-center gap-2 rounded-sm px-2 py-1.5 text-sm text-red-500 outline-none transition-colors hover:bg-red-100 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
          )}
        >
          <Trash2 size={12} />
          {deleteCta}
        </button>
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center justify-center gap-5">
        <DialogTitle>
          <div className="flex w-full flex-col items-center gap-2">
            <span>{infoText}</span>
          </div>
        </DialogTitle>

        <div className="mt-auto flex items-center justify-end gap-4">
          <DialogClose asChild>
            <Button
              size="sm"
              onClick={() => {
                setOpen(false);
              }}
              variant={'outline'}
            >
              {cancelCta}
            </Button>
          </DialogClose>
          <Button
            size="sm"
            onClick={() => {
              deleteMutation.mutate({ id, type });
            }}
          >
            {deleteCta}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmAction;
