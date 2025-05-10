/* eslint-disable no-unused-vars */
import { addressAPIs } from '@/api/addressApi/addressApis';
import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import { getFilenameFromUrl } from '@/appUtils/helperFunctions';
import { cn } from '@/lib/utils';
import { getAddress } from '@/services/address_Services/AddressServices';
import { getBankAccounts } from '@/services/BankAccount_Services/BankAccountServices';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import PINVerifyModal from '../invoices/PINVerifyModal';
import ViewPdf from '../pdf/ViewPdf';
import AddAddress from '../settings/AddAddress';
import AddBankAccount from '../settings/AddBankAccount';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import Loading from './Loading';
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
  getAddressRelatedData,
  setIsPreviewOpen,
  url,
  handleSelectFn,
  isSelectable = false,
  isDownloadable = false,
  isPendingInvoice,
  handleCreateFn,
  handlePreview,
  isCreatable = false,
  isAddressAddable = false,
  isCustomerRemarksAddable = false,
  isBankAccountDetailsSelectable = false,
  isSocialLinksAddable = false,
  isActionable = false,
  isPINError,
  setIsPINError,
}) => {
  const [open, setOpen] = useState(false);
  // State to determine if the document is a PDF
  const [isPDF, setIsPDF] = useState(false);
  // State for storing customer remarks
  const [remarks, setRemarks] = useState('Thank you for your business!');
  // State for selected bank account
  const [bankAccount, setBankAccount] = useState(null);
  const [billingAddress, setBillingAddress] = useState(order?.billingAddressId);
  const [shippingAddress, setShippingAddress] = useState(
    order?.shippingAddressId,
  );
  // State for social link input
  const [socialLink, setSocialLink] = useState('');
  const [isBankAccountAdding, setIsBankAccountAdding] = useState(false);
  const [isBiilingAddressAdding, setIsBillingAddressAdding] = useState(false);

  useEffect(() => {
    if (!url) return;
    setIsPDF(isPDFProp);
  }, [url]);

  // address fetching

  // bank accounts fetching
  const { data: bankAccounts } = useQuery({
    queryKey: [bankAccountApis.getBankAccounts.endpointKey],
    queryFn: () => getBankAccounts(),
    select: (data) => data.data.data,
    enabled: isBankAccountDetailsSelectable,
  });

  // address fetching
  const { data: addressData, isLoading: isAddressDataLoading } = useQuery({
    queryKey: [addressAPIs.getAddresses.endpointKey],
    queryFn: () =>
      getAddress(
        getAddressRelatedData?.clientId,
        getAddressRelatedData?.clientEnterpriseId,
      ),
    select: (data) => data.data.data,
    enabled: isAddressAddable && order?.clientType === 'B2B',
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
        {isBankAccountDetailsSelectable && isCustomerRemarksAddable && (
          <div className="flex h-full w-1/3 flex-col gap-6">
            {/* address */}
            {isBiilingAddressAdding && (
              <AddAddress
                clientId={getAddressRelatedData?.clientId}
                isModalOpen={isBiilingAddressAdding}
                setIsModalOpen={setIsBillingAddressAdding}
              />
            )}
            {isAddressAddable && (
              <>
                <div>
                  <Label className="text-sm font-medium">
                    Select Client Billing Address
                  </Label>
                  {order.clientType === 'B2C' ? (
                    <Input
                      id="address"
                      name="address"
                      value={order.buyerAddress || ''}
                      disabled
                      placeholder="B2C Address"
                    />
                  ) : (
                    <Select
                      onValueChange={(value) => {
                        setBillingAddress(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Billing Address" />
                      </SelectTrigger>
                      <SelectContent>
                        {isAddressDataLoading && <Loading />}
                        {!isAddressDataLoading &&
                          addressData &&
                          addressData?.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              {address.address}
                            </SelectItem>
                          ))}
                        <div
                          onClick={(e) => {
                            e.stopPropagation(); // prevent closing the dropdown immediately
                            setIsBillingAddressAdding(true);
                          }}
                          className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold"
                        >
                          <Plus size={14} />
                          Add New Address
                        </div>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Select Client Shipping Address
                  </Label>
                  {order.clientType === 'B2C' ? (
                    <Input
                      id="address"
                      name="address"
                      value={order.buyerAddress || ''}
                      disabled
                      placeholder="B2C Address"
                    />
                  ) : (
                    <Select
                      onValueChange={(value) => {
                        setShippingAddress(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Shipping Address" />
                      </SelectTrigger>
                      <SelectContent>
                        {isAddressDataLoading && <Loading />}
                        {!isAddressDataLoading &&
                          addressData &&
                          addressData?.map((address) => (
                            <SelectItem key={address.id} value={address.id}>
                              {address.address}
                            </SelectItem>
                          ))}
                        <div
                          onClick={(e) => {
                            e.stopPropagation(); // prevent closing the dropdown immediately
                            setIsBillingAddressAdding(true);
                          }}
                          className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold"
                        >
                          <Plus size={14} />
                          Add New Address
                        </div>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </>
            )}

            {/* customer remarks */}
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

            {/* bank accounts */}
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
                  onValueChange={(value) => {
                    setBankAccount(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Bank Account Details" />
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

            {/* social links */}
            {isSocialLinksAddable && (
              <div>
                <Label className="text-sm font-medium">Add Social links</Label>
                <Input
                  placeholder="https://twitter.com/yourhandle"
                  value={socialLink}
                  onChange={(e) => setSocialLink(e.target.value)}
                />
              </div>
            )}

            <Button
              size="sm"
              onClick={() => {
                const updatedOrder = {
                  ...order,
                  remarks,
                  bankAccountId: bankAccount,
                  socialLinks: socialLink,
                  billingAddressId: billingAddress,
                  shippingAddressId: shippingAddress,
                };
                handlePreview(updatedOrder);
              }}
            >
              Apply changes
            </Button>
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
        billingAddress={billingAddress}
        shippingAddress={shippingAddress}
        isPendingInvoice={isPendingInvoice}
        handleCreateFn={handleCreateFn} // pass the full updated order
        isPINError={isPINError}
        setIsPINError={setIsPINError}
      />
    </div>
  );
};

export default InvoicePreview;
