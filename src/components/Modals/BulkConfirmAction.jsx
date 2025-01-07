'use client';

import { capitalize } from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const BulkConfirmAction = ({
  infoText,
  selectedItems,
  setSelectedItems,
  setRowSelection,
  invalidateKey,
  mutationKey,
  mutationFunc,
}) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const deleteBulkMutation = useMutation({
    mutationKey: [mutationKey],
    mutationFn: mutationFunc,
    onSuccess: () => {
      toast.success('Removed successfully');
      setOpen(false);
      setSelectedItems([]); // clear state of data
      setRowSelection({}); // clear state of react table
      queryClient.invalidateQueries([invalidateKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          disabled={selectedItems?.length === 0}
          size="sm"
          variant="outline"
          className="text-red-600"
        >
          <Trash2 size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col items-center justify-center gap-5">
        <DialogTitle>
          <div className="flex w-full flex-col items-center gap-2">
            <span>{infoText}</span>
            <div className="flex max-w-sm flex-col gap-1 rounded-md bg-gray-100 p-2">
              {selectedItems?.map((item) => (
                <li className="text-sm" key={item.itemId}>
                  {`${item.name} (${capitalize(item.type)})`}
                </li>
              ))}
            </div>
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
              Cancel
            </Button>
          </DialogClose>
          <Button
            size="sm"
            onClick={() => {
              deleteBulkMutation.mutate({
                data: { catalogueItems: selectedItems },
              });
            }}
          >
            Remove
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkConfirmAction;
