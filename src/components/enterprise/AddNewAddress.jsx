'use client';

import { addressAPIs } from '@/api/addressApi/addressApis';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getDataFromPinCode } from '@/services/address_Services/AddressServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ErrorBox from '../ui/ErrorBox';
import Loading from '../ui/Loading';
import { Checkbox } from '../ui/checkbox';

export default function AddNewAddress({
  isAddressAdding,
  setIsAddressAdding,
  enterpriseId,
  mutationKey,
  mutationFn,
  invalidateKey,
  editingAddress,
  setEditingAddress,
  editingAddressId,
  setEditingAddressId,
}) {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState('');
  const [address, setAddress] = useState({
    isSezAddress: false,
    pincode: '',
    state: '',
    city: '',
    address: '',
  });

  // Determine whether in "edit" mode
  const isEditing = !!editingAddress;

  const parseAndSetAddress = (editingAddress) => {
    if (!editingAddress?.address) return;

    const parts = editingAddress.address.split(',').map((part) => part.trim());

    if (parts.length < 2) return;

    const stateAndPincode = parts[parts.length - 1]; // last
    const city = parts[parts.length - 2]; // second last

    const rawAddress =
      parts.length > 2 ? parts.slice(0, parts.length - 2).join(', ') : '';

    const [state, pincode] = stateAndPincode.split('-').map((x) => x.trim());

    setAddress({
      isSezAddress: editingAddress.isSezAddress || false,
      address: rawAddress,
      city,
      state,
      pincode,
    });
  };

  // Set fields when editingAddress is passed
  useEffect(() => {
    if (editingAddress) {
      parseAndSetAddress(editingAddress);
    }
  }, [editingAddress]);

  // Fetch city/state from pincode
  const {
    data: addressData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [addressAPIs.getAddressFromPincode.endpointKey, address.pincode],
    enabled: address?.pincode?.length === 6,
    queryFn: async () => {
      try {
        const res = await getDataFromPinCode(address.pincode);
        return res?.data?.data;
      } catch (err) {
        if (err?.response?.status === 400) {
          setErrorMsg((prev) => ({
            ...prev,
            pincode: 'Invalid pincode. Please try valid pincode',
          }));
          setAddress((prev) => ({
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

  // Update city/state from pincode
  useEffect(() => {
    if (addressData) {
      setAddress((prev) => ({
        ...prev,
        city: addressData.district || '',
        state: addressData.state || '',
      }));
    }
  }, [addressData]);

  // Reset on open
  useEffect(() => {
    if (!isAddressAdding && setAddress && setErrorMsg && setEditingAddress) {
      setAddress({
        isSezAddress: false,
        pincode: '',
        state: '',
        city: '',
        address: '',
      });
      setErrorMsg('');
      setEditingAddress(null);
    }
  }, [isAddressAdding]);

  const validateFields = () => {
    const newErrors = {};
    if (!address.pincode || address.pincode.length !== 6) {
      newErrors.pincode = 'Pincode must be 6 digits';
    }
    if (!address.city) {
      newErrors.city = 'City is required';
    }
    if (!address.state) {
      newErrors.state = 'State is required';
    }
    if (!address.address || address.address.trim().length === 0) {
      newErrors.address = 'Address is required';
    }

    setErrorMsg(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save/Add/Update mutation
  const addAddressMutation = useMutation({
    mutationKey: [mutationKey],
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries([invalidateKey]);
      toast.success(
        isEditing
          ? 'Address updated successfully!'
          : 'Address added successfully!',
      );
      setIsAddressAdding(false);
      setAddress({
        pincode: '',
        state: '',
        city: '',
        address: '',
      });
      setErrorMsg('');
      setEditingAddress && setEditingAddress(null);
      setEditingAddressId && setEditingAddressId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  return (
    <Dialog open={isAddressAdding} onOpenChange={setIsAddressAdding}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="pincode">
              Pincode <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                id="pincode"
                name="pincode"
                className="pr-10"
                value={address.pincode}
                onChange={(e) => {
                  const { name, value } = e.target;
                  if (value.length !== 6) {
                    setAddress((prev) => ({
                      ...prev,
                      city: '',
                      state: '',
                    }));
                  }
                  setAddress((prev) => ({
                    ...prev,
                    [name]: value,
                  }));
                  setErrorMsg((prev) => ({
                    ...prev,
                    [name]: '',
                  }));
                }}
                placeholder="Enter Pincode"
              />
              {(isLoading || isFetching) && (
                <div className="absolute right-1 top-2 text-gray-500">
                  <Loading />
                </div>
              )}
            </div>
            {errorMsg.pincode && <ErrorBox msg={errorMsg.pincode} />}
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              name="city"
              disabled
              value={address.city}
              placeholder="Auto-filled via pincode"
            />
            {errorMsg.city && <ErrorBox msg={errorMsg.city} />}
          </div>
        </div>

        <div className="">
          <Label htmlFor="state">
            State <span className="text-red-500">*</span>
          </Label>
          <Input
            id="state"
            name="state"
            value={address.state}
            disabled
            placeholder="Auto-filled via pincode"
          />
          {errorMsg.state && <ErrorBox msg={errorMsg.state} />}
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="address">
            Address <span className="text-red-500">*</span>
          </Label>
          <Input
            name="address"
            type="text"
            id="address"
            onChange={(e) =>
              setAddress((prev) => ({
                ...prev,
                address: e.target.value,
              }))
            }
            value={address.address}
            placeholder="Enter full address"
          />
          {errorMsg.address && <ErrorBox msg={errorMsg.address} />}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <Checkbox
            id="isSezAddress"
            checked={address.isSezAddress}
            onCheckedChange={(checked) =>
              setAddress((prev) => ({
                ...prev,
                isSezAddress: checked,
              }))
            }
          />
          <Label htmlFor="isSezAddress">SEZ address</Label>
        </div>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAddressAdding(false);
                setAddress({
                  pincode: '',
                  state: '',
                  city: '',
                  address: '',
                });
                setErrorMsg('');
                setEditingAddress(null);
              }}
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            type="submit"
            size="sm"
            onClick={() => {
              if (!validateFields()) return;

              const payload = {
                ...address,
                ...(isEditing &&
                  editingAddressId && { addressId: editingAddressId }),
              };

              const mutationPayload = enterpriseId
                ? { id: enterpriseId, data: payload }
                : { data: payload };

              addAddressMutation.mutate(mutationPayload);
            }}
          >
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
