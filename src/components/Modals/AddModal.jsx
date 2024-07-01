'use client';

import InputWithLabel from '@/components/ui/InputWithLabel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LocalStorageService } from '@/lib/utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit3, Layers2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { SearchEnterprise } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { sendInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import ErrorBox from '../ui/ErrorBox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';
import { Input } from '../ui/input';

// debouncing function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const AddModal = ({ type, cta, btnName, mutationFunc, userData, id }) => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [open, setOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [enterpriseData, setEnterPriseData] = useState(
    btnName !== 'Edit'
      ? {
          enterpriseId,
          name: '',
          address: '',
          countryCode: '+91',
          mobileNumber: '',
          email: '',
          panNumber: '',
          gstNumber: '',
          userType: cta,
        }
      : {
          enterpriseId,
          name: userData.name,
          address: userData.address,
          countryCode: '+91',
          mobileNumber: userData.mobileNumber,
          email: userData.email,
          panNumber: userData.panNumber,
          gstNumber: userData.gstNumber,
          userType: cta,
        },
  );
  const [errorMsg, setErrorMsg] = useState({});
  const [searchInput, setSearchInput] = useState({
    idType: 'pan',
    idNumber: '',
  });

  const [searchData, setSearchData] = useState([]);

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

  // update enterprise mutation
  const updateMutation = useMutation({
    mutationFn: (data) => mutationFunc(id, data),
    onSuccess: (data) => {
      if (!data.data.status) {
        this.onError();
        return;
      }

      toast.success('Edited Successfully');
      setOpen((prev) => !prev);
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

    if (enterpriseDataItem.address === '') {
      errorObj.address = '*Required Address';
    }

    if (enterpriseDataItem.mobileNumber === '') {
      errorObj.mobileNumber = '*Required Phone';
    } else if (enterpriseDataItem.mobileNumber.length !== 10) {
      errorObj.mobileNumber = '*Please enter a valid mobile number';
    }

    if (enterpriseDataItem.email === '') {
      errorObj.email = '*Required Email';
    } else if (!emailPattern.test(enterpriseDataItem.email)) {
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
      const searchState = { ...prev, [id]: value };
      debouncedMutation(searchState); // Call debounced mutation function with new state
      return searchState;
    });
  };

  const handleSendInvite = (id) => {
    sendInvite.mutate({
      fromEnterpriseId: enterpriseId,
      toEnterpriseId: id,
      invitationType: cta === 'client' ? 'CLIENT' : 'VENDOR',
    });
  };

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
      <DialogTrigger asChild>
        {btnName === 'Edit' ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-sm px-2 py-1.5 hover:cursor-pointer hover:bg-slate-100">
            <Edit3 size={12} />
            Edit{' '}
          </div>
        ) : (
          <Button variant={'blue_outline'} size="sm" className="w-full">
            <Layers2 size={14} />
            {btnName}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{cta.toUpperCase()}</DialogTitle>

        {/* search inputs */}
        {!isAdding && btnName !== 'Edit' && (
          <form>
            <div className="flex items-center justify-center gap-4">
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
                    <SelectItem value="udyam">UDYAM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-1/2 flex-col gap-1">
                <InputWithLabel
                  className="rounded-md"
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
        {!isAdding && btnName !== 'Edit' && (
          <div className="scrollBarStyles flex max-h-[200px] flex-col gap-4 overflow-auto p-4">
            {searchMutation.isPending && <Loading />}
            {searchData &&
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
                  <Button onClick={() => handleSendInvite(sdata.id)}>
                    Invite
                  </Button>
                </div>
              ))}

            {searchData?.length === 0 && searchInput?.idNumber?.length >= 3 && (
              <span>
                Enterprise not available,{' '}
                <Button variant="link" onClick={() => setIsAdding(true)}>
                  Add details
                </Button>
              </span>
            )}

            {searchInput?.idNumber?.length < 3 && (
              <span className="text-sm">By typing Identifier to search</span>
            )}
          </div>
        )}

        {/* if client does not in our client list then, create client */}
        {isAdding && searchData?.length === 0 && btnName !== 'Edit' && (
          <form
            className="rounded-md p-2"
            onSubmit={btnName === 'Edit' ? handleEditSubmit : handleSubmit}
          >
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
                  <span className="text-red-600">*</span>
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
                    type="tel"
                    id="panNumber"
                    // required={true}
                    onChange={(e) =>
                      setEnterPriseData((prev) => ({
                        ...prev,
                        panNumber: e.target.value,
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
                  <span className="text-red-600">*</span>
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
                {errorMsg.address && <ErrorBox msg={errorMsg.address} />}
              </div>
            </div>

            <div className="h-[1px] bg-neutral-300"></div>

            <div className="mt-3 flex items-center justify-end gap-4">
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    setErrorMsg({});
                    if (btnName !== 'Edit') {
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
                      setIsAdding(false);
                      setSearchInput({});
                    }
                    setOpen(false);
                  }}
                  variant={'outline'}
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit">
                {btnName === 'Edit' ? 'Edit' : type}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddModal;
