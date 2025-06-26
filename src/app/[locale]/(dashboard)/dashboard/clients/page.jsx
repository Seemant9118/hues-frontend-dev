/* eslint-disable no-unsafe-optional-chaining */

'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
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
import useMetaData from '@/custom-hooks/useMetaData';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  bulkUploadClients,
  createClient,
  getClients,
  searchedClients,
  updateClient,
} from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
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
import { ClientTable } from './ClientTable';
import { useClientsColumns } from './useClientsColumns';

// dynamic imports
const UploadItems = dynamic(
  () => import('@/components/inventory/UploadItems'),
  { loading: () => <Loading /> },
);

// MACROS
const PAGE_LIMIT = 10;
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

const ClientPage = () => {
  useMetaData('Hues! - Clients', 'HUES CLIENTS'); // dynamic title

  const translations = useTranslations('client');
  // next-intl supports only object keys, not arrays. Use object keys for subItems.
  const keys = [
    'client.emptyStateComponent.subItems.subItem1',
    'client.emptyStateComponent.subItems.subItem2',
    'client.emptyStateComponent.subItems.subItem3',
    'client.emptyStateComponent.subItems.subItem4',
  ];

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingClient, setEditingClient] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // debounce search term
  const [clients, setClients] = useState(null);
  const [isEnterpriseDetailsShow, setIsEnterpriseDetailsShow] = useState(false);
  const [selectedEnterpriseContent, setSelectedEnterpriseContent] =
    useState(null);
  const [paginationData, setPaginationData] = useState({});

  const {
    data: clientsQuery,
    isLoading: isClientQueryLoading,
    fetchNextPage: clientFetchNextPage,
    isFetching: isClientQueryFetching,
  } = useInfiniteQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: async ({ pageParam = 1 }) => {
      return getClients({
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
    queryKey: [clientEnterprise.searchClients.endpointKey, debouncedSearchTerm],
    queryFn: async ({ pageParam = 1 }) => {
      return searchedClients({
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
    const source = debouncedSearchTerm ? searchQuery : clientsQuery;
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

    const uniqueClientsData = Array.from(
      new Map(flattened.map((item) => [item.id, item])).values(),
    );

    setClients(uniqueClientsData);

    const lastPage = source.pages[source.pages.length - 1]?.data?.data;
    setPaginationData({
      totalPages: lastPage?.totalPages,
      currFetchedPage: Number(lastPage?.currentPage),
    });
  }, [debouncedSearchTerm, clientsQuery, searchQuery]);

  // handleFile fn
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enterpriseId', enterpriseId);

    try {
      await bulkUploadClients(formData);
      toast.success('Upload Successfully');
      setFiles((prev) => [...prev, file]);
      queryClient.invalidateQueries([clientEnterprise.getClients.endpointKey]);
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
  const sendReminder = (id) => {
    remindMutation.mutate(id);
  };

  // onRowClick
  const onRowClick = (row) => {
    setIsEnterpriseDetailsShow(true);
    setSelectedEnterpriseContent(row);
  };

  const onEditClick = (userData) => {
    setIsEditing(true);
    setEditingClient(userData);
  };

  // columns
  const ClientsColumns = useClientsColumns(
    getLink,
    sendReminder,
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
                          variant={clients?.length > 0 ? 'outline' : 'export'}
                          size="sm"
                          onClick={() =>
                            exportTableToExcel('clients-table', 'clients_list')
                          }
                          className={
                            clients?.length === 0
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
                          cta="client"
                          btnName={translations('ctas.add')}
                          mutationFunc={createClient}
                        />
                      }
                      content={translations('ctas.tooltips.add')}
                    />
                  </div>
                </SubHeader>
                <div className="flex-grow overflow-hidden">
                  {isClientQueryLoading || isSearchQueryLoading ? (
                    <Loading />
                  ) : (
                    <>
                      {/* Case 1: No search term, and no data → Empty stage */}
                      {!debouncedSearchTerm && clients?.length === 0 ? (
                        <EmptyStageComponent
                          heading={translations('emptyStateComponent.heading')}
                          subItems={keys}
                        />
                      ) : (
                        // Case 2: Either searchTerm is present, or data is available → Show Table
                        <ClientTable
                          id="clients-table"
                          columns={ClientsColumns}
                          data={clients || []}
                          fetchNextPage={
                            debouncedSearchTerm
                              ? searchFetchNextPage
                              : clientFetchNextPage
                          }
                          isFetching={
                            debouncedSearchTerm
                              ? isSearchQueryFetching
                              : isClientQueryFetching
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
                type="client"
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
                isClient={true}
              />
            )}

            {isEditing && (
              <EditModal
                id={editingClient.id}
                userData={editingClient}
                cta="client"
                mutationFunc={updateClient}
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

export default ClientPage;
