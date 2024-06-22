'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import AddModal from '@/components/Modals/AddModal';
import UploadItems from '@/components/inventory/UploadItems';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  bulkUploadVendors,
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookUser, Eye, HeartHandshake, Settings, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { VendorsColumns } from './VendorsColumns';

const VendorsPage = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const queryClient = useQueryClient();

  const VendorsEmptyStageData = {
    heading: `~"Simplify procurement with our Vendors feature, offering immediate access to detailed vendor
    catalogs for efficient transactions."`,
    subHeading: 'Features',
    subItems: [
      {
        id: 1,
        icon: <BookUser size={14} />,
        subItemtitle: `Register vendors with essential details easily.`,
      },
      {
        id: 2,
        icon: <Settings size={14} />,
        subItemtitle: `Automatically access vendor catalogs within your purchasing workflow.`,
      },
      {
        id: 3,
        icon: <Eye size={14} />,
        subItemtitle: `Leverage vendor visibility for informed bids and streamlined purchases`,
      },
      {
        id: 4,
        icon: <HeartHandshake size={14} />,
        subItemtitle: `Foster robust vendor relationships with tailored product engagement.`,
      },
    ],
  };

  const { isLoading, data: vendorsList } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors(enterpriseId),
    select: (res) => res.data.data,
  });

  let formattedData = [];
  if (vendorsList) {
    formattedData = vendorsList.flatMap((user) => {
      let userDetails;
      if (user.vendor && user?.vendor?.name !== null) {
        userDetails = { ...user.vendor };
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
      await bulkUploadVendors(formData);
      toast.success('Upload Successfully');
      setFiles((prev) => [...prev, file]);
      queryClient.invalidateQueries([vendorEnterprise.getVendors.endpointKey]);
    } catch (error) {
      toast.error(error.response.data.message || 'Something went wrong');
    }
  };

  return (
    <Wrapper>
      {!isUploading && (
        <SubHeader name={'Vendors'}>
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
              onClick={() => exportTableToExcel('vendor table', 'vendors_list')}
            >
              <Upload size={14} />
              Export
            </Button>
            <AddModal
              type={'Add'}
              cta="vendor"
              btnName="Add"
              mutationFunc={createVendor}
            />
          </div>
        </SubHeader>
      )}

      {isLoading && <Loading />}

      {!isLoading &&
        !isUploading &&
        (formattedData && formattedData.length !== 0 ? (
          <DataTable
            id={'vendor table'}
            columns={VendorsColumns}
            data={formattedData}
          />
        ) : (
          <EmptyStageComponent
            heading={VendorsEmptyStageData.heading}
            desc={VendorsEmptyStageData.desc}
            subHeading={VendorsEmptyStageData.subHeading}
            subItems={VendorsEmptyStageData.subItems}
          />
        ))}

      {isUploading && (
        <UploadItems
          type="enterprise"
          uploadFile={uploadFile}
          files={files}
          setisUploading={setIsUploading}
          setFiles={setFiles}
        />
      )}
    </Wrapper>
  );
};

export default VendorsPage;
