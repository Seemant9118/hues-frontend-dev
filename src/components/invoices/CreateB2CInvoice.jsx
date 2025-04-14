/* eslint-disable no-unsafe-optional-chaining */
import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { customerApis } from '@/api/enterprises_user/customers/customersApi';
import { userAuth } from '@/api/user_auth/Users';
import {
  getStylesForSelectComponent,
  isGstApplicable,
} from '@/appUtils/helperFunctions';
import { useCreateSalesColumns } from '@/components/columns/useCreateSalesColumns';
import { DataTable } from '@/components/table/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalStorageService } from '@/lib/utils';
import {
  getProductCatalogue,
  getServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import { getCustomers } from '@/services/Enterprises_Users_Service/Customer_Services/Customer_Services';
import { createInvoice } from '@/services/Orders_Services/Orders_Services';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'sonner';
import EmptyStageComponent from '../ui/EmptyStageComponent';
import ErrorBox from '../ui/ErrorBox';
import Loading from '../ui/Loading';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import Wrapper from '../wrappers/Wrapper';

const CreateB2CInvoice = ({
  cta,
  name,
  isOrder,
  isCreatingInvoice,
  onCancel,
}) => {
  const translations = useTranslations('components.create_edit_order');

  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [errorMsg, setErrorMsg] = useState({});
  const [selectedItem, setSelectedItem] = useState({
    productName: '',
    productType: '',
    productId: '',
    quantity: null,
    unitPrice: null,
    gstPerUnit: null,
    totalAmount: null,
    totalGstAmount: null,
  });
  const [order, setOrder] = useState({
    clientType: 'B2C',
    sellerEnterpriseId: enterpriseId,
    buyerId: null,
    gstAmount: null,
    amount: null,
    orderType: 'SALES',
    invoiceType: '',
    orderItems: [],
  });

  // [GST/NON-GST Checking]
  // fetch profileDetails API
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: !!isCreatingInvoice,
  });
  const isGstApplicableForSalesOrders =
    !!profileDetails?.enterpriseDetails?.gstNumber;

  // [B2C customers]
  // customer[B2C] api fetching
  const { data: customers } = useQuery({
    queryKey: [customerApis.getCustomers.endpointKey, enterpriseId],
    queryFn: () => getCustomers(enterpriseId),
    select: (res) => res.data.data,
    enabled: order.clientType === 'B2C',
  });
  // customer options
  const [options, setOptions] = useState([]);
  // Transform customers data into options format that can be used in select component
  useEffect(() => {
    if (customers) {
      const transformedOptions = customers.map((customer) => ({
        value: customer.mobileNumber,
        label: `${customer.countryCode} ${customer.mobileNumber}`, // Displaying country code with mobile number
      }));
      setOptions(transformedOptions);
    }
  }, [customers]);

  // Handle selection of an existing option
  const handleChange = (selectedOption) => {
    setOrder((prevOrder) => ({
      ...prevOrder,
      buyerId: selectedOption ? selectedOption.value : null,
    }));
  };

  // Handle creation of a new option
  const handleCreate = (inputValue) => {
    const newOption = { value: inputValue, label: inputValue };

    // Add the new option to the list of options
    setOptions((prevOptions) => [...prevOptions, newOption]);

    // Update the order state
    setOrder((prevOrder) => ({
      ...prevOrder,
      buyerId: newOption.value,
    }));
  };

  // [address type]
  const addressTypesOptions = [
    {
      value: 'OTC',
      label: 'OTC (Over-the-Counter)',
    },
    {
      value: 'deliveryPurchase',
      label: 'DeliveryPurchase',
    },
  ];

  // addresses fetched from an APIs
  const addressesOptions = [
    {
      value: 'address1',
      label: 'Address 1',
    },
    {
      value: 'address2',
      label: 'Address 2',
    },
  ];

  // [item type]
  const itemTypeOptions = [
    {
      value: 'GOODS',
      label: translations('form.input.item_type.goods'),
    },
    {
      value: 'SERVICE',
      label: translations('form.input.item_type.services'),
    },
  ];

  // [Client's Goods and Services]
  // client's catalogue's goods fetching
  const { data: goodsData } = useQuery({
    queryKey: [catalogueApis.getProductCatalogue.endpointKey, enterpriseId],
    queryFn: () => getProductCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: order.invoiceType === 'GOODS',
  });
  // formatting - client's goods options
  const clientsGoodsOptions = goodsData?.map((good) => {
    const value = { ...good, productType: 'GOODS', productName: good.name };
    const label = good.name;

    return { value, label };
  });
  // client's catalogue services fetching
  const { data: servicesData } = useQuery({
    queryKey: [catalogueApis.getServiceCatalogue.endpointKey, enterpriseId],
    queryFn: () => getServiceCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: order.invoiceType === 'SERVICE',
  });
  // formatting - client's services options
  const clientsServicesOptions = servicesData?.map((service) => {
    const value = {
      ...service,
      productType: 'SERVICE',
      productName: service.name,
    };
    const label = service.name;

    return { value, label };
  });
  // itemClientListingOptions on the basis of item type
  const itemClientListingOptions =
    order.invoiceType === 'GOODS'
      ? clientsGoodsOptions
      : clientsServicesOptions;

  // mutation - create invoice
  const invoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      toast.success(
        translations('form.successMsg.invoice_created_successfully'),
      );
      onCancel();
      // setInvoiceListing((prev) => [res.data.data, ...prev]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // validations
  const validation = ({ order, selectedItem }) => {
    const errorObj = {};

    if (order.clientType === 'B2C' && order?.buyerId == null) {
      errorObj.buyerId = translations('form.errorMsg.client');
    }
    if (order.invoiceType === '') {
      errorObj.invoiceType = translations('form.errorMsg.item_type');
    }
    if (order?.orderItems?.length === 0) {
      errorObj.orderItem = translations('form.errorMsg.item');
    }
    if (selectedItem.quantity === null) {
      errorObj.quantity = translations('form.errorMsg.quantity');
    }
    if (selectedItem.unitPrice === null) {
      errorObj.unitPrice = translations('form.errorMsg.price');
    }
    if (selectedItem.gstPerUnit === null) {
      errorObj.gstPerUnit = translations('form.errorMsg.gst');
    }
    if (selectedItem.totalGstAmount === null) {
      errorObj.totalGstAmount = translations('form.errorMsg.tax_amount');
    }
    if (selectedItem.totalAmount === null) {
      errorObj.totalAmount = translations('form.errorMsg.amount');
    }

    return errorObj;
  };

  const handleSetTotalAmt = () => {
    const totalAmount = order.orderItems.reduce((totalAmt, orderItem) => {
      return totalAmt + orderItem.totalAmount;
    }, 0);

    const totalGstAmt = order.orderItems.reduce((totalGst, orderItem) => {
      return (
        totalGst +
        (isGstApplicable(isGstApplicableForSalesOrders)
          ? orderItem.totalGstAmount
          : 0)
      );
    }, 0);

    return { totalAmount, totalGstAmt };
  };

  const handleCalculateGrossAmt = () => {
    const grossAmount = order.orderItems.reduce((acc, orderItem) => {
      return acc + orderItem.totalAmount;
    }, 0);
    return grossAmount;
  };
  const grossAmt = handleCalculateGrossAmt();

  const handleCalculateTotalAmounts = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();

    const totalAmountWithGST = totalAmount + totalGstAmt;
    return totalAmountWithGST;
  };
  const totalAmtWithGst = handleCalculateTotalAmounts();
  const { totalGstAmt } = handleSetTotalAmt();

  // handling submit fn
  const handleSubmit = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();
    const isError = validation({ order, selectedItem });

    if (Object.keys(isError).length === 0) {
      if (isOrder === 'invoice') {
        invoiceMutation.mutate({
          ...order,
          buyerId: Number(order.buyerId),
          amount: parseFloat(totalAmount.toFixed(2)),
          gstAmount: parseFloat(totalGstAmt.toFixed(2)),
        });
        setErrorMsg({});
      }
    } else {
      setErrorMsg(isError);
    }
  };

  // columns
  const createSalesColumns = useCreateSalesColumns(
    isOrder,
    setOrder,
    setSelectedItem,
    isGstApplicableForSalesOrders,
  );

  if (!enterpriseId) {
    return (
      <div className="flex flex-col justify-center">
        <EmptyStageComponent heading="Please Complete Your Onboarding to Create Order" />
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <Wrapper className="relative flex h-full flex-col py-2">
      <SubHeader name={name}></SubHeader>

      {/* Customer section */}
      <div className="rounded-sm border border-neutral-200 p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Customer Phone */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              {translations('form.label.customer')}
              <span className="text-red-600">*</span>
            </Label>
            <div className="flex w-full flex-col gap-1">
              <CreatableSelect
                value={
                  options?.find((option) => option.value === order.buyerId) ||
                  null
                }
                onChange={handleChange}
                onCreateOption={handleCreate}
                styles={getStylesForSelectComponent()}
                className="max-w-sm text-sm"
                isClearable
                placeholder="+91 1234567890"
                options={options}
              />
              {errorMsg.buyerId && <ErrorBox msg={errorMsg.buyerId} />}
            </div>
          </div>

          {/* Customer Name */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              Customer Name
              <span className="text-red-600">*</span>
            </Label>
            <Input
              type="text"
              value={order.customerName}
              onChange={(e) =>
                setOrder((prev) => ({ ...prev, customerName: e.target.value }))
              }
              placeholder="Customer Name"
              className="max-w-sm text-sm"
            />
          </div>

          {/* Address Type */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              Select Address Type
              <span className="text-red-600">*</span>
            </Label>
            <Select
              value={order.addressType}
              onChange={() => {}} // Add handler
              styles={getStylesForSelectComponent()}
              className="max-w-sm text-sm"
              isClearable
              placeholder="Select Address Type"
              options={addressTypesOptions}
            />
          </div>

          {/* Address */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              Select Address
              <span className="text-red-600">*</span>
            </Label>
            <Select
              value={order.address}
              onChange={() => {}} // Add handler
              styles={getStylesForSelectComponent()}
              className="max-w-sm text-sm"
              isClearable
              placeholder="Select Address"
              options={addressesOptions}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Item Type */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              {translations('form.label.item_type')}
              <span className="text-red-600">*</span>
            </Label>
            <Select
              name="itemType"
              placeholder={translations('form.input.item_type.placeholder')}
              options={itemTypeOptions}
              styles={getStylesForSelectComponent()}
              className="w-full text-sm"
              classNamePrefix="select"
              onChange={(selectedOption) => {
                if (!selectedOption) return;
                setOrder((prev) => ({
                  ...prev,
                  invoiceType: selectedOption.value,
                }));
              }}
            />
            {errorMsg.invoiceType && <ErrorBox msg={errorMsg.invoiceType} />}
          </div>

          {/* Item */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              {translations('form.label.item')}
              <span className="text-red-600">*</span>
            </Label>
            <Select
              name="items"
              placeholder={translations('form.input.item.placeholder')}
              options={itemClientListingOptions}
              styles={getStylesForSelectComponent()}
              isOptionDisabled={(option) => option.disabled}
              className="w-full text-sm"
              isDisabled={
                (cta === 'offer' && order.buyerId == null) ||
                (cta === 'bid' && order.sellerEnterpriseId == null) ||
                order.invoiceType === ''
              }
              onChange={(selectedOption) => {
                const selectedItemData = itemClientListingOptions?.find(
                  (item) => item.value.id === selectedOption?.value?.id,
                )?.value;

                if (selectedItemData) {
                  setSelectedItem((prev) => ({
                    ...prev,
                    productId: selectedItemData.id,
                    productType: selectedItemData.productType,
                    productName: selectedItemData.productName,
                    unitPrice: selectedItemData.rate,
                    gstPerUnit: isGstApplicable(isGstApplicableForSalesOrders)
                      ? selectedItemData.gstPercentage
                      : 0,
                  }));
                }
              }}
            />
            {errorMsg.orderItem && <ErrorBox msg={errorMsg.orderItem} />}
          </div>

          {/* Quantity */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              {translations('form.label.quantity')}
              <span className="text-red-600">*</span>
            </Label>
            <Input
              type="number"
              disabled={
                (cta === 'offer' && order.buyerId == null) ||
                order.sellerEnterpriseId == null
              }
              value={selectedItem.quantity}
              onChange={(e) => {
                const quantity = Number(e.target.value);
                const totalAmt = parseFloat(
                  (quantity * selectedItem.unitPrice).toFixed(2),
                );
                const gstAmt = parseFloat(
                  (totalAmt * (selectedItem.gstPerUnit / 100)).toFixed(2),
                );
                setSelectedItem((prev) => ({
                  ...prev,
                  quantity,
                  totalAmount: totalAmt,
                  totalGstAmount: gstAmt,
                }));
              }}
              className="w-full"
            />
            {errorMsg.quantity && <ErrorBox msg={errorMsg.quantity} />}
          </div>

          {/* Price */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              {translations('form.label.price')}
              <span className="text-red-600">*</span>
            </Label>
            <Input
              type="number"
              disabled={
                (cta === 'offer' && order.buyerId == null) ||
                order.sellerEnterpriseId == null
              }
              value={selectedItem.unitPrice}
              onChange={(e) => {
                const price = Number(e.target.value);
                const totalAmt = parseFloat(
                  (selectedItem.quantity * price).toFixed(2),
                );
                const gstAmt = parseFloat(
                  (totalAmt * (selectedItem.gstPerUnit / 100)).toFixed(2),
                );
                setSelectedItem((prev) => ({
                  ...prev,
                  unitPrice: price,
                  totalAmount: totalAmt,
                  totalGstAmount: gstAmt,
                }));
              }}
              className="w-full"
            />
            {errorMsg.unitPrice && <ErrorBox msg={errorMsg.unitPrice} />}
          </div>

          {/* GST (%) */}
          {isGstApplicable(isGstApplicableForSalesOrders) && (
            <div className="flex w-full flex-col gap-2">
              <Label className="flex gap-1">
                {translations('form.label.gst')}{' '}
                <span className="text-xs">(%)</span>
                <span className="text-red-600">*</span>
              </Label>
              <Input
                type="number"
                disabled
                value={selectedItem.gstPerUnit}
                className="w-full"
              />
              {errorMsg.gstPerUnit && <ErrorBox msg={errorMsg.gstPerUnit} />}
            </div>
          )}

          {/* Invoice Value / Value */}
          <div className="flex w-full flex-col gap-2">
            <Label className="flex gap-1">
              {isOrder === 'invoice'
                ? translations('form.label.invoice_value')
                : translations('form.label.value')}
              <span className="text-red-600">*</span>
            </Label>
            <Input
              type="number"
              disabled
              value={selectedItem.totalAmount}
              className="w-full"
            />
            {errorMsg.totalAmount && <ErrorBox msg={errorMsg.totalAmount} />}
          </div>

          {/* Tax Amount */}
          {isGstApplicable(isGstApplicableForSalesOrders) && (
            <div className="flex w-full flex-col gap-2">
              <Label className="flex gap-1">
                {translations('form.label.tax_amount')}
                <span className="text-red-600">*</span>
              </Label>
              <Input
                type="number"
                disabled
                value={selectedItem.totalGstAmount}
                className="w-full"
              />
              {errorMsg.totalGstAmount && (
                <ErrorBox msg={errorMsg.totalGstAmount} />
              )}
            </div>
          )}

          {/* Total Amount (With GST) */}
          {isGstApplicable(isGstApplicableForSalesOrders) && (
            <div className="flex w-full flex-col gap-2">
              <Label className="flex gap-1">
                {translations('form.label.amount')}
                <span className="text-red-600">*</span>
              </Label>
              <Input
                type="number"
                disabled
                value={(
                  (Number(selectedItem.totalAmount) || 0) +
                  (Number(selectedItem.totalGstAmount) || 0)
                ).toFixed(2)}
                className="w-full"
              />
              {errorMsg.totalAmount && <ErrorBox msg={errorMsg.totalAmount} />}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedItem((prev) => ({
                ...prev,
                productId: '',
                productType: '',
                productName: '',
                unitPrice: '',
                gstPerUnit: '',
              }));
            }}
          >
            {translations('form.ctas.cancel')}
          </Button>
          <Button
            size="sm"
            disabled={Object.values(selectedItem).some(
              (value) => value === '' || value === null || value === undefined,
            )} // if any item of selectedItem is empty then button must be disabled
            onClick={() => {
              setOrder((prev) => ({
                ...prev,
                orderItems: [...prev.orderItems, selectedItem],
              }));
              setSelectedItem({
                productName: '',
                productType: '',
                productId: '',
                quantity: '',
                unitPrice: '',
                gstPerUnit: '',
                totalAmount: '',
                totalGstAmount: '',
              });
              setErrorMsg({});
            }}
            variant="blue_outline"
          >
            {translations('form.ctas.add')}
          </Button>
        </div>
      </div>

      {/* selected item table */}
      <DataTable data={order.orderItems} columns={createSalesColumns} />

      <div className="mt-auto h-[1px] bg-neutral-300"></div>

      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isGstApplicable(isGstApplicableForSalesOrders) && (
            <>
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {translations('form.footer.gross_amount')} :
                </span>
                <span className="rounded-sm border bg-slate-100 p-2">
                  {grossAmt.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {translations('form.footer.tax_amount')} :{' '}
                </span>
                <span className="rounded-sm border bg-slate-100 p-2">
                  {totalGstAmt.toFixed(2)}
                </span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {translations('form.footer.total_amount')} :{' '}
            </span>
            <span className="rounded-sm border bg-slate-100 p-2">
              {totalAmtWithGst.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={onCancel} variant={'outline'}>
            {translations('form.ctas.cancel')}
          </Button>
          <Button
            size="sm"
            onClick={
              handleSubmit // invoke handle submit fn
            }
            disabled={invoiceMutation.isPending}
          >
            {invoiceMutation.isPending ? (
              <Loading />
            ) : (
              translations('form.ctas.create')
            )}
          </Button>
        </div>
      </div>
    </Wrapper>
  );
};

export default CreateB2CInvoice;
