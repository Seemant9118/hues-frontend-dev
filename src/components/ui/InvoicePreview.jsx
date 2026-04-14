/* eslint-disable no-unused-vars */
import { addressAPIs } from '@/api/addressApi/addressApis';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { settingsAPI } from '@/api/settings/settingsApi';
import {
  getEnterpriseId,
  getFilenameFromUrl,
} from '@/appUtils/helperFunctions';
import { cn } from '@/lib/utils';
import {
  addClientAddress,
  getGstAddressesList,
} from '@/services/address_Services/AddressServices';
import { getClient } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  addUpdateAddress,
  getInvoicePreviewConfig,
} from '@/services/Settings_Services/SettingsService';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Plus } from 'lucide-react';
import moment from 'moment';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import AddNewAddress from '../enterprise/AddNewAddress';
import PINVerifyModal from '../invoices/PINVerifyModal';
import ViewPdf from '../pdf/ViewPdf';
import AddBankAccount from '../settings/AddBankAccount';
import { Button } from './button';
import DatePickers from './DatePickers';
import ErrorBox from './ErrorBox';
import { Input } from './input';
import { Label } from './label';
import Loading from './Loading';
import { RadioGroup, RadioGroupItem } from './radio-group';
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
  const enterpriseId = getEnterpriseId();
  const [open, setOpen] = useState(false);
  const [invoiceDateState, setInvoiceDateState] = useState(() =>
    order?.invoiceDate ? new Date(order.invoiceDate) : new Date(),
  );
  // State to determine if the document is a PDF
  const [isPDF, setIsPDF] = useState(false);
  // State for storing customer remarks
  const [remarks, setRemarks] = useState('Thank you for your business!');
  // State for selected bank account
  const [bankAccount, setBankAccount] = useState(null);
  const [selectedGst, setSelectedGst] = useState(null);
  const [billingAddress, setBillingAddress] = useState(order?.billingAddressId);
  const [shippingAddress, setShippingAddress] = useState(
    order?.shippingAddressId,
  );
  const [paymentTerms, setPaymentTerms] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [paymentDueDate, setPaymentDueDate] = useState(null);
  const [saveAsGstDraft, setSaveAsGstDraft] = useState(
    order?.saveAsGstDraft !== undefined
      ? String(order.saveAsGstDraft)
      : 'false',
  );
  const [rcmClassification, setRcmClassification] = useState(
    order?.rcmClassification !== undefined
      ? String(order.rcmClassification)
      : 'false',
  );
  const [authorizedPerson, setAuthorizedPerson] = useState(
    order?.authorizedPerson || null,
  );
  // State for social link input
  const [socialLink, setSocialLink] = useState('');
  const [isBankAccountAdding, setIsBankAccountAdding] = useState(false);
  const [isBiilingAddressAdding, setIsBillingAddressAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');

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
    setRemarks(invoicePreviewConfig?.defaultRemarks || '');

    // due date (number of days)
    const dueInDays = Number(invoicePreviewConfig?.dueDate || 0);
    setPaymentDueDate(dueInDays);

    // invoice date fallback
    const baseInvoiceDate = invoiceDateState || new Date();

    // Calculate selected date as invoiceDate + dueDate days
    const calculatedDate = new Date(baseInvoiceDate);
    calculatedDate.setDate(calculatedDate.getDate() + dueInDays);

    setSelectedDate(calculatedDate);

    // payment terms
    setPaymentTerms(invoicePreviewConfig?.paymentTerms || '');
  }, [invoicePreviewConfig, invoiceDateState]);

  const { data: gstAddressesList, isLoading: isGstAddressLoading } = useQuery({
    queryKey: [
      addressAPIs.getGstAddressesList.endpointKey,
      selectedGst?.id,
      getAddressRelatedData?.clientId,
      getAddressRelatedData?.clientEnterpriseId,
    ],
    queryFn: () =>
      getGstAddressesList(
        selectedGst?.id,
        getAddressRelatedData?.clientId,
        getAddressRelatedData?.clientEnterpriseId,
      ),
    select: (data) => data.data.data,
    enabled:
      (!!order?.buyerId || !!getAddressRelatedData?.clientId) &&
      !!selectedGst?.id,
  });

  // api call to fetch authorized persons from buyer's client details
  const { data: authorizedPersonsList } = useQuery({
    queryKey: [
      clientEnterprise.getClient.endpointKey,
      getAddressRelatedData?.clientId,
    ],
    queryFn: () => getClient(getAddressRelatedData?.clientId),
    select: (res) => {
      const clientData = res?.data?.data;
      let metaData = clientData?.metaData;
      if (typeof metaData === 'string') {
        try {
          metaData = JSON.parse(metaData);
        } catch (e) {
          // ignore
        }
      }
      return metaData?.authorizedPerson || [];
    },
    enabled:
      order?.clientType === 'B2B' &&
      order?.orderType === 'SALES' &&
      !!getAddressRelatedData?.clientId,
  });

  const validation = (order) => {
    const errors = {};
    if (!order?.invoiceDate) {
      errors.invoiceDate = '*Required! Please select invoice date';
    }
    // address
    if (
      invoicePreviewConfig?.gstList?.length > 0 &&
      !order?.selectedGstNumber
    ) {
      errors.selectedGstNumber = '*Required! Please select GST';
    }
    if (!order?.billingAddressId) {
      errors.billingAddress = '*Required! Please select billing address';
    }
    if (!order?.shippingAddressId) {
      errors.shippingAddress = '*Required! Please select shipping address';
    }
    return errors;
  };

  return (
    <div className="flex h-[calc(100dvh-60px)] w-full flex-col overflow-hidden bg-background">
      <div
        className={cn(
          'flex flex-1 justify-between gap-2 overflow-hidden',
          !isActionable && 'items-center justify-center',
        )}
      >
        {/* Left side: Controls */}
        {isBankAccountDetailsSelectable && isCustomerRemarksAddable && (
          <div className="scrollBarStyles flex h-full w-1/3 flex-col gap-4 overflow-y-auto overflow-x-hidden px-2">
            {/*  save as gst draft with two radio - yes or no */}
            {order?.clientType === 'B2B' && order?.orderType === 'SALES' && (
              <div className="flex flex-col">
                <Label className="mb-2 block text-sm font-medium">
                  Save this invoice to GST Draft (GSTR-1 / IMS)?
                </Label>
                <div className="flex items-center gap-2">
                  <RadioGroup
                    value={saveAsGstDraft}
                    onValueChange={(value) => {
                      setSaveAsGstDraft(value);
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="save-gst-yes" />
                      <Label htmlFor="save-gst-yes" className="cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="save-gst-no" />
                      <Label htmlFor="save-gst-no" className="cursor-pointer">
                        No
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Select Authorized Person */}
            {order?.clientType === 'B2B' && order?.orderType === 'SALES' && (
              <div className="flex flex-col">
                <Label className="mb-2 block text-sm font-medium">
                  Select Authorized Person
                </Label>
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={(value) => {
                      const selected = authorizedPersonsList?.find(
                        (p) => String(p.id) === value,
                      );
                      setAuthorizedPerson(selected || null);
                    }}
                    value={
                      authorizedPerson ? String(authorizedPerson.id) : undefined
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Authorized Person" />
                    </SelectTrigger>
                    <SelectContent>
                      {authorizedPersonsList?.length === 0 && (
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                          No authorized persons found for this client.
                        </div>
                      )}
                      {authorizedPersonsList?.map((person) => (
                        <SelectItem key={person.id} value={String(person.id)}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* RCM */}
            {order?.clientType === 'B2B' && order?.orderType === 'PURCHASE' && (
              <div className="flex flex-col">
                <Label className="mb-2 block text-sm font-medium">
                  RCM Classification
                </Label>
                <div className="flex items-center gap-2">
                  <RadioGroup
                    value={rcmClassification}
                    onValueChange={(value) => {
                      setRcmClassification(value);
                    }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="normal" id="normal" />
                      <Label htmlFor="normal" className="cursor-pointer">
                        None (Normal GST)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gta" id="gta" />
                      <Label htmlFor="gta" className="cursor-pointer">
                        Goods Transport Agency (GTA)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advocate" id="advocate" />
                      <Label htmlFor="advocate" className="cursor-pointer">
                        Advocate / Advocate firm
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* invoice date */}
            {order?.clientType === 'B2B' && (
              <div className="flex flex-col">
                <Label className="mb-2 block text-sm font-medium">
                  Invoice Date
                </Label>
                <div className="relative flex h-10 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <DatePickers
                    selected={invoiceDateState}
                    onChange={(date) => {
                      setInvoiceDateState(date);
                      setErrorMsg((prev) => ({ ...prev, invoiceDate: '' }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="end"
                  />
                  <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
                </div>
                {errorMsg?.invoiceDate && (
                  <ErrorBox msg={errorMsg.invoiceDate} />
                )}
              </div>
            )}

            {/* gst list */}
            {invoicePreviewConfig?.gstList?.length > 0 && (
              <div>
                <Label className="text-sm font-medium">
                  Select GST
                  <span className="text-red-600">*</span>
                </Label>

                <Select
                  onValueChange={(value) => {
                    if (value) {
                      setErrorMsg((prev) => ({
                        ...prev,
                        selectedGstNumber: '',
                      }));
                      setSelectedGst({
                        id: value.id,
                        gstNumber: value.gst,
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select GST" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading && <Loading />}
                    {!isLoading &&
                      invoicePreviewConfig?.gstList &&
                      invoicePreviewConfig?.gstList?.map((gst) => (
                        <SelectItem key={gst.id} value={gst}>
                          {gst.gst}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {errorMsg?.selectedGstNumber && (
                  <ErrorBox msg={errorMsg.selectedGstNumber} />
                )}
              </div>
            )}

            {(invoicePreviewConfig?.gstList?.length === 0 ||
              gstAddressesList?.length > 0) && (
              <div>
                {/* address */}
                {isBiilingAddressAdding && (
                  <AddNewAddress
                    clientId={getAddressRelatedData?.clientId}
                    isAddressAdding={isBiilingAddressAdding}
                    setIsAddressAdding={setIsBillingAddressAdding}
                    mutationKey={
                      isPurchasePage
                        ? settingsAPI.addUpdateAddress.endpointKey
                        : addressAPIs.addAddressClient?.endpointKey
                    }
                    mutationFn={
                      isPurchasePage ? addUpdateAddress : addClientAddress
                    }
                    invalidateKey={addressAPIs.getAddresses.endpointKey}
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
                            {!isGstAddressLoading && gstAddressesList
                              ? gstAddressesList?.map((address) => (
                                  <SelectItem
                                    key={address.id}
                                    value={address.id}
                                  >
                                    {address.address}
                                  </SelectItem>
                                ))
                              : invoicePreviewConfig?.addressList?.map(
                                  (address) => (
                                    <SelectItem
                                      key={address.id}
                                      value={address.id}
                                    >
                                      {address.address}
                                    </SelectItem>
                                  ),
                                )}
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
                            {!isGstAddressLoading && gstAddressesList
                              ? gstAddressesList?.map((address) => (
                                  <SelectItem
                                    key={address.id}
                                    value={address.id}
                                  >
                                    {address.address}
                                  </SelectItem>
                                ))
                              : invoicePreviewConfig?.addressList?.map(
                                  (address) => (
                                    <SelectItem
                                      key={address.id}
                                      value={address.id}
                                    >
                                      {address.address}
                                    </SelectItem>
                                  ),
                                )}
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

            {/* <div className="sticky bottom-0 z-10 border-t bg-white pt-2 shadow-md"></div> */}
          </div>
        )}

        {/* Right side: PDF Preview */}
        <div className="navScrollBarStyles flex h-full w-full overflow-y-auto overflow-x-hidden bg-[#F4F4F4] md:w-2/3">
          <ViewPdf url={url} isPDF={isPDF} />
        </div>
      </div>

      {/* Footer CTA for downloading the PDF */}
      <div className="z-10 mt-auto flex w-full shrink-0 items-center justify-between gap-4 border-t bg-white py-2">
        <div className="w-1/3 px-2">
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
                invoiceDate: invoiceDateState
                  ? invoiceDateState.toISOString()
                  : null,
                selectedGstNumber: selectedGst?.gstNumber,
                paymentTerms,
                saveAsGstDraft: saveAsGstDraft === 'true',
                rcmClassification,
                authorizedPersonId: authorizedPerson
                  ? Number(authorizedPerson.id)
                  : null,
                authorizedPerson: authorizedPerson || null,
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
        <div className="flex items-center gap-2">
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
                  invoiceDate: invoiceDateState
                    ? invoiceDateState.toISOString()
                    : null,
                  selectedGstNumber: selectedGst?.gstNumber,
                  saveAsGstDraft: saveAsGstDraft === 'true',
                  rcmClassification,
                  authorizedPersonId: authorizedPerson
                    ? Number(authorizedPerson.id)
                    : null,
                  authorizedPerson: authorizedPerson || null,
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
      </div>
      {isCreatable && (
        <PINVerifyModal
          open={open}
          setOpen={setOpen}
          order={{
            ...order,
            selectedGstNumber: selectedGst?.gstNumber,
            invoiceDate: invoiceDateState ?? null,
            saveAsGstDraft: saveAsGstDraft === 'true',
            rcmClassification,
            authorizedPersonId: authorizedPerson
              ? Number(authorizedPerson.id)
              : null,
            authorizedPerson: authorizedPerson || null,
          }}
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
