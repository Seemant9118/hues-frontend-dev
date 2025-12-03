import DynamicForm from '@/components/DynamicForm/DynamicForm';
import {
  validateBookingRow,
  validateDynamicForm,
} from '@/components/DynamicForm/validators';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import DynamicPdfPreviewLayout from '@/components/pdf/DynamicPdfPreviewLayout';
import Wrapper from '@/components/wrappers/Wrapper';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generateDeliveryChallan } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { toast } from 'sonner';
import { useBookingColumns } from './useBookingColumns';

export const FormSchema = [
  {
    type: 'radio',
    label: 'Is EWB required?',
    name: 'isEWBRequired',
    options: [
      { label: 'Yes', value: true },
      { label: 'No', value: false },
    ],
    // required: true,
  },

  // { type: 'checkbox', label: 'EWB is Generated ?', name: 'isEWBGenerated' },

  {
    type: 'select',
    label: 'Booking Type',
    name: 'bookingType',
    placeholder: 'Select booking type',
    options: [
      { label: 'LR', value: 'LR' },
      { label: 'LB', value: 'LB' },
      { label: 'Airway', value: 'AIRWAY' },
      { label: 'Railway', value: 'RAILWAY' },
    ],
  },

  { type: 'text', label: 'Booking Number', name: 'bookingNumber' },
  { type: 'date', label: 'Booking Date', name: 'bookingDate' },

  { type: 'textarea', label: 'Remarks', name: 'remarks' },
  { type: 'textarea', label: 'Source Address', name: 'sourceAddress' },
  {
    type: 'textarea',
    label: 'Destination Address',
    name: 'destinationAddress',
  },

  {
    type: 'table',
    name: 'transportBookings',
  },
];

export default function GenerateDCPreviewForm({
  dispatchNoteId,
  dispatchDetails,
  url,
  breadcrumb,
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const bookingColumns = useBookingColumns({ setFormData });

  const handleAdd = () => {
    // Validate booking row
    const bookingErrors = validateBookingRow(formData);

    if (Object.keys(bookingErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...bookingErrors }));
      return;
    }

    // Add booking row
    setFormData((prev) => {
      const existing = prev.transportBookings || [];

      const newRow = {
        bookingType: prev.bookingType,
        bookingNumber: prev.bookingNumber,
        bookingDate: prev.bookingDate,
        sourceAddress: prev.sourceAddress,
        destinationAddress: prev.destinationAddress,
        remarks: prev.remarks || '',
      };

      return {
        ...prev,
        transportBookings: [...existing, newRow],

        // Clear booking fields
        bookingType: '',
        bookingNumber: '',
        bookingDate: '',
        sourceAddress: '',
        destinationAddress: '',
        remarks: '',
      };
    });

    // Clear errors after successful add
    setErrors({});
  };

  // Inject table data dynamically
  const dynamicSchema = useMemo(() => {
    return FormSchema.map((field) => {
      if (field.type === 'table') {
        return {
          ...field,
          tableData: formData.transportBookings || [],
          tableColumns: bookingColumns,
        };
      }
      return field;
    });
  }, [formData.transportBookings]);

  const generateDCMutation = useMutation({
    mutationFn: generateDeliveryChallan,
    onSuccess: (data) => {
      toast.success('Delivery Challan generated');
      const deliveryId = data?.data?.data?.voucherId;
      router.push(`/dashboard/transport/delivery-challan/${deliveryId}`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleCreate = () => {
    // Validate form
    const validationErrors = validateDynamicForm(dynamicSchema, formData);
    setErrors(validationErrors);

    // Stop if errors exist
    if (Object.keys(validationErrors).length > 0) return;

    // Prepare safe structured payload
    const updatedFormData = {
      dispatchNoteId: Number(dispatchNoteId),
      isEWBRequired: formData?.isEWBRequired,
      metaData: dispatchDetails || {}, // full dispatch note
      bookings: formData?.transportBookings || [], // booking rows only
    };

    // call your mutation here:
    generateDCMutation.mutate({ id: dispatchNoteId, data: updatedFormData });
  };

  return (
    <Wrapper className="h-full py-2">
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <OrderBreadCrumbs possiblePagesBreadcrumbs={breadcrumb} />
      </section>
      <DynamicPdfPreviewLayout
        schema={dynamicSchema}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        pdfUrl={url}
        isPDF={true}
        onDiscard={() => router.back()}
        onAdd={handleAdd}
        onCreate={handleCreate}
        FormComponent={DynamicForm}
      />
    </Wrapper>
  );
}
