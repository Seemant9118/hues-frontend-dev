'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { capitalize } from '@/appUtils/helperFunctions';
import { VerifyDetailsModal } from '@/components/enterprise/VerifyDetailsModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import AddBankAccount from '@/components/settings/AddBankAccount';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrappers/Wrapper';
import {
  getEnterpriseDetails,
  getEnterpriseResData,
} from '@/services/Admin_Services/AdminServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CheckCheck, Eye } from 'lucide-react';
import moment from 'moment';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// eslint-disable-next-line no-unused-vars
export default function EnterpriseDetails() {
  const params = useParams();
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalOf, setPreviewModalOf] = useState('');
  const [previewField, setPreviewField] = useState(null);
  // overview state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    type: '',
    phone: '',
  });
  // document state
  const [values, setValues] = useState({
    gst: '',
    cin: '',
    udyam: '',
    pan: '',
  });
  const [editStates, setEditStates] = useState({
    gst: false,
    cin: false,
    udyam: false,
    pan: false,
  });

  const dataOrdersBreadCrumbs = [
    {
      id: 1,
      name: 'Data',
      path: '/admin/data/',
      show: true, // Always show
    },
    {
      id: 2,
      name: 'Enterprise Details',
      path: `/admin/data//${params.data_id}`,
      show: true, // Always show
    },
  ];

  const { data: enterpriseDetails } = useQuery({
    queryKey: [AdminAPIs.getEnterpriseDetails.endpointKey],
    queryFn: () => getEnterpriseDetails(params.data_id),
    select: (data) => data?.data?.data,
  });

  useEffect(() => {
    if (enterpriseDetails) {
      setFormData({
        name: enterpriseDetails.name || '',
        email: enterpriseDetails.email || '',
        address: enterpriseDetails.address || '',
        type: enterpriseDetails.type || '',
        phone: enterpriseDetails.mobileNumber || '',
      });

      setValues({
        gst: enterpriseDetails.gstNumber || '',
        cin: enterpriseDetails.cin || '',
        udyam: enterpriseDetails.udyam || '',
        pan: enterpriseDetails.panNumber || '',
      });
    }
  }, [enterpriseDetails]);

  // bankaccount state
  const [isAddingBankAccount, setIsAddingBankAccount] = useState(false);
  const bankAccounts = [
    { accNo: '1344595959590', ifsc: 'ISHS8283', isEditing: false },
    { accNo: '8899776644331', ifsc: 'HDFC0001234', isEditing: false },
  ];

  // handle change of overview
  const handleOverviewChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // handle toggle of document
  const toggleEditDocuments = (key) => {
    setEditStates((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  // handle change of document
  const handleDocumentChange = (key) => (e) => {
    setValues((prev) => ({ ...prev, [key]: e.target.value }));
  };
  // static labels of documents
  const fields = [
    { key: 'gst', label: 'GST Number' },
    { key: 'cin', label: 'CIN' },
    { key: 'udyam', label: 'UDYAM' },
    { key: 'pan', label: 'PAN' },
  ];

  const previewVerificatioDocumentMutation = useMutation({
    mutationKey: [AdminAPIs.getJsonResponseData.endpointKey],
    mutationFn: getEnterpriseResData,
    onSuccess: (res) => {
      const { data } = res.data;

      const gstData = data.verification_details?.gstData || {};

      const formattedDetails = [
        { label: 'GST URL', value: gstData.url || 'N/A' },
        { label: 'GST Message', value: gstData.message || 'N/A' },
        { label: 'GST Error Code', value: gstData.errorCode || 'N/A' },
      ];

      setPreviewField({
        givenDetails: [
          { label: data.identifier_type, value: data.identifier },
          { label: 'Name', value: formData.name },
          {
            label: 'Date',
            value: moment(data.created_at).format('DD/MM/YYYY'),
          },
        ],
        label: data.identifier_type,
        value: data.identifier,
        verification_details: data.verification_details,
        formattedDetails, // 👈 add this for modal display
      });

      setPreviewModalOf(data.identifier_type);
      setPreviewModalOpen(true);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
    select: (data) => data.data.data,
  });

  return (
    <Wrapper className="scrollBarStyles">
      {/* Headers */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <div className="flex gap-2">
          {/* breadcrumbs */}
          <OrderBreadCrumbs possiblePagesBreadcrumbs={dataOrdersBreadCrumbs} />
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <CheckCheck size={16} />
            Mark onboarding as complete
          </Button>
        </div>
      </section>
      {/* overview */}
      <div className="space-y-2 border-b px-2 py-2">
        <div className="flex w-full items-center justify-between gap-2">
          <h3 className="text-medium font-semibold text-gray-400">Overview</h3>
          <div className="flex justify-end gap-2">
            {isEditing && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
            <Button
              size="sm"
              variant="blue_outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Save' : 'Edit Details'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 grid-rows-2 gap-6">
          {/* Enterprise Name */}
          <div>
            <Label>Enterprise Name</Label>
            {isEditing ? (
              <Input
                value={formData.name}
                onChange={handleOverviewChange('name')}
              />
            ) : (
              <p className="font-medium">{formData.name || '-'}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            {isEditing ? (
              <Input
                value={formData.email}
                onChange={handleOverviewChange('email')}
              />
            ) : (
              <p className="font-medium">{formData.email || '-'}</p>
            )}
          </div>

          {/* Address (spans 2 rows) */}
          <div className="row-span-2">
            <Label>Address</Label>
            {isEditing ? (
              <textarea
                className="w-full rounded-md border px-3 py-2 text-sm"
                rows={4}
                value={formData.address}
                onChange={handleOverviewChange('address')}
              />
            ) : (
              <p className="whitespace-pre-line font-medium">
                {formData.address || '-'}
              </p>
            )}
          </div>

          {/* Enterprise Type */}
          <div>
            <Label>Enterprise Type</Label>
            {isEditing ? (
              <Input
                value={formData.type}
                onChange={handleOverviewChange('type')}
              />
            ) : (
              <p className="font-medium">{capitalize(formData.type) || '-'}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <Label>Phone</Label>
            {isEditing ? (
              <Input
                value={formData.phone}
                onChange={handleOverviewChange('phone')}
              />
            ) : (
              <p className="font-medium">{`+91 ${formData.phone}` || '-'}</p>
            )}
          </div>
        </div>
      </div>

      {/* document details */}
      <div className="space-y-2 px-2 py-4">
        <h3 className="text-medium font-semibold text-gray-400">
          Document Details
        </h3>
        <div className="grid grid-cols-2 items-end gap-6">
          {fields.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-end justify-between gap-2 rounded-md border p-4"
            >
              <div className="flex w-full flex-col gap-2">
                <Label>{label}</Label>
                {editStates[key] ? (
                  <Input
                    value={values[key]}
                    onChange={handleDocumentChange(key)}
                  />
                ) : (
                  <p className="font-semibold">{values[key] || '-'}</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                {editStates[key] && (
                  <Button
                    variant="outline"
                    onClick={() => toggleEditDocuments(key)}
                  >
                    Cancel
                  </Button>
                )}
                {!editStates[key] && values[key] && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      previewVerificatioDocumentMutation.mutate(values[key]);
                    }}
                  >
                    <Eye size={14} />
                  </Button>
                )}
                <Button
                  variant="blue_outline"
                  onClick={() => toggleEditDocuments(key)}
                >
                  {editStates[key] ? 'Save' : 'Edit'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Account details */}
      <div className="space-y-2 border-b px-2 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Bank Account Details</h3>
          <Button
            size="sm"
            variant="blue_outline"
            onClick={() => setIsAddingBankAccount(true)}
          >
            Add Bank Account
          </Button>
          <AddBankAccount
            isModalOpen={isAddingBankAccount}
            setIsModalOpen={setIsAddingBankAccount}
          />
        </div>
        <div className="space-y-4">
          {bankAccounts.map((account, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-4"
            >
              <p className="text-sm font-semibold">
                Acc. No: {account.accNo} | IFSC: {account.ifsc}
              </p>

              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={() => {}}>
                  <Eye size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      {/* <div className="space-y-2 px-2 py-4">
        <div className="flex w-full flex-col justify-between gap-4">
          <div className="flex w-full items-center justify-between gap-2">
            <h3 className="text-medium font-semibold text-gray-400">
              Payment Details
            </h3>
            <Button variant="blue_outline" size="sm">
              Edit Details
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col justify-between">
              <Label>Payment Terms</Label>
              <p className="mt-2 font-medium">
                Payment due 15 days after the invoice date
              </p>
            </div>

            <div className="flex flex-col justify-between">
              <Label>Due Date</Label>
              <p className="mt-2 font-medium">12/06/2025</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Director Details */}
      {/* <div className="space-y-2 px-2 py-4">
        <div className="flex w-full flex-col justify-between gap-4">
          <div className="flex w-full items-center justify-between gap-2">
            <h3 className="text-medium font-semibold text-gray-400">
              Director Details
            </h3>
            <Button variant="blue_outline" size="sm">
              Edit Details
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col justify-between">
              <Label>Director Name</Label>
              <p className="mt-2 font-medium">Rathode</p>
            </div>

            <div className="flex flex-col justify-between">
              <Label>Phone</Label>
              <p className="mt-2 font-medium">+91 1234567890</p>
            </div>
          </div>
        </div>
      </div> */}

      <VerifyDetailsModal
        open={previewModalOpen}
        onOpenChange={setPreviewModalOpen}
        title={previewModalOf}
        givenDetails={previewField?.givenDetails || []}
        apiResponse={previewField?.verification_details}
      />
    </Wrapper>
  );
}
