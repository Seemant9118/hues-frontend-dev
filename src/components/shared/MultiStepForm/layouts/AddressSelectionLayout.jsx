'use client';

import { useQuery } from '@tanstack/react-query';
import { MapPin, Plus } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import Select from 'react-select';

import AddNewAddress from '@/components/enterprise/AddNewAddress';
import {
  getEnterpriseId,
  getStylesForSelectComponent,
} from '@/appUtils/helperFunctions';
import { addressAPIs } from '@/api/addressApi/addressApis';
import ErrorBox from '@/components/ui/ErrorBox';
import { Label } from '@/components/ui/label';
import { getAddressByEnterprise } from '@/services/address_Services/AddressServices';

export default function AddressSelectionLayout({
  formData,
  setFormData,
  sectionLabel = 'Addresses',
  errorMsg = {},
}) {
  const enterpriseId = getEnterpriseId();

  const [selectDispatcher, setSelectDispatcher] = useState(null);
  const [selectBilling, setSelectBilling] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // ✅ fetch addresses
  const { data: addresses = [] } = useQuery({
    queryKey: [addressAPIs.getAddressByEnterprise.endpointKey, enterpriseId],
    queryFn: () => getAddressByEnterprise(enterpriseId),
    select: (res) => res?.data?.data || [],
    enabled: !!enterpriseId,
  });

  // ✅ dropdown options
  const addressesOptions = useMemo(() => {
    const baseOptions = (addresses || []).map((address) => ({
      value: address?.id,
      label: address?.address || address?.name || 'Address',
    }));

    return [
      ...baseOptions,
      {
        value: 'add-new-address',
        label: (
          <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
            <Plus size={14} /> Add New Address
          </span>
        ),
      },
    ];
  }, [addresses]);

  // ✅ Keep react-select in sync when formData already has saved values
  useEffect(() => {
    if (!addressesOptions?.length) return;

    const dispatchOpt = addressesOptions.find(
      (opt) => opt.value === formData?.dispatchFromAddressId,
    );
    const billingOpt = addressesOptions.find(
      (opt) => opt.value === formData?.billingFromAddressId,
    );

    if (dispatchOpt) {
      setSelectDispatcher({
        selectedValue: dispatchOpt,
        dispatchFrom: dispatchOpt.value,
      });
    }

    if (billingOpt) {
      setSelectBilling({
        selectedValue: billingOpt,
        billingFrom: billingOpt.value,
      });
    }
  }, [
    formData?.dispatchFromAddressId,
    formData?.billingFromAddressId,
    addressesOptions,
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Section Label */}
      {sectionLabel && (
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{sectionLabel}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 rounded-sm md:grid-cols-2">
        {/* ✅ Dispatch From */}
        <div>
          <div className="flex items-center gap-1">
            <Label>Dispatch From</Label>
            <span className="text-red-500">*</span>
          </div>

          <div className="flex flex-col gap-2">
            <Select
              name="dispatchFrom"
              placeholder="Select dispatch from..."
              options={addressesOptions}
              styles={getStylesForSelectComponent()}
              className="max-w-full text-sm"
              classNamePrefix="select"
              value={selectDispatcher?.selectedValue || null}
              onChange={(selectedOption) => {
                if (!selectedOption) {
                  setSelectDispatcher(null);
                  setFormData?.((prev) => ({
                    ...prev,
                    dispatchFromAddressId: '',
                  }));
                  return;
                }

                if (selectedOption.value === 'add-new-address') {
                  setIsAddingNewAddress(true);
                  return;
                }

                setSelectDispatcher({
                  dispatchFrom: selectedOption.value,
                  selectedValue: selectedOption,
                });

                // ✅ STORE IN formData
                setFormData?.((prev) => ({
                  ...prev,
                  dispatchFromAddressId: selectedOption.value,
                }));
              }}
            />

            {errorMsg?.dispatchFromAddressId && (
              <ErrorBox msg={errorMsg.dispatchFromAddressId} />
            )}
          </div>
        </div>

        {/* ✅ Billing From */}
        <div>
          <div className="flex items-center gap-1">
            <Label>Billing From</Label>
            <span className="text-red-500">*</span>
          </div>

          <div className="flex flex-col gap-2">
            <Select
              name="billingFrom"
              placeholder="Select billing from..."
              options={addressesOptions}
              styles={getStylesForSelectComponent()}
              className="max-w-full text-sm"
              classNamePrefix="select"
              value={selectBilling?.selectedValue || null}
              onChange={(selectedOption) => {
                if (!selectedOption) {
                  setSelectBilling(null);
                  setFormData?.((prev) => ({
                    ...prev,
                    billingFromAddressId: '',
                  }));
                  return;
                }

                if (selectedOption.value === 'add-new-address') {
                  setIsAddingNewAddress(true);
                  return;
                }

                setSelectBilling({
                  billingFrom: selectedOption.value,
                  selectedValue: selectedOption,
                });

                // ✅ STORE IN formData
                setFormData?.((prev) => ({
                  ...prev,
                  billingFromAddressId: selectedOption.value,
                }));
              }}
            />

            {errorMsg?.billingFromAddressId && (
              <ErrorBox msg={errorMsg.billingFromAddressId} />
            )}
          </div>
        </div>

        {/* ✅ Add New Address Modal */}
        <AddNewAddress
          isAddressAdding={isAddingNewAddress}
          setIsAddressAdding={setIsAddingNewAddress}
        />
      </div>
    </div>
  );
}
