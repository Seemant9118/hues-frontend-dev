import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import {
  addBankAccount,
  getRemainingAttempts,
} from '@/services/BankAccount_Services/BankAccountServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';
import Tooltips from '../auth/Tooltips';

const AddBankAccount = ({ isModalOpen, setIsModalOpen }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    accountHolderName: '',
    ifscCode: '',
    accountNumber: '',
  });
  const [errors, setErrors] = useState({});
  const [attemptsUsed, setAttemptsUsed] = useState(null);

  const { isSuccess, refetch: fetchRemainingAttempts } = useQuery({
    queryKey: [bankAccountApis.getRemainingAttempts.endpointKey],
    queryFn: getRemainingAttempts,
    enabled: false,
  });

  useEffect(() => {
    if (isModalOpen) {
      setFormData({
        accountHolderName: '',
        ifscCode: '',
        accountNumber: '',
      });
      setErrors({});
      setAttemptsUsed(null);

      fetchRemainingAttempts()
        .then((res) => {
          const used = res.data?.data?.data?.remainingAttempts;
          setAttemptsUsed(typeof used === 'number' ? 3 - used : null);
        })
        .catch(() => {
          setAttemptsUsed(null);
        });
    }
  }, [isModalOpen]);

  const handleClose = () => {
    setIsModalOpen(false);
  };

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
    const cleanedValue =
      name === 'ifscCode'
        ? value.toUpperCase().replace(/[^A-Z0-9]/g, '')
        : value;

    setFormData((prev) => ({ ...prev, [name]: cleanedValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const addBankAccountMutation = useMutation({
    mutationKey: [bankAccountApis.addBankAccount.endpointKey],
    mutationFn: addBankAccount,
    onSuccess: () => {
      toast.success('Bank account added successfully!');
      queryClient.invalidateQueries([
        bankAccountApis.getBankAccounts.endpointKey,
      ]);
      handleClose();
    },
    onError: (error) => {
      const latestAttempts =
        error?.response?.data?.data?.remainingAttempts?.remainingAttempts;
      if (typeof latestAttempts === 'number') {
        setAttemptsUsed(latestAttempts);
      }
      toast.error(error?.response?.data?.message || 'Something went wrong');
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

  const renderAttemptMessage = () => {
    if (attemptsUsed === null) return null;

    const remaining = attemptsUsed;
    let message = '';
    if (remaining === 3) {
      message = 'You have only three attempts available for today.';
    } else if (remaining === 2) {
      message = 'You have only two attempts left for today.';
    } else if (remaining === 1) {
      message = 'You have only one attempt left for today.';
    } else {
      message = 'You have exhausted all your attempts for today.';
    }

    return (
      <div className="flex gap-2 rounded-sm bg-muted p-2">
        <Tooltips
          trigger={<Info className="text-red-500" size={14} />}
          content="You can try adding a bank account up to three times each day. If you reach the limit, please wait until tomorrow to try again."
        />
        <p className="text-xs text-red-500">{message}</p>
      </div>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogTitle>Add a Bank Account</DialogTitle>

        {isSuccess && renderAttemptMessage()}

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

          {/* Account Number */}
          <div className="space-y-1">
            <Label htmlFor="accountNumber">
              Bank Account Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              type="text"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter account number"
            />
            {errors.accountNumber && <ErrorBox msg={errors.accountNumber} />}
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
