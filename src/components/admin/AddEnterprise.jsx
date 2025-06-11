import { addressAPIs } from '@/api/addressApi/addressApis';
import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getDataFromPinCode } from '@/services/address_Services/AddressServices';
import {
  addEnterprise,
  getEnterprisedataFromPAN,
} from '@/services/Admin_Services/AdminServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DatePickers from '../ui/DatePickers';
import ErrorBox from '../ui/ErrorBox';
import Loading from '../ui/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import SubHeader from '../ui/Sub-header';
import Wrapper from '../wrappers/Wrapper';

const AddEnterprise = ({ setIsAddingEnterprise }) => {
  const queryClient = useQueryClient();
  const [errorMsg, setErrorMsg] = useState({});
  const [gstNumberList, setGstNumberList] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    type: '',
    gstNumber: '',
    cinOrLlpin: '',
    udyam: '',
    panNumber: '',
    roc: '',
    doi: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
  });

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // API call to fetch data from PAN
  const { data: enterpriseData } = useQuery({
    queryKey: [
      AdminAPIs.getEnterprisedataFromPAN.endpointKey,
      formData?.panNumber,
    ],
    enabled: !!formData?.type && formData?.panNumber?.length === 10,
    queryFn: () =>
      getEnterprisedataFromPAN({
        type: formData?.type,
        panNumber: formData?.panNumber,
      }),
    select: (res) => res.data.data,
  });

  // Update formData when enterpriseData changes
  useEffect(() => {
    if (enterpriseData) {
      setFormData((prev) => ({
        ...prev,
        name: enterpriseData?.name || '',
        email: enterpriseData?.email || '',
        mobileNumber: enterpriseData?.mobileNumber || '',
        type: enterpriseData?.type || '',
        gstNumber: '',
        cinOrLlpin: enterpriseData?.cin || '',
        udyam: enterpriseData?.udyam || '',
        panNumber: enterpriseData?.panNumber || '',
        roc: enterpriseData?.roc || '',
        doi: enterpriseData?.doi || '',
        address: enterpriseData?.address || '',
        pincode: enterpriseData?.pinCode || '',
        city: enterpriseData?.city || '',
        state: enterpriseData?.state || '',
      }));
      // set all possible gstNumbers fetched
      setGstNumberList(enterpriseData?.gstData?.gstinResList);
    }
  }, [enterpriseData]);

  //   address fetching via pincode
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
          setErrorMsg((prev) => ({
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

  const addEnterpriseMutation = useMutation({
    mutationKey: [AdminAPIs.addEnterprise.endpointKey],
    mutationFn: (data) => addEnterprise(data), // Call the function with passed data
    onSuccess: () => {
      toast.success('Enterprise Added Successfully');
      queryClient.invalidateQueries([AdminAPIs.getOnboardingData.endpointKey]);
      setIsAddingEnterprise(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = () => {
    // Basic validation
    if (!formData.name || !formData.email) {
      toast.error('Enterprise name and email are required.');
      return;
    }

    addEnterpriseMutation.mutate(formData);
  };

  const handleCloseEnterpriseForm = () => {
    setFormData({});
    setIsAddingEnterprise(false);
  };

  return (
    <Wrapper className="scrollBarStyles">
      {/* Headers */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <SubHeader name={'Add Enterprise'} />
      </section>

      {/* Enterprise type */}
      <section className="space-y-2 px-1 py-2">
        <div>
          <Label>Enterprise Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => {
              setFormData({
                ...formData,
                type: value,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Enterprise Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="proprietorship">Proprietorship</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="pvt ltd">Pvt Ltd</SelectItem>
              <SelectItem value="public ltd">Public Ltd</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* document details */}
      <section className="space-y-2 px-1 py-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Document Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>PAN</Label>
            <Input
              placeholder="PAN number"
              value={formData.panNumber}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                setFormData((prev) => ({
                  ...prev,
                  panNumber: value,
                }));
              }}
            />
          </div>
          <div>
            <Label>GST</Label>
            {Array.isArray(gstNumberList) && gstNumberList.length > 0 ? (
              <Select
                value={formData.gstNumber}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    gstNumber: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select GST Number" />
                </SelectTrigger>
                <SelectContent>
                  {gstNumberList.map((gst) => (
                    <SelectItem key={gst?.gstin} value={gst?.gstin}>
                      {gst?.gstin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="GST number"
                value={formData.gstNumber || ''}
                onChange={handleChange('gstNumber')}
              />
            )}
          </div>
          <div>
            <Label>CIN or LLPIN</Label>
            <Input
              placeholder="CIN or LLPIN"
              value={formData.cinOrLlpin}
              onChange={handleChange('cinOrLlpin')}
            />
          </div>
          <div>
            <Label>Udyam</Label>
            <Input
              placeholder="UDYAM number"
              value={formData.udyam}
              onChange={handleChange('udyam')}
            />
          </div>
        </div>
      </section>

      {/* basic info */}
      <section className="space-y-2 px-1 py-2">
        <h3 className="text-sm font-semibold text-gray-700">Basic Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Enterprise Name</Label>
            <Input
              type="text"
              placeholder="Enterprise name"
              value={formData.name}
              onChange={handleChange('name')}
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="Enterprise email"
              value={formData.email}
              onChange={handleChange('email')}
            />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input
              type="number"
              placeholder="Enterprise number"
              value={formData.mobileNumber}
              onChange={handleChange('mobileNumber')}
            />
          </div>

          <div>
            <Label>ROC</Label>
            <Input
              placeholder="Enterprise ROC"
              value={formData.roc}
              onChange={handleChange('roc')}
            />
          </div>

          <div>
            <Label>Date of Incorporation</Label>
            <div className="relative flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <DatePickers
                selected={
                  formData.doi
                    ? moment(formData.doi, 'DD/MM/YYYY').toDate() // ✅ FIX: match the saved format
                    : null
                }
                onChange={(date) => {
                  if (date) {
                    const formattedDate = moment(date).format('DD/MM/YYYY'); // you’re storing this format
                    setFormData((prev) => ({ ...prev, doi: formattedDate }));
                  }
                }}
                placeholderText="Select DOI"
                popperPlacement="top-end"
                dateFormat="dd/MM/yyyy"
                className="w-full rounded-md border px-3 py-2 text-sm"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
          </div>
        </div>
      </section>

      {/* address info */}
      <section className="space-y-2 px-1 py-2">
        <h3 className="text-sm font-semibold text-gray-700">Address Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="pincode">Pincode</Label>
            <div className="relative">
              <Input
                type="number"
                id="pincode"
                name="pincode"
                className="pr-10"
                value={formData.pincode}
                onChange={(e) => {
                  const { name, value } = e.target;
                  if (formData?.pincode?.length !== 5) {
                    setFormData((prev) => ({
                      ...prev,
                      city: '',
                      state: '',
                    }));
                  }
                  setFormData((prev) => ({
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

              {errorMsg.pincode && <ErrorBox msg={errorMsg.pincode} />}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              disabled
              value={formData.city}
              placeholder="Auto-filled via pincode"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            disabled
            placeholder="Auto-filled via pincode"
          />
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
            placeholder="Enterprise address"
            // required={true}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                address: e.target.value,
              }))
            }
            value={formData.address}
          />
        </div>
      </section>

      <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t bg-white py-2 shadow-xl">
        <Button size="sm" variant="outline" onClick={handleCloseEnterpriseForm}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSubmit}>
          Create
        </Button>
      </div>
    </Wrapper>
  );
};

export default AddEnterprise;
