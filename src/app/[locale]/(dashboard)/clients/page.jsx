'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { invitation } from '@/api/invitation/Invitation';
import { debounce } from '@/appUtils/helperFunctions';
import AddModal from '@/components/Modals/AddModal';
import Tooltips from '@/components/auth/Tooltips';
import EnterpriseDetails from '@/components/enterprise/EnterpriseDetails';
import { DataTable } from '@/components/table/data-table';
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
} from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  generateLink,
  remindInvitation,
} from '@/services/Invitation_Service/Invitation_Service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useClientsColumns } from './useClientsColumns';

// dynamic imports
const UploadItems = dynamic(
  () => import('@/components/inventory/UploadItems'),
  { loading: () => <Loading /> },
);

// MACROS
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
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // debounce search term
  const [clients, setClients] = useState([]);
  const [isEnterpriseDetailsShow, setIsEnterpriseDetailsShow] = useState(false);
  const [selectedEnterpriseContent, setSelectedEnterpriseContent] =
    useState(null);

  // api fetching for clients
  const {
    isLoading,
    data: clientsData,
    isSuccess,
  } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId),
    select: (res) => res.data.data,
    enabled: searchTerm?.length === 0,
  });

  // Fetch searched catalogues
  const { data: searchedClientsData, isLoading: isSearchedClientsLoading } =
    useQuery({
      queryKey: [clientEnterprise.searchClients.endpointKey, searchTerm],
      queryFn: () =>
        searchedClients({
          searchString: debouncedSearchTerm, // Ensure debouncedSearchTerm is used
        }),
      select: (res) => res.data.data,
      enabled: !!debouncedSearchTerm && clientsData?.length > 0, // Use debounced value here
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
    if (debouncedSearchTerm && searchedClientsData) {
      let formattedData = [];
      // formatting data
      if (searchedClientsData) {
        formattedData = searchedClientsData.flatMap((user) => {
          let userDetails;
          if (user.client && user?.client?.name !== null) {
            userDetails = { ...user.client };
          } else {
            userDetails = { ...user?.invitation?.userDetails };
          }

          return {
            ...userDetails,
            id: user.id,
            invitationId: user.invitation?.id,
            invitationStatus: user.invitation?.status,
          };
        });
        setClients(formattedData); // set clients from search api
      }
    } else if (!debouncedSearchTerm && isSuccess) {
      let formattedData = [];
      // formatting data
      if (clientsData) {
        formattedData = clientsData.flatMap((user) => {
          let userDetails;
          if (user.client && user?.client?.name !== null) {
            userDetails = { ...user.client };
          } else {
            userDetails = { ...user?.invitation?.userDetails };
          }

          return {
            ...userDetails,
            id: user.id,
            invitationId: user.invitation?.id,
            invitationStatus: user.invitation?.status,
          };
        });
        setClients(formattedData); // set clients from get api
      }
    }
  }, [debouncedSearchTerm, searchedClientsData, clientsData, isSuccess]);

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

  // columns
  const ClientsColumns = useClientsColumns(getLink, sendReminder);

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
          <Wrapper>
            {!isUploading && (
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
                        variant={clientsData?.length > 0 ? 'outline' : 'export'}
                        size="sm"
                        onClick={() =>
                          exportTableToExcel('client table', 'clients_list')
                        }
                        className={
                          clientsData?.length === 0
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
            )}

            {(isLoading || isSearchedClientsLoading) && <Loading />}

            {!isUploading &&
              (!isLoading || !isSearchedClientsLoading) &&
              (clientsData?.length > 0 ? (
                <DataTable
                  id={'client table'}
                  onRowClick={onRowClick}
                  columns={ClientsColumns}
                  data={clients ?? []}
                />
              ) : (
                <EmptyStageComponent
                  heading={translations('emptyStateComponent.heading')}
                  subItems={keys}
                />
              ))}
          </Wrapper>
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
            />
          )}
        </div>
      )}
    </>
  );
};

export default ClientPage;
