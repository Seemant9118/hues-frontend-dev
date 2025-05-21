/* eslint-disable no-unused-vars */
import { settingsAPI } from '@/api/settings/settingsApi';
import { getFilenameFromUrl } from '@/appUtils/helperFunctions';
import { cn } from '@/lib/utils';
import { getInvoicePreviewConfig } from '@/services/Settings_Services/SettingsService';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Plus } from 'lucide-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import PINVerifyModal from '../invoices/PINVerifyModal';
import ViewPdf from '../pdf/ViewPdf';
import AddAddress from '../settings/AddAddress';
import AddBankAccount from '../settings/AddBankAccount';
import { Button } from './button';
import DatePickers from './DatePickers';
import ErrorBox from './ErrorBox';
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
  setIsPINError = false,
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
  const [paymentTerms, setPaymentTerms] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [paymentDueDate, setPaymentDueDate] = useState(null);
  // State for social link input
  const [socialLink, setSocialLink] = useState('');
  const [isBankAccountAdding, setIsBankAccountAdding] = useState(false);
  const [isBiilingAddressAdding, setIsBillingAddressAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const validation = (order) => {
    const errors = {};
    // address
    if (!order?.billingAddressId) {
      errors.billingAddress = '*Required! Please select billing address';
    }
    if (!order?.shippingAddressId) {
      errors.shippingAddress = '*Required! Please select shipping address';
    }
    return errors;
  };

  useEffect(() => {
    if (!url) return;
    setIsPDF(isPDFProp);
  }, [url]);

  // fetching req data for invoice preview
  const { data: invoicePreviewConfig, isLoading } = useQuery({
    queryKey: [settingsAPI.invoicePreviewConfig.endpointKey],
    queryFn: () =>
      getInvoicePreviewConfig({
        clientId: getAddressRelatedData?.clientId,
        clientEnterpriseId: getAddressRelatedData?.clientEnterpriseId,
      }),
    select: (data) => data.data.data,
    enabled: !!isCreatable,
  });
  useEffect(() => {
    if (!invoicePreviewConfig) return;

    // remarks
    setRemarks(invoicePreviewConfig.defaultRemarks);

    // due date (number of days)
    const dueInDays = Number(invoicePreviewConfig.dueDate);
    setPaymentDueDate(dueInDays);

    // Calculate selected date as today + dueDate days
    const today = new Date();
    const calculatedDate = new Date(today);
    calculatedDate.setDate(today.getDate() + dueInDays);
    setSelectedDate(calculatedDate);

    // payment terms
    setPaymentTerms(invoicePreviewConfig.paymentTerms);
  }, [invoicePreviewConfig]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div
        className={cn(
          'flex h-[93%] justify-between gap-2',
          !isActionable && 'flex items-center justify-center',
        )}
      >
        {/* Left side: Controls */}
        {isBankAccountDetailsSelectable && isCustomerRemarksAddable && (
          <div className="navScrollBarStyles flex h-full w-1/3 flex-col gap-4 overflow-y-auto overflow-x-hidden px-2">
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
                    <span className="text-red-600">*</span>
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
                        if (value) {
                          setErrorMsg((prev) => ({
                            ...prev,
                            billingAddress: '',
                          }));
                          setBillingAddress(value);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Billing Address" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading && <Loading />}
                        {!isLoading &&
                          invoicePreviewConfig?.addressList &&
                          invoicePreviewConfig?.addressList?.map((address) => (
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
                  {errorMsg?.billingAddress && (
                    <ErrorBox msg={errorMsg.billingAddress} />
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Select Client Shipping Address
                    <span className="text-red-600">*</span>
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
                        if (value) {
                          setErrorMsg((prev) => ({
                            ...prev,
                            shippingAddress: '',
                          }));
                          setShippingAddress(value);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Shipping Address" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading && <Loading />}
                        {!isLoading &&
                          invoicePreviewConfig?.addressList &&
                          invoicePreviewConfig?.addressList?.map((address) => (
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
                  {errorMsg?.shippingAddress && (
                    <ErrorBox msg={errorMsg.shippingAddress} />
                  )}
                </div>
              </>
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
                    {invoicePreviewConfig?.bankAccounts?.map((account) => (
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

            {/* payment terms */}
            {order?.clientType === 'B2B' && (
              <div className="flex flex-col">
                <Label className="mb-2 block text-sm font-medium">
                  Payment Terms
                </Label>
                <Textarea
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="navScrollBarStyles h-28 w-full resize-none rounded-md border p-2"
                  placeholder="Enter your custom Payment terms..."
                />
              </div>
            )}
            {/* due date */}
            {order?.clientType === 'B2B' && (
              <div className="flex flex-col">
                <Label className="mb-2 block text-sm font-medium">
                  Payment Due Date
                </Label>
                <div className="relative flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <DatePickers
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="right"
                  />
                  <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
                </div>
              </div>
            )}

            {/* customer remarks */}
            {isCustomerRemarksAddable && (
              <div>
                <Label className="text-sm font-medium">Custom Remarks</Label>
                <Textarea
                  value={remarks}
                  className="navScrollBarStyles"
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Thank you for your business!"
                  rows={2}
                />
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

            <div className="sticky bottom-0 z-10 border-t bg-white pt-2 shadow-md">
              <Button
                className="w-full"
                size="sm"
                onClick={() => {
                  const formatDate = moment(selectedDate).format('DD-MM-yyyy');
                  const updatedOrder = {
                    ...order,
                    remarks,
                    bankAccountId: bankAccount,
                    socialLinks: socialLink,
                    billingAddressId: billingAddress,
                    shippingAddressId: shippingAddress,
                    dueDate: formatDate,
                    paymentTerms,
                  };

                  if (order?.clientType === 'B2B') {
                    const errors = validation(updatedOrder);
                    if (Object.keys(errors).length > 0) {
                      setErrorMsg(errors);
                    } else {
                      handlePreview(updatedOrder);
                      setErrorMsg(null); // Clear previous errors if any
                    }
                  } else {
                    handlePreview(updatedOrder);
                  }
                }}
              >
                Apply changes
              </Button>
            </div>
          </div>
        )}

        {/* Right side: PDF Preview */}
        <div className="flex h-full w-2/3 items-center justify-center bg-[#F4F4F4]">
          <ViewPdf url={url} isPDF={isPDF} />
        </div>
      </div>

      {/* Footer CTA for downloading the PDF */}
      <div className="mt-2 flex w-full items-center justify-end gap-2">
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
              const updatedOrder = {
                ...order,
                remarks,
                bankAccountId: bankAccount,
                socialLinks: socialLink,
                billingAddressId: billingAddress,
                shippingAddressId: shippingAddress,
              };

              if (order?.clientType === 'B2B') {
                const errors = validation(updatedOrder);
                if (Object.keys(errors).length > 0) {
                  setErrorMsg(errors);
                } else {
                  setOpen(true);
                  setErrorMsg(null); // Clear previous errors if any
                }
              } else {
                setOpen(true);
              }
            }}
          >
            Create Invoice
          </Button>
        )}
      </div>
      {isCreatable && (
        <PINVerifyModal
          open={open}
          setOpen={setOpen}
          order={order}
          customerRemarks={remarks}
          socialLinks={socialLink}
          bankAccountId={bankAccount}
          billingAddress={billingAddress}
          shippingAddress={shippingAddress}
          dueDate={selectedDate}
          paymentTerms={paymentTerms}
          isPendingInvoice={isPendingInvoice}
          handleCreateFn={handleCreateFn}
          isPINError={isPINError}
          setIsPINError={setIsPINError}
        />
      )}
    </div>
  );
};

export default InvoicePreview;
