'use client';

import { servicesApi } from '@/api/inventories/services/services';
import { debounce } from '@/appUtils/helperFunctions';
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
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  GetAllProductServices,
  GetSearchedServices,
  UpdateProductServices,
  UploadProductServices,
} from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CircleFadingPlus,
  DatabaseZap,
  FileCheck,
  FileText,
  KeySquare,
  Share2,
  Upload,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useServicesColumns } from './ServicesColumns';

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
// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;
// Empty state data
const InventoryEmptyStageData = {
  heading: `~"Revolutionize stock management with secure, editable, and shareable product listings for
  perfect cataloging."`,
  subHeading: 'Features',
  subItems: [
    {
      id: 1,
      icon: <FileCheck size={14} />,
      subItemtitle: `Quickly upload and fine-tune detailed product information in bulk.`,
    },
    {
      id: 2,
      icon: <FileText size={14} />,
      subItemtitle: `Effortlessly add items for fresh, accurate inventory.`,
    },
    {
      id: 3,
      icon: <KeySquare size={14} />,
      subItemtitle: `Authenticate inventory with digital signatures for integrity and compliance.`,
    },
    {
      id: 4,
      icon: <DatabaseZap size={14} />,
      subItemtitle: `Share digitally signed inventory easily in PDF format.`,
    },
  ],
};

function Services() {
  useMetaData('Hues! - Services', 'HUES SERVICES'); // dynamic title
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const isKycVerified = LocalStorageService.get('isKycVerified');
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

  // get services api
  const {
    data: servicesData,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: [servicesApi.getAllProductServices.endpointKey],
    queryFn: () => GetAllProductServices(enterpriseId),
    select: (res) => res.data.data,
    enabled: searchTerm?.length === 0,
  });

  // Fetch searched product goods
  const { data: searchedServicesData, isLoading: isSearchServicesLoading } =
    useQuery({
      queryKey: [servicesApi.getSearchedServices.endpointKey, searchTerm],
      queryFn: () =>
        GetSearchedServices({
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
    if (debouncedSearchTerm && searchedServicesData) {
      setServices(searchedServicesData); // set Services from search api
    } else if (!debouncedSearchTerm && isSuccess) {
      setServices(servicesData); // set productGoods from get api
    }
  }, [debouncedSearchTerm, searchedServicesData, servicesData, isSuccess]);

  // handleUploadfile
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enterpriseId', enterpriseId);
    formData.append('templateId', templateId);

    try {
      await UploadProductServices(formData);
      toast.success('Upload Successfully');
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
      {(!enterpriseId || !isEnterpriseOnboardingComplete || !isKycVerified) && (
        <>
          <SubHeader name={'Services'} />
          <RestrictedComponent />
        </>
      )}
      {enterpriseId && isEnterpriseOnboardingComplete && isKycVerified && (
        <div>
          {!isAdding && !isUploading && !isEditing && (
            <Wrapper>
              <SubHeader name={'Services'}>
                <div className="flex items-center justify-center gap-4">
                  <SearchInput
                    toSearchTerm={searchTerm}
                    setToSearchTerm={setSearchTerm}
                  />
                  {/* coming soon */}
                  <Tooltips
                    trigger={
                      <Button
                        onClick={() => {}}
                        variant={'export'}
                        size="sm"
                        className="cursor-not-allowed"
                      >
                        <Share2 size={14} />
                      </Button>
                    }
                    content={'This feature Coming Soon...'}
                  />
                  <Button
                    variant={'export'}
                    size="sm"
                    onClick={() =>
                      exportTableToExcel('services table', 'services_list')
                    }
                  >
                    <Upload size={14} />
                    Export
                  </Button>
                  <Button
                    onClick={() => setIsUploading(true)}
                    variant={'blue_outline'}
                    size="sm"
                  >
                    <Upload size={14} />
                    Upload
                  </Button>
                  <Button
                    onClick={() => setIsAdding(true)}
                    variant={'blue_outline'}
                    size="sm"
                  >
                    <CircleFadingPlus size={14} />
                    Add
                  </Button>
                </div>
              </SubHeader>

              {(isLoading || isSearchServicesLoading) && <Loading />}

              {(!isLoading || !isSearchServicesLoading) &&
                (servicesData?.length > 0 ? (
                  <DataTable
                    id={'services table'}
                    columns={ServicesColumns}
                    data={services}
                  />
                ) : (
                  <EmptyStageComponent {...InventoryEmptyStageData} />
                ))}
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
