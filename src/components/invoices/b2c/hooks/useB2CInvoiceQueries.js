import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { customerApis } from '@/api/enterprises_user/customers/customersApi';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { userAuth } from '@/api/user_auth/Users';
import {
  getProductCatalogue,
  getServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import { getCustomersByNumber } from '@/services/Enterprises_Users_Service/Customer_Services/Customer_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';

export function useB2CInvoiceQueries({
  enterpriseId,
  userId,
  isCreatingInvoice,
  inputValue,
  invoiceType,
  orderItems,
  productBatchesMap,
  translations,
}) {
  const [customerIdentifier, setCustomerIdentifier] = useState('');
  const [options, setOptions] = useState([]);

  // Fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId,
  });

  // GST/NON-GST Checking
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: !!isCreatingInvoice,
  });
  const isGstApplicableForSalesOrders =
    !!profileDetails?.enterpriseDetails?.gstNumber;

  // Debounced search customer
  useEffect(() => {
    const handler = setTimeout(() => {
      setCustomerIdentifier(inputValue);
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue]);

  // Fetch customers
  const { data: customersSearchList } = useQuery({
    queryKey: [
      customerApis.getCustomersByNumber.endpointKey,
      customerIdentifier,
    ],
    queryFn: () => getCustomersByNumber(customerIdentifier),
    select: (data) => data.data.data,
    refetchOnWindowFocus: false,
  });

  // Transform API response into select options
  useEffect(() => {
    if (customersSearchList) {
      const transformedSearchedCustomers = customersSearchList.map(
        (customer) => ({
          value: customer.id || customer.mobileNumber,
          label: `${customer.countryCode} ${customer.mobileNumber}`,
          name: customer?.name,
          address: customer?.address,
          number: customer?.mobileNumber,
        }),
      );
      setOptions(transformedSearchedCustomers);
    }
  }, [customersSearchList]);

  const addressTypesOptions = [
    {
      value: 'OTC',
      label: 'OTC (Over-the-Counter)',
    },
    {
      value: 'deliveryPurchase',
      label: 'Delivery Purchase',
    },
  ];

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

  const isItemAlreadyAdded = useCallback(
    (itemId, batchId = null) => {
      if (batchId) {
        return orderItems?.some(
          (item) => item.productId === itemId && item.batch?.id === batchId,
        );
      }
      const hasNonBatched = orderItems?.some(
        (item) => item.productId === itemId && !item.batch,
      );
      if (hasNonBatched) return true;

      const batchesForThisItem = productBatchesMap[itemId];
      if (batchesForThisItem && batchesForThisItem.length > 0) {
        const addedBatchesCount = orderItems?.filter(
          (item) => item.productId === itemId && item.batch,
        ).length;
        return addedBatchesCount >= batchesForThisItem.length;
      }

      return false;
    },
    [orderItems, productBatchesMap],
  );

  // Goods catalogue
  const { data: goodsData } = useQuery({
    queryKey: [catalogueApis.getProductCatalogue.endpointKey, enterpriseId],
    queryFn: () => getProductCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: invoiceType === 'GOODS',
  });

  const clientsGoodsOptions =
    goodsData?.map((good) => {
      const value = { ...good, productType: 'GOODS', productName: good.name };
      const label = good.name;
      return { value, label, disabled: isItemAlreadyAdded(good.id) };
    }) ?? [];

  // Services catalogue
  const { data: servicesData } = useQuery({
    queryKey: [catalogueApis.getServiceCatalogue.endpointKey, enterpriseId],
    queryFn: () => getServiceCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: invoiceType === 'SERVICE',
  });

  const clientsServicesOptions =
    servicesData?.map((service) => {
      const value = {
        ...service,
        productType: 'SERVICE',
        serviceName: service.name,
      };
      const label = service.name;
      return { value, label, disabled: isItemAlreadyAdded(service.id) };
    }) ?? [];

  const itemClientListingOptions =
    invoiceType === 'GOODS' ? clientsGoodsOptions : clientsServicesOptions;

  return {
    units,
    options,
    setOptions,
    isGstApplicableForSalesOrders,
    addressTypesOptions,
    itemTypeOptions,
    goodsData,
    servicesData,
    itemClientListingOptions,
    isItemAlreadyAdded,
  };
}
