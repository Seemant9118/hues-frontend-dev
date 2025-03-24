'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { debounce } from '@/appUtils/helperFunctions';
import InputWithLabel from '@/components/ui/InputWithLabel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LocalStorageService } from '@/lib/utils';
import { SearchEnterprise } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { sendInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import ErrorBox from '../ui/ErrorBox';
import Loading from '../ui/Loading';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const AddModal = ({ cta, btnName, mutationFunc, isOpen, setIsOpen }) => {
  const translations = useTranslations('components.addEditModal');

  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const panNumber = LocalStorageService.get('panClientVendor');
  const gstNumber = LocalStorageService.get('gstClientVendor');

  const [open, setOpen] = useState(isOpen ?? false);
  const [isAdding, setIsAdding] = useState(false);
  const [invitedIds, setInvitedIds] = useState([]);
  const [enterpriseData, setEnterPriseData] = useState({
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
  const [errorMsg, setErrorMsg] = useState({});
  const [searchInput, setSearchInput] = useState({
    idType: 'pan',
    idNumber: '',
  });
  const [searchData, setSearchData] = useState([]);

  useEffect(() => {
    setEnterPriseData((prev) => ({
      ...prev,
      panNumber: panNumber || '',
      gstNumber: gstNumber || '',
    }));
  }, [panNumber, gstNumber]);

  useEffect(() => {
    LocalStorageService.remove('panClientVendor');
    LocalStorageService.remove('gstClientVendor');
    setSearchInput({ idType: searchInput.idType, idNumber: '' });
  }, [open === false, searchInput.idType]);

  // query search mutation
  const searchMutation = useMutation({
    mutationFn: ({ idNumber, idType }) => SearchEnterprise(idNumber, idType),
    onSuccess: (data) => {
      setSearchData(data?.data?.data);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  // debounce wrapper
  const debouncedMutation = useCallback(
    debounce((input) => {
      if (input.idNumber.length >= 3) {
        searchMutation.mutate(input);
      }
    }, 500),
    [], // Empty array ensures that debounce function is created only once
  );

  // send invite mutation
  const sendInvite = useMutation({
    mutationFn: (data) => sendInvitation(data),
    onSuccess: (data) => {
      if (data.data.message === 'Invitation already exists') {
        toast.info(data.data.message);
      } else {
        toast.success(translations('common.form.toasts.success.invitation'));
      }
    },
    onError: (error) => {
      toast.error(
        error.response.data.message ||
          translations('common.form.toasts.error.common'),
      );
    },
  });

  // add enterprise mutation
  const mutation = useMutation({
    mutationFn: mutationFunc,
    onSuccess: () => {
      toast.success(
        cta === 'client'
          ? translations('client.form.toasts.success.entityAdded')
          : translations('vendor.form.toasts.success.entityAdded'),
      );
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
      setIsAdding(false);
      setSearchInput({});
      LocalStorageService.remove('panClientVendor');
      LocalStorageService.remove('gstClientVendor');
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

  const handleChangeId = (e) => {
    const { id, value } = e.target;

    // perform condition atleast 3 characters inputed in state then start mutation otherwise not
    setSearchInput((prev) => {
      const searchState = { ...prev, [id]: value.toUpperCase() };
      debouncedMutation(searchState); // Call debounced mutation function with new state
      return searchState;
    });
  };

  const handleSendInvite = (id) => {
    // Add the new ID to the list of invited IDs
    setInvitedIds((prev) => [...prev, id]);

    sendInvite.mutate({
      fromEnterpriseId: enterpriseId,
      toEnterpriseId: id,
      invitationType: cta === 'client' ? 'CLIENT' : 'VENDOR',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isError = validation(enterpriseData);

    if (Object.keys(isError).length === 0) {
      mutation.mutate(enterpriseData);
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
        setIsOpen && setIsOpen((prev) => !prev);
        setSearchInput({
          idType: 'pan',
          idNumber: '',
        });
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
        setSearchData([]);
        setIsAdding(false);
      }}
    >
      {isOpen === undefined && (
        <DialogTrigger asChild>
          <Button size="sm">
            <PlusCircle size={14} />
            {btnName}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogTitle>
          {cta === 'client'
            ? translations('client.title')
            : translations('vendor.title')}
        </DialogTitle>

        {/* search inputs */}
        {!isAdding && (
          <form>
            <div className="flex items-center justify-between gap-4">
              <div className="flex w-1/2 flex-col gap-0.5">
                <div>
                  <Label className="flex-shrink-0">
                    {translations(
                      'common.form.label.identifiers.identifier_type',
                    )}
                  </Label>{' '}
                  <span className="text-red-600">*</span>
                </div>
                <Select
                  required
                  value={searchInput.idType}
                  onValueChange={(value) =>
                    setSearchInput((prev) => ({ ...prev, idType: value }))
                  }
                >
                  <SelectTrigger className="max-w-xs gap-5">
                    <SelectValue placeholder="PAN" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gst">
                      {translations('common.form.input.select.gst')}
                    </SelectItem>
                    <SelectItem value="pan">
                      {translations('common.form.input.select.pan')}
                    </SelectItem>
                    {/* <SelectItem value="udyam">UDYAM</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <InputWithLabel
                  className="max-w-sm rounded-md"
                  name={`${translations(
                    'common.form.label.identifiers.identifier_number',
                  )} (${searchInput?.idType === 'pan' ? translations('common.form.input.select.pan') : translations('common.form.input.select.gst')})`}
                  type="tel"
                  id="idNumber"
                  required={true}
                  value={searchInput.idNumber}
                  onChange={handleChangeId}
                />
              </div>
            </div>
          </form>
        )}

        {/* seprator div */}
        {searchData && searchData.length !== 0 && (
          <div className="h-[1px] bg-neutral-300"></div>
        )}

        {/* client list related search  */}
        {!isAdding && (
          <div className="scrollBarStyles flex max-h-[200px] flex-col gap-4 overflow-auto">
            {searchMutation.isPending && <Loading />}

            {searchInput?.idNumber?.length > 2 &&
              searchData &&
              searchData.length !== 0 &&
              searchData.map((sdata) => (
                <div
                  key={sdata.id}
                  className="flex items-center justify-between rounded-md border bg-gray-100 p-2 text-xs font-bold"
                >
                  <div className="flex flex-col gap-1 text-gray-600">
                    <p>{sdata?.name}</p>
                    <p>{sdata?.gstNumber}</p>
                    <p>{sdata?.email}</p>
                    <p>{sdata?.panNumber}</p>
                  </div>

                  {invitedIds?.includes(sdata.id) ? (
                    <Button
                      variant="ghost"
                      className="font-bold text-green-800 underline hover:cursor-not-allowed"
                      disabled
                    >
                      {translations('common.form.ctas.identifiers.sent')}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSendInvite(sdata.id)}
                      disabled={sendInvite.isPending}
                      size="sm"
                    >
                      {sendInvite.isPending ? (
                        <Loading size={14} />
                      ) : (
                        translations('common.form.ctas.identifiers.invite')
                      )}
                    </Button>
                  )}
                </div>
              ))}

            {searchData?.length === 0 && searchInput?.idNumber?.length >= 3 && (
              <div className="flex flex-col gap-1 px-2">
                <span className="text-sm font-semibold">
                  {translations('common.form.infoMsg.enterprise_not_available')}
                </span>

                {(() => {
                  switch (searchInput.idType) {
                    case 'pan':
                      return searchInput.idNumber?.length === 10 ? (
                        <span
                          onClick={() => {
                            setIsAdding(true);
                            LocalStorageService.set(
                              'panClientVendor',
                              searchInput.idNumber,
                            );
                          }}
                          className="cursor-pointer text-sm font-semibold text-primary underline"
                        >
                          {cta === 'client'
                            ? translations(
                                'client.form.ctas.identifiers.continue',
                              )
                            : translations(
                                'vendor.form.ctas.identifiers.continue',
                              )}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-red-600">
                          {translations('common.form.errorMsg.identifiers.pan')}
                        </span>
                      );

                    case 'gst':
                      return searchInput.idNumber?.length === 15 ? (
                        <span
                          onClick={() => {
                            setIsAdding(true);
                            LocalStorageService.set(
                              'gstClientVendor',
                              searchInput.idNumber,
                            );
                          }}
                          className="cursor-pointer text-sm font-semibold text-primary underline"
                        >
                          {cta === 'client'
                            ? translations(
                                'client.form.ctas.identifiers.continue',
                              )
                            : translations(
                                'vendor.form.ctas.identifiers.continue',
                              )}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-red-600">
                          {translations('common.form.errorMsg.identifiers.gst')}
                        </span>
                      );

                    default:
                      return null;
                  }
                })()}
              </div>
            )}

            {searchInput?.idNumber?.length < 3 && (
              <span className="rounded-sm border p-2 text-sm font-semibold">
                {translations('common.form.infoMsg.toSearch')}
              </span>
            )}
          </div>
        )}

        {/* if client does not in our client list then, create client */}
        {isAdding && searchData?.length === 0 && (
          <form className="rounded-md p-2" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <Label>
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
                  <Label>
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
                  <Label>
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
                    <Label>
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
                    <Label>
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
                  <Label>
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
                  setIsAdding(false);
                }}
                variant={'outline'}
              >
                {translations('common.form.ctas.addNewEntity.cancel')}
              </Button>

              <Button type="submit" size="sm" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <Loading size={14} />
                ) : (
                  translations('common.form.ctas.addNewEntity.add')
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddModal;
