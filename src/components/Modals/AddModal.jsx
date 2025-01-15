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
import { Layers2 } from 'lucide-react';
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

const AddModal = ({ type, cta, btnName, mutationFunc, isOpen, setIsOpen }) => {
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
        toast.success('Invitation sent successfully');
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  // add enterprise mutation
  const mutation = useMutation({
    mutationFn: mutationFunc,
    onSuccess: () => {
      toast.success(
        cta === 'client'
          ? 'Client Added Successfully'
          : 'Vendor Added Successfully',
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
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // validation
  const validation = (enterpriseDataItem) => {
    const errorObj = {};
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

    if (enterpriseDataItem.name === '') {
      errorObj.name = '*Required Name';
    }

    // if (enterpriseDataItem.address === '') {
    //   errorObj.address = '*Required Address';
    // }

    if (enterpriseDataItem.mobileNumber === '') {
      errorObj.mobileNumber = '*Required Phone';
    } else if (enterpriseDataItem.mobileNumber.length !== 10) {
      errorObj.mobileNumber = '*Please enter a valid mobile number';
    }

    // if (enterpriseDataItem.email === '') {
    //   errorObj.email = '*Required Email';
    // }
    if (
      enterpriseDataItem?.email.length > 0 &&
      !emailPattern.test(enterpriseDataItem.email)
    ) {
      errorObj.email = '*Please provide valid email';
    }

    if (enterpriseDataItem.panNumber === '') {
      errorObj.panNumber = '*Required PAN';
    } else if (!panPattern.test(enterpriseDataItem.panNumber)) {
      errorObj.panNumber = '* Please provide valid PAN Number';
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
          <Button variant={'blue_outline'} size="sm" className="w-full">
            <Layers2 size={14} />
            {btnName}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogTitle>{cta.toUpperCase()}</DialogTitle>

        {/* search inputs */}
        {!isAdding && (
          <form>
            <div className="flex items-center justify-between gap-4">
              <div className="flex w-1/2 flex-col gap-0.5">
                <div>
                  <Label className="flex-shrink-0">Identifier Type</Label>{' '}
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
                    <SelectItem value="gst">GST</SelectItem>
                    <SelectItem value="pan">PAN</SelectItem>
                    {/* <SelectItem value="udyam">UDYAM</SelectItem> */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <InputWithLabel
                  className="max-w-sm rounded-md"
                  name={`Identifier No. (${searchInput?.idType?.toUpperCase()})`}
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
                      Invite sent
                    </Button>
                  ) : (
                    <Button onClick={() => handleSendInvite(sdata.id)}>
                      Invite
                    </Button>
                  )}
                </div>
              ))}

            {searchData?.length === 0 && searchInput?.idNumber?.length >= 3 && (
              <div className="flex flex-col gap-1 px-2">
                <span className="text-sm font-semibold">
                  Enterprise not available.
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
                          Continue to add new {cta}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-red-600">
                          Please complete the PAN to proceed
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
                          Continue to add new {cta}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-red-600">
                          Please complete the GST number to proceed
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
                Type an identifier to search
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
                  <Label>Name</Label>
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
                    e.target.value === ''
                      ? setErrorMsg('*Please fill required details - Name')
                      : setErrorMsg('');
                  }}
                  value={enterpriseData.name}
                />
                {errorMsg.name && <ErrorBox msg={errorMsg.name} />}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-1">
                  <Label>GST IN</Label>
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
                  <Label>Email</Label>
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
                    <Label>Phone</Label>
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
                    <Label>PAN</Label>
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
                  <Label>Address</Label>
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
                Cancel
              </Button>

              <Button type="submit" size="sm">
                {type}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddModal;
