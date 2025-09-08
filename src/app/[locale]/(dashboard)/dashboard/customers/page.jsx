'use client';

import { customerApis } from '@/api/enterprises_user/customers/customersApi';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  getCustomers,
  getSearchedCustomers,
} from '@/services/Enterprises_Users_Service/Customer_Services/Customer_Services';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { Download, PlusCircle, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { CustomersTable } from './CustomersTable';
import { useCustomersColumns } from './useCustomersColumns';

// dynamic imports
// const UploadItems = dynamic(
//   () => import('@/components/inventory/UploadItems'),
//   { loading: () => <Loading /> },
// );

// MACROS
const PAGE_LIMIT = 10;
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

const CustomerPage = () => {
  useMetaData('Hues! - Customers', 'HUES CUSTOMERS'); // dynamic title

  const translations = useTranslations('customer');
  // next-intl supports only object keys, not arrays. Use object keys for subItems.
  const keys = [
    'customer.emptyStateComponent.subItems.subItem1',
    'customer.emptyStateComponent.subItems.subItem2',
    'customer.emptyStateComponent.subItems.subItem3',
    'customer.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const { hasPermission } = usePermission();
  //   const queryClient = useQueryClient();
  //   const [isUploading, setIsUploading] = useState(false);
  //   const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // debounce search term
  const [customers, setCustomers] = useState(null);
  const [paginationData, setPaginationData] = useState({});

  // get customers data
  const {
    data: customersQuery,
    isLoading: isCustomerQueryLoading,
    fetchNextPage: customerFetchNextPage,
    isFetching: isCustomerQueryFetching,
  } = useInfiniteQuery({
    queryKey: [customerApis.getCustomers.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getCustomers({
        id: enterpriseId,
        page: pageParam,
        limit: PAGE_LIMIT,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = (groups?.length ?? 0) + 1;
      const totalPages = _lastGroup?.data?.data?.totalPages ?? 0;

      return nextPage <= totalPages ? nextPage : undefined;
    },
    enabled:
      searchTerm?.length === 0 && hasPermission('permission:customers-view'),
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  const {
    data: searchQuery,
    isLoading: isSearchQueryLoading,
    fetchNextPage: searchFetchNextPage,
    isFetching: isSearchQueryFetching,
  } = useInfiniteQuery({
    queryKey: [
      customerApis.getSearchedCustomers.endpointKey,
      debouncedSearchTerm,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      return getSearchedCustomers({
        page: pageParam,
        limit: PAGE_LIMIT,
        data: { searchString: debouncedSearchTerm },
      });
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = (groups?.length ?? 0) + 1;
      const totalPages = _lastGroup?.data?.data?.totalPages ?? 0;

      return nextPage <= totalPages ? nextPage : undefined;
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
    const source = debouncedSearchTerm ? searchQuery : customersQuery;

    // Guard clause: Ensure source is defined and has valid pages
    if (
      !source?.pages ||
      !Array.isArray(source.pages) ||
      source.pages.length === 0
    ) {
      return;
    }

    // Flatten customers array from all pages, fallback to [] if not found
    const flattened = source.pages.flatMap((page) =>
      page?.data?.data?.customers ? page.data.data.customers : [],
    );

    // Remove duplicates by customer ID
    const uniqueCustomersData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );

    setCustomers(uniqueCustomersData);

    // Safely extract last page data
    const lastPageData = source.pages[source.pages.length - 1]?.data?.data;

    setPaginationData({
      totalPages: lastPageData?.totalPages ?? 0,
      currFetchedPage: Number(lastPageData?.currentPage ?? 1),
    });
  }, [debouncedSearchTerm, customersQuery, searchQuery]);

  // handleFile fn
  //   const uploadFile = async (file) => {
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     formData.append('enterpriseId', enterpriseId);

  //     try {
  //       await bulkUploadClients(formData);
  //       toast.success('Upload Successfully');
  //       setFiles((prev) => [...prev, file]);
  //       queryClient.invalidateQueries([customerApis.getCustomers.endpointKey]);
  //     } catch (error) {
  //       toast.error(error.response.data.message || 'Something went wrong');
  //     }
  //   };

  // columns
  const CustomersColumns = useCustomersColumns();

  return (
    <ProtectedWrapper permissionCode={'permission:customers-view'}>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={translations('title')}></SubHeader>
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && (
        <div>
          <Wrapper className="h-screen">
            <SubHeader name={translations('title')}>
              <div className="flex items-center justify-center gap-4">
                <SearchInput
                  searchPlaceholder={translations('ctas.searchPlaceHolder')}
                  toSearchTerm={searchTerm}
                  setToSearchTerm={setSearchTerm}
                />
                <ProtectedWrapper
                  permissionCode={'permission:customers-download'}
                >
                  <Tooltips
                    trigger={
                      <Button
                        variant={customers?.length > 0 ? 'outline' : 'export'}
                        size="sm"
                        onClick={() =>
                          exportTableToExcel(
                            'customers-table',
                            'customer_lists',
                          )
                        }
                        className={
                          customers?.length === 0
                            ? 'cursor-not-allowed'
                            : 'cursor-pointer'
                        }
                      >
                        <Download size={14} />
                      </Button>
                    }
                    content={translations('ctas.tooltips.export')}
                  />
                </ProtectedWrapper>

                <ProtectedWrapper
                  permissionCode={'permission:customers-upload'}
                >
                  <Tooltips
                    trigger={
                      <Button
                        variant="blue_outline"
                        size="sm"
                        className="cursor-not-allowed"
                        // onClick={() => setIsUploading(true)}
                      >
                        <Upload size={14} />
                        {translations('ctas.upload')}
                      </Button>
                    }
                    content={translations('ctas.tooltips.coming_soon')}
                  />
                </ProtectedWrapper>

                <ProtectedWrapper
                  permissionCode={'permission:customers-create'}
                >
                  <Tooltips
                    trigger={
                      <Button
                        size="sm"
                        className="flex cursor-not-allowed items-center"
                      >
                        <PlusCircle size={14} />
                        {translations('ctas.add')}
                      </Button>
                    }
                    content={translations('ctas.tooltips.coming_soon')}
                  />
                </ProtectedWrapper>
              </div>
            </SubHeader>

            <div className="flex-grow overflow-hidden">
              {isCustomerQueryLoading || isSearchQueryLoading ? (
                <Loading />
              ) : (
                <>
                  {/* Case 1: No search term, and no data → Empty stage */}
                  {!debouncedSearchTerm && customers?.length === 0 ? (
                    <EmptyStageComponent
                      heading={translations('emptyStateComponent.heading')}
                      subItems={keys}
                    />
                  ) : (
                    // Case 2: Either searchTerm is present, or data is available → Show Table
                    <CustomersTable
                      id="customers-table"
                      columns={CustomersColumns}
                      data={customers || []}
                      fetchNextPage={
                        debouncedSearchTerm
                          ? searchFetchNextPage
                          : customerFetchNextPage
                      }
                      isFetching={
                        debouncedSearchTerm
                          ? isSearchQueryFetching
                          : isCustomerQueryFetching
                      }
                      totalPages={paginationData?.totalPages}
                      currFetchedPage={paginationData?.currFetchedPage}
                    />
                  )}
                </>
              )}
            </div>
          </Wrapper>
        </div>
      )}
    </ProtectedWrapper>
  );
};

export default CustomerPage;
