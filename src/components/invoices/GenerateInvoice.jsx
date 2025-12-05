import { invoiceApi } from '@/api/invoice/invoiceApi';
import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import {
  createInvoiceForAcceptedOrder,
  previewInvoice,
  withDrawOrder,
} from '@/services/Invoice_Services/Invoice_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import base64ToBlob from 'base64toblob';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';
import OrdersOverview from '../orders/OrdersOverview';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import InputWithSelect from '../ui/InputWithSelect';
import InvoicePreview from '../ui/InvoicePreview';
import Loading from '../ui/Loading';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import Wrapper from '../wrappers/Wrapper';
import PINVerifyModalOfflineOrder from './PinVerifyModalOfflineOrder';

const GenerateInvoice = ({ orderDetails, setIsGenerateInvoice }) => {
  const translations = useTranslations('components.generate_invoice');

  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const isAutoSelect = false;
  const orderId = params.order_id;

  const [isPINModalOpen, setIsPINModalOpen] = useState(false);
  const [invoicedData, setInvoicedData] = useState({
    pin: null,
    clientType: orderDetails?.clientType,
    orderId: orderDetails?.id,
    gstAmount: orderDetails?.gstAmount,
    amount: orderDetails?.amount,
    orderType: orderDetails?.orderType,
    discountAmount: orderDetails?.discountAmount,
    invoiceType: orderDetails?.invoiceType || 'GOODS',
    invoiceItems: [],
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [productDetailsList, setProductDetailsList] = useState([]);
  const [initialQuantities, setInitialQuantities] = useState([]);
  const [previewInvoiceBase64, setPreviewInvoiceBase64] = useState('');
  const [allSelected, setAllSelected] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [url, setUrl] = useState(null);
  const [isPINError, setIsPINError] = useState(false);
  const [getAddressRelatedData] = useState({
    clientId: orderDetails?.clientId,
    clientEnterpriseId: orderDetails?.clientEnterpriseId,
  });

  // fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
  });

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (previewInvoiceBase64) {
      // Convert base64 string to blob only if it is provided
      const blob = base64ToBlob(previewInvoiceBase64, 'application/pdf'); // Assuming it's a PDF, change MIME type if different
      const newUrl = window.URL.createObjectURL(blob);
      setUrl(newUrl);
      setIsPreviewOpen(true); // Open the preview modal

      // Clean up the blob URL when the component unmounts or the base64 string changes
      return () => {
        window.URL.revokeObjectURL(newUrl);
      };
    }
  }, [previewInvoiceBase64]); // Dependency array to ensure effect runs only when base64StrToRenderPDF changes

  // --- 🔹 calculate remaining qty helper
  const calculatedInvoiceQuantity = (quantity, invoiceQuantity) =>
    Math.max(quantity - invoiceQuantity, 0);

  // --- 🔹 build productDetailsList when orderDetails change
  useEffect(() => {
    if (!orderDetails?.orderItems) return;

    setInitialQuantities(orderDetails.orderItems.map((i) => i.quantity));

    const productDetails = orderDetails.orderItems.map((item) => {
      const quantity =
        calculatedInvoiceQuantity(item.quantity, item.invoiceQuantity) || 0;

      const { unitPrice = 0, unitId, gstPerUnit = 0 } = item;

      const totalAmount = parseFloat((quantity * unitPrice).toFixed(2));
      const totalGstAmount = parseFloat(
        (totalAmount * (gstPerUnit / 100)).toFixed(2),
      );

      return {
        ...item.productDetails,
        discountAmount: item.discountAmount || 0,
        discountPercentage: item.discountPercentage,
        productType: item.productType,
        orderItemId: item.id,
        quantity,
        unitId,
        unitPrice,
        gstPerUnit,
        totalAmount,
        totalGstAmount,
        isSelected: isAutoSelect,
      };
    });

    const filteredList = productDetails.filter((p) => p.quantity > 0);

    setProductDetailsList(filteredList);
    setInvoicedData((prev) => ({
      ...prev,
      invoiceItems: isAutoSelect ? filteredList : [],
    }));
    setAllSelected(isAutoSelect);
  }, [orderDetails?.orderItems, isAutoSelect]);

  // --- 🔹 sync invoicedData totals whenever invoiceItems change
  useEffect(() => {
    const totalAmount = invoicedData.invoiceItems.reduce(
      (acc, item) => acc + item.totalAmount,
      0,
    );

    const totalGstAmount = invoicedData.invoiceItems.reduce(
      (acc, item) => acc + item.totalGstAmount,
      0,
    );

    setInvoicedData((prev) => ({
      ...prev,
      amount: parseFloat(totalAmount.toFixed(2)),
      gstAmount: parseFloat(totalGstAmount.toFixed(2)),
    }));
  }, [invoicedData.invoiceItems]);

  // update qty for a single item
  const updateProductDetailsList = (orderItemId, newQtyRaw) => {
    const newQty = newQtyRaw === '' ? '' : Number(newQtyRaw);

    setProductDetailsList((prevList) =>
      prevList.map((item) => {
        if (item.orderItemId !== orderItemId) return item;

        const qty = newQty === '' ? '' : Math.max(newQty, 0);

        return {
          ...item,
          quantity: qty,
          totalAmount:
            qty && !Number.isNaN(qty)
              ? parseFloat((qty * item.unitPrice).toFixed(2))
              : 0,
          totalGstAmount:
            qty && !Number.isNaN(qty)
              ? parseFloat(
                  (qty * item.unitPrice * (item.gstPerUnit / 100)).toFixed(2),
                )
              : 0,
        };
      }),
    );

    // Sync invoicedData.invoiceItems
    setInvoicedData((prev) => {
      const exists = prev.invoiceItems?.some(
        (i) => i.orderItemId === orderItemId,
      );
      if (!exists) return prev;

      const updatedItems = prev.invoiceItems.map((item) => {
        if (item.orderItemId !== orderItemId) return item;

        return {
          ...item,
          quantity: newQty === '' ? '' : newQty,
          totalAmount:
            newQty && !Number.isNaN(newQty)
              ? parseFloat((newQty * item.unitPrice).toFixed(2))
              : 0,
          totalGstAmount:
            newQty && !Number.isNaN(newQty)
              ? parseFloat(
                  (newQty * item.unitPrice * (item.gstPerUnit / 100)).toFixed(
                    2,
                  ),
                )
              : 0,
        };
      });

      return { ...prev, invoiceItems: updatedItems };
    });

    // Validation
    const matchedItem = orderDetails?.orderItems?.find(
      (i) => i.id === orderItemId,
    );
    const maxQty =
      (matchedItem?.quantity || 0) - (matchedItem?.invoiceQuantity || 0);

    const newErrorMsg = { ...errorMsg };

    if (newQty === '') {
      newErrorMsg[`quantity_${orderItemId}`] = 'Quantity cannot be empty';
    } else if (Number.isNaN(newQty) || newQty < 0) {
      newErrorMsg[`quantity_${orderItemId}`] =
        'Quantity must be a valid number';
    } else if (newQty > maxQty) {
      newErrorMsg[`quantity_${orderItemId}`] =
        `Only ${maxQty} items available for invoicing`;
    } else {
      delete newErrorMsg[`quantity_${orderItemId}`];
    }

    setErrorMsg(newErrorMsg);
  };

  // select/deselect all
  const handleSelectAll = (isSelected) => {
    setAllSelected(isSelected);

    const updatedList = productDetailsList.map((item) => ({
      ...item,
      isSelected,
    }));

    setProductDetailsList(updatedList);
    setInvoicedData((prev) => ({
      ...prev,
      invoiceItems: isSelected ? updatedList.filter((i) => i.quantity > 0) : [],
    }));
  };

  const onHandleClose = () => {
    setProductDetailsList([]);
    setInvoicedData({
      ...invoicedData,
      invoiceItems: [],
    });
    setIsGenerateInvoice(false);
  };

  // mutation fn - generate Invoice : IF ACCEPTED
  const invoiceMutation = useMutation({
    mutationKey: [invoiceApi.createInvoiceForAcceptedOrder.endpointKey],
    mutationFn: createInvoiceForAcceptedOrder,
    onSuccess: (data) => {
      toast.success(translations('successMsg.invoice_generate_success'));
      queryClient.invalidateQueries([
        invoiceApi.getInvoices.endpointKey,
        orderId,
      ]);
      router.push(`/dashboard/sales/sales-invoices/${data?.data?.data?.id}`);
    },
    onError: (error) => {
      if (
        error.response.data.error === 'USER_PIN_NOT_FOUND' ||
        error.response.data.error === 'INVALID_PIN'
      ) {
        setIsPINError(true);
      }
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  // mutation fn - new generate Invoice : IF NEW
  const withDrawOrderMutation = useMutation({
    mutationKey: [invoiceApi.withDrawOrder.endpointKey],
    mutationFn: withDrawOrder,
    onSuccess: (data) => {
      toast.success(translations('successMsg.invoice_generate_success'));

      // redirected to create order with prefilled data
      // eslint-disable-next-line no-unsafe-optional-chaining
      const { orderId } = data?.data?.data;
      queryClient.invalidateQueries([orderApi.getSales.endpointKey]);
      router.push(
        `/dashboard/sales/sales-orders?action=create_order&referenceId=${orderId}`,
      );
    },
    onError: (error) => {
      if (
        error.response.data.error === 'USER_PIN_NOT_FOUND' ||
        error.response.data.error === 'INVALID_PIN'
      ) {
        setIsPINError(true);
      }
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  // handling submit fn
  const handleSubmit = (updateInvoice) => {
    if (orderDetails?.negotiationStatus === 'NEW') {
      withDrawOrderMutation.mutate(updateInvoice);
      return;
    }
    invoiceMutation.mutate(updateInvoice);
  };

  const previewInvMutation = useMutation({
    mutationKey: [invoiceApi.previewInvoice.endpointKey],
    mutationFn: previewInvoice,
    onSuccess: (data) => setPreviewInvoiceBase64(data?.data?.data),
    onError: (error) =>
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      ),
  });

  const validations = (invoices) => {
    const error = {};

    // Check if any invoice is selected
    if (invoices?.invoiceItems?.length === 0) {
      error.isAnyInvoiceSelected =
        'Please select at least one Invoice to generate';
    }

    invoices?.invoiceItems?.forEach((item) => {
      const id = item?.orderItemId; // ✅ correct reference to orderItem
      const quantity = item?.quantity;

      const matchedOrderItem = orderDetails?.orderItems?.find(
        (orderItem) => orderItem.id === id,
      );

      const maxQuantity =
        Number(matchedOrderItem?.quantity || 0) -
        Number(matchedOrderItem?.invoiceQuantity || 0);

      if (quantity === '' || quantity === null || quantity === undefined) {
        error[`quantity_${id}`] = 'Quantity cannot be empty';
      } else if (!Number.isInteger(quantity) || quantity <= 0) {
        error[`quantity_${id}`] = 'Quantity must be a valid number';
      } else if (quantity > maxQuantity) {
        error[`quantity_${id}`] =
          `Only ${maxQuantity} items available for invoicing`;
      }
    });

    return error;
  };

  const handlePreview = (invoices) => {
    const isErrors = validations(invoices);

    if (Object.keys(isErrors).length === 0) {
      previewInvMutation.mutate(invoices);
    } else {
      setErrorMsg(isErrors);
    }
  };

  // multiStatus components
  const multiStatus = (
    <div className="flex gap-2">
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.sellerData?.orderStatus}
      />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.payment?.status}
      />
    </div>
  );

  return (
    <Wrapper className="h-full">
      {!isPreviewOpen && (
        <>
          {/* Collapsable overview */}
          <OrdersOverview
            isCollapsableOverview={true}
            orderDetails={orderDetails}
            orderId={orderDetails?.referenceNumber}
            multiStatus={multiStatus}
            Name={`${orderDetails?.clientName} (${orderDetails?.clientType})`}
            mobileNumber={orderDetails?.mobileNumber}
            amtPaid={orderDetails?.amountPaid}
            totalAmount={orderDetails.amount + orderDetails.gstAmount}
          />
          <section className="flex h-full flex-col justify-between">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(value) => handleSelectAll(value)}
                      disabled={isAutoSelect}
                    />
                  </TableHead>
                  <TableHead className="shrink-0 text-xs font-bold text-black">
                    {translations('table.header.item_name')}
                  </TableHead>
                  <TableHead
                    className="shrink-0 text-xs font-bold text-black"
                    colSpan="2"
                  >
                    {translations('table.header.quantity')}
                  </TableHead>
                  <TableHead className="shrink-0 text-xs font-bold text-black">
                    {translations('table.header.unit_price')}
                  </TableHead>
                  <TableHead className="shrink-0 text-xs font-bold text-black">
                    {translations('table.header.total_amount')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="shrink-0">
                {productDetailsList.map((product, index) => {
                  return (
                    <TableRow key={product.id}>
                      <TableCell colSpan={1}>
                        <Checkbox
                          checked={product.isSelected}
                          onCheckedChange={(value) => {
                            const updatedList = [...productDetailsList];
                            updatedList[index].isSelected = value;

                            setProductDetailsList(updatedList);

                            if (value) {
                              const updatedItems = productDetailsList.map(
                                (item, idx) => {
                                  if (idx === index) {
                                    return {
                                      ...item,
                                      totalAmount: parseFloat(
                                        (
                                          item.quantity * item.unitPrice
                                        ).toFixed(2),
                                      ),
                                      totalGstAmount: parseFloat(
                                        (
                                          item.quantity *
                                          item.unitPrice *
                                          (item.gstPerUnit / 100)
                                        ).toFixed(2),
                                      ),
                                    };
                                  }
                                  return item;
                                },
                              );

                              setInvoicedData({
                                ...invoicedData,
                                invoiceItems: updatedItems.filter(
                                  (item) => item.isSelected,
                                ),
                              });
                              setErrorMsg((prevMsg) => ({
                                ...prevMsg,
                                isAnyInvoiceSelected: '',
                              }));
                            } else {
                              setInvoicedData((prev) => ({
                                ...prev,
                                invoiceItems: prev.invoiceItems.filter(
                                  (item) =>
                                    item.orderItemId !==
                                    updatedList[index].orderItemId,
                                ),
                              }));
                            }
                          }}
                          disabled={isAutoSelect}
                        />
                      </TableCell>

                      <TableCell colSpan={1}>
                        {product?.productName ?? product?.serviceName}
                      </TableCell>

                      <TableCell colSpan={2}>
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1">
                            <Button
                              className="disabled:hover:cursor-not-allowed"
                              variant="export"
                              debounceTime="300"
                              onClick={() => {
                                if (product.quantity > 1) {
                                  updateProductDetailsList(
                                    product.orderItemId,
                                    product.quantity - 1,
                                  );
                                }
                              }}
                              disabled={product?.quantity <= 1 || isAutoSelect}
                            >
                              -
                            </Button>

                            {/* <Input
                              min={1}
                              name="quantity"
                              className="w-20 rounded-sm pr-4"
                              value={product?.quantity}
                              onChange={(e) => {
                                const newQty = parseInt(e.target.value, 10);

                                // Optional: allow clearing the field
                                if (e.target.value === '') {
                                  updateProductDetailsList(
                                    product.orderItemId,
                                    '',
                                  );
                                  return;
                                }

                                if (!Number.isNaN(newQty)) {
                                  updateProductDetailsList(
                                    product.orderItemId,
                                    newQty,
                                  );
                                }
                              }}
                              disabled={isAutoSelect}
                            /> */}

                            <InputWithSelect
                              id="quantity"
                              disabled={isAutoSelect}
                              value={product?.quantity ?? ''}
                              onValueChange={(e) => {
                                const inputValue = e.target.value;

                                // Allow clearing the field
                                if (inputValue === '') {
                                  updateProductDetailsList(
                                    product.orderItemId,
                                    '',
                                  );
                                  return;
                                }

                                const newQty = parseFloat(inputValue);

                                if (!Number.isNaN(newQty)) {
                                  updateProductDetailsList(
                                    product.orderItemId,
                                    newQty,
                                  );
                                }
                              }}
                              unit={product.unitId} // unitId from state
                              onUnitChange={(val) => {
                                const updatedItems = productDetailsList.map(
                                  (item, idx) => {
                                    if (idx === index) {
                                      return {
                                        ...item,
                                        unitId: val,
                                      };
                                    }
                                    return item;
                                  },
                                );

                                setProductDetailsList(updatedItems); // keep productDetailsList in sync
                                setInvoicedData((prev) => ({
                                  ...prev,
                                  invoiceItems: updatedItems,
                                }));
                              }}
                              selectUnitDisabled={true}
                              units={units?.quantity ?? []} // fallback to empty array
                            />

                            <Button
                              className="disabled:cursor-not-allowed"
                              variant="export"
                              debounceTime="300"
                              onClick={() => {
                                if (
                                  product?.quantity < initialQuantities[index]
                                ) {
                                  updateProductDetailsList(
                                    product.orderItemId,
                                    product.quantity + 1,
                                  );
                                }
                              }}
                              disabled={
                                product?.quantity >= initialQuantities[index] ||
                                isAutoSelect
                              }
                            >
                              +
                            </Button>
                          </div>

                          {/* 👇 Validation error for this quantity field */}
                          {errorMsg?.[`quantity_${product.orderItemId}`] && (
                            <ErrorBox
                              msg={errorMsg[`quantity_${product.orderItemId}`]}
                            />
                          )}
                        </div>
                      </TableCell>

                      <TableCell colSpan={1}>{product?.unitPrice}</TableCell>

                      <TableCell colSpan={1}>
                        <Input
                          type="text"
                          name="totalAmount"
                          disabled
                          className="w-32 disabled:cursor-not-allowed"
                          value={`₹ ${(Number(product.totalAmount) || 0).toFixed(2)}`}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>

              {errorMsg?.isAnyInvoiceSelected && (
                <TableFooter className="w-full shrink-0">
                  <TableRow>
                    <TableCell colSpan="6">
                      <ErrorBox msg={errorMsg?.isAnyInvoiceSelected} />
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>

            <div className="flex justify-end gap-4 border-t pt-4">
              <div className="mt-auto h-[1px] bg-neutral-300"></div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onHandleClose()}
              >
                {translations('ctas.cancel')}
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  isAutoSelect
                    ? setIsPINModalOpen(true)
                    : handlePreview(invoicedData);
                }}
                disabled={previewInvMutation.isPending}
              >
                {previewInvMutation.isPending ? (
                  <Loading />
                ) : isAutoSelect ? (
                  translations('ctas.verify')
                ) : (
                  translations('ctas.next')
                )}
              </Button>
            </div>
          </section>
        </>
      )}

      {!isAutoSelect && isPreviewOpen && (
        <InvoicePreview
          order={invoicedData}
          setOrder={setInvoicedData}
          getAddressRelatedData={getAddressRelatedData}
          setIsPreviewOpen={setIsPreviewOpen}
          url={url}
          isPDFProp={true}
          isPendingInvoice={invoiceMutation.isPending}
          handleCreateFn={handleSubmit}
          handlePreview={handlePreview}
          isCreatable={true}
          isAddressAddable={true}
          isCustomerRemarksAddable={true}
          isBankAccountDetailsSelectable={true}
          isActionable={true}
          isPINError={isPINError}
          setIsPINError={setIsPINError}
        />
      )}

      {isAutoSelect && (
        <PINVerifyModalOfflineOrder
          open={isPINModalOpen}
          setOpen={setIsPINModalOpen}
          order={invoicedData}
          isPendingInvoice={invoiceMutation.isPending}
          handleCreateFn={handleSubmit}
          isPINError={isPINError}
          setIsPINError={setIsPINError}
        />
      )}
    </Wrapper>
  );
};

export default GenerateInvoice;
