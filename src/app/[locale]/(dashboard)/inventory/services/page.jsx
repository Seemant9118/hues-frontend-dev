'use client';

import { servicesApi } from '@/api/inventories/services/services';
import Tooltips from '@/components/auth/Tooltips';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { useRouter } from '@/i18n/routing';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  GetAllProductServices,
  GetSearchedServices,
  UpdateProductServices,
  UploadProductServices,
} from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import {
  keepPreviousData,
  useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { CircleFadingPlus, Download, Share2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useServicesColumns } from './ServicesColumns';
import { ServicesTable } from './ServicesTable';

// dynamic imports
const AddItem = dynamic(() => import('@/components/inventory/AddItem'), {
  loading: () => <Loading />,
});
const EditItem = dynamic(() => import('@/components/inventory/EditItem'), {
  loading: () => <Loading />,
});
const UploadItems = dynamic(
  () => import('@/components/inventory/UploadItems'),
  { loading: () => <Loading /> },
);

// MACROS
const PAGE_LIMIT = 10;
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

function Services() {
  useMetaData('Hues! - Services', 'HUES SERVICES'); // dynamic title

  const translations = useTranslations('services');

  // next-intl supports only object keys, not arrays. Use object keys for subItems.
  const keys = [
    'services.emptyStateComponent.subItems.subItem1',
    'services.emptyStateComponent.subItems.subItem2',
    'services.emptyStateComponent.subItems.subItem3',
    'services.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const templateId = 1;

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // debounce search term
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [servicesToEdit, setServicesToEdit] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [services, setServices] = useState([]);
  const [paginationData, setPaginationData] = useState({});

  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('action');
    setIsAdding(state === 'add');
    setIsEditing(state === 'edit');
    setIsUploading(state === 'upload');
  }, [searchParams]);

  useEffect(() => {
    let newPath = `/inventory/services`;
    if (isAdding) {
      newPath += `?action=add`;
    } else if (isEditing) {
      newPath += `?action=edit`;
    } else if (isUploading) {
      newPath += `?action=upload`;
    } else {
      newPath += '';
    }

    router.push(newPath);
  }, [router, isAdding, isEditing, isUploading]);

  const servicesQuery = useInfiniteQuery({
    queryKey: [servicesApi.getAllProductServices.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return GetAllProductServices({
        id: enterpriseId,
        page: pageParam,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    enabled: searchTerm.length === 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const searchQuery = useInfiniteQuery({
    queryKey: [
      servicesApi.getSearchedServices.endpointKey,
      debouncedSearchTerm,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      return GetSearchedServices({
        page: pageParam,
        limit: PAGE_LIMIT,
        data: { searchString: debouncedSearchTerm },
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    enabled: !!debouncedSearchTerm,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const source = debouncedSearchTerm ? searchQuery.data : servicesQuery.data;
    if (!source) return;
    const flattened = source.pages.flatMap(
      (page) => page?.data?.data?.data || [],
    );
    const uniqueServicesData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );
    setServices(uniqueServicesData);
    const lastPage = source.pages[source.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: Number(lastPage?.currentPage),
    });
  }, [debouncedSearchTerm, servicesQuery.data, searchQuery.data]);

  // handleUploadfile
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enterpriseId', enterpriseId);
    formData.append('templateId', templateId);

    try {
      await UploadProductServices(formData);
      toast.success(translations('messages.uploadSuccessMsg'));
      setFiles((prev) => [...prev, file]);
      queryClient.invalidateQueries([
        servicesApi.getAllProductServices.endpointKey,
      ]);
    } catch (error) {
      toast.error(error.response.data.message || 'Something went wrong');
    }
  };

  // columns
  const ServicesColumns = useServicesColumns(setIsEditing, setServicesToEdit);

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && (
        <div>
          {!isAdding && !isUploading && !isEditing && (
            <Wrapper className="h-screen">
              <SubHeader name={translations('title')}>
                <div className="flex items-center justify-center gap-4">
                  <SearchInput
                    searchPlaceholder={translations('ctas.searchPlaceholder')}
                    toSearchTerm={searchTerm}
                    setToSearchTerm={setSearchTerm}
                  />
                  {/* coming soon */}
                  <Tooltips
                    trigger={
                      <Button
                        variant={'export'}
                        size="sm"
                        className="cursor-not-allowed"
                      >
                        <Share2 size={14} />
                      </Button>
                    }
                    content={translations('ctas.comingSoon')}
                  />
                  <Tooltips
                    trigger={
                      <Button
                        variant={services?.length === 0 ? 'export' : 'outline'}
                        size="sm"
                        className={
                          services?.length === 0
                            ? 'cursor-not-allowed'
                            : 'cursor-pointer'
                        }
                        onClick={() =>
                          exportTableToExcel(
                            'services-table',
                            translations('title'),
                          )
                        }
                      >
                        <Download size={14} />
                      </Button>
                    }
                    content={translations('ctas.export')}
                  />

                  <Button
                    onClick={() => setIsUploading(true)}
                    variant={'blue_outline'}
                    size="sm"
                  >
                    <Upload size={14} />
                    {translations('ctas.upload')}
                  </Button>
                  <Button onClick={() => setIsAdding(true)} size="sm">
                    <CircleFadingPlus size={14} />
                    {translations('ctas.add')}
                  </Button>
                </div>
              </SubHeader>
              <div className="flex-grow overflow-hidden">
                {servicesQuery.isLoading || searchQuery.isLoading ? (
                  <Loading />
                ) : (
                  <>
                    {/* Case 1: No search term, and no data → Empty stage */}
                    {!debouncedSearchTerm && services?.length === 0 ? (
                      <EmptyStageComponent
                        heading={translations('emptyStateComponent.heading')}
                        subItems={keys}
                      />
                    ) : (
                      // Case 2: Either searchTerm is present, or data is available → Show Table
                      <ServicesTable
                        id="services-table"
                        columns={ServicesColumns}
                        data={services}
                        fetchNextPage={
                          debouncedSearchTerm
                            ? searchQuery.fetchNextPage
                            : servicesQuery.fetchNextPage
                        }
                        isFetching={
                          debouncedSearchTerm
                            ? searchQuery.isFetching
                            : servicesQuery.isFetching
                        }
                        totalPages={paginationData?.totalPages}
                        currFetchedPage={paginationData?.currFetchedPage}
                      />
                    )}
                  </>
                )}
              </div>
            </Wrapper>
          )}
          {isAdding && (
            <AddItem
              setIsAdding={setIsAdding}
              name={'Item'}
              cta={'Item'}
              onCancel={() => setIsAdding(false)}
            />
          )}
          {isEditing && (
            <EditItem
              setIsEditing={setIsEditing}
              servicesToEdit={servicesToEdit}
              setServicesToEdit={setServicesToEdit}
              mutationFunc={UpdateProductServices}
              queryKey={[servicesApi.getAllProductServices.endpointKey]}
            />
          )}
          {isUploading && (
            <UploadItems
              type="services"
              uploadFile={uploadFile}
              files={files}
              setisUploading={setIsUploading}
              setFiles={setFiles}
            />
          )}
        </div>
      )}
    </>
  );
}

export default Services;
