import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import { getFilenameFromUrl } from '@/appUtils/helperFunctions';
import { cn } from '@/lib/utils';
import { getBankAccounts } from '@/services/BankAccount_Services/BankAccountServices';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import PINVerifyModal from '../invoices/PINVerifyModal';
import ViewPdf from '../pdf/ViewPdf';
import AddBankAccount from '../settings/AddBankAccount';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Textarea } from './textarea';

const InvoicePreview = ({
  order,
  isPDFProp,
  setIsPreviewOpen,
  url,
  handleSelectFn,
  isSelectable = false,
  isDownloadable = false,
  handleCreateFn,
  isCreatable = false,
  isCustomerRemarksAddable = false,
  isBankAccountDetailsSelectable = false,
  isSocialLinksAddable = false,
  isActionable = false,
  isPINError,
}) => {
  const [open, setOpen] = useState(false);
  // State to determine if the document is a PDF
  const [isPDF, setIsPDF] = useState(false);
  // State for storing customer remarks
  const [remarks, setRemarks] = useState('');
  // State for selected bank account
  // eslint-disable-next-line no-unused-vars
  const [bankAccount, setBankAccount] = useState('');
  // State for social link input
  const [socialLink, setSocialLink] = useState('');
  const [isBankAccountAdding, setIsBankAccountAdding] = useState(false);

  useEffect(() => {
    if (!url) return;
    setIsPDF(isPDFProp);
  }, [url]);

  const { data: bankAccounts } = useQuery({
    queryKey: [bankAccountApis.getBankAccounts.endpointKey],
    queryFn: () => getBankAccounts(),
    select: (data) => data.data.data,
    enabled: isBankAccountDetailsSelectable,
  });

  return (
    <div className="flex h-full w-full flex-col">
      <div
        className={cn(
          'flex h-full justify-between gap-6',
          !isActionable && 'flex items-center justify-center',
        )}
      >
        {/* Left side: Controls */}
        {isBankAccountDetailsSelectable &&
          isCustomerRemarksAddable &&
          isSocialLinksAddable && (
            <div className="flex h-full w-1/3 flex-col gap-6">
              {isCustomerRemarksAddable && (
                <div>
                  <Label className="text-sm font-medium">Custom Remarks</Label>
                  <Textarea
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Thank you for your business!"
                    rows={4}
                  />
                </div>
              )}

              {isBankAccountAdding && (
                <AddBankAccount
                  isModalOpen={isBankAccountAdding}
                  setIsModalOpen={setIsBankAccountAdding}
                />
              )}

              {isBankAccountDetailsSelectable && (
                <div>
                  <Label className="text-sm font-medium">
                    Select Bank Account details
                  </Label>
                  <Select
                    placeholder="Select Bank Account Details"
                    defaultValue={bankAccount}
                    onValueChange={(value) => {
                      setBankAccount(value);
                    }}
                  >
                    <SelectTrigger placeholder="Select Bank Account Details">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {`Acc ${account.maskedAccountNumber}`}
                        </SelectItem>
                      ))}
                      <div
                        onClick={(e) => {
                          e.stopPropagation(); // prevent closing the dropdown immediately
                          setIsBankAccountAdding(true);
                        }}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold"
                      >
                        <Plus size={14} />
                        Add New Bank Account
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isSocialLinksAddable && (
                <div>
                  <Label className="text-sm font-medium">
                    Add Social links
                  </Label>
                  <Input
                    placeholder="https://twitter.com/yourhandle"
                    value={socialLink}
                    onChange={(e) => setSocialLink(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

        {/* Right side: PDF Preview */}
        <div className="flex h-[600px] w-2/3 items-center justify-center bg-[#F4F4F4]">
          <ViewPdf url={url} isPDF={isPDF} />
        </div>
      </div>

      {/* Footer CTA for downloading the PDF */}

      <div className="flex w-full items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsPreviewOpen(false)}
        >
          Cancel
        </Button>
        {isDownloadable && (
          <Button size="sm" asChild>
            <a href={url} download={getFilenameFromUrl(url)}>
              Download
            </a>
          </Button>
        )}

        {isSelectable && (
          <Button
            size="sm"
            onClick={() => {
              handleSelectFn();
              setIsPreviewOpen(false);
            }}
          >
            Select
          </Button>
        )}

        {isCreatable && (
          <Button
            size="sm"
            onClick={() => {
              setOpen(true);
            }}
          >
            Create Invoice
          </Button>
        )}
      </div>
      <PINVerifyModal
        open={open}
        setOpen={setOpen}
        order={order}
        customerRemarks={remarks}
        socialLinks={socialLink}
        bankAccountId={bankAccount}
        handleCreateFn={handleCreateFn} // pass the full updated order
        isPINError={isPINError}
      />
    </div>
  );
};

export default InvoicePreview;
