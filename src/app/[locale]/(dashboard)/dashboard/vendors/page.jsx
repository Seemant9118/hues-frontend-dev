'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { invitation } from '@/api/invitation/Invitation';
import AddModal from '@/components/Modals/AddModal';
import EditModal from '@/components/Modals/EditModal';
import Tooltips from '@/components/auth/Tooltips';
import EnterpriseDetails from '@/components/enterprise/EnterpriseDetails';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { exportTableToExcel, LocalStorageService } from '@/lib/utils';
import {
  bulkUploadVendors,
  createVendor,
  getVendors,
  searchedVendors,
  updateVendor,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import {
  generateLink,
  remindInvitation,
} from '@/services/Invitation_Service/Invitation_Service';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Download, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { VendorsTable } from './VendorsTable';
import { useVendorsColumns } from './useVendorsColumns';

const UploadItems = dynamic(
  () => import('@/components/inventory/UploadItems'),
  { loading: () => <Loading /> },
);

// MACROS
const PAGE_LIMIT = 10;
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

const VendorsPage = () => {
  useMetaData('Hues! - Vendors', 'HUES VENDORS'); // dynamic title

  const translations = useTranslations('vendor');

  const keys = [
    'vendor.emptyStateComponent.subItems.subItem1',
    'vendor.emptyStateComponent.subItems.subItem2',
    'vendor.emptyStateComponent.subItems.subItem3',
    'vendor.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVendor, setEditingVendor] = useState();
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // debounce search term
  const [vendors, setVendors] = useState(null);
  const [isEnterpriseDetailsShow, setIsEnterpriseDetailsShow] = useState(false);
  const [selectedEnterpriseContent, setSelectedEnterpriseContent] =
    useState(null);
  const [paginationData, setPaginationData] = useState({});

  const {
    data: vendorsQuery,
    isLoading: isVendorsQueryLoading,
    fetchNextPage: vendorFetchNextPage,
    isFetching: isVendorsQueryFetching,
  } = useInfiniteQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getVendors({
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
    enabled: searchTerm?.length === 0,
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
      vendorEnterprise.searchedVendors.endpointKey,
      debouncedSearchTerm,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      return searchedVendors({
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
    const source = debouncedSearchTerm ? searchQuery : vendorsQuery;

    // guard clause to ensure source is defined and has pages
    if (
      !source?.pages ||
      !Array.isArray(source.pages) ||
      source.pages.length === 0
    )
      return;

    const flattened = source.pages.flatMap(
      (page) => page?.data?.data?.users || [],
    );

    const uniqueVendorsData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );

    setVendors(uniqueVendorsData);

    const lastPage = source.pages[source.pages.length - 1]?.data?.data;

    setPaginationData({
      totalPages: lastPage?.totalPages ?? 0,
      currFetchedPage: Number(lastPage?.currentPage ?? 1),
    });
  }, [debouncedSearchTerm, vendorsQuery, searchQuery]);

  // handle upload file fn
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enterpriseId', enterpriseId);

    try {
      await bulkUploadVendors(formData);
      toast.success('Upload Successfully');
      setFiles((prev) => [...prev, file]);
      queryClient.invalidateQueries([vendorEnterprise.getVendors.endpointKey]);
    } catch (error) {
      toast.error(error.response.data.message || 'Something went wrong');
    }
  };

  // link generate
  const generateLinkMutation = useMutation({
    mutationFn: generateLink,
    onSuccess: (data) => {
      navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/login?invitationToken=${data.data.data}`,
      );
      toast.success('Link generated and copied to clipboard');
    },
    onError: (error) => {
      toast.error(error.response.data.message || translations('toasts.error'));
    },
  });
  const getLink = (id) => {
    generateLinkMutation.mutate(id);
  };

  // send reminder
  const remindMutation = useMutation({
    mutationKey: [invitation.remindInvitation.endpointKey],
    mutationFn: remindInvitation,
    onSuccess: () => {
      toast.success('Invitation Reminded Successfully');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });
  const sendRemind = (id) => {
    remindMutation.mutate(id);
  };

  // onRowClick
  const onRowClick = (row) => {
    setIsEnterpriseDetailsShow(true);
    setSelectedEnterpriseContent(row);
  };

  const onEditClick = (userData) => {
    setIsEditing(true);
    setEditingVendor(userData);
  };

  // columns
  const VendorsColumns = useVendorsColumns(
    getLink,
    sendRemind,
    onEditClick,
    enterpriseId,
  );

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <>
          <SubHeader name={translations('title')}></SubHeader>
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && (
        <div>
          <Wrapper className="h-screen">
            {!isUploading && (
              <>
                <SubHeader name={translations('title')}>
                  <div className="flex items-center justify-center gap-4">
                    <SearchInput
                      searchPlaceholder={translations('ctas.searchPlaceHolder')}
                      toSearchTerm={searchTerm}
                      setToSearchTerm={setSearchTerm}
                    />

                    <Tooltips
                      trigger={
                        <Button
                          variant={vendors?.length > 0 ? 'outline' : 'export'}
                          size="sm"
                          onClick={() =>
                            exportTableToExcel('vendor-table', 'vendors_list')
                          }
                          className={
                            vendors?.length === 0
                              ? 'cursor-not-allowed'
                              : 'cursor-pointer'
                          }
                        >
                          <Download size={14} />
                        </Button>
                      }
                      content={translations('ctas.tooltips.export')}
                    />

                    <Tooltips
                      trigger={
                        <Button
                          variant="blue_outline"
                          size="sm"
                          onClick={() => setIsUploading(true)}
                        >
                          <Upload size={14} />
                          {translations('ctas.upload')}
                        </Button>
                      }
                      content={translations('ctas.tooltips.upload')}
                    />

                    <Tooltips
                      trigger={
                        <AddModal
                          type={'Add'}
                          cta="vendor"
                          btnName={translations('ctas.add')}
                          mutationFunc={createVendor}
                        />
                      }
                      content={translations('ctas.tooltips.add')}
                    />
                  </div>
                </SubHeader>
                <div className="flex-grow overflow-hidden">
                  {isVendorsQueryLoading || isSearchQueryLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!debouncedSearchTerm && vendors?.length === 0 ? (
                        <EmptyStageComponent
                          heading={translations('emptyStateComponent.heading')}
                          subItems={keys}
                        />
                      ) : (
                        // Case 2: Either searchTerm is present, or data is available → Show Table
                        <VendorsTable
                          id="vendor-table"
                          columns={VendorsColumns}
                          data={vendors || []}
                          fetchNextPage={
                            debouncedSearchTerm
                              ? searchFetchNextPage
                              : vendorFetchNextPage
                          }
                          isFetching={
                            debouncedSearchTerm
                              ? isSearchQueryFetching
                              : isVendorsQueryFetching
                          }
                          totalPages={paginationData?.totalPages}
                          currFetchedPage={paginationData?.currFetchedPage}
                          onRowClick={onRowClick}
                        />
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {isUploading && (
              <UploadItems
                type="vendor"
                uploadFile={uploadFile}
                files={files}
                setisUploading={setIsUploading}
                setFiles={setFiles}
              />
            )}

            {isEnterpriseDetailsShow && (
              <EnterpriseDetails
                data={selectedEnterpriseContent}
                isEnterpriseDetailsShow={isEnterpriseDetailsShow}
                setIsEnterpriseDetailsShow={setIsEnterpriseDetailsShow}
                isClient={false}
              />
            )}

            {isEditing && (
              <EditModal
                id={editingVendor.id}
                userData={editingVendor}
                cta="vendor"
                mutationFunc={updateVendor}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
              />
            )}
          </Wrapper>
        </div>
      )}
    </>
  );
};

export default VendorsPage;
