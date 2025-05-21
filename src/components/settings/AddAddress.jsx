import { addressAPIs } from '@/api/addressApi/addressApis';
import {
  addClientAddress,
  getDataFromPinCode,
} from '@/services/address_Services/AddressServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';

const AddAddress = ({ clientId, isModalOpen, setIsModalOpen }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    clientId,
    pincode: '',
    city: '',
    state: '',
    address: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isModalOpen) {
      setFormData({
        clientId,
        pincode: '',
        city: '',
        state: '',
        address: '',
      });
      setErrors({});
    }
  }, [isModalOpen, clientId]);

  const handleClose = () => {
    setIsModalOpen(false);
    setFormData({
      clientId,
      pincode: '',
      city: '',
      state: '',
      address: '',
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (formData.pincode.length !== 6) {
      newErrors.pincode = 'Enter a valid Pincode';
    }

    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'pincode') {
      if (formData?.pincode?.length !== 5) {
        setFormData((prev) => ({
          ...prev,
          city: '',
          state: '',
        }));
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const {
    data: addressData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [addressAPIs.getAddressFromPincode.endpointKey, formData.pincode],
    enabled: formData?.pincode?.length === 6,
    queryFn: async () => {
      try {
        const res = await getDataFromPinCode(formData.pincode);
        return res?.data?.data;
      } catch (err) {
        if (err?.response?.status === 400) {
          setErrors((prev) => ({
            ...prev,
            pincode: 'Invalid pincode. Please try valid pincode',
          }));
          setFormData((prev) => ({
            ...prev,
            city: '',
            state: '',
          }));
        } else {
          toast.error('Failed to fetch address details');
        }
        throw err; // rethrow so React Query knows it failed
      }
    },
    retry: false,
  });

  useEffect(() => {
    if (addressData) {
      setFormData((prev) => ({
        ...prev,
        city: addressData.district || '',
        state: addressData.state || '',
      }));
    }
  }, [addressData]);

  const addAddressMutation = useMutation({
    mutationKey: [addressAPIs.addAddressClient?.endpointKey],
    mutationFn: addClientAddress, // Make sure this exists in your services
    onSuccess: () => {
      queryClient.invalidateQueries([addressAPIs.getAddresses.endpointKey]);
      toast.success('Address added successfully!');
      handleClose();
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    addAddressMutation.mutate(formData);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogTitle>Add New Address</DialogTitle>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="flex w-full items-center gap-2">
            <div className="w-1/2">
              <Label htmlFor="pincode">
                Pincode <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  id="pincode"
                  name="pincode"
                  className="pr-10"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter Pincode"
                />
                {(isLoading || isFetching) && (
                  <div className="absolute right-1 top-2 text-gray-500">
                    <Loading />
                  </div>
                )}
              </div>
              {errors.pincode && <ErrorBox msg={errors.pincode} />}
            </div>

            <div className="w-1/2 space-y-1">
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                disabled
                value={formData.city}
                placeholder="Auto-filled via pincode"
              />
              {errors.city && <ErrorBox msg={errors.city} />}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="state">
              State <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              disabled
              placeholder="Auto-filled via pincode"
            />
            {errors.state && <ErrorBox msg={errors.state} />}
          </div>

          <div className="space-y-1">
            <Label htmlFor="address">
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter Address"
            />
            {errors.address && <ErrorBox msg={errors.address} />}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={addAddressMutation.isPending}
            >
              {addAddressMutation.isPending ? <Loading /> : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAddress;
