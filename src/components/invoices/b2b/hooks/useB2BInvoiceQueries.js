import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { Plus } from 'lucide-react';
import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { userAuth } from '@/api/user_auth/Users';
import {
  getProductCatalogue,
  getServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';

export function useB2BInvoiceQueries({
  enterpriseId,
  userId,
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

  // Clients
  const { data: clientData } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey, enterpriseId, 'ORDER'],
    queryFn: () => getClients({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res.data.data.users,
    enabled: !!enterpriseId,
  });

  const clientOptions = [
    ...(clientData?.map((client) => {
      const value = client?.client?.id || client?.id;
      const label =
        client?.client?.name || client.invitation?.userDetails?.name;

      const clientId = client?.id;
      const clientEnterpriseId = client?.client?.id;
      const isEnterpriseActive = !!client?.client?.id;

      return {
        value,
        label,
        clientId,
        clientEnterpriseId,
        isEnterpriseActive,
      };
    }) ?? []),
    {
      value: 'add-new-client',
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> {translations('form.input.client.add_new_client')}
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

  // GST/NON-GST Checking
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: !!enterpriseId,
  });
  const isGstApplicableForSalesOrders =
    !!profileDetails?.enterpriseDetails?.gstNumber;

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
    clientOptions,
    itemTypeOptions,
    isGstApplicableForSalesOrders,
    goodsData,
    servicesData,
    itemClientListingOptions,
    isItemAlreadyAdded,
  };
}
