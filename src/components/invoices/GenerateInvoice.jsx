import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { LocalStorageService } from '@/lib/utils';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  invoiceGenerateOTP,
  previewInvoice,
} from '@/services/Invoice_Services/Invoice_Services';
import { useMutation, useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';
import OrdersOverview from '../orders/OrdersOverview';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import Loading from '../ui/Loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import Wrapper from '../wrappers/Wrapper';

// dynamic imports
const GenerateInvoiceModal = dynamic(
  () => import('@/components/Modals/GenerateInvoiceModal'),
  {
    loading: () => <Loading />,
  },
);
const PreviewInvoice = dynamic(
  () => import('@/components/Modals/PreviewInvoiceModal'),
  {
    loading: () => <Loading />,
  },
);

const GenerateInvoice = ({ orderDetails, setIsGenerateInvoice }) => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isAutoSelect = orderDetails?.negotiationStatus === 'NEW';

  const [invoicedData, setInvoicedData] = useState({
    otpCode: null,
    orderId: orderDetails?.id,
    gstAmount: orderDetails?.gstAmount,
    amount: orderDetails?.amount,
    orderType: orderDetails?.orderType,
    invoiceType: orderDetails?.invoiceType || 'GOODS',
    invoiceItems: [],
  });

  const [productDetailsList, setProductDetailsList] = useState([]);
  const [initialQuantities, setInitialQuantities] = useState([]);
  const [previewInvoiceBase64, setPreviewInvoiceBase64] = useState('');
  const [allSelected, setAllSelected] = useState(false);

  const calculatedInvoiceQuantity = (quantity, invoiceQuantity) => {
    const calculatedQty = quantity - invoiceQuantity;
    return Math.max(calculatedQty, 0);
  };

  useEffect(() => {
    if (orderDetails?.orderItems) {
      const initialQtys = orderDetails.orderItems.map((item) => item.quantity);
      setInitialQuantities(initialQtys);

      const getInitialProductDetailsList = orderDetails.orderItems.map(
        (item) => {
          const quantity = calculatedInvoiceQuantity(
            item.quantity,
            item.invoiceQuantity,
          );
          const { unitPrice } = item;
          const totalAmount = quantity * unitPrice;
          const totalGstAmount = totalAmount * (item.gstPerUnit / 100);

          return {
            ...item.productDetails,
            productType: item.productType,
            orderItemId: item.id,
            quantity, // Calculated quantity
            unitPrice, // Unit price
            gstPerUnit: item.gstPerUnit,
            totalAmount, // Calculated total amount
            totalGstAmount: parseFloat(totalGstAmount.toFixed(2)), // Total GST amount
            isSelected: isAutoSelect,
          };
        },
      );

      // Filter out items with quantity 0
      const filteredProductDetailsList = getInitialProductDetailsList.filter(
        (item) => item.quantity > 0,
      );

      setProductDetailsList(filteredProductDetailsList);
      setInvoicedData((prev) => ({
        ...prev,
        invoiceItems: isAutoSelect ? filteredProductDetailsList : [],
      }));
      setAllSelected(isAutoSelect);
    }
  }, [orderDetails, isAutoSelect]);

  useEffect(() => {
    const totalAmount = productDetailsList.reduce(
      (acc, item) => acc + (item.isSelected ? item.totalAmount : 0),
      0,
    );

    const totalGstAmount = productDetailsList.reduce(
      (acc, item) => acc + (item.isSelected ? item.totalGstAmount : 0),
      0,
    );

    setInvoicedData((prev) => ({
      ...prev,
      amount: totalAmount,
      gstAmount: totalGstAmount,
      invoiceItems: productDetailsList.filter((item) => item.isSelected),
    }));
  }, [productDetailsList]);

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
      amount: totalAmount,
      gstAmount: totalGstAmount,
    }));
  }, [invoicedData.invoiceItems]);

  const updateProductDetailsList = (index, newQuantity) => {
    const updatedList = productDetailsList
      .map((item, idx) =>
        idx === index
          ? {
              ...item,
              quantity: newQuantity,
              totalAmount: newQuantity * item.unitPrice,
              totalGstAmount: parseFloat(
                (
                  newQuantity *
                  item.unitPrice *
                  (item.gstPerUnit / 100)
                ).toFixed(2),
              ),
            }
          : item,
      )
      .filter((item) => item.quantity > 0); // Filter out zero quantity items

    setProductDetailsList(updatedList);
    setInvoicedData((prev) => ({
      ...prev,
      invoiceItems: updatedList.filter((item) => item.isSelected),
    }));
  };

  const handleSelectAll = (isSelected) => {
    setAllSelected(isSelected);

    const updatedList = productDetailsList
      .map((item) => ({
        ...item,
        isSelected,
      }))
      .filter((item) => item.quantity > 0); // Ensure selected items are valid

    setProductDetailsList(updatedList);

    if (isSelected) {
      const updatedItems = updatedList.map((item) => ({
        ...item,
        totalAmount: item.quantity * item.unitPrice,
        totalGstAmount: parseFloat(
          (item.quantity * item.unitPrice * (item.gstPerUnit / 100)).toFixed(2),
        ),
      }));
      setInvoicedData({
        ...invoicedData,
        invoiceItems: updatedItems,
      });
    } else {
      setInvoicedData((prev) => ({
        ...prev,
        invoiceItems: [],
      }));
    }
  };

  const onHandleClose = () => {
    setProductDetailsList([]);
    setInvoicedData({
      ...invoicedData,
      invoiceItems: [],
    });
  };

  const previewInvMutation = useMutation({
    mutationKey: [invoiceApi.previewInvoice.endpointKey],
    mutationFn: previewInvoice,
    onSuccess: (data) => setPreviewInvoiceBase64(data?.data?.data),
    onError: (error) =>
      toast.error(error.response.data.message || 'Something went wrong'),
  });

  const generateOTPMutation = useMutation({
    mutationKey: [invoiceApi.generateOTPInvoice.endpointKey],
    mutationFn: invoiceGenerateOTP,
    onSuccess: () => toast.success('OTP sent'),
    onError: (error) =>
      toast.error(error.response.data.message || 'Something went wrong'),
  });

  const handlePreview = () => previewInvMutation.mutate(invoicedData);

  const handleGenerateOTP = () => generateOTPMutation.mutate();

  // to get client name and number
  const { data: clients } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId),
    select: (res) => res.data.data,
  });
  const client = clients?.find((clientData) => {
    const clientId = clientData?.client?.id ?? clientData?.id;
    return clientId === orderDetails?.buyerEnterpriseId;
  });

  const clientName =
    client?.client === null
      ? client?.invitation?.userDetails?.name
      : client?.client?.name;

  const clientNumber =
    client?.client === null
      ? client?.invitation?.invitationIdentifier
      : client?.client?.mobileNumber;

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
    <Wrapper className="relative">
      {/* Collapsable overview */}
      <OrdersOverview
        isCollapsableOverview={true}
        orderDetails={orderDetails}
        orderId={orderDetails?.referenceNumber}
        multiStatus={multiStatus}
        Name={clientName}
        mobileNumber={clientNumber}
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
                ITEM NAME
              </TableHead>
              <TableHead className="shrink-0 text-xs font-bold text-black">
                QUANTITY
              </TableHead>
              <TableHead className="shrink-0 text-xs font-bold text-black">
                UNIT PRICE
              </TableHead>
              <TableHead className="shrink-0 text-xs font-bold text-black">
                TOTAL AMOUNT
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
                                  totalAmount: item.quantity * item.unitPrice,
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

                  <TableCell colSpan={1}>
                    <div className="flex gap-1">
                      <Button
                        className="disabled:hover:cursor-not-allowed"
                        variant="export"
                        onClick={() => {
                          if (product.quantity > 1) {
                            updateProductDetailsList(
                              index,
                              product.quantity - 1,
                            );
                          }
                        }}
                        disabled={product?.quantity <= 1 || isAutoSelect}
                      >
                        -
                      </Button>

                      <Input
                        type="number"
                        name="quantity"
                        className="w-20 rounded-sm pr-4"
                        value={product?.quantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value, 10);
                          if (
                            !Number.isNaN(newQty) &&
                            newQty >= 1 &&
                            newQty <= initialQuantities?.[index]
                          ) {
                            updateProductDetailsList(index, newQty);
                          }
                        }}
                        disabled={isAutoSelect}
                      />

                      <Button
                        className="disabled:cursor-not-allowed"
                        variant="export"
                        onClick={() => {
                          if (product?.quantity < initialQuantities[index]) {
                            updateProductDetailsList(
                              index,
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
                  </TableCell>

                  <TableCell colSpan={1}>{product?.unitPrice}</TableCell>

                  <TableCell colSpan={1}>
                    <Input
                      type="text"
                      name="totalAmount"
                      disabled
                      className="w-32 disabled:cursor-not-allowed"
                      value={`₹ ${product.totalAmount}`}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <div className="flex justify-end gap-4 border-t pt-4">
          <div className="mt-auto h-[1px] bg-neutral-300"></div>
          {!isAutoSelect && (
            <PreviewInvoice
              base64StrToRenderPDF={previewInvoiceBase64}
              mutationFn={handlePreview}
              disableCondition={invoicedData?.invoiceItems?.length === 0}
            />
          )}

          <GenerateInvoiceModal
            orderDetails={orderDetails}
            invoicedData={invoicedData}
            setInvoicedData={setInvoicedData}
            generateOTP={handleGenerateOTP}
            disableCondition={
              isAutoSelect ? false : invoicedData?.invoiceItems?.length === 0
            }
            setIsGenerateInvoice={setIsGenerateInvoice}
            handleClose={onHandleClose}
          />
        </div>
      </section>
    </Wrapper>
  );
};

export default GenerateInvoice;
