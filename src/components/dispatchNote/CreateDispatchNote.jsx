/* eslint-disable no-unsafe-optional-chaining */

import { addressAPIs } from '@/api/addressApi/addressApis';
import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { settingsAPI } from '@/api/settings/settingsApi';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { getStylesForSelectComponent } from '@/appUtils/helperFunctions';
import { LocalStorageService } from '@/lib/utils';
import { getAddressByEnterprise } from '@/services/address_Services/AddressServices';
import { createDispatchNote } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { addUpdateAddress } from '@/services/Settings_Services/SettingsService';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import AddNewAddress from '../enterprise/AddNewAddress';
import InvoiceOverview from '../invoices/InvoiceOverview';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import InputWithSelect from '../ui/InputWithSelect';
import { Label } from '../ui/label';
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

const CreateDispatchNote = ({ invoiceDetails, setIsCreatingDispatchNote }) => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const translations = useTranslations('components.createDispatchNote.form');

  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const [selectDispatcher, setSelectDispatcher] = useState(null);
  const [selectBilling, setSelectBilling] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [dispatchedData, setDispatchedData] = useState({
    movementType: 'Supply for sale (final delivery to customer)',
    dispatchFromAddressId: '',
    billingFromAddressId: '',
    invoiceId: Number(params.invoiceId),
    totalGstAmount: null,
    totalAmount: null,
    items: [],
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [productDetailsList, setProductDetailsList] = useState(null);
  const [initialQuantities, setInitialQuantities] = useState([]);
  const [allSelected, setAllSelected] = useState(false);

  // get addresses
  const { data: addresses } = useQuery({
    queryKey: [addressAPIs.getAddressByEnterprise.endpointKey, enterpriseId],
    queryFn: () => getAddressByEnterprise(enterpriseId),
    select: (res) => res.data.data,
  });

  const addressesOptions = [
    ...(addresses || []).map((address) => {
      const value = address?.id;
      const label = address?.address;

      return { value, label };
    }),
    // Special option for "address New Address"
    {
      value: 'add-new-address', // Special value for "Add New Address"
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> {translations('dispatchFrom.add-new-address')}
        </span>
      ),
    },
  ];

  // fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
  });

  // calculate remaining qty helper
  const calculatedInvoiceQuantity = (quantity, invoiceQuantity) =>
    Math.max(quantity - invoiceQuantity, 0);

  // build productDetailsList when invoiceItemDetails change
  useEffect(() => {
    if (!invoiceDetails?.invoiceItemDetails?.length) return;

    const productDetails = invoiceDetails?.invoiceItemDetails?.map((item) => {
      const {
        orderItemId,
        id,
        quantity,
        dispatchedQuantity,
        unitPrice = 0,
        gstPerUnit = 0,
        unitId,
      } = item;

      const calculatedDispatchedQty =
        calculatedInvoiceQuantity(quantity, dispatchedQuantity) || 0;

      // calculate values
      const totalAmount = parseFloat(
        (calculatedDispatchedQty * unitPrice).toFixed(2),
      );
      const totalGstAmount = parseFloat(
        (totalAmount * (gstPerUnit / 100)).toFixed(2),
      );

      return {
        ...orderItemId.productDetails, // product details
        productType: orderItemId.productType,
        orderItemId: orderItemId.id,
        invoiceItemId: id,
        quantity: calculatedDispatchedQty,
        unitId,
        unitPrice,
        gstPerUnit,
        __originalQuantity: quantity, // Keep reference for initial quantit
        amount: totalAmount,
        gstAmount: totalGstAmount,
      };
    });

    const filteredList = productDetails.filter((p) => p.quantity > 0);

    // Initial quantities should match only filtered list order
    const filteredInitialQuantities = filteredList.map(
      (item) => item.__originalQuantity,
    );

    setInitialQuantities(filteredInitialQuantities);
    setProductDetailsList(filteredList);
  }, [invoiceDetails?.invoiceItemDetails]);

  // sync invoicedData totals whenever invoiceItems change
  useEffect(() => {
    if (!dispatchedData?.items?.length) return;

    const totalAmount = dispatchedData.items.reduce(
      (acc, item) => acc + (item.amount || 0),
      0,
    );

    const totalGstAmount = dispatchedData.items.reduce(
      (acc, item) => acc + (item.gstAmount || 0),
      0,
    );

    setDispatchedData((prev) => ({
      ...prev,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalGstAmount: parseFloat(totalGstAmount.toFixed(2)),
    }));
  }, [dispatchedData.items]);

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
          amount:
            qty && !Number.isNaN(qty)
              ? parseFloat((qty * item.unitPrice).toFixed(2))
              : 0,
          gstAmount:
            qty && !Number.isNaN(qty)
              ? parseFloat(
                  (qty * item.unitPrice * (item.gstPerUnit / 100)).toFixed(2),
                )
              : 0,
        };
      }),
    );

    // Sync dispatchedData.items
    setDispatchedData((prev) => {
      const exists = prev.items?.some((i) => i.orderItemId === orderItemId);
      if (!exists) return prev; // only update if selected

      const updatedItems = prev.items.map((item) => {
        if (item.orderItemId !== orderItemId) return item;

        return {
          ...item,
          quantity: newQty === '' ? '' : newQty,
          amount:
            newQty && !Number.isNaN(newQty)
              ? parseFloat((newQty * item.unitPrice).toFixed(2))
              : 0,
          gstAmount:
            newQty && !Number.isNaN(newQty)
              ? parseFloat(
                  (newQty * item.unitPrice * (item.gstPerUnit / 100)).toFixed(
                    2,
                  ),
                )
              : 0,
        };
      });

      return { ...prev, items: updatedItems };
    });

    // validation logic
    const matchedItem = invoiceDetails?.invoiceItemDetails?.find(
      (i) => i.orderItemId?.id === orderItemId,
    );

    const maxQty =
      (matchedItem?.quantity || 0) - (matchedItem?.dispatchedQuantity || 0);

    const newErrorMsg = { ...errorMsg };

    if (newQty === '') {
      newErrorMsg[`quantity_${orderItemId}`] = 'Quantity cannot be empty';
    } else if (Number.isNaN(newQty) || newQty < 0) {
      newErrorMsg[`quantity_${orderItemId}`] =
        'Quantity must be a valid number';
    } else if (newQty > maxQty) {
      newErrorMsg[`quantity_${orderItemId}`] =
        `Only ${maxQty} items available for dispatching`;
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

    setDispatchedData((prev) => ({
      ...prev,
      items: isSelected ? updatedList.filter((i) => i.quantity > 0) : [],
      totalAmount: isSelected ? prev.totalAmount : null,
      totalGstAmount: isSelected ? prev.totalGstAmount : null,
    }));
  };

  // validation function
  const validations = (disptachedData) => {
    const error = {};

    if (!disptachedData.movementType)
      error.movementType = 'Movement type is required';

    if (!dispatchedData?.dispatchFromAddressId) {
      error.dispatchFrom = 'Please select an dispatch address';
    }
    if (!dispatchedData?.billingFromAddressId) {
      error.billingFrom = 'Please select an billing address';
    }

    // Check if any invoice is selected
    if (!disptachedData?.items?.length) {
      error.isAnyInvoiceSelected = 'Please select at least one Item to create';
    }

    disptachedData?.items?.forEach((item) => {
      const id = item?.orderItemId; // productDetailsList uses orderItemId (primitive id)
      const quantity = item?.quantity;

      // find the corresponding invoice item from invoiceDetails
      const matchedOrderItem = invoiceDetails?.invoiceItemDetails?.find(
        (invoiceItem) => invoiceItem.orderItemId?.id === id, // correct nested reference
      );

      const maxQuantity =
        Number(matchedOrderItem?.quantity || 0) -
        Number(matchedOrderItem?.dispatchedQuantity || 0);

      if (quantity === '' || quantity === null || quantity === undefined) {
        error[`quantity_${id}`] = 'Quantity cannot be empty';
      } else if (!Number.isFinite(quantity) || quantity <= 0) {
        error[`quantity_${id}`] = 'Quantity must be a valid number';
      } else if (quantity > maxQuantity) {
        error[`quantity_${id}`] =
          `Only ${maxQuantity} items available for dispatching`;
      }
    });

    return error;
  };

  // handle modal/dialog close
  const onHandleClose = () => {
    setProductDetailsList([]);
    setDispatchedData((prev) => ({
      ...prev,
      items: [],
    }));
    setIsCreatingDispatchNote(false);
  };

  // mutation fn - create dispatch note
  const createDispatchNoteMutation = useMutation({
    mutationKey: [deliveryProcess.createDispatchNote.endpointKey],
    mutationFn: createDispatchNote,
    onSuccess: (data) => {
      toast.success(translations('successMsg.dispatach_created_success'));
      queryClient.invalidateQueries([
        invoiceApi.getInvoice.endpointKey,
        params.invoiceId,
      ]);
      router.push(
        `/dashboard/transport/dispatch/${data?.data?.data?.data?.dispatchNoteId}`,
      );
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  // handling submit fn
  const handleSubmit = (updatedDispatchedData) => {
    const validationErrors = validations(updatedDispatchedData);

    // if validation errors exist, set them and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setErrorMsg(validationErrors);
      return; // prevent API call
    }

    // clear any previous errors
    setErrorMsg({});

    // proceed to API call
    createDispatchNoteMutation.mutate({
      id: invoiceDetails?.invoiceDetails?.orderId,
      data: updatedDispatchedData,
    });
  };

  const paymentStatus = ConditionalRenderingStatus({
    status: invoiceDetails?.invoiceDetails?.invoiceMetaData?.payment?.status,
  });

  return (
    <Wrapper className="h-full">
      <>
        {/* Collapsible overview */}
        <InvoiceOverview
          isCollapsableOverview={true}
          invoiceDetails={invoiceDetails.invoiceDetails}
          invoiceId={invoiceDetails?.invoiceDetails?.invoiceReferenceNumber}
          orderId={invoiceDetails?.invoiceDetails?.orderId}
          orderRefId={invoiceDetails?.invoiceDetails?.orderReferenceNumber}
          paymentStatus={paymentStatus}
          Name={`${invoiceDetails?.invoiceDetails?.customerName} (${invoiceDetails?.invoiceDetails?.clientType})`}
          type={invoiceDetails?.invoiceDetails?.invoiceType}
          date={invoiceDetails?.invoiceDetails?.createdAt}
          amount={invoiceDetails?.invoiceDetails?.totalAmount}
          amountPaid={invoiceDetails?.invoiceDetails?.amountPaid}
        />
        <section className="mt-2 flex h-full flex-col justify-between">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-sm border p-4">
              <h1 className="font-semibold">
                Movement Type <span className="text-red-500">*</span>
              </h1>
              <section className="flex flex-col gap-4">
                <div className="mt-1 flex flex-col gap-3">
                  {[
                    'Internal logistics (stock transfer / repositioning)',
                    'Supply for sale (final delivery to customer)',
                  ].map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="movementType"
                        value={option}
                        checked={dispatchedData.movementType === option}
                        onChange={() =>
                          setDispatchedData((prev) => ({
                            ...prev,
                            movementType: option,
                          }))
                        }
                        className="accent-primary"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                  {errorMsg?.movementType && (
                    <ErrorBox msg={errorMsg?.movementType} />
                  )}
                </div>
              </section>
              {/* form - transporter, dispatch from, billing from */}
              <h1 className="font-semibold">Dispatch Details</h1>
              <div className="grid grid-cols-2 gap-2 rounded-sm">
                {/* dispatch from */}
                <div>
                  <Label>{translations('dispatchFrom.label')}</Label>
                  <span className="text-red-500">*</span>
                  <div className="flex flex-col gap-4">
                    {/* Dispatch Select */}
                    <Select
                      name="dispatchFrom"
                      placeholder={translations('dispatchFrom.placeholder')}
                      options={addressesOptions}
                      styles={getStylesForSelectComponent()}
                      className="max-w-full text-sm"
                      classNamePrefix="select"
                      value={
                        selectDispatcher
                          ? selectDispatcher?.selectedValue
                          : null
                      }
                      onChange={(selectedOption) => {
                        if (!selectedOption) return;

                        if (selectedOption.value === 'add-new-address') {
                          setIsAddingNewAddress(true);
                          return;
                        }

                        setSelectDispatcher({
                          dispatchFrom: selectedOption.value,
                          selectedValue: selectedOption,
                        });

                        setDispatchedData((prev) => ({
                          ...prev,
                          dispatchFromAddressId: selectedOption.value,
                        }));
                      }}
                    />
                    {errorMsg?.dispatchFrom && (
                      <ErrorBox msg={errorMsg?.dispatchFrom} />
                    )}
                  </div>
                </div>
                {/* billing from */}
                <div>
                  <Label>{translations('billingFrom.label')}</Label>
                  <span className="text-red-500">*</span>
                  <div className="flex flex-col gap-4">
                    {/* billing Select */}
                    <Select
                      name="billingFrom"
                      placeholder={translations('billingFrom.placeholder')}
                      options={addressesOptions}
                      styles={getStylesForSelectComponent()}
                      className="max-w-full text-sm"
                      classNamePrefix="select"
                      value={
                        selectBilling ? selectBilling?.selectedValue : null
                      }
                      onChange={(selectedOption) => {
                        if (!selectedOption) return;

                        if (selectedOption.value === 'add-new-address') {
                          setIsAddingNewAddress(true);
                          return;
                        }

                        setSelectBilling({
                          billingFrom: selectedOption.value,
                          selectedValue: selectedOption,
                        });

                        setDispatchedData((prev) => ({
                          ...prev,
                          billingFromAddressId: selectedOption.value,
                        }));
                      }}
                    />
                    {errorMsg?.billingFrom && (
                      <ErrorBox msg={errorMsg?.billingFrom} />
                    )}
                  </div>
                </div>

                {/* add new address : visible if isAddingNewAddress is true */}
                <AddNewAddress
                  isAddressAdding={isAddingNewAddress}
                  setIsAddressAdding={setIsAddingNewAddress}
                  mutationKey={settingsAPI.addUpdateAddress.endpointKey}
                  mutationFn={addUpdateAddress}
                  invalidateKey={deliveryProcess.getDispatchNote.endpointKey}
                />
              </div>
            </div>

            {/* table of items */}
            <h1 className="font-semibold">Items</h1>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(value) => handleSelectAll(value)}
                    />
                  </TableHead>
                  <TableHead className="shrink-0 text-xs font-bold text-black">
                    {translations('table.header.item_name')}
                  </TableHead>
                  <TableHead
                    className="shrink-0 text-xs font-bold text-black"
                    colSpan="2"
                  >
                    {translations('table.header.invoice_qty')}
                  </TableHead>
                  <TableHead className="shrink-0 text-xs font-bold text-black">
                    {translations('table.header.dispatch_qty')}
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
                {productDetailsList?.length > 0 &&
                  productDetailsList?.map((product, index) => {
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

                                setDispatchedData({
                                  ...dispatchedData,
                                  items: updatedItems.filter(
                                    (item) => item.isSelected,
                                  ),
                                });
                                setErrorMsg((prevMsg) => ({
                                  ...prevMsg,
                                  isAnyInvoiceSelected: '',
                                }));
                              } else {
                                setDispatchedData((prev) => ({
                                  ...prev,
                                  items: prev.items.filter(
                                    (item) =>
                                      item.orderItemId !==
                                      updatedList[index].orderItemId,
                                  ),
                                }));
                              }
                            }}
                          />
                        </TableCell>

                        <TableCell colSpan={1}>
                          {product?.productName ?? product?.serviceName}
                        </TableCell>

                        <TableCell colSpan={1}>
                          {initialQuantities[index]}
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
                                disabled={product?.quantity <= 1}
                              >
                                -
                              </Button>

                              <InputWithSelect
                                id="quantity"
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
                                  setDispatchedData((prev) => ({
                                    ...prev,
                                    items: updatedItems,
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
                                  product?.quantity >= initialQuantities[index]
                                }
                              >
                                +
                              </Button>
                            </div>

                            {/* Validation error for this quantity field */}
                            {errorMsg?.[`quantity_${product.orderItemId}`] && (
                              <ErrorBox
                                msg={
                                  errorMsg[`quantity_${product.orderItemId}`]
                                }
                              />
                            )}
                          </div>
                        </TableCell>

                        <TableCell colSpan={1}>
                          {`₹ ${(Number(product.unitPrice) || 0).toFixed(2)}`}
                        </TableCell>

                        <TableCell colSpan={1}>
                          <Input
                            type="text"
                            name="totalAmount"
                            disabled
                            className="w-32 disabled:cursor-not-allowed"
                            value={`₹ ${(Number(product.amount) || 0).toFixed(2)}`}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {productDetailsList?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan="6">No result found</TableCell>
                  </TableRow>
                )}
              </TableBody>

              {errorMsg?.isAnyInvoiceSelected && (
                <TableFooter className="w-full shrink-0">
                  <TableRow>
                    <TableCell colSpan="7">
                      <ErrorBox msg={errorMsg?.isAnyInvoiceSelected} />
                    </TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>
          <div className="flex justify-end gap-4 border-t pt-4">
            <div className="mt-auto h-[1px] bg-neutral-300"></div>

            <Button size="sm" variant="outline" onClick={() => onHandleClose()}>
              {translations('ctas.discard')}
            </Button>

            <Button
              size="sm"
              onClick={() => {
                handleSubmit(dispatchedData);
              }}
              disabled={createDispatchNoteMutation.isPending}
            >
              {createDispatchNoteMutation.isPending ? (
                <Loading />
              ) : (
                translations('ctas.create')
              )}
            </Button>
          </div>
        </section>
      </>
    </Wrapper>
  );
};

export default CreateDispatchNote;
