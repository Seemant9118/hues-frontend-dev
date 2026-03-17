'use client';

import { addressAPIs } from '@/api/addressApi/addressApis';
import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { settingsAPI } from '@/api/settings/settingsApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import InfoBanner from '@/components/auth/InfoBanner';
import DynamicForm from '@/components/DynamicForm/DynamicForm';
import AddNewAddress from '@/components/enterprise/AddNewAddress';
import AddModal from '@/components/Modals/AddModal';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrappers/Wrapper';
import { getAddressByEnterprise } from '@/services/address_Services/AddressServices';
import {
  generateDeliveryChallan,
  getDispatchNote,
  getDispatchNotes,
} from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import {
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { addUpdateAddress } from '@/services/Settings_Services/SettingsService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const SELF_TRANSPORT_VALUE = '__self__';
const ADD_TRANSPORT_VALUE = 'add-new-transport';
const ADD_ADDRESS_VALUE = 'add-new-address';
const ADDRESS_CONTEXT = 'LEG_ADDRESS';

const createInitialState = () => ({
  dispatchNoteId: '',
  isEWBRequired: false,
  legFrom: '',
  legTo: '',
  modeOfTransport: '',
  transporterEnterpriseId: '',
  transporterId: '',
  bookingType: '',
  bookingNumber: '',
  bookingDate: null,
  remarks: '',
});

export const directDCFormSchema = [
  {
    name: 'legDetailsHeading',
    headLabel: 'Leg Details',
  },
  {
    type: 'select',
    label: 'Leg from',
    name: 'legFrom',
    placeholder: 'Select source address',
    options: [],
    required: true,
  },
  {
    type: 'select',
    label: 'Leg to',
    name: 'legTo',
    placeholder: 'Select destination',
    options: [],
    required: true,
  },
  {
    type: 'select',
    label: 'Mode of transport',
    name: 'modeOfTransport',
    placeholder: 'Select mode',
    required: true,
    options: [
      { label: 'Road - LR', value: 'ROAD' },
      { label: 'Ship - LB', value: 'SHIP' },
      { label: 'Air - Airway', value: 'AIR' },
      { label: 'Rail - Railway', value: 'RAIL' },
    ],
  },
  {
    type: 'select',
    label: 'Transporter',
    name: 'transporterEnterpriseId',
    placeholder: 'Select transporter',
    options: [],
  },
  {
    type: 'text',
    label: 'Transporter ID (GSTIN/TRANSIN)',
    name: 'transporterId',
    placeholder: 'Enter GSTIN/TRANSIN',
  },
  {
    name: 'bookingDetailsHeading',
    headLabel: 'Booking Details',
  },
  {
    type: 'select',
    label: 'Booking Type',
    name: 'bookingType',
    placeholder: 'Select booking type',
    disabled: true,
    required: true,
    options: [
      { label: 'Lorry receipt', value: 'LR' },
      { label: 'Lading Bill', value: 'LB' },
      { label: 'Airway', value: 'AIRWAY' },
      { label: 'Railway', value: 'RAILWAY' },
    ],
  },
  {
    type: 'text',
    label: 'Booking Number',
    name: 'bookingNumber',
    placeholder: 'Enter booking number',
    required: true,
  },
  {
    type: 'date',
    label: 'Booking Date',
    name: 'bookingDate',
    required: true,
  },
  {
    type: 'textarea',
    label: 'Remarks',
    name: 'remarks',
    placeholder: 'Enter remarks',
  },
];

const getDefaultLegFrom = (dispatchDetails) => {
  const transportBookings = dispatchDetails?.transportBookings || [];
  const lastBooking = transportBookings[transportBookings.length - 1];

  return (
    lastBooking?.legTo || dispatchDetails?.dispatchFromAddress?.address || ''
  );
};

const getBookingTypeByTransportMode = (mode) => {
  const bookingTypeMap = {
    ROAD: 'LR',
    SHIP: 'LB',
    AIR: 'AIRWAY',
    RAIL: 'RAILWAY',
  };

  return bookingTypeMap[mode] || '';
};

const DirectDC = ({ setIsOpen }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const enterpriseId = getEnterpriseId();

  const [formData, setFormData] = useState(createInitialState);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isAddingNewTransport, setIsAddingNewTransport] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  const selectedDispatchNoteId = formData.dispatchNoteId
    ? Number(formData.dispatchNoteId)
    : null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const { data: dispatchNotesData } = useQuery({
    queryKey: [
      deliveryProcess.getDispatchNotes.endpointKey,
      enterpriseId,
      debouncedSearch,
    ],
    queryFn: () =>
      getDispatchNotes({
        enterpriseId,
        page: 1,
        limit: 10,
        searchString: debouncedSearch || undefined,
      }),
    enabled: !!enterpriseId,
    select: (res) => res?.data?.data,
  });

  const dispatchNotes = dispatchNotesData?.data || [];

  const { data: dispatchDetails, isLoading: isDispatchDetailsLoading } =
    useQuery({
      queryKey: [
        deliveryProcess.getDispatchNote.endpointKey,
        selectedDispatchNoteId,
      ],
      queryFn: () => getDispatchNote(selectedDispatchNoteId),
      enabled: !!selectedDispatchNoteId,
      select: (res) => res?.data?.data,
    });

  const { data: transports = [] } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey, enterpriseId],
    queryFn: () => getVendors({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res?.data?.data?.users || [],
    enabled: !!enterpriseId,
  });

  const transportOptions = useMemo(() => {
    const mappedTransports = transports.map((vendor) => ({
      value: String(vendor?.id),
      label:
        vendor?.vendor?.name || vendor?.invitation?.userDetails?.name || '-',
      vendorTransporterId: vendor?.vendor?.gstNumber || '',
    }));

    return [
      ...mappedTransports,
      {
        value: SELF_TRANSPORT_VALUE,
        label: 'Self',
      },
      {
        value: ADD_TRANSPORT_VALUE,
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-black">
            <Plus size={14} /> Add new transport
          </span>
        ),
      },
    ];
  }, [transports]);

  const { data: legAddresses = [] } = useQuery({
    queryKey: [
      addressAPIs.getAddressByEnterprise.endpointKey,
      dispatchDetails?.buyerId,
      ADDRESS_CONTEXT,
    ],
    queryFn: () =>
      getAddressByEnterprise(dispatchDetails?.buyerId, ADDRESS_CONTEXT),
    select: (res) => res?.data?.data || [],
    enabled: !!dispatchDetails?.buyerId,
  });

  const legAddressOptions = useMemo(() => {
    const mappedAddresses = legAddresses.map((address) => ({
      value: address?.address,
      label: address?.address,
    }));

    return [
      ...mappedAddresses,
      {
        value: ADD_ADDRESS_VALUE,
        label: (
          <span className="flex items-center gap-2 text-xs font-semibold text-black">
            <Plus size={14} /> Add new address
          </span>
        ),
      },
    ];
  }, [legAddresses]);

  const legFromOptions = useMemo(() => {
    if (!formData.legFrom) return legAddressOptions;

    const hasCurrentLegFrom = legAddressOptions.some(
      (option) => option.value === formData.legFrom,
    );

    if (hasCurrentLegFrom) return legAddressOptions;

    return [
      {
        value: formData.legFrom,
        label: formData.legFrom,
      },
      ...legAddressOptions,
    ];
  }, [formData.legFrom, legAddressOptions]);

  useEffect(() => {
    if (!dispatchDetails) return;

    const totalAmount = Number(dispatchDetails?.totalAmount || 0);
    const totalGstAmount = Number(dispatchDetails?.totalGstAmount || 0);

    setFormData((prev) => ({
      ...prev,
      isEWBRequired: totalAmount + totalGstAmount > 50000,
      legFrom: getDefaultLegFrom(dispatchDetails),
    }));
  }, [dispatchDetails]);

  const dynamicSchema = useMemo(() => {
    const schemaWithDynamicOptions = directDCFormSchema.map((field) => {
      if (field.name === 'transporterEnterpriseId') {
        return {
          ...field,
          options: transportOptions,
        };
      }

      if (field.name === 'legFrom' || field.name === 'legTo') {
        return {
          ...field,
          options:
            field.name === 'legFrom' ? legFromOptions : legAddressOptions,
          disabled: field.name === 'legFrom',
        };
      }

      return field;
    });

    if (formData.transporterEnterpriseId === SELF_TRANSPORT_VALUE) {
      return schemaWithDynamicOptions.filter(
        (field) => field.name !== 'transporterId',
      );
    }

    return schemaWithDynamicOptions;
  }, [
    formData.transporterEnterpriseId,
    legAddressOptions,
    legFromOptions,
    transportOptions,
  ]);

  const handleDispatchNoteChange = (value) => {
    setErrors({});
    setFormData({
      ...createInitialState(),
      dispatchNoteId: value,
    });
  };

  const handleFieldChange = (name, value) => {
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    if (name === 'transporterEnterpriseId' && value === ADD_TRANSPORT_VALUE) {
      setIsAddingNewTransport(true);
      return;
    }

    if (name === 'legTo' && value === ADD_ADDRESS_VALUE) {
      setIsAddingNewAddress(true);
      return;
    }

    if (name === 'modeOfTransport') {
      setFormData((prev) => ({
        ...prev,
        modeOfTransport: value,
        bookingType: getBookingTypeByTransportMode(value),
      }));
      return;
    }

    if (name === 'transporterEnterpriseId') {
      if (value === SELF_TRANSPORT_VALUE) {
        setFormData((prev) => ({
          ...prev,
          transporterEnterpriseId: SELF_TRANSPORT_VALUE,
          transporterId: '',
        }));
        return;
      }

      const selectedTransport = transportOptions.find(
        (option) => option.value === value,
      );

      setFormData((prev) => ({
        ...prev,
        transporterEnterpriseId: value,
        transporterId: selectedTransport?.vendorTransporterId || '',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.dispatchNoteId) {
      validationErrors.dispatchNoteId = 'Dispatch note is required';
    }

    if (!formData.legFrom) {
      validationErrors.legFrom = 'Leg from is required';
    }

    if (!formData.legTo) {
      validationErrors.legTo = 'Leg to is required';
    }

    if (!formData.modeOfTransport) {
      validationErrors.modeOfTransport = 'Mode of transport is required';
    }

    if (!formData.bookingType) {
      validationErrors.bookingType = 'Booking type is required';
    }

    if (!formData.bookingNumber?.trim()) {
      validationErrors.bookingNumber = 'Booking number is required';
    }

    if (!formData.bookingDate) {
      validationErrors.bookingDate = 'Booking date is required';
    }

    if (
      formData.transporterEnterpriseId &&
      formData.transporterEnterpriseId !== SELF_TRANSPORT_VALUE &&
      !formData.transporterId?.trim()
    ) {
      validationErrors.transporterId = 'Transporter ID is required';
    }

    return validationErrors;
  };

  const buildPayload = () => {
    const transporterEnterpriseId =
      formData.transporterEnterpriseId &&
      formData.transporterEnterpriseId !== SELF_TRANSPORT_VALUE
        ? Number(formData.transporterEnterpriseId) ||
          formData.transporterEnterpriseId
        : null;

    return {
      dispatchNoteId: Number(formData.dispatchNoteId),
      isEWBRequired: formData.isEWBRequired,
      buyerId: dispatchDetails?.buyerId || null,
      buyerType: dispatchDetails?.buyerType || null,
      metaData: dispatchDetails || {},
      bookings: [
        {
          isEWBRequired: formData.isEWBRequired,
          legFrom: formData.legFrom || '',
          legTo: formData.legTo || '',
          modeOfTransport: formData.modeOfTransport || '',
          bookingType: formData.bookingType || '',
          bookingNumber: formData.bookingNumber?.trim() || '',
          bookingDate: formData.bookingDate
            ? moment(formData.bookingDate).format('YYYY-MM-DD')
            : '',
          transporterEnterpriseId,
          transporterId: transporterEnterpriseId
            ? formData.transporterId?.trim() || ''
            : '',
          remarks: formData.remarks?.trim() || '',
        },
      ],
    };
  };

  const generateDCMutation = useMutation({
    mutationFn: generateDeliveryChallan,
    onSuccess: async (response) => {
      const deliveryId = response?.data?.data?.voucherId;

      await queryClient.invalidateQueries({
        queryKey: [deliveryProcess.getDeliveryChallans.endpointKey],
      });

      toast.success('Delivery Challan created');

      if (deliveryId) {
        router.push(`/dashboard/transport/delivery-challan/${deliveryId}`);
        return;
      }

      setIsOpen?.(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = () => {
    const validationErrors = validateForm();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    generateDCMutation.mutate({
      id: formData.dispatchNoteId,
      data: buildPayload(),
    });
  };

  const isDispatchNoteSelected = Boolean(selectedDispatchNoteId);

  return (
    <Wrapper className="flex h-full min-h-0 flex-col gap-4 overflow-hidden py-2">
      {isAddingNewTransport && (
        <AddModal
          type="Add"
          cta="vendor"
          btnName="Add new transport"
          mutationFunc={createVendor}
          isOpen={isAddingNewTransport}
          setIsOpen={setIsAddingNewTransport}
        />
      )}

      <AddNewAddress
        isLegAddressAdding={true}
        isAddressAdding={isAddingNewAddress}
        setIsAddressAdding={setIsAddingNewAddress}
        mutationKey={settingsAPI.addUpdateAddress.endpointKey}
        mutationFn={addUpdateAddress}
        invalidateKey={addressAPIs.getAddressByEnterprise.endpointKey}
      />

      <section className="shrink-0 rounded-md border p-3 sm:p-4">
        <div className="rounded border p-3">
          <Label>
            Select Dispatch Notes <span className="text-red-500">*</span>
          </Label>

          <Select
            value={formData.dispatchNoteId}
            onValueChange={handleDispatchNoteChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select dispatch note" />
            </SelectTrigger>

            <SelectContent>
              <div className="flex items-center gap-2 p-2">
                <Search size={14} />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by dispatch note number"
                  className="pl-9"
                />
              </div>

              {dispatchNotes.map((dispatchNote) => (
                <SelectItem
                  key={dispatchNote.id}
                  value={String(dispatchNote.id)}
                >
                  {dispatchNote.referenceNumber ||
                    dispatchNote.reference ||
                    `Dispatch Note #${dispatchNote.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {isDispatchNoteSelected && dispatchDetails && (
        <InfoBanner
          text={
            formData.isEWBRequired
              ? 'E-Way Bill is required for this Delivery Challan'
              : 'E-Way Bill is optional. You can generate it later if needed.'
          }
          variant="warning"
          showSupportLink={false}
        />
      )}

      <section className="scrollBarStyles min-h-0 flex-1 overflow-y-auto rounded-md border p-3 sm:p-4">
        {!isDispatchNoteSelected && (
          <div className="text-sm text-muted-foreground">
            Select a dispatch note to load its booking details.
          </div>
        )}

        {isDispatchNoteSelected && isDispatchDetailsLoading && (
          <div className="text-sm text-muted-foreground">
            Loading dispatch note details...
          </div>
        )}

        {isDispatchNoteSelected &&
          !isDispatchDetailsLoading &&
          !dispatchDetails && (
            <ErrorBox msg="Unable to load the selected dispatch note." />
          )}

        {isDispatchNoteSelected && dispatchDetails && (
          <DynamicForm
            schema={dynamicSchema}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            onChange={handleFieldChange}
          />
        )}
      </section>

      <div className="sticky bottom-0 z-20 mt-auto flex shrink-0 flex-col-reverse gap-2 border-t bg-white p-3 sm:flex-row sm:justify-end">
        <Button
          size="sm"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => {
            setErrors({});
            setFormData(createInitialState());
            setIsOpen?.(false);
          }}
        >
          Cancel
        </Button>

        <Button
          size="sm"
          className="w-full bg-[#288AF9] text-white sm:w-auto"
          onClick={handleSubmit}
          disabled={
            generateDCMutation.isPending ||
            !isDispatchNoteSelected ||
            isDispatchDetailsLoading
          }
        >
          {generateDCMutation.isPending ? 'Creating...' : 'Create'}
        </Button>
      </div>
    </Wrapper>
  );
};

export default DirectDC;
