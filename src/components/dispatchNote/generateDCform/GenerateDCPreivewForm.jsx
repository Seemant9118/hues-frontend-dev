'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import DynamicForm from '@/components/DynamicForm/DynamicForm';
import {
  validateBookingPreview,
  validateDynamicForm,
} from '@/components/DynamicForm/validators';
import AddModal from '@/components/Modals/AddModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import DynamicPdfPreviewLayout from '@/components/pdf/DynamicPdfPreviewLayout';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  generateDeliveryChallan,
  previewDeliveryChallan,
} from '@/services/Delivery_Process_Services/DeliveryProcessServices';
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
import moment from 'moment';

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
  { headLabel: 'Leg Details' },
  {
    type: 'text',
    label: 'Leg from',
    name: 'legFrom',
    disabled: true,
  },
  {
    type: 'select',
    label: 'Leg To',
    name: 'legTo',
    placeholder: 'Select destination',
    options: [], // ✅ inject dynamically
  },

  {
    type: 'select',
    label: 'Mode of transport',
    name: 'modeOfTransport',
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
    options: [], // ✅ inject dynamically
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
    disabled: true, // ✅ auto-filled
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
  const [isAddingNewTransport, setIsAddingNewTransport] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [dcPriviewUrl, setDCPriviewUrl] = useState(url);

  // vendors (Transporter list)
  const { data: transports = [] } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey, enterpriseId],
    queryFn: () => getVendors({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res.data.data.users,
    enabled: !!enterpriseId,
  });

  // Transport options
  const transportOptions = useMemo(() => {
    const list = (transports || []).map((vendor) => {
      const value = vendor?.id;
      const label =
        vendor?.vendor?.name || vendor?.invitation?.userDetails?.name;

      const vendorTransporterId = vendor?.vendor?.gstNumber || '';

      return { value, label, vendorTransporterId };
    });

    return [
      ...list,
      {
        value: null,
        label: 'Self',
      },
      {
        value: 'add-new-transport',
        label: (
          <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
            <Plus size={14} /> Add new transport
          </span>
        ),
      },
    ];
  }, [transports]);

  // address list
  const addressContext = 'legAddress';

  const { data: legAddress = [] } = useQuery({
    queryKey: [addressAPIs.getAddressByEnterprise.endpointKey, enterpriseId],
    queryFn: () => getAddressByEnterprise(enterpriseId, addressContext),
    select: (res) => res.data.data,
    enabled: !!enterpriseId,
  });

  const legAddressOptions = useMemo(() => {
    const list = (legAddress || []).map((address) => {
      const value = address?.address;
      const label = address?.address;
      return { value, label };
    });

    return [
      ...list,
      {
        value: 'add-new-address',
        label: (
          <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
            <Plus size={14} /> Add new Address
          </span>
        ),
      },
    ];
  }, [legAddress]);

  const handleFieldChange = (name, value) => {
    // Add new transport modal
    if (name === 'transporterEnterpriseId' && value === 'add-new-transport') {
      setIsAddingNewTransport(true);
      setFormData((prev) => ({
        ...prev,
        transporterEnterpriseId: null,
      }));
      return;
    }

    // Add new address modal
    if (name === 'legTo' && value === 'add-new-address') {
      setIsAddingNewAddress(true);
      setFormData((prev) => ({
        ...prev,
        legTo: '',
      }));
      return;
    }

    // Auto Booking Type based on Mode
    if (name === 'modeOfTransport') {
      const bookingTypeMap = {
        ROAD: 'LR',
        SHIP: 'LB',
        AIR: 'AIRWAY',
        RAIL: 'RAILWAY',
      };

      setFormData((prev) => ({
        ...prev,
        modeOfTransport: value,
        bookingType: bookingTypeMap[value] || '',
      }));
      return;
    }

    // Auto Transporter ID (GST) when transporter selected
    if (name === 'transporterEnterpriseId') {
      // Self
      if (value === null) {
        setFormData((prev) => ({
          ...prev,
          transporterEnterpriseId: null,
          transporterId: '',
        }));
        return;
      }

      const selected = transportOptions.find((opt) => opt.value === value);

      setFormData((prev) => ({
        ...prev,
        transporterEnterpriseId: value,
        transporterId: selected?.vendorTransporterId || '',
      }));
      return;
    }

    // Normal flow
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // default values based on dispatchDetails
  useEffect(() => {
    const totalAmount = Number(dispatchDetails?.totalAmount || 0);
    const totalGstAmount = Number(dispatchDetails?.totalGstAmount || 0);

    const amount = totalAmount + totalGstAmount;

    if (formData?.isEWBRequired === undefined && !Number.isNaN(amount)) {
      setFormData((prev) => ({
        ...prev,
        isEWBRequired: amount > 50000 ? 'true' : 'false',
        legFrom: dispatchDetails?.dispatchFromAddress?.address || '',
      }));
    }
  }, [dispatchDetails, formData?.isEWBRequired]);

  // Inject data dynamically into schema
  const dynamicSchema = useMemo(() => {
    return FormSchema.map((field) => {
      if (field.name === 'transporterEnterpriseId') {
        return {
          ...field,
          options: transportOptions,
        };
      }

      if (field.name === 'legTo') {
        return {
          ...field,
          options: legAddressOptions,
        };
      }

      return field;
    });
  }, [transportOptions, legAddressOptions]);

  const previewDCMutation = useMutation({
    mutationFn: previewDeliveryChallan,
    // eslint-disable-next-line consistent-return
    onSuccess: (data) => {
      toast.success('Changes applied!');
      if (data?.data?.data?.base64Pdf) {
        const base64StrToRenderPDF = data?.data?.data?.base64Pdf;
        const newUrl = `data:application/pdf;base64,${base64StrToRenderPDF}`;
        setDCPriviewUrl(newUrl);

        // Clean up the blob URL when the component unmounts or the base64 string changes
        return () => {
          window.URL.revokeObjectURL(newUrl);
        };
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const formatDispatchPreviewPayload = (d) => {
    return {
      referenceNumber: d?.referenceNumber || '',
      createdAt: moment(d?.createdAt).format('DD/MM/YYYY') || '',
      transporterName: d?.transporterName || '',

      buyerName: d?.buyerName || '',
      buyerGst: d?.buyerGst || '',
      billingAddress: {
        address: d?.billingAddress?.address || '',
      },

      sellerDetails: {
        name: d?.sellerDetails?.name || '',
        gst: d?.sellerDetails?.gst || '',
      },
      billingFromAddress: {
        address: d?.billingFromAddress?.address || '',
      },

      invoice: {
        id: d?.invoice?.id || '',
        referenceNumber: d?.invoice?.referenceNumber || '',
        createdAt: moment(d?.invoice?.createdAt).format('DD/MM/YYYY') || '',
      },

      items: d?.items?.map((item) => ({
        invoiceItem: {
          orderItemId: {
            productDetails: {
              hsnCode:
                item?.invoiceItem?.orderItemId?.productDetails?.hsnCode || '',
              productName:
                item?.invoiceItem?.orderItemId?.productDetails?.productName ||
                '',
            },
          },
        },
        dispatchedQuantity: item?.dispatchedQuantity || 0,
        amount: Number(item?.amount).toFixed(2),
        cgstPercentage: item?.cgstPercentage || 0,
        sgstPercentage: item?.sgstPercentage || 0,
        igstPercentage: item?.igstPercentage || 0,
        totalAmount: (
          Number(item?.amount || 0) + Number(item?.gstAmount || 0)
        ).toFixed(2),
      })),

      totalAmount: (
        Number(d?.totalAmount || 0) + Number(d?.totalGstAmount || 0)
      ).toFixed(2),
    };
  };

  const formatBookingPayload = () => {
    return {
      isEWBRequired: formData?.isEWBRequired === 'true',
      legFrom: formData?.legFrom || '',
      legTo: formData?.legTo || '',
      modeOfTransport: formData?.modeOfTransport || '',
      bookingType: formData?.bookingType || '',
      bookingNumber: formData?.bookingNumber || '',
      bookingDate: formData?.bookingDate || '',
      transporterEnterpriseId: formData?.transporterEnterpriseId || null,
      transporterId: formData?.transporterId || '',
      remarks: formData?.remarks || '',
    };
  };

  const onApplyChanges = () => {
    // ✅ validate only booking fields
    const bookingErrors = validateBookingPreview(formData);
    setErrors(bookingErrors);

    if (Object.keys(bookingErrors).length > 0) return;

    const formattedPayload = formatDispatchPreviewPayload(dispatchDetails);
    const bookingPayload = formatBookingPayload();

    const updatedPreviewPayload = {
      ...formattedPayload,
      bookings: [bookingPayload],
    };

    previewDCMutation.mutate({
      id: dispatchDetails?.id,
      data: updatedPreviewPayload,
    });
  };

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
    const validationErrors = validateDynamicForm(dynamicSchema, formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    const bookingPayload = formatBookingPayload();

    const updatedFormData = {
      dispatchNoteId: Number(dispatchNoteId),
      isEWBRequired: formData?.isEWBRequired === 'true',
      buyerId: dispatchDetails?.buyerId,
      buyerType: dispatchDetails?.buyerType,
      metaData: dispatchDetails || {},
      bookings: [bookingPayload], // currently booking table removed
    };

    generateDCMutation.mutate({ id: dispatchNoteId, data: updatedFormData });
  };

  return (
    <Wrapper className="h-full py-2">
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <OrderBreadCrumbs possiblePagesBreadcrumbs={breadcrumb} />
      </section>

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
        invalidateKey={deliveryProcess.getDispatchNote.endpointKey}
      />

      <DynamicPdfPreviewLayout
        schema={dynamicSchema}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        pdfUrl={dcPriviewUrl}
        isPDF={true}
        onApplyChanges={onApplyChanges}
        onDiscard={() => router.back()}
        isCreating={generateDCMutation?.isPending}
        onCreate={handleCreate}
        FormComponent={DynamicForm}
        onChange={handleFieldChange}
      />
    </Wrapper>
  );
}
