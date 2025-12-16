import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import DynamicForm from '@/components/DynamicForm/DynamicForm';
import {
  validateBookingRow,
  validateDynamicForm,
} from '@/components/DynamicForm/validators';
import AddModal from '@/components/Modals/AddModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import DynamicPdfPreviewLayout from '@/components/pdf/DynamicPdfPreviewLayout';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { generateDeliveryChallan } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import {
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { addressAPIs } from '@/api/addressApi/addressApis';
import { getAddressByEnterprise } from '@/services/address_Services/AddressServices';
import AddNewAddress from '@/components/enterprise/AddNewAddress';
import { settingsAPI } from '@/api/settings/settingsApi';
import { addUpdateAddress } from '@/services/Settings_Services/SettingsService';
import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { useBookingColumns } from './useBookingColumns';

export const FormSchema = [
  {
    type: 'radio',
    label: 'Is EWB required?',
    name: 'isEWBRequired',
    options: [
      { label: 'Yes', value: 'true' },
      { label: 'No', value: 'false' },
    ],
  },

  {
    type: 'radio',
    label: 'Movement type',
    name: 'movementType',
    options: [
      {
        label: 'Internal logistics (stock transfer / repositioning)',
        value: 'Internal logistics (stock transfer / repositioning)',
      },
      {
        label: 'Supply for sale (final delivery to customer)',
        value: 'Supply for sale (final delivery to customer)',
      },
    ],
  },
  { headLabel: 'Leg Details' },
  {
    type: 'select',
    label: 'Leg from',
    name: 'legFrom',
    placeholder: 'Select origin',
    options: [
      { label: 'LR', value: 'LR' },
      { label: 'LB', value: 'LB' },
      { label: 'Airway', value: 'AIRWAY' },
      { label: 'Railway', value: 'RAILWAY' },
    ],
  },
  {
    type: 'select',
    label: 'Leg To',
    name: 'legTo',
    placeholder: 'Select destination',
    options: [
      { label: 'LR', value: 'LR' },
      { label: 'LB', value: 'LB' },
      { label: 'Airway', value: 'AIRWAY' },
      { label: 'Railway', value: 'RAILWAY' },
    ],
  },

  {
    type: 'select',
    label: 'Mode of transport',
    name: 'transMode',
    placeholder: 'Select mode',
    options: [
      { label: 'Road', value: 'ROAD' },
      { label: 'Ship', value: 'SHIP' },
      { label: 'Air', value: 'AIR' },
      { label: 'Rail', value: 'RAIL' },
    ],
  },
  {
    type: 'select',
    label: 'Transporter',
    name: 'transporterEnterpriseId',
    placeholder: 'Select transporter',
  },
  {
    type: 'text',
    label: 'Transporter ID (GSTIN/TRANSIN)',
    name: 'transporterId',
    placeholder: 'Enter GSTIN/TRANSIN',
  },

  { headLabel: 'Booking Details' },
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

  {
    type: 'text',
    label: 'Booking Number',
    name: 'bookingNumber',
    placeholder: 'Enter booking number',
  },
  { type: 'date', label: 'Booking Date', name: 'bookingDate' },

  {
    type: 'textarea',
    label: 'Remarks',
    name: 'remarks',
    placeholder: 'Enter remarks',
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
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const router = useRouter();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const bookingColumns = useBookingColumns({ setFormData });
  const [isAddingNewTransport, setIsAddingNewTransport] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // vendors[transporter] fetching
  const { data: transports } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res.data.data.users,
  });
  // transport options
  const transportOptions = [
    ...(transports || []).map((vendor) => {
      const value = vendor?.id;
      const label =
        vendor?.vendor?.name || vendor.invitation?.userDetails?.name;

      return { value, label };
    }),
    {
      value: null, // if no transport than user can select this"
      label: 'Self',
    },
    // Special option for "Add New Transport"
    {
      value: 'add-new-transport', // Special value for "Add New Transport"
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> {'Add new transport'}
        </span>
      ),
    },
  ];

  const addressContext = 'legAddress';
  // get addresses
  const { data: legAddress } = useQuery({
    queryKey: [addressAPIs.getAddressByEnterprise.endpointKey, enterpriseId],
    queryFn: () => getAddressByEnterprise(enterpriseId, addressContext),
    select: (res) => res.data.data,
  });

  const legAddressOptions = [
    ...(legAddress || []).map((address) => {
      const value = address?.address;
      const label = address?.address;

      return { value, label };
    }),
    // Special option for "address New Address"
    {
      value: 'add-new-address', // Special value for "Add New Address"
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> {'Add new Address'}
        </span>
      ),
    },
  ];

  const handleFieldChange = (name, value) => {
    // Handle "Add new transport"
    if (name === 'transporterEnterpriseId' && value === 'add-new-transport') {
      setIsAddingNewTransport(true);
      setFormData((prev) => ({
        ...prev,
        transporterEnterpriseId: null,
      }));
      return; // do NOT set form value
    }

    // Handle "Add new address"
    if (
      (name === 'legTo' || name === 'legFrom') &&
      value === 'add-new-address'
    ) {
      setIsAddingNewAddress(true);
      setFormData((prev) => ({
        ...prev,
        legTo: '',
        legFrom: '',
      }));
      return; // do NOT set form value
    }

    // Normal flow
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const totalAmount = Number(dispatchDetails?.totalAmount || 0);
    const totalGstAmount = Number(dispatchDetails?.totalGstAmount || 0);

    const amount = totalAmount + totalGstAmount;

    if (formData?.isEWBRequired === undefined && !Number.isNaN(amount)) {
      setFormData((prev) => ({
        ...prev,
        isEWBRequired: amount > 50000 ? 'true' : 'false',
      }));
    }
  }, [dispatchDetails, formData?.isEWBRequired]);

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
        legFrom: prev.legFrom,
        legTo: prev.legTo,
        transMode: prev.transMode,
        transporterEnterpriseId: prev.transporterEnterpriseId,
        transporterId: prev.transporterId,
        remarks: prev.remarks || '',
      };

      return {
        ...prev,
        transportBookings: [...existing, newRow],

        // Clear booking fields
        bookingType: '',
        bookingNumber: '',
        bookingDate: '',
        legFrom: '',
        legTo: '',
        transMode: '',
        transporterEnterpriseId: '',
        transporterId: '',
        remarks: '',
      };
    });

    // Clear errors after successful add
    setErrors({});
  };

  // Inject data dynamically into form schema
  const dynamicSchema = useMemo(() => {
    return FormSchema.map((field) => {
      // Inject table config
      if (field.type === 'table') {
        return {
          ...field,
          tableData: formData.transportBookings || [],
          tableColumns: bookingColumns,
        };
      }

      // Inject transporter options
      if (field.name === 'transporterEnterpriseId') {
        return {
          ...field,
          options: transportOptions,
        };
      }

      // Inject address options
      if (field.name === 'legTo' || field.name === 'legFrom') {
        return {
          ...field,
          options: legAddressOptions,
        };
      }

      return field;
    });
  }, [formData.transportBookings, bookingColumns, transportOptions]);

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
      movementType: formData?.movementType,
      isEWBRequired: formData?.isEWBRequired === 'true',
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
      {/* Add Vendor Modal */}
      {isAddingNewTransport && (
        <AddModal
          type={'Add'}
          cta="vendor"
          btnName={'Add new transport'}
          mutationFunc={createVendor}
          isOpen={isAddingNewTransport}
          setIsOpen={setIsAddingNewTransport}
        />
      )}
      {/* add new address : visible if isAddingNewAddress is true */}
      <AddNewAddress
        isLegAddressAdding={true}
        isAddressAdding={isAddingNewAddress}
        setIsAddressAdding={setIsAddingNewAddress}
        mutationKey={settingsAPI.addUpdateAddress.endpointKey}
        mutationFn={addUpdateAddress}
        invalidateKey={deliveryProcess.getDispatchNote.endpointKey}
      />
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
        onChange={handleFieldChange}
      />
    </Wrapper>
  );
}
