'use client';

import { catalogueApis } from '@/api/catalogue/catalogueApi';
import Tooltips from '@/components/auth/Tooltips';
import BulkConfirmAction from '@/components/Modals/BulkConfirmAction';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  bulkDeleteCatalogueItems,
  getCatalogues,
  searhedCatalogues,
} from '@/services/Catalogue_Services/CatalogueServices';
import { useQuery } from '@tanstack/react-query';

import { debounce } from '@/appUtils/helperFunctions';
import useMetaData from '@/custom-hooks/useMetaData';
import { Eye, ListFilter, Share2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useCatalogueColumns } from './CatalogueColumns';

// MACROS
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

const Catalogue = () => {
  useMetaData('Hues! - Catalogues', 'HUES CATALOGUE'); // dynamic title

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isKycVerified = LocalStorageService.get('isKycVerified');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const router = useRouter();
  const [selectedCatalogue, setSelectedCatalogue] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // debounce search term
  const [catalogues, setCatalogues] = useState([]);

  // catalogue api fetching
  const {
    data: cataloguesData,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: [catalogueApis.getCatalogues.endpointKey, enterpriseId],
    queryFn: () => getCatalogues(enterpriseId),
    select: (res) => res.data.data,
    enabled: !!enterpriseId && searchTerm?.length === 0,
  });

  // Fetch searched catalogues
  const { data: searchedCataloguesData, isLoading: isSearchCataloguesLoading } =
    useQuery({
      queryKey: [catalogueApis.searchedCatalogues.endpointKey, searchTerm],
      queryFn: () =>
        searhedCatalogues({
          searchString: debouncedSearchTerm, // Ensure debouncedSearchTerm is used
        }),
      select: (res) => res.data.data,
      enabled: !!debouncedSearchTerm, // Use debounced value here
    });

  // Debounce logic with useCallback
  const updateDebouncedSearchTerm = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
    }, DEBOUNCE_DELAY),
    [],
  );
  useEffect(() => {
    updateDebouncedSearchTerm(searchTerm);
  }, [searchTerm, updateDebouncedSearchTerm]);

  // Consolidated state update logic
  useEffect(() => {
    if (debouncedSearchTerm && searchedCataloguesData) {
      setCatalogues(searchedCataloguesData); // set productGoods from search api
    } else if (!debouncedSearchTerm && isSuccess) {
      setCatalogues(cataloguesData); // set productGoods from get api
    }
  }, [debouncedSearchTerm, searchedCataloguesData, cataloguesData, isSuccess]);

  // handle export catalogue click
  const handleExportCatalogue = () => {
    if (selectedCatalogue.length === 0) {
      toast.error('Please select atleast One Catalogue to export');
      return;
    }
    // api call to export catalogues
    toast.success('Selected Catalogue exported');
  };

  // columns
  const CatlogueColumns = useCatalogueColumns(setSelectedCatalogue);

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete || !isKycVerified) && (
        <>
          <SubHeader name={'Catalogue'}></SubHeader>
          <RestrictedComponent />
        </>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && isKycVerified && (
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
                    content={'Export feature Coming Soon...'}
                  />
                  <Tooltips
                    trigger={
                      <Button disabled size="sm" variant="outline">
                        <Eye size={14} />
                      </Button>
                    }
                    content={'View feature Coming Soon...'}
                  />

                  <Tooltips
                    trigger={
                      <Button disabled size="sm" variant="outline">
                        <Share2 size={14} />
                      </Button>
                    }
                    content={'Share feature Coming Soon...'}
                  />

                  <Tooltips
                    trigger={
                      <BulkConfirmAction
                        infoText={
                          'You are removing the selected items from the catalogue'
                        }
                        selectedItems={selectedCatalogue}
                        setSelectedItems={setSelectedCatalogue}
                        setRowSelection={setRowSelection}
                        invalidateKey={catalogueApis.getCatalogues.endpointKey}
                        mutationKey={
                          catalogueApis.bulkDeleteCatalogueItems.endpointKey
                        }
                        mutationFunc={bulkDeleteCatalogueItems}
                      />
                    }
                    content={
                      selectedCatalogue?.length > 0
                        ? 'Remove a Selected Catalogue'
                        : 'Select a Catalogue to remove'
                    }
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
                  content={'Filter feature Coming Soon...'}
                />
              </div>

              {(isLoading || isSearchCataloguesLoading) && <Loading />}
              {(!isLoading || !isSearchCataloguesLoading) &&
                cataloguesData?.length > 0 && (
                  <DataTable
                    id={'catalogue'}
                    rowSelection={rowSelection}
                    setRowSelection={setRowSelection}
                    columns={CatlogueColumns}
                    data={catalogues ?? []}
                  />
                )}
              {!isLoading && cataloguesData?.length === 0 && (
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

                  <Tooltips
                    trigger={
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push('/catalogue/update_catalogue')
                        }
                      >
                        Update
                      </Button>
                    }
                    content={'Update a Catalogue'}
                  />
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
