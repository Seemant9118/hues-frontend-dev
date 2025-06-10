'use client';

import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { capitalize } from '@/appUtils/helperFunctions';
import AddUsers from '@/components/admin/AddUsers';
import { useUserColumns } from '@/components/admin/useUserColumns';
import { VerifyDetailsModal } from '@/components/enterprise/VerifyDetailsModal';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import AddBankAccount from '@/components/settings/AddBankAccount';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrappers/Wrapper';
import { useRBAC } from '@/context/RBACcontext';
import { LocalStorageService } from '@/lib/utils';
import {
  addBankAccountForEnterprise,
  getEnterpriseDetails,
  getEnterpriseResData,
  updateAddressesForEnterprise,
  updateEnterpriseDetails,
} from '@/services/Admin_Services/AdminServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCheck, Eye, MapPin, PencilIcon, Plus } from 'lucide-react';
import moment from 'moment';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const users = [
  {
    id: 1,
    name: 'Lokesh User',
    pan: 'ABCDE1234J',
    email: 'abcd@hgmail.com1',
    mobileNumber: '+91 1234567889',
  },
];

// eslint-disable-next-line no-unused-vars
export default function EnterpriseDetails() {
  const userId = LocalStorageService.get('user_profile');
  const { hasPageAccess, canPerformAction } = useRBAC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const [isUserAdding, setIsUserAdding] = useState(false);
  const [edditedData, setEdditedData] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalOf, setPreviewModalOf] = useState('');
  const [previewField, setPreviewField] = useState(null);
  // overview state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    mobileNumber: '',
  });
  // document state
  const [originalValues, setOriginalValues] = useState({
    gst: '',
    cin: '',
    udyam: '',
    pan: '',
  });

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

  const [editingAddressId, setEditingAddressId] = useState(null);
  const [editedAddress, setEditedAddress] = useState('');

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
      path: `/admin/data/${params.data_id}`,
      show: true, // Always show
    },
  ];

  const { data: enterpriseDetails } = useQuery({
    queryKey: [AdminAPIs.getEnterpriseDetails.endpointKey],
    queryFn: () => getEnterpriseDetails(params.data_id),
    select: (data) => data?.data?.data,
    enabled: canPerformAction('adminReports', 'fetchedAdminData'),
  });

  useEffect(() => {
    if (enterpriseDetails) {
      setFormData({
        name: enterpriseDetails.name || '',
        email: enterpriseDetails.email || '',
        type: enterpriseDetails.type || '',
        mobileNumber: enterpriseDetails.mobileNumber || '',
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

  // handle change of overview
  const handleOverviewChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // handle toggle of document
  const toggleEditDocuments = (key) => {
    setEditStates((prev) => {
      const isEditing = prev[key];

      if (!isEditing) {
        // just entered edit mode, store current value as original
        setOriginalValues((orig) => ({ ...orig, [key]: values[key] }));
      }

      return { ...prev, [key]: !isEditing };
    });
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

  const keyToPayloadField = {
    pan: 'panNumber',
    gst: 'gstNumber',
    cin: 'cinOrLlpin', // updated key here
    udyam: 'udyamNumber',
  };

  // preview modal for api response
  const previewVerificatioDocumentMutation = useMutation({
    mutationKey: [AdminAPIs.getJsonResponseData.endpointKey],
    mutationFn: getEnterpriseResData,
    onSuccess: (res) => {
      const { data } = res.data;
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
      });

      setPreviewModalOf(data.identifier_type);
      setPreviewModalOpen(true);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
    select: (data) => data.data.data,
  });

  // update enterprise
  const updateEnterpriseDetailsMutation = useMutation({
    mutationKey: [AdminAPIs.updateEnterpriseDetails.endpointKey],
    mutationFn: updateEnterpriseDetails,
    onSuccess: () => {
      toast.success('Enterprise details updated Successfully');
      queryClient.invalidateQueries([
        AdminAPIs.getEnterpriseDetails.endpointKey,
      ]);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  // edit address
  const updateAddressesMutation = useMutation({
    mutationKey: [AdminAPIs.updateAddresses.endpointKey],
    mutationFn: updateAddressesForEnterprise,
    onSuccess: () => {
      toast.success('Address updated Successfully');
      queryClient.invalidateQueries([
        AdminAPIs.getEnterpriseDetails.endpointKey,
      ]);
      setEditedAddress('');
      setEditingAddressId(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  // add bank account mutation
  const addBankAccountMutation = useMutation({
    mutationKey: [AdminAPIs.addBankAccountOfEnterprise.endpointKey],
    mutationFn: addBankAccountForEnterprise,
    onSuccess: () => {
      toast.success('Bank account added successfully for enterprise');
      queryClient.invalidateQueries([
        AdminAPIs.getEnterpriseDetails.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  useEffect(() => {
    if (!hasPageAccess('adminReports')) {
      router.replace('/unauthorized');
    }
  }, []);

  const onEditClick = (row) => {
    setEdditedData(row);
    setIsUserAdding(true);
  };

  const userColumns = useUserColumns({ onEditClick });

  return (
    <Wrapper className="scrollBarStyles">
      {/* Headers */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
        <div className="flex gap-2">
          {/* breadcrumbs */}
          <OrderBreadCrumbs possiblePagesBreadcrumbs={dataOrdersBreadCrumbs} />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={
              enterpriseDetails?.isOnboardingComplete ? 'outline' : 'default'
            }
            disabled={enterpriseDetails?.isOnboardingComplete}
            onClick={() => {
              if (!enterpriseDetails?.isOnboardingComplete) {
                updateEnterpriseDetailsMutation.mutate({
                  id: params?.data_id,
                  data: { isOnboardingCompleted: true },
                });
              }
            }}
            className={
              enterpriseDetails?.isOnboardingComplete
                ? 'bg-green-600 text-white'
                : ''
            }
          >
            <CheckCheck size={16} />
            {enterpriseDetails?.isOnboardingComplete
              ? 'Onboarding Completed'
              : 'Mark onboarding as complete'}
          </Button>
        </div>
      </section>
      {/* overview */}
      <div className="space-y-2 border-b px-2 py-2">
        <div className="flex w-full items-center justify-between gap-2">
          <h3 className="text-medium font-semibold">Overview</h3>
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
              onClick={() => {
                if (!isEditing) {
                  setIsEditing(true); // Enter edit mode
                } else {
                  // Save changes
                  updateEnterpriseDetailsMutation.mutate({
                    id: params.data_id,
                    data: formData,
                  });
                  setIsEditing(false); // Exit edit mode after saving
                }
              }}
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
            <div className="flex flex-col gap-2">
              {enterpriseDetails?.addresses?.length > 0 ? (
                enterpriseDetails.addresses.map((addr) => {
                  const isEditing = editingAddressId === addr.id;

                  return (
                    <div
                      key={addr.id}
                      className="flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2"
                    >
                      <div className="flex w-full items-center gap-2">
                        <MapPin size={14} className="shrink-0 text-primary" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedAddress}
                            onChange={(e) => setEditedAddress(e.target.value)}
                            className="w-full rounded border px-2 py-1 text-sm"
                          />
                        ) : (
                          <p
                            className="truncate text-sm font-medium"
                            title={addr.address}
                          >
                            {addr.address || '-'}
                          </p>
                        )}
                      </div>

                      <div className="relative flex gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => {
                                updateAddressesMutation.mutate({
                                  id: params.data_id,
                                  data: {
                                    addressId: editingAddressId,
                                    address: editedAddress,
                                  },
                                });
                              }}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingAddressId(null)}
                              className="text-sm text-gray-500 hover:underline"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingAddressId(addr.id);
                              setEditedAddress(addr.address || '');
                            }}
                            className="absolute right-[-2px] top-[-30px] rounded-full border bg-gray-100 p-2 text-sm text-blue-600 hover:underline"
                          >
                            <PencilIcon size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm font-medium text-gray-500">-</p>
              )}
            </div>
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
                value={formData.mobileNumber}
                onChange={handleOverviewChange('mobileNumber')}
              />
            ) : (
              <p className="font-medium">
                {`+91 ${formData.mobileNumber}` || '-'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* document details */}
      <div className="space-y-2 px-2 py-4">
        <h3 className="text-medium font-semibold">Document Details</h3>
        <div className="grid grid-cols-2 items-end gap-6">
          {fields.map(({ key, label }) => {
            const isEditing = editStates[key];

            // handle Save click
            const handleSave = () => {
              const payloadKey = keyToPayloadField[key] || 'value';
              const payload = {
                [payloadKey]: values[key],
                type: enterpriseDetails?.type,
                userId: enterpriseDetails?.directorId,
              };

              updateEnterpriseDetailsMutation.mutate(
                {
                  id: params.data_id,
                  data: payload,
                },
                {
                  onSuccess: () => {
                    toast.success(`${label} updated successfully`);
                    setEditStates((prev) => ({ ...prev, [key]: false }));
                  },
                  onError: (error) => {
                    toast.error(
                      error?.response?.data?.message || 'Something went wrong',
                    );
                  },
                },
              );
            };

            // handle cancel click
            const handleCancel = (key) => {
              if (values[key] !== originalValues[key]) {
                // revert to original value if changed
                setValues((prev) => ({ ...prev, [key]: originalValues[key] }));
              }
              setEditStates((prev) => ({ ...prev, [key]: false }));
            };

            return (
              <div
                key={key}
                className="flex items-end justify-between gap-2 rounded-md border p-4"
              >
                <div className="flex w-full flex-col gap-2">
                  <Label>{label}</Label>
                  {isEditing ? (
                    <Input
                      value={values[key]}
                      onChange={handleDocumentChange(key)}
                    />
                  ) : (
                    <p className="font-semibold">{values[key] || '-'}</p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  {isEditing && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => handleCancel(key)}
                      >
                        Cancel
                      </Button>
                      <Button variant="blue_outline" onClick={handleSave}>
                        Save
                      </Button>
                    </>
                  )}
                  {!isEditing && values[key] && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        previewVerificatioDocumentMutation.mutate(values[key])
                      }
                    >
                      <Eye size={14} />
                    </Button>
                  )}
                  {!isEditing && (
                    <Button
                      variant="blue_outline"
                      onClick={() => toggleEditDocuments(key)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bank Account details */}
      <div className="space-y-2 border-b px-2 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-medium font-semibold">Bank Account Details</h3>
          <Button
            size="sm"
            variant="blue_outline"
            onClick={() => setIsAddingBankAccount(true)}
          >
            <Plus className="h-4 w-4" />
            Add Bank Account
          </Button>
          <AddBankAccount
            isModalOpen={isAddingBankAccount}
            setIsModalOpen={setIsAddingBankAccount}
            mutationFn={addBankAccountMutation}
            userId={userId}
            enterpriseId={params.data_id}
          />
        </div>
        <div className="space-y-4">
          {enterpriseDetails?.bankAccounts.map((account, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-4"
            >
              <p className="text-sm font-semibold">
                Acc. No: {account.accountNumber} | IFSC: {account.ifscCode}
              </p>

              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    previewVerificatioDocumentMutation.mutate(
                      account.accountNumber,
                    )
                  }
                >
                  <Eye size={14} />
                </Button>
              </div>
            </div>
          ))}

          {enterpriseDetails?.bankAccounts?.length === 0 && (
            <div className="rounded-md bg-gray-100 py-10 text-center text-sm">
              No Bank Account added yet
            </div>
          )}
        </div>
      </div>

      {/* Users */}
      <div className="space-y-2 px-1 py-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-medium font-semibold">Users Details</h3>
          <Button
            size="sm"
            variant="blue_outline"
            onClick={() => {
              setIsUserAdding(true);
              setEdditedData(null);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </Button>
          <AddUsers
            isModalOpen={isUserAdding}
            setIsModalOpen={setIsUserAdding}
            edittedData={edditedData}
            setEdditedData={setEdditedData}
            enterpriseId={params?.data_id}
          />
        </div>
        <div className="space-y-4">
          {enterpriseDetails?.users?.length > 0 && (
            <DataTable columns={userColumns} data={enterpriseDetails?.users} />
          )}
          {users?.length === 0 && (
            <div className="rounded-md bg-gray-100 py-10 text-center text-sm">
              No User added yet
            </div>
          )}
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
