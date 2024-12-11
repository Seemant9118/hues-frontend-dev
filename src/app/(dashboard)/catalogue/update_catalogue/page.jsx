'use client';

import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { goodsApi } from '@/api/inventories/goods/goods';
import { servicesApi } from '@/api/inventories/services/services';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SearchInput from '@/components/ui/SearchInput';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  createUpdateCatalogue,
  getCatalogues,
} from '@/services/Catalogue_Services/CatalogueServices';
import { GetAllProductGoods } from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { GetAllProductServices } from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useGoodsColumnsForCatalogue } from './GoodsColumns';
import { useServicesColumnsForCatalogue } from './ServicesColumns';

const UpdateCatalogue = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [selectedGoodsItems, setSelectedGoodsItems] = useState([]);
  const [selectedServicesItems, setSelectedServicesItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [item, setItem] = useState({
    type: 'goods',
  });
  const [filteredOutProductGoods, setFilteredOutProductGoods] = useState([]);
  const [filteredOutServices, setFilteredOutServices] = useState([]);

  // columns
  const GoodsCatalogueColumns = useGoodsColumnsForCatalogue(
    selectedGoodsItems,
    setSelectedGoodsItems,
  );
  const ServicesCatalogueColumns = useServicesColumnsForCatalogue(
    selectedServicesItems,
    setSelectedServicesItems,
  );

  // catalogue api fetching
  const { data: catalogues } = useQuery({
    queryKey: [catalogueApis.getCatalogues.endpointKey, enterpriseId],
    queryFn: () => getCatalogues(enterpriseId),
    select: (res) => res.data.data,
    enabled: !!enterpriseId,
  });

  const filterOutExistingGoodsServicesInCatalogue = (
    inventory,
    inventoryType,
  ) => {
    if (!catalogues || catalogues.length === 0)
      return inventory; // If no catalogue data, return original inventory.
    else if (inventoryType === 'GOODS') {
      const filterInventoryGoods = inventory?.filter(
        (good) =>
          !catalogues.some(
            (catalogueItem) =>
              catalogueItem.itemId === good.id &&
              catalogueItem.type === inventoryType,
          ),
      ); // Exclude goods already in the catalogue.
      return filterInventoryGoods;
    } else if (inventoryType === 'SERVICE') {
      const filteredInventoryServices = inventory?.filter(
        (service) =>
          !catalogues.some(
            (catalogueItem) =>
              catalogueItem.itemId === service.id &&
              catalogueItem.type === inventoryType,
          ),
      ); // Exclude services already in the catalogue.
      return filteredInventoryServices;
    }

    return inventory; // Default case (no filtering).
  };

  // goodsapi fetching
  const {
    data: productGoods,
    isLoading: isGoodsLoading,
    isSuccess: isGoodsSuccess,
  } = useQuery({
    queryKey: [
      goodsApi.getAllProductGoods.endpointKey,
      enterpriseId,
      router.pathname,
    ],
    queryFn: () => GetAllProductGoods(enterpriseId),
    select: (res) => res.data.data,
  });
  useEffect(() => {
    setFilteredOutProductGoods(
      filterOutExistingGoodsServicesInCatalogue(productGoods, 'GOODS'),
    );
  }, [productGoods, catalogues, isGoodsSuccess]);

  // serviceapi fetching
  const {
    data: services,
    isLoading: isServiceLoading,
    isSuccess: isServicesSuccess,
  } = useQuery({
    queryKey: [
      servicesApi.getAllProductServices.endpointKey,
      enterpriseId,
      router.pathname,
    ],
    queryFn: () => GetAllProductServices(enterpriseId),
    select: (res) => res.data.data,
  });
  useEffect(() => {
    setFilteredOutServices(
      filterOutExistingGoodsServicesInCatalogue(services, 'SERVICE'),
    );
  }, [services, catalogues, isServicesSuccess]);

  // get product/services via search
  const searchCatalogueItems =
    item.type === 'goods'
      ? filteredOutProductGoods?.filter((product) => {
          const productName = product.productName ?? '';
          return productName.toLowerCase().includes(searchTerm.toLowerCase());
        })
      : filteredOutServices?.filter((service) => {
          const productName = service.serviceName ?? '';
          return productName.toLowerCase().includes(searchTerm.toLowerCase());
        });

  const catalogueBreadCrumbs = [
    {
      id: 1,
      name: 'Catalogue',
      path: '/catalogue',
      show: true, // Always show
    },
    {
      id: 2,
      name: 'Update Catalogue',
      path: '/catalogue/update_catalogue',
      show: true, // Always show
    },
  ];

  const createCatalogueMutation = useMutation({
    mutationKey: [
      catalogueApis.createAndUpdateCatalogue.endpointKey,
      enterpriseId,
    ],
    mutationFn: createUpdateCatalogue,
    onSuccess: () => {
      toast.success('Catalogue Updated Successfully');
      router.push('/catalogue/');
      queryClient.invalidateQueries([
        catalogueApis.getCatalogues.endpointKey,
        enterpriseId,
      ]);
      queryClient.invalidateQueries([goodsApi.getAllProductGoods.endpointKey]);
      queryClient.invalidateQueries([
        servicesApi.getAllProductServices.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleCreateCatalogue = () => {
    const selectedItemToCreateCatalogue = [
      ...selectedGoodsItems,
      ...selectedServicesItems,
    ];
    if (selectedItemToCreateCatalogue.length > 0) {
      createCatalogueMutation.mutate({
        id: enterpriseId,
        data: { items: selectedItemToCreateCatalogue },
      });
    } else {
      toast.error('Please select at least one item to add to the catalogue.');
    }
  };

  return (
    <Wrapper className="h-full">
      {!enterpriseId && <RestrictedComponent />}
      {enterpriseId && (
        <div className="relative flex h-full flex-col">
          {/* headers */}
          <div className="flex w-full items-center justify-between py-5">
            <OrderBreadCrumbs possiblePagesBreadcrumbs={catalogueBreadCrumbs} />

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                item.type === 'goods'
                  ? router.push('/inventory/goods?action=add')
                  : router.push('/inventory/services/?action=add');

                LocalStorageService.set('redirectFromCatalogue', 'catalogue');
              }}
            >
              <Plus size={14} />
              Add a new item
            </Button>
          </div>
          {/* body : [TODO] : add subHeader and table with selected items and also edited item of price for each column */}
          {/* Header2 action */}
          <div className="flex w-full gap-24 py-2">
            <SearchInput
              className="w-[28rem]"
              toSearchTerm={searchTerm}
              setToSearchTerm={setSearchTerm}
            />

            <Select
              required
              value={item.type}
              onValueChange={(value) =>
                setItem((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="max-w-xs gap-5">
                <SelectValue placeholder="Select Item Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="goods">Goods</SelectItem>
                <SelectItem value="services">Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(isGoodsLoading || isServiceLoading) && <Loading />}
          {(!isGoodsLoading || !isServiceLoading) &&
            ((item.type === 'goods' && filteredOutProductGoods?.length > 0) ||
              (item.type === 'services' &&
                filteredOutServices?.length > 0)) && (
              <DataTable
                id={'catalogue'}
                columns={
                  item.type === 'goods'
                    ? GoodsCatalogueColumns
                    : ServicesCatalogueColumns
                }
                data={searchCatalogueItems ?? []}
              />
            )}

          {/* ctas - create & close */}
          {(!isGoodsLoading || !isServiceLoading) &&
            ((item.type === 'goods' && filteredOutProductGoods?.length > 0) ||
              (item.type === 'services' &&
                filteredOutServices?.length > 0)) && (
              <div className="absolute bottom-0 flex w-full items-center justify-end gap-2 p-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    router.push('/catalogue');
                  }}
                >
                  Close
                </Button>
                <Button size="sm" onClick={handleCreateCatalogue}>
                  {createCatalogueMutation.isPending ? (
                    <Loading />
                  ) : (
                    'Add to Catalogue'
                  )}
                </Button>
              </div>
            )}

          {/* emtpy state : when all existing inventory items already present in catalogue, user want to create a more items */}
          {(!isGoodsLoading || !isServiceLoading) &&
            ((item.type === 'goods' &&
              productGoods?.length > 0 &&
              filteredOutProductGoods?.length === 0) ||
              (item.type === 'services' &&
                services?.length > 0 &&
                filteredOutServices?.length === 0)) && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-[#939090]">
                <Image
                  src={'/Empty.png'}
                  width={100}
                  height={100}
                  alt="emptyIcon"
                />
                <p className="font-bold">
                  All items are in the catalogue. Create a new one?
                </p>
                <p className="max-w-96 text-center">
                  {
                    'All existing items are already listed in the catalogue, Start by clicking on the add item button'
                  }
                </p>

                <Button
                  size="sm"
                  onClick={() =>
                    item.type === 'goods'
                      ? router.push('/inventory/goods?action=add')
                      : router.push('/inventory/services/?action=add')
                  }
                >
                  Add a new item
                </Button>
              </div>
            )}

          {/* emtpy state : when inventory items is not present in platform, then user want to create a inventory item to create further catalogue */}
          {(!isGoodsLoading || !isServiceLoading) &&
            ((item.type === 'goods' && productGoods?.length === 0) ||
              (item.type === 'services' && services?.length === 0)) && (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-[#939090]">
                <Image
                  src={'/Empty.png'}
                  width={100}
                  height={100}
                  alt="emptyIcon"
                />
                <p className="font-bold">No items available in Inventory</p>
                <p className="max-w-96 text-center">
                  {`You haven't added any item in the inventory. Start by clicking on the add item button`}
                </p>

                <Button
                  size="sm"
                  onClick={() =>
                    item.type === 'goods'
                      ? router.push('/inventory/goods?action=add')
                      : router.push('/inventory/services/?action=add')
                  }
                >
                  Add a new item
                </Button>
              </div>
            )}
        </div>
      )}
    </Wrapper>
  );
};

export default UpdateCatalogue;
