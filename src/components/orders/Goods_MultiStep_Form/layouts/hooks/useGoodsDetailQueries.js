import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';

import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { userAuth } from '@/api/user_auth/Users';
import {
  checkVendorGSTApplicability,
  isGstApplicable,
} from '@/appUtils/helperFunctions';
import {
  getProductCatalogue,
  getVendorProductCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { getVendors } from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { OrderDetails } from '@/services/Orders_Services/Orders_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';

/**
 * Custom hook encapsulating React Query calls, options generation, and GST applicability state for Goods details.
 */
export const useGoodsDetailQueries = ({
  order,
  setOrder,
  userId,
  enterpriseId,
  isPurchasePage,
  isOffer,
  isOfferType,
  referenceOrderId,
  translations,
}) => {
  const [
    isGstApplicableForPurchaseOrders,
    setIsGstApplicableForPurchaseOrders,
  ] = useState(false);

  const { isCreatingSales, isCreatingPurchase, cta } = order;

  // 1. Fetch Profile details for sales GST applicability check
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data?.data?.data,
    enabled: !!isCreatingSales && isPurchasePage === false,
  });

  const isGstApplicableForSalesOrders =
    isPurchasePage === false && !!profileDetails?.enterpriseDetails?.gstNumber;

  // Derived boolean for current GST applicability
  const isCurrentGstApplicable = useMemo(
    () =>
      isGstApplicable(
        isPurchasePage
          ? isGstApplicableForPurchaseOrders
          : isGstApplicableForSalesOrders,
      ),
    [
      isPurchasePage,
      isGstApplicableForPurchaseOrders,
      isGstApplicableForSalesOrders,
    ],
  );

  // 2. Fetch measurement units for GOODS
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data?.data?.data,
    enabled: !!enterpriseId && isOfferType === 'GOODS',
  });

  // 3. Fetch referenced order details if referenceOrderId is present
  const { data: referencedOrderData } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey, referenceOrderId],
    queryFn: () => OrderDetails(referenceOrderId),
    enabled: !!referenceOrderId,
    select: (data) => data?.data?.data,
  });

  useEffect(() => {
    if (referencedOrderData) {
      const orderDetails = referencedOrderData;
      const flattenedOrderItems = (orderDetails?.orderItems || []).map(
        (item) => {
          const { productDetails } = item;
          return {
            productId: productDetails.id,
            productName: productDetails?.productName,
            productType: item.productType,
            quantity: item.quantity,
            unitId: item.unitId,
            unitPrice: item.unitPrice,
            gstPerUnit: item.gstPerUnit,
            totalAmount: item.totalAmount,
            totalGstAmount: item.totalGstAmount,
            hsnCode: productDetails?.hsnCode,
            serviceName: productDetails?.serviceName,
            sac: undefined,
          };
        },
      );

      setOrder((prevOrder) => ({
        ...prevOrder,
        sellerEnterpriseId: orderDetails?.sellerEnterpriseId,
        buyerId: orderDetails?.buyerId,
        invoiceType: 'GOODS',
        orderItems: flattenedOrderItems,
        amount: orderDetails?.amount,
        gstAmount: orderDetails?.gstAmount,
        referenceOrderId: Number(referenceOrderId),
      }));
    }
  }, [referencedOrderData, referenceOrderId, setOrder]);

  useEffect(() => {
    if (!isCreatingPurchase || !order?.selectedValue) return;

    const isApplicable = checkVendorGSTApplicability(
      order?.selectedValue?.originalVendor,
    );
    setIsGstApplicableForPurchaseOrders(isApplicable);
  }, [isCreatingPurchase, order?.selectedValue]);

  // 4. Fetch Clients (B2B)
  const { data: customerData } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res?.data?.data?.users,
    enabled: isOffer && isCreatingSales && order.clientType === 'B2B',
  });

  const clientOptions = useMemo(() => {
    const options =
      customerData?.map((customer) => {
        const value = customer?.client?.id || customer?.id;
        const label =
          customer?.client?.name || customer.invitation?.userDetails?.name;
        const data = customer?.client || customer?.invitation?.userDetails;
        const isAccepted =
          customer?.invitation === null || customer?.invitation === undefined
            ? 'ACCEPTED'
            : customer?.invitation?.status;
        const clientId = customer?.id;
        const clientEnterpriseId = customer?.client?.id;
        const isEnterpriseActive = !!customer?.client?.id;

        return {
          value,
          label,
          data,
          isAccepted,
          clientId,
          clientEnterpriseId,
          isEnterpriseActive,
        };
      }) ?? [];

    return [
      ...options,
      {
        value: 'add-new-client',
        label: (
          <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
            <Plus size={14} />{' '}
            {translations('form.input.client.add_new_client')}
          </span>
        ),
        isAccepted: 'ACCEPTED',
      },
    ];
  }, [customerData, translations]);

  // 5. Fetch Vendors (B2B)
  const { data: vendorData } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res?.data?.data?.users,
    enabled: cta === 'bid' && isCreatingPurchase && order.clientType === 'B2B',
  });

  const vendorOptions = useMemo(() => {
    const options =
      vendorData
        ?.filter(
          (vendor) => vendor?.vendor?.name && vendor?.vendor?.id !== null,
        )
        .map((vendor) => {
          const value = vendor?.vendor?.id || vendor?.id;
          const label =
            vendor?.vendor?.name || vendor.invitation?.userDetails?.name;
          const data = vendor?.vendor || vendor?.invitation?.userDetails;
          const isAccepted =
            vendor?.invitation === null || vendor?.invitation === undefined
              ? 'ACCEPTED'
              : vendor?.invitation?.status;
          const gstNumber = vendor?.vendor?.gstNumber;

          return {
            value,
            label,
            data,
            isAccepted,
            gstNumber,
            originalVendor: vendor,
          };
        }) ?? [];

    return [
      ...options,
      {
        value: 'add-new-vendor',
        label: (
          <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
            <Plus size={14} />{' '}
            {translations('form.input.vendor.add_new_vendor')}
          </span>
        ),
        isAccepted: 'ACCEPTED',
        gstNumber: null,
      },
    ];
  }, [vendorData, translations]);

  const isItemAlreadyAdded = (itemId) =>
    order.orderItems?.some((item) => item.productId === itemId);

  // 6. Fetch Client Catalogue Goods
  const { data: goodsData } = useQuery({
    queryKey: [catalogueApis.getProductCatalogue.endpointKey, enterpriseId],
    queryFn: () => getProductCatalogue(enterpriseId),
    select: (res) => res?.data?.data,
    enabled: isOffer && isOfferType === 'GOODS',
  });

  const clientsGoodsOptions = useMemo(
    () =>
      goodsData?.map((good) => ({
        value: { ...good, productType: 'GOODS', productName: good.name },
        label: good.name,
        disabled: isItemAlreadyAdded(good.id),
      })) || [],
    [goodsData, order.orderItems],
  );

  // 7. Fetch Vendor Catalogue Goods
  const { data: vendorGoodsData } = useQuery({
    queryKey: [
      catalogueApis.getVendorProductCatalogue.endpointKey,
      order.sellerEnterpriseId,
    ],
    queryFn: () => getVendorProductCatalogue(order.sellerEnterpriseId),
    select: (res) => res?.data?.data,
    enabled:
      isPurchasePage && isOfferType === 'GOODS' && !!order.sellerEnterpriseId,
  });

  const vendorGoodsOptions = useMemo(
    () =>
      vendorGoodsData?.map((good) => ({
        value: { ...good, productType: 'GOODS', productName: good.name },
        label: good.name,
        disabled: isItemAlreadyAdded(good.id),
      })) || [],
    [vendorGoodsData, order.orderItems],
  );

  const itemOptions = isOffer ? clientsGoodsOptions : vendorGoodsOptions;

  return {
    units,
    clientOptions,
    vendorOptions,
    itemOptions,
    isCurrentGstApplicable,
    setIsGstApplicableForPurchaseOrders,
  };
};
