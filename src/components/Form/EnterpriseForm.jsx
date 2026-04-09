'use client';

import { addressAPIs } from '@/api/addressApi/addressApis';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { debounce, getEnterpriseId } from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';
import { LocalStorageService } from '@/lib/utils';
import { SearchEnterprise } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { sendInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { getDataFromPinCode } from '@/services/address_Services/AddressServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Trash2, UserPlus } from 'lucide-react';
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
import Wrapper from '../wrappers/Wrapper';

const EnterpriseForm = ({
  mode = 'add', // 'add' or 'edit'
  initialData = null,
  id,
  cta,
  mutationFunc,
  onClose,
}) => {
  const translations = useTranslations('components.addEditModal');
  const queryClient = useQueryClient();
  const enterpriseId = getEnterpriseId();

  const panNumber = LocalStorageService.get('panClientVendor');
  const gstNumber = LocalStorageService.get('gstClientVendor');

  // If we are in 'edit' mode, we're basically directly in 'isAdding' form state
  const [isAdding, setIsAdding] = useState(mode === 'edit');
  const [invitedIds, setInvitedIds] = useState([]);

  const activeInitialData = initialData;

  // For Edit Mode
  const cleanedAddress = activeInitialData?.address?.address?.replace(
    /,\s*[^,]+,\s*[^-]+-\s*\d{6}$/,
    '',
  );

  const getInitialState = (data) => {
    const dataSource = data || activeInitialData;
    if (mode === 'edit' && dataSource) {
      return {
        enterpriseId,
        name:
          cta === 'client'
            ? dataSource?.client?.name ||
              dataSource?.invitation?.userDetails?.name ||
              ''
            : dataSource?.vendor?.name ||
              dataSource?.invitation?.userDetails?.name ||
              '',
        pincode: dataSource?.address?.pincode || '',
        city: dataSource?.address?.district || '',
        state: dataSource?.address?.state || '',
        address: cleanedAddress || '',
        countryCode: '+91',
        mobileNumber:
          cta === 'client'
            ? dataSource?.client?.mobileNumber ||
              dataSource?.invitation?.userDetails?.mobileNumber ||
              ''
            : dataSource?.vendor?.mobileNumber ||
              dataSource?.invitation?.userDetails?.mobileNumber ||
              '',
        email: dataSource?.email || '',
        panNumber:
          cta === 'client'
            ? dataSource?.client?.panNumber ||
              dataSource?.invitation?.userDetails?.panNumber ||
              ''
            : dataSource?.vendor?.panNumber ||
              dataSource?.invitation?.userDetails?.panNumber ||
              '',
        gstNumber:
          cta === 'client'
            ? dataSource?.client?.gstNumber ||
              dataSource?.invitation?.userDetails?.gstNumber ||
              ''
            : dataSource?.vendor?.gstNumber ||
              dataSource?.invitation?.userDetails?.gstNumber ||
              '',
        userType: cta,
        addressId: dataSource?.address?.id || '',
        authorizedPerson: (() => {
          let parsedMetaData = dataSource?.metaData;
          if (typeof parsedMetaData === 'string') {
            try {
              parsedMetaData = JSON.parse(parsedMetaData);
            } catch (e) {
              // Ignore parse error safely
            }
          }
          const persons =
            parsedMetaData?.authorizedPerson || dataSource?.authorizedPerson;
          return (
            persons?.map((ap, index) => ({
              id: ap.id || Date.now() + index,
              name: ap.name || '',
              email: ap.email || '',
              mobileNumber: ap.mobileNumber || '',
            })) || []
          );
        })(),
      };
    }

    return {
      enterpriseId,
      name: '',
      countryCode: '+91',
      mobileNumber: '',
      email: '',
      panNumber: panNumber || '',
      gstNumber: gstNumber || '',
      city: '',
      state: '',
      pincode: '',
      address: '',
      userType: cta,
      authorizedPerson: [],
    };
  };

  const [enterpriseData, setEnterPriseData] = useState(getInitialState);

  useEffect(() => {
    if (mode === 'edit' && activeInitialData) {
      setEnterPriseData(getInitialState());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeInitialData, mode]);

  const [errorMsg, setErrorMsg] = useState({});
  const [searchInput, setSearchInput] = useState({
    idType: 'pan',
    idNumber: '',
  });
  const [searchData, setSearchData] = useState([]);

  useEffect(() => {
    if (mode === 'add') {
      setEnterPriseData((prev) => ({
        ...prev,
        panNumber: panNumber || '',
        gstNumber: gstNumber || '',
      }));
    }
  }, [panNumber, gstNumber, mode]);

  useEffect(() => {
    return () => {
      LocalStorageService.remove('panClientVendor');
      LocalStorageService.remove('gstClientVendor');
    };
  }, []);

  const handleAddAuthorizedPerson = () => {
    setEnterPriseData((prev) => ({
      ...prev,
      authorizedPerson: [
        ...prev.authorizedPerson,
        { id: Date.now(), name: '', email: '', mobileNumber: '' },
      ],
    }));
  };

  const handleRemoveAuthorizedPerson = (id) => {
    setEnterPriseData((prev) => ({
      ...prev,
      authorizedPerson: prev.authorizedPerson.filter(
        (person) => person.id !== id,
      ),
    }));
  };

  const handleAuthorizedPersonChange = (id, field, value) => {
    setEnterPriseData((prev) => ({
      ...prev,
      authorizedPerson: prev.authorizedPerson.map((person) =>
        person.id === id ? { ...person, [field]: value } : person,
      ),
    }));
  };

  // query search mutation
  const searchMutation = useMutation({
    mutationFn: ({ idNumber, idType }) => SearchEnterprise(idNumber, idType),
    onSuccess: (data) => {
      setSearchData(data?.data?.data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Search failed');
    },
  });

  // debounce wrapper
  const debouncedMutation = useCallback(
    debounce((input) => {
      if (input.idNumber.length >= 3) {
        searchMutation.mutate(input);
      }
    }, 500),
    [],
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
        error.response?.data?.message ||
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
      errorObj.name = translations('common.form.errorMsg.addNewEntity.name', {
        defaultValue: 'Name is required',
      });
    }

    if (enterpriseDataItem.mobileNumber === '') {
      errorObj.mobileNumber = translations(
        'common.form.errorMsg.addNewEntity.phone.required',
        { defaultValue: 'Phone is required' },
      );
    } else if (enterpriseDataItem.mobileNumber.length !== 10) {
      errorObj.mobileNumber = translations(
        'common.form.errorMsg.addNewEntity.phone.valid',
        { defaultValue: 'Enter valid phone' },
      );
    }

    if (
      enterpriseDataItem?.email.length > 0 &&
      !emailPattern.test(enterpriseDataItem.email)
    ) {
      errorObj.email = translations('common.form.errorMsg.addNewEntity.email', {
        defaultValue: 'Enter a valid email',
      });
    }

    if (enterpriseDataItem.panNumber === '') {
      errorObj.panNumber = translations(
        'common.form.errorMsg.addNewEntity.pan.required',
        { defaultValue: 'PAN is required' },
      );
    } else if (!panPattern.test(enterpriseDataItem.panNumber)) {
      errorObj.panNumber = translations(
        'common.form.errorMsg.addNewEntity.pan.valid',
        { defaultValue: 'Enter a valid PAN' },
      );
    }

    if (mode === 'add' && enterpriseDataItem.pincode === '') {
      errorObj.pincode = translations(
        'common.form.errorMsg.addNewEntity.pincode.required',
        { defaultValue: 'Pincode is required' },
      );
    } else if (
      enterpriseDataItem?.pincode?.length !== 6 &&
      enterpriseDataItem?.pincode?.length > 0
    ) {
      errorObj.pincode = translations(
        'common.form.errorMsg.addNewEntity.pincode.valid',
        { defaultValue: 'Enter a valid Pincode' },
      );
    }

    if (
      mode === 'edit' &&
      (!enterpriseDataItem.pincode || enterpriseDataItem.pincode.length !== 6)
    ) {
      errorObj.pincode = 'Valid 6 digits Pincode required';
    }

    return errorObj;
  };

  const handleChangeId = (e) => {
    const { id, value } = e.target;
    setSearchInput((prev) => {
      const searchState = { ...prev, [id]: value.toUpperCase() };
      debouncedMutation(searchState);
      return searchState;
    });
  };

  const handleSendInvite = (sId) => {
    setInvitedIds((prev) => [...prev, sId]);
    sendInvite.mutate({
      fromEnterpriseId: enterpriseId,
      toEnterpriseId: sId,
      invitationType: cta === 'client' ? 'CLIENT' : 'VENDOR',
    });
  };

  // add/update enterprise mutation
  const mutation = useMutation({
    mutationFn:
      mode === 'edit' ? (data) => mutationFunc(id, data) : mutationFunc,
    onSuccess: (data) => {
      if (mode === 'edit' && data && data.data && !data.data.status) {
        // From original source error handling logic
        toast.error('Operation failed');
        return;
      }
      toast.success(
        mode === 'edit'
          ? translations('common.form.toasts.success.edited', {
              defaultValue: 'Updated successfully',
            })
          : cta === 'client'
            ? translations('client.form.toasts.success.entityAdded', {
                defaultValue: 'Client added successfully',
              })
            : translations('vendor.form.toasts.success.entityAdded', {
                defaultValue: 'Vendor added successfully',
              }),
      );

      LocalStorageService.remove('panClientVendor');
      LocalStorageService.remove('gstClientVendor');
      queryClient.invalidateQueries({
        queryKey:
          cta === 'client'
            ? [clientEnterprise.getClients.endpointKey]
            : [vendorEnterprise.getVendors.endpointKey],
      });
      onClose();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          translations('common.form.toasts.error.common', {
            defaultValue: 'Something went wrong',
          }),
      );
    },
  });

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

  const {
    data: addressData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      addressAPIs.getAddressFromPincode.endpointKey,
      enterpriseData.pincode,
    ],
    enabled: enterpriseData?.pincode?.length === 6,
    queryFn: async () => {
      try {
        const res = await getDataFromPinCode(enterpriseData.pincode);
        return res?.data?.data;
      } catch (err) {
        if (err?.response?.status === 400) {
          setErrorMsg((prev) => ({
            ...prev,
            pincode: 'Invalid pincode. Please try valid pincode',
          }));
          setEnterPriseData((prev) => ({
            ...prev,
            city: '',
            state: '',
          }));
        } else {
          toast.error('Failed to fetch address details');
        }
        throw err;
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (addressData) {
      setEnterPriseData((prev) => ({
        ...prev,
        city: addressData.district || '',
        state: addressData.state || '',
      }));
    }
  }, [addressData]);

  return (
    <Wrapper>
      <div className="mx-auto flex w-full flex-col gap-6 py-3">
        {/* Header Section */}
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full shadow-sm"
            onClick={onClose}
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-800">
              {mode === 'edit'
                ? translations(
                    cta === 'client' ? 'client.editTitle' : 'vendor.editTitle',
                    { defaultValue: 'Edit Entity' },
                  )
                : translations(
                    cta === 'client' ? 'client.title' : 'vendor.title',
                    { defaultValue: 'Add Entity' },
                  )}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {mode === 'edit'
                ? `Update the details of this ${cta}.`
                : `Complete the form below to create a new ${cta} in your system.`}
            </p>
          </div>
        </div>

        {/* Entity Search Panel */}
        {mode === 'add' && !isAdding && (
          <form className="overflow-hidden rounded-sm border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Entity Search
              </h3>
              <p className="mt-1 text-sm font-medium text-gray-500">
                Search by PAN or GST to verify if the entity already exists in
                the system.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 p-6">
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                  {translations(
                    'common.form.label.identifiers.identifier_type',
                    { defaultValue: 'Identifier Type' },
                  )}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  required
                  value={searchInput.idType}
                  onValueChange={(value) =>
                    setSearchInput((prev) => ({ ...prev, idType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="PAN" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gst">
                      {translations('common.form.input.select.gst', {
                        defaultValue: 'GST',
                      })}
                    </SelectItem>
                    <SelectItem value="pan">
                      {translations('common.form.input.select.pan', {
                        defaultValue: 'PAN',
                      })}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                  {translations(
                    'common.form.label.identifiers.identifier_number',
                    { defaultValue: 'Identifier Number' },
                  )}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  name={`${translations('common.form.label.identifiers.identifier_number', { defaultValue: 'Identifier Number' })}`}
                  type="tel"
                  id="idNumber"
                  required={true}
                  value={searchInput.idNumber}
                  onChange={handleChangeId}
                  placeholder={`Enter ${searchInput?.idType === 'pan' ? 'PAN' : 'GST'} number`}
                />
              </div>
            </div>
          </form>
        )}

        {/* Search Results List */}
        {mode === 'add' && !isAdding && (
          <div className="flex flex-col gap-4">
            {searchMutation.isPending && (
              <div className="flex justify-center p-6">
                <Loading />
              </div>
            )}

            {searchInput?.idNumber?.length > 2 &&
              searchData &&
              searchData.length !== 0 && (
                <div className="scrollBarStyles flex max-h-[350px] flex-col gap-3 overflow-y-auto rounded-sm border">
                  <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Showing {searchData.length} result(s)
                    </h3>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      for {searchInput?.idType === 'pan' ? 'PAN' : 'GST'}:{' '}
                      {searchInput?.idNumber}
                    </p>
                  </div>
                  {searchData.map((sdata) => (
                    <div
                      key={sdata.id}
                      className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center"
                    >
                      <div className="flex flex-col gap-1.5 text-sm text-gray-600">
                        <p className="text-lg font-bold leading-tight text-gray-900">
                          {sdata?.name}
                        </p>
                        <div className="mt-2 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2">
                          <p>
                            <span className="font-medium text-gray-500">
                              GST:
                            </span>{' '}
                            {sdata?.gstNumber || 'N/A'}
                          </p>
                          <p>
                            <span className="font-medium text-gray-500">
                              PAN:
                            </span>{' '}
                            {sdata?.panNumber || 'N/A'}
                          </p>
                          <p className="sm:col-span-2">
                            <span className="font-medium text-gray-500">
                              Email:
                            </span>{' '}
                            {sdata?.email || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {invitedIds?.includes(sdata.id) ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="pointer-events-none min-w-[120px] bg-green-50 font-semibold text-green-700 hover:bg-green-100"
                          disabled
                        >
                          {translations('common.form.ctas.identifiers.sent', {
                            defaultValue: 'Sent',
                          })}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSendInvite(sdata.id)}
                          disabled={sendInvite.isPending}
                          size="sm"
                          className="min-w-[120px]"
                        >
                          {sendInvite.isPending ? (
                            <Loading size={14} />
                          ) : (
                            translations(
                              'common.form.ctas.identifiers.invite',
                              {
                                defaultValue: 'Invite',
                              },
                            )
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

            {searchData?.length === 0 && searchInput?.idNumber?.length >= 3 && (
              <div className="mt-2 flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserPlus size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="mb-1 text-lg font-bold text-gray-800">
                    {translations(
                      'common.form.infoMsg.enterprise_not_available',
                      {
                        defaultValue: 'No matching entity found',
                      },
                    )}
                  </h4>
                  <p className="mx-auto max-w-md text-sm text-gray-600">
                    We couldn&apos;t find an existing entity with this
                    identifier. You can quickly add them to your workspace as a
                    new record.
                  </p>
                </div>

                {(() => {
                  switch (searchInput.idType) {
                    case 'pan':
                      return searchInput.idNumber?.length === 10 ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsAdding(true);
                            LocalStorageService.set(
                              'panClientVendor',
                              searchInput.idNumber,
                            );
                          }}
                          className="mt-2 font-semibold shadow-md"
                        >
                          {cta === 'client'
                            ? translations(
                                'client.form.ctas.identifiers.continue',
                                { defaultValue: 'Continue to Add Entity' },
                              )
                            : translations(
                                'vendor.form.ctas.identifiers.continue',
                                { defaultValue: 'Continue to Add Entity' },
                              )}
                        </Button>
                      ) : (
                        <span className="mt-2 inline-block rounded border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600">
                          {translations(
                            'common.form.errorMsg.identifiers.pan',
                            {
                              defaultValue: 'Please enter a valid PAN number.',
                            },
                          )}
                        </span>
                      );

                    case 'gst':
                      return searchInput.idNumber?.length === 15 ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setIsAdding(true);
                            LocalStorageService.set(
                              'gstClientVendor',
                              searchInput.idNumber,
                            );
                          }}
                          className="mt-2 font-semibold shadow-md"
                        >
                          {cta === 'client'
                            ? translations(
                                'client.form.ctas.identifiers.continue',
                                { defaultValue: 'Continue to Add Entity' },
                              )
                            : translations(
                                'vendor.form.ctas.identifiers.continue',
                                { defaultValue: 'Continue to Add Entity' },
                              )}
                        </Button>
                      ) : (
                        <span className="mt-2 inline-block rounded border border-red-100 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-600">
                          {translations(
                            'common.form.errorMsg.identifiers.gst',
                            {
                              defaultValue:
                                'Please enter a valid GSTIN number.',
                            },
                          )}
                        </span>
                      );

                    default:
                      return null;
                  }
                })()}
              </div>
            )}

            {searchInput?.idNumber?.length < 3 && (
              <div className="rounded-sm border border-dashed border-gray-300 bg-gray-50/50 p-4 text-center">
                <p className="text-sm font-medium text-gray-500">
                  {translations('common.form.infoMsg.toSearch', {
                    defaultValue:
                      'Enter at least 3 characters to start searching...',
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Creation / Update Form Container */}
        {isAdding &&
          (mode === 'edit' || (mode === 'add' && searchData?.length === 0)) && (
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-4"
            >
              {/* Basic Information Section */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Basic Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-6 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      {translations('common.form.label.addNewEntity.name', {
                        defaultValue: 'Entity Name',
                      })}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="Name"
                      type="text"
                      className="h-11 bg-gray-50/50 focus:bg-white"
                      id="name"
                      placeholder="e.g. Acme Corporation"
                      onChange={(e) =>
                        setEnterPriseData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      value={enterpriseData.name}
                    />
                    {errorMsg.name && <ErrorBox msg={errorMsg.name} />}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      {translations('common.form.label.addNewEntity.phone', {
                        defaultValue: 'Phone Number',
                      })}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="Phone"
                      type="tel"
                      className="h-11 bg-gray-50/50 focus:bg-white"
                      id="mobileNumber"
                      placeholder="e.g. 9876543210"
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

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      {translations('common.form.label.addNewEntity.email', {
                        defaultValue: 'Email Address',
                      })}
                    </Label>
                    <Input
                      name="Email"
                      type="text"
                      className="h-11 bg-gray-50/50 focus:bg-white"
                      id="email"
                      placeholder="e.g. contact@acme.com"
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

                  <div className="flex flex-col gap-1.5">
                    <Label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                      {translations('common.form.label.addNewEntity.pan', {
                        defaultValue: 'PAN Number',
                      })}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      name="PAN"
                      type="text"
                      className="h-11 bg-gray-50/50 uppercase focus:bg-white"
                      id="panNumber"
                      placeholder="ABCDE1234F"
                      onChange={(e) =>
                        setEnterPriseData((prev) => ({
                          ...prev,
                          panNumber: e.target.value.toUpperCase(),
                        }))
                      }
                      value={enterpriseData.panNumber}
                    />
                    {errorMsg.panNumber && (
                      <ErrorBox msg={errorMsg.panNumber} />
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      {translations('common.form.label.addNewEntity.gst', {
                        defaultValue: 'GSTIN',
                      })}
                    </Label>
                    <Input
                      name="GST IN"
                      type="tel"
                      className="h-11 bg-gray-50/50 uppercase focus:bg-white"
                      id="gstNumber"
                      placeholder="22AAAAA0000A1Z5"
                      onChange={(e) =>
                        setEnterPriseData((prev) => ({
                          ...prev,
                          gstNumber: e.target.value.toUpperCase(),
                        }))
                      }
                      value={enterpriseData.gstNumber}
                    />
                  </div>
                </div>
              </div>

              {/* Address Details Section */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Address Details
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-6 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      className="flex items-center gap-1 text-sm font-medium text-gray-700"
                      htmlFor="pincode"
                    >
                      Pincode <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        id="pincode"
                        name="pincode"
                        className="h-11 bg-gray-50/50 pr-10 focus:bg-white"
                        value={enterpriseData.pincode}
                        onChange={(e) => {
                          const { name, value } = e.target;
                          if (enterpriseData?.pincode?.length !== 5) {
                            setEnterPriseData((prev) => ({
                              ...prev,
                              city: '',
                              state: '',
                            }));
                          }
                          setEnterPriseData((prev) => ({
                            ...prev,
                            [name]: value,
                          }));
                          setErrorMsg((prev) => ({ ...prev, [name]: '' }));
                        }}
                        placeholder="e.g. 110001"
                      />
                      {(isLoading || isFetching) && (
                        <div className="absolute right-3 top-3 text-gray-500">
                          <Loading size={18} />
                        </div>
                      )}
                    </div>
                    {errorMsg.pincode && <ErrorBox msg={errorMsg.pincode} />}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      className="text-sm font-medium text-gray-700"
                      htmlFor="city"
                    >
                      City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      disabled
                      className="h-11 bg-gray-100 text-gray-600 shadow-none"
                      value={enterpriseData.city}
                      placeholder="Auto-filled via pincode"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      className="text-sm font-medium text-gray-700"
                      htmlFor="state"
                    >
                      State <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      disabled
                      className="h-11 bg-gray-100 text-gray-600 shadow-none"
                      value={enterpriseData.state}
                      placeholder="Auto-filled via pincode"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {translations('common.form.label.addNewEntity.address', {
                        defaultValue: 'Detailed Address',
                      })}
                    </Label>
                    <Input
                      name="Address"
                      type="text"
                      className="h-11 bg-gray-50/50 focus:bg-white"
                      id="address"
                      placeholder="Flat/House No., Building, Street Name..."
                      onChange={(e) =>
                        setEnterPriseData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      value={enterpriseData.address}
                    />
                  </div>
                </div>
              </div>

              {/* Authorized Person Section */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Authorized Persons
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Add contacts authorized to operate on behalf of this
                      entity.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddAuthorizedPerson}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-white"
                  >
                    <Plus size={16} />
                    Add Person
                  </Button>
                </div>
                <div className="p-6">
                  {enterpriseData.authorizedPerson?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 py-8 text-center text-sm text-gray-500">
                      No authorized persons added yet. Click &apos;Add
                      Person&apos; to begin.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      {enterpriseData.authorizedPerson.map((person) => (
                        <div
                          key={person.id}
                          className="relative flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 pt-5"
                        >
                          <div className="absolute right-3 top-3">
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveAuthorizedPerson(person.id)
                              }
                              className="text-red-500 transition-colors hover:text-red-600 focus:outline-none"
                              title="Remove person"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-sm font-medium text-gray-700">
                                Name
                              </Label>
                              <Input
                                value={person.name}
                                onChange={(e) =>
                                  handleAuthorizedPersonChange(
                                    person.id,
                                    'name',
                                    e.target.value,
                                  )
                                }
                                placeholder="Enter Name"
                                className="h-11 bg-white"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-sm font-medium text-gray-700">
                                Email
                              </Label>
                              <Input
                                type="email"
                                value={person.email}
                                onChange={(e) =>
                                  handleAuthorizedPersonChange(
                                    person.id,
                                    'email',
                                    e.target.value,
                                  )
                                }
                                placeholder="Enter Email"
                                className="h-11 bg-white"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <Label className="text-sm font-medium text-gray-700">
                                Mobile Number
                              </Label>
                              <Input
                                type="tel"
                                maxLength={10}
                                value={person.mobileNumber}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  if (val.length <= 10) {
                                    handleAuthorizedPersonChange(
                                      person.id,
                                      'mobileNumber',
                                      val,
                                    );
                                  }
                                }}
                                placeholder="Enter Mobile No."
                                className="h-11 bg-white"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="sticky bottom-0 z-10 flex w-full items-center justify-end gap-3 border-t border-gray-200 bg-white p-4">
                <Button
                  type="button"
                  size="sm"
                  onClick={onClose}
                  variant="outline"
                  className="w-32"
                >
                  {translations('common.form.ctas.addNewEntity.cancel', {
                    defaultValue: 'Cancel',
                  })}
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  size="sm"
                  className="w-32"
                >
                  {mutation.isPending ? (
                    <Loading size={18} />
                  ) : mode === 'edit' ? (
                    translations('common.form.ctas.addNewEntity.edit', {
                      defaultValue: 'Save Changes',
                    })
                  ) : (
                    translations('common.form.ctas.addNewEntity.add', {
                      defaultValue: 'Create Entity',
                    })
                  )}
                </Button>
              </div>
            </form>
          )}
      </div>
    </Wrapper>
  );
};

export default EnterpriseForm;
