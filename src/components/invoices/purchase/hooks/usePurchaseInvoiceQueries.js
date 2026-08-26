import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Plus } from 'lucide-react';
import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import {
  getProductCatalogue,
  getServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import { getVendors } from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';

export function usePurchaseInvoiceQueries({
  enterpriseId,
  invoiceType,
  orderItems,
  productBatchesMap,
  translations,
}) {
  // Fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId,
  });

  // Vendors
  const { data: vendorData } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors({ id: enterpriseId, context: 'PURCHASE' }),
    select: (res) => res.data.data.users,
    enabled: !!enterpriseId,
  });

  const vendorOptions = [
    ...(vendorData?.map((vendor) => {
      const vendorId = vendor?.id;
      const label = vendor?.invitation?.userDetails?.name || 'Unknown Vendor';
      const gstNumber = vendor?.invitation?.userDetails?.gstNumber || null;

      return {
        value: vendorId,
        label,
        gstNumber,
      };
    }) ?? []),
    {
      value: 'add-new-vendor',
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> Add New Vendor
        </span>
      ),
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

  const vendorsGoodsOptions =
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

  const vendorsServicesOptions =
    servicesData?.map((service) => {
      const value = {
        ...service,
        productType: 'SERVICE',
        serviceName: service.name,
      };
      const label = service.name;
      return { value, label, disabled: isItemAlreadyAdded(service.id) };
    }) ?? [];

  const itemVendorListingOptions =
    invoiceType === 'GOODS' ? vendorsGoodsOptions : vendorsServicesOptions;

  return {
    units,
    vendorData,
    vendorOptions,
    itemTypeOptions,
    goodsData,
    servicesData,
    itemVendorListingOptions,
    isItemAlreadyAdded,
  };
}
