'use client';

import { catalogueApis } from '@/api/catalogue/catalogueApi';
import Tooltips from '@/components/auth/Tooltips';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getCatalogues } from '@/services/Catalogue_Services/CatalogueServices';
import { useQuery } from '@tanstack/react-query';
import { Eye, ListFilter, Share2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useCatalogueColumns } from './CatalogueColumns';

const Catalogue = () => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const [selectedCatalogue, setSelectedCatalogue] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // we use catalogue api to fetch data, rn we are using only goods foe testing component
  const { data: catalogues, isLoading } = useQuery({
    queryKey: [catalogueApis.getCatalogues.endpointKey, enterpriseId],
    queryFn: () => getCatalogues(enterpriseId),
    select: (res) => res.data.data,
  });
  // get product via search
  const searchCatalogueItems = catalogues?.filter((catalogue) => {
    const productName = catalogue.productName ?? '';
    return productName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // handle export catalogue click
  const handleExportCatalogue = () => {
    if (selectedCatalogue.length === 0) {
      toast.error('Please select atleast One Catalogue to export');
      return;
    }
    // api call to export catalogues
    toast.success('Selected Catalogue exported');
  };

  const CatlogueColumns = useCatalogueColumns(setSelectedCatalogue);

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={'Catalogue'}></SubHeader>
          <RestrictedComponent />
        </>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && (
        <Wrapper className="h-full">
          {!enterpriseId && <RestrictedComponent />}
          {enterpriseId && (
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex w-full justify-between gap-2 py-2">
                <SubHeader name="Catalogue" />
                <div className="flex gap-2">
                  <Tooltips
                    trigger={
                      <Button
                        size="sm"
                        variant="blue_outline"
                        onClick={() =>
                          router.push('/catalogue/update_catalogue')
                        }
                      >
                        Update
                      </Button>
                    }
                    content={'Update a Catalogue'}
                  />

                  <Tooltips
                    trigger={
                      <Button
                        disabled
                        size="sm"
                        variant="outline"
                        onClick={handleExportCatalogue}
                      >
                        <Upload size={14} />
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />
                  <Tooltips
                    trigger={
                      <Button disabled size="sm" variant="outline">
                        <Eye size={14} />
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />

                  <Tooltips
                    trigger={
                      <Button disabled size="sm" variant="outline">
                        <Share2 size={14} />
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />
                </div>
              </div>
              {/* Header2 action */}
              <div className="flex w-full justify-between gap-2 py-2">
                <SearchInput
                  className="w-[28rem]"
                  toSearchTerm={searchTerm}
                  setToSearchTerm={setSearchTerm}
                />
                <Tooltips
                  trigger={
                    <Button disabled size="sm" variant="outline">
                      <ListFilter size={14} />
                    </Button>
                  }
                  content={'This feature Coming Soon...'}
                />
              </div>

              {isLoading && <Loading />}
              {!isLoading && catalogues?.length > 0 && (
                <DataTable
                  id={'catalogue'}
                  columns={CatlogueColumns}
                  data={searchCatalogueItems ?? []}
                />
              )}
              {!isLoading && catalogues?.length === 0 && (
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
      )}
    </>
  );
};

export default Catalogue;
