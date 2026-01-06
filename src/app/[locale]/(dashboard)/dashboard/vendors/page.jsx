'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { invitation } from '@/api/invitation/Invitation';
import { getEnterpriseId } from '@/appUtils/helperFunctions';
import AddModal from '@/components/Modals/AddModal';
import EditModal from '@/components/Modals/EditModal';
import Tooltips from '@/components/auth/Tooltips';
import DebouncedInput from '@/components/ui/DebouncedSearchInput';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/hooks/useMetaData';
import { usePermission } from '@/hooks/usePermissions';
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
import { useRouter } from 'next/navigation';
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

const VendorsPage = () => {
  useMetaData('Hues! - Vendors', 'HUES VENDORS'); // dynamic title

  const translations = useTranslations('vendor');

  const keys = [
    'vendor.emptyStateComponent.subItems.subItem1',
    'vendor.emptyStateComponent.subItems.subItem2',
    'vendor.emptyStateComponent.subItems.subItem3',
    'vendor.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = getEnterpriseId();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const { hasPermission } = usePermission();
  const queryClient = useQueryClient();

  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVendor, setEditingVendor] = useState();
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState(null);
  const [paginationData, setPaginationData] = useState({});

  // Vendors Query (default list)
  const {
    data: vendorsQuery,
    isLoading: isVendorsQueryLoading,
    fetchNextPage: vendorFetchNextPage,
    isFetching: isVendorsQueryFetching,
  } = useInfiniteQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey, enterpriseId],

    queryFn: async ({ pageParam = 1 }) => {
      if (!enterpriseId) {
        return { data: { data: { users: [], totalPages: 0, currentPage: 1 } } };
      }

      const response = await getVendors({
        id: enterpriseId,
        page: pageParam,
        limit: PAGE_LIMIT,
      });

      return (
        response || {
          data: { data: { users: [], totalPages: 0, currentPage: 1 } },
        }
      );
    },

    initialPageParam: 1,

    getNextPageParam: (_lastGroup, groups) => {
      const totalPages = Number(_lastGroup?.data?.data?.totalPages ?? 0);
      const nextPage = (Array.isArray(groups) ? groups.length : 0) + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },

    enabled:
      Boolean(enterpriseId) &&
      searchTerm?.length === 0 &&
      hasPermission('permission:vendors-view'),

    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // Vendors Search Query
  const {
    data: searchQuery,
    isLoading: isSearchQueryLoading,
    fetchNextPage: searchFetchNextPage,
    isFetching: isSearchQueryFetching,
  } = useInfiniteQuery({
    queryKey: [
      vendorEnterprise.searchedVendors.endpointKey,
      searchTerm,
      enterpriseId,
    ],

    queryFn: async ({ pageParam = 1 }) => {
      if (!searchTerm?.trim()) {
        return { data: { data: { users: [], totalPages: 0, currentPage: 1 } } };
      }

      const response = await searchedVendors({
        page: pageParam,
        limit: PAGE_LIMIT,
        data: { searchString: searchTerm },
      });

      return (
        response || {
          data: { data: { users: [], totalPages: 0, currentPage: 1 } },
        }
      );
    },

    initialPageParam: 1,

    getNextPageParam: (_lastGroup, groups) => {
      const totalPages = Number(_lastGroup?.data?.data?.totalPages ?? 0);
      const nextPage = (Array.isArray(groups) ? groups.length : 0) + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },

    enabled: Boolean(searchTerm?.trim()?.length > 0),

    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  // Handle combined vendor data safely
  useEffect(() => {
    try {
      // Pick source depending on search mode
      const isSearching = Boolean(searchTerm?.trim());
      const source =
        isSearching && searchQuery?.pages?.length ? searchQuery : vendorsQuery;

      // If no source or invalid structure, reset
      if (!source?.pages?.length) {
        setVendors([]);
        setPaginationData({ totalPages: 0, currFetchedPage: 1 });
        return;
      }

      // Flatten safely and filter valid vendor items
      const flattened = source.pages.flatMap((page) => {
        const users = page?.data?.data?.users;
        return Array.isArray(users) ? users.filter(Boolean) : [];
      });

      // Deduplicate vendors by ID
      const uniqueVendors = Array.from(
        new Map(
          flattened
            .filter((item) => item?.id != null)
            .map((item) => [item.id, item]),
        ).values(),
      );

      setVendors(uniqueVendors || []);

      // Extract pagination safely
      const lastPage = source.pages[source.pages.length - 1];
      const lastPageData = lastPage?.data?.data || {};

      setPaginationData({
        totalPages: Number(lastPageData.totalPages) || 0,
        currFetchedPage:
          Number(lastPageData.currentPage) || Number(source.pages.length) || 1,
      });
    } catch (error) {
      // Prevent UI crash by falling back to safe defaults
      setVendors([]);
      setPaginationData({ totalPages: 0, currFetchedPage: 1 });
    }
  }, [searchTerm, vendorsQuery, searchQuery]);

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
    router.push(`/dashboard/vendors/${row.id}`);
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
    <ProtectedWrapper permissionCode={'permission:vendors-view'}>
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
                  <div className="flex items-center justify-center gap-2">
                    <DebouncedInput
                      value={searchTerm}
                      delay={400}
                      onDebouncedChange={setSearchTerm}
                      placeholder="Search Vendors"
                    />

                    <ProtectedWrapper
                      permissionCode={'permission:vendors-download'}
                    >
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
                    </ProtectedWrapper>

                    <ProtectedWrapper
                      permissionCode={'permission:vendors-upload'}
                    >
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
                    </ProtectedWrapper>

                    <ProtectedWrapper
                      permissionCode={'permission:vendors-create'}
                    >
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
                    </ProtectedWrapper>
                  </div>
                </SubHeader>
                <div className="flex-grow overflow-hidden">
                  {isVendorsQueryLoading || isSearchQueryLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!searchTerm && vendors?.length === 0 ? (
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
                            searchTerm
                              ? searchFetchNextPage
                              : vendorFetchNextPage
                          }
                          isFetching={
                            searchTerm
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
    </ProtectedWrapper>
  );
};

export default VendorsPage;
