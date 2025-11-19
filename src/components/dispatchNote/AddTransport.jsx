'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { addTransporterToDispatchNote } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Select from 'react-select';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import AddModal from '../Modals/AddModal';

export default function AddTransport({
  //   triggerLabel = 'Select Transporter',
  transportOptions = [],
  translations,
  dispatchNoteId,
  isModalOpen,
  setIsModalOpen,
  isAddingNewTransport,
  setIsAddingNewTransport,
  isEditMode = false, // NEW
  transportedEnterpriseId,
  createVendor,
  getStylesForSelectComponent,
}) {
  const queryClient = useQueryClient();

  const [transporter, setTransporter] = useState(null);

  useEffect(() => {
    if (isEditMode && transportedEnterpriseId && !transporter) {
      const preSelected = transportOptions?.find(
        (o) => o.value === transportedEnterpriseId,
      );
      if (preSelected) {
        setTransporter({
          transporterId: preSelected.value,
          selectedValue: preSelected,
        });
      }
    }
  }, [isEditMode, transportOptions]);

  // addTransportedMutation
  const addTransportedMutation = useMutation({
    mutationFn: addTransporterToDispatchNote,
    onSuccess: () => {
      const successMessage = isEditMode
        ? translations('overview_inputs.toast.successEdit')
        : translations('overview_inputs.toast.successAdd');
      toast.success(successMessage);

      setIsModalOpen(false);
      setTransporter(null);
      queryClient.invalidateQueries({
        queryKey: [deliveryProcess.getDispatchNote.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(
        error.response.data.message ||
          translations('overview_inputs.toast.error'),
      );
    },
  });

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? translations('overview_inputs.editTransporter')
              : translations('overview_inputs.transporter')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Transporter Select */}
          <Select
            name="transporter"
            placeholder={translations('overview_inputs.transporter')}
            options={transportOptions}
            styles={getStylesForSelectComponent()}
            className="max-w-full text-sm"
            classNamePrefix="select"
            value={transporter ? transporter.selectedValue : null}
            onChange={(selectedOption) => {
              if (!selectedOption) return;

              if (selectedOption.value === 'add-new-vendor') {
                setIsAddingNewTransport(true);
                return;
              }

              // Update state correctly
              setTransporter({
                transporterId: selectedOption.value,
                selectedValue: selectedOption,
              });

              setIsAddingNewTransport(false);
            }}
          />

          {/* Add Vendor Modal */}
          {isAddingNewTransport && (
            <AddModal
              type={isEditMode ? 'Edit' : 'Add'}
              cta="vendor"
              btnName={
                isEditMode
                  ? translations('overview_inputs.ctas.edit')
                  : translations('overview_inputs.ctas.add')
              }
              mutationFunc={createVendor}
              isOpen={isAddingNewTransport}
              setIsOpen={setIsAddingNewTransport}
            />
          )}
        </div>

        {/* Footer Buttons */}
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsModalOpen(false);
              setIsAddingNewTransport(false);
              setTransporter(null);
            }}
          >
            {translations('overview_inputs.ctas.cancel')}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              // Save only if selected
              if (!transporter) return;
              addTransportedMutation.mutate({
                dispatchNoteId,
                data: {
                  transporterId: transporter.transporterId,
                },
              });
            }}
          >
            {isEditMode
              ? translations('overview_inputs.ctas.edit')
              : translations('overview_inputs.ctas.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
