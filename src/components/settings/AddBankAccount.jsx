import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import { addBankAccount } from '@/services/BankAccount_Services/BankAccountServices';
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';

const AddBankAccount = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountHolderName: '',
    ifscCode: '',
    accountNumber: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(formData.ifscCode.trim())) {
      newErrors.ifscCode = 'Invalid IFSC code format';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (formData.accountNumber.length < 9) {
      newErrors.accountNumber = 'Account number must be at least 9 digits';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'ifscCode') {
      const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      setFormData((prev) => ({
        ...prev,
        [name]: upperValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  // add bank accounts mutation
  const addBankAccountMutation = useMutation({
    mutationKey: [bankAccountApis.addBankAccount.endpointKey],
    mutationFn: addBankAccount,
    onSuccess: () => {
      toast.success('Bank account added successfully!');
      setIsOpen(false);
      setFormData({
        accountHolderName: '',
        ifscCode: '',
        accountNumber: '',
      });
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

    addBankAccountMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex w-full items-center justify-between gap-2 rounded-md border p-4">
        <div className="flex flex-col items-start gap-1 text-sm">
          <p className="font-bold">Add a bank account</p>
          <p className="text-gray-400">
            Add a bank account to your Hues account
          </p>
        </div>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="blue_outline"
            onClick={() => setIsOpen(true)}
          >
            Add Bank Account
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent>
        <DialogTitle>Add a Bank Account</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Account Holder Name */}
          <div className="space-y-1">
            <Label htmlFor="accountHolderName">
              Account Holder Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountHolderName"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder="Enter Account holder name"
            />
            {errors.accountHolderName && (
              <ErrorBox msg={errors.accountHolderName} />
            )}
          </div>

          {/* IFSC Code */}
          <div className="space-y-1">
            <Label htmlFor="ifscCode">
              IFSC Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ifscCode"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="Enter IFSC code"
            />
            {errors.ifscCode && <ErrorBox msg={errors.ifscCode} />}
          </div>

          {/* Bank Account Number */}
          <div className="space-y-1">
            <Label htmlFor="accountNumber">
              Bank Account Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              type="number"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter account number"
            />
            {errors.accountNumber && <ErrorBox msg={errors.accountNumber} />}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setFormData({
                  accountHolderName: '',
                  ifscCode: '',
                  accountNumber: '',
                });
                setIsOpen(false);
              }}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={addBankAccountMutation.isPending}
            >
              {addBankAccountMutation.isPending ? <Loading /> : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBankAccount;
