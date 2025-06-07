'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Input } from '../ui/input';
import Wrapper from '../wrappers/Wrapper';
import AddBankAccount from '../settings/AddBankAccount';
import { VerifyDetailsModal } from './VerifyDetailsModal';

// eslint-disable-next-line no-unused-vars
export default function EnterpriseDetailsComponent({ enterpriseDetails }) {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewField, setPreviewField] = useState({ label: '', value: '' });

  // overview state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Parth Enterprise (B2B)',
    email: 'parth@gmail.com',
    address: '123 Main Street, Mumbai, Maharashtra, India - 400001',
    type: 'Public',
    phone: '+91 923-484-3292',
  });
  // document state
  const initialValues = {
    gst: '123445',
    cin: '123',
    udyam: '00000',
    pan: 'PANB23445',
  };
  const [values, setValues] = useState(initialValues);
  const [editStates, setEditStates] = useState({
    gst: false,
    cin: false,
    udyam: false,
    pan: false,
  });
  // bankaccount state
  const [isAddingBankAccount, setIsAddingBankAccount] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([
    { accNo: '1344595959590', ifsc: 'ISHS8283', isEditing: false },
    { accNo: '8899776644331', ifsc: 'HDFC0001234', isEditing: false },
  ]);

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

  // handle toggle of bank accounts
  const toggleEditBankAccount = (index) => {
    setBankAccounts((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, isEditing: !item.isEditing } : item,
      ),
    );
  };

  // handle change of bank accounts
  const handleChangeBankAccount = (index, field) => (e) => {
    const { value } = e.target;
    setBankAccounts((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  return (
    <Wrapper className="scrollBarStyles overflow-auto">
      {/* overview */}
      <div className="space-y-2 border-b px-2 py-4">
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
              <p className="font-medium">{formData.name}</p>
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
              <p className="font-medium">{formData.email}</p>
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
                {formData.address}
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
              <p className="font-medium">{formData.type}</p>
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
              <p className="font-medium">{formData.phone}</p>
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
                  <p className="font-semibold">{values[key]}</p>
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
                {!editStates[key] && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPreviewField({ label, value: values[key] });
                      setPreviewModalOpen(true);
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
              {account.isEditing ? (
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
                  <Input
                    placeholder="Account No"
                    value={account.accNo}
                    onChange={handleChangeBankAccount(index, 'accNo')}
                    className="w-full sm:w-[200px]"
                  />
                  <Input
                    placeholder="IFSC"
                    value={account.ifsc}
                    onChange={handleChangeBankAccount(index, 'ifsc')}
                    className="w-full sm:w-[200px]"
                  />
                </div>
              ) : (
                <p className="text-sm font-semibold">
                  Acc. No: {account.accNo} | IFSC: {account.ifsc}
                </p>
              )}

              <div className="flex justify-end gap-2">
                {account.isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleEditBankAccount(index)}
                  >
                    Cancel
                  </Button>
                )}
                {!account.isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPreviewField({
                        label: `Bank Account #${index + 1}`,
                        value: `Acc. No: ${account.accNo} | IFSC: ${account.ifsc}`,
                      });
                      setPreviewModalOpen(true);
                    }}
                  >
                    <Eye size={14} />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="blue_outline"
                  onClick={() => toggleEditBankAccount(index)}
                >
                  {account.isEditing ? 'Save' : 'Edit'}
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
        field={previewField}
      />
    </Wrapper>
  );
}
