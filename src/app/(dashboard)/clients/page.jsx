'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import AddModal from '@/components/Modals/AddModal';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  bulkUploadClients,
  createClient,
  getClients,
} from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookCheck, BookUser, Key, Upload, UserPlus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { toast } from 'sonner';
import { ClientsColumns } from './ClientsColumns';
// dynamic imports
const UploadItems = dynamic(
  () => import('@/components/inventory/UploadItems'),
  { loading: () => <Loading /> },
);

const ClientPage = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const isKycVerified = LocalStorageService.get('isKycVerified');
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const queryClient = useQueryClient();

  const ClientsEmptyStageData = {
    heading: `~"Streamline sales with our Clients feature, integrating customer data for direct inventory offers
    and full catalog visibility."`,
    subHeading: 'Features',
    subItems: [
      {
        id: 1,
        icon: <UserPlus size={14} />,
        subItemtitle: `Easily add client details to your database.`,
      },
      {
        id: 2,
        icon: <Key size={14} />,
        subItemtitle: `Offer inventory directly to clients with full product access.`,
      },
      {
        id: 3,
        icon: <BookCheck size={14} />,
        subItemtitle: `Keep clients updated, fostering transparency and trust.`,
      },
      {
        id: 4,
        icon: <BookUser size={14} />,
        subItemtitle: `Listed clients get automatic catalog access, simplifying sales.`,
      },
    ],
  };

  const { isLoading, data } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId),
    select: (res) => res.data.data,
  });

  let formattedData = [];
  if (data) {
    formattedData = data.flatMap((user) => {
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
  }

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

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete || !isKycVerified) && (
        <>
          <SubHeader name={'Clients'}></SubHeader>
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && isKycVerified && (
        <div>
          <Wrapper>
            {!isUploading && (
              <SubHeader name={'Clients'}>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="blue_outline"
                    size="sm"
                    onClick={() => setIsUploading(true)}
                  >
                    <Upload size={14} />
                    Upload
                  </Button>
                  <Button
                    variant={'export'}
                    size="sm"
                    onClick={() =>
                      exportTableToExcel('client table', 'clients_list')
                    }
                  >
                    <Upload size={14} />
                    Export
                  </Button>
                  <AddModal
                    type={'Add'}
                    cta="client"
                    btnName="Add"
                    mutationFunc={createClient}
                  />
                </div>
              </SubHeader>
            )}

            {isLoading && <Loading />}

            {!isLoading &&
              !isUploading &&
              (formattedData && formattedData.length !== 0 ? (
                <DataTable
                  id={'client table'}
                  columns={ClientsColumns}
                  data={formattedData}
                />
              ) : (
                <EmptyStageComponent
                  heading={ClientsEmptyStageData.heading}
                  desc={ClientsEmptyStageData.desc}
                  subHeading={ClientsEmptyStageData.subHeading}
                  subItems={ClientsEmptyStageData.subItems}
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
        </div>
      )}
    </>
  );
};

export default ClientPage;
