import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LocalStorageService } from '@/lib/utils';
import {
  createBulkNegotiaion,
  createBulkNegotiationOnBehalf,
  GetNegotiationDetails,
} from '@/services/Orders_Services/Orders_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, History, UploadCloud, X, FileText } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import Tooltips from '../auth/Tooltips';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import InputWithSelect from '../ui/InputWithSelect';
import Loading from '../ui/Loading';
import Wrapper from '../wrappers/Wrapper';
import ConditionalRenderingStatus from './ConditionalRenderingStatus';
import OrdersOverview from './OrdersOverview';
import InfoBanner from '../auth/InfoBanner';
import { Label } from '../ui/label';

const NegotiationComponent = ({
  orderDetails,
  isNegotiation,
  setIsNegotiation,
  isNegotiateOnBehalf = false,
  setIsNegotiateOnBehalf,
}) => {
  const translations = useTranslations('components.negotiation_component');

  const queryClient = useQueryClient();
  const pathName = usePathname();
  const isBid = pathName.includes('purchase-orders');
  const pageIsSales = pathName.includes('sales-orders');
  const userId = LocalStorageService.get('user_profile');
  const [bulkNegotiateOrder, setBulkNegotiateOrder] = useState([]);
  const [historyVisible, setHistoryVisible] = useState({});
  const [negotiationDetails, setNegotiationDetails] = useState([]);
  const [behalfReason, setBehalfReason] = useState('');
  const [behalfConsentNote, setBehalfConsentNote] = useState('');
  const [includeUploads, setIncludeUploads] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  // fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
  });

  // Initialize bulkNegotiateOrder state
  useEffect(() => {
    if (orderDetails?.orderItems) {
      const initialOrders = orderDetails.orderItems.map((item) => ({
        orderId: item.orderId,
        orderItemId: item.id,
        priceType: isBid ? 'BID' : 'OFFER',
        createdBy: userId,
        date: moment(new Date()).format('DD/MM/YYYY'),
        status: isBid ? 'BID_SUBMITTED' : 'OFFER_SUBMITTED',
        quantity: item?.negotiation?.quantity ?? item?.quantity,
        unitId: item?.negotiation?.unitId ?? item?.unitId,
        unitPrice: item?.negotiation?.unitPrice ?? item?.unitPrice,
        totalAmount: (
          (item?.negotiation?.quantity ?? item.quantity) *
          (item?.negotiation?.unitPrice ?? item.unitPrice)
        ).toFixed(2),
      }));
      setBulkNegotiateOrder(initialOrders);
    }
  }, [orderDetails]);

  // Fetch negotiationDetails
  const getNegotiationDetailsMutation = useMutation({
    mutationKey: [orderApi.getNegotiationDetails.endpointKey],
    mutationFn: GetNegotiationDetails,
    onSuccess: (data) => {
      setNegotiationDetails(data?.data?.data);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('errorMsg.common'),
      );
    },
  });

  // Create bulkNegotiation
  const createBulkNegotiationMutation = useMutation({
    mutationKey: [orderApi.createBulkNegotiation.endpointKey],
    mutationFn: createBulkNegotiaion,
    onSuccess: () => {
      toast.success(translations('successMsg.negotiation_submitted'));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
      setBulkNegotiateOrder([]);
      setIsNegotiation(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('errorMsg.common'),
      );
    },
  });

  // Create bulkNegotiation on behalf
  const createBulkNegotiationOnBehalfMutation = useMutation({
    mutationKey: [orderApi.createBulkNegotiationOnBehalf.endpointKey],
    mutationFn: createBulkNegotiationOnBehalf,
    onSuccess: () => {
      toast.success(translations('successMsg.negotiation_submitted'));
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
      setBulkNegotiateOrder([]);
      setIsNegotiation(false);
      setIsNegotiateOnBehalf(false);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('errorMsg.common'),
      );
    },
  });

  const handleChange = (e, index, field) => {
    const { value } = e.target;
    const updatedOrder = [...bulkNegotiateOrder];

    updatedOrder[index] = {
      ...updatedOrder[index],
      [field]: value === '' ? '' : Number(value), // allow empty string
    };

    const quantity = Number(updatedOrder[index]?.quantity) || 0;
    const unitPrice = Number(updatedOrder[index]?.unitPrice) || 0;

    updatedOrder[index].totalAmount =
      value === '' ? '' : (quantity * unitPrice).toFixed(2);

    setBulkNegotiateOrder(updatedOrder);
  };

  const extractData = () => {
    return {
      negotiations: bulkNegotiateOrder.map((item) => ({
        orderId: item.orderId,
        orderItemId: item.orderItemId,
        priceType: item.priceType,
        createdBy: item.createdBy,
        date: item.date,
        status: item.status,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        unitId: item.unitId,
        price: (item.quantity * item.unitPrice).toFixed(2),
      })),
    };
  };

  const toggleHistory = (index, itemData) => {
    setHistoryVisible((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));

    if (!historyVisible[index]) {
      setNegotiationDetails([]); // Clear details to trigger loading state
      getNegotiationDetailsMutation.mutate({
        orderId: itemData.orderId,
        itemId: itemData.id,
      });
    }
  };

  const handleSubmit = async () => {
    const extractedData = extractData();
    if (extractedData.negotiations.length === 0) {
      toast.error(translations('errorMsg.empty'));
      return;
    }

    if (isNegotiateOnBehalf) {
      if (!behalfReason) {
        toast.error('Please select a reason for reviewing on behalf.');
        return;
      }
      if (!behalfConsentNote.trim()) {
        toast.error('Please enter a consent note.');
        return;
      }

      setUploadingFiles(true);
      try {
        const formData = new FormData();
        formData.append(
          'negotiations',
          JSON.stringify(extractedData.negotiations),
        );
        formData.append('isProxy', 'true');
        formData.append('reason', behalfReason);
        formData.append('consentNote', behalfConsentNote);

        if (includeUploads && selectedFiles.length > 0) {
          selectedFiles.forEach((file) => {
            formData.append('files', file);
          });
        }

        createBulkNegotiationOnBehalfMutation.mutate(formData);
      } catch (error) {
        toast.error(
          error?.message || 'Failed to submit negotiation on behalf.',
        );
      } finally {
        setUploadingFiles(false);
      }
    } else {
      createBulkNegotiationMutation.mutate(extractedData);
    }
  };

  // multiStatus components
  const multiStatus = (
    <div className="flex gap-2">
      <ConditionalRenderingStatus
        status={
          pageIsSales
            ? orderDetails?.metaData?.sellerData?.orderStatus
            : orderDetails?.metaData?.buyerData?.orderStatus
        }
      />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.payment?.status}
      />
    </div>
  );

  return (
    <Wrapper className="h-full">
      {/* Collapsable overview */}
      <OrdersOverview
        isCollapsableOverview={true}
        orderDetails={orderDetails}
        orderId={orderDetails?.referenceNumber}
        multiStatus={multiStatus}
        Name={isBid ? orderDetails?.vendorName : orderDetails?.clientName}
        mobileNumber={
          isBid ? orderDetails?.vendorMobileNumber : orderDetails?.mobileNumber
        }
        amtPaid={orderDetails?.amountPaid}
        totalAmount={orderDetails.amount + orderDetails.gstAmount}
      />

      {isNegotiateOnBehalf && (
        <InfoBanner text="You are performing a proxy negotiation action on behalf of your counterparty. Please provide a reason and upload supporting evidence below." />
      )}

      <div className="scrollBarStyles max-h-[250px] min-h-[200px] overflow-y-auto rounded-sm border bg-white md:min-h-[180px]">
        <Table className="border-none">
          <TableHeader>
            {/* Main Header Row */}
            <TableRow>
              <TableHead
                colSpan={2}
                className="shrink-0 text-xs font-bold text-black"
              >
                {translations('table.header.label.item')}
              </TableHead>
              <TableHead
                colSpan={2}
                className="shrink-0 text-xs font-bold text-black"
              >
                {translations('table.header.label.quantity')}
              </TableHead>
              <TableHead
                colSpan={2}
                className="shrink-0 text-xs font-bold text-black"
              >
                {translations('table.header.label.rate')}
              </TableHead>
              <TableHead
                colSpan={2}
                className="shrink-0 text-xs font-bold text-black"
              >
                {translations('table.header.label.total')}
              </TableHead>
              <TableHead></TableHead>
            </TableRow>

            {/* Sub Header Row */}
            <TableRow className="border-none">
              <TableHead
                className="bg-white text-xs font-semibold text-black"
                colSpan={2}
              >
                {translations('table.child_table.header.label.itemName')}
              </TableHead>
              <TableHead className="bg-white text-xs font-semibold text-black">
                {translations('table.child_table.header.label.ask')}
              </TableHead>
              <TableHead className="bg-white text-xs font-semibold text-black">
                {translations('table.child_table.header.label.counter')}
              </TableHead>
              <TableHead className="bg-white text-xs font-semibold text-black">
                {translations('table.child_table.header.label.ask')}
              </TableHead>
              <TableHead className="bg-white text-xs font-semibold text-black">
                {translations('table.child_table.header.label.counter')}
              </TableHead>
              <TableHead className="bg-white text-xs font-semibold text-black">
                {translations('table.child_table.header.label.ask')}
              </TableHead>
              <TableHead className="bg-white text-xs font-semibold text-black">
                {translations('table.child_table.header.label.counter')}
              </TableHead>
              <TableHead className="bg-white text-xs font-semibold text-black"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orderDetails?.orderItems?.map((item, index) => (
              <React.Fragment key={item?.id}>
                <TableRow>
                  <TableCell colSpan={2}>
                    <div className="rounded-md border bg-[#F5F6F8] p-2">
                      {item?.productDetails?.productName ||
                        item?.productDetails?.serviceName}
                    </div>
                  </TableCell>
                  <TableCell colSpan={1}>
                    <div className="rounded-md border bg-[#F5F6F8] p-2">
                      {item?.negotiation?.quantity || item?.quantity}
                    </div>
                  </TableCell>
                  <TableCell colSpan={1}>
                    <InputWithSelect
                      // id="quantity"
                      // name={translations('form.label.quantity')}
                      inputWidth="w-34"
                      selectWidth="w-14"
                      value={bulkNegotiateOrder?.[index]?.quantity}
                      onValueChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= 0) {
                          handleChange(e, index, 'quantity');
                        }
                      }}
                      unit={bulkNegotiateOrder?.[index]?.unitId} // unitId from state
                      onUnitChange={(val) => {
                        if (val) {
                          handleChange(
                            { target: { value: val } },
                            index,
                            'unitId',
                          );
                        }
                      }}
                      units={units?.quantity} // pass the full object list
                    />
                  </TableCell>
                  <TableCell colSpan={1}>
                    <div className="rounded-md border bg-[#F5F6F8] p-2">
                      {item?.negotiation?.unitPrice || item?.unitPrice}
                    </div>
                  </TableCell>
                  <TableCell colSpan={1}>
                    <Input
                      type="number"
                      className="w-24"
                      placeholder="0"
                      value={bulkNegotiateOrder?.[index]?.unitPrice ?? ''} // allow empty
                      onChange={(e) => {
                        let { value } = e.target;

                        // Allow empty string for clear
                        if (value === '') {
                          handleChange(e, index, 'unitPrice');
                          return;
                        }

                        // Convert to number
                        value = Number(value);

                        // Prevent negative
                        if (value < 0) return;

                        handleChange({ target: { value } }, index, 'unitPrice');
                      }}
                      step="any" // allows decimals
                      min="0" // ensures no negatives
                    />
                  </TableCell>
                  <TableCell colSpan={1}>
                    <div className="rounded-md border bg-[#F5F6F8] p-2">
                      {item?.negotiation?.price?.toFixed(2) ||
                        item?.totalAmount.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell colSpan={1}>
                    <Input
                      className="w-24"
                      type="number"
                      placeholder="0"
                      value={bulkNegotiateOrder?.[index]?.totalAmount || ''}
                      readOnly
                      disabled
                    />
                  </TableCell>
                  <TableCell colSpan={1}>
                    <Tooltips
                      trigger={
                        <History
                          className={
                            historyVisible[index]
                              ? 'cursor-pointer text-primary'
                              : 'cursor-pointer text-gray-500 hover:text-primary'
                          }
                          onClick={() => toggleHistory(index, item)}
                        />
                      }
                      content={translations(
                        'table.column_actions.history.placeholder',
                      )}
                    />
                  </TableCell>
                </TableRow>

                {/* Loading State */}
                {historyVisible[index] &&
                  getNegotiationDetailsMutation.isPending && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center">
                        <Loading />
                      </TableCell>
                    </TableRow>
                  )}

                {/* History Rows */}
                {historyVisible[index] &&
                  !getNegotiationDetailsMutation.isPending &&
                  negotiationDetails.length > 0 &&
                  negotiationDetails
                    ?.sort(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                    )
                    ?.map((negoData) => (
                      <TableRow
                        key={negoData.id}
                        className="animate-fadeInUp text-xs font-semibold"
                      >
                        <TableCell
                          colSpan={2}
                          className="flex items-center justify-between gap-2"
                        >
                          {pageIsSales &&
                            (negoData?.status === 'OFFER_SUBMITTED' ? (
                              <div className="flex w-28 items-center justify-center rounded-md bg-green-600 p-2 text-center text-white">
                                {translations('table.column_actions.who.you')}
                              </div>
                            ) : (
                              <div className="w-28 rounded-md bg-yellow-500 p-2 text-center text-white">
                                {translations('table.column_actions.who.buyer')}
                              </div>
                            ))}

                          {!pageIsSales &&
                            (negoData?.status === 'BID_SUBMITTED' ? (
                              <div className="flex w-28 items-center justify-center rounded-md bg-green-600 p-2 text-center text-white">
                                {translations('table.column_actions.who.you')}
                              </div>
                            ) : (
                              <div className="w-28 rounded-md bg-yellow-500 p-2 text-center text-white">
                                {translations(
                                  'table.column_actions.who.seller',
                                )}
                              </div>
                            ))}

                          <div className="flex items-center justify-center gap-1 text-blue-400">
                            <Clock size={14} />
                            {moment(negoData?.createdAt).format(
                              'h:mm A | D MMM, YYYY',
                            )}
                          </div>
                        </TableCell>
                        <TableCell colSpan={3}>{negoData?.quantity}</TableCell>
                        <TableCell colSpan={2}>{negoData?.unitPrice}</TableCell>
                        <TableCell colSpan={2}>
                          ₹ {negoData?.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}

                {/* No History Placeholder */}
                {historyVisible[index] &&
                  !getNegotiationDetailsMutation.isPending &&
                  negotiationDetails.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="border">
                        <div className="bg-gray-100 p-4">
                          <h4 className="font-semibold">
                            {translations(
                              'table.column_actions.history.infoTitle',
                            )}
                            {item?.productDetails?.productName}
                          </h4>
                          <p>
                            {translations(
                              'table.column_actions.history.infoPara',
                            )}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {isNegotiateOnBehalf && (
        <div className="mt-3 flex flex-col gap-4">
          {/* Reason Select */}
          <div className="flex w-full flex-col gap-1.5 md:w-1/2">
            <Label>
              Reason for reviewing on behalf{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Select value={behalfReason} onValueChange={setBehalfReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Client requested offline negotiation">
                  Client requested offline negotiation
                </SelectItem>
                <SelectItem value="Agreed over phone call">
                  Agreed over phone call
                </SelectItem>
                <SelectItem value="Client confirmed via email">
                  Client confirmed via email
                </SelectItem>
                <SelectItem value="Authorized by contract">
                  Authorized by contract
                </SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Consent Note */}
          <div className="flex flex-col gap-1.5">
            <Label>
              Consent note / supporting details{' '}
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={behalfConsentNote}
              onChange={(e) => setBehalfConsentNote(e.target.value)}
              className="min-h-[90px] rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500"
              placeholder="Describe the confirmation or internal authorization relied upon (example: 'Vendor confirmed quantity and rate over phone on 4 Feb 2026, 3:15 PM')."
            />
          </div>

          {/* Evidence */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-slate-600">
              Evidence (optional)
            </h4>

            {/* Include Uploads */}
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="includeUploads"
                checked={includeUploads}
                onCheckedChange={setIncludeUploads}
                className="mt-0.5"
              />
              <div className="flex w-full flex-col gap-0.5">
                <label
                  htmlFor="includeUploads"
                  className="cursor-pointer select-none text-sm font-semibold text-slate-800"
                >
                  Include my uploads as evidence
                </label>
                <span className="text-xs leading-normal text-slate-500">
                  When enabled, Hues will attach the files you upload or select
                  here to Order Details → Attachments.
                </span>

                {/* Upload Zone (If checkbox checked) */}
                {includeUploads && (
                  <div className="mt-2 flex flex-col gap-2">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#288AF9] bg-white p-5 transition-colors duration-200 hover:bg-blue-50/20"
                    >
                      <UploadCloud className="mb-0.5 h-6 w-6 text-blue-500" />
                      <span className="text-sm font-semibold text-slate-700">
                        Click to upload files
                      </span>
                      <span className="text-xs text-slate-400">
                        PDF, PNG, JPG, JPEG
                      </span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />

                    {/* File List */}
                    {selectedFiles.length > 0 && (
                      <div className="flex max-h-[120px] flex-col gap-1.5 overflow-y-auto">
                        {selectedFiles.map((file, i) => (
                          <div
                            key={`${file.name}-${file.size}`}
                            className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-2 text-[10px]"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <FileText className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                              <span className="truncate font-medium text-slate-700">
                                {file.name}
                              </span>
                              <span className="text-[8px] text-slate-400">
                                ({(file.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedFiles((prev) =>
                                  prev.filter((_, idx) => idx !== i),
                                )
                              }
                              className="p-0.5 text-slate-400 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto h-[1px] bg-neutral-300"></div>

      {isNegotiation && (
        <div className="sticky bottom-0 z-10 flex justify-end bg-white">
          <section className="flex gap-2 bg-white py-2">
            <Button
              variant="outline"
              className="w-32"
              size="sm"
              onClick={() => {
                setIsNegotiation(false);
                setIsNegotiateOnBehalf?.(false);
              }}
            >
              {translations('ctas.cancel')}
            </Button>
            <Button
              className="flex w-32 items-center gap-1.5 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
              size="sm"
              onClick={handleSubmit}
              disabled={
                createBulkNegotiationMutation?.isPending ||
                uploadingFiles ||
                (isNegotiateOnBehalf &&
                  (!behalfReason || !behalfConsentNote.trim()))
              }
            >
              {createBulkNegotiationMutation?.isPending || uploadingFiles ? (
                <Loading size={14} />
              ) : (
                translations('ctas.submit')
              )}
            </Button>
          </section>
        </div>
      )}
    </Wrapper>
  );
};

export default NegotiationComponent;
