import { CalendarDays, Plus, Search } from 'lucide-react';
import React, { useState } from 'react';
import {
  formattedAmount,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import DynamicFormRenderer from '@/components/shared/DynamicFormRenderer';
import DatePickers from '@/components/ui/DatePickers';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AddBankAccount from '@/components/settings/AddBankAccount';

function saveDraft({ isPurchasePage, data }) {
  if (saveDraftToSession) {
    saveDraftToSession({ isPurchasePage, data });
  }
}

export default function DirectPaymentDetailsSection({
  fields,
  handleSetFields,
  paymentData,
  setPaymentData,
  baseVersion,
  etag,
  originalCustomFields,
  originalSystemFields,
  revision,
  handleSaveSuccess,
  errorMsg,
  setErrorMsg,
  isPurchasePage,
  searchTerm,
  setSearchTerm,
  invoices,
  bankAccounts,
  handleInputChange,
}) {
  const [isBankAccountAdding, setIsBankAccountAdding] = useState(false);

  return (
    <>
      {isBankAccountAdding && (
        <AddBankAccount
          isModalOpen={isBankAccountAdding}
          setIsModalOpen={setIsBankAccountAdding}
        />
      )}
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
        Payment Details
      </span>
      <section className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
        <DynamicFormRenderer
          module="PAYMENT"
          fields={fields}
          setFields={handleSetFields}
          formData={paymentData}
          allowAddField={false}
          baseVersion={baseVersion}
          etag={etag}
          originalCustomFields={originalCustomFields}
          originalSystemFields={originalSystemFields}
          revision={revision}
          onSaveSuccess={handleSaveSuccess}
          filterFn={(f) => {
            const sysKeys = [
              'invoiceId',
              'paymentMode',
              'paymentDate',
              'bankAccountId',
              'transactionId',
              'amount',
              'balance',
            ];
            return f.kind === 'SYSTEM' && sysKeys.includes(f.key);
          }}
          gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          onChange={(key, value) => {
            const updated = {
              ...paymentData,
              [key]: value,
            };
            setPaymentData(updated);
            saveDraft({
              isPurchasePage,
              data: updated,
            });
          }}
          errors={errorMsg}
          renderCustomField={(field) => {
            if (field.key === 'invoiceId') {
              return (
                <Select
                  value={paymentData.invoiceId || ''}
                  onValueChange={(value) => {
                    setPaymentData((prev) => ({
                      ...prev,
                      invoiceId: value,
                    }));
                  }}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Search invoice..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <div className="flex items-center gap-2 px-2 pb-2">
                      <Search size={14} />
                      <Input
                        placeholder="Search invoice..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    {invoices?.map((invoice) => (
                      <SelectItem
                        key={invoice.invoiceId}
                        value={String(invoice.invoiceId)}
                      >
                        {invoice.invoicereferencenumber ||
                          invoice.invoiceReferenceNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }
            if (field.key === 'paymentMode') {
              return (
                <Select
                  value={paymentData.paymentMode}
                  onValueChange={(value) => {
                    if (value) {
                      setErrorMsg((prevMsg) => ({
                        ...prevMsg,
                        paymentMode: '',
                      }));
                    }
                    const updated = {
                      ...paymentData,
                      paymentMode: value,
                    };
                    setPaymentData(updated);
                    saveDraft({
                      isPurchasePage,
                      data: updated,
                    });
                  }}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="neft">NEFT</SelectItem>
                    <SelectItem value="rtgs">RTGS</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="creditDebitCard">
                      Credit/Debit Card
                    </SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              );
            }
            if (field.key === 'paymentDate') {
              return (
                <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <DatePickers
                    selected={
                      paymentData.paymentDate
                        ? new Date(paymentData.paymentDate)
                        : null
                    }
                    onChange={(date) => {
                      const updated = {
                        ...paymentData,
                        paymentDate: date ? date.toISOString() : null,
                      };
                      setPaymentData(updated);
                      saveDraft({
                        isPurchasePage,
                        data: updated,
                      });
                      setErrorMsg((prevMsg) => ({
                        ...prevMsg,
                        paymentDate: '',
                      }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="top-right"
                  />
                  <CalendarDays className="absolute right-2 top-1/2 z-10 -translate-y-1/2 text-[#3F5575]" />
                </div>
              );
            }
            if (field.key === 'bankAccountId') {
              return (
                <Select
                  value={paymentData?.bankAccountId || ''}
                  onValueChange={(value) => {
                    if (value) {
                      setErrorMsg((prevMsg) => ({
                        ...prevMsg,
                        bankAccountId: [],
                      }));
                    }
                    const updated = {
                      ...paymentData,
                      bankAccountId: value,
                    };
                    setPaymentData(updated);
                    saveDraft({
                      isPurchasePage,
                      data: updated,
                    });
                  }}
                >
                  <SelectTrigger
                    className="w-full bg-white"
                    disabled={paymentData.paymentMode === 'cash'}
                  >
                    <SelectValue placeholder="Select Bank Account" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {bankAccounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {`Acc ${account.maskedAccountNumber}`}
                      </SelectItem>
                    ))}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsBankAccountAdding(true);
                      }}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold"
                    >
                      <Plus size={14} />
                      Add New Bank Account
                    </div>
                  </SelectContent>
                </Select>
              );
            }
            if (field.key === 'transactionId') {
              return (
                <Input
                  name="transactionId"
                  value={paymentData.transactionId || ''}
                  disabled={
                    !paymentData.paymentMode ||
                    paymentData.paymentMode === 'cash'
                  }
                  onChange={handleInputChange}
                />
              );
            }
            if (field.key === 'amount') {
              return (
                <Input
                  name="amount"
                  placeholder="0.00"
                  value={paymentData.amount || ''}
                  onChange={handleInputChange}
                />
              );
            }
            if (field.key === 'balance') {
              return (
                <Input
                  disabled
                  value={formattedAmount(paymentData?.balance || 0)}
                />
              );
            }
            return null;
          }}
        />
      </section>
    </>
  );
}
