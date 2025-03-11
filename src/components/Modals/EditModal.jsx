import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { LocalStorageService } from '@/lib/utils';
import { Label } from '@radix-ui/react-label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import Loading from '../ui/Loading';

const EditModal = ({
  id,
  userData,
  cta,
  mutationFunc,
  isEditing,
  setIsEditing,
}) => {
  const translations = useTranslations('components.addEditModal');

  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [open, setOpen] = useState(isEditing);
  const [errorMsg, setErrorMsg] = useState({});
  const [enterpriseData, setEnterPriseData] = useState({
    enterpriseId,
    name: userData?.name || '',
    address: userData?.address || '',
    countryCode: '+91',
    mobileNumber: userData?.mobileNumber || '',
    email: userData?.email || '',
    panNumber: userData?.panNumber || '',
    gstNumber: userData?.gstNumber || '',
    userType: cta,
  });

  // update enterprise mutation
  const updateMutation = useMutation({
    mutationFn: (data) => mutationFunc(id, data),
    onSuccess: (data) => {
      if (!data.data.status) {
        this.onError();
        return;
      }

      toast.success(translations('common.form.toasts.success.edited'));
      setOpen((prev) => !prev);
      setIsEditing(false);
      setEnterPriseData({
        enterpriseId: '',
        name: '',
        address: '',
        countryCode: '',
        mobileNumber: '',
        email: '',
        panNumber: '',
        gstNumber: '',
        userType: '',
      });

      queryClient.invalidateQueries({
        queryKey:
          cta === 'client'
            ? [clientEnterprise.getClients.endpointKey]
            : [vendorEnterprise.getVendors.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(
        error.response.data.message ||
          translations('common.form.toasts.error.common'),
      );
    },
  });

  // validation
  const validation = (enterpriseDataItem) => {
    const errorObj = {};
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

    if (enterpriseDataItem.name === '') {
      errorObj.name = translations('common.form.errorMsg.addNewEntity.name');
    }

    // if (enterpriseDataItem.address === '') {
    //   errorObj.address = '*Required Address';
    // }

    if (enterpriseDataItem.mobileNumber === '') {
      errorObj.mobileNumber = translations(
        'common.form.errorMsg.addNewEntity.phone.required',
      );
    } else if (enterpriseDataItem.mobileNumber.length !== 10) {
      errorObj.mobileNumber = translations(
        'common.form.errorMsg.addNewEntity.phone.valid',
      );
    }

    // if (enterpriseDataItem.email === '') {
    //   errorObj.email = '*Required Email';
    // }
    if (
      enterpriseDataItem?.email.length > 0 &&
      !emailPattern.test(enterpriseDataItem.email)
    ) {
      errorObj.email = translations('common.form.errorMsg.addNewEntity.email');
    }

    if (enterpriseDataItem.panNumber === '') {
      errorObj.panNumber = translations(
        'common.form.errorMsg.addNewEntity.pan.required',
      );
    } else if (!panPattern.test(enterpriseDataItem.panNumber)) {
      errorObj.panNumber = translations(
        'common.form.errorMsg.addNewEntity.pan.valid',
      );
    }

    // if (enterpriseDataItem.gstNumber === '') {
    //   errorObj.gstNumber = '*Required GST IN';
    // }

    return errorObj;
  };

  //   handle Submit fn
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const isError = validation(enterpriseData);

    if (Object.keys(isError).length === 0) {
      updateMutation.mutate(enterpriseData);
      setErrorMsg({});
      return;
    }
    setErrorMsg(isError);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen((prev) => !prev);
        setEnterPriseData({
          enterpriseId,
          name: '',
          address: '',
          countryCode: '+91',
          mobileNumber: '',
          email: '',
          panNumber: '',
          gstNumber: '',
          userType: cta,
        });
        setIsEditing(false);
      }}
    >
      <DialogContent>
        <DialogTitle>
          {cta === 'client'
            ? translations('client.title')
            : translations('vendor.title')}
        </DialogTitle>

        {/* Editing component */}

        <form className="rounded-md p-2 text-sm" onSubmit={handleEditSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <Label className="font-semibold">
                  {translations('common.form.label.addNewEntity.name')}
                </Label>
                <span className="text-red-600">*</span>
              </div>

              <Input
                name="Name"
                type="text"
                // required={true}
                id="name"
                onChange={(e) => {
                  setEnterPriseData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                }}
                value={enterpriseData.name}
              />
              {errorMsg.name && <ErrorBox msg={errorMsg.name} />}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <Label className="font-semibold">
                  {translations('common.form.label.addNewEntity.gst')}
                </Label>
                {/* <span className="text-red-600">*</span> */}
              </div>
              <Input
                name="GST IN"
                type="tel"
                id="gstNumber"
                // required={true}
                onChange={(e) =>
                  setEnterPriseData((prev) => ({
                    ...prev,
                    gstNumber: e.target.value,
                  }))
                }
                value={enterpriseData.gstNumber}
              />
              {/* {errorMsg.gstNumber && <ErrorBox msg={errorMsg.gstNumber} />} */}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <Label className="font-semibold">
                  {translations('common.form.label.addNewEntity.email')}
                </Label>
                {/* <span className="text-red-600">*</span> */}
              </div>
              <Input
                name="Email"
                type="text"
                id="email"
                // required={true}
                onChange={(e) =>
                  setEnterPriseData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                value={enterpriseData.email}
              />
              {errorMsg.email && <ErrorBox msg={errorMsg.email} />}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <Label className="font-semibold">
                    {translations('common.form.label.addNewEntity.phone')}
                  </Label>
                  <span className="text-red-600">*</span>
                </div>
                <Input
                  name="Phone"
                  type="tel"
                  id="mobileNumber"
                  // required={true}
                  onChange={(e) =>
                    setEnterPriseData((prev) => ({
                      ...prev,
                      mobileNumber: e.target.value,
                    }))
                  }
                  value={enterpriseData.mobileNumber}
                />
                {errorMsg.mobileNumber && (
                  <ErrorBox msg={errorMsg.mobileNumber} />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <Label className="font-semibold">
                    {' '}
                    {translations('common.form.label.addNewEntity.pan')}
                  </Label>
                  <span className="text-red-600">*</span>
                </div>
                <Input
                  name="PAN"
                  type="text"
                  id="panNumber"
                  onChange={(e) =>
                    setEnterPriseData((prev) => ({
                      ...prev,
                      panNumber: e.target.value.toUpperCase(),
                    }))
                  }
                  value={enterpriseData.panNumber}
                />
                {errorMsg.panNumber && <ErrorBox msg={errorMsg.panNumber} />}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <Label className="font-semibold">
                  {translations('common.form.label.addNewEntity.address')}
                </Label>
                {/* <span className="text-red-600">*</span> */}
              </div>
              <Input
                name="Address"
                type="text"
                id="address"
                // required={true}
                onChange={(e) =>
                  setEnterPriseData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                value={enterpriseData.address}
              />
              {/* {errorMsg.address && <ErrorBox msg={errorMsg.address} />} */}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-4">
            <Button
              size="sm"
              onClick={() => {
                setErrorMsg({});
                setEnterPriseData({
                  enterpriseId,
                  name: '',
                  address: '',
                  countryCode: '+91',
                  mobileNumber: '',
                  email: '',
                  panNumber: '',
                  gstNumber: '',
                  userType: cta,
                });
                setOpen(false);
                setIsEditing(false);
              }}
              variant={'outline'}
            >
              {translations('common.form.ctas.addNewEntity.cancel')}
            </Button>

            <Button type="submit" size="sm" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loading />
              ) : (
                translations('common.form.ctas.addNewEntity.edit')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditModal;
