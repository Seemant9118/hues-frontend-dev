'use client';

import { goodsApi } from '@/api/inventories/goods/goods';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { GetAllProductGoods } from '@/services/Inventories_Services/Goods_Inventories/Goods_Inventories';
import { useQuery } from '@tanstack/react-query';
import { Eye, ListFilter, Share2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useCatlogueColumns } from './CatalogueColumns';

const Catalogue = () => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [selectedCatalogue, setSelectedCatalogue] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // we use catalogue api to fetch data, rn we are using only goods foe testing component
  const { data: productGoods, isLoading } = useQuery({
    queryKey: [goodsApi.getAllProductGoods.endpointKey],
    queryFn: () => GetAllProductGoods(enterpriseId),
    select: (res) => res.data.data,
  });
  // get product via search
  const searchCatalogueItems = productGoods?.filter((product) => {
    const productName = product.productName ?? '';
    return productName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // handle export catalogue click
  const handleExportOrder = () => {
    if (selectedCatalogue.length === 0) {
      toast.error('Please select atleast One Order to export');
      return;
    }
    // api call to export catalogues
    toast.success('Selected Catalogue exported');
  };

  const CatlogueColumns = useCatlogueColumns(setSelectedCatalogue);

  return (
    <Wrapper className="h-full">
      {!enterpriseId && <RestrictedComponent />}
      {enterpriseId && (
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex w-full justify-between gap-2 py-2">
            <SubHeader name="Catalogue" />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="blue_outline"
                onClick={() => router.push('/catalogue/update_catalogue')}
              >
                Update
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportOrder}>
                <Upload size={14} />
              </Button>
              <Button size="sm" variant="outline">
                <Eye size={14} />
              </Button>
              <Button size="sm" variant="outline">
                <Share2 size={14} />
              </Button>
            </div>
          </div>
          {/* Header2 action */}
          <div className="flex w-full justify-between gap-2 py-2">
            <SearchInput
              className="w-[28rem]"
              toSearchTerm={searchTerm}
              setToSearchTerm={setSearchTerm}
            />
            <Button size="sm" variant="outline">
              <ListFilter size={14} />
            </Button>
          </div>

          {isLoading && <Loading />}
          {!isLoading && productGoods?.length > 0 && (
            <DataTable
              id={'catalogue'}
              columns={CatlogueColumns}
              data={searchCatalogueItems ?? []}
            />
          )}
          {!isLoading && productGoods?.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-[#939090]">
              <Image
                src={'/empty.png'}
                width={100}
                height={100}
                alt="emptyIcon"
              />
              <p className="font-bold">No catalogue available</p>
              <p className="max-w-96 text-center">
                {
                  "You haven't make any catalogues. Start by clicking on the Update button"
                }
              </p>

              <Button
                size="sm"
                onClick={() => router.push('/catalogue/update_catalogue')}
              >
                Update
              </Button>
            </div>
          )}
        </div>
      )}
    </Wrapper>
  );
};

export default Catalogue;
