'use client';

import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { debounce } from '@/appUtils/helperFunctions';
import AddModal from '@/components/Modals/AddModal';
import Tooltips from '@/components/auth/Tooltips';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SearchInput from '@/components/ui/SearchInput';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { exportTableToExcel, LocalStorageService } from '@/lib/utils';
import {
  bulkUploadVendors,
  createVendor,
  getVendors,
  searchedVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BookUser, Eye, HeartHandshake, Settings, Upload } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useVendorsColumns } from './useVendorsColumns';

const UploadItems = dynamic(
  () => import('@/components/inventory/UploadItems'),
  { loading: () => <Loading /> },
);

// MACROS
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

// Emtpy state data
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

const VendorsPage = () => {
  useMetaData('Hues! - Vendors', 'HUES VENDORS'); // dynamic title
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const isKycVerified = LocalStorageService.get('isKycVerified');

  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm); // debounce search term
  const [vendors, setVendors] = useState([]);

  // api fetching for clients
  const {
    isLoading,
    data: vendorsData,
    isSuccess,
  } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors(enterpriseId),
    select: (res) => res.data.data,
    enabled: searchTerm?.length === 0,
  });

  // Fetch searched catalogues
  const { data: searchedVendorsData, isLoading: isSearchedVendorsLoading } =
    useQuery({
      queryKey: [vendorEnterprise.searchedVendors.endpointKey, searchTerm],
      queryFn: () =>
        searchedVendors({
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
    if (debouncedSearchTerm && searchedVendorsData) {
      let formattedData = [];
      // formatting data
      if (searchedVendorsData) {
        formattedData = searchedVendorsData.flatMap((user) => {
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
        setVendors(formattedData); // set vendors from search api
      }
    } else if (!debouncedSearchTerm && isSuccess) {
      let formattedData = [];
      // formatting data
      if (vendorsData) {
        formattedData = vendorsData.flatMap((user) => {
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
        setVendors(formattedData); // set vendors from get api
      }
    }
  }, [debouncedSearchTerm, searchedVendorsData, vendorsData, isSuccess]);

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

  // columns
  const VendorsColumns = useVendorsColumns();

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete || !isKycVerified) && (
        <>
          <SubHeader name={'Vendors'}></SubHeader>
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && isKycVerified && (
        <div>
          <Wrapper>
            {!isUploading && (
              <SubHeader name={'Vendors'}>
                <div className="flex items-center justify-center gap-4">
                  <SearchInput
                    toSearchTerm={searchTerm}
                    setToSearchTerm={setSearchTerm}
                  />
                  <Tooltips
                    trigger={
                      <Button
                        variant="blue_outline"
                        size="sm"
                        onClick={() => setIsUploading(true)}
                      >
                        <Upload size={14} />
                        Upload
                      </Button>
                    }
                    content={'Upload vendors data in bulk'}
                  />
                  <Tooltips
                    trigger={
                      <Button
                        variant={'export'}
                        size="sm"
                        onClick={() =>
                          exportTableToExcel('vendor table', 'vendors_list')
                        }
                      >
                        <Upload size={14} />
                        Export
                      </Button>
                    }
                    content={'Export vendors data'}
                  />

                  <Tooltips
                    trigger={
                      <AddModal
                        type={'Add'}
                        cta="vendor"
                        btnName="Add"
                        mutationFunc={createVendor}
                      />
                    }
                    content={'Add a new vendor'}
                  />
                </div>
              </SubHeader>
            )}

            {(isLoading || isSearchedVendorsLoading) && <Loading />}

            {!isUploading &&
              (!isLoading || !isSearchedVendorsLoading) &&
              (vendors?.length > 0 ? (
                <DataTable
                  id={'vendor table'}
                  columns={VendorsColumns}
                  data={vendors}
                />
              ) : (
                <EmptyStageComponent
                  heading={VendorsEmptyStageData.heading}
                  desc={VendorsEmptyStageData.desc}
                  subHeading={VendorsEmptyStageData.subHeading}
                  subItems={VendorsEmptyStageData.subItems}
                />
              ))}
          </Wrapper>
          {isUploading && (
            <UploadItems
              type="vendor"
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

export default VendorsPage;
