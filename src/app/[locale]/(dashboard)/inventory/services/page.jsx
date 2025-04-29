'use client';

import { servicesApi } from '@/api/inventories/services/services';
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
import { useRouter } from '@/i18n/routing';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import {
  GetAllProductServices,
  GetSearchedServices,
  UpdateProductServices,
  UploadProductServices,
} from '@/services/Inventories_Services/Services_Inventories/Services_Inventories';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircleFadingPlus, Share2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
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

  // get services
  const {
    data: servicesData,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: [servicesApi.getAllProductServices.endpointKey],
    queryFn: () => GetAllProductServices(enterpriseId),
    select: (res) => res.data.data,
    enabled: searchTerm?.length === 0, // uses raw searchTerm here for immediate fallback
  });

  // Fetch searched services
  const { data: searchedServicesData, isLoading: isSearchServicesLoading } =
    useQuery({
      queryKey: [
        servicesApi.getSearchedServices.endpointKey,
        debouncedSearchTerm,
      ],
      queryFn: () =>
        GetSearchedServices({
          searchString: debouncedSearchTerm,
        }),
      select: (res) => res.data.data,
      enabled: !!debouncedSearchTerm && servicesData?.length > 0,
    });

  // Debounce searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

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
            <Wrapper>
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
                        variant={
                          servicesData?.length === 0 ? 'export' : 'outline'
                        }
                        size="sm"
                        className={
                          servicesData?.length === 0
                            ? 'cursor-not-allowed'
                            : 'cursor-pointer'
                        }
                        onClick={() =>
                          exportTableToExcel(
                            'services table',
                            translations('title'),
                          )
                        }
                      >
                        <Upload size={14} />
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
                  <Button
                    onClick={() => setIsAdding(true)}
                    variant={'blue_outline'}
                    size="sm"
                  >
                    <CircleFadingPlus size={14} />
                    {translations('ctas.add')}
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
                  <EmptyStageComponent
                    heading={translations('emptyStateComponent.heading')}
                    subItems={keys}
                  />
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
