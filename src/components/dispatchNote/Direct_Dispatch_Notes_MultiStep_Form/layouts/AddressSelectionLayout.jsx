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

  // dynamic configs
  leftField = {
    label: 'Dispatch From',
    placeholder: 'Select dispatch from...',
    keyName: 'dispatchFromAddressId',
  },
  rightField = {
    label: 'Billing From',
    placeholder: 'Select billing from...',
    keyName: 'billingFromAddressId',
  },
}) {
  const enterpriseId = getEnterpriseId();

  const [selectLeft, setSelectLeft] = useState(null);
  const [selectRight, setSelectRight] = useState(null);
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

    const leftOpt = addressesOptions.find(
      (opt) => opt.value === formData?.[leftField.keyName],
    );

    const rightOpt = addressesOptions.find(
      (opt) => opt.value === formData?.[rightField.keyName],
    );

    setSelectLeft(leftOpt || null);
    setSelectRight(rightOpt || null);
  }, [formData, leftField.keyName, rightField.keyName, addressesOptions]);

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
        {/* ✅ Left */}
        <div>
          <div className="flex items-center gap-1">
            <Label>{leftField.label}</Label>
            <span className="text-red-500">*</span>
          </div>

          <div className="flex flex-col gap-2">
            <Select
              name={leftField.keyName}
              placeholder={leftField.placeholder}
              options={addressesOptions}
              styles={getStylesForSelectComponent()}
              className="max-w-full text-sm"
              classNamePrefix="select"
              value={selectLeft}
              onChange={(selectedOption) => {
                if (!selectedOption) {
                  setSelectLeft(null);
                  setFormData?.((prev) => ({
                    ...prev,
                    [leftField.keyName]: '',
                  }));
                  return;
                }

                if (selectedOption.value === 'add-new-address') {
                  setIsAddingNewAddress(true);
                  return;
                }

                setSelectLeft(selectedOption);

                setFormData?.((prev) => ({
                  ...prev,
                  [leftField.keyName]: selectedOption.value,
                }));
              }}
            />

            {errorMsg?.[leftField.keyName] && (
              <ErrorBox msg={errorMsg[leftField.keyName]} />
            )}
          </div>
        </div>

        {/* ✅ Right */}
        <div>
          <div className="flex items-center gap-1">
            <Label>{rightField.label}</Label>
            <span className="text-red-500">*</span>
          </div>

          <div className="flex flex-col gap-2">
            <Select
              name={rightField.keyName}
              placeholder={rightField.placeholder}
              options={addressesOptions}
              styles={getStylesForSelectComponent()}
              className="max-w-full text-sm"
              classNamePrefix="select"
              value={selectRight}
              onChange={(selectedOption) => {
                if (!selectedOption) {
                  setSelectRight(null);
                  setFormData?.((prev) => ({
                    ...prev,
                    [rightField.keyName]: '',
                  }));
                  return;
                }

                if (selectedOption.value === 'add-new-address') {
                  setIsAddingNewAddress(true);
                  return;
                }

                setSelectRight(selectedOption);

                setFormData?.((prev) => ({
                  ...prev,
                  [rightField.keyName]: selectedOption.value,
                }));
              }}
            />

            {errorMsg?.[rightField.keyName] && (
              <ErrorBox msg={errorMsg[rightField.keyName]} />
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
