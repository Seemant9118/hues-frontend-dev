import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import {
  addBankAccount,
  getRemainingAttempts,
} from '@/services/BankAccount_Services/BankAccountServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';
import Tooltips from '../auth/Tooltips';

const AddBankAccount = ({
  isModalOpen,
  setIsModalOpen,
  mutationFn,
  userId,
  enterpriseId,
}) => {
  const translations = useTranslations('components.addBankAccount');
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

      if (!userId) {
        fetchRemainingAttempts()
          .then((res) => {
            const used = res.data?.data?.data?.remainingAttempts;
            setAttemptsUsed(typeof used === 'number' ? 3 - used : null);
          })
          .catch(() => {
            setAttemptsUsed(null);
          });
      }
    }
  }, [isModalOpen]);

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = translations(
        'error_account_holder_required',
      );
    }
    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = translations('error_ifsc_required');
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(formData.ifscCode.trim())) {
      newErrors.ifscCode = translations('error_ifsc_invalid');
    }
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = translations('error_account_number_required');
    } else if (formData.accountNumber.length < 9) {
      newErrors.accountNumber = translations('error_account_number_short');
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
      toast.success(translations('toast_success'));
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
      toast.error(
        error?.response?.data?.message || translations('toast_error'),
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (mutationFn) {
      const payload = { ...formData, userAccountId: userId };
      mutationFn.mutate({ id: enterpriseId, data: payload });
    } else {
      addBankAccountMutation.mutate(formData);
    }
  };

  const renderAttemptMessage = () => {
    if (attemptsUsed === null) return null;

    const remaining = attemptsUsed;
    let message = '';
    if (remaining === 3) {
      message = translations('attempt_msg_3');
    } else if (remaining === 2) {
      message = translations('attempt_msg_2');
    } else if (remaining === 1) {
      message = translations('attempt_msg_1');
    } else {
      message = translations('attempt_msg_0');
    }

    return (
      <div className="flex gap-2 rounded-sm bg-muted p-2">
        <Tooltips
          trigger={<Info className="text-red-500" size={14} />}
          content={translations('tooltip_info')}
        />
        <p className="text-xs text-red-500">{message}</p>
      </div>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent>
        <DialogTitle>{translations('dialog_title')}</DialogTitle>

        {isSuccess && renderAttemptMessage()}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Account Holder Name */}
          <div className="space-y-1">
            <Label htmlFor="accountHolderName">
              {translations('label_account_holder')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountHolderName"
              name="accountHolderName"
              value={formData.accountHolderName}
              onChange={handleChange}
              placeholder={translations('placeholder_account_holder')}
            />
            {errors.accountHolderName && (
              <ErrorBox msg={errors.accountHolderName} />
            )}
          </div>

          {/* IFSC Code */}
          <div className="space-y-1">
            <Label htmlFor="ifscCode">
              {translations('label_ifsc')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ifscCode"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder={translations('placeholder_ifsc')}
            />
            {errors.ifscCode && <ErrorBox msg={errors.ifscCode} />}
          </div>

          {/* Account Number */}
          <div className="space-y-1">
            <Label htmlFor="accountNumber">
              {translations('label_account_number')}{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              type="text"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder={translations('placeholder_account_number')}
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
              {translations('btn_cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={addBankAccountMutation.isPending}
            >
              {addBankAccountMutation.isPending ? (
                <Loading />
              ) : (
                translations('btn_cancel')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBankAccount;
